# smbwatch.awk - one sample of the Samba counters.
# Input sections: "@@ prev" ("#ts N", then "ip rx tx"), "@@ days" ("date ip rx tx"),
# "@@ rx" / "@@ tx" (nft list set output with per-client byte counters).
# rx = bytes the clients sent to the router (uploads), tx = bytes the router sent (downloads).
# Output: -v outcur "ip rx tx rate_rx rate_tx", -v outprev (state), -v outdays (totals per day),
# and one line "ts rate_rx rate_tx" appended to -v agg.

function isip(v) { return v ~ /^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$/ || (index(v, ":") && v ~ /^[0-9a-fA-F:]+$/) }

function flushbuf(    n, parts, i, s, m, t, k, cur, e) {
	if (buf != "" && (sec == "rx" || sec == "tx")) {
		n = split(buf, parts, "elements")
		for (i = 2; i <= n; i++) {
			s = parts[i]
			e = index(s, "}")
			if (e > 0) s = substr(s, 1, e - 1)
			gsub(/[{},=]/, " ", s)
			m = split(s, t, " "); cur = ""
			for (k = 1; k <= m; k++) {
				if (isip(t[k])) { cur = tolower(t[k]); continue }
				if (t[k] == "bytes" && cur != "") {
					if (sec == "rx") R[cur] = t[k + 1] + 0; else T[cur] = t[k + 1] + 0
					seen[cur] = 1; cur = ""
				}
			}
		}
	}
	buf = ""
}

BEGIN { sec = ""; pt = 0; buf = ""; printf "" > outcur; printf "" > outprev; printf "" > outdays }
/^@@ / { flushbuf(); sec = $2; next }
sec == "prev" { if ($1 == "#ts") pt = $2 + 0; else { PR[$1] = $2 + 0; PT[$1] = $3 + 0 }; next }
sec == "days" { if (NF >= 4) { k = $1 " " $2; DR[k] = $3 + 0; DT[k] = $4 + 0 }; next }
sec == "rx" || sec == "tx" { buf = buf " " $0; next }
END {
	flushbuf()
	dt = (pt > 0) ? now - pt : 0
	sr = 0; st = 0
	for (ip in seen) {
		if (ip ~ /^127\./ || ip == "::1") continue
		r = R[ip] + 0; t = T[ip] + 0
		pr = (ip in PR) ? PR[ip] : 0; ptx = (ip in PT) ? PT[ip] : 0
		if (pt > 0) { dr = (r >= pr) ? r - pr : r; dtx = (t >= ptx) ? t - ptx : t } else { dr = 0; dtx = 0 }
		rr = (dt > 0) ? dr / dt : 0; rt = (dt > 0) ? dtx / dt : 0
		sr += rr; st += rt
		printf "%s %d %d %.0f %.0f\n", ip, r, t, rr, rt > outcur
		printf "%s %d %d\n", ip, r, t > outprev
		if (dr > 0 || dtx > 0) { k = today " " ip; DR[k] += dr; DT[k] += dtx }
	}
	printf "#ts %d\n", now > outprev
	if (pt > 0) printf "%d %.0f %.0f\n", now, sr, st >> agg
	for (k in DR) {
		split(k, p, " ")
		if (cutoff != "" && p[1] < cutoff) continue
		printf "%s %s %d %d\n", p[1], p[2], DR[k], DT[k] > outdays
	}
}
