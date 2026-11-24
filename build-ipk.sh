#!/bin/sh
# Build installable .ipk files without the OpenWrt SDK (architecture: all).
# Usage: ./build-ipk.sh   ->  dist/oDash-*.tar.gz, dist/oDash_*.ipk, dist/luci-app-oDash_*.ipk (the folder inside the tar.gz keeps the lowercase odash-VERSION name so older oDash versions can still update from the panel)
set -eu
cd "$(dirname "$0")"
VERSION="1.0.0-1"
sed -i "s/^ODASH_VERSION=.*/ODASH_VERSION=${VERSION%-*}/" odash/files/usr/bin/odash
OUT="$PWD/dist"
rm -rf "$OUT" .build
mkdir -p "$OUT" .build

# LuCI files are staged under a folder named after the version (view/odash/v7_0_4/...).
# The browser and uhttpd cache LuCI modules for about an hour by file name, so a new
# version needs new file names or old, cached code runs after an update.
VSLUG="v$(echo "${VERSION%-*}" | tr . _)"
STAGE=".build/luci-stage"
mkdir -p "$STAGE"
cp -a luci-app-odash/root "$STAGE/root"
cp -a luci-app-odash/htdocs "$STAGE/htdocs"
vd="$STAGE/htdocs/luci-static/resources/view/odash"
mkdir -p "$vd/$VSLUG"
for f in "$vd"/*.js; do
	sed "s/view\\.odash\\./view.odash.$VSLUG./g" "$f" > "$vd/$VSLUG/$(basename "$f")"
	rm -f "$f"
done
sed -i "s#\"odash/router\"#\"odash/$VSLUG/router\"#" "$STAGE"/root/usr/share/luci/menu.d/luci-app-odash.json

build() { # name depends description
	name="$1"; depends="$2"; desc="$3"
	b=".build/$name"
	mkdir -p "$b/control"
	tar --numeric-owner --owner=0 --group=0 -C "$b/data" -czf "$b/data.tar.gz" .
	size="$(du -sk "$b/data" | cut -f1)"
	cat > "$b/control/control" <<CTL
Package: $name
Version: $VERSION
Depends: $depends
Section: net
Architecture: all
Installed-Size: $((size * 1024))
Description: $desc
CTL
	[ -f ".build/$name.conffiles" ] && cp ".build/$name.conffiles" "$b/control/conffiles"
	cp ".build/$name.postinst" "$b/control/postinst"
	cp ".build/$name.prerm" "$b/control/prerm"
	chmod 755 "$b/control/postinst" "$b/control/prerm"
	tar --numeric-owner --owner=0 --group=0 -C "$b/control" -czf "$b/control.tar.gz" .
	echo "2.0" > "$b/debian-binary"
	tar --numeric-owner --owner=0 --group=0 -C "$b" -czf "$OUT/$(echo "${name}" | sed 's/odash$/oDash/')_${VERSION}_all.ipk" ./debian-binary ./control.tar.gz ./data.tar.gz
}

# core package
mkdir -p .build/odash/data
cp -a odash/files/. .build/odash/data/
echo "/etc/config/odash" > .build/odash.conffiles
cat > .build/odash.postinst <<'SH'
#!/bin/sh
[ -n "${IPKG_INSTROOT:-}" ] && exit 0
/etc/init.d/odash enable
/etc/init.d/odash restart
# 1.0.0: the scheduled backup now lives on the router itself by default; move an older disk setting over once
C=/etc/odash/backup.conf
if [ -f "$C" ] && ! grep -q '^BK_MIG=' "$C"; then
	( . "$C"; /usr/bin/odash backup-set "${BK_ON:-0}" /etc/odash/backups 3 "${BK_DOW:-0}" "${BK_TIME:-04:30}" >/dev/null 2>&1 )
	echo 'BK_MIG=1' >> "$C"
fi
exit 0
SH
cat > .build/odash.prerm <<'SH'
#!/bin/sh
[ -n "${IPKG_INSTROOT:-}" ] && exit 0
/etc/init.d/odash stop
/etc/init.d/odash disable
exit 0
SH
build odash "libc, logd, nftables" "oDash - per-site and per-device traffic, device control, Samba and disk manager (nftables + dnsmasq)"

# LuCI package
mkdir -p .build/luci-app-odash/data/www
cp -a "$STAGE"/root/. .build/luci-app-odash/data/
cp -a "$STAGE"/htdocs/. .build/luci-app-odash/data/www/
cat > .build/luci-app-odash.postinst <<'SH'
#!/bin/sh
[ -n "${IPKG_INSTROOT:-}" ] && exit 0
rm -f /tmp/luci-indexcache* 2>/dev/null
/etc/init.d/rpcd reload 2>/dev/null
exit 0
SH
cp .build/luci-app-odash.postinst .build/luci-app-odash.prerm
build luci-app-odash "libc, luci-base, odash" "oDash - LuCI pages (Status > oDash) for traffic, devices, network, Wi-Fi, Samba and settings"

# portable archive (works with opkg and apk systems): extract and run install.sh
P="odash-${VERSION%-*}"
mkdir -p ".build/$P/odash" ".build/$P/luci/www"
cp -a odash/files/. ".build/$P/odash/"
cp -a "$STAGE"/root/. ".build/$P/luci/"
cp -a "$STAGE"/htdocs/. ".build/$P/luci/www/"
cat > ".build/$P/install.sh" <<'SH'
#!/bin/sh
# oDash installer: copies the files into / and starts the service.
set -e
here="$(cd "$(dirname "$0")" && pwd)"
[ -x /etc/init.d/odash ] && /etc/init.d/odash stop 2>/dev/null || true
keep=""
[ -s /etc/config/odash ] && { keep="$(mktemp)"; cp /etc/config/odash "$keep"; }
[ -f /etc/odash/groups.conf ] && cp /etc/odash/groups.conf /tmp/odash-groups.keep
cp -a "$here/odash/." /
rm -rf /www/luci-static/resources/view/odash
cp -a "$here/luci/." /
[ -n "$keep" ] && { cp "$keep" /etc/config/odash; rm -f "$keep"; }
[ -f /tmp/odash-groups.keep ] && { cp /tmp/odash-groups.keep /etc/odash/groups.conf; rm -f /tmp/odash-groups.keep; }
chmod 755 /usr/bin/odash /etc/init.d/odash /usr/libexec/odash/collector /usr/libexec/odash/rates /usr/libexec/odash/migrate /usr/libexec/odash/led /usr/libexec/odash/fan /usr/libexec/odash/dnswatch /usr/libexec/odash/smbwatch /usr/libexec/odash/dns-follow-run
/usr/libexec/odash/migrate
rm -f /tmp/luci-indexcache*
/etc/init.d/rpcd reload 2>/dev/null || true
/etc/init.d/odash enable
/etc/init.d/odash restart
C=/etc/odash/backup.conf
if [ -f "$C" ] && ! grep -q '^BK_MIG=' "$C"; then
	( . "$C"; /usr/bin/odash backup-set "${BK_ON:-0}" /etc/odash/backups 3 "${BK_DOW:-0}" "${BK_TIME:-04:30}" >/dev/null 2>&1 )
	echo 'BK_MIG=1' >> "$C"
fi
echo "oDash installed. Open Status -> oDash in LuCI (use a new browser tab)."
SH
chmod 755 ".build/$P/install.sh"
tar --numeric-owner --owner=0 --group=0 -C .build -czf "$OUT/oDash-${VERSION%-*}.tar.gz" "$P"

rm -rf .build
ls -l "$OUT"
