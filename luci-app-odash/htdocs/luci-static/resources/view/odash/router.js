'use strict';
'require view';
'require dom';
'require fs';
'require ui';
'require poll';
'require rpc';
'require view.odash.devices as DevicesView';
'require view.odash.overview as UsageView';
'require view.odash.settings as SettingsView';

/* oDash > Control Center: router information, live charts, network tools and settings.
 * Everything goes through "odash router-*" so the ACL stays minimal.
 * Icons: Tabler Icons (MIT), outline set. */
var NS = 'http://www.w3.org/2000/svg';
var ICONS = {
	computer: ['M3 5a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1v-10z', 'M7 20h10', 'M9 16v4', 'M15 16v4'],
	router: ['M3 15a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v4a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z', 'M17 17l0 .01', 'M13 17l0 .01', 'M15 13l0 -2', 'M11.75 8.75a4 4 0 0 1 6.5 0', 'M8.5 6.5a8 8 0 0 1 13 0'],
	wifi: ['M12 18l.01 0', 'M9.172 15.172a4 4 0 0 1 5.656 0', 'M6.343 12.343a8 8 0 0 1 11.314 0', 'M3.515 9.515c4.686 -4.687 12.284 -4.687 16.97 0'],
	clock: ['M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0', 'M12 7v5l3 3'],
	laptop: ['M3 19l18 0', 'M5 7a1 1 0 0 1 1 -1h12a1 1 0 0 1 1 1v8a1 1 0 0 1 -1 1h-12a1 1 0 0 1 -1 -1z'],
	shield: ['M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1 -8.5 15a12 12 0 0 1 -8.5 -15a12 12 0 0 0 8.5 -3'],
	power: ['M7 6a7.75 7.75 0 1 0 10 0', 'M12 4l0 8'],
	plug: ['M9.785 6l8.215 8.215l-2.054 2.054a5.81 5.81 0 1 1 -8.215 -8.215l2.054 -2.054z', 'M4 20l3.5 -3.5', 'M15 4l-3.5 3.5', 'M20 9l-3.5 3.5'],
	cpu: ['M5 5m0 1a1 1 0 0 1 1 -1h12a1 1 0 0 1 1 1v12a1 1 0 0 1 -1 1h-12a1 1 0 0 1 -1 -1z', 'M9 9h6v6h-6z', 'M3 10h2', 'M3 14h2', 'M19 10h2', 'M19 14h2', 'M10 3v2', 'M14 3v2', 'M10 19v2', 'M14 19v2'],
	gear: ['M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z', 'M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0'],
	trash: ['M4 7l16 0', 'M10 11l0 6', 'M14 11l0 6', 'M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12', 'M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3'],
	plus: ['M12 5l0 14', 'M5 12l14 0'],
	pencil: ['M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4', 'M13.5 6.5l4 4'],
	activity: ['M3 12h4l3 8l4 -16l3 8h4'],
	temp: ['M10 13.5a4 4 0 1 0 4 0v-8.5a2 2 0 0 0 -4 0v8.5', 'M10 9l4 0'],
	bulb: ['M3 12h1m8 -9v1m8 8h1m-15.4 -6.4l.7 .7m12.1 -.7l-.7 .7', 'M9 16a5 5 0 1 1 6 0a3.5 3.5 0 0 0 -1 3a2 2 0 0 1 -4 0a3.5 3.5 0 0 0 -1 -3', 'M9.7 17l4.6 0'],
	bolt: ['M13 3l0 7l6 0l-8 11l0 -7l-6 0l8 -11'],
	folder: ['M5 4h4l3 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2'],
	world: ['M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0', 'M3.6 9h16.8', 'M3.6 15h16.8', 'M11.5 3a17 17 0 0 0 0 18', 'M12.5 3a17 17 0 0 1 0 18'],
	lock: ['M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2z', 'M11 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0', 'M8 11v-4a4 4 0 1 1 8 0v4'],
	download: ['M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2', 'M7 11l5 5l5 -5', 'M12 4l0 12'],
	search: ['M3 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0', 'M21 21l-6 -6'],
	network: ['M6 9a6 6 0 1 0 12 0a6 6 0 0 0 -12 0', 'M12 3c1.333 .333 2 2.333 2 6s-.667 5.667 -2 6', 'M12 3c-1.333 .333 -2 2.333 -2 6s.667 5.667 2 6', 'M6 9h12', 'M12 15v3', 'M7 21h10']
};
/* LuCI's E() prints a null child as the word "null": drop empty children first */
var E = (function(base) {
	var clean = function(c) { return Array.isArray(c) ? c.filter(function(x) { return x != null && x !== false; }).map(clean) : c; };
	return function(tag, attrs, children) { return base(tag, Array.isArray(attrs) ? clean(attrs) : attrs, children == null ? children : clean(children)); };
})(typeof window.E === 'function' ? window.E : function() { return L.dom.create.apply(L.dom, arguments); });

/* same null-dropping for dom.content() children */
function dcontent(node, c) {
	var clean = function(x) { return Array.isArray(x) ? x.filter(function(y) { return y != null && y !== false; }).map(clean) : x; };
	return dom.content(node, clean(c));
}

function icon(name, size) {
	var svg = document.createElementNS(NS, 'svg');
	svg.setAttribute('width', size || 18); svg.setAttribute('height', size || 18);
	svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('fill', 'none');
	svg.setAttribute('stroke', 'currentColor'); svg.setAttribute('stroke-width', '2');
	svg.setAttribute('stroke-linecap', 'round'); svg.setAttribute('stroke-linejoin', 'round');
	svg.setAttribute('aria-hidden', 'true');
	(ICONS[name] || ICONS.router).forEach(function(d) {
		var p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); svg.appendChild(p);
	});
	return svg;
}

var setPassword = rpc.declare({ object: 'luci', method: 'setPassword', params: ['username', 'password'], expect: { result: false } });

/* common zones with their POSIX strings (what OpenWrt stores) */
var ZONES = [
	['Asia/Tehran', '<+0330>-3:30'],
	['Europe/Istanbul', '<+03>-3'],
	['UTC', 'UTC0'],
	['Asia/Dubai', '<+04>-4'],
	['Asia/Baghdad', '<+03>-3'],
	['Asia/Kabul', '<+0430>-4:30'],
	['Asia/Karachi', 'PKT-5'],
	['Asia/Kolkata', 'IST-5:30'],
	['Asia/Tashkent', '<+05>-5'],
	['Asia/Baku', '<+04>-4'],
	['Asia/Yerevan', '<+04>-4'],
	['Asia/Tbilisi', '<+04>-4'],
	['Asia/Riyadh', '<+03>-3'],
	['Asia/Kuwait', '<+03>-3'],
	['Asia/Qatar', '<+03>-3'],
	['Asia/Beirut', 'EET-2EEST,M3.5.0/0,M10.5.0/0'],
	['Asia/Jerusalem', 'IST-2IDT,M3.4.4/26,M10.5.0'],
	['Asia/Dhaka', '<+06>-6'],
	['Asia/Bangkok', '<+07>-7'],
	['Asia/Jakarta', 'WIB-7'],
	['Asia/Shanghai', 'CST-8'],
	['Asia/Hong_Kong', 'HKT-8'],
	['Asia/Singapore', '<+08>-8'],
	['Asia/Tokyo', 'JST-9'],
	['Asia/Seoul', 'KST-9'],
	['Australia/Sydney', 'AEST-10AEDT,M10.1.0,M4.1.0/3'],
	['Pacific/Auckland', 'NZST-12NZDT,M9.5.0,M4.1.0/3'],
	['Europe/London', 'GMT0BST,M3.5.0/1,M10.5.0'],
	['Europe/Dublin', 'GMT0IST,M3.5.0/1,M10.5.0'],
	['Europe/Lisbon', 'WET0WEST,M3.5.0/1,M10.5.0'],
	['Europe/Paris', 'CET-1CEST,M3.5.0,M10.5.0/3'],
	['Europe/Berlin', 'CET-1CEST,M3.5.0,M10.5.0/3'],
	['Europe/Rome', 'CET-1CEST,M3.5.0,M10.5.0/3'],
	['Europe/Madrid', 'CET-1CEST,M3.5.0,M10.5.0/3'],
	['Europe/Amsterdam', 'CET-1CEST,M3.5.0,M10.5.0/3'],
	['Europe/Brussels', 'CET-1CEST,M3.5.0,M10.5.0/3'],
	['Europe/Vienna', 'CET-1CEST,M3.5.0,M10.5.0/3'],
	['Europe/Zurich', 'CET-1CEST,M3.5.0,M10.5.0/3'],
	['Europe/Stockholm', 'CET-1CEST,M3.5.0,M10.5.0/3'],
	['Europe/Warsaw', 'CET-1CEST,M3.5.0,M10.5.0/3'],
	['Europe/Athens', 'EET-2EEST,M3.5.0/3,M10.5.0/4'],
	['Europe/Kyiv', 'EET-2EEST,M3.5.0/3,M10.5.0/4'],
	['Europe/Moscow', 'MSK-3'],
	['Africa/Cairo', 'EET-2EEST,M4.5.5/0,M10.5.4/24'],
	['Africa/Lagos', 'WAT-1'],
	['Africa/Johannesburg', 'SAST-2'],
	['Africa/Nairobi', 'EAT-3'],
	['America/New_York', 'EST5EDT,M3.2.0,M11.1.0'],
	['America/Chicago', 'CST6CDT,M3.2.0,M11.1.0'],
	['America/Denver', 'MST7MDT,M3.2.0,M11.1.0'],
	['America/Los_Angeles', 'PST8PDT,M3.2.0,M11.1.0'],
	['America/Anchorage', 'AKST9AKDT,M3.2.0,M11.1.0'],
	['America/Toronto', 'EST5EDT,M3.2.0,M11.1.0'],
	['America/Mexico_City', 'CST6'],
	['America/Sao_Paulo', '<-03>3'],
	['America/Argentina/Buenos_Aires', '<-03>3'],
	['America/Bogota', '<-05>5'],
	['America/Santiago', '<-04>4<-03>,M9.1.6/24,M4.1.6/24'],
	['Pacific/Honolulu', 'HST10'],
	['Atlantic/Reykjavik', 'GMT0']];

var CSS = [
	'.rt-path{display:flex;align-items:center;gap:10px;padding:6px 4px 16px;margin-bottom:12px;border-bottom:1px solid rgba(128,128,128,.2)}',
	'.rt-pn{display:flex;flex-direction:column;align-items:center;text-align:center;gap:2px;min-width:90px}',
	'.rt-pn small{opacity:.65;font-size:12px}',
	'.rt-pl{flex:1;min-width:24px;border-top:2px solid rgba(128,128,128,.35)}',
	'.rt-pr{font-size:12px;line-height:1.5;white-space:nowrap}',
	'ul.tabs{display:none}',
	'.rt-nav{margin:14px 0 14px}.rt-nav a{display:inline-flex !important;align-items:center;gap:5px}',
	'@media (max-width:640px){ul.cbi-tabmenu.rt-nav li.rt-live{position:static !important;margin-left:8px !important;flex:0 0 auto}.rt-nav{overflow-x:auto;white-space:nowrap;display:flex}.rt-nav li{float:none;flex:0 0 auto}}',
	'.rt-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-top:12px}',
	'.rt-cols{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-top:12px;align-items:stretch}',
	'.rt-col{display:flex;flex-direction:column;gap:16px;min-width:0}.rt-col>.rt-card:last-child{flex:1}',
	'@media (max-width:820px){.rt-grid,.rt-cols{grid-template-columns:minmax(0,1fr)}}',
	'.rt-card{border:1px solid rgba(128,128,128,.25);border-radius:12px;padding:16px 18px;background:rgba(128,128,128,.04);min-width:0}',
	'.rt-wide{grid-column:1/-1}.rt-stack>*+*{margin-top:16px}',
	'ul.cbi-tabmenu.rt-nav{position:relative}ul.cbi-tabmenu li.rt-live{position:absolute !important;right:0;top:0;bottom:0;float:none !important;margin:0 !important;border:0 !important;background:transparent !important;padding:0 !important;display:flex;align-items:center}',
	'li.rt-live .st-pill{display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:999px;font-size:12px;border:1px solid rgba(128,128,128,.35);background:rgba(128,128,128,.08);white-space:nowrap}li.rt-live .st-pulse{width:8px;height:8px;border-radius:50%;background:#22c55e;display:inline-block}li.rt-live .st-pulse.off{background:#ef4444}',
	'.rt-grid.rt-grid3{grid-template-columns:repeat(3,minmax(0,1fr))}@media (max-width:1100px){.rt-grid.rt-grid3{grid-template-columns:repeat(2,minmax(0,1fr))}.rt-grid3>.rt-card:nth-child(3){grid-column:1/-1}}@media (max-width:820px){.rt-grid.rt-grid3{grid-template-columns:minmax(0,1fr)}}',
	'.rt-h{display:flex;align-items:center;gap:8px;font-weight:600;font-size:15px;margin:0 0 12px}',
	'.rt-h .rt-sub{font-weight:400;opacity:.65;font-size:12px;margin-left:auto}',
	'.rt-kv{display:grid;grid-template-columns:150px 1fr;gap:6px 12px;font-size:13px}',
	'.rt-kv dt{opacity:.65;margin:0}.rt-kv dd{margin:0;word-break:break-word}',
	'.rt-table .rt-badge{margin-left:8px;padding:0 7px;font-size:11px}.rt-badge{display:inline-flex;align-items:center;gap:5px;padding:1px 9px;border-radius:999px;font-size:12px;font-weight:600}',
	'.rt-on{background:rgba(34,197,94,.18);color:#15803d}.rt-off{background:rgba(128,128,128,.2)}.rt-warn{background:rgba(245,158,11,.2);color:#b45309}.rt-bad{background:rgba(239,68,68,.18);color:#b91c1c}',
	'.rt-bar{height:8px;border-radius:99px;background:rgba(128,128,128,.2);overflow:hidden;margin:6px 0 2px}',
	'.rt-bar>i{display:block;height:100%;background:#3b82f6}',
	'.rt-row{display:flex;gap:10px;align-items:center;flex-wrap:wrap}',
	'.rt-row select{min-width:200px}.rt-row input[type=text],.rt-row input[type=password],.rt-row input[type=time]{min-width:170px}',
	'.rt-btn{display:inline-flex;align-items:center;gap:6px}',
	'.rt-flab{font-size:11px;text-transform:uppercase;letter-spacing:.05em;opacity:.6;margin:2px 0 -2px}.rt-fmodes{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px}@media(max-width:560px){.rt-fmodes{grid-template-columns:repeat(2,minmax(0,1fr))}}.rt-fm{display:flex;flex-direction:column;align-items:center;gap:2px;padding:10px 2px;border:1px solid rgba(128,128,128,.3);background:rgba(128,128,128,.08);color:inherit;border-radius:12px;cursor:pointer;text-align:center;min-width:0}.rt-fm b{font-size:12px;white-space:nowrap}.rt-fm small{font-size:10.5px;opacity:.6;line-height:1.2}.rt-fm svg{color:var(--mc,#3b82f6)}.rt-fm:hover{border-color:var(--mc)}.rt-fm.on{border-color:var(--mc);box-shadow:0 0 0 2px var(--mc) inset;background:linear-gradient(160deg,color-mix(in srgb,var(--mc) 22%,transparent),color-mix(in srgb,var(--mc) 6%,transparent))}.rt-fgrp{border:1px solid rgba(128,128,128,.3);border-radius:12px;padding:10px 12px;background:rgba(128,128,128,.06)}.rt-fgh{font-weight:600;margin-bottom:8px}.rt-fgb{display:flex;flex-wrap:wrap;gap:8px 18px;align-items:center}.rt-ffld{display:inline-flex;align-items:center;gap:8px}.rt-fin{display:inline-flex;align-items:center;gap:4px}',
	'.rt-fstate{opacity:.7}.rt-fstate.ok{color:#16a34a;opacity:1}.rt-fstate.bad{color:#dc2626;opacity:1}.rt-fswl{display:inline-flex;gap:8px;align-items:center;font-weight:600}.rt-fgrp .rt-sub{display:block;margin-top:6px}.rt-fgrp.dim{opacity:.5}.rt-fgrp.dim .rt-fgb{pointer-events:none}.rt-fdet{border-color:rgba(59,130,246,.45);background:rgba(59,130,246,.07)}.rt-fdesc{font-size:13px;margin-bottom:6px}.rt-fscale{position:relative;height:64px;margin:6px 6px 4px}.rt-ftrack{position:absolute;left:0;right:0;top:20px;height:8px;border-radius:99px;background:linear-gradient(90deg,#22c55e,#eab308 60%,#ef4444)}.rt-ftick{position:absolute;top:16px;width:2px;height:16px;margin-left:-1px;background:currentColor;opacity:.7}.rt-ftick.safe{background:#dc2626;opacity:1}.rt-ftl{position:absolute;top:34px;transform:translateX(-50%);font-size:10.5px;white-space:nowrap;opacity:.8}.rt-ftl.safe{color:#dc2626;opacity:1;top:48px}.rt-fpin{position:absolute;top:2px;width:0;height:0;margin-left:-6px;border-left:6px solid transparent;border-right:6px solid transparent;border-top:9px solid #3b82f6;top:9px}.rt-fpin em{position:absolute;bottom:11px;left:-16px;width:32px;text-align:center;font-style:normal;font-size:11px;font-weight:700;color:#3b82f6}',
	'.rt-fhero{display:flex;justify-content:space-between;align-items:center;gap:14px;padding:16px 18px;border-radius:16px;border:1px solid rgba(128,128,128,.25)}.rt-fhero.t0{background:linear-gradient(135deg,rgba(34,197,94,.22),rgba(34,197,94,.05))}.rt-fhero.t1{background:linear-gradient(135deg,rgba(245,158,11,.25),rgba(245,158,11,.05))}.rt-fhero.t2{background:linear-gradient(135deg,rgba(239,68,68,.28),rgba(239,68,68,.06))}.rt-fbignum{font-size:52px;font-weight:800;line-height:1;letter-spacing:-1px}.rt-fbigu{font-size:20px;font-weight:600;opacity:.7;margin-left:4px;vertical-align:top}.rt-fchip{display:inline-block;margin-top:8px;padding:2px 12px;border-radius:99px;font-size:12px;font-weight:700;background:rgba(128,128,128,.22)}.t0 .rt-fchip{background:#22c55e;color:#fff}.t1 .rt-fchip{background:#f59e0b;color:#fff}.t2 .rt-fchip{background:#ef4444;color:#fff}.rt-fhr{display:flex;flex-direction:column;align-items:center;gap:6px}.rt-fdots{display:flex;gap:4px}.rt-fdots i{width:20px;height:6px;border-radius:99px;background:rgba(128,128,128,.35)}.rt-fdots i.on{background:#3b82f6}.rt-fmeters{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.rt-fmh{display:flex;justify-content:space-between;align-items:baseline;gap:4px}.rt-fmh small{opacity:.65;font-size:11px}.rt-fmb{height:6px;border-radius:99px;background:rgba(128,128,128,.25);margin-top:5px;overflow:hidden}.rt-fmb i{display:block;height:100%;width:0;border-radius:99px;background:linear-gradient(90deg,#22c55e,#eab308 60%,#ef4444);background-size:200px 100%}.rt-fdot{display:inline-block;width:8px;height:8px;border-radius:50%;margin:0 4px 0 8px}.rt-fchart{border:1px solid rgba(128,128,128,.25);border-radius:12px;padding:6px 10px 8px;background:rgba(128,128,128,.05)}.rt-fax{display:flex;justify-content:space-between;font-size:10.5px;opacity:.55;margin-top:2px}.rt-fhero .rt-fbig svg{width:76px;height:76px}',
	'.rt-ov2{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(0,1fr);gap:12px;margin-top:12px}@media(max-width:900px){.rt-ov2{grid-template-columns:minmax(0,1fr)}}.rt-cpubody{display:flex;gap:16px;align-items:stretch}.rt-cpuchart{flex:1;min-width:0;margin:0}.rt-cpuside{display:flex;flex-direction:column;justify-content:space-around;gap:10px;min-width:96px;text-align:right}.rt-cpuside small{display:block;opacity:.6;font-size:11px}.rt-cpuv{font-size:30px;font-weight:800;line-height:1.1;color:#14b8a6}.rt-cpuu{font-size:12px;opacity:.7;margin-left:3px}.rt-memrow{display:flex;justify-content:space-around;gap:10px}.rt-gt2{text-align:center}.rt-gt2 .rt-gtt{font-weight:600;margin-bottom:4px}.rt-fmain{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:4px 0 6px}@media(max-width:700px){.rt-fmain{grid-template-columns:repeat(2,minmax(0,1fr))}}.rt-fm2{display:flex;flex-direction:column;gap:2px;padding:8px 12px;border-radius:10px;background:rgba(128,128,128,.08);border:1px solid rgba(128,128,128,.22)}.rt-fm2s{flex-direction:row;align-items:center;gap:10px}.rt-fm2 small{opacity:.6;font-size:11px;display:block}.rt-fm2 b{font-size:17px}.rt-fdlg{display:flex;flex-direction:column;gap:12px;min-width:min(560px,86vw)}.rt-fbanner{padding:8px 12px;border-radius:8px;background:rgba(59,130,246,.12);font-size:13px}.rt-fthh{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px}.rt-fthv{font-size:26px;font-weight:700;color:#3b82f6}.rt-frange{width:100%}',
	'.rt-sysl{display:grid;grid-template-columns:minmax(0,1fr);gap:14px;align-items:start}.rt-sysn{display:flex;flex-wrap:wrap;align-items:center;gap:4px;padding:8px!important;margin:0!important}.rt-sysg{display:none}.rt-sysi+.rt-sysi{margin:0}.rt-sysi{display:inline-flex;align-items:center;gap:8px;width:auto;white-space:nowrap;padding:8px 14px;border:0;background:none;color:inherit;border-radius:9px;cursor:pointer;font:inherit}.rt-sysi:hover{background:rgba(128,128,128,.12)}.rt-sysi.on{background:rgba(59,130,246,.15);color:#3b82f6;font-weight:700}.rt-sys2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;align-items:stretch;margin-bottom:12px}.rt-sys2>*{margin:0!important}.rt-sys3{grid-template-columns:repeat(3,minmax(0,1fr))!important}@media(max-width:900px){.rt-sys3{grid-template-columns:minmax(0,1fr)!important}}.rt-sys2>.rt-sysp{display:flex;flex-direction:column}.rt-sys2>.rt-sysp>*{margin:0!important}.rt-sys2>.rt-sysp>.rt-card{flex:1}@media(max-width:900px){.rt-sys2{grid-template-columns:minmax(0,1fr)}}.rt-sysp{margin-bottom:12px}.rt-sysp>*+*{margin-top:12px}.rt-sysp .rt-card{margin-top:0}.rt-sysp>.rt-card+.rt-card{margin-top:12px}',
	'.rt-sprow{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:12px;align-items:start}@media(max-width:900px){.rt-sprow{grid-template-columns:minmax(0,1fr)}}.rt-sp4{display:flex;gap:20px;align-items:center;flex-wrap:wrap}.rt-sp4 .rt-gwrap{width:230px;max-width:100%;margin:0}.rt-sp4r{flex:1;min-width:220px}.rt-sumbig{font-size:34px;font-weight:800;line-height:1.15;margin-top:2px}.rt-sumbig small{font-size:13px;font-weight:600;opacity:.7}.rt-rail{display:flex;gap:10px;align-items:center;padding:9px 0;border-top:1px solid rgba(128,128,128,.2)}.rt-rail:first-child{border-top:0}',
	'.rt-chkt td{vertical-align:middle;padding:9px 10px}.rt-chkt .rt-spark{width:110px;height:24px}.rt-chkr:hover{background:rgba(128,128,128,.06)}.rt-chkx>td{background:rgba(128,128,128,.05);padding:4px 16px 14px!important}.rt-chkt .rt-edit{margin-right:6px;font-size:16px}',
	'.rt-lkb{display:flex;align-items:center;gap:14px;padding:14px 16px;border-radius:14px;margin-top:12px;border:1px solid rgba(128,128,128,.25)}.rt-lkb.ok{background:rgba(16,185,129,.12);border-color:rgba(16,185,129,.4)}.rt-lkb.warn{background:rgba(245,158,11,.12);border-color:rgba(245,158,11,.4)}.rt-lkb.bad{background:rgba(239,68,68,.12);border-color:rgba(239,68,68,.4)}.rt-lkic{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;color:#fff;font-weight:800;flex:none}.ok .rt-lkic{background:#10b981}.warn .rt-lkic{background:#f59e0b}.bad .rt-lkic{background:#ef4444}.rt-lkb b{font-size:17px}.rt-lks{font-size:12.5px;opacity:.7}.rt-chk{display:grid!important;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:8px 18px;margin-top:12px}.rt-lkd{border-top:1px solid rgba(128,128,128,.2);padding:8px 0}.rt-lkd:first-of-type{margin-top:10px}.rt-lkd summary{cursor:pointer;font-weight:600;padding:4px 0}.rt-lkdb{padding:8px 0 4px}.rt-lksub{font-weight:600;margin:12px 0 4px;opacity:.8}',
	'.rt-srvbar{display:flex;align-items:center;gap:12px;margin-bottom:6px}',
	'.rt-steps{display:flex;align-items:flex-start;margin:6px 0 14px}.rt-stp{flex:none;width:84px;text-align:center;font-size:13px}.rt-stp b{display:block;font-weight:600;opacity:.7}.rt-stc{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;margin:0 auto 4px;background:rgba(128,128,128,.22);font-weight:700}.rt-stp.ok .rt-stc{background:#10b981;color:#fff}.rt-stp.on .rt-stc{background:#3b82f6;color:#fff;animation:rtpulse 1.2s ease-in-out infinite}.rt-stp.bad .rt-stc{background:#ef4444;color:#fff}.rt-stp.ok b,.rt-stp.on b,.rt-stp.bad b{opacity:1}.rt-stl{flex:1;height:3px;margin-top:16px;border-radius:3px;background:rgba(128,128,128,.25)}.rt-stl.ok{background:#10b981}@keyframes rtpulse{0%,100%{box-shadow:0 0 0 0 rgba(59,130,246,.5)}50%{box-shadow:0 0 0 7px rgba(59,130,246,0)}}',
	'.rt-path{align-items:flex-start!important;gap:6px!important;padding:6px 4px 16px!important}.rt-pn2{display:flex;flex-direction:column;align-items:center;text-align:center;gap:3px;min-width:96px}.rt-pn2 small{opacity:.65;font-size:12px}.rt-pt{width:64px;height:64px;border-radius:16px;border:1px solid rgba(128,128,128,.3);display:grid;place-items:center;background:rgba(128,128,128,.08);box-shadow:0 1px 3px rgba(0,0,0,.12)}.rt-pt.hl{background:rgba(59,130,246,.14);border-color:rgba(59,130,246,.5);color:#3b82f6}.rt-pn2 .rt-pr{text-align:center;margin-top:2px;font-size:13px}.rt-pp{flex:1;min-width:60px;padding-top:29px;text-align:center}.rt-pp small{display:block;margin-top:6px;opacity:.65;font-size:12px}.rt-pipe{height:6px;border-radius:9px;background:rgba(128,128,128,.25);position:relative;overflow:hidden}.rt-pipe i{position:absolute;top:0;bottom:0;left:0;width:40%;background:linear-gradient(90deg,transparent,#3b82f6,transparent);animation:rtfl 1.8s linear infinite}.rt-pipe.fast i{animation-duration:1.1s}@keyframes rtfl{from{transform:translateX(-100%)}to{transform:translateX(260%)}}',
	'.rt-hwc{display:grid;grid-template-columns:170px minmax(0,1fr) auto;gap:22px;align-items:center;padding:6px 4px}@media(max-width:820px){.rt-hwc{grid-template-columns:minmax(0,1fr)}.rt-hwc>svg{margin:0 auto}}@media(max-width:820px){.rt-hwr{flex-direction:row!important;gap:28px!important}}.rt-hwlg{display:flex;flex-direction:column;gap:9px;min-width:0}.rt-hwl{display:flex;align-items:baseline;gap:8px}.rt-hwl i{width:10px;height:10px;border-radius:50%;flex:none;align-self:center}.rt-hwl span{flex:1;font-weight:600}.rt-hwl b{font-size:17px}.rt-hwl small{opacity:.6;font-size:11px;margin-left:6px}.rt-hwsp{height:56px;margin-top:4px;position:relative;overflow:hidden}.rt-hwr{display:flex;flex-direction:column;gap:14px;min-width:120px;text-align:right}.rt-hwr small{display:block;opacity:.6;font-size:11px}.rt-hwbig{font-size:34px;font-weight:800;line-height:1.05}.rt-hwbig em{font-style:normal;font-size:12px;opacity:.7;margin-left:3px;font-weight:600}.rt-hwchips{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px;justify-content:flex-end}.rt-hwchips span{padding:2px 10px;border-radius:99px;font-size:11px;font-weight:700;background:rgba(59,130,246,.15);color:#3b82f6}.rt-hwchips span+span{background:rgba(128,128,128,.18);color:inherit}.rt-hwfoot{margin-top:10px;padding-top:10px;border-top:1px solid rgba(128,128,128,.2)}',
	'.rt-ftop{display:flex;justify-content:space-around;align-items:center;gap:16px;flex-wrap:wrap;padding:6px 0}.rt-fbig svg{width:84px;height:84px}.rt-ftile{background:rgba(128,128,128,.1);border:1px solid rgba(128,128,128,.25);border-radius:8px;padding:7px 10px;min-width:0}.rt-ftile small{display:block;opacity:.65;font-size:11px}.rt-ftile b{font-size:16px}.rt-fcol{display:flex;flex-direction:column;gap:10px;min-width:0}.rt-fcol .rt-hw{margin:0}.rt-fsw{-webkit-appearance:none;appearance:none;width:30px;height:16px;border-radius:99px;background:rgba(128,128,128,.45);position:relative;cursor:pointer;margin:0;border:0;transition:.15s}.rt-fsw:before{content:"";position:absolute;left:2px;top:2px;width:12px;height:12px;border-radius:50%;background:#fff;transition:.15s}.rt-fsw:checked{background:#3b82f6}.rt-fsw:checked:before{left:16px}.rt-fspin svg{display:block;animation:rtfs 1.4s linear infinite}@keyframes rtfs{to{transform:rotate(360deg)}}',
	'.rt-fan2{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px 22px;align-items:start}@media(max-width:900px){.rt-fan2{grid-template-columns:minmax(0,1fr)}}',
	'.rt-note{font-size:12px;opacity:.7;margin-top:8px}',
	'.rt-mwtbl .rt-btn{padding:2px 10px;min-height:0;line-height:1.5;height:auto}.rt-mwtbl td{white-space:nowrap}',
	'.rt-hbtn{box-sizing:border-box;height:36px;padding:0 16px;line-height:1;display:inline-flex;align-items:center;justify-content:center;margin:0}.rt-seg .rt-hbtn{vertical-align:top}.rt-seg{vertical-align:top}.rt-hbtn{vertical-align:top;margin-top:0}.rt-hbtn:not(.rt-seg *){margin-top:1px}',
	'.rt-table{width:100%;border-collapse:collapse;font-size:13px}',
	'.rt-table th{text-align:left;opacity:.65;font-weight:500;padding:4px 8px}',
	'.rt-table td{padding:6px 8px;border-top:1px solid rgba(128,128,128,.18);vertical-align:middle}',
	'.rt-dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:6px;background:#9ca3af}.rt-dot.up{background:#22c55e}',
	'.rt-big{font-size:22px;font-weight:700;margin:2px 0 8px}',
	'.rt-scroll{overflow-x:auto}',
	'.rt-ctl{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}',
	'.rt-ctl+.rt-ctl{margin-top:14px;padding-top:14px;border-top:1px solid rgba(128,128,128,.18)}',
	'.rt-ctl-t{font-weight:600;font-size:14px;display:flex;align-items:center;gap:8px}',
	'.rt-orig{font-size:11px;opacity:.6;margin-left:6px}',
	'.rt-net.rt-card{padding:12px 14px}.rt-net .rt-h{margin-bottom:6px}.rt-net .rt-path{padding:2px 4px 10px;margin-bottom:8px}.rt-net .rt-pn{min-width:70px}.rt-net .rt-pn small{opacity:.85}.rt-net .rt-pr{font-weight:600}',
	'.rt-net .rt-table th{opacity:1;font-size:11px;text-transform:uppercase;letter-spacing:.04em;font-weight:700;padding:6px 8px;background:rgba(128,128,128,.14);border-bottom:2px solid rgba(128,128,128,.4)}.rt-net .rt-table td{padding:5px 8px;border-top:1px solid rgba(128,128,128,.32);font-size:13px}.rt-net .rt-table strong,.rt-net .rt-table td:first-child{font-weight:600}',
	'.rt-net .rt-rate{display:inline;opacity:1;font-size:13px;font-weight:600}.rt-net .rt-orig{opacity:.8}.rt-net .rt-idle{margin-top:10px;font-size:12px;display:flex;flex-wrap:wrap;gap:6px;align-items:center}.rt-net .rt-idle>span.rt-lbl{opacity:.85;font-weight:600;margin-right:2px}.rt-net .rt-chip2{border:1px solid rgba(128,128,128,.45);border-radius:99px;padding:1px 4px 1px 10px;display:inline-flex;align-items:center}',
	'.rt-rate{display:block;font-size:11px;opacity:.6}',
	'.rt-edit{background:none;border:0;cursor:pointer;color:inherit;opacity:.5;padding:0 0 0 6px;vertical-align:middle}.rt-edit:hover{opacity:1}',
	'.rt-num{white-space:nowrap;font-variant-numeric:tabular-nums}',
	'.rt-chart{position:relative}.rt-chart svg{display:block;width:100%}',
	'.rt-chart .rt-ymax{position:absolute;left:4px;top:0;font-size:11px;opacity:.6}',
	'.rt-legend{display:flex;gap:16px;font-size:13px;align-items:center;flex-wrap:wrap}.rt-legend b{font-size:18px}',
	'.rt-sw{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:6px}',
	'.rt-stat{display:flex;gap:22px;flex-wrap:wrap;margin-bottom:6px}.rt-stat div{min-width:80px}.rt-stat small{display:block;font-size:11px;opacity:.65}.rt-stat b{font-size:20px}',
	'.rt-form{display:grid;gap:10px;max-width:420px}',
	'.rt-form label{font-size:12px;opacity:.7;display:block;margin-bottom:3px}',
	'.rt-form input{width:100%;box-sizing:border-box}',
	'.rt-speed{display:flex;gap:24px;flex-wrap:wrap;align-items:center}.rt-gwrap{width:300px;max-width:100%}.rt-gauge{width:100%;display:block}',
	'.rt-phase{font-weight:600;opacity:.85}',
	'.rt-tiles{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}@media (max-width:820px){.rt-tiles{grid-template-columns:repeat(2,minmax(0,1fr))}}',
	'.rt-tile2{grid-column:1/-1}.rt-tsrv b{font-size:15px}.rt-tsub{font-size:11px;opacity:.7;margin-top:2px;word-break:break-word}',
	'.rt-tile{border:1px solid rgba(128,128,128,.25);border-radius:10px;padding:8px 12px;min-width:0}.rt-tile small{display:block;opacity:.65;font-size:11px}.rt-tile b{font-size:16px;word-break:break-word}',
	'.rt-spark3{width:100%;height:60px;display:block;margin-top:10px}',
	'.rt-flag{width:22px;height:auto;vertical-align:middle;border-radius:2px;box-shadow:0 0 0 1px rgba(128,128,128,.35)}.rt-flag0{display:inline-block;padding:0 4px;font-size:10px;background:rgba(128,128,128,.2);width:auto}',
	'.rt-fl{display:inline-flex;align-items:center;gap:6px;font-size:13px}',
	'.rt-chk{display:grid;gap:8px;margin:12px 0}.rt-chkrow{display:flex;gap:10px;align-items:flex-start}.rt-chkic{flex:none;width:20px;height:20px;border-radius:50%;color:#fff;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;margin-top:1px}',
	'.rt-grip{display:inline-block;cursor:grab;touch-action:none;user-select:none;font-size:20px;line-height:1;margin-right:8px;opacity:.6;vertical-align:middle}.rt-grip:hover{opacity:1}.rt-dragging{opacity:.5;background:rgba(59,130,246,.12)}',
	'.rt-seg{display:inline-flex;gap:0}.rt-seg .cbi-button{border-radius:0}.rt-seg .cbi-button:first-child{border-radius:6px 0 0 6px}.rt-seg .cbi-button:last-child{border-radius:0 6px 6px 0}',
	'.rt-lbtn-on{background:#3b82f6 !important;color:#fff !important}',
	'.rt-pwline{margin-top:10px;padding-top:10px;border-top:1px solid rgba(128,128,128,.25)}.rt-ios{position:relative;flex:none;width:38px;height:22px;border:0 !important;border-radius:99px !important;padding:0 !important;margin:0;background:#d4d4d8 !important;cursor:pointer;transition:background .2s;min-width:0;display:inline-block;vertical-align:middle}.rt-ios::after{content:"";position:absolute;top:2px;left:2px;width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.3);transition:transform .2s}.rt-ios.on{background:#34c759 !important}.rt-ios.on::after{transform:translateX(16px)}.rt-ios:focus-visible{outline:2px solid #3b82f6;outline-offset:2px}',
	'.rt-sec{font-weight:600;margin:16px 0 8px;opacity:.85}',
	'.rt-pub{display:flex;gap:14px;align-items:center;flex-wrap:wrap;margin-bottom:10px}.rt-pubflag .rt-flag{width:56px}.rt-pubtags{display:flex;gap:6px;flex-wrap:wrap}',
	'.rt-leddot{display:inline-block;width:34px;height:34px;border-radius:50%;background:#444;flex:none;border:2px solid rgba(128,128,128,.4)}',
	'.rt-ledlive{display:flex;gap:14px;align-items:center}',
	'.rt-opts{display:flex;flex-direction:column;gap:10px;font-size:13px}.rt-opts label{display:flex;gap:6px;align-items:center;flex-wrap:wrap}',
	'.rt-spark{display:block;width:110px;height:24px}',
	'.rt-rg{display:inline-flex;gap:0;font-weight:400}.rt-pill{border:1px solid rgba(128,128,128,.35);background:none;color:inherit;padding:2px 10px;font-size:12px;cursor:pointer;margin-left:-1px}.rt-pill:first-child{border-radius:6px 0 0 6px;margin-left:0}.rt-pill:last-child{border-radius:0 6px 6px 0}.rt-pill.on{background:#3b82f6;border-color:#3b82f6;color:#fff}',
	'.rt-wide{grid-column:1/-1}.rt-sf{margin-top:14px;padding-top:12px;border-top:1px solid rgba(128,128,128,.2)}.rt-h2{font-weight:600;margin-bottom:8px}.rt-dayrow{display:flex;flex-wrap:wrap;gap:12px;margin-top:8px}.rt-form label.rt-ck,.rt-dayrow label{display:inline-flex;align-items:center;gap:4px;font-size:13px;opacity:1;margin:0}.rt-sw2{display:inline-flex;align-items:center;gap:4px}',
	'.rt-top{display:flex;align-items:center;gap:22px;margin:4px 0 12px}.rt-ring{width:104px;height:104px;flex:none}.rt-minis{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px 24px;flex:1}.rt-mini small{display:block;font-size:12px;opacity:.65}.rt-mini b{font-size:17px}.rt-hw{position:relative}.rt-empty{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:13px;opacity:.6}',
	'.rt-compact .rt-card{padding:10px 16px}.rt-compact .rt-h{margin-bottom:8px}.rt-compact .rt-big{font-size:18px;margin:0 0 6px}.rt-compact .rt-kv{grid-template-columns:auto minmax(0,1fr) auto minmax(0,1fr);gap:3px 12px;font-size:12.5px}.rt-compact .rt-kv>*{overflow-wrap:anywhere}.rt-compact .rt-note{margin:8px 0 4px}',
	'.rt-top2{align-items:start}',
	'.rt-smb td .rt-btn{padding:2px 8px}.rt-smb .rt-meter2{height:6px;border-radius:99px;background:rgba(128,128,128,.2);overflow:hidden;min-width:70px}.rt-smb .rt-meter2>i{display:block;height:100%;background:#3b82f6}.rt-smb .rt-addr{font-family:monospace;font-size:12px;opacity:.8;word-break:break-all}.rt-smb .rt-mfld{display:grid;grid-template-columns:130px minmax(0,1fr);gap:8px 12px;align-items:center;font-size:13px}.rt-smb .rt-mfld input[type=text],.rt-smb .rt-mfld input[type=password]{width:100%}.rt-smb .rt-warn{color:#d97706;font-size:12px}.rt-smb .rt-sub{opacity:.65;font-size:12px}',

	'.rt-gtiles{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-top:16px}@media (max-width:820px){.rt-gtiles{grid-template-columns:repeat(2,minmax(0,1fr))}}.rt-gt{text-align:center;padding:12px 10px}.rt-gtt{font-weight:600;font-size:13px;margin-bottom:6px}.rt-gt .rt-ring{width:112px;height:112px}.rt-gsub{font-size:12px;opacity:.7;margin-top:6px;min-height:16px}',
	'.rt-h .rt-sp{flex:1}.rt-wl{display:inline-flex;align-items:center;gap:6px;font-weight:400;font-size:12px}.rt-chip{padding:2px 9px;border-radius:99px;background:rgba(128,128,128,.18);font-size:12px}.rt-chip.on{background:rgba(34,197,94,.18);color:#15803d}.rt-lbtn{border:1px solid rgba(128,128,128,.35);background:none;color:inherit;border-radius:6px;padding:2px 10px;font-size:12px;cursor:pointer;font-weight:400;margin-left:4px;display:inline-flex;align-items:center;gap:4px}.rt-lbtn:hover{background:rgba(59,130,246,.12)}.rt-add{border-color:#3b82f6;color:#3b82f6;margin-left:10px}',
	'.rt-srow{display:flex;align-items:center;gap:12px;padding:10px 4px;border-top:1px solid rgba(128,128,128,.18)}.rt-srow:first-child{border-top:0}.rt-srow.off .rt-stx{opacity:.5}.rt-sico{width:34px;height:34px;border-radius:9px;background:rgba(59,130,246,.12);color:#3b82f6;display:inline-flex;align-items:center;justify-content:center;flex:none}.rt-stx{flex:1;min-width:0}.rt-ssub{font-size:12.5px;opacity:.7}.rt-ib{border:0;background:none;color:inherit;opacity:.6;cursor:pointer;padding:6px;border-radius:6px}.rt-ib:hover{opacity:1;background:rgba(128,128,128,.15)}',
	'.rt-sched .rt-scwifi{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:2px 0 12px;border-bottom:1px solid rgba(128,128,128,.2)}.rt-sstate{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600;padding:1px 9px;border-radius:99px;background:rgba(128,128,128,.16)}.rt-sstate i{width:8px;height:8px;border-radius:50%;background:#9ca3af}.rt-sstate.on i{background:#22c55e}.rt-sstate.part i{background:#f59e0b}.rt-sstate.off i{background:#ef4444}.rt-sstate.on{background:rgba(34,197,94,.16);color:#15803d}.rt-sstate.off{background:rgba(239,68,68,.14);color:#b91c1c}.rt-scbtns{display:inline-flex;border:1px solid rgba(128,128,128,.35);border-radius:8px;overflow:hidden}.rt-scbtns button{border:0;background:none;color:inherit;padding:5px 14px;font-size:13px;cursor:pointer}.rt-scbtns button+button{border-left:1px solid rgba(128,128,128,.35)}.rt-scbtns button:hover{background:rgba(59,130,246,.12)}',
	'.rt-stbw{overflow-x:auto;margin-top:8px}.rt-stb{border-collapse:collapse;width:100%}.rt-stb th{font-weight:600;opacity:.65;font-size:12px;text-align:left;padding:6px 8px;border-bottom:1px solid rgba(128,128,128,.3)}.rt-stb td{padding:9px 8px;border-bottom:1px solid rgba(128,128,128,.18);vertical-align:middle}.rt-stb tr:last-child td{border-bottom:0}.rt-stb tr.off td{opacity:.55}.rt-stb td.rt-sact{text-align:right;white-space:nowrap}.rt-dd{display:inline-flex;gap:3px}.rt-dd i{width:20px;height:20px;border-radius:50%;font-style:normal;font-size:11px;display:inline-flex;align-items:center;justify-content:center;border:1px solid rgba(128,128,128,.4);opacity:.6}.rt-dd i.on{background:#3b82f6;border-color:#3b82f6;color:#fff;opacity:1}.rt-sched .rt-srow{padding:10px 2px;border-top:1px solid rgba(128,128,128,.18)}.rt-sched .rt-srow:first-child{border-top:0}.rt-stime{font-family:ui-monospace,monospace;font-size:13px;font-weight:700;white-space:nowrap}@media (max-width:640px){.rt-sched .rt-srow{flex-wrap:wrap;gap:6px 10px}.rt-sched .rt-srow .rt-stx{flex:1 1 0;min-width:0}.rt-sched .rt-stime{order:5;flex:0 0 100%;opacity:.8}.rt-scbtns{margin-left:auto}}',
	'.rt-tg{position:relative;display:inline-block;width:38px;height:22px;flex:none;margin:0}.rt-tg input{opacity:0;width:0;height:0;position:absolute}.rt-tg i{position:absolute;inset:0;border-radius:99px;background:rgba(128,128,128,.4);transition:.2s;cursor:pointer}.rt-tg i:before{content:"";position:absolute;width:16px;height:16px;left:3px;top:3px;border-radius:50%;background:#fff;transition:.2s}.rt-tg input:checked+i{background:#22c55e}.rt-tg input:checked+i:before{transform:translateX(16px)}',
	'.rt-sform{margin-top:10px;padding:14px;border-radius:10px;background:rgba(128,128,128,.07);display:grid;gap:12px}.rt-seg{display:inline-flex;flex-wrap:wrap}.rt-seg button,.rt-days button{border:1px solid rgba(128,128,128,.4);background:none;color:inherit;padding:5px 12px;font-size:13px;cursor:pointer;margin:0 -1px -1px 0}.rt-seg button:first-child{border-radius:7px 0 0 7px}.rt-seg button:last-child{border-radius:0 7px 7px 0}.rt-seg button.on,.rt-days button.on{background:#3b82f6;border-color:#3b82f6;color:#fff}.rt-days{display:flex;flex-wrap:wrap;gap:6px;margin:4px 0}.rt-days button{border-radius:99px;margin:0}.rt-fl2 label,.rt-sform .rt-row label{font-size:12px;opacity:.7;display:block;margin-bottom:3px}.rt-quick{font-size:12px}.rt-quick a{cursor:pointer;color:#3b82f6}.rt-syswrap{margin-top:4px}',
	'.rt-ovtop{align-items:stretch}.rt-ovtop .rt-info>div{display:flex;flex-direction:column;height:100%}.rt-ovtop .rt-info .rt-gl{flex:1}.rt-ovtop .rt-info .rt-gl>div{flex:1;align-items:center}.rt-ovwrap .rt-gtiles{margin-top:12px;gap:12px}.rt-ovwrap .rt-gt .rt-ring{width:76px;height:76px}.rt-ovwrap .rt-gt{padding:8px 6px}.rt-ovwrap .rt-gtt{margin-bottom:2px}.rt-ovwrap .rt-gsub{margin-top:2px;font-size:11.5px;min-height:0}.rt-ovwrap .rt-gt{display:flex;flex-direction:column;align-items:center}.rt-info{display:block}.rt-divider{height:1px;background:rgba(128,128,128,.25);margin:14px 0}.rt-ovtop .rt-gtiles{margin-top:0;grid-template-columns:repeat(2,minmax(0,1fr))}.rt-ovtop .rt-gt .rt-ring{width:88px;height:88px}.rt-ovtop .rt-gt{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:8px}',
	'.rt-ifgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}@media (max-width:820px){.rt-ifgrid{grid-template-columns:minmax(0,1fr)}}.rt-if{border:1px solid rgba(128,128,128,.25);border-radius:12px;padding:14px 16px;background:rgba(128,128,128,.04)}.rt-ifh{display:flex;align-items:center;gap:8px;margin-bottom:8px;font-size:15px}.rt-ifh .rt-sp{flex:1}.rt-ifm{display:flex;flex-wrap:wrap;gap:4px 18px;font-size:13px;margin-bottom:10px}.rt-ifm small,.rt-idle small{opacity:.6;font-size:12px}.rt-ift{display:flex;justify-content:space-between;font-size:12.5px;opacity:.85;margin-top:8px;padding-top:8px;border-top:1px solid rgba(128,128,128,.18)}.rt-idle{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:14px}.rt-ma{width:12px;font-weight:700}.rt-ma.rx{color:#3b82f6}.rt-ma.tx{color:#f59e0b}',
	'.rt-hero{border:1px solid rgba(59,130,246,.35);border-radius:14px;padding:18px 20px;background:rgba(59,130,246,.05);margin-bottom:18px}.rt-bigrow{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:6px 0 14px}.rt-bigrow small{display:block;font-size:12px;opacity:.65;margin-bottom:2px}.rt-bigv{font-size:30px;font-weight:700;line-height:1.1}.rt-bigrow b{font-size:18px}@media (max-width:820px){.rt-bigrow{grid-template-columns:repeat(2,minmax(0,1fr))}}.rt-idlerow{opacity:.5}.rt-ar.rx{color:#3b82f6;font-weight:700}.rt-ar.tx{color:#f59e0b;font-weight:700}',
	'.rt-meter{width:100%}.rt-mrow{display:flex;align-items:center;gap:6px;margin:3px 0}.rt-mbar{flex:1;height:10px;border-radius:3px;background:rgba(128,128,128,.18);overflow:hidden}.rt-mf{display:block;width:0;height:100%;border-radius:3px;transition:width .6s}.rt-mf.rx{background:#3b82f6}.rt-mf.tx{background:#f59e0b}.rt-mt{width:84px;text-align:right;font-size:13px;white-space:nowrap}',
	'.rt-bars{display:inline-flex;align-items:flex-end;gap:2px;height:14px;vertical-align:middle;margin-right:6px}.rt-bars i{width:4px;background:rgba(128,128,128,.35);border-radius:1px}.rt-bars i.on{background:#22c55e}',
	'.rt-muted{opacity:.6}',
	'.rt-gl{display:flex;flex-direction:column}.rt-gl>div{display:flex;justify-content:space-between;align-items:baseline;gap:16px;padding:4px 0;border-top:1px solid rgba(128,128,128,.16);font-size:12.5px}.rt-gl>div:first-child{border-top:0}.rt-gl>div>span:first-child{opacity:.65;flex:none}.rt-gl>div>span:last-child{font-weight:600;text-align:right;word-break:break-word;min-width:0}',
	'.rt-up{display:flex;align-items:center;justify-content:center;gap:6px;margin:0 0 6px}.rt-ub{text-align:center;min-width:56px}.rt-ub b{display:block;font-size:22px;line-height:1.1;font-variant-numeric:tabular-nums}.rt-ub small{opacity:.6;font-size:11px}.rt-up i{font-style:normal;font-size:20px;opacity:.4;margin-bottom:10px}',
	'.rt-qc{display:flex;flex-direction:column}.rt-qc>.rt-ctl{padding:4px 0}',
	'.rt-gear{margin-left:auto;background:none;border:1px solid rgba(128,128,128,.35);border-radius:8px;color:inherit;cursor:pointer;padding:4px 7px;display:inline-flex;align-items:center;opacity:.8}.rt-gear:hover{opacity:1;background:rgba(128,128,128,.12)}',
	'.rt-bands{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}@media (max-width:820px){.rt-bands{grid-template-columns:minmax(0,1fr)}}',
	'.rt-fld{display:grid;grid-template-columns:130px minmax(0,1fr);gap:8px 12px;align-items:center;font-size:13px;margin-top:10px}.rt-fld>label{opacity:.7}.rt-fld input[type=text],.rt-fld input[type=password],.rt-fld select{width:100%;box-sizing:border-box}@media (max-width:480px){.rt-fld{grid-template-columns:minmax(0,1fr)}}',
	'@media (max-width:640px){.rt-card{padding:12px 12px}.rt-h{flex-wrap:wrap}.rt-table th,.rt-table td{padding:5px 5px}.rt-big{font-size:19px}.rt-pn{min-width:60px}.rt-path{overflow-x:auto}.rt-kv{grid-template-columns:110px 1fr}}',
	'.rt-badge{white-space:nowrap}',
	'@media (max-width:640px){.rt-nav{flex-wrap:nowrap !important;overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch;scrollbar-width:none;white-space:nowrap;display:flex !important}.rt-nav::-webkit-scrollbar{display:none}.rt-nav li{flex:0 0 auto !important;float:none !important;white-space:nowrap}.rt-nav li a{padding:8px 10px !important}',
	'.rt-speed{gap:12px}.rt-gwrap{width:100%;max-width:300px;margin:0 auto}.rt-speed>div+div{flex:1 1 100% !important}.rt-tile{padding:6px 8px}.rt-tile b{font-size:15px}',
	'.rt-pingtbl th:nth-child(3),.rt-pingtbl td:nth-child(3),.rt-pingtbl th:nth-child(6),.rt-pingtbl td:nth-child(6){display:none}.rt-pingtbl .rt-orig{display:block;margin:0;font-size:11px}.rt-pingtbl th,.rt-pingtbl td{padding:6px 4px;font-size:12px}.rt-pingtbl td:first-child{min-width:90px}',
	'.rt-h{gap:6px 10px}.rt-row>input.cbi-input-text,.rt-row>select{flex:1 1 140px;min-width:0}.rt-note{overflow-wrap:anywhere}',
	'.rt-fld{grid-template-columns:minmax(0,1fr)}.rt-card .cbi-button{white-space:normal}.rt-bigrow{grid-template-columns:repeat(2,minmax(0,1fr))}.rt-card{overflow-x:auto;max-width:100%}.rt-ledtbl thead{display:none}.rt-ledtbl,.rt-ledtbl tbody{display:block}.rt-ledtbl tr{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:6px 10px;align-items:center;padding:10px 0;border-top:1px solid rgba(128,128,128,.25)}.rt-ledtbl td{display:block;padding:0 !important;border:0 !important}.rt-ledtbl td:first-child{grid-column:1/-1}.rt-iftbl th,.rt-iftbl td{padding:5px 4px;font-size:12px}.rt-iftbl th:nth-child(2),.rt-iftbl td:nth-child(2),.rt-iftbl th:nth-child(6),.rt-iftbl td:nth-child(6){display:none}.rt-card svg,.rt-card canvas,.rt-card img{max-width:100%}.rt-card input:not([type=checkbox]):not([type=radio]),.rt-card select,.rt-card textarea{max-width:100%;box-sizing:border-box}.rt-gtiles,.rt-tiles{gap:8px}}'
].join('\n');

function dur(s) {
	s = +s || 0;
	var d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60);
	return (d ? d + 'd ' : '') + (d || h ? h + 'h ' : '') + m + 'm';
}
function bytes(n) {
	n = +n || 0;
	var u = ['B', 'KB', 'MB', 'GB', 'TB'], i = 0;
	while (n >= 1024 && i < u.length - 1) { n /= 1024; i++; }
	return (i < 2 ? n.toFixed(0) : n.toFixed(2)) + ' ' + u[i];
}
function rate(bps) { return bps == null ? '' : bytes(bps) + '/s'; }
function bits(bps) {
	bps = +bps || 0;
	if (bps >= 1e9) return (bps / 1e9).toFixed(2) + ' Gbps';
	if (bps >= 1e6) return (bps / 1e6).toFixed(bps >= 1e7 ? 1 : 2) + ' Mbps';
	if (bps >= 1e3) return (bps / 1e3).toFixed(bps >= 1e4 ? 0 : 1) + ' Kbps';
	return Math.round(bps) + ' bps';
}
function mb(kb) { return (kb / 1024).toFixed(0) + ' MB'; }
function kv(rows) {
	var dl = E('dl', { 'class': 'rt-kv' });
	rows.forEach(function(r) {
		if (r[1] === '' || r[1] == null) return;
		dl.appendChild(E('dt', {}, r[0])); dl.appendChild(E('dd', {}, r[1]));
	});
	return dl;
}
function badge(text, cls) { return E('span', { 'class': 'rt-badge ' + cls }, text); }
function card(ic, title, body, extra) {
	return E('div', { 'class': 'rt-card' + (extra ? ' ' + extra : '') }, [E('div', { 'class': 'rt-h' }, [icon(ic), title]), body]);
}
function toast(msg, kind) { ui.addNotification(null, E('p', msg), kind || 'info'); }
function validIPv4(v) {
	var m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(v);
	return !!m && m.slice(1).every(function(o) { return +o <= 255; });
}
function validDns(v) { return validIPv4(v) || /^[0-9a-fA-F:]+:[0-9a-fA-F:]*$/.test(v); }

/* small SVG line chart: series are arrays, newest value last, drawn right-aligned */
function makeChart(height, colors, cap) {
	var svg = document.createElementNS(NS, 'svg');
	svg.setAttribute('viewBox', '0 0 600 ' + height);
	svg.setAttribute('preserveAspectRatio', 'none');
	svg.style.height = height + 'px';
	var grid = [];
	for (var g = 1; g < 4; g++) {
		var l = document.createElementNS(NS, 'line');
		l.setAttribute('x1', 0); l.setAttribute('x2', 600);
		l.setAttribute('y1', height * g / 4); l.setAttribute('y2', height * g / 4);
		l.setAttribute('stroke', 'rgba(128,128,128,.2)'); l.setAttribute('stroke-width', 1);
		l.setAttribute('vector-effect', 'non-scaling-stroke');
		svg.appendChild(l);
	}
	var areas = [], lines = [];
	colors.forEach(function(c) {
		var a = document.createElementNS(NS, 'path'); a.setAttribute('fill', c); a.setAttribute('fill-opacity', '.14'); svg.appendChild(a); areas.push(a);
		var p = document.createElementNS(NS, 'path'); p.setAttribute('fill', 'none'); p.setAttribute('stroke', c); p.setAttribute('stroke-width', 2);
		p.setAttribute('stroke-linejoin', 'round'); p.setAttribute('vector-effect', 'non-scaling-stroke'); svg.appendChild(p); lines.push(p);
	});
	var ymax = E('span', { 'class': 'rt-ymax' }, '');
	var el = E('div', { 'class': 'rt-chart' }, [svg, ymax]);
	function nice(v) {
		if (v <= 0) return 1;
		var p = Math.pow(10, Math.floor(Math.log(v) / Math.LN10)), n = v / p;
		return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
	}
	return {
		el: el,
		set: function(series, fmt, fixedMax) {
			var max = 0;
			series.forEach(function(s) { s.forEach(function(v) { if (v > max) max = v; }); });
			max = fixedMax || nice(max * 1.05);
			var step = 600 / (cap - 1);
			series.forEach(function(s, k) {
				var off = cap - s.length, d = '';
				s.forEach(function(v, i) {
					var x = (off + i) * step, y = height - Math.min(v, max) / max * (height - 3) - 1;
					d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
				});
				lines[k].setAttribute('d', d);
				areas[k].setAttribute('d', s.length ? d + 'L600 ' + height + 'L' + (off * step).toFixed(1) + ' ' + height + 'Z' : '');
			});
			ymax.textContent = fmt ? fmt(max) : max;
		}
	};
}
function spark(values, color) {
	var svg = document.createElementNS(NS, 'svg');
	svg.setAttribute('viewBox', '0 0 110 24'); svg.setAttribute('class', 'rt-spark');
	var pts = values.filter(function(v) { return v != null; });
	if (pts.length < 2) return svg;
	var max = Math.max.apply(null, pts) || 1, d = '', step = 110 / Math.max(values.length - 1, 1);
	values.forEach(function(v, i) {
		if (v == null) return;
		d += (d ? 'L' : 'M') + (i * step).toFixed(1) + ' ' + (22 - v / max * 20).toFixed(1);
	});
	var p = document.createElementNS(NS, 'path');
	p.setAttribute('d', d); p.setAttribute('fill', 'none'); p.setAttribute('stroke', color || '#3b82f6'); p.setAttribute('stroke-width', 1.6);
	svg.appendChild(p);
	return svg;
}
function spark2() {
	function row(cls, arrow) {
		var f = E('i', { 'class': 'rt-mf ' + cls }), t = E('span', { 'class': 'rt-mt' }, '-');
		return { el: E('div', { 'class': 'rt-mrow' }, [E('span', { 'class': 'rt-ma ' + cls }, arrow), E('div', { 'class': 'rt-mbar' }, [f]), t]), f: f, t: t };
	}
	var d = row('rx', '\u2193'), u = row('tx', '\u2191');
	return { el: E('div', { 'class': 'rt-meter' }, [d.el, u.el]), set: function(rx, tx) {
		var peak = Math.max.apply(null, rx.concat(tx).concat([8000]));
		[[d, rx], [u, tx]].forEach(function(x) {
			var cur = x[1].length ? x[1][x[1].length - 1] : 0, pk = Math.max.apply(null, x[1].concat([0]));
			x[0].f.style.width = Math.max(cur ? 2 : 0, Math.min(100, cur / peak * 100)).toFixed(0) + '%';
			x[0].t.textContent = bits(cur);
			x[0].t.title = 'Peak ' + bits(pk);
		});
	} };
}
function signalBars(dbm) {
	var n = dbm == null || dbm === '' ? 0 : dbm >= -55 ? 4 : dbm >= -67 ? 3 : dbm >= -78 ? 2 : 1;
	var w = E('span', { 'class': 'rt-bars' });
	[5, 8, 11, 14].forEach(function(h, i) { w.appendChild(E('i', { 'class': i < n ? 'on' : '', 'style': 'height:' + h + 'px' })); });
	return w;
}
/* A LuCI login that expired while the page sat idle makes every command fail with
 * "Exec permission denied". But the same error also appears for a few seconds while rpcd is busy
 * (Travelmate's Wi-Fi scan, for example, blocks it for about 7 s), so a failed call is retried first.
 * Only if it keeps failing for ~15 s is the login taken as expired: the page reloads (the login page
 * appears if needed) and comes back on the same tab. */
(function() {
	if (fs.__odashGuard) return;
	fs.__odashGuard = true;
	var orig = fs.exec_direct, denied = /permission denied|access denied|session/i;
	function attempt(self, args, n) {
		return orig.apply(fs, args).catch(function(e) {
			var m = String((e && e.message) || e);
			if (!denied.test(m)) throw e;
			if (n < 5) return new Promise(function(res) { window.setTimeout(res, 3000); }).then(function() { return attempt(self, args, n + 1); });
			var k = 'odash.relogin', last = +(window.sessionStorage.getItem(k) || 0);
			if (Date.now() - last > 60000) {
				window.sessionStorage.setItem(k, String(Date.now()));
				try { var t = window.localStorage.getItem('odash.ctl.tab'); if (t) window.localStorage.setItem('odash.ctl.go', t); } catch (x) {}
				window.location.reload();
			}
			return new Promise(function() {});   /* never resolves: no error banner while the page reloads */
		});
	}
	fs.exec_direct = function() { return attempt(this, arguments, 0); };
})();
function exec(args) { return fs.exec_direct('/usr/bin/odash', args, 'json'); }
function ring(color) {
	var svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 100 100'); svg.setAttribute('class', 'rt-ring');
	function c(col, w) { var e = document.createElementNS(NS, 'circle'); e.setAttribute('cx', 50); e.setAttribute('cy', 50); e.setAttribute('r', 42); e.setAttribute('fill', 'none');
		e.setAttribute('stroke', col); e.setAttribute('stroke-width', w); e.setAttribute('stroke-linecap', 'round'); svg.appendChild(e); return e; }
	c('rgba(128,128,128,.2)', 9);
	var fg = c(color, 9), r = 42, len = 2 * Math.PI * r;
	fg.setAttribute('stroke-dasharray', len + ' ' + len); fg.setAttribute('stroke-dashoffset', len); fg.setAttribute('transform', 'rotate(-90 50 50)'); fg.style.transition = 'stroke-dashoffset .6s';
	var t = document.createElementNS(NS, 'text'); t.setAttribute('x', 50); t.setAttribute('y', 58); t.setAttribute('text-anchor', 'middle'); t.setAttribute('font-size', 24); t.setAttribute('font-weight', 700); t.setAttribute('fill', 'currentColor'); svg.appendChild(t);
	return { el: svg, set: function(v, label, max) { fg.setAttribute('stroke-dashoffset', len * (1 - Math.max(0, Math.min(1, (v == null ? 0 : v) / max)))); t.textContent = label; } };
}
function rings3() {
	var svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 170 170'); svg.setAttribute('width', 170); svg.setAttribute('height', 170);
	var defs = [[74, '#8b5cf6'], [58, '#3b82f6'], [42, '#10b981']], arcs = [];
	defs.forEach(function(d) {
		var r = d[0], len = 2 * Math.PI * r;
		['rgba(128,128,128,.2)', d[1]].forEach(function(col, k) {
			var e = document.createElementNS(NS, 'circle'); e.setAttribute('cx', 85); e.setAttribute('cy', 85); e.setAttribute('r', r); e.setAttribute('fill', 'none'); e.setAttribute('stroke', col); e.setAttribute('stroke-width', 11); e.setAttribute('stroke-linecap', 'round');
			if (k) { e.setAttribute('stroke-dasharray', len + ' ' + len); e.setAttribute('stroke-dashoffset', len); e.setAttribute('transform', 'rotate(-90 85 85)'); e.style.transition = 'stroke-dashoffset .6s'; arcs.push({ e: e, len: len }); }
			svg.appendChild(e);
		});
	});
	return { el: svg, arc: function(i, v) { var a = arcs[i]; a.e.setAttribute('stroke-dashoffset', a.len * (1 - Math.max(0, Math.min(1, (v || 0) / 100)))); } };
}
function chk(el, v) { el.checked = !!v; return el; }
function execText(args) { return fs.exec_direct('/usr/bin/odash', args); }
function sleep(ms) { return new Promise(function(r) { window.setTimeout(r, ms); }); }

var NAV = [['overview', 'Overview', 'activity'], ['devices', 'Devices', 'laptop'], ['usage', 'Traffic', 'download'], ['network', 'Network', 'router'], ['tests', 'Diagnostics', 'bolt'], ['samba', 'Storage & Sharing', 'folder'], ['system', 'System', 'cpu']];
var CAP = 150;
var DAYS = [['*', 'Every day'], ['1', 'Monday'], ['2', 'Tuesday'], ['3', 'Wednesday'], ['4', 'Thursday'], ['5', 'Friday'], ['6', 'Saturday'], ['0', 'Sunday']];
var PING_DEFAULT = [['Gateway', '@gw'], ['Cloudflare DNS', '1.1.1.1'], ['Google DNS', '8.8.8.8'], ['google.com', 'google.com'], ['github.com', 'github.com'], ['cloudflare.com', 'cloudflare.com']];


var SPEED_COUNTRIES = [['Afghanistan', 'AF'], ['Argentina', 'AR'], ['Armenia', 'AM'], ['Australia', 'AU'], ['Austria', 'AT'], ['Azerbaijan', 'AZ'], ['Bahrain', 'BH'], ['Belgium', 'BE'], ['Brazil', 'BR'], ['Bulgaria', 'BG'], ['Canada', 'CA'], ['Chile', 'CL'], ['Cyprus', 'CY'], ['Czechia', 'CZ'], ['Denmark', 'DK'], ['Egypt', 'EG'], ['Estonia', 'EE'], ['Finland', 'FI'], ['France', 'FR'], ['Georgia', 'GE'], ['Germany', 'DE'], ['Greece', 'GR'], ['Hong Kong', 'HK'], ['Hungary', 'HU'], ['India', 'IN'], ['Indonesia', 'ID'], ['Iran', 'IR'], ['Iraq', 'IQ'], ['Ireland', 'IE'], ['Italy', 'IT'], ['Japan', 'JP'], ['Kazakhstan', 'KZ'], ['Kuwait', 'KW'], ['Latvia', 'LV'], ['Lithuania', 'LT'], ['Luxembourg', 'LU'], ['Malaysia', 'MY'], ['Mexico', 'MX'], ['Moldova', 'MD'], ['Netherlands', 'NL'], ['Norway', 'NO'], ['Oman', 'OM'], ['Pakistan', 'PK'], ['Poland', 'PL'], ['Portugal', 'PT'], ['Qatar', 'QA'], ['Romania', 'RO'], ['Russia', 'RU'], ['Saudi Arabia', 'SA'], ['Serbia', 'RS'], ['Singapore', 'SG'], ['South Africa', 'ZA'], ['South Korea', 'KR'], ['Spain', 'ES'], ['Sweden', 'SE'], ['Switzerland', 'CH'], ['Taiwan', 'TW'], ['Thailand', 'TH'], ['Turkey', 'TR'], ['Ukraine', 'UA'], ['United Arab Emirates', 'AE'], ['United Kingdom', 'GB'], ['United States', 'US'], ['Vietnam', 'VN']];

/* ---------- themes: the default look is the plain CSS above; each theme only adds a class on the root ---------- */
var THEMES = [['default', 'Default', 'The current look'], ['sidebar', 'Sidebar', 'Tabs in a side menu'], ['neon', 'Neon console', 'Dark, with glowing accents'], ['bento', 'Bento', 'Soft colored tiles'], ['soft', 'Soft', 'Raised, rounded surfaces']];
var THEME_FONTS = { neon: 'Space+Grotesk:wght@400;600;700', bento: 'Sora:wght@400;600;700', soft: 'Manrope:wght@400;600;700;800' };
function themeCss() {
	var n = '.odash-th-neon', sd = '.odash-th-sidebar', b = '.odash-th-bento', so = '.odash-th-soft', o = [];
	var cards = function(r) { return r + ' .rt-card,' + r + ' .st-card,' + r + ' .rt-tile'; };
	/* neon */
	o.push(n + '{background:radial-gradient(900px 400px at 80% -10%,#17224a,#0b1020);color:#e6edf7;padding:20px;border-radius:16px;font-family:"Space Grotesk",sans-serif;--st-card:#0f1730;--st-line:#1f2b4a;--st-muted:#9fb0c8}');
	o.push(n + ' h2,' + n + ' h3,' + n + ' .rt-h,' + n + ' label,' + n + ' b,' + n + ' strong{color:#e6edf7}' + n + ' a{color:#7dd3fc}');
	o.push(cards(n) + '{background:#0f1730 !important;border:1px solid #1f2b4a !important;border-radius:14px !important;color:#e6edf7}');
	o.push(n + ' .rt-table td{border-top-color:#1f2b4a}' + n + ' .rt-table th,' + n + ' .rt-sub,' + n + ' .rt-note,' + n + ' .rt-muted,' + n + ' small{color:#9fb0c8 !important;opacity:1}');
	o.push(n + ' .cbi-tabmenu{border-bottom:0}' + n + ' .cbi-tabmenu li a{color:#9fb0c8 !important;border:1px solid transparent !important;border-radius:8px !important;background:transparent !important}');
	o.push(n + ' .cbi-tabmenu li.cbi-tab a{color:#e6fbff !important;border-color:#22d3ee !important;box-shadow:0 0 14px rgba(34,211,238,.45);background:rgba(34,211,238,.10) !important}');
	o.push(n + ' input,' + n + ' select,' + n + ' textarea{background:#0b1020 !important;color:#e6edf7 !important;border:1px solid #2b3a66 !important}');
	o.push(n + ' .cbi-button{background:#17224a !important;color:#e6edf7 !important;border:1px solid #2b3a66 !important}' + n + ' .cbi-button-action,' + n + ' .cbi-button-positive{background:#0e7490 !important;border-color:#22d3ee !important}' + n + ' .cbi-button-negative{background:#7f1d3a !important}');
	/* sidebar */
	o.push(sd + '{display:flex;gap:20px;align-items:flex-start}' + sd + ' > div{flex:1 1 0;min-width:0}' + sd + ' > ul.cbi-tabmenu{flex:0 0 210px;display:flex !important;flex-direction:column;gap:2px;margin:14px 0 !important;padding:10px;border:1px solid rgba(128,128,128,.25) !important;border-radius:12px;background:rgba(128,128,128,.06)}');
	o.push(sd + ' ul.cbi-tabmenu li{display:block !important;float:none !important;margin:0 !important;border:0 !important;background:transparent !important}' + sd + ' ul.cbi-tabmenu li a{display:flex !important;padding:10px 12px !important;border:0 !important;border-radius:8px !important;font-size:14px}');
	o.push(sd + ' ul.cbi-tabmenu li.cbi-tab a{background:rgba(59,130,246,.2) !important;font-weight:700}');
	o.push('@media (max-width:820px){' + sd + '{flex-direction:column}' + sd + ' > ul.cbi-tabmenu{flex:none;width:100%;flex-direction:row !important;flex-wrap:wrap}}');
	/* bento */
	o.push(b + '{background:#f5f0e8;color:#18181b;padding:20px;border-radius:24px;font-family:Sora,sans-serif;--st-card:#fff;--st-line:transparent;--st-muted:#3f3f46}');
	o.push(cards(b) + '{border:0 !important;border-radius:24px !important;background:#fff !important;color:#18181b}' + b + ' .rt-tile{border-radius:16px !important;background:#fff !important}');
	var pal = ['#ddd6fe', '#bbf7d0', '#fed7aa', '#bae6fd', '#fecdd3'];
	pal.forEach(function(c, i) { o.push(b + ' .rt-grid > .rt-card:nth-child(5n+' + (i + 1) + '),' + b + ' .st-cards > .st-card:nth-child(5n+' + (i + 1) + '){background:' + c + ' !important}'); });
	o.push(b + ' h2,' + b + ' h3,' + b + ' .rt-h,' + b + ' label,' + b + ' b,' + b + ' strong,' + b + ' td,' + b + ' th{color:#18181b}' + b + ' .rt-note,' + b + ' .rt-sub,' + b + ' small{color:#3f3f46 !important;opacity:1}');
	o.push(b + ' .cbi-tabmenu{border-bottom:0}' + b + ' .cbi-tabmenu li a{border:0 !important;border-radius:99px !important;background:#fff !important;color:#3f3f46 !important;font-weight:600}' + b + ' .cbi-tabmenu li.cbi-tab a{background:#18181b !important;color:#fff !important}');
	o.push(b + ' input,' + b + ' select,' + b + ' textarea{background:#fff !important;color:#18181b !important;border:1px solid #d4d4d8 !important;border-radius:10px}' + b + ' .cbi-button{border-radius:99px !important}');
	/* soft */
	var sh = 'box-shadow:8px 8px 18px #c9ced8,-8px -8px 18px #ffffff;', ish = 'box-shadow:inset 3px 3px 6px #c9ced8,inset -3px -3px 6px #ffffff;';
	o.push(so + '{background:#e8ebf0;color:#2b3340;padding:22px;border-radius:28px;font-family:Manrope,sans-serif;--st-card:#e8ebf0;--st-line:transparent;--st-muted:#4b5563}');
	o.push(cards(so) + '{background:#e8ebf0 !important;border:0 !important;border-radius:24px !important;color:#2b3340;' + sh + '}' + so + ' .rt-tile{border-radius:18px !important;box-shadow:5px 5px 11px #c9ced8,-5px -5px 11px #fff}');
	o.push(so + ' h2,' + so + ' h3,' + so + ' .rt-h,' + so + ' label,' + so + ' b,' + so + ' strong,' + so + ' td,' + so + ' th{color:#2b3340}' + so + ' .rt-note,' + so + ' .rt-sub,' + so + ' small{color:#4b5563 !important;opacity:1}' + so + ' .rt-table td{border-top-color:rgba(75,85,99,.18)}');
	o.push(so + ' ul.cbi-tabmenu{display:inline-flex !important;flex-wrap:wrap;gap:4px;padding:6px !important;border:0 !important;border-radius:20px;' + sh + '}' + so + ' .cbi-tabmenu li a{border:0 !important;border-radius:14px !important;background:transparent !important;color:#4b5563 !important;font-weight:600}');
	o.push(so + ' .cbi-tabmenu li.cbi-tab a{color:#2f45c2 !important;' + ish + '}');
	o.push(so + ' input,' + so + ' select,' + so + ' textarea{background:#e8ebf0 !important;color:#2b3340 !important;border:0 !important;border-radius:12px;' + ish + '}');
	o.push(so + ' .cbi-button{background:#e8ebf0 !important;color:#2b3340 !important;border:0 !important;border-radius:14px !important;box-shadow:4px 4px 9px #c9ced8,-4px -4px 9px #fff}' + so + ' .cbi-button-action,' + so + ' .cbi-button-positive{color:#2f45c2 !important;font-weight:700}');
	/* readable badges, arrows and muted text on every theme surface */
	o.push(n + ' .cbi-value-title,' + n + ' .cbi-value label,' + n + ' .cbi-value-description,' + n + ' .cbi-section-descr,' + n + ' .cbi-map-descr,' + n + ' legend{color:#c3d0e6 !important}' + n + ' .cbi-section h3,' + n + ' .cbi-map h2{color:#e6edf7 !important}');
	o.push(n + ' .rt-on,' + n + ' .st-tag-ip{color:#4ade80}' + n + ' .rt-warn,' + n + ' .st-tag-lim{color:#fbbf24}' + n + ' .rt-bad,' + n + ' .st-tag-blk{color:#fca5a5}' + n + ' .st-tag{color:#e6edf7}' + n + ' .rt-ar.tx,' + n + ' [style*="color:#f59e0b"]{color:#fbbf24 !important}' + n + ' .rt-ar.rx,' + n + ' [style*="color:#3b82f6"]{color:#60a5fa !important}' + n + ' .cbi-button-action,' + n + ' .cbi-button-positive{background:#155e75 !important}' + n + ' .rt-lbtn{color:#7dd3fc}');
	[b, so].forEach(function(r) {
		o.push(r + ' .rt-on,' + r + ' .st-tag-ip{color:#166534}' + r + ' .rt-warn,' + r + ' .st-tag-lim{color:#92400e}' + r + ' .rt-bad,' + r + ' .st-tag-blk{color:#991b1b}' + r + ' .rt-ar.tx,' + r + ' [style*="color:#f59e0b"]{color:#b45309 !important}' + r + ' .rt-ar.rx,' + r + ' [style*="color:#3b82f6"]{color:#1d4ed8 !important}' + r + ' .rt-lbtn{color:#1d4ed8}');
		o.push(r + ' small,' + r + ' .rt-sub,' + r + ' .rt-muted,' + r + ' .st-label,' + r + ' .rt-phase,' + r + ' .st-dtbl th,' + r + ' .rt-table th,' + r + ' th.st-num{color:#374151 !important;opacity:1 !important}');
		o.push(r + ' .cbi-button-action{background:#2563eb !important;color:#fff !important}');
	});
	/* shared fixes: LuCI theme overrides on tab items and table rows (all non-default themes) */
	[n, sd, b, so].forEach(function(r) {
		o.push(r + ' ul.cbi-tabmenu li{max-width:none !important;height:auto !important;background:transparent !important;box-shadow:none}' + r + ' ul.cbi-tabmenu li a{height:auto !important;line-height:1.4 !important;white-space:nowrap;overflow:visible !important}');
		o.push(r + ' ul.cbi-tabmenu{background-image:none !important;border-bottom:0 !important}');
		o.push(r + ' ul.cbi-tabmenu li{border:0 !important;outline:0 !important}' + r + ' ul.cbi-tabmenu li::before,' + r + ' ul.cbi-tabmenu li::after{display:none !important}');
		o.push(r + ' .tr,' + r + ' .table-titles,' + r + ' .rt-table tr,' + r + ' .rt-table thead,' + r + ' .cbi-section-table-titles{background:transparent !important}');
	});
	o.push(sd + ' > ul.cbi-tabmenu{align-items:stretch !important}' + sd + ' ul.cbi-tabmenu li{width:100% !important;flex:none !important;box-sizing:border-box}' + sd + ' ul.cbi-tabmenu li a{width:100% !important;box-sizing:border-box;gap:8px;align-items:center}');
	o.push('@media (max-width:820px){' + sd + ' ul.cbi-tabmenu li{width:auto !important}}');
	return o.join('\n');
}

function store(k, v) { try { if (v === undefined) return window.localStorage.getItem(k); window.localStorage.setItem(k, v); } catch (e) {} return null; }

return view.extend({
	load: function() {
		return Promise.all([exec(['router-info']).catch(function() { return null; }), exec(['router-live']).catch(function() { return null; }), Promise.resolve(UsageView.load()).catch(function() { return null; })]);
	},

	/* ---------- helpers ---------- */
	run: function(args, okMsg) {
		var self = this;
		return execText(args).then(function() {
			if (okMsg) toast(okMsg);
			return self.refresh();
		}).catch(function(e) { toast('The command failed: ' + (e.message || e), 'danger'); });
	},
	refresh: function() {
		var self = this;
		return exec(['router-info']).then(function(d) { if (d) { self.info = d; self.updateInfo(); } }).catch(function() {});
	},
	ifaceLabel: function(i) { return i.alias || i.name; },
	defaultIface: function() {
		var l = (this.info && this.info.interfaces) || [];
		return l.filter(function(i) { return i['default'] && !/6$/.test(i.name); })[0] || l.filter(function(i) { return i['default']; })[0] ||
			l.filter(function(i) { return i.up && i.ip && i.name !== 'lan'; })[0];
	},

	/* ---------- page ---------- */
	render: function(r) {
		var self = this;
		this.info = r[0];
		if (!this.info)
			return E('div', {}, [E('style', {}, CSS), E('h2', {}, 'Control Center'),
				E('div', { 'class': 'rt-card' }, 'Could not read the router information. Is oDash installed correctly?')]);
		this.rates = {}; this.hist = { cpu: [] }; this.dh = {}; this.lp = null; this.cpuPct = null;
		this.dev = store('odash.ctl.dev') || '';
		this.tab = 'overview';
		var go = store('odash.ctl.go'); store('odash.ctl.go', '');
		if (go) this.tab = go;
		if (this.tab === 'led' || this.tab === 'settings') { store('odash.ctl.syspage', this.tab === 'led' ? 'leds' : 'settings'); this.tab = 'system'; }
		if (!NAV.some(function(n) { return n[0] === self.tab; })) this.tab = 'overview';
		this.el = {}; this.ifCells = {}; this.pingHist = {}; this.pingBusy = false; this.pingAuto = false; this.speedLog = [];
		try { this.custom = JSON.parse(store('odash.ctl.pinghosts') || '[]'); } catch (e) { this.custom = []; }

		this.secs = {
			overview: this.buildOverview(), devices: E('div', {}, [this.buildDevices()]), network: E('div', { 'class': 'rt-stack' }, [this.buildNetwork(), this.buildMwan(), this.buildWifi(), this.el.pw]),
			tests: this.buildTests(), samba: this.buildSamba(), usage: this.buildUsage(r[2]), system: E('div', {})
		};
		this.ledBox = this.buildLed(); this.sysParts = this.buildSystem();
		NAV.forEach(function(n) { self.secs[n[0]].style.display = 'none'; });
		/* the standard LuCI tab markup, so the tabs look like the tabs of every other LuCI page */
		var nav = E('ul', { 'class': 'cbi-tabmenu rt-nav' }, NAV.map(function(n) {
			var b = E('li', { 'class': 'cbi-tab-disabled' }, E('a', { 'href': '#', 'click': function(ev) { ev.preventDefault(); self.show(n[0]); } }, [icon(n[2], 15), ' ' + n[1]]));
			self.el['nav_' + n[0]] = b;
			return b;
		}));
		this.el.nav_samba.style.display = 'none';
		exec(['samba-info']).then(function(d) { if (d && d.installed) { self.el.nav_samba.style.display = ''; } else if (self.tab === 'samba') self.show('overview'); }).catch(function() {});
		this.root = E('div', {}, [E('style', {}, CSS), nav].concat(NAV.map(function(n) { return self.secs[n[0]]; })));
		this.applyTheme(store('odash.ctl.theme') || 'default');
		/* the oDash icon replaces the OpenWrt icon in the browser tab */
		try {
			document.querySelectorAll('link[rel~="icon"]').forEach(function(l) { l.parentNode.removeChild(l); });
			document.head.appendChild(E('link', { 'rel': 'icon', 'type': 'image/svg+xml', 'href': L.resource('odash/icon.svg') }));
		} catch (e) {}
		this.live(r[1]);
		this.updateInfo();
		this.show(this.tab);
		/* the other tabs prepare themselves one by one in the background, so they are already filled when you open them */
		var pre = [
			function() { self.devicesLoad(); },
			function() { if (self.tab !== 'network') { self.wifiLoad(); self.mwanLoad(); } },
			function() { if (self.tab !== 'samba') self.sambaLoad(); },
			function() { if (self.tab !== 'tests') self.speedHistLoad(); },
			/* the System page is built when the browser is idle, so it opens at once without slowing the first screen */
			function() { var f = function() { self.ensureSystem(); }; if (window.requestIdleCallback) window.requestIdleCallback(f, { timeout: 4000 }); else f(); }
		];
		pre.forEach(function(fn, i) { window.setTimeout(function() { try { if (!document.hidden) fn(); } catch (e) {} }, 700 + i * 500); });
		/* nothing polls while the browser tab is hidden or on a page that does not show the data */
		poll.add(function() { return document.hidden || (self.tab !== 'overview' && self.tab !== 'network') ? null : exec(['router-live']).then(function(l) { self.live(l); }).catch(function() {}); }, 3);
		poll.add(function() { return document.hidden || self.tab !== 'overview' || !self.fan ? null : self.fanLoad(); }, 5);
		poll.add(function() { return document.hidden || self.tab !== 'overview' ? null : self.sysLoad(); }, 30);
		poll.add(function() { return document.hidden || self.tab !== 'system' || !self.ledInit ? null : self.ledLoad(); }, 6);
		poll.add(function() {
			if (document.hidden || (self.tab !== 'overview' && self.tab !== 'network')) return null;
			if (self.tab === 'network') self.wifiLoad();
			return self.refresh();
		}, 10);
		return this.root;
	},

	show: function(t) {
		var self = this;
		this.tab = t; store('odash.ctl.tab', t);
		NAV.forEach(function(n) {
			self.secs[n[0]].style.display = n[0] === t ? '' : 'none';
			self.el['nav_' + n[0]].className = n[0] === t ? 'cbi-tab' : 'cbi-tab-disabled';
			if (self.el['li_' + n[0]]) self.el['li_' + n[0]].className = 'odash-subtab' + (n[0] === t ? ' active' : '');
		});
		try { var an = self.el['nav_' + t]; if (an && an.scrollIntoView) an.scrollIntoView({ block: 'nearest', inline: 'center' }); } catch (e) {}
		UsageView.paused = t !== 'usage' && t !== 'overview';
		if (t === 'usage' || t === 'overview') { setTimeout(function() { window.dispatchEvent(new Event('resize')); }, 0); if (UsageView.sampleLive && UsageView.tbody) UsageView.sampleLive(); }
		if (t === 'network') { this.apEditing = false; this.wifiLoad(); if (!this.mwDrag) { if (this.mw && this.mw.info && !this.mw.dirty) this.mwanDraw(); this.mwanLoad(); } }
		if (t === 'system') { this.ensureSystem(); this.ledLoad(); this.fanLoad(); }
		if (t === 'devices') this.devicesLoad();
		if (t === 'tests') { this.pingTick(); this.speedHistLoad(); }
		if (t === 'overview') { this.fanLoad(); this.sysLoad(); }
		if (t === 'samba') this.sambaLoad();
	},

	buildUsage: function(data) {
		var self = this, box = E('div', {});
		UsageView.embedded = true;
		Promise.resolve(UsageView.render(data)).then(function(n) {
			dcontent(box, n);
			if (self.el.liveSlot) dcontent(self.el.liveSlot, E('div', { 'class': 'cbi-map st' }, [UsageView.liveGrid, UsageView.onlineBox]));
			/* the Live / Not running badge sits at the right end of the tab bar */
			var put = function(k) {
				var ul = self.root && self.root.querySelector('ul.cbi-tabmenu');
				if (ul && UsageView.pill) { var li = E('li', { 'class': 'rt-live' }, UsageView.pill); ul.appendChild(li); }
				else if (k < 20) window.setTimeout(function() { put(k + 1); }, 150);
			};
			put(0);
		}).catch(function(e) { dcontent(box, E('div', { 'class': 'rt-card' }, 'Could not open the usage page: ' + (e.message || e))); });
		return box;
	},
	ensureSystem: function() {
		if (this.settingsBuilt) return;
		this.settingsBuilt = true;
		var self = this, P = this.sysParts, body = E('div', {});
		Promise.resolve().then(function() { return SettingsView.render(); }).then(function(n) { dcontent(body, n); }).catch(function(e) { dcontent(body, E('div', { 'class': 'rt-card' }, 'Could not open the settings: ' + (e.message || e))); });
		var settingsPage = E('div', {}, [body, E('div', { 'class': 'rt-row', 'style': 'margin-top:14px' }, [
			E('button', { 'class': 'cbi-button cbi-button-save', 'click': function(ev) { SettingsView.handleSave(ev); } }, 'Save'),
			E('button', { 'class': 'cbi-button cbi-button-positive', 'click': function(ev) { SettingsView.handleSaveApply(ev); } }, 'Save & Apply'),
			E('button', { 'class': 'cbi-button', 'click': function(ev) { SettingsView.handleReset(ev); } }, 'Reset')])]);
		var pages = { theme: [this.buildThemeCard()], fan: [P.fan], reboot: [P.reboot], leds: [this.ledBox], tz: [P.tz], domain: [P.domain], sched: [P.sched],
			bk: [P.bk], data: [this.buildDataCard()], update: [this.buildUpdateCard()], backup: [this.buildBackupCard()], settings: [settingsPage] };
		var GROUPS = [['Hardware', [['fan', 'Fan', 'temp'], ['leds', 'Status LEDs', 'bulb']]], ['Router', [['tz', 'Time zone', 'clock'], ['domain', 'Panel domain', 'world'], ['sched', 'Schedules', 'clock'], ['reboot', 'Reboot', 'power']]],
			['oDash', [['theme', 'Appearance', 'gear'], ['backup', 'Backup and data', 'download'], ['update', 'Update oDash', 'download'], ['settings', 'oDash settings', 'cpu']]]];
		this.sysPages = {}; this.sysBtns = {};
		var nav = E('div', { 'class': 'rt-card rt-sysn', 'style': 'display:none' }, []);
		GROUPS.forEach(function(g) {
			nav.appendChild(E('div', { 'class': 'rt-sysg' }, g[0]));
			g[1].forEach(function(it) {
				var b = E('button', { 'class': 'rt-sysi', 'type': 'button', 'click': function() { self.sysPage(it[0]); } }, [icon(it[2], 17), it[1]]);
				self.sysBtns[it[0]] = b; nav.appendChild(b);
			});
		});
		var right = E('div', { 'class': 'rt-sysr' }, []), grps = {}, GM = { fan: 'a', reboot: 'a', tz: 'b', domain: 'b', bk: 'd', data: 'd', update: 'd' };
		Object.keys(pages).forEach(function(k) {
			var d = E('div', { 'class': 'rt-sysp' }, pages[k]); self.sysPages[k] = d;
			if (GM[k]) {
				if (!grps[GM[k]]) { grps[GM[k]] = E('div', { 'class': 'rt-sys2' + (GM[k] === 'd' ? ' rt-sys3' : '') }, []); right.appendChild(grps[GM[k]]); }
				grps[GM[k]].appendChild(d); d.style.marginBottom = '0';
			} else right.appendChild(d);
		});
		dcontent(this.secs.system, E('div', { 'class': 'rt-sysl' }, [nav, right]));
		this.sysPage();
	},

	sysPage: function(id) {
		/* every part of System is on one page, in order; a request for a part scrolls to it */
		var p = this.sysPages && this.sysPages[id];
		if (this.sysPages && this.sysPages.fan) this.sysPages.fan.style.display = this.noFan ? 'none' : '';
		if (p && p.scrollIntoView && this.tab === 'system') try { p.scrollIntoView({ block: 'start' }); } catch (e) {}
	},

	applyTheme: function(name) {
		if (!THEMES.some(function(t) { return t[0] === name; })) name = 'default';
		this.theme = name;
		store('odash.ctl.theme', name);
		if (!document.getElementById('odash-theme-css')) document.head.appendChild(E('style', { 'id': 'odash-theme-css' }, themeCss()));
		if (THEME_FONTS[name] && !document.getElementById('odash-font-' + name)) document.head.appendChild(E('link', { 'id': 'odash-font-' + name, 'rel': 'stylesheet', 'href': 'https://fonts.googleapis.com/css2?family=' + THEME_FONTS[name] + '&display=swap' }));
		var r = this.root; if (!r) return;
		r.className = (r.className || '').replace(/\bodash-th-\S+/g, '').trim() + (name === 'default' ? '' : ' odash-th-' + name);
		window.setTimeout(function() { window.dispatchEvent(new Event('resize')); }, 50);
	},

	buildThemeCard: function() {
		var self = this, box = E('div', { 'class': 'rt-card', 'style': 'margin-bottom:14px' });
		var sw = {
			'default': ['#f4f4f5', '#3b82f6', '#18181b'], neon: ['#0b1020', '#22d3ee', '#f472b6'], sidebar: ['#f1f5f9', '#3b82f6', '#475569'],
			bento: ['#f5f0e8', '#ddd6fe', '#bbf7d0'], soft: ['#e8ebf0', '#4f6df5', '#fb923c']
		};
		var draw = function() {
			dcontent(box, [E('div', { 'class': 'rt-h' }, [icon('gear'), 'Appearance']),
				E('p', { 'class': 'rt-note' }, 'Choose how the panel looks. The theme is saved in this browser only; the layout and all features stay the same.'),
				E('div', { 'style': 'display:flex;flex-wrap:wrap;justify-content:center;gap:12px' }, THEMES.map(function(t) {
					var c = sw[t[0]], on = self.theme === t[0];
					return E('button', { 'class': 'cbi-button', 'style': 'display:block;flex:0 1 170px;min-width:140px;text-align:center;padding:10px;height:auto;border-width:2px;border-color:' + (on ? '#3b82f6' : 'rgba(128,128,128,.35)'), 'click': function() { self.applyTheme(t[0]); draw(); } }, [
						E('div', { 'style': 'height:54px;border-radius:8px;background:' + c[0] + ';display:flex;gap:6px;align-items:flex-end;padding:8px;box-sizing:border-box' }, [E('i', { 'style': 'flex:1;height:70%;border-radius:4px;background:' + c[1] }), E('i', { 'style': 'flex:1;height:45%;border-radius:4px;background:' + c[2] }), E('i', { 'style': 'flex:1;height:85%;border-radius:4px;background:' + c[1] })]),
						E('div', { 'style': 'margin-top:8px;font-weight:700' }, t[1] + (on ? '  ✔' : ''))]);
				}))]);
		};
		draw();
		return box;
	},

	/* export / import of everything oDash keeps, for a router reset and reinstall */
	buildDataCard: function() {
		var self = this, file = E('input', { 'type': 'file', 'accept': '.odash,.txt,.b64', 'style': 'display:none' });
		file.addEventListener('change', function() { if (file.files && file.files[0]) self.importData(file.files[0]); file.value = ''; });
		return E('div', { 'class': 'rt-card', 'style': 'margin-top:18px' }, [
			E('div', { 'class': 'rt-h' }, [icon('download'), 'Export and import oDash data']),
			E('p', { 'class': 'rt-note', 'style': 'margin:0 0 10px' }, 'Before you reset the router, export everything oDash keeps: settings, device names and types, speed limits, blocks, fixed IPs, schedules, LED settings, and the usage history. After you reinstall oDash, import the file.'),
			E('div', { 'class': 'rt-row' }, [
				E('button', { 'class': 'cbi-button cbi-button-action rt-btn', 'click': function() { self.exportData(this); } }, [icon('download', 16), 'Export data']),
				E('button', { 'class': 'cbi-button rt-btn', 'click': function() { file.click(); } }, [icon('plus', 16), 'Import data']), file]),
			E('div', { 'class': 'rt-note' }, 'Importing replaces the current oDash settings and history. Wi-Fi, PassWall2 and other OpenWrt settings are not part of this file; use System > Backup for them.')]);
	},

	/* weekly backup of the oDash data to a folder on a disk */
	buildBackupCard: function() {
		var self = this, box = E('div', { 'class': 'rt-card', 'style': 'margin-top:18px' }, E('p', { 'class': 'spinning' }, 'Loading...'));
		function load() {
			return Promise.all([exec(['backup-get']), exec(['disk-list']).catch(function() { return null; })]).then(function(r) { draw(r[0], r[1]); })
				.catch(function(e) { dcontent(box, [E('div', { 'class': 'rt-h' }, [icon('download'), 'Scheduled backup']), E('p', { 'class': 'rt-warn' }, 'Could not read the backup settings: ' + (e.message || e))]); });
		}
		function act(args, msg) {
			return execText(args).then(function() { toast(msg); return load(); }).catch(function(e) { toast('The command failed: ' + (e.message || e), 'danger'); });
		}
		function draw(d, dk) {
			var on = E('input', { 'type': 'checkbox' }); on.checked = !!d.enabled;
			var sug = ['/etc/odash/backups'];
			if (dk && dk.disks) dk.disks.forEach(function(x) { x.parts.forEach(function(p) { if (p.mp) sug.push(p.mp + '/odash-backup'); }); });
			var dir = E('input', { 'type': 'text', 'class': 'cbi-input-text', 'value': d.dir || '/etc/odash/backups', 'placeholder': '/etc/odash/backups', 'list': 'rt-bk-dirs', 'autocomplete': 'off', 'style': 'width:100%;box-sizing:border-box' });
			var dl = E('datalist', { 'id': 'rt-bk-dirs' }, sug.map(function(x) { return E('option', { 'value': x }); }));
			var days = [['*', 'Every day'], ['6', 'Saturday'], ['0', 'Sunday'], ['1', 'Monday'], ['2', 'Tuesday'], ['3', 'Wednesday'], ['4', 'Thursday'], ['5', 'Friday']];
			var dow = E('select', { 'class': 'cbi-input-select' }, days.map(function(o) { return E('option', { 'value': o[0] }, o[1]); })); dow.value = d.dow || '0';
			var tm = E('input', { 'type': 'time', 'class': 'cbi-input-text', 'value': d.time || '04:30' });
			var keep = E('input', { 'type': 'number', 'class': 'cbi-input-text', 'min': 1, 'max': 50, 'value': d.keep || 3, 'style': 'width:80px' });
			var rows = (d.files || []).map(function(f) {
				return E('tr', {}, [E('td', {}, E('span', { 'class': 'rt-addr' }, f.name)), E('td', {}, bytes(f.size)), E('td', { 'style': 'text-align:right;white-space:nowrap' }, [E('button', { 'class': 'cbi-button rt-btn', 'click': function() {
					ui.showModal('Restore ' + f.name + '?', [E('p', {}, 'The current oDash settings, device names, schedules and history are replaced by this backup. oDash restarts for a few seconds.'),
						E('div', { 'class': 'right' }, [E('button', { 'class': 'btn', 'click': ui.hideModal }, 'Cancel'), ' ', E('button', { 'class': 'btn cbi-button-negative', 'click': function() {
							ui.hideModal();
							execText(['backup-restore', f.name]).then(function() { toast('Restored. The page reloads now.'); window.setTimeout(function() { window.location.reload(); }, 2500); })
								.catch(function(e) { toast('Could not restore: ' + (e.message || e), 'danger'); });
						} }, 'Restore')])]);
				} }, 'Restore'), ' ', E('button', { 'class': 'cbi-button cbi-button-negative rt-btn', 'click': function() {
					ui.showModal('Delete ' + f.name + '?', [E('p', {}, 'This backup file is deleted from the folder. It cannot be undone.'),
						E('div', { 'class': 'right' }, [E('button', { 'class': 'btn', 'click': ui.hideModal }, 'Cancel'), ' ', E('button', { 'class': 'btn cbi-button-negative', 'click': function() {
							ui.hideModal(); act(['backup-delete', f.name], 'The backup was deleted.');
						} }, 'Delete')])]);
				} }, 'Delete')])]);
			});
			dcontent(box, [
				E('div', { 'class': 'rt-h' }, [icon('download'), 'Scheduled backup', E('span', { 'class': 'rt-sp' }), badge(d.enabled ? 'On' : 'Off', d.enabled ? 'rt-on' : 'rt-off')]),
				E('p', { 'class': 'rt-note', 'style': 'margin:0 0 10px' }, 'oDash saves a copy of its data (settings, device names, schedules, usage history) to a folder on a schedule and keeps the newest copies. By default the folder is on the router itself; choose a folder on a disk to keep them elsewhere.'),
				d.enabled && !d.mounted ? E('p', { 'class': 'rt-warn', 'style': 'color:#d97706' }, 'The disk for this folder is not mounted, so no backup can be written. Mount it in the Samba tab.') : null,
				E('div', { 'style': 'display:grid;grid-template-columns:130px minmax(0,1fr);gap:8px 12px;align-items:center;font-size:13px;max-width:560px' }, [
					E('span', {}, 'Backups'), E('label', { 'class': 'rt-wl' }, [on, ' Make a backup on a schedule']),
					E('span', {}, 'Folder'), E('div', {}, [dir, dl]),
					E('span', {}, 'Day'), dow, E('span', {}, 'Time'), tm, E('span', {}, 'Copies to keep'), keep,
					E('span', {}, 'Used'), E('span', {}, bytes(d.total || 0) + ' in ' + (d.files || []).length + (((d.files || []).length === 1) ? ' copy' : ' copies') + (d.free ? ' \u00b7 ' + bytes(d.free) + ' free' : ''))]),
				E('div', { 'class': 'rt-row', 'style': 'margin-top:12px' }, [
					E('button', { 'class': 'cbi-button cbi-button-save rt-btn', 'click': function() { act(['backup-set', on.checked ? '1' : '0', dir.value.trim(), String(keep.value || 8), dow.value, tm.value || '04:30'], 'The backup settings were saved.'); } }, 'Save'),
					E('button', { 'class': 'cbi-button cbi-button-action rt-btn', 'disabled': d.dir && d.mounted ? null : 'disabled', 'click': function() { act(['backup-run'], 'The backup was written.'); } }, 'Back up now')]),
				rows.length ? E('table', { 'class': 'rt-table', 'style': 'margin-top:12px' }, E('tbody', {}, rows)) : null]);
		}
		load();
		return box;
	},

	/* update oDash from the panel: upload the release package (oDash-VERSION.tar.gz) */
	buildUpdateCard: function() {
		var self = this, ver = E('b', {}, '...');
		execText(['pkg-version']).then(function(v) { dcontent(ver, String(v || '').trim() || '?'); }).catch(function() { dcontent(ver, '?'); });
		var file = E('input', { 'type': 'file', 'accept': '.gz,.tgz', 'style': 'display:none' });
		file.addEventListener('change', function() { if (file.files && file.files[0]) self.updatePackage(file.files[0]); file.value = ''; });
		return E('div', { 'class': 'rt-card', 'style': 'margin-top:18px' }, [
			E('div', { 'class': 'rt-h' }, [icon('download'), 'Update oDash']),
			E('p', { 'class': 'rt-note', 'style': 'margin:0 0 10px' }, ['Installed version: ', ver, '. Choose the new release file (oDash-VERSION.tar.gz) and oDash installs it by itself. Your settings and history are kept.']),
			E('div', { 'class': 'rt-row' }, [E('button', { 'class': 'cbi-button cbi-button-action rt-btn', 'click': function() { file.click(); } }, [icon('plus', 16), 'Choose the package']), file])]);
	},

	updatePackage: function(f) {
		var rd = new FileReader();
		rd.onload = function() {
			var bin = '', u = new Uint8Array(rd.result);
			for (var i = 0; i < u.length; i += 8192) bin += String.fromCharCode.apply(null, u.subarray(i, i + 8192));
			var txt = window.btoa(bin);
			ui.showModal('Install ' + f.name + '?', [
				E('p', {}, 'oDash is replaced by this version and restarts. The page reloads by itself when it is done. Your settings and history are kept.'),
				E('div', { 'class': 'right' }, [E('button', { 'class': 'btn', 'click': ui.hideModal }, 'Cancel'), ' ',
					E('button', { 'class': 'btn cbi-button-positive', 'click': function() {
						ui.showModal('Updating...', [E('p', { 'class': 'spinning' }, 'Uploading the package...')]);
						var parts = [], N = 24000;
						for (var i = 0; i < txt.length; i += N) parts.push(txt.slice(i, i + N));
						var chain = Promise.resolve();
						parts.forEach(function(c, k) { chain = chain.then(function() { return execText(['pkg-chunk', String(k), c]); }); });
						chain.then(function() { return execText(['pkg-apply']); })
							.then(function() {
								ui.showModal('Updating...', [E('p', { 'class': 'spinning' }, 'Installing. This takes about 20 seconds...')]);
								return sleep(14000);
							})
							.then(function() {
								var n = 0;
								return (function wait() { return execText(['pkg-version']).catch(function() { if (++n > 12) throw new Error('timeout'); return sleep(3000).then(wait); }); })();
							})
							.then(function() { ui.hideModal(); toast('oDash was updated. The page reloads now.'); window.setTimeout(function() { window.location.reload(); }, 1500); })
							.catch(function(e) { ui.hideModal(); toast('The update failed: ' + (e.message || e), 'danger'); });
					} }, 'Install')])]);
		};
		rd.readAsArrayBuffer(f);
	},

	exportData: function(btn) {
		btn.disabled = true;
		execText(['data-export']).then(function(out) {
			var b64 = String(out || '').trim();
			if (!b64) throw new Error('empty');
			var d = new Date(), pad = function(n) { return (n < 10 ? '0' : '') + n; };
			var name = 'odash-data-' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + '-' + pad(d.getHours()) + pad(d.getMinutes()) + '.odash';
			var blob = new Blob([b64], { type: 'text/plain' }), a = E('a', { 'href': URL.createObjectURL(blob), 'download': name, 'style': 'display:none' });
			document.body.appendChild(a); a.click();
			window.setTimeout(function() { URL.revokeObjectURL(a.href); document.body.removeChild(a); }, 1000);
			toast('The data file "' + name + '" is downloading. Keep it somewhere safe.');
		}).catch(function(e) { toast('Could not export: ' + (e.message || e), 'danger'); }).then(function() { btn.disabled = false; });
	},

	importData: function(f) {
		var rd = new FileReader();
		rd.onload = function() {
			var txt = String(rd.result || '').replace(/\s+/g, '');
			if (!/^[A-Za-z0-9+\/=]{20,}$/.test(txt)) return toast('This is not an oDash data file.', 'danger');
			ui.showModal('Import oDash data?', [
				E('p', {}, 'The current oDash settings, device names, schedules and usage history are replaced by the content of "' + f.name + '". oDash restarts for a few seconds.'),
				E('div', { 'class': 'right' }, [E('button', { 'class': 'btn', 'click': ui.hideModal }, 'Cancel'), ' ',
					E('button', { 'class': 'btn cbi-button-negative', 'click': function() {
						ui.showModal('Importing...', [E('p', { 'class': 'spinning' }, 'Uploading the data...')]);
						var parts = [], N = 24000;
						for (var i = 0; i < txt.length; i += N) parts.push(txt.slice(i, i + N));
						var chain = Promise.resolve();
						parts.forEach(function(c, k) { chain = chain.then(function() { return execText(['data-import-chunk', String(k), c]); }); });
						chain.then(function() { return execText(['data-import-apply']); })
							.then(function() { ui.hideModal(); toast('The data was imported. The page reloads now.'); window.setTimeout(function() { window.location.reload(); }, 2500); })
							.catch(function(e) { ui.hideModal(); toast('Could not import: ' + (e.message || e), 'danger'); });
					} }, 'Import')])]);
		};
		rd.readAsText(f);
	},

	/* ---------- overview ---------- */
	buildOverview: function() {
		var self = this;
		this.el.conn = E('div', {});
		this.el.sys = E('div', {});
		this.el.ctl = E('div', { 'class': 'rt-card' }); this.el.pw = E('div', { 'class': 'rt-card' }); 

		this.el.freq = E('b', {}, '-'); this.el.loadNow = E('b', {}, '-');
		this.el.temps = E('div', { 'class': 'rt-note' }, '');
		this.sysRange = +(store('odash.ctl.sysrange') || 60) || 60; this.sysPts = [];
		this.chartCpu = makeChart(50, ['#8b5cf6'], 240);
		this.chartTemp = makeChart(120, ['#ef4444'], 240);
		var R3 = this.rings3 = rings3();
		function lv(i, key) { var el = E('b', {}, '-'); return { el: el, set: function(v, label) { R3.arc(i, v); el.textContent = label; } }; }
		this.ringCpu = lv(0); this.ringRam = lv(1); this.ringDisk = lv(2); this.ringTemp = ring('#ef4444');
		this.el.ramSub = E('div', { 'class': 'rt-gsub' }, '-'); this.el.diskSub = E('div', { 'class': 'rt-gsub' }, '-'); this.el.cpuSub = E('div', { 'class': 'rt-gsub' }, '-'); this.el.tempSub = E('div', { 'class': 'rt-gsub' }, '-');
		function gt(title, r, sub) { return E('div', { 'class': 'rt-card rt-gt' }, [E('div', { 'class': 'rt-gtt' }, title), r.el, sub]); }
		['cpuAvg', 'cpuMax', 'tAvg', 'tMax', 'tMin'].forEach(function(k) { this.el[k] = E('b', {}, '-'); }, this);
		this.el.cpuMeta = E('div', { 'class': 'rt-note', 'style': 'margin:6px 0 0' }, '');
		this.el.mem = E('div', {}); this.el.sysNote = E('div', { 'class': 'rt-note' }, '');
		this.el.cpuEmpty = E('div', { 'class': 'rt-empty' }, 'Collecting data...'); this.el.tmpEmpty = E('div', { 'class': 'rt-empty' }, 'Collecting data...');
		var self = this;
		function ranges() {
			return E('div', { 'class': 'rt-rg' }, [[60, '1 h'], [360, '6 h'], [1440, '24 h']].map(function(r) {
				return E('button', { 'class': 'rt-pill' + (self.sysRange === r[0] ? ' on' : ''), 'data-r': r[0], 'click': function() {
					self.sysRange = r[0]; store('odash.ctl.sysrange', r[0]); self.paintSys(); self.sysLoad();
				} }, r[1]);
			}));
		}
		function mini(l, v) { return E('div', { 'class': 'rt-mini' }, [E('small', {}, l), v]); }
		this.el.rg1 = ranges(); this.el.rg2 = ranges();
		var cpu = E('div', { 'class': 'rt-card' }, [E('div', { 'class': 'rt-h' }, [icon('cpu'), 'CPU', E('span', { 'style': 'margin-left:auto' }, this.el.rg1)]),
			E('div', { 'class': 'rt-top' }, [E('div', { 'class': 'rt-minis' }, [mini('Average', this.el.cpuAvg), mini('Peak', this.el.cpuMax), mini('Load', this.el.loadNow), mini('Frequency', this.el.freq)])]),
			E('div', { 'class': 'rt-hw' }, [this.chartCpu.el, this.el.cpuEmpty])]);
		var tmp = E('div', { 'class': 'rt-card' }, [E('div', { 'class': 'rt-h' }, [icon('temp'), 'Temperature', E('span', { 'style': 'margin-left:auto' }, this.el.rg2)]),
			E('div', { 'class': 'rt-top' }, [E('div', { 'class': 'rt-minis' }, [mini('Average', this.el.tAvg), mini('Peak', this.el.tMax), mini('Lowest', this.el.tMin)])]),
			E('div', { 'class': 'rt-hw' }, [this.chartTemp.el, this.el.tmpEmpty]), this.el.temps, this.el.sysNote]);
		this.el.hotBig = E('b', { 'class': 'rt-cpuv' }, '-'); this.el.rpmBig = E('b', { 'class': 'rt-cpuv' }, '-');
		this.buildFan();
		var FE = this.fan.el;
		function lrow(col, name, val, sub) { return E('div', { 'class': 'rt-hwl' }, [E('i', { 'style': 'background:' + col }), E('span', {}, name), val.el, sub || '']); }
		this.el.hwFan = E('div', { 'style': 'display:none' }, [E('small', {}, 'Fan'), E('div', { 'class': 'rt-hwbig', 'style': 'color:#3b82f6' }, [this.el.rpmBig, E('em', {}, 'RPM')]),
			E('div', { 'class': 'rt-hwchips' }, [this.el.chipMode = E('span', {}, '-'), this.el.chipLvl = E('span', {}, '-')])]);
		this.el.hwFoot = E('div', { 'class': 'rt-hwfoot', 'style': 'display:none' }, [FE.mscale, FE.sub]);
		this.el.hotBig.className = 'rt-hwbig'; this.el.hotBig.style.color = '#ef4444'; this.el.rpmBig.className = 'rt-hwbig'; this.el.rpmBig.style.color = '#3b82f6'; this.el.rpmBig.style.fontSize = 'inherit';
		var hw = E('div', { 'class': 'rt-card', 'style': 'margin-top:12px' }, [E('div', { 'class': 'rt-h' }, [icon('cpu'), 'Hardware', E('span', { 'style': 'margin-left:auto;display:inline-flex;gap:10px;align-items:center;flex-wrap:wrap;justify-content:flex-end' }, [FE.alertBadge, this.el.rg1,
				this.el.hwBtn = E('button', { 'class': 'cbi-button rt-btn', 'style': 'display:none', 'click': function() { self.fan.openDlg(); } }, [icon('cpu', 14), 'Settings'])])]),
			E('div', { 'class': 'rt-hwc' }, [R3.el,
				E('div', { 'class': 'rt-hwlg' }, [lrow('#8b5cf6', 'CPU load', this.ringCpu), lrow('#3b82f6', 'RAM', this.ringRam, this.el.ramSub), lrow('#10b981', 'Storage', this.ringDisk),
					E('div', { 'class': 'rt-hwsp' }, [this.chartCpu.el, this.el.cpuEmpty])]),
				E('div', { 'class': 'rt-hwr' }, [E('div', {}, [E('small', {}, 'Temperature'), E('div', { 'class': 'rt-hwbig' }, [this.el.hotBig, E('em', {}, '\u00b0C')])]), this.el.hwFan])]),
			this.el.hwFoot, E('div', { 'style': 'font-size:12px;opacity:.7;margin-top:6px' }, FE.m_why), this.el.temps]);
		this.el.liveSlot = E('div', {});
		return E('div', { 'class': 'rt-ovwrap' }, [this.el.liveSlot, E('div', { 'class': 'rt-grid rt-ovtop' }, [E('div', { 'class': 'rt-card rt-compact rt-info' }, [this.el.conn]), E('div', { 'class': 'rt-card rt-compact rt-info' }, [this.el.sys])]), hw]);
	},

	drawOverview: function() {
		var self = this, d = this.info;
		var up = this.defaultIface();
		var memUsed = d.mem_total - d.mem_free, memPct = d.mem_total ? Math.round(memUsed * 100 / d.mem_total) : 0;

		function gl(rows) { return E('div', { 'class': 'rt-gl' }, rows.filter(function(r) { return r[1] != null && r[1] !== ''; }).map(function(r) { return E('div', {}, [E('span', {}, r[0]), E('span', {}, r[1])]); })); }
		var u = +d.uptime || 0, UD = Math.floor(u / 86400), UH = Math.floor(u % 86400 / 3600), UM = Math.floor(u % 3600 / 60);
		function ub(v, l) { return E('div', { 'class': 'rt-ub' }, [E('b', {}, String(v).length < 2 ? '0' + v : String(v)), E('small', {}, l)]); }
		dcontent(this.el.sys, [E('div', { 'class': 'rt-h' }, [icon('cpu'), 'System']),
			E('div', { 'class': 'rt-up' }, [ub(UD, 'Days'), E('i', {}, ':'), ub(UH, 'Hours'), E('i', {}, ':'), ub(UM, 'Minutes')]),
			gl([['Model', d.model], ['Hostname', d.hostname], ['Firmware', d.release], ['Kernel', d.kernel], ['Router time', d.time + ' (' + d.tzabbr + ')']])]);
		dcontent(this.el.mem, [E('div', { 'class': 'rt-note', 'style': 'margin:0 0 4px' }, 'Memory: ' + mb(memUsed) + ' used of ' + mb(d.mem_total) + ' (' + memPct + '%)'),
			E('div', { 'class': 'rt-bar' }, E('i', { 'style': 'width:' + memPct + '%' }))]);

		if (up)
			dcontent(this.el.conn, [E('div', { 'class': 'rt-h' }, [icon('wifi'), 'Upstream connection', E('span', { 'class': 'rt-sub' }, up.up ? badge('Connected', 'rt-on') : badge('Down', 'rt-bad'))]),
				gl([['IP address', up.ip ? up.ip + (up.mask ? '/' + up.mask : '') : '-'], ['Interface', self.ifaceLabel(up) + (up.alias ? ' (' + up.name + ')' : '')], ['Connection type', (up.proto || '').toUpperCase()], ['Device', up.device],
					['Gateway', d.gateway || up.gateway], ['DNS servers', up.dns], ['Wi-Fi network', d.ssid], ['Signal', d.signal ? d.signal + ' dBm' : '']])]);
		else
			dcontent(this.el.conn, [E('div', { 'class': 'rt-h' }, [icon('wifi'), 'Upstream connection']), E('p', {}, 'No upstream connection with an IPv4 address was found.')]);

		var pw = d.passwall || {};
		this.drawPw(pw);
		var rbBtn = E('button', { 'class': 'cbi-button cbi-button-negative rt-btn', 'click': function() {
			ui.showModal('Reboot the router?', [
				E('p', {}, 'The internet will be down for about two minutes. oDash saves its statistics before it stops.'),
				E('div', { 'class': 'right' }, [E('button', { 'class': 'btn', 'click': ui.hideModal }, 'Cancel'), ' ',
					E('button', { 'class': 'btn cbi-button-negative', 'click': function() { self.reboot(); } }, 'Reboot')])]);
		} }, [icon('power', 16), 'Reboot']);
		dcontent(this.el.ctl, [E('div', { 'class': 'rt-h' }, [icon('power'), 'Reboot']),
			E('div', { 'class': 'rt-ctl' }, [E('div', { 'class': 'rt-note', 'style': 'margin:0;flex:1 1 300px' }, 'Restarts the router. The internet is down for about two minutes.'), rbBtn])]);
	},

	/* PassWall2 card: main switch, main node and the proxy switches */
	pwLoad: function() {
		var self = this;
		return exec(['passwall-info']).then(function(r) { self.pwData = r; self.drawPw(); }).catch(function() { self.pwData = { installed: false }; self.drawPw(); });
	},
	pwSet: function(args, msg) {
		var self = this;
		return execText(args).then(function() { toast(msg); window.setTimeout(function() { self.pwLoad(); self.refresh(); }, 1500); })
			.catch(function(e) { toast('The command failed: ' + (e.message || e), 'danger'); });
	},
	drawPw: function(pw) {
		var self = this;
		pw = pw || (this.info && this.info.passwall) || {};
		if (!this.el.pw) return;
		var h = E('div', { 'class': 'rt-h' }, [icon('shield'), 'PassWall2']);
		if (!pw.installed) { dcontent(this.el.pw, [h, E('p', { 'class': 'rt-note' }, 'PassWall2 is not installed.')]); return; }
		var state = pw.enabled ? (pw.running ? badge('Enabled and running', 'rt-on') : badge('Enabled, starting...', 'rt-warn')) : badge('Disabled', 'rt-off');
		var sw = function(on, title, fn) { return E('button', { 'class': 'rt-ios' + (on ? ' on' : ''), 'role': 'switch', 'aria-checked': on ? 'true' : 'false', 'title': title, 'click': fn }); };
		var main = sw(pw.enabled, pw.enabled ? 'Turn off PassWall2' : 'Turn on PassWall2', function() {
			var turnOff = pw.enabled;
			var go = function() { ui.hideModal(); self.run(['router-passwall', turnOff ? 'off' : 'on'], turnOff ? 'PassWall2 is being turned off.' : 'PassWall2 is being turned on.'); };
			if (!turnOff) return go();
			ui.showModal('Turn off PassWall2?', [
				E('p', {}, 'Traffic will no longer go through the proxy, and the sites that depend on it may stop working.'),
				E('div', { 'class': 'right' }, [E('button', { 'class': 'btn', 'click': ui.hideModal }, 'Cancel'), ' ',
					E('button', { 'class': 'btn cbi-button-negative', 'click': go }, 'Turn off')])]);
		});
		var rows = [E('div', { 'class': 'rt-ctl' }, [E('div', {}, [E('div', { 'class': 'rt-ctl-t' }, ['Main switch', state]), E('div', { 'class': 'rt-note' }, 'Same switch as "Main switch" in the PassWall2 settings.')]), main])];
		dcontent(this.el.pw, [h].concat(rows));
	},

	/* ---------- live data (every 2 seconds) ---------- */
	live: function(l) {
		if (!l) return;
		var p = this.lp, self = this;
		this.lp = l;
		/* CPU % and speeds need two samples: take the second one right away instead of waiting for the next poll */
		if (!p && !this.liveSeed) {
			this.liveSeed = true;
			setTimeout(function() { exec(['router-live']).then(function(n) { self.live(n); }).catch(function() {}); }, 700);
		}
		if (p && l.up > p.up) {
			var dt = l.up - p.up, pm = {}, r = {};
			p.net.forEach(function(n) { pm[n.dev] = n; });
			l.net.forEach(function(n) {
				var o = pm[n.dev];
				if (o && n.rx >= o.rx && n.tx >= o.tx) r[n.dev] = { rx: (n.rx - o.rx) / dt, tx: (n.tx - o.tx) / dt };
			});
			this.rates = r;
			var dT = l.cpu_total - p.cpu_total, dI = l.cpu_idle - p.cpu_idle;
			this.cpuPct = dT > 0 ? Math.max(0, Math.min(100, 100 * (1 - dI / dT))) : null;
			Object.keys(r).forEach(function(k) {
				var h = this.dh[k] || (this.dh[k] = { rx: [], tx: [] });
				h.rx.push(r[k].rx * 8); h.tx.push(r[k].tx * 8);
				while (h.rx.length > CAP) { h.rx.shift(); h.tx.shift(); }
			}, this);
			if (this.cpuPct != null) this.hist.cpu.push(this.cpuPct);
			while (this.hist.cpu.length > CAP) this.hist.cpu.shift();
		}
		this.paintLive();
	},

	sysLoad: function() {
		var self = this;
		return exec(['router-sysh', String(this.sysRange)]).then(function(d) { self.sysPts = (d && d.pts) || []; self.paintSys(); }).catch(function() {});
	},

	paintSys: function() {
		var p = this.sysPts, N = 240, step = Math.max(1, Math.ceil(p.length / N)), cpu = [], tmp = [];
		for (var i = 0; i < p.length; i += step) {
			var c = 0, t = 0, n = 0;
			for (var j = i; j < Math.min(p.length, i + step); j++) { c += p[j][1]; t += p[j][2]; n++; }
			cpu.push(c / n); tmp.push(t / n);
		}
		var self = this;
		[this.el.rg1, this.el.rg2].forEach(function(g) {
			Array.prototype.forEach.call(g.childNodes, function(b) { b.className = 'rt-pill' + (+b.getAttribute('data-r') === self.sysRange ? ' on' : ''); });
		});
		function st(a) { return a.length ? { avg: a.reduce(function(x, y) { return x + y; }, 0) / a.length, max: Math.max.apply(null, a), min: Math.min.apply(null, a) } : null; }
		var rc = st(p.map(function(x) { return x[1]; })), rt = st(p.map(function(x) { return x[2]; }));
		this.el.cpuEmpty.style.display = p.length < 2 ? '' : 'none'; this.el.tmpEmpty.style.display = p.length < 2 ? '' : 'none';
		this.el.cpuAvg.textContent = rc ? rc.avg.toFixed(0) + '%' : '-'; this.el.cpuMax.textContent = rc ? rc.max + '%' : '-';
		this.el.tAvg.textContent = rt ? rt.avg.toFixed(0) + ' °C' : '-'; this.el.tMax.textContent = rt ? rt.max + ' °C' : '-'; this.el.tMin.textContent = rt ? rt.min + ' °C' : '-';
		this.chartCpu.set([cpu], function(v) { return v.toFixed(0) + '%'; }, 100);
		this.chartTemp.set([tmp], function(v) { return v.toFixed(0) + ' °C'; }, Math.ceil((Math.max.apply(null, tmp.concat([30])) + 5) / 10) * 10);
		this.el.sysNote.textContent = 'One sample a minute, recorded on the router even when this page is closed. Cleared when the router restarts.';
	},

	paintLive: function() {
		var self = this, l = this.lp, h = this.hist;
		if (!l || !this.ringCpu) return;
		this.ringCpu.set(this.cpuPct, this.cpuPct != null ? this.cpuPct.toFixed(0) + '%' : '-', 100);
		this.el.freq.textContent = l.freq ? l.freq + ' MHz' : '-';
		this.el.loadNow.textContent = l.load ? l.load.split(' ')[0] : '-';
		var hot = (l.temps || []).reduce(function(m, t) { return Math.max(m, t.c); }, -1);
		this.el.cpuSub.textContent = (l.freq ? l.freq + ' MHz' : '') + (l.load ? ' \u00b7 load ' + l.load.split(' ')[0] : '');
		var mu = l.mem_total - l.mem_free, mp = l.mem_total ? mu * 100 / l.mem_total : 0;
		this.ringRam.set(mp, Math.round(mp) + '%', 100); this.el.ramSub.textContent = mb(mu) + ' of ' + mb(l.mem_total);
		var dp = l.disk_total ? l.disk_used * 100 / l.disk_total : 0;
		this.ringDisk.set(dp, l.disk_total ? Math.round(dp) + '%' : 'n/a', 100); this.el.diskSub.textContent = l.disk_total ? bytes(l.disk_used * 1024) + ' of ' + bytes(l.disk_total * 1024) : '';
		this.el.tempSub.textContent = (l.temps || []).length ? l.temps.map(function(t) { return t.name.replace('_hwmon', '') + ' ' + Math.round(t.c) + '\u00b0'; }).join(' \u00b7 ') : '';
		if (this.el.hotBig) this.el.hotBig.textContent = hot >= 0 ? hot.toFixed(0) : '-';
		this.ringTemp.set(hot >= 0 ? hot : null, hot >= 0 ? hot.toFixed(0) + '\u00b0' : 'n/a', 100);
		this.el.temps.textContent = (l.temps || []).length > 1 ? l.temps.map(function(t) { return t.name + ': ' + t.c + ' °C'; }).join('   ') : '';
		var nm = {};
		l.net.forEach(function(n) { nm[n.dev] = n; });
		Object.keys(this.ifCells).forEach(function(k) {
			var c = self.ifCells[k], n = nm[c.dev], r = self.rates[c.dev];
			if (!n) return;
			c.rx.textContent = bytes(n.rx); c.tx.textContent = bytes(n.tx);
			c.rxr.textContent = r ? rate(r.rx) : ''; c.txr.textContent = r ? rate(r.tx) : '';
			var dh = self.dh[c.dev]; if (dh) c.spark.set(dh.rx, dh.tx);
			if (c.bigRx) { c.bigRx.textContent = r ? rate(c.swap ? r.tx : r.rx) : '-'; c.bigTx.textContent = r ? rate(c.swap ? r.rx : r.tx) : '-'; }
		});
	},

	/* ---------- network ---------- */
	buildNetwork: function() {
		var self = this;
		this.el.ifc = E('div', {});
		var gear = E('button', { 'class': 'rt-gear', 'title': 'LAN address settings', 'click': function() { self.lanDialog(); } }, icon('gear', 16));
		var ifc = E('div', { 'class': 'rt-card rt-wide rt-net' }, [E('div', { 'class': 'rt-h' }, [icon('router'), 'Network interfaces and live traffic',
			E('span', { 'class': 'rt-sub', 'style': 'margin-left:auto' }, [E('i', { 'class': 'rt-sw', 'style': 'background:#3b82f6' }), 'received ', E('i', { 'class': 'rt-sw', 'style': 'background:#f59e0b;margin-left:8px' }), 'sent']), gear]), this.el.ifc]);
		this.el.lanIp = E('input', { 'type': 'text', 'class': 'cbi-input-text' });
		this.el.lanPre = E('input', { 'type': 'text', 'class': 'cbi-input-text', 'style': 'width:70px;min-width:70px' });

		/* DNS servers */
		this.el.dnsIface = E('select', { 'class': 'cbi-input-select', 'change': function() { self.fillDns(); } });
		this.el.dns1 = E('input', { 'type': 'text', 'class': 'cbi-input-text', 'placeholder': 'First DNS server' });
		this.el.dns2 = E('input', { 'type': 'text', 'class': 'cbi-input-text', 'placeholder': 'Second DNS server (optional)' });
		this.el.dnsNow = E('div', { 'class': 'rt-note' }, '');
		var presets = [['Cloudflare', '1.1.1.1', '1.0.0.1'], ['Google', '8.8.8.8', '8.8.4.4'], ['Quad9', '9.9.9.9', '149.112.112.112']];
		var dnsCard = card('world', 'DNS servers', E('div', {}, [
			E('div', { 'class': 'rt-row', 'style': 'margin-bottom:10px' }, [E('span', { 'class': 'rt-muted' }, 'Interface'), this.el.dnsIface]),
			E('div', { 'class': 'rt-row' }, [this.el.dns1, this.el.dns2]),
			E('div', { 'class': 'rt-row', 'style': 'margin-top:10px' }, presets.map(function(p) {
				return E('button', { 'class': 'cbi-button', 'click': function() { self.el.dns1.value = p[1]; self.el.dns2.value = p[2]; } }, p[0]);
			}).concat([E('button', { 'class': 'cbi-button cbi-button-action', 'click': function() { self.applyDns(false); } }, 'Apply'),
				E('button', { 'class': 'cbi-button', 'click': function() { self.applyDns(true); } }, 'Use the provider\'s DNS')])),
			this.el.dnsNow,
			E('div', { 'class': 'rt-note' }, 'The selected interface reconnects for a few seconds.')]));

		return E('div', { 'class': 'rt-grid' }, [ifc]);
	},

	/* ---------- panel domain ---------- */
	buildDomain: function() {
		var self = this;
		this.el.pdIn = E('input', { 'type': 'text', 'class': 'cbi-input-text', 'placeholder': 'panel.home', 'autocapitalize': 'off', 'spellcheck': 'false', 'style': 'flex:1;min-width:180px' });
		this.el.pdNow = E('div', { 'class': 'rt-note' }, 'Loading...');
		this.el.pdOpen = E('a', { 'class': 'cbi-button', 'target': '_blank', 'rel': 'noopener', 'style': 'display:none' }, 'Open the panel');
		this.el.pdDel = E('button', { 'class': 'cbi-button', 'style': 'display:none', 'click': function() { self.setDomain(''); } }, 'Remove');
		this.el.pdIn.addEventListener('keydown', function(ev) { if (ev.key === 'Enter') self.setDomain(self.el.pdIn.value.trim()); });
		this.domainLoad();
		return card('world', 'Panel domain', E('div', {}, [
			E('div', { 'class': 'rt-note', 'style': 'margin-top:0' }, 'Choose a name, and every device on your home network can open this panel with it, for example http://panel.home/ instead of the IP address.'),
			E('div', { 'class': 'rt-row', 'style': 'margin-top:10px' }, [this.el.pdIn,
				E('button', { 'class': 'cbi-button cbi-button-action', 'click': function() { self.setDomain(self.el.pdIn.value.trim()); } }, 'Save'), this.el.pdDel, this.el.pdOpen]),
			]));
	},

	domainLoad: function() {
		var self = this;
		exec(['panel-domain-get']).then(function(d) { self.pdData = d || {}; self.domainPaint(); }).catch(function() { self.el.pdNow.textContent = 'Could not read the domain.'; });
	},

	domainPaint: function() {
		var d = this.pdData || {}, on = !!d.domain;
		if (document.activeElement !== this.el.pdIn) this.el.pdIn.value = d.domain || '';
		this.el.pdDel.style.display = on ? '' : 'none';
		this.el.pdOpen.style.display = on ? '' : 'none';
		if (on) this.el.pdOpen.href = 'http://' + d.domain + '/';
		this.el.pdNow.textContent = on ? 'Active: ' + d.domain + '  \u2192  ' + d.ip + '  (works on your home network)' : 'No domain is set. The panel opens only with ' + (d.ip || 'the router address') + '.';
	},

	setDomain: function(v) {
		var self = this;
		if (v && !/^[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/.test(v)) return toast('The domain is not valid. Use letters, digits and hyphens with at least one dot, for example panel.home.', 'danger');
		execText(['panel-domain-set', v]).then(function() {
			toast(v ? 'Domain saved. Open http://' + v.toLowerCase() + '/ from any device on this network.' : 'The domain was removed.');
			self.domainLoad();
		}).catch(function(e) { toast('The command failed: ' + (e.message || e), 'danger'); });
	},

	drawIfaces: function() {
		var self = this, d = this.info;
		if (this.ifDrag) return;
		this.ifCells = {};
		var all = (d.interfaces || []).map(function(x, n) { return [x, n]; }).sort(function(a, b) { return ((a[0].ord || 999) - (b[0].ord || 999)) || (a[1] - b[1]); }).map(function(x) { return x[0]; });
		var live = all.filter(function(i) { return i.device && i.up; });
		var main = live.filter(function(i) { return i['default'] && !/6$/.test(i.name); })[0] || live.filter(function(i) { return i['default']; })[0] || null;
		var others = all.filter(function(i) { return i !== main && !(main && i.name === main.name + '6'); });
		function cell(i, k) { var c = { spark: spark2(), dev: i.device, rx: E('b', {}, bytes(i.rx)), tx: E('b', {}, bytes(i.tx)), rxr: E('span', { 'class': 'rt-rate' }, ''), txr: E('span', { 'class': 'rt-rate' }, '') }; if (i.device) self.ifCells[i.name + (k || '')] = c; return c; }
		var hero = '';
		var lanI = all.filter(function(i) { return i.name === 'lan'; })[0];
		function pnode(ic, title, sub) { return E('div', { 'class': 'rt-pn' }, [icon(ic, 24), E('strong', {}, title), E('small', {}, sub || '')]); }
		function prate(c, swap) {
			c.bigRx = E('span', {}, '-'); c.bigTx = E('span', {}, '-'); c.swap = swap;
			return E('div', { 'class': 'rt-pr' }, [E('div', {}, [E('i', { 'class': 'rt-ar rx' }, '\u2193 '), c.bigRx]), E('div', {}, [E('i', { 'class': 'rt-ar tx' }, '\u2191 '), c.bigTx])]);
		}
		function tnode(ic, title, sub, rate, hl) { return E('div', { 'class': 'rt-pn2' }, [E('div', { 'class': 'rt-pt' + (hl ? ' hl' : '') }, icon(ic, 28)), E('strong', {}, title), E('small', {}, sub || ''), rate || '']); }
		function tpipe(label, fast) { return E('div', { 'class': 'rt-pp' }, [E('div', { 'class': 'rt-pipe' + (fast ? ' fast' : '') }, E('i')), E('small', {}, label || '')]); }
		var pathEls = [];
		if (main) {
			var mc = cell(main);
			pathEls.push(tnode('world', 'Internet', '', prate(mc, false)), tpipe((main.alias || main.name) + (main.ip ? ' \u00b7 ' + main.ip : '')));
		} else pathEls.push(tnode('world', 'Internet', 'No connection'), tpipe('not connected'));
		pathEls.push(tnode('router', 'Router', (d.model || ''), '', true));
		if (lanI) {
			var lc = cell(lanI);
			pathEls.push(tpipe((lanI.alias || 'lan') + (lanI.ip ? ' \u00b7 ' + lanI.ip + '/' + lanI.mask : ''), true), tnode('network', 'LAN', '', prate(lc, true)));
		}
		hero = E('div', { 'class': 'rt-path' }, pathEls);
		var idle = all.filter(function(i) { return !(i.device && i.up); });
		var ro = true;
		/* drag a row (or a chip) by its three-line handle; works with a mouse and with touch. The order is saved when it is dropped. */
		var save = function() {
			var names = [];
			['on', 'off'].forEach(function(g) { Array.prototype.forEach.call(self.el.ifc.querySelectorAll('[data-grp="' + g + '"]'), function(n) { names.push(n.getAttribute('data-if')); }); });
			names.forEach(function(n, pos) { (d.interfaces || []).forEach(function(x) { if (x.name === n) x.ord = pos + 1; }); });
			execText(['router-iface-order'].concat(names)).then(function() { toast('The order was saved.'); self.drawIfaces(); }).catch(function(e) { toast('Could not save the order: ' + (e.message || e), 'danger'); });
		};
		var grip = function(i) {
			return E('span', { 'class': 'rt-grip', 'title': 'Drag to change the order', 'pointerdown': function(ev) {
				var el = ev.currentTarget.closest('[data-if]'), grp = el.getAttribute('data-grp'), horiz = el.tagName !== 'TR', moved = false;
				ev.preventDefault(); self.ifDrag = true;
				el.classList.add('rt-dragging');
				var mv = function(e) {
					var t = document.elementFromPoint(e.clientX, e.clientY);
					t = t && t.closest ? t.closest('[data-if]') : null;
					if (!t || t === el || t.getAttribute('data-grp') !== grp) return;
					var r = t.getBoundingClientRect(), after = horiz ? e.clientX > r.left + r.width / 2 : e.clientY > r.top + r.height / 2;
					t.parentNode.insertBefore(el, after ? t.nextSibling : t); moved = true;
				};
				var up = function() {
					document.removeEventListener('pointermove', mv); document.removeEventListener('pointerup', up); document.removeEventListener('pointercancel', up);
					el.classList.remove('rt-dragging'); self.ifDrag = false;
					if (moved) save();
				};
				document.addEventListener('pointermove', mv); document.addEventListener('pointerup', up); document.addEventListener('pointercancel', up);
			} }, '≡');
		};
		var rows = all.filter(function(i) { return i.device && i.up; }).map(function(i) {
			var c = cell(i, '#t'), on = i.device && i.up;
			return E('tr', { 'class': on ? '' : 'rt-idlerow', 'data-if': i.name, 'data-grp': 'on' }, [
				E('td', {}, [ro ? grip(i) : null, E('span', { 'class': 'rt-dot' + (i.up ? ' up' : '') }), i.alias ? [E('strong', {}, i.alias), E('span', { 'class': 'rt-orig' }, i.name)] : i.name,
					E('button', { 'class': 'rt-edit', 'title': 'Rename', 'click': function() { self.rename(i); } }, icon('pencil', 14))]),
				E('td', {}, (i.proto || '').toUpperCase()), E('td', {}, i.ip ? i.ip + '/' + i.mask : '-'),
				E('td', { 'class': 'rt-num' }, on ? [E('span', { 'class': 'rt-ar rx' }, '\u2193 '), c.rxr] : '-'),
				E('td', { 'class': 'rt-num' }, on ? [E('span', { 'class': 'rt-ar tx' }, '\u2191 '), c.txr] : '-'),
				E('td', { 'class': 'rt-num' }, on ? [c.rx, ' / ', c.tx] : '-')]);
		});
		var tbl = E('div', {}, [hero, rows.length ? E('div', { 'class': 'rt-scroll' }, E('table', { 'class': 'rt-table rt-iftbl' }, [
			E('thead', {}, E('tr', {}, ['Interface', 'Type', 'Address', 'Download', 'Upload', 'Total received / sent'].map(function(h) { return E('th', {}, h); }))), E('tbody', {}, rows)])) : '',
			idle.length ? E('div', { 'class': 'rt-idle' }, [E('span', { 'class': 'rt-lbl' }, 'Not connected:')].concat(idle.map(function(i) { return E('span', { 'class': 'rt-chip2', 'data-if': i.name, 'data-grp': 'off' }, [ro ? grip(i) : null, i.alias || i.name, E('button', { 'class': 'rt-edit', 'title': 'Rename', 'click': function() { self.rename(i); } }, icon('pencil', 12))]); }))) : '']);
		dcontent(this.el.ifc, tbl);
		this.paintLive();

		/* DNS interface list keeps the user's choice while the page refreshes */
		var keep = this.el.dnsIface.value;
		var list = (d.interfaces || []).filter(function(i) { return i.name !== 'lan' && !/6$/.test(i.name) && i.proto !== 'wireguard' && i.proto !== 'amneziawg'; });
		var def = this.defaultIface();
		dcontent(this.el.dnsIface, list.map(function(i) { return E('option', { 'value': i.name }, self.ifaceLabel(i) + (i.alias ? ' (' + i.name + ')' : '')); }));
		this.el.dnsIface.value = keep && list.some(function(i) { return i.name === keep; }) ? keep : (def ? def.name : (list[0] ? list[0].name : ''));
		var cur = list.filter(function(i) { return i.name === self.el.dnsIface.value; })[0];
		this.el.dnsNow.textContent = cur ? 'In use now: ' + (cur.dns || '-') + (cur.dns_manual ? '   (set by you: ' + cur.dns_manual + ')' : '   (from the provider)') : '';
		if (!this.dnsFilled) { this.dnsFilled = true; this.fillDns(); }
	},

	fillDns: function() {
		var n = this.el.dnsIface.value;
		var i = ((this.info.interfaces || []).filter(function(x) { return x.name === n; })[0]) || {};
		var m = (i.dns_manual || '').split(/\s+/).filter(Boolean);
		this.el.dns1.value = m[0] || ''; this.el.dns2.value = m[1] || '';
	},

	applyDns: function(auto) {
		var iface = this.el.dnsIface.value, args = ['router-dns-set', iface];
		if (!iface) return;
		if (auto) args.push('auto');
		else {
			var v = [this.el.dns1.value.trim(), this.el.dns2.value.trim()].filter(Boolean);
			if (!v.length) return toast('Enter at least one DNS server.', 'danger');
			if (!v.every(validDns)) return toast('One of the DNS addresses is not valid.', 'danger');
			args = args.concat(v);
		}
		this.run(args, auto ? 'The provider\'s DNS servers are used again.' : 'DNS servers saved. The interface is reconnecting.');
	},

	lanDialog: function() {
		var lan = ((this.info.interfaces || []).filter(function(i) { return i.name === 'lan'; })[0]) || {};
		this.el.lanIp.value = lan.ip || ''; this.el.lanPre.value = lan.mask || '24';
		var self = this;
		ui.showModal('LAN address', [
			E('p', { 'class': 'rt-note', 'style': 'margin-top:0' }, 'The address of this router on your home network, for example 192.168.2.1 with prefix 24.'),
			E('div', { 'class': 'rt-row' }, [this.el.lanIp, '/', this.el.lanPre]),
			E('p', { 'class': 'rt-note' }, 'Fixed IPs of your devices move to the new network automatically. The router restarts its network and this page opens at the new address.'),
			E('div', { 'class': 'right' }, [E('button', { 'class': 'btn', 'click': ui.hideModal }, 'Cancel'), ' ',
				E('button', { 'class': 'btn cbi-button-action', 'click': function() { self.applyLan(); } }, 'Apply')])]);
	},

	applyLan: function() {
		var ip = this.el.lanIp.value.trim(), pre = this.el.lanPre.value.trim();
		if (!validIPv4(ip)) return toast('The LAN address is not a valid IPv4 address.', 'danger');
		if (!/^\d+$/.test(pre) || +pre < 8 || +pre > 30) return toast('The prefix must be a number between 8 and 30.', 'danger');
		var self = this;
		ui.showModal('Change the LAN address?', [
			E('p', {}, 'The router will restart its network. This page will open again at http://' + ip + '/ after about 15 seconds.'),
			E('p', { 'class': 'rt-note' }, 'If your computer does not get a new address by itself, disconnect and reconnect its network cable or Wi-Fi.'),
			E('div', { 'class': 'right' }, [E('button', { 'class': 'btn', 'click': ui.hideModal }, 'Cancel'), ' ',
				E('button', { 'class': 'btn cbi-button-negative', 'click': function() {
					execText(['router-lan-set', ip, pre]).then(function() {
						ui.showModal('Applying...', [E('p', { 'class': 'spinning' }, 'Moving to ' + ip + ' ...')]);
						window.setTimeout(function() { window.location.href = 'http://' + ip + window.location.pathname; }, 15000);
					}).catch(function(e) { ui.hideModal(); toast('The command failed: ' + (e.message || e), 'danger'); });
				} }, 'Change')])]);
	},

	rename: function(i) {
		var self = this;
		var inp = E('input', { 'type': 'text', 'class': 'cbi-input-text', 'maxlength': 32, 'value': i.alias || '', 'placeholder': i.name, 'style': 'width:100%' });
		var save = function() { ui.hideModal(); self.run(['router-iface-name', i.name, inp.value.trim()], 'Interface name saved.'); };
		inp.addEventListener('keydown', function(ev) { if (ev.key === 'Enter') save(); });
		ui.showModal('Rename interface "' + i.name + '"', [
			E('p', {}, 'This name is only shown in oDash. The real interface is not changed. Leave it empty to remove the name.'), inp,
			E('div', { 'class': 'right', 'style': 'margin-top:12px' }, [E('button', { 'class': 'btn', 'click': ui.hideModal }, 'Cancel'), ' ',
				E('button', { 'class': 'btn cbi-button-action', 'click': save }, 'Save')])]);
		inp.focus();
	},

	/* ---------- devices (the former Devices page) ---------- */
	buildDevices: function() {
		this.el.devBox = E('div', {}, E('p', { 'class': 'spinning' }, 'Loading devices...'));
		return E('div', { 'class': 'rt-scroll' }, this.el.devBox);
	},

	devicesLoad: function() {
		var self = this;
		if (this.devView) return;
		this.devView = DevicesView;   /* LuCI already gives an instance */
		this.devView.load().then(function(l) {
			var root = self.devView.render(l), h = root.querySelector('h2');
			if (h) h.parentNode.removeChild(h);
			dcontent(self.el.devBox, root);
		}).catch(function(e) {
			self.devView = null;
			dcontent(self.el.devBox, E('p', {}, 'Could not load the devices: ' + (e.message || e)));
		});
	},

	/* ---------- Wi-Fi ---------- */
	/* ---------- Multi-WAN (mwan3) ---------- */
	buildMwan: function() {
		this.el.mwan = E('div', { 'class': 'rt-card rt-wide rt-net' }, E('p', { 'class': 'spinning' }, 'Loading...'));
		return this.el.mwan;
	},

	mwanLoad: function() {
		var self = this;
		return exec(['mwan-info']).then(function(d) {
			self.mw = self.mw || {};
			self.mw.info = d;
			if (!self.mw.dirty) self.mwanDerive();
			self.mwanDraw();
		}).catch(function(e) { dcontent(self.el.mwan, E('p', { 'class': 'rt-note' }, 'Could not read the Multi-WAN settings: ' + (e.message || e))); });
	},

	/* the pool shown in the editor: what an earlier oDash setup saved, else the enabled uplinks */
	mwanDerive: function() {
		var i = this.mw.info, mem = {}, pool = [], mode = 'failover';
		(i.members || []).forEach(function(m) { mem[m.name] = m; });
		var pol = (i.policies || []).filter(function(p) { return p.name === 'od_policy'; })[0];
		if (pol) {
			(pol.use_member || []).forEach(function(n) { var m = mem[n]; if (m) pool.push({ name: m.interface, w: +m.weight || 1, metric: +m.metric || 1 }); });
			if (pool.length > 1 && pool.every(function(x) { return x.metric === pool[0].metric; })) mode = 'balance';
		} else {
			(i.interfaces || []).filter(function(x) { return x.enabled !== '0'; }).forEach(function(x) { pool.push({ name: x.name, w: 1, metric: 1 }); });
		}
		this.mw.mode = mode; this.mw.pool = pool;
	},

	mwanTrack: function(n) {
		var x = ((this.mw.info || {}).interfaces || []).filter(function(i) { return i.name === n; })[0];
		return x || null;
	},

	mwanTrackDialog: function(n) {
		var self = this, x = this.mwanTrack(n) || { track_ip: ['1.1.1.1', '8.8.8.8'], track_method: 'ping', interval: '5', count: '1', timeout: '2', down: '3', up: '3', reliability: '1' };
		var f = function(v, w) { return E('input', { 'type': 'text', 'class': 'cbi-input-text', 'value': v, 'style': 'width:' + (w || 90) + 'px' }); };
		var ips = f((x.track_ip || []).join(', '), 260), meth = E('select', { 'class': 'cbi-input-select' }, ['ping', 'httping', 'arping', 'nslookup'].map(function(m) { return E('option', { 'value': m }, m); }));
		meth.value = x.track_method || 'ping';
		var iv = f(x.interval || '5'), cn = f(x.count || '1'), to = f(x.timeout || '2'), dn = f(x.down || '3'), up = f(x.up || '3'), rl = f(x.reliability || '1');
		var row = function(l, el, h) { return E('div', { 'class': 'rt-mfld' }, [E('span', {}, l), el, h ? E('small', { 'class': 'rt-muted' }, h) : '']); };
		ui.showModal('Link check for ' + n, [
			E('p', { 'style': 'font-size:13px;opacity:.85' }, 'mwan3 pings these hosts through ' + n + ' to decide whether the link is up. Use hosts that are always online.'),
			E('div', { 'class': 'rt-smb' }, [row('Hosts to check', ips, 'separate with commas'), row('Method', meth), row('Check every (s)', iv), row('Pings per check', cn), row('Wait for a reply (s)', to),
				row('Fails before down', dn), row('Replies before up', up), row('Hosts that must answer', rl)]),
			E('div', { 'class': 'right', 'style': 'margin-top:12px' }, [E('button', { 'class': 'btn', 'click': ui.hideModal }, 'Cancel'), ' ', E('button', { 'class': 'btn cbi-button-action', 'click': function() {
				ui.hideModal();
				execText(['mwan-iface-set', n, 'track_ip=' + ips.value.split(',').map(function(h) { return h.trim(); }).filter(Boolean).join(','), 'track_method=' + meth.value, 'interval=' + iv.value.trim(), 'count=' + cn.value.trim(),
					'timeout=' + to.value.trim(), 'down=' + dn.value.trim(), 'up=' + up.value.trim(), 'reliability=' + rl.value.trim()]).then(function() {
					toast('Saved. The change takes effect when you press Apply, or after mwan3 restarts.'); return self.mwanLoad();
				}).catch(function(e) { toast('Could not save: ' + (e.message || e), 'danger'); });
			} }, 'Save')])]);
	},

	mwanApply: function() {
		var self = this, m = this.mw;
		if (!m.pool.length) { toast('Add at least one uplink to the pool.', 'danger'); return; }
		var args = ['mwan-setup', m.mode].concat(m.pool.map(function(x) { return m.mode === 'balance' ? x.name + ':' + (x.w || 1) : x.name; }));
		ui.showModal('Apply the Multi-WAN setup?', [
			E('p', {}, (m.mode === 'failover' ? 'Traffic uses ' + m.pool[0].name + ' first and switches to the next uplink when a link check fails.' : 'Traffic is shared between ' + m.pool.map(function(x) { return x.name + ' (weight ' + x.w + ')'; }).join(', ') + '.')),
			E('p', { 'style': 'color:#d97706;font-size:13px' }, 'mwan3 restarts and the internet may drop for a few seconds. If you are using this page through one of these uplinks you may lose it for a moment. Your own rules in /etc/config/mwan3 stay, but the oDash rule is placed before them.'),
			E('div', { 'class': 'right' }, [E('button', { 'class': 'btn', 'click': ui.hideModal }, 'Cancel'), ' ', E('button', { 'class': 'btn cbi-button-positive', 'click': function() {
				ui.hideModal();
				execText(args).then(function() { toast('Applied. mwan3 is restarting.'); m.dirty = false; return sleep(4000); }).then(function() { return self.mwanLoad(); })
					.catch(function(e) { toast('The command failed: ' + (e.message || e), 'danger'); });
			} }, 'Apply')])]);
	},

	mwanDraw: function() {
		var self = this, box = this.el.mwan, m = this.mw, i = m.info || {};
		var head = E('div', { 'class': 'rt-h' }, [icon('world'), 'Multi-WAN', E('span', { 'class': 'rt-sp' }),
			i.installed ? badge(i.running ? 'mwan3 running' : 'mwan3 stopped', i.running ? 'rt-on' : 'rt-off') : badge('Not installed', 'rt-off')]);
		if (!i.installed) {
			var ib = E('button', { 'class': 'cbi-button cbi-button-action rt-btn', 'click': function() {
				ib.disabled = true; dcontent(note, 'Installing mwan3...');
				self.bgTest('mwan-install', null, function() { toast('mwan3 was installed.'); self.mwanLoad(); }, function() { ib.disabled = false; dcontent(note, 'The installation failed. Check that the router is online.'); }, null, 90);
			} }, 'Install mwan3');
			var note = E('span', { 'class': 'rt-note', 'style': 'margin:0 0 0 10px' }, '');
			dcontent(box, [head, E('p', { 'class': 'rt-note' }, 'Multi-WAN lets the router use two or more internet links at once: a second link takes over when the first one fails (failover), or the traffic is shared between them (load balancing). It needs the mwan3 package.'), E('div', { 'class': 'rt-row' }, [ib, note])]);
			return;
		}
		var stOf = function(n) { return ((i.status || {})[n] || {}); };
		var cand = {}; (i.candidates || []).forEach(function(c) { cand[c.name] = c; });
		var pretty = function(st) { return st === 'online' ? badge('online', 'rt-on') : st === 'offline' ? badge('offline', 'rt-bad') : st ? badge(st, 'rt-warn') : badge('not checked', 'rt-off'); };
		var seg = E('div', { 'class': 'rt-seg' }, [['failover', 'Failover', 'Use the first uplink; switch when it fails'], ['balance', 'Load balancing', 'Share traffic by weight']].map(function(o) {
			return E('button', { 'class': 'cbi-button rt-hbtn' + (m.mode === o[0] ? ' rt-lbtn-on' : ''), 'aria-pressed': m.mode === o[0] ? 'true' : 'false', 'title': o[2], 'style': m.mode === o[0] ? 'font-weight:700' : '', 'click': function() { m.mode = o[0]; m.dirty = true; self.mwanDraw(); } }, (m.mode === o[0] ? '\u2714 ' : '') + o[1]);
		}));
		/* drag the pool rows by the three-line handle (mouse and touch) */
		var rows = m.pool.map(function(x, k) {
			var c = cand[x.name] || {}, t = self.mwanTrack(x.name), sx = stOf(x.name);
			var grip = E('span', { 'class': 'rt-grip', 'title': 'Drag to change the priority', 'pointerdown': function(ev) {
				var el = ev.currentTarget.closest('[data-mw]'), moved = false; ev.preventDefault(); self.mwDrag = true; el.classList.add('rt-dragging');
				var mv = function(e) {
					var o = document.elementFromPoint(e.clientX, e.clientY); o = o && o.closest ? o.closest('[data-mw]') : null;
					if (!o || o === el) return;
					var r = o.getBoundingClientRect(); o.parentNode.insertBefore(el, e.clientY > r.top + r.height / 2 ? o.nextSibling : o); moved = true;
				};
				var up = function() {
					document.removeEventListener('pointermove', mv); document.removeEventListener('pointerup', up); document.removeEventListener('pointercancel', up);
					self.mwDrag = false; el.classList.remove('rt-dragging');
					if (moved) {
						var order = Array.prototype.map.call(box.querySelectorAll('[data-mw]'), function(n) { return n.getAttribute('data-mw'); });
						m.pool.sort(function(a, b) { return order.indexOf(a.name) - order.indexOf(b.name); }); m.dirty = true;
					}
					self.mwanDraw();
				};
				document.addEventListener('pointermove', mv); document.addEventListener('pointerup', up); document.addEventListener('pointercancel', up);
			} }, '≡');
			var w = E('input', { 'type': 'number', 'min': 1, 'max': 100, 'class': 'cbi-input-text', 'value': x.w, 'style': 'width:64px', 'input': function() { x.w = Math.max(1, Math.min(100, +this.value || 1)); m.dirty = true; } });
			return E('tr', { 'data-mw': x.name }, [
				E('td', { 'style': 'white-space:nowrap' }, [grip, E('b', {}, m.mode === 'failover' ? '#' + (k + 1) : '')]),
				E('td', {}, [E('b', {}, x.name), E('span', { 'class': 'rt-sub', 'style': 'margin-left:8px' }, [(c.proto || '').toUpperCase(), c.device ? ' · ' + c.device : ''].join(''))]),
				E('td', {}, [pretty(sx.status), sx.uptime ? E('span', { 'class': 'rt-sub', 'style': 'margin-left:8px' }, 'up ' + Math.round(sx.uptime / 60) + ' min') : '']),
				E('td', {}, t ? [E('span', {}, (t.track_method || 'ping') + ' ' + (t.track_ip || []).join(', ')), E('span', { 'class': 'rt-sub', 'style': 'margin-left:8px' }, 'every ' + (t.interval || '5') + ' s')] : E('span', { 'class': 'rt-muted' }, 'default checks')),
				E('td', {}, m.mode === 'balance' ? [E('span', { 'class': 'rt-sub' }, 'weight '), w] : ''),
				E('td', { 'style': 'text-align:right;white-space:nowrap' }, [E('button', { 'class': 'cbi-button rt-btn', 'click': function() { self.mwanTrackDialog(x.name); } }, 'Link check'), ' ',
					E('button', { 'class': 'cbi-button cbi-button-negative rt-btn', 'click': function() { m.pool.splice(k, 1); m.dirty = true; self.mwanDraw(); } }, 'Remove')])]);
		});
		var inPool = {}; m.pool.forEach(function(x) { inPool[x.name] = 1; });
		var avail = (i.candidates || []).filter(function(c) { return !inPool[c.name]; }).map(function(c) {
			return E('button', { 'class': 'rt-chip2', 'title': 'Add to the pool', 'click': function() { m.pool.push({ name: c.name, w: 1, metric: 1 }); m.dirty = true; self.mwanDraw(); } }, ['+ ', c.name, c.up ? ' ●' : ' ○']);
		});
		var pol = (i.policies || []).map(function(p) { return E('tr', {}, [E('td', {}, p.name), E('td', {}, (p.use_member || []).join(', ')), E('td', {}, p.last_resort || 'unreachable')]); });
		var rl = (i.rules || []).map(function(r) { return E('tr', {}, [E('td', {}, r.name), E('td', {}, [r.dest_ip || 'any', r.dest_port ? ':' + r.dest_port : '', r.proto && r.proto !== 'all' ? ' ' + r.proto : ''].join('')), E('td', {}, r.use_policy || '-'), E('td', {}, r.sticky === '1' ? 'sticky' : '')]); });
		dcontent(box, [head,
			E('p', { 'class': 'rt-note' }, 'Choose which uplinks the router uses together. Failover keeps the top uplink in use and switches to the next one when it stops working. Load balancing shares the traffic between the uplinks by weight.'),
			E('div', { 'class': 'rt-row', 'style': 'margin-bottom:10px' }, [seg, E('span', { 'class': 'rt-sp' }),
				E('button', { 'class': 'cbi-button rt-hbtn', 'click': function() { execText(['mwan-service', i.running ? 'off' : 'on']).then(function() { toast(i.running ? 'mwan3 is stopping.' : 'mwan3 is starting.'); return sleep(3000); }).then(function() { return self.mwanLoad(); }); } }, i.running ? 'Stop mwan3' : 'Start mwan3')]),
			rows.length ? E('div', { 'class': 'rt-scroll' }, E('table', { 'class': 'rt-table rt-mwtbl' }, [E('thead', {}, E('tr', {}, [m.mode === 'failover' ? 'Priority' : '', 'Uplink', 'Status', 'Link check', m.mode === 'balance' ? 'Share' : '', ''].map(function(h) { return E('th', {}, h); }))), E('tbody', {}, rows)]))
				: E('p', { 'class': 'rt-warn' }, 'The pool is empty. Add an uplink below.'),
			avail.length ? E('div', { 'class': 'rt-idle' }, [E('span', { 'class': 'rt-lbl' }, 'Available:')].concat(avail)) : '',
			E('div', { 'class': 'rt-row', 'style': 'margin-top:12px' }, [E('button', { 'class': 'cbi-button cbi-button-positive rt-btn', 'click': function() { self.mwanApply(); } }, m.dirty ? 'Apply changes' : 'Apply'),
				m.dirty ? E('span', { 'class': 'rt-note', 'style': 'margin:0' }, 'Not applied yet') : '']),
			(pol.length || rl.length) ? E('details', { 'style': 'margin-top:12px' }, [E('summary', { 'style': 'cursor:pointer;font-weight:600' }, 'Policies and rules in /etc/config/mwan3'),
				pol.length ? E('table', { 'class': 'rt-table' }, [E('thead', {}, E('tr', {}, ['Policy', 'Members', 'If all are down'].map(function(h) { return E('th', {}, h); }))), E('tbody', {}, pol)]) : '',
				rl.length ? E('table', { 'class': 'rt-table', 'style': 'margin-top:8px' }, [E('thead', {}, E('tr', {}, ['Rule', 'Destination', 'Policy', ''].map(function(h) { return E('th', {}, h); }))), E('tbody', {}, rl)]) : '',
				E('p', { 'class': 'rt-note' }, 'The first rule that matches decides the route, so the oDash rule is placed first. Edit other rules in LuCI under Network > Load Balancing.')]) : '']);
	},

	buildWifi: function() {
		this.el.apBox = E('div', { 'class': 'rt-bands' }, E('div', { 'class': 'rt-card' }, E('p', { 'class': 'spinning' }, 'Loading Wi-Fi...')));
		this.el.wifiNow = E('div', { 'class': 'rt-card' });
		this.el.wifiList = E('div', { 'class': 'rt-card' });
		this.el.wifiScan = E('div', { 'class': 'rt-card rt-wide' });
		return E('div', {}, [E('div', { 'class': 'rt-sec', 'style': 'margin-top:22px;padding-top:14px;border-top:1px solid rgba(128,128,128,.35)' }, 'Your Wi-Fi networks'), this.el.apBox,
			E('div', { 'class': 'rt-sec', 'style': 'margin-top:22px' }, 'Wi-Fi uplink (internet from another Wi-Fi)'),
			E('div', { 'class': 'rt-grid', 'style': 'margin-top:0' }, [this.el.wifiNow, this.el.wifiList, this.el.wifiScan])]);
	},

	apLoad: function(force) {
		var self = this;
		if (this.apBusy || (this.apEditing && !force)) return;
		this.apBusy = true;
		exec(['router-ap-info']).then(function(a) { var j = JSON.stringify(a); if (j === self.apJson && !force) return; self.apJson = j; self.ap = a; self.drawAp(); }).catch(function() {}).then(function() { self.apBusy = false; });
	},

	drawAp: function() {
		var self = this, a = this.ap;
		if (!a) return;
		var BANDS = { '2g': '2.4 GHz', '5g': '5 GHz', '6g': '6 GHz' };
		var cards = [];
		a.radios.forEach(function(r) {
			(a.aps || []).filter(function(w) { return w.radio === r.id; }).forEach(function(w) {
				var f = {};
				function inp(k, v, t) { f[k] = E('input', { 'type': t || 'text', 'class': 'cbi-input-text', 'value': v, 'autocomplete': 'off' }); return f[k]; }
				function sel(k, opts, v) { f[k] = E('select', { 'class': 'cbi-input-select' }, opts.map(function(o) { return E('option', { 'value': o[0] }, o[1]); })); f[k].value = v; return f[k]; }
				function chkb(k, v) { f[k] = E('input', { 'type': 'checkbox' }); f[k].checked = !!v; return f[k]; }
				var is5 = r.band !== '2g';
				var widths = is5 ? [['VHT20', '20 MHz'], ['VHT40', '40 MHz'], ['VHT80', '80 MHz'], ['VHT160', '160 MHz'], ['HE20', 'HE 20 MHz'], ['HE40', 'HE 40 MHz'], ['HE80', 'HE 80 MHz'], ['HE160', 'HE 160 MHz']]
					: [['HT20', '20 MHz'], ['HT40', '40 MHz'], ['HE20', 'HE 20 MHz'], ['HE40', 'HE 40 MHz']];
				if (r.htmode && !widths.some(function(x) { return x[0] === r.htmode; })) widths.unshift([r.htmode, r.htmode]);
				var chans = [['auto', 'Auto']]; (is5 ? [36, 40, 44, 48, 52, 56, 60, 64, 100, 104, 108, 112, 116, 120, 124, 128, 132, 136, 140, 144, 149, 153, 157, 161, 165] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]).forEach(function(c) { chans.push([String(c), String(c)]); });
				var encs = [['psk2', 'WPA2-PSK'], ['sae-mixed', 'WPA2/WPA3'], ['sae', 'WPA3-SAE'], ['none', 'Open (no password)']];
				var curEnc = w.encryption || 'psk2';
				if (!encs.some(function(x) { return x[0] === curEnc; })) encs.unshift([curEnc, ({ 'psk2+ccmp': 'WPA2-PSK (CCMP)', 'psk-mixed': 'WPA/WPA2 mixed', 'psk-mixed+ccmp': 'WPA/WPA2 mixed (CCMP)', 'psk2+tkip+ccmp': 'WPA2-PSK (TKIP+CCMP)', 'sae+ccmp': 'WPA3-SAE (CCMP)', 'sae-mixed+ccmp': 'WPA2/WPA3 (CCMP)' })[curEnc] || curEnc]);
				var on = !w.disabled && !r.disabled;
				var pw = inp('key', '', 'password'); pw.placeholder = w.has_key ? 'Unchanged (type to change)' : 'At least 8 characters';
				var show = E('label', { 'class': 'rt-wl' }, [E('input', { 'type': 'checkbox', 'change': function() { pw.type = this.checked ? 'text' : 'password'; } }), ' Show']);
				var more = E('div', { 'style': 'display:none' }, [E('div', { 'class': 'rt-fld' }, [
					E('label', {}, 'Channel'), sel('channel', chans, r.channel || 'auto'),
					E('label', {}, 'Channel width'), sel('htmode', widths, r.htmode),
					E('label', {}, 'Transmit power'), (function() { var i = inp('txpower', r.txpower && r.txpower !== 'auto' ? r.txpower : ''); i.placeholder = 'Auto (dBm)'; return i; })(),
					E('label', {}, 'Country'), (function() { var i = inp('country', r.country || ''); i.maxLength = 2; i.style.textTransform = 'uppercase'; return i; })(),
					E('label', {}, 'Hidden network'), chkb('hidden', w.hidden),
					E('label', {}, 'Client isolation'), chkb('isolate', w.isolate)])]);
				var tgl = E('button', { 'class': 'cbi-button', 'type': 'button', 'click': function() { var o = more.style.display === 'none'; more.style.display = o ? '' : 'none'; this.textContent = o ? 'Hide advanced' : 'Advanced settings'; } }, 'Advanced settings');
				var enabled = chkb('enabled', on);
				var save = E('button', { 'class': 'cbi-button cbi-button-action', 'type': 'button', 'click': function() { self.apSave(w, r, f); } }, 'Save');
				cards.push(E('div', { 'class': 'rt-card' }, [
					E('div', { 'class': 'rt-h' }, [icon('wifi'), (BANDS[r.band] || r.band) + ' network', E('span', { 'class': 'rt-sub', 'style': 'margin-left:auto' }, E('label', { 'class': 'rt-wl' }, [enabled, ' On']))]),
					E('div', { 'class': 'rt-fld', 'style': 'margin-top:0' }, [E('label', {}, 'Name (SSID)'), inp('ssid', w.ssid), E('label', {}, 'Security'), sel('encryption', encs, curEnc),
						E('label', {}, 'Password'), E('div', { 'class': 'rt-row', 'style': 'flex-wrap:nowrap' }, [pw, show])]),
					more,
					E('div', { 'class': 'rt-row', 'style': 'margin-top:14px' }, [save, tgl]),
					E('div', { 'class': 'rt-note' }, 'Saving restarts the Wi-Fi radio. Connected devices drop for about 10 seconds; if you are on this Wi-Fi, reconnect with the new name or password.')]));
				['ssid', 'key', 'channel', 'htmode', 'txpower', 'country'].forEach(function(k) { f[k].addEventListener('focus', function() { self.apEditing = true; }); });
			});
		});
		dcontent(this.el.apBox, cards.length ? cards : E('div', { 'class': 'rt-card' }, E('p', { 'class': 'rt-muted' }, 'No Wi-Fi access point was found on this router.')));
	},

	apSave: function(w, r, f) {
		var self = this, ssid = f.ssid.value.trim();
		if (!ssid || ssid.length > 32) return toast('The network name must be 1 to 32 characters.', 'danger');
		var enc = f.encryption.value, key = f.key.value;
		if (enc !== 'none' && key && (key.length < 8 || key.length > 63)) return toast('The password must be 8 to 63 characters.', 'danger');
		if (enc !== 'none' && !key && !w.has_key) return toast('Enter a password for this network.', 'danger');
		var tp = f.txpower.value.trim(), cc = f.country.value.trim().toUpperCase();
		if (tp && !/^\d{1,2}$/.test(tp)) return toast('Transmit power must be a number of dBm, or empty for automatic.', 'danger');
		if (cc && !/^[A-Z]{2}$/.test(cc)) return toast('The country must be a two-letter code, for example TR.', 'danger');
		var apArgs = ['ssid=' + ssid, 'encryption=' + enc, 'hidden=' + (f.hidden.checked ? 1 : 0), 'isolate=' + (f.isolate.checked ? 1 : 0), 'disabled=' + (f.enabled.checked ? 0 : 1)];
		if (enc !== 'none' && key) apArgs.push('key=' + key);
		var rArgs = ['channel=' + f.channel.value, 'htmode=' + f.htmode.value, 'txpower=' + (tp || 'auto')];
		if (cc) rArgs.push('country=' + cc);
		ui.showModal('Apply Wi-Fi settings?', [
			E('p', {}, 'The Wi-Fi radio restarts and devices on this network reconnect after about 10 seconds.'),
			E('div', { 'class': 'right' }, [E('button', { 'class': 'btn', 'click': ui.hideModal }, 'Cancel'), ' ',
				E('button', { 'class': 'btn cbi-button-action', 'click': function() {
					ui.hideModal();
					execText(['router-ap-set', r.id].concat(rArgs)).then(function() { return execText(['router-ap-set', w.id].concat(apArgs)); })
						.then(function() { toast('Wi-Fi settings saved. The radio is restarting.'); self.apEditing = false; return sleep(6000); })
						.then(function() { self.apLoad(true); })
						.catch(function(e) { toast('The command failed: ' + (e.message || e), 'danger'); });
				} }, 'Apply')])]);
	},

	wifiLoad: function() {
		var self = this;
		if (this.wifiBusy) return;
		this.wifiBusy = true;
		exec(['router-wifi-info']).then(function(w) { self.wifi = w; self.drawWifi(); }).catch(function() {
			dcontent(self.el.wifiNow, [E('div', { 'class': 'rt-h' }, [icon('wifi'), 'Wi-Fi uplink']), E('p', {}, 'Could not read the Wi-Fi state.')]);
		}).then(function() { self.wifiBusy = false; });
		if (!this.scanDone) this.drawScan(null);
		this.apLoad();
	},

	drawWifi: function() {
		var self = this, w = this.wifi;
		if (!w) return;
		var st = !w.installed ? badge('Travelmate is not installed', 'rt-off') : (w.enabled ? badge(w.state || 'Enabled', w.ssid ? 'rt-on' : 'rt-warn') : badge('Disabled', 'rt-off'));
		var ifs = (this.info && this.info.interfaces) || [], src = '';
		var gi = ifs.filter(function(i) { return i.device === w.default_dev; })[0];
		if (w.default_dev) src = (w.device && w.default_dev === w.device) ? 'Wi-Fi (' + (w.ssid || '-') + ')' : (gi ? self.ifaceLabel(gi) + ' (' + w.default_dev + ')' : w.default_dev);
		var viaWifi = !!w.device && w.default_dev === w.device;
		dcontent(this.el.wifiNow, [E('div', { 'class': 'rt-h' }, [icon('wifi'), 'Wi-Fi uplink', E('span', { 'class': 'rt-sub' }, st)]),
			w.ssid ? E('div', { 'class': 'rt-big' }, [signalBars(w.signal === '' ? null : +w.signal), w.ssid]) : E('div', { 'class': 'rt-big rt-muted' }, 'Not connected to a Wi-Fi network'),
			kv([['Internet comes from', src ? [src, ' ', viaWifi ? badge('Wi-Fi', 'rt-on') : badge('not Wi-Fi', 'rt-off')] : ''], ['Signal', w.signal ? w.signal + ' dBm' : ''], ['Channel', w.channel], ['Access point', w.bssid], ['Radio', w.device],
				['Last station', w.station && !w.ssid ? w.station : '']]),
			E('div', { 'class': 'rt-note' }, 'When a cable is plugged into the WAN port, the router uses the cable and not Wi-Fi. A network that is enabled is only allowed to connect; it is "Connected" when the router is really joined to it.')]);

		var up = w.uplinks || [], seen = {};
		(this.scanList || []).forEach(function(n) { seen[n.ssid] = n; });
		var rows = up.map(function(u) {
			var last = !u.connected && w.station && w.station.indexOf('/' + u.ssid + '/') >= 0;
			var sc = seen[u.ssid];
			var stateBadge = u.connected ? badge('Connected now', 'rt-on') : (u.enabled ? badge('Enabled, not connected', 'rt-warn') : badge('Off', 'rt-off'));
			var meta = [u.device || '', last ? 'last connected' : '', sc ? 'in range, ' + sc.signal + ' dBm' : (self.scanList ? 'not in range' : '')].filter(Boolean).join('  -  ');
			return E('div', { 'class': 'rt-ctl' }, [
				E('div', {}, [E('div', { 'class': 'rt-ctl-t' }, [u.ssid || u.id, stateBadge]), E('div', { 'class': 'rt-note', 'style': 'margin-top:2px' }, meta)]),
				E('div', { 'class': 'rt-row' }, [
					E('button', { 'class': 'cbi-button cbi-button-action', 'click': function() { self.useUplink(u); } }, 'Use only this'),
					E('button', { 'class': 'cbi-button', 'click': function() { self.wifiRun([u.id, u.enabled ? 'off' : 'on'], u.enabled ? 'Network turned off.' : 'Network turned on.'); } }, u.enabled ? 'Turn off' : 'Turn on')])]);
		});
		dcontent(this.el.wifiList, [E('div', { 'class': 'rt-h' }, [icon('network'), 'Saved networks', E('span', { 'class': 'rt-sub' }, 'Travelmate')])]
			.concat(rows.length ? rows : [E('p', { 'class': 'rt-muted' }, 'No saved Wi-Fi networks.')],
				[E('div', { 'class': 'rt-note' }, 'Switching restarts Travelmate and reconnects in about 20 seconds. Scan below to see which saved networks are in range.')]));
	},

	useUplink: function(u) {
		var self = this;
		ui.showModal('Switch to "' + (u.ssid || u.id) + '"?', [
			E('p', {}, 'Travelmate will use only this network. If the router depends on Wi-Fi for internet, it disconnects for a short time.'),
			E('div', { 'class': 'right' }, [E('button', { 'class': 'btn', 'click': ui.hideModal }, 'Cancel'), ' ',
				E('button', { 'class': 'btn cbi-button-action', 'click': function() { ui.hideModal(); self.wifiRun([u.id, 'only'], 'Switching the Wi-Fi network...'); } }, 'Switch')])]);
	},

	wifiRun: function(a, msg) {
		var self = this;
		execText(['router-wifi-set'].concat(a)).then(function() { toast(msg); return sleep(1500); }).then(function() { self.wifiLoad(); })
			.catch(function(e) { toast('The command failed: ' + (e.message || e), 'danger'); });
	},

	drawScan: function(list) {
		var self = this;
		var btn = E('button', { 'class': 'cbi-button cbi-button-action rt-btn', 'click': function() {
			self.scanDone = true;
			btn.disabled = true;
			dcontent(body, E('p', { 'class': 'spinning' }, 'Scanning...'));
			exec(['router-wifi-scan']).then(function(l) { self.scanList = l || []; self.drawScan(self.scanList); self.drawWifi(); }).catch(function() { self.drawScan([]); });
		} }, [icon('search', 16), 'Scan nearby networks']);
		var body = E('div', {});
		if (list) {
			list.sort(function(a, b) { return (b.signal || -200) - (a.signal || -200); });
			body.appendChild(list.length ? E('div', { 'class': 'rt-scroll' }, E('table', { 'class': 'rt-table' }, [
				E('thead', {}, E('tr', {}, ['Network', 'Signal', 'Channel', 'Security'].map(function(h) { return E('th', {}, h); }))),
				E('tbody', {}, list.map(function(n) {
					return E('tr', {}, [E('td', {}, n.ssid), E('td', {}, [signalBars(n.signal), n.signal != null ? n.signal + ' dBm' : '-']), E('td', {}, n.channel || '-'), E('td', {}, n.enc || 'Open')]);
				}))])) : E('p', { 'class': 'rt-muted' }, 'No networks were found.'));
		}
		else body.appendChild(E('p', { 'class': 'rt-muted' }, 'Press the button to see the networks around the router.'));
		dcontent(this.el.wifiScan, [E('div', { 'class': 'rt-h' }, [icon('search'), 'Nearby networks', E('span', { 'class': 'rt-sub' }, btn)]), body,
			E('div', { 'class': 'rt-note' }, 'To add a new network with its password, use Network > Wireless > Scan. Saved networks appear above.')]);
	},

	/* ---------- tests ---------- */
	buildTests: function() {
		var self = this;
		/* ping controls (the results are shown as rows of the Checks table) */
		this.el.pingHost = E('input', { 'type': 'text', 'class': 'cbi-input-text', 'placeholder': 'Add a site or address, e.g. youtube.com', 'style': 'flex:1;min-width:160px' });
		var add = function() {
			var h = self.el.pingHost.value.trim();
			if (!/^[A-Za-z0-9._:-]+$/.test(h)) return toast('Enter a valid site name or IP address.', 'danger');
			if (self.custom.indexOf(h) < 0 && self.custom.length < 5) self.custom.push(h);
			store('odash.ctl.pinghosts', JSON.stringify(self.custom));
			self.el.pingHost.value = '';
			self.pingTick(true);
		};
		this.el.pingHost.addEventListener('keydown', function(ev) { if (ev.key === 'Enter') add(); });
		this.el.pingAuto = E('input', { 'type': 'checkbox', 'change': function() { self.pingAuto = this.checked; if (this.checked) self.pingTick(true); } });
		this.pingLast = {}; this.pingAt = 0;
		try { this.leakLast = JSON.parse(store('odash.ctl.leaklast') || '{}') || {}; } catch (e) { this.leakLast = {}; }

		var speed = this.buildSpeed();

		/* DNS leak: the result opens under its row of the Checks table */
		this.el.leakBody = E('div', {});
		this.el.leakBtn = { disabled: false }; this.el.leakBtn2 = { disabled: false };

		/* Checks table */
		this.el.chkBody = E('tbody', {});
		this.el.chkSched = E('input', { 'type': 'checkbox', 'class': 'rt-fsw', 'change': function() {
			var d = self.ss || {}, on = this.checked, box = this;
			execText(['speed-sched-set', on ? '1' : '0', d.mode || 'both', String(d.every || 360)]).then(function() { toast(on ? 'Scheduled tests are on.' : 'Scheduled tests are off.'); return self.speedSchedLoad(); })
				.catch(function(e) { box.checked = !on; toast('The command failed: ' + (e.message || e), 'danger'); });
		} });
		var head = E('div', { 'class': 'rt-h' }, [icon('bolt'), 'Checks', E('span', { 'style': 'margin-left:auto;display:inline-flex;gap:12px;align-items:center;flex-wrap:wrap;justify-content:flex-end' }, [
			E('button', { 'class': 'cbi-button cbi-button-action rt-btn', 'click': function() { self.chkRunAll(); } }, 'Run all'),
			E('label', { 'class': 'rt-fswl', 'title': 'Run the speed tests automatically. Change the interval under Scheduled tests below.' }, [this.el.chkSched, 'scheduled'])])]);
		var foot = E('div', { 'class': 'rt-row', 'style': 'margin-top:10px;flex-wrap:wrap' }, [this.el.pingHost, E('button', { 'class': 'cbi-button', 'click': add }, 'Add a ping target'),
			E('label', { 'style': 'cursor:pointer;font-size:12px;opacity:.8' }, [this.el.pingAuto, ' Repeat pings every 10 seconds'])]);
		var checks = E('div', { 'class': 'rt-card rt-wide' }, [head,
			E('div', { 'class': 'rt-scroll' }, E('table', { 'class': 'rt-table rt-chkt' }, [E('thead', {}, E('tr', {}, ['Check', 'Last result', 'Trend', 'Age', ''].map(function(h) { return E('th', {}, h); }))), this.el.chkBody])), foot]);
		this.paintChecks();
		if (!this.chkTimer) this.chkTimer = window.setInterval(function() { if (self.tab === 'tests') self.paintChecks(); }, 30000);
		return E('div', { 'class': 'rt-grid' }, [checks, speed]);
	},

	chkAge: function(ms) {
		if (!ms) return '-';
		var d = Math.max(0, (Date.now() - ms) / 1000);
		return d < 60 ? 'just now' : d < 3600 ? Math.floor(d / 60) + ' min' : d < 86400 ? Math.floor(d / 3600) + ' h' : Math.floor(d / 86400) + ' d';
	},

	/* run the light checks first, then the direct speed test */
	chkRunAll: function() {
		var self = this;
		if (this.el.speedBtnDirect.disabled) return toast('A speed test is already running.');
		this.pingTick(true);
		this.afterLeak = function() { self.speedStart('direct'); };
		this.leakStart('quick');
	},

	paintChecks: function() {
		var self = this, rows = [];
		if (!this.el.chkBody) return;
		function row(key, icn, name, res, vals, col, ts, run, extra, open) {
			rows.push(E('tr', { 'class': 'rt-chkr' + (open ? ' open' : ''), 'click': open !== undefined ? function() { self.chkOpen = self.chkOpen === key ? null : key; self.paintChecks(); } : null, 'style': open !== undefined ? 'cursor:pointer' : null }, [
				E('td', { 'style': 'white-space:nowrap' }, [E('span', { 'style': 'color:' + col + ';margin-right:6px;vertical-align:middle' }, icon(icn, 16)), E('b', {}, name)]),
				E('td', {}, res), E('td', {}, vals && vals.length ? spark(vals, col) : ''), E('td', { 'class': 'rt-muted' }, ts ? self.chkAge(ts) : '-'),
				E('td', { 'style': 'text-align:right;white-space:nowrap' }, [extra || '', E('button', { 'class': 'cbi-button rt-btn', 'click': function(ev) { ev.stopPropagation(); run(); } }, 'Run'), open !== undefined ? E('span', { 'class': 'rt-muted', 'style': 'margin-left:8px' }, open ? '\u25b4' : '\u25be') : ''])]));
			if (open) rows.push(E('tr', { 'class': 'rt-chkx' }, E('td', { 'colspan': 5 }, self.el.leakBody)));
		}
		/* speed */
		[['direct', 'Speed \u00b7 Direct', '#3b82f6'], ['proxy', 'Speed \u00b7 Through PassWall', '#8b5cf6']].forEach(function(m) {
			var r = (self.speedRes || {})[m[0]], hist = (self.speedHist || []).filter(function(x) { return x.mode === m[0] && x.down && x.down.mbps != null; }).slice(0, 15).reverse().map(function(x) { return +x.down.mbps; });
			var res = !r ? E('span', { 'class': 'rt-muted' }, 'Not run yet') : (!r.down || r.down.mbps == null) ? badge('Failed', 'rt-bad')
				: [E('b', { 'style': 'color:#3b82f6' }, (+r.down.mbps).toFixed(1)), ' / ', E('b', { 'style': 'color:#f59e0b' }, r.up && r.up.mbps != null ? (+r.up.mbps).toFixed(1) : '-'), ' Mbps' + (r.ping && r.ping.avg != null ? ' \u00b7 ' + Math.round(r.ping.avg) + ' ms' : '')];
			row('speed-' + m[0], 'bolt', m[1], res, hist, m[2], r && r.ts ? r.ts * 1000 : 0, function() {
				if (self.el.speedBtnDirect.disabled) return toast('A speed test is already running.');
				self.speedStart(m[0]);
			});
		});
		/* ping */
		var hs = this.pingHosts();
		hs.forEach(function(h) {
			var r = self.pingLast[h[1]], have = r != null, ok = have && r.ok;
			var res = !have ? E('span', { 'class': 'rt-muted' }, 'Not run yet') : ok ? [Math.round(r.avg) + ' ms avg \u00b7 ' + (r.loss != null ? r.loss : 0) + '% loss'] : badge('No answer', 'rt-bad');
			var rm = h[2] ? E('button', { 'class': 'rt-edit', 'title': 'Remove this target', 'click': function(ev) {
				ev.stopPropagation(); self.custom = self.custom.filter(function(c) { return c !== h[1]; });
				store('odash.ctl.pinghosts', JSON.stringify(self.custom)); delete self.pingHist[h[1]]; delete self.pingLast[h[1]]; self.paintChecks();
			} }, '\u00d7') : '';
			row('ping-' + h[1], 'activity', 'Ping \u00b7 ' + h[0], res, self.pingHist[h[1]] || [], have && !ok ? '#ef4444' : '#10b981', have ? self.pingAt : 0, function() { self.pingTick(true); }, rm);
		});
		/* DNS leak */
		[['quick', 'DNS leak \u00b7 Quick'], ['extended', 'DNS leak \u00b7 Extended']].forEach(function(m) {
			var l = self.leakLast[m[0]], key = 'dns-' + m[0];
			var res = !l ? E('span', { 'class': 'rt-muted' }, 'Not run yet') : l.bad ? badge('Leak found', 'rt-bad') : l.warn ? badge(l.warn + ' warning' + (l.warn > 1 ? 's' : ''), 'rt-warn') : badge('No leak', 'rt-on');
			row(key, 'world', m[1], res, null, l && l.bad ? '#ef4444' : '#8b5cf6', l ? l.ts : 0, function() { self.chkOpen = key; self.leakStart(m[0]); }, '', self.chkOpen === key);
		});
		dcontent(this.el.chkBody, rows);
		if (this.ss && this.el.chkSched) this.el.chkSched.checked = !!this.ss.enabled;
	},


	pingHosts: function() {
		var hs = PING_DEFAULT.map(function(h) { return [h[0], h[1]]; });
		this.custom.forEach(function(c) { hs.push([c, c]); });
		var gw = this.info && (this.info.gateway || '');
		return hs.filter(function(h) { return h[1] !== '@gw' || gw; }).map(function(h) { return [h[0], h[1] === '@gw' ? gw : h[1], h[1] !== '@gw' && PING_DEFAULT.every(function(p) { return p[1] !== h[1]; })]; });
	},

	pingTick: function(force) {
		var self = this;
		if (this.pingBusy || this.tab !== 'tests') return;
		if (!force && !this.pingAuto && this.pingRan) return;
		this.pingRan = true; this.pingBusy = true;
		var hs = this.pingHosts();
		exec(['router-ping'].concat(hs.map(function(h) { return h[1]; }))).then(function(res) {
			var m = {};
			(res || []).forEach(function(r) { m[r.host] = r; });
			hs.forEach(function(h) {
				var a = self.pingHist[h[1]] = self.pingHist[h[1]] || [], r = m[h[1]];
				a.push(r && r.ok ? r.avg : null);
				while (a.length > 30) a.shift();
			});
			self.drawPing(hs, m);
		}).catch(function() {}).then(function() {
			self.pingBusy = false;
			if (self.pingAuto) window.setTimeout(function() { self.pingTick(true); }, 10000);
		});
	},

	drawPing: function(hs, m) {
		this.pingLast = m || {}; this.pingAt = Date.now(); this.paintChecks();
	},

	/* run a background test and poll its result */
	bgTest: function(cmd, busyEl, onDone, onFail, onStep, limit, startArg) {
		var n = 0;
		var step = function() {
			n++;
			exec([cmd, 'status']).then(function(r) {
				if (r && r.state === 'done') return onDone(r);
				if (r && r.state === 'error') return onFail(r);
				if (n > (limit || 60)) return onFail({});
				if (onStep && r && r.step) onStep(r.step);
				window.setTimeout(step, 1500);
			}).catch(function() { onFail({}); });
		};
		exec(startArg ? [cmd, 'start', startArg] : [cmd, 'start']).then(function() { window.setTimeout(step, 1500); }).catch(function() { onFail({}); });
	},

	/* ---------- speed test: gauge ---------- */
	gaugeSvg: function() {
		var s = document.createElementNS(NS, 'svg');
		s.setAttribute('viewBox', '0 0 260 215'); s.setAttribute('class', 'rt-gauge');
		var mk = function(tag, at, txt) { var e = document.createElementNS(NS, tag); Object.keys(at).forEach(function(k) { e.setAttribute(k, at[k]); }); if (txt != null) e.textContent = txt; s.appendChild(e); return e; };
		var CX = 130, CY = 118, R = 98, A0 = 225, SW = 270;
		/* a fixed, Ookla-like scale: every mark gets the same angle, so the needle never jumps when the speed grows */
		var MARKS = [0, 5, 10, 25, 50, 100, 250, 500, 1000], SEG = MARKS.length - 1;
		var frac = function(v) {
			if (v <= 0) return 0;
			if (v >= MARKS[SEG]) return 1;
			for (var i = 1; i <= SEG; i++) if (v <= MARKS[i]) return (i - 1 + (v - MARKS[i - 1]) / (MARKS[i] - MARKS[i - 1])) / SEG;
			return 1;
		};
		var pt = function(f, r) { var a = (A0 - SW * f) * Math.PI / 180; return [CX + r * Math.cos(a), CY - r * Math.sin(a)]; };
		var arc = function(f) {
			var p0 = pt(0, R), p1 = pt(f, R);
			return 'M' + p0[0].toFixed(1) + ' ' + p0[1].toFixed(1) + ' A' + R + ' ' + R + ' 0 ' + (f * SW > 180 ? 1 : 0) + ' 1 ' + p1[0].toFixed(1) + ' ' + p1[1].toFixed(1);
		};
		mk('path', { d: arc(1), fill: 'none', stroke: 'rgba(128,128,128,.2)', 'stroke-width': 12, 'stroke-linecap': 'round' });
		var val = mk('path', { d: arc(0.0001), fill: 'none', stroke: '#3b82f6', 'stroke-width': 12, 'stroke-linecap': 'round', style: 'transition:stroke .3s' });
		for (var i = 0; i <= SEG * 5; i++) {
			var big = i % 5 === 0, p0 = pt(i / (SEG * 5), R - 12), p1 = pt(i / (SEG * 5), R - (big ? 22 : 17));
			mk('line', { x1: p0[0].toFixed(1), y1: p0[1].toFixed(1), x2: p1[0].toFixed(1), y2: p1[1].toFixed(1), stroke: 'currentColor', 'stroke-width': big ? 1.8 : .7, opacity: big ? .6 : .28, 'stroke-linecap': 'round' });
		}
		MARKS.forEach(function(m, k) { var p = pt(k / SEG, R - 32); mk('text', { x: p[0].toFixed(1), y: (p[1] + 3.2).toFixed(1), 'text-anchor': 'middle', 'font-size': 9.5, fill: 'currentColor', opacity: .7 }, String(m)); });
		var needle = mk('path', { d: 'M' + (CX - 3.5) + ' ' + CY + ' L' + CX + ' ' + (CY - 74) + ' L' + (CX + 3.5) + ' ' + CY + ' Z', fill: 'currentColor' });
		mk('circle', { cx: CX, cy: CY, r: 9, fill: 'currentColor' }); mk('circle', { cx: CX, cy: CY, r: 3.5, fill: 'rgba(255,255,255,.9)' });
		var num = mk('text', { x: CX, y: 185, 'text-anchor': 'middle', 'font-size': 30, 'font-weight': 700, fill: 'currentColor' }, '0');
		var unit = mk('text', { x: CX, y: 204, 'text-anchor': 'middle', 'font-size': 11, fill: 'currentColor', opacity: .7 }, 'Mbps');
		/* smoothing: the readings arrive about once a second; the needle glides to them with a time-based ease */
		var fCur = 0, fTgt = 0, vCur = 0, vTgt = 0, hold = null, col = '#3b82f6', raf = null, last = 0, back = null;
		var fmt = function(v) { return v < 10 ? v.toFixed(2) : v < 100 ? v.toFixed(1) : v.toFixed(0); };
		var draw = function() {
			val.setAttribute('d', arc(Math.max(fCur, 0.0001))); val.setAttribute('stroke', col);
			needle.setAttribute('transform', 'rotate(' + (90 - (A0 - SW * fCur)).toFixed(2) + ' ' + CX + ' ' + CY + ')');
			num.textContent = hold != null ? fmt(hold) : fmt(vCur);
		};
		var frame = function(ts) {
			var dt = last ? Math.min((ts - last) / 1000, 0.05) : 0.016; last = ts;
			var k = 1 - Math.exp(-dt / 0.38);
			fCur += (fTgt - fCur) * k; vCur += (vTgt - vCur) * k;
			var done = Math.abs(fTgt - fCur) < 0.0004 && Math.abs(vTgt - vCur) < 0.005;
			if (done) { fCur = fTgt; vCur = vTgt; }
			draw();
			if (done) { raf = null; last = 0; } else raf = window.requestAnimationFrame(frame);
		};
		var kick = function() { if (!raf) raf = window.requestAnimationFrame(frame); };
		var stopBack = function() { if (back) { window.clearTimeout(back); back = null; } };
		var api = { el: s,
			set: function(v, c, label) { stopBack(); hold = null; v = Math.max(0, v || 0); col = c || col; vTgt = v; fTgt = frac(v); if (label) unit.textContent = label; kick(); },
			/* the test is over: show the final number for a moment, then the needle and the number settle back to zero (the result stays in the tiles and the list) */
			finish: function(v, c, label) {
				stopBack(); v = Math.max(0, v || 0); col = c || col; vTgt = v; fTgt = frac(v); hold = v; if (label) unit.textContent = label; kick();
				back = window.setTimeout(function() { back = null; hold = null; fTgt = 0; vTgt = 0; unit.textContent = 'Mbps'; kick(); }, 1200);
			},
			reset: function() { stopBack(); hold = null; fCur = fTgt = vCur = vTgt = 0; col = '#3b82f6'; unit.textContent = 'Mbps'; draw(); } };
		api.reset();
		return api;
	},

	buildSpeed: function() {
		var self = this;
		this.gauge = this.gaugeSvg();
		this.speedRes = this.speedRes || {};
		this.el.speedPhase = E('div', { 'class': 'rt-phase' }, 'Ready');
		this.el.speedBtnDirect = E('button', { 'class': 'cbi-button cbi-button-action rt-btn', 'title': 'Tests the connection of the provider itself. The test servers bypass PassWall during the test.', 'click': function() { self.speedStart('direct'); } }, [icon('network', 16), 'Direct test']);
		this.el.speedBtnProxy = E('button', { 'class': 'cbi-button cbi-button-action rt-btn', 'title': 'Tests the route that router traffic normally takes, through PassWall when it is running.', 'click': function() { self.speedStart('proxy'); } }, [icon('shield', 16), 'Through PassWall']);
		this.el.speedSteps = E('div', { 'class': 'rt-steps' }); this.paintSteps(null);
		this.el.speedTiles = E('div', { 'class': 'rt-tiles' });
		this.el.speedChart = E('div', { 'class': 'rt-speedchart' });
		this.el.speedCmp = E('div', {});
		this.el.speedLog = E('div', {});
		this.el.speedSched = E('div', {});
		this.el.speedNote = E('div', { 'class': 'rt-note' });
		this.histAll = false;
		this.el.speedSum = E('div', { 'class': 'rt-sum' });
		this.el.speedRail = E('div', {});
		this.el.speedAll = E('details', { 'class': 'rt-lkd', 'style': 'border:0' }, [E('summary', {}, 'All results'), E('div', { 'class': 'rt-lkdb' }, this.el.speedLog)]);
		this.paintSpeedTiles(null); this.paintSpeedCmp();
		var left = E('div', { 'class': 'rt-card rt-net', 'style': 'margin:0' }, [E('div', { 'class': 'rt-h' }, [icon('bolt'), 'Speed test', E('span', { 'class': 'rt-sub' }, this.el.speedPhase)]),
			this.buildSpeedServer(), this.el.speedSteps,
			E('div', { 'class': 'rt-sp4' }, [E('div', { 'class': 'rt-gwrap' }, [this.gauge.el]), E('div', { 'class': 'rt-sp4r' }, [this.el.speedSum,
				E('div', { 'class': 'rt-row', 'style': 'margin-top:12px;flex-wrap:wrap' }, [this.el.speedBtnDirect, this.el.speedBtnProxy])])]),
			E('div', { 'style': 'margin-top:14px' }, [this.el.speedTiles, this.el.speedChart]), this.el.speedNote]);
		var right = E('div', { 'class': 'rt-card', 'style': 'margin:0' }, [E('div', { 'class': 'rt-h' }, [icon('clock'), 'Recent tests']), this.el.speedRail,
			E('button', { 'class': 'cbi-button', 'style': 'width:100%;margin-top:10px', 'click': function() { self.el.speedAll.open = true; self.el.speedAll.scrollIntoView({ behavior: 'smooth', block: 'center' }); } }, 'All results\u2026'),
			E('details', { 'class': 'rt-lkd' }, [E('summary', {}, 'Scheduled tests'), E('div', { 'class': 'rt-lkdb' }, this.el.speedSched)])]);
		return E('div', { 'class': 'rt-wide' }, [E('div', { 'class': 'rt-sprow' }, [left, right]), E('div', { 'class': 'rt-card', 'style': 'margin-top:12px' }, this.el.speedAll)]);
	},

	/* the newest result with what it means in everyday use, and the rail of the latest tests */
	paintSpeedSummary: function() {
		var self = this, R = this.speedRes || {};
		var r = [R.direct, R.proxy].filter(function(x) { return x && x.down && x.down.mbps != null; }).sort(function(a, b) { return (b.ts || 0) - (a.ts || 0); })[0];
		if (!r) {
			dcontent(this.el.speedSum, [E('div', { 'class': 'rt-muted' }, 'Latest result'), E('div', { 'class': 'rt-sumbig rt-muted' }, 'No test yet'), E('div', { 'class': 'rt-note', 'style': 'margin:6px 0 0' }, 'Run a test. Every test you run is saved here with its date and time.')]);
		} else {
			var d = +r.down.mbps, u = r.up && r.up.mbps != null ? +r.up.mbps : null, pg = r.ping ? +r.ping.avg : null;
			var tags = [d >= 25 ? ['Great for 4K streaming', 'rt-on'] : d >= 8 ? ['Good for HD streaming', 'rt-on'] : d >= 3 ? ['Basic streaming only', 'rt-warn'] : ['Too slow for video', 'rt-bad']];
			if (u != null) tags.push(u >= 3 && (pg == null || pg < 150) ? ['Good for video calls', 'rt-on'] : ['Video calls may stutter', 'rt-warn']);
			if (pg != null) tags.push(pg < 60 ? ['Low delay for games', 'rt-on'] : pg < 120 ? ['Playable for games', 'rt-warn'] : ['High delay for games', 'rt-bad']);
			dcontent(this.el.speedSum, [E('div', { 'class': 'rt-muted' }, 'Latest result \u00b7 ' + (r.ts ? new Date(r.ts * 1000).toLocaleString() : r.time || '') + ' \u00b7 ' + (r.mode === 'proxy' ? 'Through PassWall' : 'Direct')),
				E('div', { 'class': 'rt-sumbig' }, [E('span', { 'style': 'color:#3b82f6' }, d.toFixed(1)), E('small', {}, ' \u2193 '), E('span', { 'style': 'color:#f59e0b' }, u != null ? u.toFixed(1) : '-'), E('small', {}, ' \u2191 Mbps')]),
				E('div', { 'style': 'display:flex;gap:6px;flex-wrap:wrap;margin-top:8px' }, tags.map(function(t) { return badge(t[0], t[1]); }))]);
		}
		var h = (this.speedHist || []).filter(function(x) { return x.state !== 'failed' && x.down; }).slice(0, 5);
		dcontent(this.el.speedRail, h.length ? h.map(function(x) {
			return E('div', { 'class': 'rt-rail' }, [badge(x.mode === 'proxy' ? 'PassWall' : 'Direct', x.mode === 'proxy' ? 'rt-off' : 'rt-on'),
				E('div', { 'style': 'flex:1;min-width:0' }, [E('b', { 'style': 'color:#3b82f6' }, '\u2193 ' + (x.down.mbps != null ? (+x.down.mbps).toFixed(1) : '-')), ' ', E('b', { 'style': 'color:#f59e0b' }, '\u2191 ' + (x.up && x.up.mbps != null ? (+x.up.mbps).toFixed(1) : '-')),
					E('div', { 'class': 'rt-muted', 'style': 'font-size:12px' }, (x.ts ? new Date(x.ts * 1000).toLocaleString() : x.time || '') + (x.ping ? ' \u00b7 ' + Math.round(x.ping.avg) + ' ms' : '') + (x.auto ? ' \u00b7 Auto' : ''))])]);
		}) : E('div', { 'class': 'rt-note', 'style': 'margin:0' }, 'No tests yet.'));
	},

	/* choose the test server: Cloudflare picks by itself, or a country and server from the speedtest.net list */
	buildSpeedServer: function() {
		var self = this, saved = null;
		try { saved = JSON.parse(store('odash.ctl.speedsrv') || 'null'); } catch (e) {}
		this.speedSrv = saved && saved.url ? saved : null;
		this.el.srvInfo = E('div', { 'class': 'rt-ssub' });
		this.el.srvPick = E('div', { 'class': 'rt-sform', 'style': 'display:none;margin-bottom:12px' });
		this.el.srvBtn = E('button', { 'class': 'rt-lbtn', 'click': function() { self.srvToggle(); } }, 'Change');
		this.srvPaint();
		return E('div', {}, [E('div', { 'class': 'rt-srvbar' }, [E('span', { 'class': 'rt-sico' }, icon('world', 18)),
			E('div', { 'class': 'rt-stx' }, [E('strong', {}, 'Test server'), this.el.srvInfo]), this.el.srvBtn]), this.el.srvPick]);
	},

	srvPaint: function() {
		var s = this.speedSrv;
		dcontent(this.el.srvInfo, s ? [this.flag(s.cc, s.country), ' ', s.name + (s.country ? ', ' + s.country : '') + ' · ' + s.sponsor] : 'Automatic: Cloudflare picks the closest server to where your traffic leaves the router.');
	},

	srvToggle: function() {
		var self = this, box = this.el.srvPick, s = this.speedSrv, manual = !!s, list = [];
		if (box.style.display !== 'none') { box.style.display = 'none'; return; }
		var msg = E('div', { 'class': 'rt-note', 'style': 'margin:0' });
		var cSel = E('select', { 'class': 'cbi-input-select' }, [E('option', { 'value': '' }, 'Choose a country')].concat(SPEED_COUNTRIES.map(function(o) { return E('option', { 'value': o[1], 'selected': s && s.cc === o[1] ? '' : null }, o[0]); })));
		var sSel = E('select', { 'class': 'cbi-input-select', 'style': 'min-width:0;flex:1' });
		var seg = E('div', { 'class': 'rt-seg' });
		var pick = E('div', { 'class': 'rt-row' }, [E('div', {}, [E('label', {}, 'Country'), cSel]), E('div', { 'style': 'flex:1;min-width:200px' }, [E('label', {}, 'Server'), sSel])]);
		function sync() {
			Array.prototype.forEach.call(seg.childNodes, function(b) { b.className = (b.getAttribute('data-m') === 'manual') === manual ? 'on' : ''; });
			pick.style.display = manual ? '' : 'none'; msg.style.display = manual ? '' : 'none';
		}
		[['auto', 'Automatic (Cloudflare)'], ['manual', 'Choose a server']].forEach(function(o) {
			seg.appendChild(E('button', { 'type': 'button', 'data-m': o[0], 'click': function() { manual = o[0] === 'manual'; sync(); if (manual && cSel.value && !list.length) load(); } }, o[1]));
		});
		function load() {
			var nm = cSel.options[cSel.selectedIndex].textContent;
			list = []; dcontent(sSel, [E('option', { 'value': '' }, 'Loading...')]);
			if (!cSel.value) { dcontent(sSel, []); msg.textContent = 'Choose a country to see its servers.'; return; }
			msg.textContent = 'Loading the servers of ' + nm + '...';
			exec(['speed-servers', nm, cSel.value]).then(function(d) {
				list = Array.isArray(d) ? d : [];
				dcontent(sSel, list.map(function(x, i) { return E('option', { 'value': String(i), 'selected': s && s.url === x.url ? '' : null }, x.name + ' · ' + x.sponsor); }));
				msg.textContent = list.length ? list.length + ' servers, nearest first. The test uses the server you pick.' : 'No servers found. The router could not reach speedtest.net, or this country has none.';
			}).catch(function() { dcontent(sSel, []); msg.textContent = 'Could not load the servers. Check the internet connection of the router.'; });
		}
		cSel.addEventListener('change', load);
		var ok = E('button', { 'class': 'cbi-button cbi-button-action', 'click': function() {
			if (!manual) { self.speedSrv = null; store('odash.ctl.speedsrv', ''); }
			else {
				var x = list[+sSel.value];
				if (!x) return toast('Choose a country and a server first.', 'danger');
				self.speedSrv = { cc: x.cc || cSel.value, country: cSel.options[cSel.selectedIndex].textContent, url: x.url, name: x.name, sponsor: x.sponsor };
				store('odash.ctl.speedsrv', JSON.stringify(self.speedSrv));
			}
			self.srvPaint(); box.style.display = 'none';
		} }, 'Use this server');
		dcontent(box, [E('div', { 'class': 'rt-h2' }, 'Test server'), seg, pick, msg, E('div', { 'class': 'rt-row' }, [ok, E('button', { 'class': 'cbi-button', 'click': function() { box.style.display = 'none'; } }, 'Cancel')])]);
		box.style.display = '';
		sync();
		if (manual && cSel.value) load(); else msg.textContent = 'Choose a country to see its servers.';
	},

	speedSchedLoad: function() {
		var self = this;
		return exec(['speed-sched-get']).then(function(d) { self.ss = d; self.paintSpeedSched(); self.paintChecks(); }).catch(function() {});
	},

	paintSpeedSched: function() {
		var self = this, d = this.ss;
		if (!d) return;
		var on = E('input', { 'type': 'checkbox' }); on.checked = !!d.enabled;
		var mode = E('select', { 'class': 'cbi-input-select' }, [['both', 'Direct and through PassWall'], ['direct', 'Direct only'], ['proxy', 'Through PassWall only']].map(function(o) { return E('option', { 'value': o[0] }, o[1]); })); mode.value = d.mode || 'both';
		var every = E('select', { 'class': 'cbi-input-select' }, [[30, '30 minutes'], [60, 'hour'], [120, '2 hours'], [180, '3 hours'], [360, '6 hours'], [720, '12 hours'], [1440, 'day']].map(function(o) { return E('option', { 'value': String(o[0]) }, o[1]); })); every.value = String(d.every || 360);
		var auto = (this.speedHist || []).filter(function(r) { return r.auto && r.ts; })[0];
		dcontent(this.el.speedSched, [
			E('div', { 'class': 'rt-row' }, [E('label', { 'class': 'rt-wl' }, [on, ' Test automatically']), E('span', { 'class': 'rt-muted' }, 'every'), every, E('span', { 'class': 'rt-muted' }, 'route'), mode,
				E('button', { 'class': 'cbi-button cbi-button-save rt-btn', 'click': function() {
					execText(['speed-sched-set', on.checked ? '1' : '0', mode.value, every.value]).then(function() { toast(on.checked ? 'Scheduled tests are on.' : 'Scheduled tests are off.'); return self.speedSchedLoad(); })
						.catch(function(e) { toast('The command failed: ' + (e.message || e), 'danger'); });
				} }, 'Save')]),
			E('div', { 'class': 'rt-note' }, 'Each test downloads up to 50 MB and uploads about 10 to 20 MB. The results are added to the list below with an "Auto" mark.' + (auto ? ' Last scheduled test: ' + new Date(auto.ts * 1000).toLocaleString() + '.' : ''))]);
	},

	speedHistLoad: function() {
		var self = this;
		this.speedSchedLoad();
		return exec(['router-speed', 'history']).then(function(h) {
			if (!Array.isArray(h)) return;
			self.speedHist = h;
			['direct', 'proxy'].forEach(function(m) { var r = h.filter(function(x) { return x.mode === m; })[0]; if (r && !(self.speedRes[m] && self.speedRes[m].ts > r.ts)) self.speedRes[m] = r; });
			self.paintSpeedCmp(); self.paintSpeedHist(); self.paintChecks();
		}).catch(function() {});
	},

	paintSpeedHist: function() {
		var self = this, all = this.speedHist || [], F = this.hf || (this.hf = { mode: 'all', src: 'all', from: '', to: '', ip: '', page: 1 });
		var PER = 10;
		var day = function(ts) { var d = new Date(ts * 1000); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); };
		var h = all.filter(function(r) {
			if (F.mode !== 'all' && r.mode !== F.mode) return false;
			if (F.src === 'auto' && !r.auto) return false;
			if (F.src === 'manual' && r.auto) return false;
			if (F.from && (!r.ts || day(r.ts) < F.from)) return false;
			if (F.to && (!r.ts || day(r.ts) > F.to)) return false;
			if (F.ip && String(r.ip || '').indexOf(F.ip) < 0) return false;
			return true;
		});
		var pages = Math.max(1, Math.ceil(h.length / PER));
		if (F.page > pages) F.page = pages;
		if (F.page < 1) F.page = 1;
		var again = function(reset) { if (reset) F.page = 1; self.paintSpeedHist(); };
		var sel = E('select', { 'class': 'cbi-input-select', 'change': function() { F.mode = this.value; again(true); } },
			[['all', 'All routes'], ['direct', 'Direct only'], ['proxy', 'Through PassWall only']].map(function(o) { return E('option', { 'value': o[0], 'selected': F.mode === o[0] ? '' : null }, o[1]); }));
		var src = E('select', { 'class': 'cbi-input-select', 'change': function() { F.src = this.value; again(true); } },
			[['all', 'All tests'], ['auto', 'Scheduled only'], ['manual', 'Manual only']].map(function(o) { return E('option', { 'value': o[0], 'selected': (F.src || 'all') === o[0] ? '' : null }, o[1]); }));
		var dt = function(k, label) {
			var i = E('input', { 'type': 'date', 'class': 'cbi-input-text', 'value': F[k], 'style': 'width:150px;min-width:0', 'change': function() { F[k] = this.value; again(true); } });
			return E('label', { 'class': 'rt-fl' }, [label + ' ', i]);
		};
		var ip = E('input', { 'type': 'text', 'class': 'cbi-input-text', 'placeholder': 'Seen as (IP)', 'value': F.ip, 'style': 'width:140px;min-width:0' });
		ip.addEventListener('keydown', function(ev) { if (ev.key === 'Enter') { F.ip = ip.value.trim(); again(true); } });
		ip.addEventListener('change', function() { F.ip = ip.value.trim(); again(true); });
		var active = F.mode !== 'all' || (F.src && F.src !== 'all') || F.from || F.to || F.ip;
		var bar = E('div', { 'class': 'rt-row', 'style': 'margin-bottom:8px' }, [sel, src, dt('from', 'From'), dt('to', 'To'), ip,
			active ? E('button', { 'class': 'cbi-button', 'click': function() { self.hf = null; self.paintSpeedHist(); } }, 'Clear filters') : '',
			E('span', { 'class': 'rt-muted', 'style': 'margin-left:auto' }, h.length + (active ? ' of ' + all.length : '') + ' results')]);
		if (!all.length) { dcontent(this.el.speedLog, E('div', { 'class': 'rt-note', 'style': 'margin:0' }, 'No tests yet. Every test you run is saved here with its date and time.')); return; }
		var f = function(v, d) { return v == null ? '-' : (+v).toFixed(d); };
		var newest = {};
		all.forEach(function(r) { if (r.state === 'failed') return; if (!newest[r.mode] || (r.ts || 0) > newest[r.mode]) newest[r.mode] = r.ts || 0; });
		var rows = h.slice((F.page - 1) * PER, F.page * PER).map(function(r) {
			var d = new Date((r.ts || 0) * 1000);
			return E('tr', {}, [E('td', {}, r.ts ? d.toLocaleDateString() + ' ' + d.toLocaleTimeString() : (r.time || '-')), E('td', {}, [r.mode === 'direct' ? 'Direct' : 'PassWall', r.state === 'failed' ? badge('Failed', 'rt-bad') : (r.ts || 0) === newest[r.mode] ? badge('Latest', 'rt-on') : null, r.auto ? badge('Auto', 'rt-off') : null]),
				E('td', { 'class': 'rt-num' }, r.down && r.down.mbps != null ? f(r.down.mbps, 2) + ' Mbps' : '-'), E('td', { 'class': 'rt-num' }, r.up && r.up.mbps != null ? f(r.up.mbps, 2) + ' Mbps' : '-'),
				E('td', { 'class': 'rt-num' }, r.ping ? f(r.ping.avg, 0) + ' ms' : '-'), E('td', { 'class': 'rt-num' }, r.ping ? f(r.ping.jitter, 1) + ' ms' : '-'),
				E('td', { 'class': 'rt-num' }, r.down && r.down.loaded_ms != null ? f(r.down.loaded_ms, 0) + ' ms' : '-'), E('td', {}, [self.flag(r.loc), ' ', r.ip || ''])]);
		});
		if (!rows.length) rows = [E('tr', {}, E('td', { 'colspan': 8, 'class': 'rt-muted' }, 'No test matches these filters.'))];
		var go = function(p) { return function() { F.page = p; self.paintSpeedHist(); }; };
		var nums = [];
		for (var p = 1; p <= pages; p++) {
			if (pages > 7 && p !== 1 && p !== pages && Math.abs(p - F.page) > 1) { if (nums[nums.length - 1] !== '…') nums.push('…'); continue; }
			nums.push(p);
		}
		var pager = pages > 1 ? E('div', { 'class': 'rt-row', 'style': 'margin-top:8px;justify-content:center' }, [
			E('button', { 'class': 'cbi-button', 'disabled': F.page === 1 ? '' : null, 'click': go(F.page - 1) }, '‹ Newer')].concat(nums.map(function(n) {
				return n === '…' ? E('span', { 'class': 'rt-muted' }, n) : E('button', { 'class': 'cbi-button' + (n === F.page ? ' cbi-button-action' : ''), 'click': go(n) }, String(n));
			})).concat([E('button', { 'class': 'cbi-button', 'disabled': F.page === pages ? '' : null, 'click': go(F.page + 1) }, 'Older ›')])) : '';
		dcontent(this.el.speedLog, [bar, E('div', { 'class': 'rt-scroll' }, E('table', { 'class': 'rt-table' }, [
			E('thead', {}, E('tr', {}, ['Date and time', 'Route', 'Download', 'Upload', 'Ping', 'Jitter', 'Latency under load', 'Seen as'].map(function(x) { return E('th', {}, x); }))), E('tbody', {}, rows)])),
			pager,
			E('div', { 'class': 'rt-row', 'style': 'margin-top:8px' }, [
				E('button', { 'class': 'cbi-button cbi-button-negative', 'click': function() { if (window.confirm('Delete the whole speed test history?')) execText(['router-speed', 'history-clear']).then(function() { self.speedHist = []; self.speedRes = {}; self.paintSpeedCmp(); self.paintSpeedHist(); }); } }, 'Clear history')])]);
	},

	paintSpeedCmp: function() {
		var self = this, R = this.speedRes, f = function(r, k, d) { return r && r[k] ? (+r[k].mbps).toFixed(d == null ? 2 : d) + ' Mbps' : '-'; };
		var row = function(name, r) {
			return E('tr', {}, [E('td', {}, name), E('td', {}, r ? r.time : '-'), E('td', {}, f(r, 'down')), E('td', {}, f(r, 'up')), E('td', {}, r && r.ping ? r.ping.avg.toFixed(0) + ' ms' : '-'),
				E('td', {}, r && r.ping ? r.ping.jitter.toFixed(1) + ' ms' : '-'), E('td', {}, r ? [self.flag(r.loc), ' ', r.ip || ''] : '-')]);
		};
		dcontent(this.el.speedCmp, E('div', { 'class': 'rt-scroll', 'style': 'margin-top:12px' }, E('table', { 'class': 'rt-table' }, [
			E('thead', {}, E('tr', {}, ['Route', 'Time', 'Download', 'Upload', 'Ping', 'Jitter', 'Seen as'].map(function(h) { return E('th', {}, h); }))),
			E('tbody', {}, [row('Direct', R.direct), row('Through PassWall', R.proxy)])])));
		this.paintSpeedSummary();
	},

	/* the test server, complete, inside its tile */
	speedSrvNode: function(r) {
		var v = r && r.srv;
		if (!v) return r && r.colo ? r.colo : '-';
		var g = v.geo || {}, ccn = v.cc || g.cc;
		var line = function(t) { return E('div', { 'class': 'rt-tsub' }, t); };
		return E('div', { 'class': 'rt-tsrv' }, [
			E('div', { 'style': 'display:flex;gap:8px;align-items:center' }, [this.flag(ccn, g.country), E('b', {}, [v.city || g.city || '-', v.colo ? ' (' + v.colo + ')' : ''].join('')), ' ', g.country || ''].filter(function(x) { return x !== ''; })),
			line([v.host, v.ip].filter(Boolean).join(' · ')),
			line([g.isp || g.org, g.as].filter(Boolean).join(' · ')),
			line([v.region, v.lat != null && v.lon != null ? v.lat + ', ' + v.lon : '', [v.http, v.tls].filter(Boolean).join(' / '), v.warp ? 'WARP ' + v.warp : ''].filter(Boolean).join(' · '))]);
	},

	/* the four steps of a test: Ping, Download, Upload, Done. phase: null (idle), 'starting', 'ping', 'download', 'upload', 'done', 'fail' */
	paintSteps: function(phase, failAt) {
		var ST = [['ping', 'Ping'], ['download', 'Download'], ['upload', 'Upload'], ['done', 'Done']];
		var idx = { starting: 0, ping: 0, download: 1, upload: 2, done: 4 }[phase];
		if (phase === 'fail') idx = failAt == null ? 0 : failAt;
		var kids = [];
		ST.forEach(function(x, i) {
			var cls = idx == null ? '' : i < idx ? ' ok' : i === idx ? (phase === 'fail' ? ' bad' : ' on') : '';
			kids.push(E('div', { 'class': 'rt-stp' + cls }, [E('span', { 'class': 'rt-stc' }, cls === ' ok' ? '\u2713' : cls === ' bad' ? '!' : String(i + 1)), E('b', {}, x[1])]));
			if (i < 3) kids.push(E('div', { 'class': 'rt-stl' + (idx != null && i < idx ? ' ok' : '') }));
		});
		dcontent(this.el.speedSteps, kids);
	},

	paintSpeedTiles: function(r, live) {
		var f = function(v, u, d) { return v == null ? '-' : (+v).toFixed(d == null ? 1 : d) + ' ' + u; };
		var p = r && r.ping || {}, dn = r && r.down || {}, up = r && r.up || {};
		var tiles = [['Download', dn.mbps != null ? f(dn.mbps, 'Mbps', 2) : '-', '#3b82f6'], ['Upload', up.mbps != null ? f(up.mbps, 'Mbps', 2) : '-', '#f59e0b'],
			['Ping', f(p.avg, 'ms'), null], ['Jitter', f(p.jitter, 'ms'), null], ['Packet loss', p.loss != null ? p.loss + '%' : '-', null],
			['Latency under load', dn.loaded_ms != null ? f(dn.loaded_ms, 'ms', 0) : '-', null],
			['Your IP', r && r.ip || '-', null], ['Server', this.speedSrvNode(r), null, true]];
		dcontent(this.el.speedTiles, tiles.map(function(t) {
			return E('div', { 'class': t[3] ? 'rt-tile rt-tile2' : 'rt-tile' }, [E('small', {}, t[0]), E('b', t[2] ? { 'style': 'color:' + t[2] } : {}, t[1])]);
		}));
	},

	paintSpeedChart: function(dl, ul) {
		var w = 300, h = 60, all = (dl || []).concat(ul || []), max = Math.max.apply(null, all.concat([0.1]));
		var svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h); svg.setAttribute('class', 'rt-spark3');
		[[dl, '#3b82f6'], [ul, '#f59e0b']].forEach(function(s) {
			if (!s[0] || s[0].length < 2) return;
			var d = '', st = w / Math.max(s[0].length - 1, 1);
			s[0].forEach(function(v, i) { d += (i ? 'L' : 'M') + (i * st).toFixed(1) + ' ' + (h - 4 - v / max * (h - 8)).toFixed(1); });
			var p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); p.setAttribute('fill', 'none'); p.setAttribute('stroke', s[1]); p.setAttribute('stroke-width', 2); svg.appendChild(p);
		});
		dcontent(this.el.speedChart, all.length > 1 ? [svg, E('div', { 'class': 'rt-note', 'style': 'margin:2px 0 0' }, 'Speed during the test: blue download, orange upload (peak ' + max.toFixed(1) + ' Mbps)')] : '');
	},

	speedStart: function(mode) {
		var self = this, n = 0, bad = 0;
		var off = function(v) { self.el.speedBtnDirect.disabled = v; self.el.speedBtnProxy.disabled = v; };
		off(true);
		var pw = (this.info.passwall || {}).running;
		this.el.speedNote.textContent = mode === 'direct' ? 'Direct test: the test servers bypass PassWall, so this is the speed of the connection itself.' : (pw ? 'Test through PassWall: traffic goes through the proxy like the other traffic of the router.' : 'PassWall is not running, so both tests use the same path.');
		this.paintSpeedTiles(null); this.paintSpeedChart([], []);
		this.gauge.reset();
		this.el.speedPhase.textContent = 'Starting...'; this.paintSteps('starting');
		var fail = function() {
			off(false); self.el.speedPhase.textContent = 'Failed'; self.paintSteps('fail', self.stepAt);
			self.gauge.set(0, '#ef4444', 'Mbps');
			self.el.speedNote.textContent = self.speedSrv ? 'The test failed. This server may be down or blocked. Try another server, or choose Automatic.' : 'The test failed. The internet may be down or the download was blocked.';
		};
		var names = { starting: 'Starting...', ping: 'Measuring latency', download: 'Testing download', upload: 'Testing upload' };
		var step = function() {
			n++;
			exec(['router-speed', 'status']).then(function(r) {
				bad = 0;
				if (r && r.state === 'done') {
					off(false); self.el.speedPhase.textContent = 'Done'; self.paintSteps('done');
					self.speedRes[mode] = r; self.paintSpeedCmp();
					self.gauge.finish(r.down ? r.down.mbps : 0, '#22c55e', 'Mbps download');
					self.paintSpeedTiles(r); self.paintSpeedChart(r.down && r.down.samples, r.up && r.up.samples);
					self.el.speedNote.textContent = 'Downloaded ' + bytes((r.down || {}).bytes || 0) + (r.up && r.up.bytes ? ' and uploaded ' + bytes(r.up.bytes) : '') + '.';
					self.speedHistLoad();
					return;
				}
				if (r && r.state === 'error') return fail();
				if (n > 150) return fail();
				if (r && r.state === 'running') {
					self.el.speedPhase.textContent = names[r.phase] || 'Testing'; self.stepAt = { ping: 0, download: 1, upload: 2 }[r.phase]; self.paintSteps(r.phase);
					self.gauge.set(r.now || 0, r.phase === 'upload' ? '#f59e0b' : '#3b82f6', r.phase === 'upload' ? 'Mbps upload' : r.phase === 'download' ? 'Mbps download' : 'Mbps');
					if (r.ping) self.paintSpeedTiles({ ping: r.ping, colo: r.colo, loc: r.loc, ip: r.ip, down: { loaded_ms: r.loaded_dl } });
					self.paintSpeedChart(r.dl, r.ul);
				}
				window.setTimeout(step, 500);
			}).catch(function() { if (++bad > 8) fail(); else window.setTimeout(step, 1000); });
		};
		var sa = ['router-speed', 'start', mode === 'direct' ? 'direct' : 'proxy'];
		if (this.speedSrv) sa = sa.concat([this.speedSrv.url, this.speedSrv.cc || '', this.speedSrv.name || '', this.speedSrv.sponsor || '']);
		execText(sa).then(function() { window.setTimeout(step, 1000); }).catch(function() { window.setTimeout(step, 1000); });
	},

	/* ---------- DNS leak: flags and location ---------- */
	flag: function(cc, name) {
		var c = (cc || '').toLowerCase();
		if (!/^[a-z]{2}$/.test(c)) return E('span', { 'class': 'rt-flag rt-flag0' }, '?');
		var img = E('img', { 'class': 'rt-flag', 'src': 'https://flagcdn.com/w40/' + c + '.png', 'alt': cc, 'title': name || cc, 'loading': 'lazy' });
		img.onerror = function() { img.replaceWith(E('span', { 'class': 'rt-flag rt-flag0' }, cc.toUpperCase())); };
		return img;
	},

	geoLine: function(g) {
		return [this.flag(g.cc, g.country), ' ', [g.city, g.region, g.country].filter(Boolean).join(', ') || '-'];
	},

	leakText: function(r, br) {
		var p = r.public || {}, L = [];
		var loc = function(g) { return [g.city, g.region, g.country].filter(Boolean).join(', ') || '-'; };
		L.push('DNS leak test ' + (r.date || '') + ' ' + (r.time || ''));
		L.push('Public address: ' + (p.ip || '-') + ' - ' + loc(p) + ' - ' + (p.isp || p.org || '-') + ' ' + (p.as || ''));
		if (br && br.ip) L.push('Browser address: ' + br.ip + ' - ' + [br.city, br.country].filter(Boolean).join(', ') + ' - ' + (br.isp || ''));
		if (r.v6) L.push('IPv6: ' + (r.v6.public || r.v6.address || 'none'));
		(r.tests || []).forEach(function(t) { L.push(t.via + ': ' + (t.ip ? t.ip + ' - ' + loc(t) + ' - ' + (t.isp || t.org || '-') + (t.ms ? ' - ' + t.ms + ' ms' : '') : 'no answer')); });
		var ex = r.extended || {};
		if (ex.ok) (ex.resolvers || []).forEach(function(t) { L.push('Resolver in use: ' + t.ip + ' - ' + loc(t) + ' - ' + (t.isp || t.org || '-')); });
		(r.upstream || []).forEach(function(u) { L.push('Configured: ' + u.server + ' - ' + loc(u) + ' - ' + (u.isp || u.org || '-')); });
		return L.join('\n');
	},

	leakChecks: function(r, br) {
		var p = r.public || {}, tests = r.tests || [], ex = r.extended || {}, v6 = r.v6 || {}, cfg = r.config || {}, C = [];
		var add = function(st, title, text) { C.push({ st: st, title: title, text: text }); };
		var rt = tests[0] || {};
		if (!rt.ip) add('bad', 'Router DNS', 'The router DNS did not answer. Devices may have no name resolution.');
		else if (p.cc && rt.cc && rt.cc !== p.cc) add('bad', 'Router DNS location', 'Your queries are answered by a resolver in ' + (rt.country || rt.cc) + ', but your public address is in ' + (p.country || p.cc) + '. This is a leak.');
		else add('ok', 'Router DNS location', 'The resolver is in the same country as your public address (' + (p.country || p.cc || '?') + ').');
		var exr = ex.ok ? (ex.resolvers || []) : [];
		if (!r.extended) { /* quick test: no extended data */ }
		else if (ex.ok) {
			if (!exr.length) add('info', 'Extended test', 'The test service saw no resolver. The result may be cached or blocked.');
			else {
				var bad = exr.filter(function(x) { return p.cc && x.cc && x.cc !== p.cc; });
				if (bad.length) add('bad', 'Extended test', bad.length + ' of ' + exr.length + ' resolvers in use are outside ' + (p.country || 'your country') + ': ' + bad.map(function(x) { return x.ip + ' (' + (x.cc || '?') + ')'; }).join(', ') + '.');
				else add('ok', 'Extended test', exr.length + ' resolver' + (exr.length > 1 ? 's' : '') + ' in use, all in ' + (p.country || 'your country') + '.');
				if (exr.length > 1) add('warn', 'Several resolvers', 'Your queries are spread over ' + exr.length + ' resolvers. Check that every one of them is meant to be used.');
			}
		} else add('info', 'Extended test', 'The extended test service (bash.ws) could not be reached.');
		var dir = tests.slice(1).filter(function(t) { return t.ip; });
		if (dir.length) {
			var ccs = {}; dir.forEach(function(t) { ccs[t.cc || '?'] = 1; });
			var odd = dir.filter(function(t) { return p.cc && t.cc && t.cc !== p.cc; });
			if (odd.length) add('warn', 'Direct queries', 'Queries sent straight to a public DNS server leave from ' + Object.keys(ccs).join(', ') + ', not from the country of your public address.');
			else add('ok', 'Direct queries', 'Queries sent straight to public DNS servers use the same route as your traffic.');
		}
		if (!r.v6) { /* quick test */ }
		else if (v6.address) {
			if (v6.public && v6.cc && p.cc && v6.cc !== p.cc) add('bad', 'IPv6', 'IPv6 traffic leaves from ' + (v6.country || v6.cc) + ' while IPv4 leaves from ' + (p.country || p.cc) + '. Turn IPv6 off or route it through the proxy.');
			else if (v6.public) add('warn', 'IPv6', 'This router has IPv6 (' + v6.public + '). Make sure it follows the same route as IPv4.');
			else add('info', 'IPv6', 'The router has an IPv6 address but no IPv6 connectivity was seen.');
		} else add('ok', 'IPv6', 'No global IPv6 address, so IPv6 cannot leak.');
		if (cfg.redirect_rules > 0) add('ok', 'DNS redirect', cfg.redirect_rules + ' firewall rule' + (cfg.redirect_rules > 1 ? 's' : '') + ' redirect port 53, so devices with their own DNS settings are caught.');
		else add('info', 'DNS redirect', 'No firewall rule redirects port 53. A device that uses its own DNS server bypasses the router.');
		if (p.warp === 'on' || p.cf_warp === 'on' || p.cf_warp === 'plus') add('info', 'Cloudflare WARP', 'Cloudflare reports that this connection goes through WARP.');
		if (p.proxy || p.hosting) add('info', 'Public address type', p.proxy ? 'The address is listed as a proxy or VPN.' : 'The address belongs to a data center.');
		if (br && br.ip) {
			if (br.ip === p.ip) add('ok', 'This browser', 'This browser appears from the same address as the router.');
			else add('warn', 'This browser', 'This browser appears from ' + br.ip + (br.country ? ' (' + br.country + ')' : '') + ', not from the router address. A VPN or proxy on this computer may be active.');
		}
		return C;
	},

	leakStart: function(mode) {
		var self = this;
		if (this.leakBusy) return toast('A DNS leak test is already running.');
		this.leakBusy = true;
		var stepEl = E('span', {}, 'Starting...');
		dcontent(this.el.leakBody, E('p', { 'class': 'spinning' }, [stepEl]));
		this.chkOpen = 'dns-' + (mode === 'quick' ? 'quick' : 'extended'); this.paintChecks();
		var brP = this.browserInfo();
		this.bgTest('router-dnsleak', null, function(r) {
			brP.then(function(br) { self.leakShow(r, br); });
		}, function() {
			self.leakBusy = false; self.afterLeak = null;
			dcontent(self.el.leakBody, E('p', {}, 'The test failed. Check that the router is online.'));
		}, function(t) { stepEl.textContent = t + '...'; }, 60, mode === 'quick' ? 'quick' : null);
	},

	/* what the browser on this computer sees */
	browserInfo: function() {
		var t = function(u) {
			var c = window.AbortController ? new AbortController() : null, to = window.setTimeout(function() { if (c) c.abort(); }, 6000);
			return fetch(u, c ? { signal: c.signal, cache: 'no-store' } : { cache: 'no-store' }).then(function(x) { window.clearTimeout(to); return x.json(); });
		};
		return t('https://api.ipify.org?format=json').then(function(j) {
			var ip = j && j.ip;
			return t('https://ipwho.is/' + ip).then(function(g) {
				return { ip: ip, country: g.country, cc: g.country_code, city: g.city, isp: g.connection && (g.connection.isp || g.connection.org), proxy: g.security && g.security.proxy };
			}).catch(function() { return { ip: ip }; });
		}).catch(function() { return null; });
	},

	leakShow: function(r, br) {
		var self = this;
		this.leakBusy = false;
		var p = r.public || {}, tests = r.tests || [], ex = r.extended || {}, cfg = r.config || {}, v6 = r.v6 || {};
		var flagsOf = function(g) {
			return [g.proxy ? badge('proxy / VPN', 'rt-warn') : '', g.hosting ? badge('data center', 'rt-off') : '', g.mobile ? badge('mobile network', 'rt-off') : ''];
		};
		var ipCell = function(t) { return t.ip ? [E('div', {}, t.ip), t.reverse ? E('div', { 'class': 'rt-note', 'style': 'margin:0' }, t.reverse) : ''] : E('span', { 'class': 'rt-muted' }, 'no answer'); };
		var rows = tests.map(function(t) {
			return E('tr', {}, [E('td', {}, t.via), E('td', {}, ipCell(t)), E('td', {}, t.ip ? self.geoLine(t) : '-'), E('td', {}, t.isp || t.org || '-'),
				E('td', {}, t.as || '-'), E('td', { 'class': 'rt-num' }, t.ms ? t.ms + ' ms' : '-'), E('td', {}, flagsOf(t))]);
		});
		var checks = this.leakChecks(r, br), nbad = checks.filter(function(c) { return c.st === 'bad'; }).length, nwarn = checks.filter(function(c) { return c.st === 'warn'; }).length;
		this.leakLast[r.extended ? 'extended' : 'quick'] = { bad: nbad, warn: nwarn, ts: Date.now() };
		store('odash.ctl.leaklast', JSON.stringify(this.leakLast));
		var verdict = nbad ? badge('Leak found: ' + nbad + ' problem' + (nbad > 1 ? 's' : '') + (nwarn ? ' and ' + nwarn + ' warning' + (nwarn > 1 ? 's' : '') : ''), 'rt-bad')
			: nwarn ? badge('No DNS leak found, ' + nwarn + ' warning' + (nwarn > 1 ? 's' : ''), 'rt-warn') : badge('No leak found', 'rt-on');
		var mark = { ok: ['✔', '#16a34a'], warn: ['!', '#d97706'], bad: ['✖', '#dc2626'], info: ['i', '#6b7280'] };
		var list = E('div', { 'class': 'rt-chk' }, checks.map(function(c) {
			return E('div', { 'class': 'rt-chkrow' }, [E('span', { 'class': 'rt-chkic', 'style': 'background:' + mark[c.st][1] }, mark[c.st][0]), E('div', {}, [E('b', {}, c.title), E('div', { 'class': 'rt-note', 'style': 'margin:0' }, c.text)])]);
		}));
		var pub = E('div', { 'class': 'rt-pub' }, [
			E('div', { 'class': 'rt-pubflag' }, self.flag(p.cc, p.country)),
			E('div', { 'style': 'min-width:0' }, [E('div', { 'class': 'rt-big', 'style': 'margin:0' }, p.ip || '-'),
				E('div', {}, [[p.city, p.district, p.region, p.country].filter(Boolean).join(', ') || '-']),
				E('div', { 'class': 'rt-note', 'style': 'margin:2px 0 0' }, [p.isp || p.org || '', p.as ? ' · ' + p.as : ''])]),
			E('div', { 'class': 'rt-pubtags' }, flagsOf(p))]);
		var off = p.offset != null ? 'UTC' + (p.offset >= 0 ? '+' : '-') + Math.floor(Math.abs(p.offset) / 3600) + (Math.abs(p.offset) % 3600 ? ':' + ('0' + (Math.abs(p.offset) % 3600) / 60).slice(-2) : '') : '';
		var det = kv([['Time zone', p.tz ? p.tz + (off ? ' (' + off + ')' : '') : ''], ['Continent', p.continent], ['Postal code', p.zip], ['Coordinates', p.lat != null && p.lon != null ? p.lat + ', ' + p.lon : ''],
			['Currency', p.currency], ['Host name', p.reverse], ['Organization', p.org], ['AS name', p.asname],
			['Cloudflare data center', p.cf_colo ? p.cf_colo + (p.cf_loc ? ' (' + p.cf_loc + ')' : '') : ''], ['Cloudflare WARP', p.cf_warp], ['Protocol seen', [p.cf_http, p.cf_tls].filter(Boolean).join(' / ')]]);
		var brBox = br && br.ip ? E('div', {}, [E('div', { 'class': 'rt-sec' }, 'This browser'),
			kv([['Address', br.ip], ['Location', [br.city, br.country].filter(Boolean).join(', ')], ['Provider', br.isp], ['Same as the router', br.ip === p.ip ? 'yes' : 'no']])]) : '';
		var v6Box = E('div', {}, [E('div', { 'class': 'rt-sec' }, 'IPv6'),
			v6.address ? kv([['Router address', v6.address], ['Public address', v6.public || 'no IPv6 connectivity'], ['Location', v6.ip ? [v6.city, v6.country].filter(Boolean).join(', ') : ''], ['Provider', v6.isp || v6.org]])
				: E('p', { 'class': 'rt-note', 'style': 'margin:0' }, 'This router has no global IPv6 address.')]);
		var exRows = (ex.resolvers || []).map(function(x) {
			return E('tr', {}, [E('td', {}, ipCell(x)), E('td', {}, self.geoLine(x)), E('td', {}, x.isp || x.org || '-'), E('td', {}, x.as || '-'), E('td', {}, flagsOf(x))]);
		});
		var exBox = E('div', {}, [E('div', { 'class': 'rt-sec' }, 'Every resolver in use (extended test)'),
			ex.ok ? (exRows.length ? E('div', { 'class': 'rt-scroll' }, E('table', { 'class': 'rt-table' }, [E('thead', {}, E('tr', {}, ['Resolver', 'Location', 'Provider', 'AS', ''].map(function(h) { return E('th', {}, h); }))), E('tbody', {}, exRows)])) : E('p', { 'class': 'rt-note', 'style': 'margin:0' }, 'No resolver was seen.'))
				: E('p', { 'class': 'rt-note', 'style': 'margin:0' }, 'The extended test service could not be reached.')]);
		var up = (r.upstream || []).map(function(u) {
			return E('tr', {}, [E('td', {}, u.server), E('td', {}, self.geoLine(u)), E('td', {}, u.isp || u.org || '-'), E('td', {}, u.as || '-')]);
		});
		var cfgBox = E('div', {}, [E('div', { 'class': 'rt-sec' }, 'How DNS is set up on the router'), kv([
			['Listening on port 53', cfg.listen53], ['DNS software running', cfg.software], ['dnsmasq servers', cfg.servers],
			['Ignores the ISP DNS', cfg.noresolv === '1' ? 'yes' : cfg.noresolv === '0' ? 'no' : ''], ['DNS given to devices (DHCP)', cfg.dhcp_dns || 'the router itself'],
			['Port 53 redirect rules', String(cfg.redirect_rules != null ? cfg.redirect_rules : 0)]])]);
		var copy = E('button', { 'class': 'cbi-button rt-btn', 'click': function() {
			var txt = self.leakText(r, br), ok = function() { toast('The report was copied.'); };
			if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(ok, function() { toast('Copy failed.', 'danger'); });
			else { var ta = E('textarea', { 'style': 'position:fixed;opacity:0' }, txt); document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); ok(); } catch (e) { toast('Copy failed.', 'danger'); } ta.remove(); }
		} }, 'Copy report');
		var vt = nbad ? 'DNS leak found' : nwarn ? 'No DNS leak, ' + nwarn + ' warning' + (nwarn > 1 ? 's' : '') : 'No leak found';
		var vs = nbad ? nbad + ' problem' + (nbad > 1 ? 's' : '') + (nwarn ? ' and ' + nwarn + ' warning' + (nwarn > 1 ? 's' : '') : '') : 'Every check passed';
		var banner = E('div', { 'class': 'rt-lkb ' + (nbad ? 'bad' : nwarn ? 'warn' : 'ok') }, [E('span', { 'class': 'rt-lkic' }, nbad ? '\u2716' : nwarn ? '!' : '\u2714'),
			E('div', { 'style': 'min-width:0;flex:1' }, [E('b', {}, vt), E('div', { 'class': 'rt-lks' }, vs + ' \u00b7 ' + (r.extended ? 'Extended test' : 'Quick test') + ', ' + (r.date || '') + ' ' + (r.time || ''))]), copy]);
		function more(title, kids, open) { return E('details', { 'class': 'rt-lkd', 'open': open ? '' : null }, [E('summary', {}, title), E('div', { 'class': 'rt-lkdb' }, kids)]); }
		function hdl(box) { return box.lastChild ? box.lastChild : box; }
		var tbl = function(heads, body) { return E('div', { 'class': 'rt-scroll' }, E('table', { 'class': 'rt-table' }, [E('thead', {}, E('tr', {}, heads.map(function(h) { return E('th', {}, h); }))), E('tbody', {}, body)])); };
		dcontent(self.el.leakBody, [banner, list,
			E('div', { 'class': 'rt-sec' }, 'Your public address'), pub,
			more('Address details', [det, br && br.ip ? E('div', { 'class': 'rt-lksub' }, 'This browser') : '', brBox && br && br.ip ? kv([['Address', br.ip], ['Location', [br.city, br.country].filter(Boolean).join(', ')], ['Provider', br.isp], ['Same as the router', br.ip === p.ip ? 'yes' : 'no']]) : '',
				r.v6 ? E('div', { 'class': 'rt-lksub' }, 'IPv6') : '', r.v6 ? hdl(v6Box) : '']),
			more('DNS servers seen by the internet (' + rows.length + ')', [tbl(['Question sent to', 'Seen as', 'Location', 'Provider', 'AS', 'Ping', ''], rows)]),
			r.extended ? more('Every resolver in use (' + exRows.length + ')', [ex.ok ? (exRows.length ? tbl(['Resolver', 'Location', 'Provider', 'AS', ''], exRows) : E('p', { 'class': 'rt-note', 'style': 'margin:0' }, 'No resolver was seen.')) : E('p', { 'class': 'rt-note', 'style': 'margin:0' }, 'The extended test service could not be reached.')]) : '',
			up.length ? more('DNS servers configured on the router (' + up.length + ')', [tbl(['Server', 'Location', 'Provider', 'AS'], up)]) : '',
			more('How DNS is set up on the router', [hdl(cfgBox)]),
			more('About this test', [E('div', { 'class': 'rt-note', 'style': 'margin:0' }, 'A leak means a resolver run by your local provider sees your queries while you expect them to go through a VPN or proxy. Compare the country of the resolvers with the country of your public address. To fix a leak, send the router DNS through the proxy (for example the remote DNS option of PassWall) and block or redirect port 53 for devices. Location data comes from ip-api.com, ipwho.is and bash.ws and may be approximate.')])]);
		this.paintChecks();
		if (this.afterLeak) { var f = this.afterLeak; this.afterLeak = null; window.setTimeout(f, 500); }
	},

	/* ---------- LED ---------- */
	/* ---------- Samba (file sharing) ---------- */
	buildSamba: function() {
		this.el.smb = E('div', { 'class': 'rt-smb' }, E('div', { 'class': 'rt-card' }, E('p', { 'class': 'spinning' }, 'Loading...')));
		return this.el.smb;
	},

	sambaLoad: function() {
		var self = this;
		return Promise.all([exec(['samba-info']), exec(['disk-list']).catch(function() { return null; })]).then(function(r) {
			self.smb = r[0]; self.dsk = r[1]; self.sambaDraw();
			if (r[1] && r[1].job && r[1].job.state === 'running') self.diskPoll();
		}).catch(function(e) {
			dcontent(self.el.smb, E('div', { 'class': 'rt-card' }, 'Could not read the Samba settings: ' + (e.message || e)));
		});
	},

	sambaDo: function(args, msg) {
		var self = this;
		return execText(args).then(function() { if (msg) toast(msg); return sleep(1500); }).then(function() { return self.sambaLoad(); })
			.catch(function(e) { toast('The command failed: ' + (e.message || e), 'danger'); });
	},

	diskPoll: function() {
		var self = this;
		if (this.dskBusy) return;
		this.dskBusy = true;
		(function tick() {
			sleep(3000).then(function() { return exec(['disk-list']); }).then(function(d) {
				self.dsk = d;
				if (!document.body.contains(self.el.smb)) { self.dskBusy = false; return; }
				self.diskDraw();
				if (d.job && d.job.state === 'running') tick(); else { self.dskBusy = false; self.sambaLoad(); }
			}).catch(function() { self.dskBusy = false; });
		})();
	},

	diskDo: function(args, msg) {
		var self = this;
		return execText(args).then(function() { if (msg) toast(msg); return sleep(800); }).then(function() { return self.sambaLoad(); })
			.catch(function(e) { toast('The command failed: ' + (e.message || e), 'danger'); return self.sambaLoad(); });
	},

	diskFormatForm: function(dev, size, whole) {
		var self = this, d = this.dsk || { fs: {} }, name = dev.replace('/dev/', '');
		var FS = [['ext4', 'ext4 - safest against power cuts (Linux, share it with Samba)'], ['ntfs', 'NTFS - Windows disks'], ['exfat', 'exFAT - Windows, macOS and Linux, big files'], ['vfat', 'FAT32 - works everywhere, files up to 4 GB'], ['f2fs', 'F2FS - made for flash drives (Linux only)']];
		var fs = E('select', { 'class': 'cbi-input-select' }, FS.map(function(o) { return E('option', { 'value': o[0] }, o[1] + (d.fs && d.fs[o[0]] === false ? ' (tools will be installed)' : '')); }));
		var lb = E('input', { 'type': 'text', 'class': 'cbi-input-text', 'value': 'data', 'maxlength': 16 });
		var cf = E('input', { 'type': 'text', 'class': 'cbi-input-text', 'placeholder': name, 'autocomplete': 'off' });
		var go = E('button', { 'class': 'btn cbi-button-negative', 'disabled': 'disabled', 'click': function() {
			ui.hideModal();
			execText(['disk-format', dev, fs.value, lb.value.trim(), whole ? 'whole' : 'part', cf.value.trim()]).then(function() {
				toast('Formatting started.'); self.dskHide = null; return sleep(1000);
			}).then(function() { return self.sambaLoad(); }).catch(function(e) { toast('The command failed: ' + (e.message || e), 'danger'); });
		} }, whole ? 'Erase and format' : 'Format');
		cf.addEventListener('input', function() { if (cf.value.trim() === name) go.removeAttribute('disabled'); else go.setAttribute('disabled', 'disabled'); });
		ui.showModal((whole ? 'Erase the whole disk ' : 'Format ') + dev + '?', [
			E('p', { 'style': 'font-size:13px;color:#d97706' }, (whole ? 'Everything on this disk, all partitions included, will be erased and one new partition will be made. ' : 'Everything on this partition will be erased. ') + 'This cannot be undone. Size: ' + bytes(size * 1024) + '.'),
			E('div', { 'class': 'rt-smb' }, E('div', { 'class': 'rt-mfld' }, [E('span', {}, 'Filesystem'), fs, E('span', {}, 'Name'), lb, E('span', {}, 'Type ' + name + ' to confirm'), cf])),
			E('div', { 'class': 'right', 'style': 'margin-top:12px' }, [E('button', { 'class': 'btn', 'click': ui.hideModal }, 'Cancel'), ' ', go])]);
	},

	diskDraw: function() {
		var self = this, d = this.dsk, box = this.el.dskBox;
		if (!box) return;
		var head = E('div', { 'class': 'rt-h' }, [icon('cpu'), 'Disks and storage']);
		if (!d) { dcontent(box, [head, E('p', { 'class': 'rt-note' }, 'Could not read the disks.')]); return; }
		var j = d.job || {}, kids = [head];
		var busy = j.state === 'running';
		if (j.state && j.state !== 'idle' && j.msg !== this.dskHide) {
			kids.push(E('div', { 'class': busy ? 'rt-note' : (j.state === 'done' ? 'rt-note' : 'rt-warn'), 'style': 'margin:8px 0;display:flex;gap:10px;align-items:center' }, [
				busy ? E('span', { 'class': 'spinning' }, '') : null, E('span', {}, j.msg),
				busy ? null : E('button', { 'class': 'rt-lbtn', 'click': function() { self.dskHide = j.msg; self.diskDraw(); } }, 'Dismiss')]));
		}
		if (!d.disks.length) kids.push(E('p', { 'class': 'rt-warn' }, 'No USB disk is connected. Plug in a disk to share it.'));
		d.disks.forEach(function(dk) {
			var rows = dk.parts.map(function(p) {
				var pct = p.size && p.mp ? Math.round(p.used / p.size * 100) : 0;
				var acts = [];
				if (p.mp) acts.push(E('button', { 'class': 'cbi-button rt-btn', 'disabled': busy ? 'disabled' : null, 'click': function() { self.diskDo(['disk-eject', p.dev], p.dev + ' was unmounted.'); } }, 'Unmount'));
				else if (p.fs) acts.push(E('button', { 'class': 'cbi-button cbi-button-action rt-btn', 'disabled': busy ? 'disabled' : null, 'click': function() { self.diskDo(['disk-mount', p.dev], p.dev + ' was mounted.'); } }, 'Mount'));
				acts.push(E('button', { 'class': 'cbi-button cbi-button-negative rt-btn', 'disabled': busy ? 'disabled' : null, 'click': function() { self.diskFormatForm(p.dev, p.size, false); } }, 'Format'));
				return E('tr', {}, [
					E('td', {}, [E('b', {}, p.dev.replace('/dev/', '')), E('div', { 'class': 'rt-sub' }, (p.label || 'no name') + ' · ' + (p.fs ? p.fs.toUpperCase() : 'no filesystem'))]),
					E('td', { 'style': 'min-width:130px' }, p.mp ? [E('div', { 'class': 'rt-meter2' }, E('i', { 'style': 'width:' + pct + '%' })), E('small', {}, bytes(p.used * 1024) + ' of ' + bytes(p.size * 1024) + ' (' + pct + '%)')] : [E('small', {}, bytes(p.size * 1024))]),
					E('td', {}, p.mp ? [E('span', { 'class': 'rt-addr' }, p.mp), p.auto ? E('div', { 'class': 'rt-sub' }, 'mounts at boot') : null] : E('span', { 'class': 'rt-sub' }, 'not mounted')),
					E('td', { 'style': 'text-align:right;white-space:nowrap' }, acts)]);
			});
			var anyMounted = dk.parts.some(function(p) { return p.mp; });
			kids.push(E('div', { 'class': 'rt-h', 'style': 'margin-top:14px;font-size:13px' }, [E('span', {}, (dk.model || 'USB disk') + ' · ' + dk.dev.replace('/dev/', '') + ' · ' + bytes(dk.size * 1024)), E('span', { 'class': 'rt-sp' }),
				E('button', { 'class': 'rt-lbtn', 'disabled': busy ? 'disabled' : null, 'click': function() { self.diskFormatForm(dk.dev, dk.size, true); } }, 'Erase whole disk'),
				E('button', { 'class': 'rt-lbtn', 'disabled': busy ? 'disabled' : null, 'click': function() {
					ui.showModal('Safely remove ' + dk.dev + '?', [E('p', {}, 'Samba pauses for a moment, the files are written to the disk and every partition is unmounted. After that it is safe to power the router off or unplug the disk. To use the disk again, plug it in again.'),
						E('div', { 'class': 'right' }, [E('button', { 'class': 'btn', 'click': ui.hideModal }, 'Cancel'), ' ', E('button', { 'class': 'btn cbi-button-positive', 'click': function() { ui.hideModal(); self.diskDo(['disk-eject', dk.dev, 'detach'], 'Done. It is safe to unplug the disk or power the router off.'); } }, 'Safe remove')])]);
				} }, anyMounted ? 'Safe remove' : 'Detach')]));
			kids.push(E('table', { 'class': 'rt-table' }, E('tbody', {}, rows)));
		});
		kids.push(E('p', { 'class': 'rt-note', 'style': 'margin-top:10px' }, 'Tip: press Safe remove before you power the router off. A disk that loses power while it is being written can be damaged. ext4 recovers from this best.'));
		dcontent(box, kids);
	},

	/* ---------- Samba traffic (kept apart from the internet usage) ---------- */
	smbTrafficLoad: function() {
		var self = this;
		return exec(['samba-traffic']).then(function(d) { self.smbT = d; self.smbTrafficDraw(); }).catch(function() {});
	},

	smbTrafficTick: function() {
		var self = this;
		if (this.smbTimer) return;
		this.smbTimer = window.setInterval(function() {
			if (!document.body.contains(self.el.smbTraffic) || self.tab !== 'samba') { window.clearInterval(self.smbTimer); self.smbTimer = null; return; }
			self.smbTrafficLoad();
		}, 3000);
	},

	smbTrafficDraw: function() {
		var d = this.smbT, box = this.el.smbTraffic;
		if (!box) return;
		var head = E('div', { 'class': 'rt-h' }, [icon('download'), 'Samba traffic', E('span', { 'class': 'rt-sp' }), badge(d && d.running ? 'Counting' : 'Not counting', d && d.running ? 'rt-on' : 'rt-off')]);
		if (!d) { dcontent(box, [head, E('p', { 'class': 'rt-note' }, 'Could not read the Samba traffic.')]); return; }
		var devs = (d.devices || []).slice().sort(function(a, b) { return (b.today[0] + b.today[1]) - (a.today[0] + a.today[1]); });
		var sum = function(k, i) { return devs.reduce(function(t, x) { return t + (x[k] instanceof Array ? x[k][i] : x[k]); }, 0); };
		var agg = d.agg || [], ul = agg.map(function(a) { return a[1]; }), dl = agg.map(function(a) { return a[2]; });
		var tile = function(label, val, color) { return E('div', { 'class': 'rt-tile' }, [E('small', {}, label), E('b', color ? { 'style': 'color:' + color } : {}, val)]); };
		var tiles = E('div', { 'class': 'rt-tiles' }, [
			tile('Download now (read from the router)', rate(sum('rdown')), '#3b82f6'), tile('Upload now (written to the router)', rate(sum('rup')), '#f59e0b'),
			tile('Today', '↓ ' + bytes(sum('today', 1)) + '   ↑ ' + bytes(sum('today', 0))), tile('Last 30 days', '↓ ' + bytes(sum('month', 1)) + '   ↑ ' + bytes(sum('month', 0)))]);
		var chart = '';
		if (agg.length > 1) {
			var w = 300, h = 60, max = Math.max.apply(null, dl.concat(ul).concat([1024]));
			var svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h); svg.setAttribute('class', 'rt-spark3');
			[[dl, '#3b82f6'], [ul, '#f59e0b']].forEach(function(sr) {
				var p = '', st = w / Math.max(sr[0].length - 1, 1);
				sr[0].forEach(function(v, i) { p += (i ? 'L' : 'M') + (i * st).toFixed(1) + ' ' + (h - 4 - v / max * (h - 8)).toFixed(1); });
				var el = document.createElementNS(NS, 'path'); el.setAttribute('d', p); el.setAttribute('fill', 'none'); el.setAttribute('stroke', sr[1]); el.setAttribute('stroke-width', 2); svg.appendChild(el);
			});
			chart = E('div', { 'style': 'margin:8px 0' }, [svg, E('div', { 'class': 'rt-note', 'style': 'margin:2px 0 0' }, 'The last 5 minutes: blue download, orange upload (peak ' + rate(max) + ')')]);
		}
		var pair = function(down, up, asRate) { var f = asRate ? rate : bytes; return [E('div', {}, [E('span', { 'class': 'rt-ar rx' }, '↓ '), f(down)]), E('div', {}, [E('span', { 'class': 'rt-ar tx' }, '↑ '), f(up)])]; };
		var rows = devs.map(function(x) {
			return E('tr', {}, [E('td', {}, [E('b', {}, x.name || x.ip), x.name ? E('div', { 'class': 'rt-sub' }, x.ip) : null]),
				E('td', { 'class': 'rt-num' }, pair(x.rdown, x.rup, true)), E('td', { 'class': 'rt-num' }, pair(x.today[1], x.today[0])),
				E('td', { 'class': 'rt-num' }, pair(x.week[1], x.week[0])), E('td', { 'class': 'rt-num' }, pair(x.month[1], x.month[0]))]);
		});
		dcontent(box, [head, tiles, chart,
			rows.length ? E('div', { 'class': 'rt-scroll' }, E('table', { 'class': 'rt-table' }, [E('thead', {}, E('tr', {}, ['Device', 'Now', 'Today', '7 days', '30 days'].map(function(x) { return E('th', {}, x); }))), E('tbody', {}, rows)]))
				: E('p', { 'class': 'rt-note' }, d.running ? 'No Samba traffic yet. It shows up here as soon as a device opens a shared folder.' : 'The counter is not running. Restart oDash from the Settings tab or run /etc/init.d/odash restart.'),
			E('p', { 'class': 'rt-note', 'style': 'margin-top:8px' }, 'This traffic stays inside your network, so it is not counted on the Usage tab. Counting starts when oDash starts and keeps daily totals for 30 days.')]);
	},

	sambaShareForm: function(sh) {
		var self = this, d = this.smb, isNew = !sh, F = {};
		sh = sh || { name: '', path: (d.disks[0] && d.disks[0].mp) || '/mnt', read_only: false, guest_ok: false, browseable: true, force_root: true, users: '', create_mask: '0666', dir_mask: '0777' };
		function t(k, v) { F[k] = E('input', { 'type': 'text', 'class': 'cbi-input-text', 'value': v || '', 'autocomplete': 'off' }); return F[k]; }
		function c(k, v) { F[k] = E('input', { 'type': 'checkbox' }); F[k].checked = !!v; return F[k]; }
		var userBoxes = d.users.map(function(u) { var b = E('input', { 'type': 'checkbox' }); b.checked = (' ' + sh.users + ' ').indexOf(' ' + u + ' ') >= 0; return [u, b]; });
		var access = E('select', { 'class': 'cbi-input-select' }, [E('option', { 'value': 'users' }, 'Only the users I choose'), E('option', { 'value': 'guest' }, 'Everyone on the network (no password)')]);
		access.value = sh.guest_ok ? 'guest' : 'users';
		var ub = E('div', {}, userBoxes.length ? userBoxes.map(function(x) { return E('label', { 'class': 'rt-wl', 'style': 'margin-right:14px' }, [x[1], ' ' + x[0]]); }) : E('span', { 'class': 'rt-warn' }, 'There is no Samba user yet. Add one in the Users card first.'));
		var diskList = E('datalist', { 'id': 'rt-smb-paths' }, d.disks.map(function(k) { return E('option', { 'value': k.mp }); }));
		ui.showModal(isNew ? 'Add a shared folder' : 'Edit "' + sh.name + '"', [
			E('div', { 'class': 'rt-mfld' }, [
				E('label', {}, 'Share name'), t('name', sh.name),
				E('label', {}, 'Folder on the router'), (function() { var i = t('path', sh.path); i.setAttribute('list', 'rt-smb-paths'); return i; })(),
				E('label', {}, 'Who can open it'), access,
				E('label', {}, 'Users'), ub,
				E('label', {}, 'Read only'), c('read_only', sh.read_only),
				E('label', {}, 'Visible in the network list'), c('browseable', sh.browseable),
				E('label', {}, 'Write files as root'), c('force_root', sh.force_root),
				E('label', {}, 'New file permissions'), t('create_mask', sh.create_mask),
				E('label', {}, 'New folder permissions'), t('dir_mask', sh.dir_mask)]),
			diskList,
			E('div', { 'class': 'right', 'style': 'margin-top:14px' }, [E('button', { 'class': 'btn', 'click': ui.hideModal }, 'Cancel'), ' ',
				E('button', { 'class': 'btn cbi-button-action', 'click': function() {
					var users = userBoxes.filter(function(x) { return x[1].checked; }).map(function(x) { return x[0]; }).join(' ');
					var guest = access.value === 'guest';
					if (!guest && !users) return toast('Choose at least one user, or allow everyone.', 'danger');
					var a = ['samba-share-set', isNew ? 'new' : String(sh.idx), 'name=' + F.name.value.trim(), 'path=' + F.path.value.trim(), 'guest_ok=' + (guest ? 1 : 0), 'users=' + (guest ? '' : users),
						'read_only=' + (F.read_only.checked ? 1 : 0), 'browseable=' + (F.browseable.checked ? 1 : 0), 'force_root=' + (F.force_root.checked ? 1 : 0), 'create_mask=' + F.create_mask.value.trim(), 'dir_mask=' + F.dir_mask.value.trim()];
					ui.hideModal();
					self.sambaDo(a, 'The shared folder was saved. Samba restarts for a moment.');
				} }, 'Save')])]);
	},

	sambaUserForm: function(name) {
		var self = this, n = E('input', { 'type': 'text', 'class': 'cbi-input-text', 'value': name || '', 'autocomplete': 'off' }), p = E('input', { 'type': 'password', 'class': 'cbi-input-text', 'autocomplete': 'new-password' });
		if (name) n.disabled = true;
		ui.showModal(name ? 'New password for ' + name : 'Add a Samba user', [
			E('div', { 'class': 'rt-mfld' }, [E('label', {}, 'User name'), n, E('label', {}, 'Password'), p]),
			E('p', { 'class': 'rt-note' }, 'The user name uses lower-case letters, digits, dash and underscore. The password needs at least 4 characters.'),
			E('div', { 'class': 'right' }, [E('button', { 'class': 'btn', 'click': ui.hideModal }, 'Cancel'), ' ',
				E('button', { 'class': 'btn cbi-button-action', 'click': function() {
					var u = n.value.trim(), pw = p.value;
					if (!/^[a-z_][a-z0-9_-]{0,31}$/.test(u)) return toast('The user name is not valid.', 'danger');
					if (pw.length < 4) return toast('The password is too short.', 'danger');
					ui.hideModal();
					self.sambaDo(['samba-user-set', u, pw], 'The user was saved.');
				} }, 'Save')])]);
	},

	sambaDraw: function() {
		var self = this, d = this.smb;
		if (!d.installed) { dcontent(this.el.smb, E('div', { 'class': 'rt-card' }, 'Samba is not installed on this router.')); return; }
		var g = d.global || {}, ip = d.ip || window.location.hostname;
		var running = d.running;
		var status = E('div', { 'class': 'rt-card' }, [
			E('div', { 'class': 'rt-h' }, [icon('folder'), 'File sharing (Samba)', E('span', { 'class': 'rt-sp' }), badge(running ? 'Running' : 'Stopped', running ? 'rt-on' : 'rt-off')]),
			E('div', { 'class': 'rt-row' }, [
				E('button', { 'class': 'cbi-button rt-btn ' + (running ? 'cbi-button-negative' : 'cbi-button-positive'), 'click': function() { self.sambaDo(['samba-svc', running ? 'stop' : 'start'], running ? 'Samba stopped.' : 'Samba started.'); } }, running ? 'Stop' : 'Start'),
				E('button', { 'class': 'cbi-button rt-btn', 'click': function() { self.sambaDo(['samba-svc', 'restart'], 'Samba restarted.'); } }, 'Restart'),
				E('label', { 'class': 'rt-wl' }, [E('input', { 'type': 'checkbox', 'checked': d.enabled ? '' : null, 'change': function() { self.sambaDo(['samba-svc', this.checked ? 'enable' : 'disable']); } }), ' Start at boot'])]),
			E('div', { 'class': 'rt-note' }, 'Open from Windows: \\\\' + ip + '   ·   from macOS / Linux: smb://' + ip)]);

		var wg = E('input', { 'type': 'text', 'class': 'cbi-input-text', 'value': g.workgroup || '' }), ds = E('input', { 'type': 'text', 'class': 'cbi-input-text', 'value': g.description || '' });
		var mac = E('input', { 'type': 'checkbox' }); mac.checked = !!g.macos;
		var ext = E('input', { 'type': 'checkbox' }); ext.checked = !!g.extra;
		var glob = E('div', { 'class': 'rt-card' }, [E('div', { 'class': 'rt-h' }, [icon('gear'), 'Settings']),
			E('div', { 'class': 'rt-fld', 'style': 'margin-top:0' }, [E('label', {}, 'Workgroup'), wg, E('label', {}, 'Description'), ds, E('label', {}, 'macOS support'), mac, E('label', {}, 'Faster transfers'), ext]),
			E('div', { 'class': 'rt-row', 'style': 'margin-top:14px' }, [E('button', { 'class': 'cbi-button cbi-button-action', 'click': function() {
				self.sambaDo(['samba-global', 'workgroup=' + wg.value.trim(), 'description=' + ds.value.trim(), 'macos=' + (mac.checked ? 1 : 0), 'enable_extra_tuning=' + (ext.checked ? 1 : 0)], 'Saved. Samba restarts for a moment.');
			} }, 'Save')])]);

		var rows = d.shares.map(function(sh) {
			var who = sh.guest_ok ? badge('Everyone', 'rt-warn') : E('span', {}, sh.users || '-');
			var pct = sh.size ? Math.min(100, Math.round(sh.used / sh.size * 100)) : 0;
			var onFlash = sh.mp === '/' || sh.mp === '/overlay';
			return E('tr', {}, [
				E('td', {}, E('b', {}, sh.name)),
				E('td', {}, [E('div', { 'class': 'rt-addr' }, sh.path), sh.unmounted ? E('div', { 'class': 'rt-warn' }, ['The disk for this folder is not mounted. ', sh.udev ? E('button', { 'class': 'rt-lbtn', 'click': function() { self.diskDo(['disk-mount', sh.udev], 'The disk was mounted.'); } }, 'Mount now') : '']) : !sh.exists ? E('div', { 'class': 'rt-warn' }, 'The folder does not exist.') : onFlash ? E('div', { 'class': 'rt-warn' }, 'No disk is mounted here: files go to the router\'s own flash.') : null]),
				E('td', {}, [who, E('div', { 'class': 'rt-sub' }, sh.read_only ? 'read only' : 'read and write')]),
				E('td', { 'style': 'min-width:110px' }, sh.size ? [E('div', { 'class': 'rt-meter2' }, E('i', { 'style': 'width:' + pct + '%' })), E('small', {}, bytes(sh.used * 1024) + ' of ' + bytes(sh.size * 1024))] : '-'),
				E('td', { 'style': 'white-space:nowrap;text-align:right' }, [
					E('button', { 'class': 'cbi-button rt-btn', 'title': 'Edit', 'click': function() { self.sambaShareForm(sh); } }, icon('pencil', 14)), ' ',
					E('button', { 'class': 'cbi-button cbi-button-negative rt-btn', 'title': 'Remove', 'click': function() {
						ui.showModal('Remove "' + sh.name + '"?', [E('p', {}, 'The folder stops being shared. The files stay on the disk.'),
							E('div', { 'class': 'right' }, [E('button', { 'class': 'btn', 'click': ui.hideModal }, 'Cancel'), ' ', E('button', { 'class': 'btn cbi-button-negative', 'click': function() { ui.hideModal(); self.sambaDo(['samba-share-del', String(sh.idx)], 'The share was removed.'); } }, 'Remove')])]);
					} }, icon('trash', 14))])]);
		});
		var shares = E('div', { 'class': 'rt-card rt-wide' }, [E('div', { 'class': 'rt-h' }, [icon('folder'), 'Shared folders', E('span', { 'class': 'rt-sp' }),
				E('button', { 'class': 'cbi-button cbi-button-action rt-btn', 'click': function() { self.sambaShareForm(null); } }, [icon('plus', 14), 'Add folder'])]),
			rows.length ? E('div', { 'style': 'overflow-x:auto' }, E('table', { 'class': 'rt-table' }, [E('thead', {}, E('tr', {}, ['Name', 'Folder', 'Access', 'Disk', ''].map(function(h) { return E('th', {}, h); }))), E('tbody', {}, rows)])) : E('p', { 'class': 'rt-note' }, 'No folder is shared yet.')]);

		var urows = d.users.map(function(u) {
			return E('tr', {}, [E('td', {}, E('b', {}, u)), E('td', { 'style': 'text-align:right;white-space:nowrap' }, [
				E('button', { 'class': 'cbi-button rt-btn', 'click': function() { self.sambaUserForm(u); } }, [icon('lock', 14), 'Password']), ' ',
				E('button', { 'class': 'cbi-button cbi-button-negative rt-btn', 'title': 'Remove', 'click': function() {
					ui.showModal('Remove user ' + u + '?', [E('p', {}, 'The user can no longer open the shared folders.'),
						E('div', { 'class': 'right' }, [E('button', { 'class': 'btn', 'click': ui.hideModal }, 'Cancel'), ' ', E('button', { 'class': 'btn cbi-button-negative', 'click': function() { ui.hideModal(); self.sambaDo(['samba-user-del', u], 'The user was removed.'); } }, 'Remove')])]);
				} }, icon('trash', 14))])]);
		});
		var users = E('div', { 'class': 'rt-card' }, [E('div', { 'class': 'rt-h' }, [icon('lock'), 'Users', E('span', { 'class': 'rt-sp' }),
				E('button', { 'class': 'cbi-button cbi-button-action rt-btn', 'click': function() { self.sambaUserForm(null); } }, [icon('plus', 14), 'Add user'])]),
			urows.length ? E('table', { 'class': 'rt-table' }, E('tbody', {}, urows)) : E('p', { 'class': 'rt-note' }, 'No Samba user yet. Add one to open the shared folders with a password.')]);

		var sess = d.sessions.length ? d.sessions.map(function(x) { var ip = typeof x === 'string' ? x : x.ip, nm = typeof x === 'string' ? '' : x.name; return E('span', { 'class': 'rt-chip', 'style': 'margin:0 6px 6px 0;padding:4px 12px' }, nm ? [E('b', {}, nm), E('span', { 'style': 'opacity:.7;margin-left:8px' }, ip)] : ip); }) : E('span', { 'class': 'rt-note' }, 'Nobody is connected right now.');
		var info = E('div', { 'class': 'rt-card' }, [E('div', { 'class': 'rt-h' }, [icon('computer'), 'Connected now']), E('div', { 'style': 'margin-top:8px' }, sess)]);
		this.el.dskBox = E('div', { 'class': 'rt-card rt-wide' });
		this.diskDraw();
		this.el.smbTraffic = E('div', { 'class': 'rt-card rt-wide rt-net' });
		this.smbTrafficDraw();
		this.smbTrafficLoad(); this.smbTrafficTick();

		dcontent(this.el.smb, [E('div', { 'class': 'rt-grid' }, [status, glob, shares, users, info, this.el.smbTraffic, this.el.dskBox])]);
	},

	buildLed: function() {
		this.el.ledBody = E('div', { 'class': 'rt-card rt-wide' }, E('p', { 'class': 'spinning' }, 'Loading...'));
		this.ledInit = false;
		return E('div', { 'class': 'rt-grid' }, [this.el.ledBody]);
	},

	/* ---- fan (only shown when the router has a PWM fan) ---- */
	buildFan: function() {
		var self = this, F = this.fan = { el: {}, temp: 0, cfg: {}, saved: {}, info: null, open: false };
		var MODES = [['auto', 'Automatic', 'Router default', '#3b82f6'], ['quiet', 'Quiet', 'Starts later', '#6366f1'], ['performance', 'Performance', 'Starts earlier', '#f97316'], ['manual', 'Manual', 'Fixed level', '#14b8a6'], ['custom', 'Custom', 'Own curve', '#a855f7']];
		var ICO = { auto: 'M12 3v3M12 18v3M3 12h3M18 12h3M6 6l2 2M16 16l2 2M6 18l2-2M16 8l2-2', quiet: 'M4 14v-4M8 17V7M12 20V4M16 17V7M20 14v-4', performance: 'M13 2 4 14h7l-1 8 9-12h-7z', manual: 'M4 7h16M4 17h16M9 4v6M15 14v6', custom: 'M3 18c4 0 5-12 9-12s5 12 9 12' };
		var FAN = '<svg viewBox="0 0 64 64" width="W" height="W"><g fill="#3b82f6"><path d="M32 32C32 18 40 8 50 10c6 2 4 14-18 22z"/><path d="M32 32C46 32 56 40 54 50c-2 6-14 4-22-18z"/><path d="M32 32C32 46 24 56 14 54c-6-2-4-14 18-22z"/><path d="M32 32C18 32 8 24 10 14c2-6 14-4 22 18z"/></g><circle cx="32" cy="32" r="5" fill="none" stroke="#3b82f6" stroke-width="2"/></svg>';
		F.tempChart = { set: function() {} };
		function set(k, v) { F.cfg[k] = String(v); self.fanFields(); }

		/* ---------- settings dialog (opened by the Settings button, like the official panel) ---------- */
		F.el.seg = E('div', { 'class': 'rt-fmodes' }, MODES.map(function(m) {
			var b = E('button', { 'class': 'rt-fm', 'type': 'button', 'data-m': m[0], 'style': '--mc:' + m[3], 'click': function() { set('mode', m[0]); } }, [E('b', {}, m[1]), E('small', {}, m[2])]);
			var ic = E('span', {}); ic.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="' + ICO[m[0]] + '"/></svg>'; b.insertBefore(ic, b.firstChild);
			return b;
		}));
		function num(k, min, max, w) { var i = E('input', { 'type': 'number', 'min': min, 'max': max, 'style': 'width:' + (w || 62) + 'px', 'change': function() { set(k, this.value); } }); F.el['f_' + k] = i; return i; }
		function tm(k) { var i = E('input', { 'type': 'time', 'change': function() { if (this.value) set(k, this.value); } }); F.el['f_' + k] = i; return i; }
		function chk(k, label) { var i = E('input', { 'type': 'checkbox', 'class': 'rt-fsw', 'change': function() { set(k, this.checked ? '1' : '0'); } }); F.el['f_' + k] = i; return E('label', { 'class': 'rt-fswl' }, [i, label]); }
		function fld(label, kids) { return E('div', { 'class': 'rt-ffld' }, [E('span', { 'class': 'rt-sub' }, label), E('span', { 'class': 'rt-fin' }, kids)]); }
		F.el.lv = E('select', { 'change': function() { set('manual_level', this.value); } }, [0, 1, 2, 3].map(function(n) { return E('option', { 'value': n }, n === 0 ? 'Off (0)' : 'Level ' + n); }));
		F.el.desc = E('div', { 'class': 'rt-fdesc' }, '');
		F.el.scale = E('div', { 'class': 'rt-fscale' });
		/* the slider is the main control of the custom curve: the temperature where the fan starts; the next levels follow 10 degrees apart */
		F.el.thVal = E('span', { 'class': 'rt-fthv' }, '-');
		F.el.th = E('input', { 'type': 'range', 'min': 30, 'max': 70, 'step': 1, 'class': 'rt-frange', 'input': function() {
			var v = +this.value; F.cfg.t1 = String(v);
			if (+F.cfg.t2 <= v) F.cfg.t2 = String(v + 10);
			if (+F.cfg.t3 <= +F.cfg.t2) F.cfg.t3 = String(+F.cfg.t2 + 10);
			self.fanFields();
		} });
		F.el.rowManual = E('div', { 'class': 'rt-fgb' }, [fld('Fixed fan level', [F.el.lv])]);
		F.el.rowCurve = E('div', {}, [
			E('div', { 'class': 'rt-fthh' }, [E('span', {}, ['Temperature threshold ', E('small', { 'class': 'rt-sub' }, '(fan starts)')]), F.el.thVal]), F.el.th,
			E('div', { 'class': 'rt-fgb', 'style': 'margin-top:8px' }, [fld('Level 2 from', [num('t2', 30, 84), '°C']), fld('Level 3 from', [num('t3', 30, 84), '°C']), fld('Hysteresis', [num('hyst', 0, 15, 52), '°C'])])]);
		F.el.det = E('div', { 'class': 'rt-fgrp rt-fdet' }, [F.el.desc, F.el.scale, F.el.rowManual, F.el.rowCurve]);
		F.el.quietBody = E('div', { 'class': 'rt-fgb' }, [fld('From', [tm('quiet_from')]), fld('to', [tm('quiet_to')]), fld('fan max level 1, unless above', [num('quiet_override', 40, 84), '°C'])]);
		F.el.quietNote = E('div', { 'class': 'rt-sub' }, '');
		F.el.rowQuiet = E('div', { 'class': 'rt-fgrp' }, [E('div', { 'class': 'rt-fgh' }, chk('quiet_on', 'Quiet hours')), F.el.quietBody, F.el.quietNote]);
		F.el.rowAlert = E('div', { 'class': 'rt-fgrp' }, [E('div', { 'class': 'rt-fgh' }, chk('alert_on', 'Heat alert')), E('div', { 'class': 'rt-fgb' }, [fld('When the CPU is above', [num('alert_temp', 40, 84), '°C']), E('span', { 'class': 'rt-sub' }, 'LEDs blink and a line is written to the log. Works in every mode.')])]);
		F.el.test = E('button', { 'class': 'cbi-button rt-btn', 'click': function() {
			var b = this; b.disabled = true; execText(['fan-test']).then(function() { toast('Fan runs at full speed for 10 seconds'); self.fanLoad(); }).catch(function() {}).then(function() { window.setTimeout(function() { b.disabled = false; }, 10000); });
		} }, 'Test fan (10 s)'); F.el.test.style.alignSelf = 'flex-start';
		F.openDlg = function() {
			F.cfg = Object.assign({}, F.saved); F.open = true; self.fanFields();
			ui.showModal('Fan settings', [
				E('div', { 'class': 'rt-fdlg' }, [
					E('div', { 'class': 'rt-fbanner' }, 'Choose how the fan is controlled. Changes apply when you press Apply.'),
					F.el.seg, F.el.det, F.el.rowQuiet, F.el.rowAlert,
					E('div', { 'class': 'rt-note' }, 'Safety: at 85 °C or more every custom mode is cancelled and the router\'s own automatic control takes over. The hardware protection limits are never changed.'),
					F.el.test]),
				E('div', { 'class': 'right', 'style': 'margin-top:14px' }, [
					E('button', { 'class': 'cbi-button', 'click': function() { F.open = false; ui.hideModal(); } }, 'Cancel'), ' ',
					E('button', { 'class': 'cbi-button cbi-button-action', 'click': function() {
						var c = F.cfg;
						if (c.mode === 'custom' && !(+c.t1 < +c.t2 && +c.t2 < +c.t3)) { toast('Level 1 < level 2 < level 3 is needed', 'danger'); return; }
						var a = ['fan-set']; Object.keys(c).forEach(function(k) { a.push(k + '=' + c[k]); });
						execText(a).then(function() { F.open = false; ui.hideModal(); toast('Fan settings applied'); return self.fanLoad(); })
							.catch(function(e) { toast('Not saved: ' + (e && e.message || e), 'danger'); });
					} }, 'Apply')])
			]);
		};

		/* ---------- card on the Overview ---------- */
		['status', 'rpm', 'start', 'cpu', 'radios', 'why'].forEach(function(k) { F.el['m_' + k] = E('b', {}, '-'); });
		F.el.alertBadge = E('span', { 'class': 'rt-sstate off', 'style': 'display:none' }, 'Too hot');
		F.el.mfan = E('span', { 'class': 'rt-fspin' }); F.el.mfan.innerHTML = FAN.replace(/W/g, '34');
		F.el.mscale = E('div', { 'class': 'rt-fscale' });
		F.el.sub = E('div', { 'class': 'rt-sub', 'style': 'margin-top:2px' }, '');
		function mt(l, v, x) { return E('div', { 'class': 'rt-fm2' }, [E('small', {}, l), v, x || '']); }
		F.root = E('div', { 'class': 'rt-card rt-wide', 'style': 'display:none;margin-top:14px' }, [
			E('div', { 'class': 'rt-h' }, [icon('temp'), 'Fan', E('span', { 'style': 'margin-left:auto;display:inline-flex;gap:10px;align-items:center;flex-wrap:wrap;justify-content:flex-end' }, [F.el.alertBadge, E('span', { 'style': 'font-weight:400;font-size:12px' }, F.el.m_why),
				E('button', { 'class': 'cbi-button rt-btn', 'click': function() { F.openDlg(); } }, [icon('cpu', 14), 'Settings'])])]),
			E('div', { 'class': 'rt-fmain' }, [
				E('div', { 'class': 'rt-fm2 rt-fm2s' }, [F.el.mfan, E('div', {}, [E('small', {}, 'Fan status'), F.el.m_status])]),
				mt('Fan speed', F.el.m_rpm), mt('CPU temperature', F.el.m_cpu), mt('Fan starts at', F.el.m_start)]),
			F.el.mscale, F.el.sub
		]);
		return F.root;
	},
	/* the temperatures a mode switches levels at: [] for manual, the router's own trips for automatic */
	fanThresholds: function(c) {
		switch (c.mode) {
		case 'quiet': return [65, 75, 83];
		case 'performance': return [45, 55, 65];
		case 'custom': return [+c.t1, +c.t2, +c.t3];
		case 'auto': return [60];
		}
		return [];
	},
	fanScale: function(el, c) {
		var mode = c.mode || 'auto', th = this.fanThresholds(c), lo = 30, hi = 90, F = this.fan, pos = function(v) { return Math.max(0, Math.min(100, (v - lo) / (hi - lo) * 100)); }, h = '<div class="rt-ftrack"></div>';
		th.forEach(function(v, i) { h += '<i class="rt-ftick" style="left:' + pos(v) + '%"></i><span class="rt-ftl" style="left:' + pos(v) + '%">' + (mode === 'auto' ? v + '°' : 'L' + (i + 1) + ' ' + v + '°') + '</span>'; });
		h += '<i class="rt-ftick safe" style="left:' + pos(85) + '%"></i><span class="rt-ftl safe" style="left:' + pos(85) + '%">Safe 85°</span>';
		if (F.temp) h += '<b class="rt-fpin" style="left:' + pos(F.temp) + '%"><em>' + Math.round(F.temp) + '°</em></b>';
		el.innerHTML = h;
		el.style.display = mode === 'manual' ? 'none' : '';
	},
	fanFields: function() {
		var F = this.fan, c = F.cfg, mode = c.mode || 'auto';
		Array.prototype.forEach.call(F.el.seg.children, function(b) { b.className = 'rt-fm' + (b.getAttribute('data-m') === mode ? ' on' : ''); });
		var D = { auto: 'The router controls the fan by itself. It starts at about 60 °C.', quiet: 'The fan starts later and stays quieter. Level 1 from 65 °C, level 2 from 75 °C, level 3 from 83 °C.', performance: 'The fan starts earlier to keep the router cooler. Level 1 from 45 °C, level 2 from 55 °C, level 3 from 65 °C.', manual: 'The fan stays on the level you choose, whatever the temperature (until the 85 °C safety limit).', custom: 'Your own temperatures. The fan only steps down when the CPU is cooler than the step by the hysteresis, so it does not switch back and forth.' };
		F.el.desc.textContent = D[mode];
		F.el.rowManual.style.display = mode === 'manual' ? '' : 'none';
		F.el.rowCurve.style.display = mode === 'custom' ? '' : 'none';
		F.el.lv.value = c.manual_level;
		['t2', 't3', 'hyst', 'quiet_override', 'alert_temp', 'quiet_from', 'quiet_to'].forEach(function(k) { if (F.el['f_' + k] !== document.activeElement) F.el['f_' + k].value = c[k]; });
		F.el.th.value = c.t1; F.el.thVal.textContent = c.t1 + ' °C';
		F.el.f_quiet_on.checked = c.quiet_on === '1'; F.el.f_alert_on.checked = c.alert_on === '1';
		var qoff = mode === 'manual' || mode === 'performance';
		F.el.rowQuiet.className = 'rt-fgrp' + (qoff ? ' dim' : '');
		F.el.f_quiet_on.disabled = qoff;
		F.el.quietNote.textContent = qoff ? 'Not used in ' + (mode === 'manual' ? 'Manual' : 'Performance') + ' mode.' : (c.quiet_on === '1' ? 'During these hours the fan never goes above level 1, unless the CPU gets hotter than the limit.' : '');
		this.fanScale(F.el.scale, c);
	},
	fanLoad: function() {
		var self = this, F = this.fan;
		if (!F) return Promise.resolve();
		return exec(['fan-info']).then(function(r) {
			if (!r || !r.present) { self.noFan = true; if (self.sysPages && self.sysPages.fan) self.sysPages.fan.style.display = 'none'; if (self.sysBtns && self.sysBtns.fan) { self.sysBtns.fan.style.display = 'none'; if (self.sysBtns.fan.className.indexOf('on') > 0) self.sysPage('leds'); } F.root.style.display = 'none'; if (self.el.fanSet) self.el.fanSet.style.display = 'none'; ['hwFan','hwFoot','hwBtn'].forEach(function(k) { if (self.el[k]) self.el[k].style.display = 'none'; }); return; }
			self.noFan = false; if (self.sysPages && self.sysPages.fan) self.sysPages.fan.style.display = ''; if (self.sysBtns && self.sysBtns.fan) self.sysBtns.fan.style.display = ''; F.root.style.display = ''; if (self.el.fanSet) self.el.fanSet.style.display = ''; ['hwFan','hwFoot'].forEach(function(k) { if (self.el[k]) self.el[k].style.display = ''; }); if (self.el.hwBtn) self.el.hwBtn.style.display = '';
			F.saved = Object.assign({}, r.cfg);
			if (!F.open) F.cfg = Object.assign({}, r.cfg);
			var st = r.state || {}, t = r.temp / 1000, lv = r.level, sc = F.saved;
			F.temp = t; self.fanFields(); self.fanScale(F.el.mscale, sc);
			F.el.m_status.textContent = lv > 0 ? 'Level ' + lv + ' of ' + r.max : 'Off';
			F.el.m_rpm.textContent = (r.rpm || 0) + ' RPM';
			F.el.m_cpu.textContent = t.toFixed(0) + ' °C';
			var th = self.fanThresholds(sc);
			F.el.m_start.textContent = sc.mode === 'manual' ? 'Level ' + sc.manual_level + ' always' : th.length ? (sc.mode === 'auto' ? 'about ' : '') + th[0] + ' °C' : '-';
			var svg = F.el.mfan.querySelector('svg'); if (svg) { svg.style.animationDuration = (lv === 1 ? 1.6 : lv === 2 ? 0.9 : 0.5) + 's'; svg.style.animationPlayState = lv > 0 ? 'running' : 'paused'; }
			var rd = (r.radios || []).map(function(x, i) { return 'Wi-Fi ' + (i ? '5' : '2.4') + ' GHz ' + Math.round(x.temp / 1000) + ' °C'; });
			F.el.sub.textContent = rd.concat(r.maxtemp ? ['Highest in 24 h ' + r.maxtemp + ' °C'] : []).join('  ·  ');
			if (self.el.rpmBig) self.el.rpmBig.textContent = String(r.rpm || 0);
			if (self.el.chipMode) { var MN = { auto: 'Automatic', quiet: 'Quiet', performance: 'Performance', manual: 'Manual', custom: 'Custom' }; self.el.chipMode.textContent = MN[sc.mode] || 'Automatic'; self.el.chipLvl.textContent = F.el.m_status.textContent; }
			var why = { auto: 'Automatic', manual: 'Manual level', quiet: 'Quiet mode', performance: 'Performance mode', custom: 'Custom curve', 'quiet-hours': 'Quiet hours: level 1 at most', test: 'Fan test running', safety: 'Too hot: automatic control restored' };
			F.el.m_why.textContent = why[st.why] || (r.running ? '' : 'Fan service is not running');
			F.el.alertBadge.style.display = r.alert ? '' : 'none';
			if (self.el.fanSetTxt) self.el.fanSetTxt.textContent = (why[st.why] || 'Automatic') + ' \u00b7 ' + F.el.m_status.textContent + ' \u00b7 ' + (r.rpm || 0) + ' RPM \u00b7 ' + t.toFixed(0) + ' \u00b0C';
		}).catch(function() {});
	},

	ledLoad: function() {
		var self = this;
		return exec(['led-get']).then(function(r) {
			if (!r) return;
			self.ledData = r;
			if (!self.ledInit) { self.ledInit = true; self.ledDraw(r); }
			self.ledPaint(r);
		}).catch(function() {});
	},

	/* routers with a plain white and a plain blue LED (no RGB), for example GL.iNet Beryl */
	ledDrawMono: function(r) {
		var self = this, cfg = r.cfg || {}, F = {};
		this.ledF = F;
		var num = function(k, w) { var i = E('input', { 'type': 'number', 'class': 'cbi-input-text', 'value': cfg[k], 'style': 'width:' + (w || 80) + 'px;min-width:0' }); F[k] = i; return i; };
		var chk = function(k) { var i = E('input', { 'type': 'checkbox' }); i.checked = cfg[k] === '1'; F[k] = i; return i; };
		var test = function(col, fx, label) { return E('button', { 'class': 'cbi-button', 'click': function() { execText(['led-test', col, fx, '6']).then(function() { toast('Preview for 6 seconds'); }); } }, label); };
		var fxn = { solid: 'On', blink: 'Blinking', slowblink: 'Slow blink', off: 'Off' };
		var states = [['No internet', 'The router cannot reach the internet.', 'blink', 'off'],
			['Online without PassWall', 'Internet works and PassWall is not running.', 'solid', 'off'],
			['Online with PassWall', 'Internet works and PassWall is running.', 'solid', 'solid'],
			['Slow internet', 'Latency to the test host is high.', 'slowblink', 'off'],
			['High CPU load', 'The processor is nearly fully used.', 'solid', 'blink'],
			['Speed or leak test running', 'While a test from this page runs.', 'blink', 'blink'],
			['New device joined', 'A short flash when a new device gets an address.', 'solid', 'blink']];
		var rows = states.map(function(s) {
			return E('tr', {}, [E('td', {}, [E('strong', {}, s[0]), E('div', { 'class': 'rt-note', 'style': 'margin:0' }, s[1])]), E('td', {}, fxn[s[2]]), E('td', {}, fxn[s[3]])]);
		});
		var nf = E('input', { 'type': 'time', 'class': 'cbi-input-text', 'value': cfg.night_from, 'style': 'width:110px;min-width:0' }); F.night_from = nf;
		var nt = E('input', { 'type': 'time', 'class': 'cbi-input-text', 'value': cfg.night_to, 'style': 'width:110px;min-width:0' }); F.night_to = nt;
		var ph = E('input', { 'type': 'text', 'class': 'cbi-input-text', 'value': cfg.ping_host, 'style': 'width:140px;min-width:0' }); F.ping_host = ph;
		var en = chk('enabled');
		var dot = function(c) { return E('span', { 'class': 'rt-leddot', 'style': 'width:22px;height:22px' }); };
		this.el.ledW = dot(); this.el.ledB = dot();
		this.el.ledState = E('b', {}, '-'); this.el.ledInfo = E('div', { 'class': 'rt-note', 'style': 'margin:2px 0 0' });
		this.el.ledDot = this.el.ledW;
		var save = function() {
			var kv2 = [];
			['night_from', 'night_to', 'night_level', 'flicker_kbps', 'slow_ms', 'cpu_pct', 'ping_host'].forEach(function(k) { if (F[k]) kv2.push(k + '=' + String(F[k].value)); });
			['enabled', 'newdev', 'flicker', 'night'].forEach(function(k) { kv2.push(k + '=' + (F[k].checked ? 1 : 0)); });
			execText(['led-set'].concat(kv2)).then(function() { toast('LED settings saved'); window.setTimeout(function() { self.ledLoad(); }, 1500); })
				.catch(function() { toast('Could not save. Check the values.', 'danger'); });
		};
		dcontent(this.el.ledBody, [
			E('div', { 'class': 'rt-h' }, [icon('bulb'), 'Status LEDs (white and blue)', E('span', { 'class': 'rt-sub' }, E('label', { 'style': 'cursor:pointer' }, [en, ' Use the LEDs to show router status']))]),
			E('div', { 'class': 'rt-ledlive' }, [this.el.ledW, this.el.ledB, E('div', {}, [this.el.ledState, this.el.ledInfo])]),
			E('div', { 'class': 'rt-row', 'style': 'margin:12px 0' }, [E('span', {}, 'Try for 6 seconds'),
				test('ffffff', 'solid', 'White on'), test('ffffff', 'blink', 'White blinking'), test('0000ff', 'solid', 'Blue on'), test('0000ff', 'blink', 'Blue blinking')]),
			E('div', { 'class': 'rt-scroll' }, E('table', { 'class': 'rt-table rt-ledtbl' }, [E('thead', {}, E('tr', {}, ['Situation', 'White LED', 'Blue LED'].map(function(h) { return E('th', {}, h); }))), E('tbody', {}, rows)])),
			E('div', { 'class': 'rt-sec' }, 'Options'),
			E('div', { 'class': 'rt-opts' }, [
				E('label', {}, [chk('newdev'), ' Flash the blue LED when a new device joins']),
				E('label', {}, [chk('flicker'), ' Blink the blue LED while traffic is above ', num('flicker_kbps', 70), ' KB/s']),
				E('label', {}, ['Slow internet when latency is above ', num('slow_ms', 70), ' ms, measured to ', ph]),
				E('label', {}, ['High CPU when usage is above ', num('cpu_pct', 60), ' %']),
				E('label', {}, [chk('night'), ' Turn both LEDs off from ', nf, ' to ', nt])]),
			E('div', { 'class': 'rt-row', 'style': 'margin-top:14px' }, [E('button', { 'class': 'cbi-button cbi-button-positive', 'click': save }, 'Save'),
				E('button', { 'class': 'cbi-button', 'click': function() { execText(['led-test', 'off']); toast('Preview stopped'); } }, 'Stop preview')]),
			E('div', { 'class': 'rt-note' }, 'These LEDs only switch on or off, so colours and brightness are not available. Priority from high to low: preview, new device, running test, no internet, high CPU, slow internet, PassWall, online. When LED management is off the white LED stays on and the blue LED stays off.')]);
		F.night_level = { value: '0' };
	},

	ledHex: function(h) { return '#' + (h || '000000').replace('#', ''); },

	ledPaint: function(r) {
		if (!this.el.ledDot) return;
		if (r.mono && this.el.ledW) {
			var st0 = r.state || {}, nm = { passwall: 'Online with PassWall', newdevice: 'New device', disabled: 'LED management is off', offline: 'No internet', online: 'Online', slow: 'Slow internet', cpu: 'High CPU load', test: 'A test is running', preview: 'Preview' };
			var lit = function(fx) { return fx && fx !== 'off'; };
			var nOff = st0.night != null && st0.night !== '' && +st0.night < 50 && st0.state !== 'preview';
			var wOn = !nOff && lit(st0.we), bOn = !nOff && lit(st0.be);
			var paint1 = function(el, on, c) { el.style.background = on ? c : '#444'; el.style.boxShadow = on ? '0 0 12px ' + c : 'none'; };
			paint1(this.el.ledW, wOn, '#ffffff'); paint1(this.el.ledB, bOn, '#3b82f6');
			this.el.ledState.textContent = !r.running ? 'The LED service is not running' : nOff ? 'Off (night mode)' : (nm[st0.state] || st0.state || '-');
			this.el.ledInfo.textContent = st0 ? 'White ' + (st0.we || '-') + ' · blue ' + (st0.be || '-') + ' · CPU ' + (st0.cpu != null ? st0.cpu + '%' : '-') + ' · traffic ' + (st0.kbps != null ? st0.kbps + ' KB/s' : '-') + ' · latency ' + (st0.ms ? st0.ms + ' ms' : '-') : '';
			return;
		}
		var st = r.state, names = { passwall: 'Online with PassWall', newdevice: 'New device', disabled: 'LED switched off', offline: 'No internet', online: 'Online', pass: 'Online with PassWall', slow: 'Slow internet', cpu: 'High CPU load', test: 'A test is running', newdev: 'New device', manual: 'Preview', idle: 'LED management is off' };
		var c = st && st.color ? this.ledHex(st.color) : '#444';
		var nf = st && st.night != null && st.night !== '' ? +st.night : 100, off = r.running && st && nf <= 0;
		if (off) c = '#444';
		this.el.ledDot.style.background = c; this.el.ledDot.style.boxShadow = off ? 'none' : '0 0 14px ' + c;
		this.el.ledDot.style.opacity = off ? 1 : String(Math.max(0.25, Math.min(100, nf) / 100));
		this.el.ledState.textContent = !r.running ? 'The LED service is not running' : off ? 'Off (night mode)' : st ? (names[st.state] || st.state) : '-';
		this.el.ledInfo.textContent = st ? 'CPU ' + (st.cpu != null ? st.cpu + '%' : '-') + ' · traffic ' + (st.kbps != null ? st.kbps + ' KB/s' : '-') + ' · latency ' + (st.net != null ? st.net + ' ms' : '-') + ' · effect ' + (st.effect || '-') : '';
	},

	ledDraw: function(r) {
		var self = this, cfg = r.cfg || {}, F = {};
		this.ledF = F;
		if (r.mono) { this.ledDrawMono(r); return; }
		if (!r.rgb) { dcontent(this.el.ledBody, E('p', {}, 'This router has no LED that oDash can control.')); return; }
		var color = function(k) { var i = E('input', { 'type': 'color', 'value': self.ledHex(cfg[k]), 'style': 'width:46px;height:30px;padding:0;border:1px solid rgba(128,128,128,.4);border-radius:6px;background:none' }); F[k] = i; return i; };
		var eff = function(k) {
			var s = E('select', { 'class': 'cbi-input-select' }, [['solid', 'Steady'], ['blink', 'Blink'], ['slowblink', 'Slow blink'], ['breathe', 'Breathe']].map(function(o) { return E('option', { 'value': o[0] }, o[1]); }));
			s.value = cfg[k] || 'solid'; F[k] = s; return s;
		};
		var num = function(k, w) { var i = E('input', { 'type': 'number', 'class': 'cbi-input-text', 'value': cfg[k], 'style': 'width:' + (w || 80) + 'px;min-width:0' }); F[k] = i; return i; };
		var chk = function(k) { var i = E('input', { 'type': 'checkbox' }); i.checked = cfg[k] === '1'; F[k] = i; return i; };
		var states = [['offline', 'No internet', 'The router cannot reach the internet.', 'c_offline', 'e_offline'],
			['online', 'Online without PassWall', 'Internet works and PassWall is not running.', 'c_online', 'e_online'],
			['pass', 'Online with PassWall', 'Internet works and PassWall is running.', 'c_pass', 'e_pass'],
			['slow', 'Slow internet', 'Latency to the test host is high.', 'c_slow', 'e_slow'],
			['cpu', 'High CPU load', 'The processor is nearly fully used.', 'c_cpu', 'e_cpu'],
			['test', 'Speed or leak test running', 'While a test from this page runs.', 'c_test', 'e_test']];
		var rows = states.map(function(s) {
			var c = color(s[3]), e = eff(s[4]);
			return E('tr', {}, [E('td', {}, [E('strong', {}, s[1]), E('div', { 'class': 'rt-note', 'style': 'margin:0' }, s[2])]), E('td', {}, c), E('td', {}, e),
				E('td', {}, E('button', { 'class': 'cbi-button', 'click': function() { execText(['led-test', c.value.slice(1), e.value, '6']).then(function() { toast('Preview for 6 seconds'); }); } }, 'Preview'))]);
		});
		var newRow = E('tr', {}, [E('td', {}, [E('strong', {}, 'New device joined'), E('div', { 'class': 'rt-note', 'style': 'margin:0' }, 'A short flash when a new device gets an address.')]), E('td', {}, color('c_new')), E('td', {}, [chk('newdev'), ' Enabled']),
			E('td', {}, E('button', { 'class': 'cbi-button', 'click': function() { execText(['led-test', F.c_new.value.slice(1), 'blink', '6']); } }, 'Preview'))]);
		var bri = E('input', { 'type': 'range', 'min': 5, 'max': 100, 'value': cfg.brightness }); F.brightness = bri;
		var briL = E('b', {}, cfg.brightness + '%'); bri.addEventListener('input', function() { briL.textContent = bri.value + '%'; });
		var nf = E('input', { 'type': 'time', 'class': 'cbi-input-text', 'value': cfg.night_from, 'style': 'width:110px;min-width:0' }); F.night_from = nf;
		var nt = E('input', { 'type': 'time', 'class': 'cbi-input-text', 'value': cfg.night_to, 'style': 'width:110px;min-width:0' }); F.night_to = nt;
		var ph = E('input', { 'type': 'text', 'class': 'cbi-input-text', 'value': cfg.ping_host, 'style': 'width:140px;min-width:0' }); F.ping_host = ph;
		var en = chk('enabled');
		this.el.ledDot = E('span', { 'class': 'rt-leddot' }); this.el.ledState = E('b', {}, '-'); this.el.ledInfo = E('div', { 'class': 'rt-note', 'style': 'margin:2px 0 0' });
		var presets = [['Traffic light', { c_offline: 'ff0000', e_offline: 'blink', c_online: 'ffb000', e_online: 'solid', c_pass: '00ff40', e_pass: 'solid' }],
			['Calm blue', { c_offline: 'ff0000', e_offline: 'slowblink', c_online: '0050ff', e_online: 'solid', c_pass: '00c8ff', e_pass: 'breathe' }],
			['Minimal', { c_offline: 'ff0000', e_offline: 'blink', c_online: '000000', e_online: 'solid', c_pass: '00ff40', e_pass: 'solid' }]];
		var save = function() {
			var kv2 = [], keys = ['brightness', 'idle_color', 'night_from', 'night_to', 'night_level', 'flicker_kbps', 'slow_ms', 'cpu_pct', 'ping_host', 'c_offline', 'e_offline', 'c_online', 'e_online', 'c_pass', 'e_pass', 'c_slow', 'e_slow', 'c_cpu', 'e_cpu', 'c_test', 'e_test', 'c_new'];
			keys.forEach(function(k) { if (F[k]) kv2.push(k + '=' + String(F[k].value).replace('#', '')); });
			['enabled', 'newdev', 'flicker', 'night'].forEach(function(k) { kv2.push(k + '=' + (F[k].checked ? 1 : 0)); });
			execText(['led-set'].concat(kv2)).then(function() { toast('LED settings saved'); window.setTimeout(function() { self.ledLoad(); }, 1500); })
				.catch(function() { toast('Could not save. Check the values.', 'danger'); });
		};
		dcontent(this.el.ledBody, [
			E('div', { 'class': 'rt-h' }, [icon('bulb'), 'RGB LED', E('span', { 'class': 'rt-sub' }, E('label', { 'style': 'cursor:pointer' }, [en, ' Use the LED to show router status']))]),
			E('div', { 'class': 'rt-ledlive' }, [this.el.ledDot, E('div', {}, [this.el.ledState, this.el.ledInfo])]),
			E('div', { 'class': 'rt-row', 'style': 'margin:12px 0' }, [E('span', {}, 'Brightness'), bri, briL, E('span', { 'style': 'margin-left:16px' }, 'Color when off'), color('idle_color'),
				E('span', { 'style': 'margin-left:16px' }, 'Presets')].concat(presets.map(function(p) {
				return E('button', { 'class': 'cbi-button', 'click': function() { Object.keys(p[1]).forEach(function(k) { F[k].value = k[0] === 'c' ? self.ledHex(p[1][k]) : p[1][k]; }); } }, p[0]);
			}))),
			E('div', { 'class': 'rt-scroll' }, E('table', { 'class': 'rt-table rt-ledtbl' }, [E('thead', {}, E('tr', {}, ['Situation', 'Color', 'Effect', ''].map(function(h) { return E('th', {}, h); }))), E('tbody', {}, rows.concat([newRow]))])),
			E('div', { 'class': 'rt-sec' }, 'Options'),
			E('div', { 'class': 'rt-opts' }, [
				E('label', {}, [chk('flicker'), ' Flicker the LED while traffic is above ', num('flicker_kbps', 70), ' KB/s']),
				E('label', {}, ['Slow internet when latency is above ', num('slow_ms', 70), ' ms, measured to ', ph]),
				E('label', {}, ['High CPU when usage is above ', num('cpu_pct', 60), ' %']),
				E('label', {}, [chk('night'), ' Night mode from ', nf, ' to ', nt, ', brightness ', num('night_level', 60), ' %'])]),
			E('div', { 'class': 'rt-row', 'style': 'margin-top:14px' }, [E('button', { 'class': 'cbi-button cbi-button-positive', 'click': save }, 'Save'),
				E('button', { 'class': 'cbi-button', 'click': function() { execText(['led-test', 'off']); toast('Preview stopped'); } }, 'Stop preview')]),
			E('div', { 'class': 'rt-note' }, 'Priority from high to low: preview, new device, running test, no internet, high CPU, slow internet, PassWall, online. Blue is the router\'s normal color, so oDash uses it only when LED management is off.')]);
		F.night_level.value = cfg.night_level;
	},

	/* ---------- schedules + system (bottom of the overview) ---------- */
	schedLoad: function() {
		var self = this;
		return exec(['router-sched-list']).then(function(d) { self.sched = d || { wifi: {}, rules: [] }; self.paintSched(); }).catch(function() {});
	},

	schedDays: function(d) {
		if (d === '*') return 'Every day';
		if (d === '1,2,3,4,5') return 'Weekdays';
		if (d === '0,6' || d === '6,0') return 'Weekend';
		var nm = { '0': 'Sun', '1': 'Mon', '2': 'Tue', '3': 'Wed', '4': 'Thu', '5': 'Fri', '6': 'Sat' };
		return d.split(',').map(function(x) { return nm[x] || x; }).join(', ');
	},

	paintSched: function() {
		var self = this, S = this.sched || { wifi: {}, rules: [] }, w = S.wifi || {};
		var names = { reboot: 'Reboot router', wifi_off: 'Turn Wi-Fi off', wifi_on: 'Turn Wi-Fi on', wifi_window: 'Wi-Fi quiet hours' };
		var ics = { reboot: 'power', wifi_off: 'wifi', wifi_on: 'wifi', wifi_window: 'wifi' };
		var state = !w.aps ? 'no Wi-Fi found' : (w.off >= w.aps ? 'Wi-Fi is off' : w.off ? 'Wi-Fi is partly off' : 'Wi-Fi is on');
		var cls = !w.aps ? '' : (w.off >= w.aps ? 'off' : w.off ? 'part' : 'on');
		dcontent(this.el.wifiLine, [
			E('strong', { 'title': 'Switching Wi-Fi off turns off your wireless networks. Devices on cable keep working.' }, 'Wi-Fi now'), E('span', { 'style': 'display:inline-flex;gap:6px;flex-wrap:wrap' }, (w.bands && w.bands.length) ? w.bands.map(function(b) { return E('span', { 'class': 'rt-sstate ' + (b.on ? 'on' : 'off') }, [E('i'), b.band + ' GHz ' + (b.on ? 'on' : 'off')]); }) : [E('span', { 'class': 'rt-sstate ' + cls }, [E('i'), state.replace(/^Wi-Fi (is )?/, '')])]),
			E('span', { 'class': 'rt-sp' }),
			E('div', { 'class': 'rt-scbtns' }, [
				E('button', { 'click': function() {
					if (window.confirm('Turn Wi-Fi off now? Wireless devices (and this page, if you use Wi-Fi) will disconnect.')) self.run(['router-wifi-power', 'off'], 'Wi-Fi turned off.').then(function() { self.schedLoad(); });
				} }, 'Turn off'),
				E('button', { 'click': function() { self.run(['router-wifi-power', 'on'], 'Wi-Fi turned on.').then(function() { self.schedLoad(); }); } }, 'Turn on')])]);
		var DOTS = [['1', 'M'], ['2', 'T'], ['3', 'W'], ['4', 'T'], ['5', 'F'], ['6', 'S'], ['0', 'S']];
		var rows = (S.rules || []).map(function(r) {
			var on = r.on === 1 || r.on === '1' || r.on === true;
			var tm = r.action === 'wifi_window' ? r.time + ' \u2192 ' + r.time2 : r.time;
			var dots = E('span', { 'class': 'rt-dd', 'title': self.schedDays(r.days) }, DOTS.map(function(d) {
				return E('i', { 'class': (r.days === '*' || r.days.split(',').indexOf(d[0]) >= 0) ? 'on' : '' }, d[1]);
			}));
			return E('tr', { 'class': on ? '' : 'off' }, [
				E('td', {}, E('strong', {}, names[r.action] || r.action)),
				E('td', {}, dots),
				E('td', { 'class': 'rt-stime' }, tm),
				E('td', {}, E('label', { 'class': 'rt-tg', 'title': on ? 'Enabled' : 'Disabled' }, [chk(E('input', { 'type': 'checkbox', 'change': function(ev) {
					self.run(['router-sched-save', String(r.id), r.action, r.days, r.time, r.time2 || '', ev.target.checked ? '1' : '0']).then(function() { self.schedLoad(); });
				} }), on), E('i')])),
				E('td', { 'class': 'rt-sact' }, [
					E('button', { 'class': 'rt-ib', 'title': 'Edit', 'click': function() { self.schedEdit = r; self.schedForm(); } }, icon('pencil', 16)),
					E('button', { 'class': 'rt-ib', 'title': 'Delete', 'click': function() { self.run(['router-sched-del', String(r.id)], 'Schedule deleted.').then(function() { self.schedLoad(); }); } }, icon('trash', 16))])]);
		});
		dcontent(this.el.schedList, rows.length ? E('div', { 'class': 'rt-stbw' }, E('table', { 'class': 'rt-stb' }, [
			E('tr', {}, ['Action', 'Days', 'Time', 'On', ''].map(function(h) { return E('th', {}, h); }))].concat(rows)))
			: E('div', { 'class': 'rt-note', 'style': 'margin:12px 0 0' }, 'No schedules yet. Press "Add schedule" to create one.'));
		this.schedForm();
	},

	schedForm: function() {
		var self = this, r = this.schedEdit;
		if (!r && !this.schedAdding) return dcontent(this.el.schedForm, '');
		var act = r ? r.action : 'reboot', days = r ? r.days : '*';
		var sel = {}, on = r ? (r.on === 1 || r.on === '1' || r.on === true) : true;
		var t1 = E('input', { 'type': 'time', 'class': 'cbi-input-text', 'value': (r && r.time) || '04:00' });
		var t2 = E('input', { 'type': 'time', 'class': 'cbi-input-text', 'value': (r && r.time2) || '07:00' });
		var l1 = E('label', {}, 'Time'), t2w = E('div', {}, [E('label', {}, 'Turn Wi-Fi on at'), t2]);
		var seg = E('div', { 'class': 'rt-seg' });
		[['reboot', 'Reboot'], ['wifi_off', 'Wi-Fi off'], ['wifi_on', 'Wi-Fi on'], ['wifi_window', 'Wi-Fi quiet hours']].forEach(function(o) {
			seg.appendChild(E('button', { 'type': 'button', 'data-a': o[0], 'class': act === o[0] ? 'on' : '', 'click': function() { act = o[0]; sync(); } }, o[1]));
		});
		function sync() {
			Array.prototype.forEach.call(seg.childNodes, function(b) { b.className = b.getAttribute('data-a') === act ? 'on' : ''; });
			var w = act === 'wifi_window'; t2w.style.display = w ? '' : 'none'; l1.textContent = w ? 'Turn Wi-Fi off at' : 'Time';
		}
		var chips = E('div', { 'class': 'rt-days' }, [['1', 'Mon'], ['2', 'Tue'], ['3', 'Wed'], ['4', 'Thu'], ['5', 'Fri'], ['6', 'Sat'], ['0', 'Sun']].map(function(d) {
			var b = E('button', { 'type': 'button', 'class': (days === '*' || days.split(',').indexOf(d[0]) >= 0) ? 'on' : '', 'click': function() { b.className = b.className === 'on' ? '' : 'on'; } }, d[1]);
			sel[d[0]] = b; return b;
		}));
		function setDays(list) { Object.keys(sel).forEach(function(k) { sel[k].className = list.indexOf(k) >= 0 ? 'on' : ''; }); }
		var f = E('div', { 'class': 'rt-sform' }, [
			E('div', { 'class': 'rt-h2' }, r ? 'Edit schedule' : 'New schedule'),
			seg,
			E('div', { 'class': 'rt-fl2' }, [E('label', {}, 'Days'), chips,
				E('span', { 'class': 'rt-quick' }, [E('a', { 'click': function() { setDays(['0', '1', '2', '3', '4', '5', '6']); } }, 'every day'), ' \u00b7 ',
					E('a', { 'click': function() { setDays(['1', '2', '3', '4', '5']); } }, 'weekdays'), ' \u00b7 ', E('a', { 'click': function() { setDays(['0', '6']); } }, 'weekend')])]),
			E('div', { 'class': 'rt-row' }, [E('div', {}, [l1, t1]), t2w]),
			E('div', { 'class': 'rt-row' }, [
				E('button', { 'class': 'cbi-button cbi-button-action', 'click': function() {
					var ds = ['1', '2', '3', '4', '5', '6', '0'].filter(function(k) { return sel[k].className === 'on'; });
					if (!ds.length) return toast('Choose at least one day.', 'danger');
					if (!/^\d\d:\d\d$/.test(t1.value)) return toast('Choose a time.', 'danger');
					var w = act === 'wifi_window';
					if (w && (!/^\d\d:\d\d$/.test(t2.value) || t2.value === t1.value)) return toast('Choose two different times.', 'danger');
					self.run(['router-sched-save', r ? String(r.id) : 'new', act, ds.length === 7 ? '*' : ds.join(','), t1.value, w ? t2.value : '', on ? '1' : '0'], 'Schedule saved.').then(function() { self.schedEdit = null; self.schedAdding = false; self.schedLoad(); });
				} }, 'Save'),
				E('button', { 'class': 'cbi-button', 'click': function() { self.schedEdit = null; self.schedAdding = false; self.schedForm(); } }, 'Cancel')])]);
		dcontent(this.el.schedForm, f);
		sync();
	},

	buildSystem: function() {
		var self = this;
		this.el.schedList = E('div', {}); this.el.wifiLine = E('div', { 'class': 'rt-scwifi' }); this.el.schedForm = E('div', {});
		this.schedEdit = null; this.schedAdding = false;
		this.el.tzSel = E('select', { 'class': 'cbi-input-select' });
		this.el.tzNow = E('b', {}); this.el.tzNote = E('span', { 'class': 'rt-note', 'style': 'margin:0' });
		var sched = E('div', { 'class': 'rt-card rt-wide rt-sched' }, [
			E('div', { 'class': 'rt-h' }, [icon('clock'), 'Schedules', E('span', { 'class': 'rt-sp' }),
				E('button', { 'class': 'cbi-button cbi-button-action rt-btn', 'click': function() { self.schedEdit = null; self.schedAdding = true; self.schedForm(); } }, [icon('plus', 16), 'Add schedule'])]),
			this.el.wifiLine, this.el.schedList, this.el.schedForm]);
		var tz = E('div', { 'class': 'rt-card' }, [E('div', { 'class': 'rt-h' }, [icon('world'), 'Time zone']),
			E('div', { 'style': 'margin:-4px 0 8px' }, [this.el.tzNow, ' ', this.el.tzNote]),
			E('div', { 'class': 'rt-row' }, [this.el.tzSel, E('button', { 'class': 'cbi-button cbi-button-action', 'click': function() {
				var v = self.el.tzSel.value.split('|');
				self.run(['router-tz', v[0], v[1]], 'Time zone changed to ' + v[0] + '.');
			} }, 'Apply')])]);
		var bk = E('div', { 'class': 'rt-card' }, [E('div', { 'class': 'rt-h' }, [icon('download'), 'Backup']),
			E('div', { 'class': 'rt-note', 'style': 'margin:-4px 0 8px' }, 'All router settings in one file. It contains your Wi-Fi passwords, so keep it safe.'),
			E('button', { 'class': 'cbi-button cbi-button-action rt-btn', 'click': function() { self.backup(); } }, [icon('download', 16), 'Download backup'])]);
		this.schedLoad();
		var fanCard = this.el.fanSet = E('div', { 'class': 'rt-card rt-wide', 'style': 'display:none' }, [E('div', { 'class': 'rt-h' }, [icon('temp'), 'Fan settings']),
			E('div', { 'class': 'rt-ctl' }, [E('div', { 'class': 'rt-note', 'style': 'margin:0;flex:1 1 300px' }, this.el.fanSetTxt = E('span', {}, '-')),
				E('button', { 'class': 'cbi-button cbi-button-action rt-btn', 'click': function() { if (self.fan) self.fan.openDlg(); } }, [icon('cpu', 14), 'Open fan settings'])])]);
		return { fan: fanCard, tz: tz, bk: bk, domain: this.buildDomain(), sched: sched, reboot: this.el.ctl };
	},

	backup: function() {
		var f = E('form', { 'method': 'post', 'action': L.env.cgi_base + '/cgi-backup', 'style': 'display:none' }, [
			E('input', { 'type': 'hidden', 'name': 'sessionid', 'value': rpc.getSessionID() })]);
		document.body.appendChild(f);
		f.submit();
		window.setTimeout(function() { document.body.removeChild(f); }, 3000);
		toast('The backup file is downloading.');
	},

	/* ---------- refresh of the parts that depend on router-info ---------- */
	updateInfo: function() {
		var d = this.info, self = this;
		if (!d) return;
		this.drawOverview();
		this.drawIfaces();
		this.el.tzNow.textContent = d.time;
		this.el.tzNote.textContent = 'Router time (' + d.tzabbr + ', ' + (d.zone || '-') + ')';
		if (!this.tzFilled || (this.tzFor !== d.zone && document.activeElement !== this.el.tzSel)) {
			this.tzFilled = true; this.tzFor = d.zone;
			var zones = ZONES.slice();
			if (d.zone && !zones.some(function(z) { return z[0] === d.zone; })) zones.unshift([d.zone, d.tz]);
			dcontent(this.el.tzSel, zones.map(function(z) { return E('option', { 'value': z[0] + '|' + z[1], 'selected': z[0] === d.zone ? '' : null }, z[0].replace(/_/g, ' ')); }));
		}
	},

	reboot: function() {
		ui.showModal('Rebooting...', [E('p', { 'class': 'spinning' }, 'The router is restarting. This page reloads when it is back.')]);
		fs.exec_direct('/usr/bin/odash', ['router-reboot']).catch(function() {});
		var waitDown = true;
		window.setInterval(function() {
			var x = new XMLHttpRequest();
			x.timeout = 3000;
			x.onerror = x.ontimeout = function() { waitDown = false; };
			x.onload = function() { if (!waitDown) window.location.reload(); };
			x.open('GET', '/luci-static/resources/luci.js?' + Date.now()); x.send();
		}, 4000);
	},

	handleSave: null, handleSaveApply: null, handleReset: null
});
