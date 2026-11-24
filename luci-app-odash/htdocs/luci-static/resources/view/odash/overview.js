'use strict';
'require baseclass';
'require dom';
'require fs';
'require poll';
'require ui';

/* Icons: Tabler Icons (MIT), outline set, 24x24 stroke paths. */
var ICONS = {
	c_social: ['M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572'],
	c_chat: ['M4 21v-13a3 3 0 0 1 3 -3h10a3 3 0 0 1 3 3v6a3 3 0 0 1 -3 3h-9l-4 4'],
	c_video: ['M7 4v16l13 -8z'],
	c_music: ['M3 17a3 3 0 1 0 6 0a3 3 0 0 0 -6 0', 'M13 17a3 3 0 1 0 6 0a3 3 0 0 0 -6 0', 'M9 17v-13h10v13', 'M9 8h10'],
	c_games: ['M2 8a2 2 0 0 1 2 -2h16a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-16a2 2 0 0 1 -2 -2z', 'M6 12h4m-2 -2v4', 'M15 11v.01', 'M18 13v.01'],
	c_updates: ['M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4', 'M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4'],
	c_ai: ['M16 18a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2z', 'M16 6a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2z', 'M9 18a6 6 0 0 1 6 -6a6 6 0 0 1 -6 -6a6 6 0 0 1 -6 6a6 6 0 0 1 6 6z'],
	c_cdn: ['M6.657 18c-2.572 0 -4.657 -2.007 -4.657 -4.483c0 -2.475 2.085 -4.482 4.657 -4.482c.393 -1.762 1.794 -3.2 3.675 -3.773c1.88 -.572 3.956 -.193 5.444 1c1.488 1.19 2.162 3.007 1.77 4.769h.99c1.913 0 3.464 1.56 3.464 3.486c0 1.927 -1.551 3.487 -3.465 3.487h-11.878'],
	c_shop: ['M4 19a2 2 0 1 0 4 0a2 2 0 1 0 -4 0', 'M15 19a2 2 0 1 0 4 0a2 2 0 1 0 -4 0', 'M17 17h-11v-14h-2', 'M6 5l14 1l-1 7h-13'],
	download: ['M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2', 'M7 11l5 5l5 -5', 'M12 4l0 12'],
	upload: ['M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2', 'M7 9l5 -5l5 5', 'M12 4l0 12'],
	total: ['M7 3l0 18', 'M10 6l-3 -3l-3 3', 'M17 21l0 -18', 'M20 18l-3 3l-3 -3'],
	device: ['M3 19l18 0', 'M5 7a1 1 0 0 1 1 -1h12a1 1 0 0 1 1 1v8a1 1 0 0 1 -1 1h-12a1 1 0 0 1 -1 -1z'],
	chevron: ['M9 6l6 6l-6 6'],
	computer: ['M3 5a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1v-10z', 'M7 20h10', 'M9 16v4', 'M15 16v4'],
	laptop: ['M3 19l18 0', 'M5 7a1 1 0 0 1 1 -1h12a1 1 0 0 1 1 1v8a1 1 0 0 1 -1 1h-12a1 1 0 0 1 -1 -1z'],
	phone: ['M6 5a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2v-14z', 'M11 4h2', 'M12 17v.01'],
	tablet: ['M5 4a1 1 0 0 1 1 -1h12a1 1 0 0 1 1 1v16a1 1 0 0 1 -1 1h-12a1 1 0 0 1 -1 -1v-16z', 'M11 17a1 1 0 1 0 2 0a1 1 0 0 0 -2 0'],
	watch: ['M6 9a3 3 0 0 1 3 -3h6a3 3 0 0 1 3 3v6a3 3 0 0 1 -3 3h-6a3 3 0 0 1 -3 -3v-6z', 'M9 18v3h6v-3', 'M9 6v-3h6v3'],
	tv: ['M3 9a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2l0 -9z', 'M16 3l-4 4l-4 -4'],
	console: ['M2 12a4 4 0 0 1 4 -4h12a4 4 0 0 1 4 4a4 4 0 0 1 -4 4h-12a4 4 0 0 1 -4 -4z', 'M6 12h4', 'M8 10v4', 'M15 11v.01', 'M18 13v.01'],
	speaker: ['M5 5a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2z', 'M9 14a3 3 0 1 0 6 0a3 3 0 1 0 -6 0', 'M12 7v.01'],
	camera: ['M5 7h1a2 2 0 0 0 2 -2a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1a2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-9a2 2 0 0 1 2 -2', 'M9 13a3 3 0 1 0 6 0a3 3 0 0 0 -6 0'],
	iot: ['M3 12h1m8 -9v1m8 8h1m-15.4 -6.4l.7 .7m12.1 -.7l-.7 .7', 'M9 16a5 5 0 1 1 6 0a3.5 3.5 0 0 0 -1 3a2 2 0 0 1 -4 0a3.5 3.5 0 0 0 -1 -3', 'M9.7 17l4.6 0'],
	router: ['M3 15a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v4a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z', 'M17 17v.01', 'M13 17v.01', 'M15 13v-2', 'M11.75 8.75a4 4 0 0 1 6.5 0', 'M8.5 6.5a8 8 0 0 1 13 0'],
	other: ['M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0 -18z', 'M12 8v4', 'M12 16h.01'],
	sites: ['M9 6l11 0', 'M9 12l11 0', 'M9 18l11 0', 'M5 6l0 .01', 'M5 12l0 .01', 'M5 18l0 .01'],
	world: ['M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0', 'M3.6 9h16.8', 'M3.6 15h16.8', 'M11.5 3a17 17 0 0 0 0 18', 'M12.5 3a17 17 0 0 1 0 18'],
	refresh: ['M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4', 'M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4'],
	trash: ['M4 7l16 0', 'M10 11l0 6', 'M14 11l0 6', 'M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12', 'M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3'],
	search: ['M3 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0', 'M21 21l-6 -6'],
	activity: ['M3 12h4l3 8l4 -16l3 8h4'],
	calendar: ['M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12z', 'M16 3v4', 'M8 3v4', 'M4 11h16'],
	bolt: ['M13 3l0 7l6 0l-8 11l0 -7l-6 0l8 -11'],
	alert: ['M12 9v4', 'M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z', 'M12 16h.01']
};

var NS = 'http://www.w3.org/2000/svg';

function siteIcon(site) {
	var g = icon('world', 16);
	if (/^[0-9.]+$/.test(site) || site.indexOf(':') >= 0 || site.indexOf('.') < 0)
		return g;
	var img = E('img', {
		'src': 'https://www.google.com/s2/favicons?sz=32&domain=' + encodeURIComponent(site),
		'width': 16, 'height': 16, 'loading': 'lazy', 'alt': '',
		'class': 'st-fav'
	});
	img.onerror = function() { if (img.parentNode) img.parentNode.removeChild(img); g.style.display = ''; };
	img.onload = function() { g.style.display = 'none'; };
	return E('span', { 'class': 'st-favwrap' }, [g, img]);
}


