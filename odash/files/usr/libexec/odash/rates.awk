# rates.awk - one live-throughput sample from the kernel sets.
#
# Input: "@@ mac" (ip<TAB>mac), "@@ map" (ip<TAB>site), "@@ prev" (state from
# the previous sample: first line "T <ts>", then dir<TAB>client<TAB>remote<TAB>bytes),
# then "@@ up"/"@@ down" followed by `nft list set` output.
# Output (-v outprev): new state. stdout: one JSON line
#   {"t":ts,"up":B/s,"down":B/s,"cl":{"dev":[up,down]},"st":{"site":[up,down]}}
# Nothing is printed for the very first sample (no baseline yet).

function isip(v) { return v ~ /^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$/ || (index(v, ":") && v ~ /^[0-9a-fA-F:]+$/) }
function esc(s) { gsub(/\\/, "\\\\", s); gsub(/"/, "\\\"", s); return s }

function flush(    i, s, n, t, k, cl, ip, b, key, p, d, c, st) {
	if (buf == "") return
	i = index(buf, "elements")
	if (i > 0) {
		s = substr(buf, i + 8); gsub(/[{},=]/, " ", s)
		n = split(s, t, " "); cl = ""; ip = ""
		for (k = 1; k <= n; k++) {
			if (t[k] == ".") continue
			if (isip(t[k])) { if (cl == "") cl = tolower(t[k]); else ip = tolower(t[k]); continue }
			if (t[k] == "bytes" && ip != "") {
				b = t[k + 1] + 0; k++
				key = dir "\t" cl "\t" ip
				newprev[key] = b
				p = (key in prev) ? prev[key] : 0
				d = (b >= p) ? b - p : b
				if (d > 0) {
					c = (cl in mac) ? mac[cl] : cl
					st = (ip in map) ? map[ip] : ip
					if (dir == "up") { cu[c] += d; su[st] += d; tu += d } else { cd[c] += d; sd[st] += d; td += d }
					cs[c] = 1; ss[st] = 1
				}
				cl = ""; ip = ""
			}
		}
	}
	buf = ""
}

/^@@ / { flush(); mode = $2; if (mode == "up" || mode == "down") dir = mode; next }
mode == "mac"  { split($0, f, "\t"); if (f[2] != "") mac[f[1]] = f[2]; next }
mode == "map"  { split($0, f, "\t"); if (f[2] != "") map[f[1]] = f[2]; next }
mode == "prev" {
	if ($1 == "T") { pt = $2 + 0; next }
	split($0, f, "\t"); prev[f[1] "\t" f[2] "\t" f[3]] = f[4] + 0; next
}
/^table / { flush() }
mode == "up" || mode == "down" { buf = buf " " $0 }

END {
	flush()
	printf "T %d\n", now > outprev
	for (k in newprev) printf "%s\t%.0f\n", k, newprev[k] >> outprev
	close(outprev)
	dt = now - pt
	if (pt == 0 || dt <= 0 || dt > 60) exit 0
	printf "{\"t\":%d,\"up\":%.0f,\"down\":%.0f,\"cl\":{", now, tu / dt, td / dt
	n = 0; for (c in cs) printf "%s\"%s\":[%.0f,%.0f]", (n++ ? "," : ""), esc(c), cu[c] / dt, cd[c] / dt
	printf "},\"st\":{"
	# keep the line small: only the 8 busiest sites
	m = 0; for (c in ss) { tot[c] = su[c] + sd[c]; order[++m] = c }
	for (i = 1; i <= m; i++) for (j = i + 1; j <= m; j++) if (tot[order[j]] > tot[order[i]]) { x = order[i]; order[i] = order[j]; order[j] = x }
	for (i = 1; i <= m && i <= 8; i++) printf "%s\"%s\":[%.0f,%.0f]", (i > 1 ? "," : ""), esc(order[i]), su[order[i]] / dt, sd[order[i]] / dt
	print "}}"
}
