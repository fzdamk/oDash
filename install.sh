#!/bin/sh
# oDash installer for OpenWrt (any architecture: oDash is shell, awk and JavaScript only).
#
#   wget -qO- https://raw.githubusercontent.com/fzdamk/oDash/main/install.sh | sh
#   (or: curl -fsSL <same url> | sh)
#
# Options (environment variables):
#   ODASH_REPO=user/oDash   GitHub repository to download from
#   ODASH_VERSION=1.0.0     install this version instead of the latest release
# Arguments:
#   sh install.sh uninstall           remove oDash, keep your settings and statistics
#   sh install.sh uninstall --purge   remove oDash and all its data
set -eu

REPO="${ODASH_REPO:-fzdamk/oDash}"
VERSION="${ODASH_VERSION:-latest}"
TMP="/tmp/odash-install.$$"

say() { printf '%s\n' "$*"; }
die() { printf 'oDash installer: %s\n' "$*" >&2; exit 1; }
cleanup() { rm -rf "$TMP"; }
trap cleanup EXIT INT TERM

[ "$(id -u)" = 0 ] || die "run this as root (on the router)."
[ -f /etc/openwrt_release ] || die "this does not look like OpenWrt (/etc/openwrt_release is missing)."

pkg_install() { # package names...
	if command -v apk >/dev/null 2>&1; then
		apk update >/dev/null 2>&1 || true
		apk add "$@"
	elif command -v opkg >/dev/null 2>&1; then
		opkg update >/dev/null 2>&1 || true
		opkg install "$@"
	else
		die "no package manager (apk or opkg) found, install by hand: $*"
	fi
}

# ---------------------------------------------------------------- uninstall
if [ "${1:-}" = "uninstall" ]; then
	[ -x /etc/init.d/odash ] && { /etc/init.d/odash stop 2>/dev/null || true; /etc/init.d/odash disable 2>/dev/null || true; }
	if [ -f /etc/crontabs/root ]; then
		grep -v 'odash' /etc/crontabs/root > /tmp/odash-cron.$$ || true
		cat /tmp/odash-cron.$$ > /etc/crontabs/root; rm -f /tmp/odash-cron.$$
		/etc/init.d/cron restart 2>/dev/null || true
	fi
	rm -rf /usr/bin/odash /usr/libexec/odash /etc/init.d/odash /www/luci-static/resources/view/odash /www/luci-static/resources/odash \
		/usr/share/luci/menu.d/luci-app-odash.json /usr/share/rpcd/acl.d/luci-app-odash.json /lib/upgrade/keep.d/odash /tmp/odash
	if [ "${2:-}" = "--purge" ]; then
		rm -rf /etc/odash /etc/config/odash
		say "oDash and all its data were removed."
	else
		say "oDash was removed. Your settings and statistics are kept in /etc/odash (add --purge to delete them)."
	fi
	rm -f /tmp/luci-indexcache* 2>/dev/null || true
	/etc/init.d/rpcd reload 2>/dev/null || true
	exit 0
fi

# ---------------------------------------------------------------- download tool
FETCH=""
if command -v uclient-fetch >/dev/null 2>&1; then FETCH="uclient-fetch -q -O"
elif command -v wget >/dev/null 2>&1; then FETCH="wget -q -O"
elif command -v curl >/dev/null 2>&1; then FETCH="curl -fsSL -o"
else die "no download tool found (uclient-fetch, wget or curl)."; fi

fetch() { $FETCH "$2" "$1"; } # url file

# ---------------------------------------------------------------- free space
avail="$(df -k /overlay 2>/dev/null | awk 'NR==2 { print $4 }')"
[ -n "$avail" ] || avail="$(df -k / | awk 'NR==2 { print $4 }')"
[ "${avail:-0}" -ge 1500 ] 2>/dev/null || die "not enough free flash space (need about 1.5 MB, have ${avail:-0} KB)."

# ---------------------------------------------------------------- requirements
need=""
command -v nft >/dev/null 2>&1 || need="$need nftables"
[ -d /usr/share/luci ] || need="$need luci-base"
command -v logd >/dev/null 2>&1 || [ -x /sbin/logd ] || need="$need logd"
command -v jsonfilter >/dev/null 2>&1 || need="$need jsonfilter"
if [ -n "$need" ]; then
	say "Installing required packages:$need"
	pkg_install $need || die "could not install:$need"
fi

# ---------------------------------------------------------------- download
if [ "$VERSION" = "latest" ]; then
	BASE="https://github.com/$REPO/releases/latest/download"; FILE="oDash.tar.gz"
else
	BASE="https://github.com/$REPO/releases/download/v$VERSION"; FILE="oDash-$VERSION.tar.gz"
fi
mkdir -p "$TMP"
say "Downloading oDash ($VERSION) from github.com/$REPO ..."
if ! fetch "$BASE/$FILE" "$TMP/odash.tar.gz" 2>/dev/null; then
	say "HTTPS download failed, installing certificates and an SSL library, then trying again."
	pkg_install ca-bundle libustream-mbedtls >/dev/null 2>&1 || pkg_install ca-bundle libustream-openssl >/dev/null 2>&1 || true
	command -v uclient-fetch >/dev/null 2>&1 && FETCH="uclient-fetch -q -O"
	fetch "$BASE/$FILE" "$TMP/odash.tar.gz" || die "could not download $BASE/$FILE (check the repository name, the version and the internet connection)."
fi

# checksum (skipped quietly when sha256sum or the .sha256 file is missing)
if command -v sha256sum >/dev/null 2>&1 && fetch "$BASE/$FILE.sha256" "$TMP/odash.sha256" 2>/dev/null; then
	want="$(awk '{ print $1; exit }' "$TMP/odash.sha256")"
	have="$(sha256sum "$TMP/odash.tar.gz" | awk '{ print $1 }')"
	[ -n "$want" ] && [ "$want" = "$have" ] || die "checksum mismatch, the download is damaged or was changed."
	say "Checksum OK."
fi

# ---------------------------------------------------------------- install
tar -xzf "$TMP/odash.tar.gz" -C "$TMP" || die "the downloaded file is not a valid archive."
dir="$(ls -d "$TMP"/odash-*/ 2>/dev/null | head -n 1)"
[ -n "$dir" ] && [ -f "${dir}install.sh" ] || die "the archive does not contain oDash."
sh "${dir}install.sh"
say ""
say "Done. Open LuCI, then Status > oDash (use a new browser tab or press Ctrl+F5)."