/* service categories: matched by domain suffix; first match wins */
var CATS = [
	{ id: 'ai', label: 'AI', icon: 'c_ai', rgb: '139,92,246', d: ['anthropic.com', 'claude.ai', 'openai.com', 'chatgpt.com', 'perplexity.ai', 'huggingface.co', 'cursor.sh', 'cursor.com', 'midjourney.com', 'x.ai', 'deepseek.com', 'mistral.ai'] },
	{ id: 'chat', label: 'Messaging', icon: 'c_chat', rgb: '16,185,129', d: ['whatsapp.com', 'whatsapp.net', 'telegram.org', 't.me', 'telegram.me', 'signal.org', 'viber.com', 'wechat.com', 'line.me', 'eitaa.com', 'bale.ai', 'rubika.ir', 'discord.com', 'discord.gg', 'discordapp.com'] },
	{ id: 'social', label: 'Social', icon: 'c_social', rgb: '236,72,153', d: ['facebook.com', 'fbcdn.net', 'instagram.com', 'cdninstagram.com', 'threads.net', 'twitter.com', 'twimg.com', 'x.com', 'tiktok.com', 'tiktokcdn.com', 'byteoversea.com', 'snapchat.com', 'linkedin.com', 'licdn.com', 'reddit.com', 'redd.it', 'redditstatic.com', 'pinterest.com', 'tumblr.com', 'quora.com'] },
	{ id: 'video', label: 'Video', icon: 'c_video', rgb: '239,68,68', d: ['youtube.com', 'googlevideo.com', 'ytimg.com', 'youtu.be', 'netflix.com', 'nflxvideo.net', 'nflximg.net', 'twitch.tv', 'ttvnw.net', 'aparat.com', 'namava.ir', 'filimo.com', 'hulu.com', 'disneyplus.com', 'primevideo.com', 'vimeo.com', 'dailymotion.com', 'hbomax.com', 'max.com'] },
	{ id: 'music', label: 'Music', icon: 'c_music', rgb: '34,197,94', d: ['spotify.com', 'scdn.co', 'spotifycdn.com', 'deezer.com', 'soundcloud.com', 'anghami.com', 'tidal.com', 'pandora.com', 'radiojavan.com', 'castbox.fm'] },
	{ id: 'games', label: 'Games', icon: 'c_games', rgb: '245,158,11', d: ['steampowered.com', 'steamcontent.com', 'steamstatic.com', 'epicgames.com', 'riotgames.com', 'roblox.com', 'ea.com', 'xboxlive.com', 'playstation.com', 'playstation.net', 'nintendo.com', 'nintendo.net', 'supercell.com', 'blizzard.com', 'battle.net', 'unity3d.com', 'garena.com', 'activision.com'] },
	{ id: 'updates', label: 'Updates', icon: 'c_updates', rgb: '14,165,233', d: ['windowsupdate.com', 'delivery.mp.microsoft.com', 'update.microsoft.com', 'swscan.apple.com', 'swcdn.apple.com', 'gvt1.com', 'gvt2.com', 'dl.google.com', 'ubuntu.com', 'debian.org', 'openwrt.org', 'apt.llvm.org', 'pypi.org', 'npmjs.org', 'npmjs.com', 'pythonhosted.org'] },
	{ id: 'shop', label: 'Shopping', icon: 'c_shop', rgb: '249,115,22', d: ['amazon.com', 'digikala.com', 'divar.ir', 'torob.com', 'aliexpress.com', 'alibaba.com', 'ebay.com', 'basalam.com', 'snapp.ir', 'snappfood.ir', 'tapsi.ir', 'trendyol.com', 'hepsiburada.com', 'temu.com', 'shein.com'] },
	{ id: 'cdn', label: 'Cloud & CDN', icon: 'c_cdn', rgb: '100,116,139', d: ['amazonaws.com', 'cloudfront.net', 'cloudflare.com', 'cloudflare.net', 'azure.com', 'azureedge.net', 'akamai.net', 'akamaiedge.net', 'akamaized.net', 'edgekey.net', 'fastly.net', 'fastlylb.net', 'github.com', 'githubusercontent.com', 'github.io', 'googleusercontent.com', 'gstatic.com', 'jsdelivr.net', 'unpkg.com'] },
	{ id: 'system', label: 'System & OS', icon: 'computer', rgb: '99,102,241', d: ['apple.com', 'icloud.com', 'mzstatic.com', 'apple-dns.net', 'microsoft.com', 'windows.com', 'office.com', 'office.net', 'live.com', 'msftconnecttest.com', 'msftncsi.com', 'bing.com', 'android.com', 'ntp.org', 'pool.ntp.org'] },
	{ id: 'web', label: 'Search & web', icon: 'search', rgb: '59,130,246', d: ['google.com', 'googleapis.com', 'google.com.tr', 'wikipedia.org', 'wikimedia.org', 'yahoo.com', 'duckduckgo.com', 'yandex.com', 'yandex.ru', 'medium.com', 'stackoverflow.com'] }
];
var CAT_CACHE = {};
function catOf(site) {
	var h = String(site || '').toLowerCase();
	if (h in CAT_CACHE) return CAT_CACHE[h];
	var hit = null;
	for (var i = 0; i < CATS.length && !hit; i++)
		for (var j = 0; j < CATS[i].d.length; j++) {
			var d = CATS[i].d[j];
			if (h === d || h.slice(-d.length - 1) === '.' + d) { hit = CATS[i]; break; }
		}
	CAT_CACHE[h] = hit;
	return hit;
}
function catOfGroup(g) {
	var c = catOf(g.site);
	for (var i = 0; !c && i < g.kids.length; i++) c = catOf(g.kids[i].site);
	return c;
}

function icon(name, size) {
	var svg = document.createElementNS(NS, 'svg');
	size = size || 18;
	svg.setAttribute('width', size);
	svg.setAttribute('height', size);
	svg.setAttribute('viewBox', '0 0 24 24');
	svg.setAttribute('fill', 'none');
	svg.setAttribute('stroke', 'currentColor');
	svg.setAttribute('stroke-width', '2');
	svg.setAttribute('stroke-linecap', 'round');
	svg.setAttribute('stroke-linejoin', 'round');
	svg.setAttribute('class', 'st-icon');
	svg.setAttribute('aria-hidden', 'true');
	(ICONS[name] || ICONS.other).forEach(function(d) {
		var p = document.createElementNS(NS, 'path');
		p.setAttribute('d', d);
		svg.appendChild(p);
	});
	return svg;
}

function fmt(bytes) {
	var units = ['B', 'KB', 'MB', 'GB', 'TB'], i = 0;
	bytes = +bytes || 0;
	while (bytes >= 1024 && i < units.length - 1) { bytes /= 1024; i++; }
	return (i === 0 ? bytes.toFixed(0) : bytes.toFixed(2)) + ' ' + units[i];
}


/* a byte count as a big number with a small unit next to it */
function setBytes(el, bytes) {
	var t = fmt(bytes).split(' ');
	el.textContent = t[0];
	el.appendChild(E('small', {}, t[1] || ''));
}

/* bytes per second -> bit rate, the way speed tests show it */
function fmtRate(bps) {
	var bits = (+bps || 0) * 8, units = ['bps', 'Kbps', 'Mbps', 'Gbps'], i = 0;
	while (bits >= 1000 && i < units.length - 1) { bits /= 1000; i++; }
	return (i === 0 ? bits.toFixed(0) : bits.toFixed(bits >= 100 ? 0 : 1)) + ' ' + units[i];
}

var RANGE_TXT = { '-1': 'last hour', '-2': 'last 24 hours', 0: 'all time', 1: 'today', 7: 'last 7 days', 30: 'last 30 days' };
var C_DOWN = '#3b82f6', C_UP = '#f59e0b';
var LIVE_STEP = 3, LIVE_WINDOW = 180;  /* router samples every 3 s, chart shows 3 minutes (60 thick bars) */

