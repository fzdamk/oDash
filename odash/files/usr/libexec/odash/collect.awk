# collect.awk - fold one nftables counter dump into the daily stats.
#
# Inputs (all -v): mapfile macfile prevfile statsfile dumpfile outstats outprev
#                  today cutoff [now recentfile outrecent hourfile outhour]
#
# dumpfile holds "@@ up" / "@@ down" markers, each followed by the output of
# `nft list set` for the IPv4 and IPv6 sets of that direction.
# Per (client, remote) byte counters are turned into deltas against prevfile (a counter that
# went down means the element was recreated, so the whole value is new).

function is_ip(v) {
	if (v ~ /^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$/) return 1
	if (index(v, ":") > 0 && v ~ /^[0-9a-fA-F:]+$/) return 1
	return 0
}

function add(dir, dev, site, d,    k) {
	if (dev ~ /^ff/ || dev ~ /^2(2[4-9]|3[0-9])\./) return
	if (dev in mac) dev = mac[dev]
	k = today SUBSEP dev SUBSEP site
	if (!(k in seen)) { seen[k] = 1; keys[++nk] = k }
	if (dir == "up") su[k] += d
	else sd[k] += d
	# per-minute buckets for the "last hour" view (kept in RAM only)
	if (now > 0) {
		k = bucket SUBSEP dev SUBSEP site
		if (!(k in rseen)) { rseen[k] = 1; rkeys[++nr] = k }
		if (dir == "up") ru[k] += d
		else rd[k] += d
		k = hbucket SUBSEP dev SUBSEP site
		if (!(k in hseen)) { hseen[k] = 1; hkeys[++nh] = k }
		if (dir == "up") hu[k] += d
		else hd[k] += d
	}
}

function flush(    i, s, n, t, k, ip, cl, b, key, p, d, site) {
	if (buf == "") return
	i = index(buf, "elements")
	if (i > 0) {
		s = substr(buf, i + 8)
		gsub(/[{},=]/, " ", s)
		n = split(s, t, " ")
		ip = ""; cl = ""
		for (k = 1; k <= n; k++) {
			if (t[k] == ".") continue
			if (is_ip(t[k])) {
				if (cl == "" ) cl = tolower(t[k]); else ip = tolower(t[k])
				continue
			}
			if (t[k] == "bytes" && ip != "") {
				b = t[k+1] + 0
				k++
				key = dir SUBSEP cl SUBSEP ip
				p = (key in prev) ? prev[key] : 0
				d = (b >= p) ? b - p : b
				newprev[key] = b
				if (d > 0) {
					site = (ip in map) ? map[ip] : ip
					add(dir, cl, site, d)
				}
				ip = ""; cl = ""
			}
		}
	}
	buf = ""
}

BEGIN {
	while ((getline line < mapfile) > 0)
		if (split(line, a, "\t") >= 2) map[a[1]] = a[2]
	close(mapfile)

	if (macfile != "") {
		while ((getline line < macfile) > 0)
			if (split(line, a, "\t") == 2) mac[a[1]] = a[2]
		close(macfile)
	}

	if (purgefile != "") {
		while ((getline line < purgefile) > 0) if (line != "") purge[line] = 1
		close(purgefile)
	}

	while ((getline line < prevfile) > 0)
		if (split(line, a, "\t") >= 4) prev[a[1] SUBSEP a[2] SUBSEP a[3]] = a[4] + 0
	close(prevfile)

	while ((getline line < statsfile) > 0) {
		na = split(line, a, "\t")
		if (na == 4) { a[5] = a[4]; a[4] = a[3]; a[3] = a[2]; a[2] = "-"; na = 5 }
		if (na >= 5 && a[1] >= cutoff) {
			if (a[2] in mac) a[2] = mac[a[2]]
			if (a[2] in purge) continue
			k = a[1] SUBSEP a[2] SUBSEP a[3]
			if (!(k in seen)) { seen[k] = 1; keys[++nk] = k }
			su[k] += a[4]
			sd[k] += a[5]
		}
	}
	close(statsfile)

	if (now > 0) {
		bucket = now - now % 60
		hbucket = now - now % 3600
		if (hourfile != "") {
			while ((getline line < hourfile) > 0) {
				na = split(line, a, "\t")
				if (na >= 5 && a[1] >= now - 90000) {
					if (a[2] in mac) a[2] = mac[a[2]]
					if (a[2] in purge) continue
					k = a[1] SUBSEP a[2] SUBSEP a[3]
					if (!(k in hseen)) { hseen[k] = 1; hkeys[++nh] = k }
					hu[k] += a[4]
					hd[k] += a[5]
				}
			}
			close(hourfile)
		}
		if (recentfile != "") {
			while ((getline line < recentfile) > 0) {
				na = split(line, a, "\t")
				if (na >= 5 && a[1] >= now - 3700) {
					if (a[2] in mac) a[2] = mac[a[2]]
					if (a[2] in purge) continue
					k = a[1] SUBSEP a[2] SUBSEP a[3]
					if (!(k in rseen)) { rseen[k] = 1; rkeys[++nr] = k }
					ru[k] += a[4]
					rd[k] += a[5]
				}
			}
			close(recentfile)
		}
	}

	dir = ""
	buf = ""
	while ((getline line < dumpfile) > 0) {
		if (line ~ /^@@ /) { flush(); dir = substr(line, 4); continue }
		if (line ~ /^table /) flush()
		buf = buf " " line
	}
	flush()
	close(dumpfile)

	printf "" > outstats
	for (i = 1; i <= nk; i++) {
		split(keys[i], kp, SUBSEP)
		printf "%s\t%s\t%s\t%.0f\t%.0f\n", kp[1], kp[2], kp[3], su[keys[i]], sd[keys[i]] >> outstats
	}
	close(outstats)

	if (now > 0 && outrecent != "") {
		printf "" > outrecent
		for (i = 1; i <= nr; i++) {
			split(rkeys[i], kp, SUBSEP)
			printf "%s\t%s\t%s\t%.0f\t%.0f\n", kp[1], kp[2], kp[3], ru[rkeys[i]], rd[rkeys[i]] >> outrecent
		}
		close(outrecent)
	}

	if (now > 0 && outhour != "") {
		printf "" > outhour
		for (i = 1; i <= nh; i++) {
			split(hkeys[i], kp, SUBSEP)
			printf "%s\t%s\t%s\t%.0f\t%.0f\n", kp[1], kp[2], kp[3], hu[hkeys[i]], hd[hkeys[i]] >> outhour
		}
		close(outhour)
	}

	printf "" > outprev
	for (k in newprev) {
		split(k, kp, SUBSEP)
		printf "%s\t%s\t%s\t%.0f\n", kp[1], kp[2], kp[3], newprev[k] >> outprev
	}
	close(outprev)
	exit 0
}
