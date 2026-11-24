# dns-follow.awk - learn "IP -> site" from dnsmasq query logs.
#
# Usage:
#   awk -v mapfile=/tmp/odash/ipmap -v group=registrable \
#       -v cmd="logread -f -e dnsmasq" -f dns-follow.awk
#
# Understands dnsmasq --log-queries=extra lines (with a serial number and
# client, so CNAME chains map back to the name the client asked for) and
# falls back to the plain format.

function is_ip(v) {
	if (v ~ /^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$/) return 1
	if (index(v, ":") > 0 && v ~ /^[0-9a-fA-F:]+$/) return 1
	return 0
}

function site_of(name,    n, l) {
	sub(/\.$/, "", name)
	if (group == "full") return name
	n = split(name, l, ".")
	if (n <= 2) return name
	if (length(l[n]) == 2 && (l[n-1] in sld)) return l[n-2] "." l[n-1] "." l[n]
	return l[n-1] "." l[n]
}

function put(ip, site) {
	if ((ip in map) && map[ip] == site) return
	if (!(ip in map)) nmap++
	map[ip] = site
	print ip "\t" site >> mapfile
	close(mapfile)
	if (++nwrites >= 20000) compact()
}

function compact(    k, tmp) {
	tmp = mapfile ".tmp"
	printf "" > tmp
	for (k in map) print k "\t" map[k] >> tmp
	close(tmp)
	system("mv -f '" tmp "' '" mapfile "'")
	nwrites = 0
	if (nmap > 200000) {
		split("", map)
		nmap = 0
		printf "" > mapfile
		close(mapfile)
	}
}

function handle(line,    f, n, p, i, off, key, verb, name, val) {
	n = split(line, f, " ")
	p = 0
	for (i = 1; i <= n; i++)
		if (f[i] ~ /^dnsmasq\[[0-9]+\]:$/) { p = i; break }
	if (!p) return
	if (f[p+1] ~ /^[0-9]+$/ && index(f[p+2], "/") > 0) {
		# several dnsmasq processes may run (PassWall 2): keep their serial numbers apart
		key = f[p] SUBSEP f[p+1] SUBSEP f[p+2]
		off = p + 3
	} else {
		key = "-"
		off = p + 1
	}
	verb = f[off]
	if (verb ~ /^query\[(A|AAAA)\]$/) {
		if (++norig > 50000) { split("", orig); norig = 1 }
		orig[key] = tolower(f[off+1])
		return
	}
	if ((verb == "reply" || verb == "cached") && f[off+2] == "is") {
		val = f[off+3]
		if (!is_ip(val)) return
		name = (key in orig) ? orig[key] : tolower(f[off+1])
		put(tolower(val), site_of(name))
	}
}

# tcpdump -v reply line, e.g.
#   192.168.1.1.53 > 192.168.1.50.62758: 16333* 2/0/0 a.com. CNAME b.com., b.com. A 1.2.3.4 (66)
# The first owner name in the answer section is the name the client asked for.
function handle_tcpdump(line,    f, n, i, q, v, ip) {
	n = split(line, f, " ")
	q = ""
	for (i = 1; i <= n; i++)
		if (f[i] ~ /^[0-9]+\*?$/ && f[i+1] ~ /^[0-9]+\/[0-9]+\/[0-9]+$/) { q = tolower(f[i+2]); break }
	if (q == "" || q ~ /^\(/) return
	for (i = 1; i < n; i++) {
		if (f[i] == "A" || f[i] == "AAAA") {
			ip = f[i+1]
			sub(/,$/, "", ip)
			if (is_ip(ip)) put(tolower(ip), site_of(q))
		}
	}
}

BEGIN {
	if (mapfile == "") mapfile = "/tmp/odash/ipmap"
	n = split("co com org net gov edu ac sch or ne go mil", tmp, " ")
	for (i = 1; i <= n; i++) sld[tmp[i]] = 1
	while ((getline line < mapfile) > 0) {
		if (split(line, a, "\t") >= 2) { map[a[1]] = a[2]; nmap++ }
	}
	close(mapfile)
	if (cmd == "") cmd = "logread -f -e dnsmasq"
	if (source == "tcpdump")
		while ((cmd | getline line) > 0) handle_tcpdump(line)
	else
		while ((cmd | getline line) > 0) handle(line)
	close(cmd)
	exit 0
}