var CSS = [
	'.st{--st-card:rgba(128,128,128,.06);--st-line:rgba(128,128,128,.22);--st-muted:rgba(128,128,128,.9)}',
	'.st-icon{vertical-align:middle;flex:none}',
	'.st-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}',
	'.st-head h2{margin:0}',
	'.st-pill{display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:999px;font-size:12px;background:var(--st-card);border:1px solid var(--st-line)}',
	'.st-pulse{width:8px;height:8px;border-radius:50%;background:#22c55e;box-shadow:0 0 0 0 rgba(34,197,94,.6);animation:stp 2s infinite}',
	'.st-pulse.off{background:#ef4444;animation:none}',
	'@keyframes stp{0%{box-shadow:0 0 0 0 rgba(34,197,94,.55)}70%{box-shadow:0 0 0 8px rgba(34,197,94,0)}100%{box-shadow:0 0 0 0 rgba(34,197,94,0)}}',
	'.st-period{margin-top:16px}.st-pills{display:flex;flex-wrap:wrap;justify-content:center;gap:8px}.st-pbtn{appearance:none;cursor:pointer;font:inherit;font-size:13px;padding:7px 14px;border-radius:8px;border:1px solid rgba(128,128,128,.35);background:transparent;color:inherit;line-height:1.2}.st-pbtn:hover{background:rgba(59,130,246,.08)}.st-pbtn.on{background:rgba(59,130,246,.18);border-color:#3b82f6;color:#1d4ed8;font-weight:600}',
	'.st-cards{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:16px 0}.st-cards>*{min-width:0}@media (max-width:1100px){.st-cards{grid-template-columns:repeat(2,minmax(0,1fr))}}',
	'.st-card{display:flex;align-items:center;gap:12px;padding:14px 16px;border:1px solid var(--st-line);border-radius:12px;background:var(--st-card)}',
	'.st-bub{display:inline-flex;align-items:center;justify-content:center;width:42px;height:42px;border-radius:12px;flex:none}',
	'.st-card .st-label{font-size:12px;color:var(--st-muted)}',
	'.st-card .st-value{font-size:24px;font-weight:700;line-height:1.2}.st-card>div:last-child{min-width:0}.st-card .st-bub{flex:none}.st-card .st-value small{font-size:12px;font-weight:600;color:var(--st-muted);margin-left:4px}',
	'.st-card .st-sub2{font-size:11px;color:var(--st-muted)}',
	'.st-grid{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1fr);gap:12px;margin-bottom:12px}',
	'@media (max-width:900px){.st-grid{grid-template-columns:minmax(0,1fr)}}',
	'.st-panel{border:1px solid var(--st-line);border-radius:12px;padding:14px 16px;background:var(--st-card);min-width:0}',
	'.st-ptitle{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px;font-weight:600}',
	'.st-ptitle>span{display:inline-flex;align-items:center;gap:8px}',
	'.st-ptitle small{font-weight:400;color:var(--st-muted)}',
	'.st-canvas-wrap{position:relative}',
	'.st-catbox{display:flex;gap:24px;align-items:center;flex-wrap:wrap;justify-content:center;padding:6px 0}.st-catleg{flex:1;min-width:220px;display:grid;gap:6px}.st-catrow{display:grid;grid-template-columns:12px 1fr auto auto;gap:10px;align-items:center;font-size:13px;cursor:pointer;padding:3px 4px;border-radius:6px}.st-catrow:hover{background:rgba(128,128,128,.1)}.st-catrow small{opacity:.6;min-width:70px;text-align:right}.st-canvas{width:100%;display:block}',
	'.st-tip{position:absolute;pointer-events:none;padding:6px 10px;border-radius:8px;font-size:12px;background:rgba(20,20,25,.92);color:#fff;white-space:nowrap;display:none;z-index:2}',
	'.st-now{display:flex;gap:18px;font-size:13px}',
	'.st-now b{font-size:15px}',
	'.st-dot{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:6px;vertical-align:middle}',
	'.st-list{display:flex;flex-direction:column;gap:8px}',
	'.st-li{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:10px}',
	'.st-li .st-nm{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
	'.st-li .st-rt{font-size:12px;text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}',
	'.st-mini{height:4px;border-radius:2px;background:var(--st-line);overflow:hidden;margin-top:4px;display:flex}',
	'.st-empty{color:var(--st-muted);font-size:13px;padding:8px 0}',
	'.st-sec{font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--st-muted);margin:12px 0 8px}',
	'.st-toolbar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:4px 0 12px}',
	'.st-search{display:flex;align-items:center;gap:6px;flex:1;min-width:160px}',
	'.st-search input{flex:1}',
	'.st-btn{display:inline-flex;align-items:center;gap:6px}',
	'.st-pager{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:12px 4px}',
	'.st-pages{display:flex;gap:4px;align-items:center}',
	'.st-size{width:auto !important;min-width:64px;padding:2px 6px}',
	'.st-pg{min-width:34px;padding:4px 8px !important;justify-content:center}',
	'.st-pg.st-cur{background:#3b82f6 !important;border-color:#3b82f6 !important;color:#fff !important}',
	'.st-check{display:inline-flex;align-items:center;gap:4px;white-space:nowrap}',
	'.st-favwrap{display:inline-flex;align-items:center;flex:none}.st-fav{border-radius:3px}',
	'.st-tbl{width:100%}',
	'@media (max-width:640px){.st-tbl th:nth-child(2),.st-tbl td:nth-child(2),.st-dtbl th:nth-child(2),.st-dtbl td:nth-child(2){display:none}.st-tbl td,.st-tbl th,.st-dtbl td,.st-dtbl th{padding:6px 5px!important;font-size:12px}.st-num{white-space:nowrap}.st-site{min-width:0;gap:5px;flex-wrap:nowrap;word-break:normal;overflow-wrap:anywhere}.st-site .st-chip{display:none}.st-tbl th:nth-child(4),.st-tbl td:nth-child(4){display:none}.st-site>span:nth-child(3){flex:1}.st-site>span:not(.st-chev):not(.st-chev-pad){min-width:0}.st-toolbar select,.st-toolbar .st-search,.st-toolbar input{flex:1 1 130px;min-width:0;max-width:100%}.st-ptitle{flex-wrap:wrap}.st-catbox{justify-content:center}.st-tip{max-width:60vw}}',
	'@media (max-width:640px){.st-cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.st-cards>*{min-width:0}.st-cards>:last-child:nth-child(odd){grid-column:1/-1}.st-card{padding:10px 12px;gap:8px}.st-card .st-value{font-size:20px}.st-card .st-bub{width:34px;height:34px}.st-card .st-bub svg{width:18px;height:18px}.st-panel{overflow-x:auto}.st-dtbl th:nth-child(7),.st-dtbl td:nth-child(7){display:none}.st-dtbl .st-wf small{display:none}.st-dtbl .st-wf{gap:5px}.st-dtbl .st-wf b{font-size:12px}.st-dtbl tr.st-grp td{padding:8px 5px 4px}.st-dtbl .st-devicon{display:none !important}.st-dtbl .st-ar{display:none !important}.st-dtbl td.st-num{font-size:11.5px;padding-left:3px!important;padding-right:3px!important}.st-dname small{overflow-wrap:anywhere}}',
	'@media (max-width:480px){.st-mac{display:none}.st-dtbl th:nth-child(6),.st-dtbl td:nth-child(6){display:none}.st-card .st-bub{display:none}.st-card .st-value{font-size:18px}}',
	'.st-click{cursor:pointer}.st-click:hover{background:rgba(128,128,128,.08)}',
	'.st-chev{display:inline-flex;transition:transform .15s;opacity:.7}.st-chev.st-open{transform:rotate(90deg)}',
	'.st-chev-pad{display:inline-block;width:14px;flex:none}',
	'.st-site{display:flex;align-items:center;gap:8px;word-break:break-all}',
	'.st-chip{display:inline-flex;align-items:center;gap:4px;padding:1px 8px;border-radius:999px;font-size:11px;white-space:nowrap}',
	'.st-chip-dom{background:rgba(59,130,246,.15)}.st-chip-dev{background:rgba(236,72,153,.15)}',
	'.st-bar{display:flex;height:8px;min-width:80px;border-radius:4px;overflow:hidden;background:var(--st-line)}',
	'.st-num{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}',
	'.st-detail>td{padding:0 !important;background:rgba(128,128,128,.04)}',
	'.st-dgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px;padding:12px 12px 14px 34px}',
	'.st-dcard{border:1px solid var(--st-line);border-radius:10px;padding:10px 12px;background:var(--st-card)}',
	'.st-dhead{display:flex;align-items:center;gap:8px;font-weight:600;margin-bottom:8px}',
	'.st-dhead .st-count{margin-left:auto;font-weight:400;font-size:12px;color:var(--st-muted)}',
	'.st-drow{display:grid;grid-template-columns:minmax(0,1fr) 90px auto;align-items:center;gap:10px;padding:5px 0;border-top:1px solid var(--st-line);font-size:13px}',
	'.st-drow:first-of-type{border-top:0}',
	'.st-drow .st-nm{display:flex;align-items:center;gap:8px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}',
	'.st-drow .st-val{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}',
	'.st-drow .st-val small{display:block;font-size:11px;color:var(--st-muted)}',
	'.st-dtbl{width:100%;border-collapse:collapse}.st-dtbl td,.st-dtbl th{padding:8px 10px;border-top:1px solid var(--st-line);text-align:left}.st-dtbl th{font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:var(--st-muted);font-weight:700;border-top:0;background:rgba(128,128,128,.14);border-bottom:2px solid rgba(128,128,128,.4);padding:8px 10px}.st-dtbl td.st-num b,.st-dtbl td.st-num{font-variant-numeric:tabular-nums}.st-dtbl .st-ar{display:inline-block;width:12px;font-weight:700}',
	'.st-wf{display:flex;align-items:flex-end;gap:8px}.st-wf b{display:block;font-size:13px}.st-wf small{display:block;color:var(--st-muted);font-size:11px;white-space:nowrap}.st-wf-dim{color:var(--st-muted);font-size:12px}.st-sig{display:inline-flex;align-items:flex-end;gap:2px;height:15px;margin-bottom:2px}.st-sig i{display:block;width:3px;border-radius:1px;background:rgba(128,128,128,.35)}',
	'.st-dtbl tr.st-off>td{background:rgba(128,128,128,.14)}.st-dtbl tr.st-grp td{padding:10px 10px 6px;font-size:12px;font-weight:700;color:var(--st-muted);text-transform:uppercase;letter-spacing:.04em;border-top:0}.st-dtbl tr.st-grp small{font-weight:600;opacity:.8}.st-dtbl tr.st-grp .st-dot{margin-right:7px}.st-dtbl tr.st-sel{background:rgba(59,130,246,.1)}',
	'.st-dname{display:flex;align-items:center;gap:10px}.st-dname .st-devicon{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:8px;background:rgba(128,128,128,.12);flex:none}',
	'.st-dname small{display:block;font-size:11px;color:var(--st-muted)}',
	'.st-onlg{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:8px}.st-onl{display:flex;align-items:center;gap:10px;padding:8px 10px;border:1px solid var(--st-line);border-radius:10px;min-width:0}.st-onlt{flex:1;min-width:0}.st-onlt b,.st-onlt small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.st-onlt small{opacity:.7;font-size:11.5px}',
	'.st-live{font-size:12px;white-space:nowrap;font-variant-numeric:tabular-nums}.st-live.off{color:var(--st-muted)}',
	'.st-notice{display:flex;align-items:center;gap:8px;padding:10px 12px;border-radius:10px;background:rgba(245,158,11,.15);margin:12px 0}'
].join('');

function bar(r, scale, cls) {
	scale = scale || 1;
	return E('div', { 'class': cls || 'st-bar' }, [
		E('span', { 'style': 'background:' + C_DOWN + ';width:' + Math.min(100, r.down / scale * 100).toFixed(1) + '%' }),
		E('span', { 'style': 'background:' + C_UP + ';width:' + Math.min(100, r.up / scale * 100).toFixed(1) + '%' })
	]);
}

/* ---------- canvas charts ---------- */

function setupCanvas(cv, h) {
	var r = window.devicePixelRatio || 1, w = cv.clientWidth || cv.parentNode.clientWidth || 600;
	cv.style.height = h + 'px';
	cv.width = Math.round(w * r); cv.height = Math.round(h * r);
	var ctx = cv.getContext('2d');
	ctx.setTransform(r, 0, 0, r, 0, 0);
	return { ctx: ctx, w: w, h: h, fg: getComputedStyle(cv).color || '#888' };
}

function niceMax(v) {
	if (v <= 0) return 1;
	var p = Math.pow(10, Math.floor(Math.log10(v))), n = v / p;
	return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
}

function axes(c, pad, max, lab) {
	var ctx = c.ctx;
	ctx.font = '11px sans-serif';
	ctx.fillStyle = c.fg; ctx.strokeStyle = c.fg;
	for (var i = 0; i <= 4; i++) {
		var y = pad.t + (c.h - pad.t - pad.b) * (1 - i / 4);
		ctx.globalAlpha = 0.12; ctx.beginPath(); ctx.moveTo(pad.l, y + .5); ctx.lineTo(c.w - pad.r, y + .5); ctx.stroke();
		ctx.globalAlpha = 0.6; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
		ctx.fillText(lab(max * i / 4), pad.l - 6, y);
	}
	ctx.globalAlpha = 1;
}

function drawLive(cv, pts, now) {
	var c = setupCanvas(cv, 240), ctx = c.ctx, pad = { l: 64, r: 10, t: 12, b: 22 };
	/* each side gets its own bound, rounded up to a round number from its own peak (in bits per second) */
	var bound = function(v) {
		var bits = Math.max(v * 8, 8000), p = Math.pow(10, Math.floor(Math.log10(bits))), n = bits / p;
		return [1, 1.5, 2, 3, 4, 5, 6, 8, 10].filter(function(x) { return x >= n * 1.04; })[0] * p / 8;
	};
	/* only samples inside the visible window count; a lone spike (more than 4x the typical busy level) is clipped
	   with a marker instead of flattening every other bar, and the true peak is printed next to the label */
	var vis = pts.filter(function(p) { var a = now - p.at; return a >= 0 && a <= LIVE_WINDOW; });
	var side = function(key) {
		var v = vis.map(function(p) { return p[key]; }).filter(function(x) { return x > 0; }).sort(function(a, b) { return a - b; });
		var peak = v.length ? v[v.length - 1] : 0, typ = v.length ? v[Math.min(v.length - 1, Math.floor(v.length * 0.9))] : 0;
		var clip = v.length >= 8 && peak > typ * 4;
		return { max: bound(clip ? typ * 1.5 : peak), peak: peak, clip: clip };
	};
	var SD = side('down'), SU = side('up'), maxD = SD.max, maxU = SU.max;
	var W = c.w - pad.l - pad.r, H = c.h - pad.t - pad.b, mid = pad.t + H / 2, half = H / 2 - 2;
	ctx.font = '11px sans-serif';
	ctx.fillStyle = c.fg; ctx.strokeStyle = c.fg;
	/* grid and labels: download above the middle line, upload below it */
	[[-1, 1], [-.5, .5], [0, 0], [.5, -.5], [1, -1]].forEach(function(g) {
		var y = mid - (g[1] * half), mx = g[1] > 0 ? maxD : maxU;
		ctx.globalAlpha = g[0] === 0 ? 0.35 : 0.12; ctx.beginPath(); ctx.moveTo(pad.l, y + .5); ctx.lineTo(c.w - pad.r, y + .5); ctx.stroke();
		ctx.globalAlpha = 0.6; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
		ctx.fillText(fmtRate(mx * Math.abs(g[1])), pad.l - 6, y);
	});
	ctx.globalAlpha = 0.5; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
	ctx.fillStyle = C_DOWN; ctx.fillText('\u2193 download' + (SD.clip ? '  (peak ' + fmtRate(SD.peak) + ', clipped)' : ''), pad.l + 6, pad.t + 2);
	ctx.fillStyle = C_UP; ctx.textBaseline = 'bottom'; ctx.fillText('\u2191 upload' + (SU.clip ? '  (peak ' + fmtRate(SU.peak) + ', clipped)' : ''), pad.l + 6, pad.t + H - 2);
	ctx.fillStyle = c.fg; ctx.globalAlpha = 0.6; ctx.textBaseline = 'top';
	for (var m = 3; m >= 0; m -= 1) {
		var f = 1 - m * 60 / LIVE_WINDOW;
		ctx.textAlign = m === 3 ? 'left' : m === 0 ? 'right' : 'center';
		ctx.fillText(m ? '-' + m + 'm' : 'now', pad.l + W * f, c.h - pad.b + 6);
	}
	ctx.globalAlpha = 1;
	/* every sample owns one whole-pixel slot, so the bars keep an even width and gap at any window size */
	var slots = Math.round(LIVE_WINDOW / LIVE_STEP), slot = W / slots, gap = Math.max(1, Math.min(3, Math.round(slot * 0.18)));
	pts.forEach(function(p) {
		var age = now - p.at;
		if (age > LIVE_WINDOW || age < 0) return;
		var k = Math.min(slots - 1, Math.floor(age / LIVE_STEP));
		var x0 = Math.round(pad.l + W - (k + 1) * slot), x1 = Math.round(pad.l + W - k * slot) - gap, bw = Math.max(1, x1 - x0);
		var hd = Math.min(half, half * p.down / maxD), hu = Math.min(half, half * p.up / maxU);
		if (p.down > 0) { var h1 = Math.max(1, Math.round(hd)); ctx.fillStyle = C_DOWN; ctx.fillRect(x0, mid - h1, bw, h1); if (p.down > maxD) { ctx.fillStyle = '#fff'; ctx.fillRect(x0, mid - h1, bw, Math.min(3, h1)); } }
		if (p.up > 0) { var h2 = Math.max(1, Math.round(hu)); ctx.fillStyle = C_UP; ctx.fillRect(x0, mid, bw, h2); if (p.up > maxU) { ctx.fillStyle = '#fff'; ctx.fillRect(x0, mid + h2 - Math.min(3, h2), bw, Math.min(3, h2)); } }
	});
	return { pad: pad, W: W };
}

function drawDaily(cv, days) {
	var c = setupCanvas(cv, 180), ctx = c.ctx, pad = { l: 64, r: 10, t: 10, b: 22 };
	var raw = days.reduce(function(m, d) { return Math.max(m, d.down + d.up); }, 1024);
	var unit = Math.pow(1024, Math.floor(Math.log(raw) / Math.log(1024)));
	var max = niceMax(raw / unit) * unit;
	axes(c, pad, max, function(v) { return fmt(v).replace('.00', ''); });
	var W = c.w - pad.l - pad.r, H = c.h - pad.t - pad.b, n = days.length || 1;
	var slot = W / n, bw = Math.max(3, Math.min(28, slot * 0.6));
	var every = Math.ceil(n / Math.max(1, Math.floor(W / 44)));
	days.forEach(function(d, i) {
		var x = pad.l + slot * i + (slot - bw) / 2;
		var hd = H * d.down / max, hu = H * d.up / max;
		ctx.fillStyle = C_DOWN; ctx.fillRect(x, pad.t + H - hd, bw, hd);
		ctx.fillStyle = C_UP; ctx.fillRect(x, pad.t + H - hd - hu, bw, hu);
		if ((n - 1 - i) % every === 0) {
			ctx.fillStyle = c.fg; ctx.globalAlpha = 0.6; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
			ctx.fillText(d.date.slice(5).replace('-', '/'), x + bw / 2, c.h - pad.b + 6);
			ctx.globalAlpha = 1;
		}
	});
	return { slot: slot, pad: pad };
}

/* ---------- view ---------- */

return baseclass.extend({
	state: { days: 0, devDays: 0, catDays: 0, devData: null, sort: 'total', query: '', device: '', group: true, open: {}, data: null, page: 0, size: 10, cat: '', sig: '' },
	live: { now: 0, pts: [], fresh: false, siteRate: {} },

	cache: {},
	rkey: function(d) { return d < 0 ? (d === -2 ? 'd' : 'h') : String(d); },
	/* show what was loaded earlier for the chosen range right away; the fresh data replaces it a moment later */
	useCache: function() {
		var s = this.state, a = this.cache[this.rkey(s.days)], b = this.cache[this.rkey(s.devDays)];
		if (a) { s.data = a; s.devData = b || a; this.update(); this.drawDays(); this.drawCats(); }
	},
	getRange: function(days) {
		var self = this, k = this.rkey(days);
		return fs.exec_direct('/usr/bin/odash', ['json', k], 'json').then(function(r) { self.cache[k] = r; return r; });
	},

	fetchRange: function() {
		var self = this;
		return Promise.all([
			fs.exec_direct('/usr/bin/odash', ['json', this.rkey(this.state.days)], 'json'),
			this.state.devDays === this.state.days ? null : fs.exec_direct('/usr/bin/odash', ['json', this.rkey(this.state.devDays)], 'json')
		]).then(function(r) {
			r[0].daily30 = r[0].daily;      /* the daily series always covers all history */
			self.cache[self.rkey(self.state.days)] = r[0];
			if (r[1]) self.cache[self.rkey(self.state.devDays)] = r[1];
			self.state.devData = r[1] || r[0];
			return r[0];
		}).catch(function(e) { return { error: e.message || String(e) }; });
	},

	load: function() {
		return this.fetchRange();
	},

	card: function(iconName, color, label, id) {
		var value = E('div', { 'class': 'st-value' }, '-'), sub = E('div', { 'class': 'st-sub2' }, '');
		this.vals = this.vals || {};
		this.vals[id] = value; this.subs = this.subs || {}; this.subs[id] = sub;
		return E('div', { 'class': 'st-card' }, [
			E('span', { 'class': 'st-bub', 'style': 'background:' + color + '22;color:' + color }, icon(iconName, 22)),
			E('div', {}, [E('div', { 'class': 'st-label' }, label), value, sub])
		]);
	},

	btn: function(iconName, text, cls, handler) {
		return E('button', { 'class': 'cbi-button st-btn ' + cls, 'click': handler }, [icon(iconName, 16), text]);
	},

	render: function(data) {
		try { var ps = parseInt(window.localStorage.getItem('odash.pageSize'), 10); if ([10, 25, 50, 100].indexOf(ps) >= 0) this.state.size = ps; } catch (e) {}
		var self = this;
		this.state.data = data;

		var rangeOpts = function() {
			return [E('option', { 'value': -1 }, 'Last hour'), E('option', { 'value': -2 }, 'Last 24 hours'), E('option', { 'value': 1 }, 'Today'),
				E('option', { 'value': 7 }, 'Last 7 days'), E('option', { 'value': 30 }, 'Last 30 days'), E('option', { 'value': 0 }, 'All time')];
		};
		var range = E('select', { 'class': 'cbi-input-select', 'title': 'Time range for services', 'change': function(ev) {
			self.state.days = +ev.target.value; self.state.open = {}; self.useCache(); self.refresh();
		} }, rangeOpts());
		var devRangeSel = E('select', { 'class': 'cbi-input-select', 'title': 'Time range for devices', 'change': function(ev) {
			self.state.devDays = +ev.target.value; self.useCache(); self.refresh();
		} }, rangeOpts());
		range.value = String(this.state.days); devRangeSel.value = String(this.state.devDays);
		/* the period buttons drive the cards, the services table and the category chart; the device table has its own menu */
		var PERIODS = [[-1, 'Last hour'], [-2, 'Last 24 hours'], [1, 'Today'], [7, 'Last 7 days'], [30, 'Last 30 days'], [0, 'All time']];
		var pbtns = [];
		var period = E('div', { 'class': 'st-pills', 'role': 'tablist' }, PERIODS.map(function(p) {
			var b = E('button', { 'type': 'button', 'class': 'st-pbtn', 'data-v': String(p[0]), 'click': function() {
				self.state.days = self.state.catDays = self.state.devDays = p[0]; self.state.open = {};
				pbtns.forEach(function(x) { x.classList.toggle('on', x === b); });
				self.useCache(); self.refresh(); self.drawCats(true);
			} }, p[1]);
			pbtns.push(b);
			if (p[0] === self.state.days) b.classList.add('on');
			return b;
		}));
		var sort = E('select', { 'class': 'cbi-input-select', 'change': function(ev) { self.state.sort = ev.target.value; self.update(); } }, [
			E('option', { 'value': 'total' }, 'Sort by total'),
			E('option', { 'value': 'down' }, 'Sort by download'),
			E('option', { 'value': 'up' }, 'Sort by upload')
		]);
		this.devSel = E('select', { 'class': 'cbi-input-select', 'change': function(ev) {
			self.state.device = ev.target.value; self.state.open = {}; self.update(); self.drawLive();
		} }, [E('option', { 'value': '' }, 'All devices')]);
		var catSel = E('select', { 'class': 'cbi-input-select', 'title': 'Category', 'change': function(ev) {
			self.state.cat = ev.target.value; self.state.open = {}; self.update();
		} }, [E('option', { 'value': '' }, 'All categories')].concat(CATS.map(function(c) {
			return E('option', { 'value': c.id }, c.label);
		})).concat([E('option', { 'value': '_other' }, 'Other')]));
		var groupBox = E('input', { 'type': 'checkbox', 'checked': true, 'change': function(ev) {
			self.state.group = ev.target.checked; self.state.open = {}; self.update();
		} });
		var search = E('input', { 'type': 'text', 'class': 'cbi-input-text', 'placeholder': 'Filter sites',
			'input': function(ev) { self.state.query = ev.target.value.toLowerCase(); self.update(); } });

		this.pill = E('span', { 'class': 'st-pill' }, [E('span', { 'class': 'st-pulse' }), 'Live']);
		this.notice = E('div');
		this.tbody = E('tbody');
		this.liveCv = E('canvas', { 'class': 'st-canvas' });
		this.liveTip = E('div', { 'class': 'st-tip' });
		this.liveNow = E('div', { 'class': 'st-now' });
		this.liveTitle = E('small', {}, 'all devices');
		this.dayCv = E('canvas', { 'class': 'st-canvas' });
		this.dayTip = E('div', { 'class': 'st-tip' });
		this.activeSite = E('div', { 'class': 'st-list' });

		this.liveCv.addEventListener('mousemove', function(ev) { self.liveHover(ev); });
		this.liveCv.addEventListener('mouseleave', function() { self.liveTip.style.display = 'none'; });
		this.dayCv.addEventListener('mousemove', function(ev) { self.dayHover(ev); });
		this.dayCv.addEventListener('mouseleave', function() { self.dayTip.style.display = 'none'; });
		window.addEventListener('resize', function() { self.drawLive(); self.drawDays(); });
		try { if (window.ResizeObserver && this.liveCv && this.liveCv.parentNode) { var lw = 0; new ResizeObserver(function() { var w = self.liveCv.parentNode.clientWidth; if (w === lw) return; lw = w; self.drawLive(); self.drawDays(); }).observe(this.liveCv.parentNode); } } catch (e) {}

		this.liveGrid = E('div', { 'class': 'st-grid', 'style': 'margin-bottom:16px' }, [
			E('div', { 'class': 'st-panel' }, [
				E('div', { 'class': 'st-ptitle' }, [E('span', {}, [icon('activity', 18), 'Live throughput', this.liveTitle]), this.liveNow]),
				E('div', { 'class': 'st-canvas-wrap' }, [this.liveCv, this.liveTip])
			]),
			E('div', { 'class': 'st-panel' }, [
				E('div', { 'class': 'st-ptitle' }, [E('span', {}, [icon('bolt', 18), 'Top services now', E('small', {}, 'top 5')])]),
				this.activeSite
			])
		]);
		this.onlineBox = E('div', { 'class': 'st-panel', 'style': 'margin-bottom:16px' });

		var root = E('div', { 'class': 'cbi-map st' }, [
			E('style', {}, CSS),
			this.embedded ? '' : E('div', { 'class': 'st-head' }, [E('h2', {}, 'oDash'), this.pill]),
			this.embedded ? '' : E('div', { 'class': 'cbi-map-descr' }, 'Download and upload per site and per device, measured on the router. Click a service to see its domains and the devices that used it.'),
			this.notice,
			E('div', { 'class': 'st-period', 'style': 'margin:0' }, [period]),
			E('div', { 'class': 'st-cards' }, [
				this.card('download', C_DOWN, 'Download', 'down'),
				this.card('upload', C_UP, 'Upload', 'up'),
				this.card('total', '#8b5cf6', 'Total', 'total'),
				this.card('laptop', '#ec4899', 'Devices', 'devices')
			]),
			E('div', { 'class': 'st-panel', 'style': 'margin-bottom:16px' }, [
				E('div', { 'class': 'st-ptitle' }, [E('span', {}, [icon('laptop', 18), 'Traffic per device', this.devRange = E('small', {}, '')]),
					E('span', { 'class': 'st-now' }, [E('small', {}, 'Click a device to filter the page')])]),
				E('div', { 'style': 'overflow-x:auto' }, E('table', { 'class': 'st-dtbl' }, [
					E('thead', {}, E('tr', {}, [
						E('th', {}, 'Device'), E('th', {}, 'Share'),
						E('th', { 'class': 'st-num' }, 'Download'),
						E('th', { 'class': 'st-num' }, 'Upload'),
						E('th', { 'class': 'st-num' }, 'Total'),
						E('th', {}, 'Wi-Fi'),
						E('th', { 'class': 'st-num' }, 'Now')
					])),
					this.devBody = E('tbody')
				]))
			]),
			E('div', { 'class': 'st-panel', 'style': 'margin-bottom:16px' }, [
				E('div', { 'class': 'st-ptitle' }, [E('span', {}, [icon('calendar', 18), 'Daily usage', E('small', {}, 'last 30 days')]),
					E('span', { 'class': 'st-now' }, [
						E('span', {}, [E('span', { 'class': 'st-dot', 'style': 'background:' + C_DOWN }), 'Download']),
						E('span', {}, [E('span', { 'class': 'st-dot', 'style': 'background:' + C_UP }), 'Upload'])])]),
				E('div', { 'class': 'st-canvas-wrap' }, [this.dayCv, this.dayTip])
			]),
			E('div', { 'class': 'st-panel', 'style': 'margin-top:16px' }, [,
			E('div', { 'class': 'st-ptitle' }, [E('span', {}, [icon('sites', 18), 'Services', this.svcRange = E('small', {}, '')])]),
			E('div', { 'class': 'st-toolbar' }, [
				this.devSel, catSel, sort,
				E('span', { 'class': 'st-search' }, [icon('search', 16), search]),
				E('label', { 'class': 'st-check' }, [groupBox, ' Group related domains']),
				this.btn('refresh', 'Refresh', 'cbi-button-neutral', function() { self.refresh(); }),
				this.btn('trash', 'Reset', 'cbi-button-negative', function() { self.confirmReset(); })
			]),
			E('table', { 'class': 'table st-tbl' }, [
				E('thead', {}, E('tr', { 'class': 'tr table-titles' }, [
					E('th', { 'class': 'th' }, 'Service'),
					E('th', { 'class': 'th' }, 'Share'),
					E('th', { 'class': 'th st-num' }, [icon('download', 14), ' Download']),
					E('th', { 'class': 'th st-num' }, [icon('upload', 14), ' Upload']),
					E('th', { 'class': 'th st-num' }, 'Total')
				])),
				this.tbody
			]),
			this.pager = E('div', { 'class': 'st-pager' })
			]),
			E('div', { 'class': 'st-panel', 'style': 'margin-top:16px' }, [
				E('div', { 'class': 'st-ptitle' }, [E('span', {}, [icon('sites', 18), 'Usage by category']),
					this.catRange = E('span', { 'class': 'st-now' }, '')]),
				this.catBox = E('div', { 'class': 'st-catbox' })
			])
		]);

		this.update();
		poll.add(function() { return self.paused || document.hidden ? null : self.sampleLive(); }, LIVE_STEP);
		poll.add(function() { return self.paused || document.hidden ? null : self.refresh(); }, 9);
		window.requestAnimationFrame(function() { self.drawLive(); self.drawDays(); self.drawCats(); });
		this.sampleLive();
		this.loadOnline();
		return root;
	},

	/* which devices are connected to the router right now (a list of MACs) */
	/* Wi-Fi quality of one device: signal bars, band, signal in dBm and the link rate */
	wifiCell: function(x) {
		var w = this.wifi && x.mac ? this.wifi[String(x.mac).toLowerCase()] : null;
		if (!w) {
			if (!this.online || !x.mac) return '';
			if (this.online[String(x.mac).toLowerCase()]) return E('span', { 'class': 'st-wf-dim' }, 'Wired');
			return E('div', { 'class': 'st-wf', 'title': 'This device is not connected to the router now' }, [
				E('span', { 'class': 'st-sig' }, [1, 2, 3, 4].map(function(i) { return E('i', { 'style': 'height:' + (3 + i * 3) + 'px' }); })),
				E('div', {}, [E('b', { 'style': 'color:var(--st-muted)' }, 'Offline'), E('small', {}, 'Not connected')])]);
		}
		var d = w.s, n = d == null ? 0 : d >= -55 ? 4 : d >= -65 ? 3 : d >= -72 ? 2 : 1;
		var col = n >= 3 ? '#22c55e' : n === 2 ? '#f59e0b' : '#ef4444';
		var bars = E('span', { 'class': 'st-sig' }, [1, 2, 3, 4].map(function(i) { return E('i', { 'style': 'height:' + (3 + i * 3) + 'px;' + (i <= n ? 'background:' + col : '') }); }));
		var rate = function(v) { return v == null ? '-' : Math.round(v) + ' Mbit/s'; };
		return E('div', { 'class': 'st-wf', 'title': 'Signal ' + (d == null ? 'unknown' : d + ' dBm') + (w.snr != null ? ', SNR ' + w.snr + ' dB' : '') + '\nRouter to device ' + rate(w.tx) + '\nDevice to router ' + rate(w.rx) }, [
			bars, E('div', {}, [E('b', {}, w.b + ' GHz'), E('small', {}, (d == null ? '' : d + ' dBm \u00b7 ') + rate(w.tx))])]);
	},

	loadOnline: function() {
		var self = this;
		return fs.exec_direct('/usr/bin/odash', ['online'], 'json').then(function(l) {
			var on = l && Array.isArray(l.on) ? l.on : (Array.isArray(l) ? l : null);
			self.online = on ? on.reduce(function(m, x) { m[x] = 1; return m; }, {}) : null;
			self.wifi = l && l.wifi ? l.wifi : {};
			self.fillDevices();
		}).catch(function() { self.online = null; });
	},

	refresh: function() {
		var self = this;
		this.loadOnline();
		return this.fetchRange().then(function(d) {
			self.state.data = d;
			self.update();
			self.drawDays();
			self.drawCats();
		});
	},

	/* ---------- devices ---------- */

	devInfo: function() {
		var by = {};
		[(this.state.devData || {}).devices, (this.state.data || {}).devices].forEach(function(l) {
			(l || []).forEach(function(x) { by[x.id || x.ip] = x; });
		});
		return by;
	},

	label: function(id) {
		if (id === '-') return 'Older data (no device)';
		var dv = this.devInfo()[id], addr = (dv && dv.ip) || id;
		return dv && dv.name ? dv.name : addr;
	},

	devIcon: function(id, size) {
		var dv = this.devInfo()[id];
		return icon((dv && dv.type) || 'other', size || 16);
	},

	/* ---------- live ---------- */

	sampleLive: function() {
		var self = this;
		return fs.exec_direct('/usr/bin/odash', ['rates'], 'json').then(function(r) {
			var L = self.live, pts = (r && r.pts) || [];
			L.now = r.now || (pts.length ? pts[pts.length - 1].t : 0);
			L.pts = pts.map(function(p) { return { at: p.t, up: p.up, down: p.down, cl: p.cl || {} }; });
			var last = L.pts[L.pts.length - 1];
			/* only treat the newest sample as "now" if it is fresh */
			L.fresh = !!last && L.now - last.at <= LIVE_STEP * 4;
			L.siteRate = L.fresh ? (pts[pts.length - 1].st || {}) : {};
			self.setPill(!!r.running && L.fresh);
			self.drawLive();
			self.drawActive();
			self.fillDevices();
		}).catch(function() { self.setPill(false); });
	},

	setPill: function(on) {
		dom.content(this.pill, [E('span', { 'class': 'st-pulse' + (on ? '' : ' off') }), on ? 'Live' : 'Not running']);
	},

	livePts: function() {
		var dev = this.state.device;
		return this.live.pts.map(function(p) {
			if (!dev) return p;
			var v = p.cl[dev] || [0, 0];
			return { at: p.at, up: v[0], down: v[1] };
		});
	},

	/* the devices that are connected right now (Overview) */
	drawOnline: function(devs, isOn, last) {
		var self = this;
		if (!this.onlineBox) return;
		if (!devs) { var d = this.state.devData || this.state.data || {}; devs = d.devices || []; }
		if (!isOn) {
			var on0 = this.online;
			isOn = function(x) { var id = x.id || x.ip; return !!((x.mac && on0 && on0[String(x.mac).toLowerCase()]) || (last && last.cl[id])); };
		}
		if (last === undefined) last = this.live.fresh ? this.live.pts[this.live.pts.length - 1] : null;
		var list = devs.filter(function(x) { return (x.id || x.ip) !== '-' && isOn(x); });
		var items = list.map(function(x) {
			var id = x.id || x.ip, now = last && last.cl[id];
			return E('div', { 'class': 'st-onl' }, [
				E('span', { 'class': 'st-devicon' }, self.devIcon(id, 20)),
				E('div', { 'class': 'st-onlt' }, [E('b', {}, self.label(id)), E('small', {}, x.ip || '')]),
				now ? E('span', { 'class': 'st-live' }, ['\u2193 ' + fmtRate(now[1]), E('br'), '\u2191 ' + fmtRate(now[0])]) : E('span', { 'class': 'st-live off' }, 'idle')]);
		});
		dom.content(this.onlineBox, [
			E('div', { 'class': 'st-ptitle' }, [E('span', {}, [icon('laptop', 18), 'Online devices', E('small', {}, String(list.length))])]),
			items.length ? E('div', { 'class': 'st-onlg' }, items) : E('div', { 'class': 'st-empty' }, 'No device is connected right now.')]);
	},

	drawLive: function() {
		if (!this.liveCv || !this.liveCv.isConnected) return;
		var pts = this.livePts();
		this.liveGeo = drawLive(this.liveCv, pts, this.live.now);
		var last = (this.live.fresh && pts[pts.length - 1]) || { up: 0, down: 0 };
		this.liveTitle.textContent = this.state.device ? this.label(this.state.device) : 'all devices';
		dom.content(this.liveNow, [
			E('span', {}, [E('span', { 'class': 'st-dot', 'style': 'background:' + C_DOWN }), E('b', {}, fmtRate(last.down))]),
			E('span', {}, [E('span', { 'class': 'st-dot', 'style': 'background:' + C_UP }), E('b', {}, fmtRate(last.up))])
		]);
	},

	liveHover: function(ev) {
		var g = this.liveGeo, pts = this.livePts(), now = this.live.now;
		if (!g || pts.length < 2) return;
		var rect = this.liveCv.getBoundingClientRect(), x = ev.clientX - rect.left;
		var t = now - (1 - (x - g.pad.l) / g.W) * LIVE_WINDOW, best = null;
		pts.forEach(function(p) { if (!best || Math.abs(p.at - t) < Math.abs(best.at - t)) best = p; });
		if (!best || Math.abs(best.at - t) > LIVE_STEP * 2) { this.liveTip.style.display = 'none'; return; }
		var ago = now - best.at, lab = ago < 2 ? 'now' : ago < 60 ? ago + ' s ago' : Math.floor(ago / 60) + ' min ' + (ago % 60) + ' s ago';
		this.tip(this.liveTip, x, [lab, '↓ ' + fmtRate(best.down), '↑ ' + fmtRate(best.up)]);
	},

	tip: function(el, x, lines) {
		dom.content(el, lines.map(function(l, i) { return E('div', { 'style': i ? '' : 'opacity:.7' }, l); }));
		el.style.display = 'block';
		var w = el.offsetWidth, max = el.parentNode.clientWidth;
		el.style.left = Math.max(0, Math.min(max - w, x + 12)) + 'px';
		el.style.top = '8px';
	},

	fillDevices: function() {
		var self = this, s = this.state, d = s.devData || s.data || {};
		if (!this.devBody) return;
		var devs = (d.devices || []).slice().sort(function(a, b) { return b.total - a.total; });
		var total = devs.reduce(function(m, x) { return m + x.total; }, 0) || 1;
		var last = this.live.fresh ? this.live.pts[this.live.pts.length - 1] : null;
		this.devRange.textContent = RANGE_TXT[s.devDays];
		if (!devs.length) {
			this.drawOnline([], function() { return false; }, last);
			dom.content(this.devBody, E('tr', {}, E('td', { 'colspan': 7 }, E('div', { 'class': 'st-empty' }, 'No device traffic recorded yet.'))));
			return;
		}
		var on = this.online, isOn = function(x) {
			var id = x.id || x.ip;
			return !!((x.mac && on && on[String(x.mac).toLowerCase()]) || (last && last.cl[id]));
		};
		var rowOf = function(x) {
			var id = x.id || x.ip, older = id === '-';
			var now = last && last.cl[id];
			var parts = older ? ['before devices were tracked'] : [x.ip, x.mac ? x.mac.toUpperCase() : ''].filter(function(v) { return v && v !== self.label(id); });
			var sub = parts.length > 1 ? [parts[0], E('span', { 'class': 'st-mac' }, ' \u00b7 ' + parts[1])] : (parts[0] || '');
			return E('tr', { 'class': (s.device === id ? 'st-sel ' : '') + (older ? '' : 'st-click'),
				'click': older ? null : function() {
					s.device = s.device === id ? '' : id; s.open = {};
					self.update(); self.drawLive();
				} }, [
				E('td', {}, E('div', { 'class': 'st-dname' }, [
					E('span', { 'class': 'st-devicon' }, older ? icon('calendar', 18) : self.devIcon(id, 18)),
					E('div', {}, [E('b', {}, self.label(id)), E('small', {}, sub)])
				])),
				E('td', { 'style': 'width:24%' }, [bar(x, devs[0].total || 1),
					E('small', { 'style': 'color:var(--st-muted)' }, (x.total / total * 100).toFixed(1) + '%')]),
				E('td', { 'class': 'st-num' }, [E('span', { 'class': 'st-ar', 'style': 'color:' + C_DOWN }, '\u2193'), fmt(x.down)]),
				E('td', { 'class': 'st-num' }, [E('span', { 'class': 'st-ar', 'style': 'color:' + C_UP }, '\u2191'), fmt(x.up)]),
				E('td', { 'class': 'st-num' }, E('b', {}, fmt(x.total))),
				E('td', {}, older ? '' : self.wifiCell(x)),
				E('td', { 'class': 'st-num' }, older ? '' : now
					? E('span', { 'class': 'st-live' }, ['\u2193 ' + fmtRate(now[1]), E('br'), '\u2191 ' + fmtRate(now[0])])
					: E('span', { 'class': 'st-live off' }, 'idle'))
			]);
		};
		this.drawOnline(devs, isOn, last);
		if (!on) { dom.content(this.devBody, devs.map(rowOf)); return; }
		var yes = devs.filter(isOn), no = devs.filter(function(x) { return !isOn(x); }), out = [];
		var grp = function(label, n, color) {
			return E('tr', { 'class': 'st-grp' + (color === '#9ca3af' ? ' st-off' : '') }, E('td', { 'colspan': 7 }, [E('span', { 'class': 'st-dot', 'style': 'background:' + color }), label, E('small', {}, ' ' + n)]));
		};
		if (yes.length) out.push(grp('Connected', yes.length, '#22c55e')), yes.forEach(function(x) { out.push(rowOf(x)); });
		if (no.length) out.push(grp('Not connected', no.length, '#9ca3af')), no.forEach(function(x) { out.push(rowOf(x)); });
		dom.content(this.devBody, out);
	},

	drawActive: function() {
		var self = this, L = this.live, last = L.fresh ? L.pts[L.pts.length - 1] : null;
		var row = function(iconNode, name, u, d, max) {
			return E('div', { 'class': 'st-li' }, [iconNode,
				E('div', { 'style': 'min-width:0' }, [E('div', { 'class': 'st-nm' }, name), bar({ up: u, down: d }, max, 'st-mini')]),
				E('div', { 'class': 'st-rt' }, ['↓ ' + fmtRate(d), E('br'), '↑ ' + fmtRate(u)])]);
		};

		var parentOf = {};
		((this.state.data || {}).sites || []).forEach(function(x) { parentOf[x.site] = x.parent || x.site; });
		var agg = {};
		Object.keys(L.siteRate).forEach(function(k) {
			var p = parentOf[k] || k, a = agg[p] || (agg[p] = { k: p, u: 0, d: 0 });
			a.u += L.siteRate[k][0]; a.d += L.siteRate[k][1];
		});
		var sites = Object.keys(agg).map(function(k) { return agg[k]; }).sort(function(a, b) { return (b.u + b.d) - (a.u + a.d); });
		var smax = sites.length ? sites[0].u + sites[0].d : 1;
		dom.content(this.activeSite, sites.length ? sites.slice(0, 5).map(function(x) {
			return row(siteIcon(x.k), x.k, x.u, x.d, smax);
		}) : E('div', { 'class': 'st-empty' }, L.pts.length ? 'No traffic right now' : 'Measuring…'));
	},

	/* ---------- daily ---------- */

	dayList: function() {
		var src = ((this.state.data || {}).daily30) || [], by = {}, out = [];
		src.forEach(function(r) { by[r[0]] = r; });
		for (var i = 29; i >= 0; i--) {
			var dt = new Date(Date.now() - i * 86400000);
			var k = dt.getFullYear() + '-' + ('0' + (dt.getMonth() + 1)).slice(-2) + '-' + ('0' + dt.getDate()).slice(-2);
			out.push({ date: k, up: by[k] ? by[k][1] : 0, down: by[k] ? by[k][2] : 0 });
		}
		return out;
	},

	drawCats: function(fetch) {
		var self = this;
		if (!this.catBox || !this.catBox.isConnected) return;
		var k = this.rkey(this.state.catDays), d = this.cache[k];
		if (!d || fetch === true) {
			if (d) this.paintCats(d);
			return this.getRange(this.state.catDays).then(function(r) { self.paintCats(r); }).catch(function() {});
		}
		this.paintCats(d);
	},

	paintCats: function(d) {
		var self = this, sites = (d && d.sites) || [], by = {}, total = 0;
		var kids = {};
		sites.forEach(function(x) { var p = x.parent || x.site; (kids[p] = kids[p] || []).push(x); });
		Object.keys(kids).forEach(function(p) {
			var g = { site: p, kids: kids[p] }, c = catOfGroup(g), id = c ? c.id : '_other';
			var t = kids[p].reduce(function(m, x) { return m + x.total; }, 0);
			by[id] = (by[id] || 0) + t; total += t;
		});
		var items = Object.keys(by).map(function(id) {
			var c = CATS.filter(function(x) { return x.id === id; })[0];
			return { id: id, label: c ? c.label : 'Other', rgb: c ? c.rgb : '148,163,184', v: by[id] };
		}).sort(function(a, b) { return b.v - a.v; });
		if (!total) { dom.content(this.catBox, E('div', { 'class': 'st-empty' }, 'No traffic recorded for this period yet.')); return; }
		var cv = E('canvas', { 'class': 'st-catcv' });
		var R = 80, W = 200, ctx0 = null;
		var legend = E('div', { 'class': 'st-catleg' }, items.map(function(it) {
			return E('div', { 'class': 'st-catrow', 'click': function() { self.state.cat = it.id; self.update(); } }, [
				E('span', { 'class': 'st-dot', 'style': 'background:rgb(' + it.rgb + ')' }), E('span', { 'class': 'st-catnm' }, it.label),
				E('b', {}, (it.v / total * 100).toFixed(1) + '%'), E('small', {}, fmt(it.v))]);
		}));
		dom.content(this.catBox, [cv, legend]);
		var r = window.devicePixelRatio || 1;
		cv.style.width = W + 'px'; cv.style.height = W + 'px'; cv.width = W * r; cv.height = W * r;
		var ctx = cv.getContext('2d'); ctx.setTransform(r, 0, 0, r, 0, 0);
		var a0 = -Math.PI / 2;
		items.forEach(function(it) {
			var a1 = a0 + it.v / total * Math.PI * 2;
			ctx.beginPath(); ctx.arc(W / 2, W / 2, R, a0, a1); ctx.arc(W / 2, W / 2, R * 0.6, a1, a0, true); ctx.closePath();
			ctx.fillStyle = 'rgb(' + it.rgb + ')'; ctx.fill();
			a0 = a1;
		});
		ctx.fillStyle = getComputedStyle(cv).color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
		ctx.font = 'bold 15px sans-serif'; ctx.fillText(fmt(total), W / 2, W / 2 - 6);
		ctx.globalAlpha = 0.6; ctx.font = '11px sans-serif'; ctx.fillText(RANGE_TXT[this.state.catDays], W / 2, W / 2 + 12); ctx.globalAlpha = 1;
	},

	drawDays: function() {
		if (!this.dayCv || !this.dayCv.isConnected) return;
		this.dayGeo = drawDaily(this.dayCv, this.dayList());
	},

	dayHover: function(ev) {
		var g = this.dayGeo, days = this.dayList();
		if (!g) return;
		var rect = this.dayCv.getBoundingClientRect(), x = ev.clientX - rect.left;
		var i = Math.floor((x - g.pad.l) / g.slot);
		if (i < 0 || i >= days.length) { this.dayTip.style.display = 'none'; return; }
		var d = days[i];
		this.tip(this.dayTip, x, [d.date, '↓ ' + fmt(d.down), '↑ ' + fmt(d.up), 'Total ' + fmt(d.up + d.down)]);
	},

	/* ---------- table ---------- */

	update: function() {
		var self = this, s = this.state, d = s.data || {};

		if (d.error) {
			dom.content(this.notice, E('div', { 'class': 'st-notice' }, [icon('alert'), 'Could not read statistics: ' + d.error]));
			dom.content(this.tbody, []);
			return;
		}
		dom.content(this.notice, d.running === false ? E('div', { 'class': 'st-notice' }, [icon('alert'),
			'The odash service is not running. Start it with: /etc/init.d/odash start']) : []);

		var devs = d.devices || [];
		var want = devs.slice().sort(function(a, b) { return b.total - a.total; });
		var sig = want.map(function(x) { return (x.id || x.ip) + '|' + x.name; }).join(',');
		if (this.devSig !== sig) {
			this.devSig = sig;
			dom.content(this.devSel, [E('option', { 'value': '' }, 'All devices')].concat(want.map(function(x) {
				var id = x.id || x.ip;
				return E('option', { 'value': id }, self.label(id) + (x.ip && x.ip !== self.label(id) ? '  (' + x.ip + ')' : ''));
			})));
		}
		if (s.device && !devs.some(function(x) { return (x.id || x.ip) === s.device; })) s.device = '';
		this.devSel.value = s.device;
		this.fillDevices();

		var pairs = d.pairs || [];
		/* site -> { device -> {up, down} } */
		var bySite = {};
		pairs.forEach(function(p) {
			var m = bySite[p[1]] || (bySite[p[1]] = {});
			var a = m[p[0]] || (m[p[0]] = { up: 0, down: 0 });
			a.up += p[2]; a.down += p[3];
		});

		var list, t;
		if (s.device) {
			var agg = {};
			pairs.forEach(function(p) {
				if (p[0] !== s.device) return;
				var a = agg[p[1]] || (agg[p[1]] = { site: p[1], up: 0, down: 0 });
				a.up += p[2]; a.down += p[3];
			});
			list = Object.keys(agg).map(function(k) { agg[k].total = agg[k].up + agg[k].down; return agg[k]; });
			t = list.reduce(function(m, r) { m.up += r.up; m.down += r.down; m.total += r.total; return m; }, { up: 0, down: 0, total: 0 });
			t.sites = list.length;
		} else {
			list = d.sites || [];
			t = d.totals || { up: 0, down: 0, total: 0, sites: 0 };
		}
		var rangeTxt = RANGE_TXT[s.days];
		this.svcRange.textContent = rangeTxt;
		if (this.catRange) this.catRange.textContent = rangeTxt;
		setBytes(this.vals.down, t.down); this.subs.down.textContent = rangeTxt;
		setBytes(this.vals.up, t.up); this.subs.up.textContent = rangeTxt;
		setBytes(this.vals.total, t.total); this.subs.total.textContent = rangeTxt + (s.device ? ' \u00b7 ' + this.label(s.device) : '');
		var realDevs = devs.filter(function(x) { return (x.id || x.ip) !== '-'; }).length;
		this.vals.devices.textContent = s.device ? 1 : realDevs; this.subs.devices.textContent = 'with traffic';

		var parentOf = {};
		(d.sites || []).forEach(function(x) { parentOf[x.site] = x.parent || x.site; });

		var q = s.query, groups = {};
		list.forEach(function(r) {
			var key = s.group ? (parentOf[r.site] || r.site) : r.site;
			var g = groups[key] || (groups[key] = { site: key, up: 0, down: 0, total: 0, kids: [] });
			g.up += r.up; g.down += r.down; g.total += r.total;
			g.kids.push(r);
		});
		var rows = Object.keys(groups).map(function(k) { return groups[k]; }).filter(function(g) {
			return !q || g.site.toLowerCase().indexOf(q) >= 0 || g.kids.some(function(k) { return k.site.toLowerCase().indexOf(q) >= 0; });
		});
		if (s.cat) rows = rows.filter(function(g) {
			var c = catOfGroup(g);
			return s.cat === '_other' ? !c : (c && c.id === s.cat);
		});
		rows.sort(function(a, b) { return b[s.sort] - a[s.sort]; });
		var max = rows.reduce(function(m, r) { return Math.max(m, r.total); }, 1);

		/* devices of a group: sum over all its domains */
		var devicesOf = function(g) {
			var agg = {};
			g.kids.forEach(function(k) {
				var m = bySite[k.site] || {};
				Object.keys(m).forEach(function(id) {
					var a = agg[id] || (agg[id] = { id: id, up: 0, down: 0 });
					a.up += m[id].up; a.down += m[id].down;
				});
			});
			return Object.keys(agg).map(function(k) { agg[k].total = agg[k].up + agg[k].down; return agg[k]; })
				.sort(function(a, b) { return b.total - a.total; });
		};

		var PAGE = s.size || 25, sig = [s.days, s.device, s.sort, s.query, s.group, s.cat].join('|');
		if (sig !== s.sig) { s.sig = sig; s.page = 0; }
		var pages = Math.max(1, Math.ceil(rows.length / PAGE));
		if (s.page >= pages) s.page = pages - 1;
		var from = s.page * PAGE;

		var out = [];
		rows.slice(from, from + PAGE).forEach(function(g) {
			var multi = g.kids.length > 1;
			var gdevs = s.device ? [] : devicesOf(g);
			var expandable = multi || gdevs.length > 0;
			var key = 'g:' + g.site, isOpen = expandable && s.open[key];

			var chips = [], gc = catOfGroup(g);
			if (multi) chips.push(E('span', { 'class': 'st-chip st-chip-dom' }, [icon('world', 12), g.kids.length + ' domains']));
			if (gdevs.length) chips.push(E('span', { 'class': 'st-chip st-chip-dev' }, [icon('laptop', 12), gdevs.length + (gdevs.length > 1 ? ' devices' : ' device')]));

			out.push(E('tr', { 'class': 'tr' + (expandable ? ' st-click' : ''),
				'click': expandable ? function() { s.open[key] = !s.open[key]; self.update(); } : null }, [
				E('td', { 'class': 'td' }, E('span', { 'class': 'st-site' }, [
					expandable ? E('span', { 'class': 'st-chev' + (isOpen ? ' st-open' : '') }, icon('chevron', 14)) : E('span', { 'class': 'st-chev-pad' }),
					siteIcon(g.site), E('span', {}, g.site)].concat(chips))),
				E('td', { 'class': 'td', 'style': 'width:26%' }, bar(g, max)),
				E('td', { 'class': 'td st-num' }, fmt(g.down)),
				E('td', { 'class': 'td st-num' }, fmt(g.up)),
				E('td', { 'class': 'td st-num' }, E('b', {}, fmt(g.total)))
			]));
			if (isOpen) out.push(self.detail(g, multi, gdevs));
		});
		if (!out.length)
			out.push(E('tr', { 'class': 'tr' }, E('td', { 'class': 'td', 'colspan': 5 }, E('div', { 'class': 'st-empty' }, 'No traffic recorded for this selection yet.'))));
		dom.content(this.tbody, out);
		this.drawPager(rows.length, pages, from, PAGE);
	},

	drawPager: function(total, pages, from, size) {
		var self = this, s = this.state;
		if (total <= 10) { dom.content(this.pager, ''); return; }
		var go = function(p) { return function() { s.page = p; self.update(); }; };
		var nums = [];
		for (var p = 0; p < pages; p++) {
			if (pages > 7 && p !== 0 && p !== pages - 1 && Math.abs(p - s.page) > 1) {
				if (nums.length && nums[nums.length - 1] !== '…') nums.push('…');
				continue;
			}
			nums.push(p);
		}
		var btns = [E('button', { 'class': 'cbi-button cbi-button-neutral st-btn st-pg', 'disabled': s.page === 0 ? '' : null, 'click': go(s.page - 1) }, '\u2039')];
		nums.forEach(function(p) {
			btns.push(p === '…' ? E('span', {}, '…') :
				E('button', { 'class': 'cbi-button cbi-button-neutral st-btn st-pg' + (p === s.page ? ' st-cur' : ''), 'click': go(p) }, String(p + 1)));
		});
		btns.push(E('button', { 'class': 'cbi-button cbi-button-neutral st-btn st-pg', 'disabled': s.page === pages - 1 ? '' : null, 'click': go(s.page + 1) }, '\u203a'));
		var sel = E('select', { 'class': 'cbi-input-select st-size', 'change': function(ev) {
			s.size = parseInt(ev.target.value, 10) || 25; s.page = 0;
			try { window.localStorage.setItem('odash.pageSize', String(s.size)); } catch (e) {}
			self.update();
		} }, [10, 25, 50, 100].map(function(n) {
			return E('option', { 'value': String(n), 'selected': n === s.size ? '' : null }, String(n));
		}));
		dom.content(this.pager, [
			E('span', { 'class': 'st-empty', 'style': 'padding:0' }, 'Showing ' + (from + 1) + '\u2013' + Math.min(from + size, total) + ' of ' + total + ' services'),
			E('div', { 'class': 'st-pages' }, [E('span', { 'class': 'st-empty', 'style': 'padding:0 4px' }, 'Per page'), sel].concat(pages > 1 ? btns : []))
		]);
	},

	/* expanded service: domains and devices side by side, never mixed */
	detail: function(g, multi, gdevs) {
		var self = this;
		var item = function(nameNodes, r, scale) {
			return E('div', { 'class': 'st-drow' }, [
				E('div', { 'class': 'st-nm' }, nameNodes),
				bar(r, scale),
				E('div', { 'class': 'st-val' }, [fmt(r.total), E('small', {}, '↓ ' + fmt(r.down) + '  ↑ ' + fmt(r.up))])
			]);
		};
		var cards = [];
		if (multi) {
			var kids = g.kids.slice().sort(function(a, b) { return b.total - a.total; });
			cards.push(E('div', { 'class': 'st-dcard' }, [
				E('div', { 'class': 'st-dhead' }, [icon('world', 16), 'Domains', E('span', { 'class': 'st-count' }, kids.length + ' of ' + g.site)]),
				E('div', {}, kids.map(function(k) { return item([siteIcon(k.site), E('span', {}, k.site)], k, g.total); }))
			]));
		}
		if (gdevs.length) {
			cards.push(E('div', { 'class': 'st-dcard' }, [
				E('div', { 'class': 'st-dhead' }, [icon('laptop', 16), 'Devices', E('span', { 'class': 'st-count' }, 'that used ' + g.site)]),
				E('div', {}, gdevs.map(function(x) {
					var dv = self.devInfo()[x.id], ip = dv && dv.ip && dv.ip !== self.label(x.id) ? dv.ip : '';
					return item([self.devIcon(x.id), E('span', {}, self.label(x.id)), ip ? E('small', { 'style': 'opacity:.6' }, ip) : ''], x, g.total);
				}))
			]));
		}
		return E('tr', { 'class': 'tr st-detail' }, E('td', { 'class': 'td', 'colspan': 5 }, E('div', { 'class': 'st-dgrid' }, cards)));
	},

	confirmReset: function() {
		var self = this;
		ui.showModal('Reset statistics', [
			E('p', {}, 'This clears all collected per-site statistics. Continue?'),
			E('div', { 'class': 'right' }, [
				E('button', { 'class': 'btn', 'click': ui.hideModal }, 'Cancel'), ' ',
				E('button', { 'class': 'btn cbi-button-negative', 'click': function() {
					fs.exec_direct('/usr/bin/odash', ['reset']).then(function() {
						ui.hideModal();
						return self.refresh();
					});
				} }, 'Reset')
			])
		]);
	},


	handleSaveApply: null,
	handleReset: null
});
