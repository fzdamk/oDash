'use strict';
'require baseclass';
'require dom';
'require fs';
'require ui';

/* Icons: Tabler Icons (MIT), outline set, 24x24 stroke paths. */
var ICONS = {
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
	wifi: ['M2 9a15 15 0 0 1 20 0', 'M5 12.5a10 10 0 0 1 14 0', 'M8.5 16a5 5 0 0 1 7 0', 'M12 19.5h.01'],
	lan: ['M9 3h6v5h-6z', 'M3 16h6v5h-6z', 'M15 16h6v5h-6z', 'M12 8v4', 'M6 16v-4h12v4'],
	edit: ['M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4', 'M13.5 6.5l4 4'],
	save: ['M6 4h10l4 4v10a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2', 'M10 14a2 2 0 1 0 4 0a2 2 0 1 0 -4 0', 'M14 4l0 4l-6 0l0 -4'],
	clock: ['M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0', 'M12 7v5l3 3'],
	refresh: ['M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4', 'M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4'],
	undo: ['M9 14l-4 -4l4 -4', 'M5 10h11a4 4 0 1 1 0 8h-1'],
	ban: ['M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0 -18z', 'M5.7 5.7l12.6 12.6'],
	unlock: ['M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6z', 'M8 11v-5a4 4 0 0 1 8 0'],
	gauge: ['M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0', 'M11 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0', 'M13.41 10.59l2.59 -2.59', 'M7 12a5 5 0 0 1 5 -5'],
	trash: ['M4 7l16 0', 'M10 11l0 6', 'M14 11l0 6', 'M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12', 'M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3']
};

var TYPES = [
	['computer', 'Computer'], ['laptop', 'Laptop'], ['phone', 'Phone'], ['tablet', 'Tablet'],
	['watch', 'Watch'], ['tv', 'TV / Streamer'], ['console', 'Game console'], ['speaker', 'Speaker'],
	['camera', 'Camera'], ['iot', 'Smart home / IoT'], ['router', 'Router / AP'], ['other', 'Other']
];

var NS = 'http://www.w3.org/2000/svg';

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

/* "User's PC" -> "Users-PC": a name OpenWrt/dnsmasq accept as a hostname */
function fmtRate(bps) {
	var bits = (+bps || 0) * 8, units = ['bps', 'Kbps', 'Mbps', 'Gbps'], i = 0;
	while (bits >= 1000 && i < units.length - 1) { bits /= 1000; i++; }
	return (i === 0 ? bits.toFixed(0) : bits.toFixed(bits >= 100 ? 0 : 1)) + ' ' + units[i];
}

function toHostname(name) {
	return String(name || '').replace(/['’`"]/g, '')
		.replace(/[^A-Za-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').replace(/-{2,}/g, '-').slice(0, 63).replace(/-+$/, '');
}

var HOST_RE = /^[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/;
var IP_RE = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;

var NUM_RE = /^\d{0,6}([.,]\d{0,3})?$/;

/* "2,5" / "2.5" Mbit/s -> kbit/s (integer), '' -> 0 (unlimited), NaN when invalid */
function toKbps(v) {
	v = String(v || '').trim().replace(',', '.');
	if (v === '') return 0;
	if (!NUM_RE.test(v) || v === '.') return NaN;
	var k = Math.round(parseFloat(v) * 1000);
	return (k === 0 || (k >= 8 && k <= 10000000)) ? k : NaN;
}

function fromKbps(k) {
	return k > 0 ? String(Math.round(k) / 1000) : '';
}

var CSS = [
	'@media (max-width:640px){.st-devtbl thead{display:none}.st-devtbl,.st-devtbl tbody{display:block}.st-devtbl tr{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px;padding:12px 0;border-top:1px solid rgba(128,128,128,.25)}.st-devtbl td{display:block;padding:0 !important;border:0 !important;min-width:0}.st-devtbl td:nth-child(1){grid-column:1/-1}.st-devtbl td:nth-child(2)::before,.st-devtbl td:nth-child(3)::before,.st-devtbl td:nth-child(4)::before{display:block;font-size:11px;opacity:.65;margin-bottom:2px}.st-devtbl td:nth-child(2)::before{content:"Hostname"}.st-devtbl td:nth-child(3)::before{content:"Fixed IP"}.st-devtbl td:nth-child(4)::before{content:"Limit (Mbit/s)"}.st-devtbl td:nth-child(4){grid-column:1/-1}.st-devtbl td:nth-child(5){grid-column:1/-1;display:flex !important;flex-wrap:wrap;gap:6px;justify-content:flex-end}.st-devtbl input.cbi-input-text{width:100%;min-width:0;box-sizing:border-box}}',
	'.st-lim{display:flex;flex-direction:row;align-items:center;gap:4px}',
	'.st-lim .st-arrow{width:12px;text-align:center;font-weight:600;opacity:.7}',
	'.st-lim input.cbi-input-text{width:56px;min-width:56px;text-align:right}',
	'.st-tag-lim{background:rgba(245,158,11,.22);color:#b45309}',
	'.st-icon{vertical-align:middle;flex:none}',
	'.st-btn{display:inline-flex;align-items:center;gap:6px}',
	'.st-dev{display:flex;align-items:center;gap:10px}',
	'.st-pick{border:0;cursor:pointer;color:inherit;padding:0}.st-pick:hover{background:rgba(59,130,246,.18)}.st-dev{position:relative}.st-menu{position:absolute;z-index:30;left:0;top:38px;width:300px;max-width:calc(100vw - 48px);display:grid;grid-template-columns:repeat(2,1fr);gap:4px;padding:8px;border-radius:10px;background:var(--background-color-high,#fff);border:1px solid rgba(128,128,128,.4);box-shadow:0 6px 20px rgba(0,0,0,.2)}.st-mi{display:flex;align-items:center;gap:8px;border:0;background:none;color:inherit;padding:6px 8px;border-radius:6px;cursor:pointer;text-align:left;font-size:13px}.st-mi:hover,.st-mi.on{background:rgba(59,130,246,.15)}',
	'.st-devicon{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:8px;background:rgba(128,128,128,.12);flex:none}',
	'.st-meta{font-size:11px;opacity:.7;font-family:monospace;margin-top:2px;white-space:nowrap}',
	'.st-tag{display:inline-block;margin-left:6px;padding:0 6px;border-radius:8px;font-size:10px;font-family:sans-serif;background:rgba(47,127,209,.18)}',
	'.st-row td.td{padding:6px 8px !important;vertical-align:middle}',
	'.st-row input.cbi-input-text,.st-row select{height:28px;padding:2px 6px;font-size:13px;box-sizing:border-box}',
	'.st-row input.cbi-input-text{width:100%;min-width:70px}','.st-host input.cbi-input-text{min-width:100px}',
	'.st-name input.cbi-input-text{min-width:110px;font-weight:600}',
	'.st-row select{min-width:90px}',
	'.st-ipwrap{display:flex;gap:4px;align-items:center}.st-ipwrap input{min-width:92px}',
	'.st-link{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:6px;cursor:pointer;color:#3b82f6;border:1px solid rgba(59,130,246,.4);font-size:13px;flex:none}',
	'.st-tag-ip{background:rgba(16,185,129,.18)}',
	'.st-tag-blk{background:rgba(239,68,68,.2);color:#dc2626}',
	'.st-row.st-blocked .st-devicon{background:rgba(239,68,68,.15);color:#dc2626}',
	'.st-actions{display:flex;gap:4px;flex-wrap:nowrap;justify-content:flex-end;align-items:center}',
	'.st-ib{width:32px;min-width:32px;height:28px;padding:0 !important;justify-content:center;margin:0 !important;box-sizing:border-box}',
	'.st-ib-ph{display:inline-block;visibility:hidden}',
	'.st-hint{display:none;font-size:11px;margin-top:2px}',
	'.st-hint.st-err{display:block}',
	'.st-err{color:#c33}',
	'.st-toolbar{display:flex;gap:8px;align-items:center;margin:8px 0}',
	'.dv-tb{display:flex;gap:10px;flex-wrap:wrap;margin:0 0 12px}.dv-tb input.cbi-input-text{flex:1 1 220px;min-width:160px}.dv-tb select{flex:0 0 auto}',
	'.dv-list{border:1px solid rgba(128,128,128,.3);border-radius:12px;overflow:hidden}',
	'.dv-item+.dv-item{border-top:1px solid rgba(128,128,128,.25)}',
	'.dv-h{display:flex;align-items:center;gap:10px;padding:9px 14px;cursor:pointer}.dv-h:hover{background:rgba(59,130,246,.05)}',
	'.dv-dot{width:9px;height:9px;border-radius:50%;background:#9ca3af;flex:none}.dv-dot.on{background:#22c55e;box-shadow:0 0 0 3px rgba(34,197,94,.25)}',
	'.dv-t{min-width:0;flex:1 1 auto}.dv-t b{font-size:14px}.dv-conn{font-size:12.5px;opacity:.75;white-space:nowrap;margin-right:8px}',
	'.dv-q{display:flex;gap:4px;flex:none}',
	'.dv-band{display:inline-flex;align-items:center;gap:6px;flex:0 0 96px;justify-content:center;padding:3px 0;border-radius:999px;font-size:12px;font-weight:700;background:rgba(128,128,128,.14);color:#6b7280;white-space:nowrap}',
	'.dv-band.b5{background:rgba(99,102,241,.16);color:#4f46e5}.dv-band.b24{background:rgba(245,158,11,.2);color:#b45309}.dv-band.lan{background:rgba(14,165,233,.18);color:#0369a1}.dv-band.b6{background:rgba(236,72,153,.16);color:#be185d}',
	'.dv-sig{display:flex;align-items:center;gap:7px;flex:0 0 104px;font-size:12px;white-space:nowrap}.dv-bars{display:inline-flex;align-items:flex-end;gap:2px;height:16px}.dv-bars i{width:4px;border-radius:1px;background:rgba(128,128,128,.3)}',
	'.dv-info{display:flex;gap:18px;flex:0 1 auto;margin:0 14px 0 auto}.dv-c{min-width:0;line-height:1.3}.dv-c small{display:block;font-size:11px;opacity:.6}.dv-c b{display:block;font-size:12.5px;font-weight:600;font-family:monospace;white-space:nowrap}.dv-c b.mu{opacity:.55;font-family:inherit;font-weight:400}.dv-c.h{width:150px}.dv-c.f{width:110px}.dv-c.l{width:116px}',
	'.dv-spd{flex:0 0 112px;font-size:12px;font-family:monospace;line-height:1.35;text-align:right;white-space:nowrap}.dv-spd>span{display:block}.dv-spd .mu{opacity:.55;font-family:inherit}',
	'.dv-e{display:none;padding:14px;border-top:1px solid rgba(128,128,128,.25);background:rgba(128,128,128,.05)}.dv-item.open .dv-e{display:block}',
	'.dv-g{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.dv-g label{display:block;font-size:12px;opacity:.7;font-weight:600;margin-bottom:4px}.dv-g input.cbi-input-text{width:100%;box-sizing:border-box}',
	'.dv-a{display:flex;gap:6px;justify-content:flex-end;margin-top:12px}',
	'@media (max-width:1250px){.dv-c.h{display:none}}@media (max-width:1100px){.dv-c.l{display:none}}@media (max-width:900px){.dv-info{display:none}}@media (max-width:1000px){.dv-spd{display:none}}@media (max-width:760px){.dv-g{grid-template-columns:repeat(2,minmax(0,1fr))}.dv-sig{display:none}.dv-band{flex-basis:70px}}',
	'.dv-tl{margin-top:18px;border:1px solid rgba(128,128,128,.3);border-radius:12px;padding:14px 16px}.dv-tlh{display:flex;align-items:center;gap:10px;margin-bottom:10px}.dv-tlh b{font-size:15px}',
	'.dv-tr{display:flex;align-items:center;gap:12px;margin:5px 0}.dv-tn{flex:0 0 150px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:13px}',
	'.dv-trk{position:relative;flex:1;height:14px;border-radius:7px;background:rgba(128,128,128,.12);overflow:hidden}.dv-sp{position:absolute;top:0;bottom:0;background:#3b82f6}.dv-sp.off{background:rgba(128,128,128,.35)}',
	'.dv-sp{cursor:pointer}.dv-sp.sel{box-shadow:inset 0 0 0 2px rgba(0,0,0,.45)}.dv-pick{margin:0 0 10px;padding:7px 10px;border-radius:8px;background:rgba(128,128,128,.12);font-size:13px;display:flex;gap:6px;flex-wrap:wrap;align-items:center}.dv-pick .mu{opacity:.6;font-size:12px}.dv-pd{width:9px;height:9px;border-radius:50%;background:#3b82f6;display:inline-block}.dv-pd.off{background:#9ca3af}',
	'.dv-ax{display:flex;margin-left:162px;justify-content:space-between;font-size:11px;opacity:.65;margin-bottom:4px}',
	'.dv-note{font-size:12px;opacity:.7;margin-top:10px}',
	'.st-help{font-size:13px;opacity:.85;margin:4px 0}.st-help summary{cursor:pointer}'
].join('');

return baseclass.extend({
	load: function() {
		var self = this, tries = 0, run = function() {
			fs.exec_direct('/usr/bin/odash', ['dsched-get'], 'json').then(function(d) { self.ds = d; }).catch(function() { self.ds = self.ds || null; });
			return fs.exec_direct('/usr/bin/odash', ['known'], 'json').catch(function(e) {
				if (++tries < 4) return new Promise(function(r) { window.setTimeout(r, 1200); }).then(run);
				return { error: e.message || String(e) };
			});
		};
		return run();
	},

	/* who is connected now and the last 24 hours of observations (refreshed every few seconds while the tab is open) */
	refreshLive: function() {
		var self = this;
		return Promise.all([
			fs.exec_direct('/usr/bin/odash', ['online'], 'json').catch(function() { return null; }),
			fs.exec_direct('/usr/bin/odash', ['connections', String(self.hours || 24)], 'json').catch(function() { return null; }),
			fs.exec_direct('/usr/bin/odash', ['rates'], 'json').catch(function() { return null; })
		]).then(function(r) {
			var rt = r[2], pts = (rt && rt.pts) || [], lp = pts[pts.length - 1];
			self.rate = lp && rt.now - lp.t <= 15 ? (lp.cl || {}) : {};
			var live = r[0];
			self.on = live && Array.isArray(live.on) ? live.on.reduce(function(m, x) { m[String(x).toLowerCase()] = true; return m; }, {}) : null;
			self.wifi = (live && live.wifi) || {};
			self.hist = r[1];
			self.paintLive();
		});
	},
	paintLive: function() {
		var self = this;
		(this.rows || []).forEach(function(r) {
			var d = r.d, m = d.mac.toLowerCase(), on = !!(self.on && self.on[m]), w = self.wifi && self.wifi[m];
			r.on = on;
			r.dot.className = 'dv-dot' + (on ? ' on' : '');
			var kind = !self.on ? '' : !on ? 'off' : w ? 'wifi' : 'lan';
			r.kind = kind;
			var cls = 'dv-band', txt = '', ic = null;
			if (kind === 'wifi') { cls += w.b === '5' ? ' b5' : w.b === '6' ? ' b6' : ' b24'; txt = w.b + ' GHz'; ic = 'wifi'; }
			else if (kind === 'lan') { cls += ' lan'; txt = 'Cable'; ic = 'lan'; }
			else if (kind === 'off') txt = 'Offline';
			r.band.className = cls;
			dom.content(r.band, ic ? [icon(ic, 14), txt] : txt);
			r.band.title = kind === 'wifi' ? 'Wi-Fi ' + w.b + ' GHz' : kind === 'lan' ? 'Connected by cable' : kind === 'off' ? 'Not connected now' : '';
			/* signal strength: four bars and the dBm value (Wi-Fi only) */
			var sg = w && w.s != null ? +w.s : null, n = sg == null ? 0 : sg >= -55 ? 4 : sg >= -65 ? 3 : sg >= -72 ? 2 : 1;
			var col = n >= 3 ? '#22c55e' : n === 2 ? '#f59e0b' : '#ef4444';
			if (kind === 'wifi') {
				dom.content(r.sig, [E('span', { 'class': 'dv-bars' }, [1, 2, 3, 4].map(function(k) { return E('i', { 'style': 'height:' + (4 + k * 3) + 'px' + (k <= n ? ';background:' + col : '') }); })),
					E('span', {}, sg == null ? '-' : sg + ' dBm')]);
				r.sig.title = 'Signal ' + (sg == null ? 'unknown' : sg + ' dBm') + (w.snr != null ? ', SNR ' + w.snr + ' dB' : '') + '\nRouter to device ' + Math.round(w.tx || 0) + ' Mbit/s\nDevice to router ' + Math.round(w.rx || 0) + ' Mbit/s';
			} else { dom.content(r.sig, kind === 'lan' ? E('span', { 'style': 'opacity:.55' }, 'wired') : ''); r.sig.title = ''; }
			/* live speed */
			var v = d.ip && self.rate ? self.rate[d.ip] : null;
			dom.content(r.spd, !on ? '' : v ? [E('span', {}, [E('span', { 'class': 'mu' }, '\u2193 '), fmtRate(v[1])]), E('span', {}, [E('span', { 'class': 'mu' }, '\u2191 '), fmtRate(v[0])])] : E('span', { 'class': 'mu' }, 'idle'));
		});
		this.filterRows();
		this.drawTimeline();
	},

	sortKey: 'ip', sortDir: 1,
	sortTh: function(label, key, key2) {
		var self = this, ar = E('small', {}, ''), th = E('th', { 'class': 'th', 'style': 'cursor:pointer;user-select:none;white-space:nowrap', 'title': key2 ? 'Click again for the IP address order' : 'Sort by ' + label.toLowerCase(), 'click': function() {
			var k = self.sortKey;
			if (key2 && (k === key || k === key2)) { if (k === key) { self.sortKey = key2; self.sortDir = 1; } else { self.sortKey = key; self.sortDir = 1; } }
			else if (k === key) self.sortDir = -self.sortDir; else { self.sortKey = key; self.sortDir = 1; }
			self.fill(self.list);
		} }, [label, ' ', ar]);
		this.ths = this.ths || []; this.ths.push({ ar: ar, key: key, key2: key2 });
		return th;
	},
	ipNum: function(ip) { var a = (ip || '').split('.').map(Number); return ((a[0] || 0) * 16777216) + ((a[1] || 0) * 65536) + ((a[2] || 0) * 256) + (a[3] || 0); },

	render: function(list) {
		var self = this;
		this.q = ''; this.cf = 'all'; this.hours = 24;
		this.listEl = E('div', { 'class': 'dv-list' });
		this.tlEl = E('div', {});
		var search = E('input', { 'type': 'text', 'class': 'cbi-input-text', 'placeholder': 'Search devices', 'input': function(ev) { self.q = ev.target.value.toLowerCase(); self.filterRows(); self.drawTimeline(); } });
		var conn = E('select', { 'class': 'cbi-input-select', 'change': function(ev) { self.cf = ev.target.value; self.filterRows(); self.drawTimeline(); } },
			[['all', 'All connections'], ['online', 'Online'], ['offline', 'Offline'], ['wifi', 'Wi-Fi'], ['lan', 'LAN cable']].map(function(o) { return E('option', { 'value': o[0] }, o[1]); }));
		var sort = E('select', { 'class': 'cbi-input-select', 'change': function(ev) {
			var v = ev.target.value.split(':'); self.sortKey = v[0]; self.sortDir = +v[1]; self.fill(self.list);
		} }, [['ip:1', 'IP address ascending'], ['ip:-1', 'IP address descending'], ['name:1', 'Name A to Z'], ['online:1', 'Online first'], ['limit:-1', 'Speed limit']].map(function(o) { return E('option', { 'value': o[0] }, o[1]); }));
		var hrs = E('select', { 'class': 'cbi-input-select', 'change': function(ev) { self.hours = +ev.target.value; self.refreshLive(); } },
			[[3, 'Last 3 hours'], [6, 'Last 6 hours'], [12, 'Last 12 hours'], [24, 'Last 24 hours']].map(function(o) { return E('option', { 'value': o[0], 'selected': o[0] === 24 ? '' : null }, o[1]); }));
		this.countEl = E('span', { 'class': 'st-meta', 'style': 'align-self:center;font-family:inherit' }, '');
		var root = E('div', { 'class': 'cbi-map' }, [
			E('style', {}, CSS),
			E('div', { 'class': 'dv-tb' }, [search, conn, sort, this.countEl,
				E('button', { 'class': 'cbi-button cbi-button-neutral st-btn', 'title': 'Refresh', 'click': function() { self.reload(); self.refreshLive(); } }, [icon('refresh', 16), 'Refresh'])]),
			this.listEl,
			E('div', { 'class': 'dv-tl' }, [E('div', { 'class': 'dv-tlh' }, [icon('clock', 18), E('b', {}, 'Connection timeline'), E('span', { 'style': 'flex:1' }), hrs]), this.tlEl,
				E('div', { 'class': 'dv-note' }, 'Blue: connected \u00b7 Grey: offline \u00b7 Blank: not observed. Sampled every minute (10-minute steps beyond 24 hours) and kept for 7 days on the router. History starts after the update and survives a reboot.')])
		]);
		this.fill(list);
		this.refreshLive();
		/* the live state refreshes while the page shows this tab */
		if (this.timer) window.clearInterval(this.timer);
		this.timer = window.setInterval(function() {
			if (document.hidden || !self.listEl.offsetParent) return;
			self.refreshLive();
		}, 10000);
		return root;
	},

	filterRows: function() {
		var self = this, n = 0, tot = (this.rows || []).length;
		(this.rows || []).forEach(function(r) {
			var d = r.d, hay = [d.name, d.hostname, d.ip, d.mac, d.fixed_ip].join(' ').toLowerCase();
			var ok = !self.q || hay.indexOf(self.q) >= 0;
			if (ok && self.cf !== 'all' && self.on) ok = self.cf === 'online' ? r.on : self.cf === 'offline' ? !r.on : self.cf === 'wifi' ? r.kind === 'wifi' : r.kind === 'lan';
			r.node.style.display = ok ? '' : 'none'; r.vis = ok;
			if (ok) n++;
		});
		if (this.countEl) this.countEl.textContent = tot ? n + ' of ' + tot + ' devices' : '';
	},

	drawTimeline: function() {
		if (!this.tlEl) return;
		var self = this, h = this.hist;
		if (!h) { dom.content(this.tlEl, E('div', { 'class': 'st-help' }, 'Could not load the connection history.')); return; }
		var samples = h.samples || [], now = h.now, from = now - this.hours * 3600, step = h.step || 60;
		if (!samples.length) { dom.content(this.tlEl, E('div', { 'class': 'st-help' }, 'Collecting connection history. The first observation appears within a minute.')); return; }
		var lng = this.hours > 24, pick = this.tlPick, pickInfo = null;
		var fmt = function(t) { return new Date(t * 1000).toLocaleString([], lng ? { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' } : { hour: '2-digit', minute: '2-digit' }); };
		var dur = function(sec) {
			var m = Math.max(1, Math.round(sec / 60)), d = Math.floor(m / 1440), hh = Math.floor(m % 1440 / 60), mm = m % 60;
			return (d ? d + 'd ' : '') + (hh ? hh + 'h ' : '') + (mm || (!d && !hh) ? mm + 'm' : '');
		};
		var info = E('div', { 'class': 'dv-pick' });
		var showPick = function(title, p) {
			dom.content(info, [E('i', { 'class': 'dv-pd' + (p.on ? '' : ' off') }), E('b', {}, title), ' \u00b7 ' + (p.on ? 'Connected' : 'Offline') + ' \u00b7 ' + fmt(p.s) + ' \u2192 ' + (p.end >= now - 1 ? 'now' : fmt(p.end)) + ' \u00b7 ',
				E('b', {}, dur(p.end - p.s)), E('span', { 'class': 'mu' }, p.s <= from + 1 ? ' (at least, the range starts here)' : '')]);
			info.style.display = '';
		};
		info.style.display = 'none';
		var ticks = [];
		for (var i = 0; i <= 6; i++) ticks.push(E('span', {}, fmt(from + (now - from) * i / 6)));
		var rows = (this.rows || []).filter(function(r) { return r.vis !== false; }).map(function(r) {
			var mac = r.d.mac.toLowerCase(), spans = [];
			samples.forEach(function(sm, k) {
				var st = Math.max(from, sm[0]), nx = k + 1 < samples.length ? samples[k + 1][0] : now, en = Math.min(now, (nx - sm[0] <= step * 2.5) ? nx : sm[0] + step);
				if (en <= st) return;
				var on = sm[1].indexOf(mac) >= 0, pv = spans[spans.length - 1];
				if (pv && pv.on === on && pv.end === st) pv.end = en; else spans.push({ s: st, end: en, on: on });
			});
			var trk = E('div', { 'class': 'dv-trk' }, spans.map(function(p) {
				var key = mac + '|' + (p.on ? 1 : 0) + '|' + p.s;
				var t = (p.on ? 'Connected' : 'Offline') + ': ' + fmt(p.s) + ' - ' + fmt(p.end) + ' (' + dur(p.end - p.s) + ')';
				var el = E('span', { 'class': 'dv-sp' + (p.on ? '' : ' off') + (pick === key ? ' sel' : ''), 'title': t, 'style': 'left:' + (100 * (p.s - from) / (now - from)) + '%;width:' + (100 * (p.end - p.s) / (now - from)) + '%',
					'click': function() {
						var prev = self.tlEl.querySelector('.dv-sp.sel'); if (prev) prev.classList.remove('sel');
						if (self.tlPick === key) { self.tlPick = null; info.style.display = 'none'; return; }
						self.tlPick = key; el.classList.add('sel'); showPick(r.title, p);
					} });
				if (pick === key) pickInfo = [r.title, p];
				return el;
			}));
			return E('div', { 'class': 'dv-tr' }, [E('div', { 'class': 'dv-tn', 'title': r.title }, r.title), trk]);
		});
		if (pickInfo) showPick(pickInfo[0], pickInfo[1]); else this.tlPick = null;
		dom.content(this.tlEl, [info, E('div', { 'class': 'dv-ax' }, ticks)].concat(rows.length ? rows : E('div', { 'class': 'st-help' }, 'No device matches the filter.')));
	},

	/* time rules of one device */
	schedDialog: function(d, who) {
		var self = this, ds = this.ds || { rules: [] }, mac = d.mac.toLowerCase();
		var DAYS = [['Sat', 6], ['Sun', 0], ['Mon', 1], ['Tue', 2], ['Wed', 3], ['Thu', 4], ['Fri', 5]];
		var list = E('div', { 'style': 'display:grid;gap:10px;margin:10px 0' }), rows = [];
		var addRow = function(r) {
			r = r || { mode: 'block', days: '*', from: '22:00', to: '07:00', on: true };
			var on = r.days === '*' ? [0, 1, 2, 3, 4, 5, 6] : r.days.split(',').map(Number);
			var mode = E('select', { 'class': 'cbi-input-select' }, [E('option', { 'value': 'block' }, 'Block during'), E('option', { 'value': 'allow' }, 'Allow only during')]);
			mode.value = r.mode;
			var from = E('input', { 'type': 'time', 'class': 'cbi-input-text', 'value': r.from, 'style': 'width:110px' }), to = E('input', { 'type': 'time', 'class': 'cbi-input-text', 'value': r.to, 'style': 'width:110px' });
			var en = E('input', { 'type': 'checkbox' }); en.checked = r.on !== false;
			var chips = DAYS.map(function(x) {
				var b = E('button', { 'type': 'button', 'class': 'cbi-button st-btn', 'style': 'padding:2px 8px;min-width:42px', 'click': function(ev) { ev.preventDefault(); b._on = !b._on; b.className = 'cbi-button st-btn' + (b._on ? ' cbi-button-action' : ''); } }, x[0]);
				b._d = x[1]; b._on = on.indexOf(x[1]) >= 0; b.className = 'cbi-button st-btn' + (b._on ? ' cbi-button-action' : '');
				return b;
			});
			var row = E('div', { 'style': 'border:1px solid rgba(128,128,128,.3);border-radius:8px;padding:10px;display:grid;gap:8px' }, [
				E('div', { 'style': 'display:flex;gap:8px;align-items:center;flex-wrap:wrap' }, [mode, from, E('span', {}, 'to'), to, E('label', { 'style': 'margin-left:auto;display:flex;gap:4px;align-items:center' }, [en, 'On']),
					E('button', { 'type': 'button', 'class': 'cbi-button cbi-button-negative st-btn', 'click': function(ev) { ev.preventDefault(); rows.splice(rows.indexOf(o), 1); row.remove(); } }, 'Remove')]),
				E('div', { 'style': 'display:flex;gap:4px;flex-wrap:wrap' }, chips)]);
			var o = { get: function() {
				var ds2 = chips.filter(function(b) { return b._on; }).map(function(b) { return b._d; }).sort();
				if (!ds2.length) return null;
				return [mode.value, ds2.length === 7 ? '*' : ds2.join(','), from.value, to.value, en.checked ? '1' : '0'].join('|');
			} };
			rows.push(o); list.appendChild(row);
		};
		(ds.rules || []).filter(function(r) { return r.mac === mac; }).forEach(addRow);
		var save = function() {
			var rules = rows.map(function(o) { return o.get(); }).filter(Boolean);
			if (rows.length !== rules.length) { ui.addNotification(null, E('p', {}, 'Every rule needs at least one day.'), 'danger'); return; }
			if (rules.some(function(r) { var a = r.split('|'); return !a[2] || !a[3]; })) { ui.addNotification(null, E('p', {}, 'Every rule needs a start and an end time.'), 'danger'); return; }
			ui.hideModal();
			self.run(['dsched-set', d.mac].concat(rules), rules.length ? 'The schedule of ' + who + ' was saved.' : 'The schedule of ' + who + ' was removed.');
		};
		ui.showModal('Time schedule: ' + who, [
			E('p', { 'style': 'font-size:13px;opacity:.85;margin:0' }, 'Block cuts the device off during the window. Allow only keeps it connected during the window and cuts it off the rest of the time. A window that ends before it starts, like 22:00 to 07:00, runs past midnight. Times follow the router clock' + (ds.time ? ' (now ' + ds.time + ')' : '') + '.'),
			list,
			E('div', {}, E('button', { 'class': 'cbi-button', 'click': function() { if (rows.length < 8) addRow(); } }, 'Add a rule')),
			E('div', { 'class': 'right', 'style': 'margin-top:12px' }, [E('button', { 'class': 'btn', 'click': ui.hideModal }, 'Cancel'), ' ', E('button', { 'class': 'btn cbi-button-action', 'click': save }, 'Save')])]);
		if (!rows.length) addRow();
	},

	run: function(args, okMsg) {
		var self = this;
		return fs.exec('/usr/bin/odash', args).then(function(r) {
			if (r.code !== 0) throw new Error((r.stderr || r.stdout || 'failed').trim());
			ui.addNotification(null, E('p', {}, okMsg), 'info');
			return self.reload();
		}).catch(function(e) {
			ui.addNotification(null, E('p', {}, 'Failed: ' + e.message), 'danger');
		});
	},

	confirm: function(title, body, label, cls, fn) {
		ui.showModal(title, [
			E('p', {}, body),
			E('div', { 'class': 'right' }, [
				E('button', { 'class': 'btn', 'click': ui.hideModal }, 'Cancel'), ' ',
				E('button', { 'class': 'btn ' + cls, 'click': function() { ui.hideModal(); fn(); } }, label)
			])
		]);
	},

	reload: function() {
		var self = this;
		return this.load().then(function(l) { self.fill(l); });
	},

	fill: function(list) {
		var self = this;
		if (!Array.isArray(list)) {
			dom.content(this.tbody, E('tr', { 'class': 'tr' }, E('td', { 'class': 'td st-err', 'colspan': 6 },
				'Could not read devices: ' + ((list && list.error) || 'unknown error'))));
			return;
		}
		this.list = list;
		var K = this.sortKey, D = this.sortDir, ipn = this.ipNum;
		function val(d) {
			switch (K) {
			case 'name': return (d.name || d.hostname || d.ip || d.mac || '').toLowerCase();
			case 'host': return (d.hostname || '').toLowerCase();
			case 'fixed': return d.fixed_ip ? ipn(d.fixed_ip) : null;
			case 'limit': return (d.down_kbps || 0) + (d.up_kbps || 0) || null;
			case 'online': return (self.on && self.on[(d.mac || '').toLowerCase()] ? 0 : 1) * 1e10 + (d.ip ? ipn(d.ip) : 9e9);
			default: return d.ip ? ipn(d.ip) : null;
			}
		}
		list.sort(function(a, b) {
			var x = val(a), y = val(b);
			if ((x === null || x === '') !== (y === null || y === '')) return x === null || x === '' ? 1 : -1;   /* empty values always last */
			if (x === y) return 0;
			return (x < y ? -1 : 1) * D;
		});
		if (!list.length) {
			this.rows = [];
			dom.content(this.listEl, E('div', { 'style': 'padding:14px' }, 'No devices found yet.'));
			this.filterRows();
			return;
		}
		/* keep the editors that are open while the list is rebuilt */
		var open = {};
		(this.rows || []).forEach(function(r) { if (r.node.classList.contains('open')) open[r.d.mac] = true; });
		this.rows = list.map(function(d) { var r = self.row(d); if (open[d.mac]) r.node.classList.add('open'); return r; });
		dom.content(this.listEl, this.rows.map(function(r) { return r.node; }));
		this.paintLive();
	},

	row: function(d) {
		var self = this;
		var iconBox = E('button', { 'type': 'button', 'class': 'st-devicon st-pick', 'title': 'Click to choose the device type' }, icon(d.type, 22));
		var hostTouched = !!d.static && d.hostname !== toHostname(d.name);

		var host = E('input', { 'type': 'text', 'class': 'cbi-input-text', 'value': d.static ? d.hostname : toHostname(d.name),
			'placeholder': 'Hostname', 'title': 'Letters, digits and - only',
			'input': function() { hostTouched = true; check(); } });
		var hint = E('div', { 'class': 'st-hint' }, '');

		var name = E('input', { 'type': 'text', 'class': 'cbi-input-text', 'value': d.name || '', 'placeholder': d.hostname || 'Device name',
			'input': function() { if (!hostTouched) host.value = toHostname(name.value); check(); } });

		var fixed = E('input', { 'type': 'text', 'class': 'cbi-input-text', 'value': d.fixed_ip || '',
			'placeholder': 'Auto', 'title': 'Empty = automatic address from DHCP', 'input': function() { check(); } });
		var ipHint = E('div', { 'class': 'st-hint' }, '');
		var useCur = (d.ip && !d.fixed_ip) ? E('span', { 'class': 'st-link', 'title': 'Reserve the address it has now (' + d.ip + ')',
			'click': function() { fixed.value = d.ip; check(); } }, '\u2193') : '';

		var limDn = E('input', { 'type': 'text', 'class': 'cbi-input-text', 'inputmode': 'decimal', 'value': fromKbps(d.down_kbps),
			'placeholder': '\u221e', 'input': function() { check(); } });
		var limUp = E('input', { 'type': 'text', 'class': 'cbi-input-text', 'inputmode': 'decimal', 'value': fromKbps(d.up_kbps),
			'placeholder': '\u221e', 'input': function() { check(); } });
		var limHint = E('div', { 'class': 'st-hint' }, '');

		var type = E('select', { 'class': 'cbi-input-select', 'change': function() {
			dom.content(iconBox, icon(type.value, 22));
		} }, TYPES.map(function(t) {
			return E('option', { 'value': t[0], 'selected': t[0] === d.type ? '' : null }, t[1]);
		}));
		type.value = d.type || 'other';
		var menu = null;
		function closeMenu() { if (menu) { menu.parentNode && menu.parentNode.removeChild(menu); menu = null; document.removeEventListener('click', outside, true); } }
		function outside(ev) { if (menu && !menu.contains(ev.target) && ev.target !== iconBox && !iconBox.contains(ev.target)) closeMenu(); }
		iconBox.addEventListener('click', function(ev) {
			ev.preventDefault();
			if (menu) return closeMenu();
			menu = E('div', { 'class': 'st-menu' }, TYPES.map(function(t) {
				return E('button', { 'type': 'button', 'class': 'st-mi' + (type.value === t[0] ? ' on' : ''), 'title': t[1], 'click': function(e) {
					e.preventDefault(); type.value = t[0]; dom.content(iconBox, icon(t[0], 22)); closeMenu();
					type.dispatchEvent(new Event('change'));
				} }, [icon(t[0], 20), E('span', {}, t[1])]);
			}));
			iconBox.parentNode.appendChild(menu);
			document.addEventListener('click', outside, true);
		});

		var save = E('button', { 'class': 'cbi-button cbi-button-save st-btn st-ib', 'title': 'Save changes', 'click': function() {
			if (!check()) return;
			save.disabled = true;
			fs.exec('/usr/bin/odash', ['setdev', d.mac, name.value.trim(), type.value, host.value.trim(), fixed.value.trim()]).then(function(r) {
				if (r.code !== 0) throw new Error((r.stderr || r.stdout || 'failed').trim());
				return fs.exec('/usr/bin/odash', ['limit', d.mac, String(toKbps(limDn.value)), String(toKbps(limUp.value))]);
			}).then(function(r) {
				save.disabled = false;
				if (r.code !== 0) throw new Error((r.stderr || r.stdout || 'failed').trim());
				ui.addNotification(null, E('p', {}, 'Saved ' + (name.value.trim() || d.mac) +
					(host.value.trim() ? ', hostname ' + host.value.trim() : '') +
					(fixed.value.trim() ? ', fixed IP ' + fixed.value.trim() : ', automatic IP') +
					(toKbps(limDn.value) || toKbps(limUp.value) ? ', speed limit set' : ', no speed limit') + '.'), 'info');
				return self.reload();
			}).catch(function(e) {
				save.disabled = false;
				ui.addNotification(null, E('p', {}, 'Could not save: ' + e.message), 'danger');
			});
		} }, [icon('save', 16)]);

		var who = d.name || d.hostname || d.mac.toUpperCase();
		var block = d.blocked
			? E('button', { 'class': 'cbi-button cbi-button-positive st-btn st-ib', 'title': 'Unblock - allow this device on the network again',
				'click': function() { self.run(['unblock', d.mac], who + ' is unblocked.'); } }, [icon('unlock', 16)])
			: E('button', { 'class': 'cbi-button cbi-button-negative st-btn st-ib', 'title': 'Block - cut this device off the network',
				'click': function() {
					self.confirm('Block ' + who + '?',
						'The router will drop every packet from this device (' + d.mac.toUpperCase() + '): no internet, no DNS, no DHCP and no access to the router. ' +
						'Existing connections stop immediately. If this is the device you are using right now, you will lose access to this page from it.',
						'Block', 'cbi-button-negative', function() { self.run(['block', d.mac], who + ' is blocked.'); });
				} }, [icon('ban', 16)]);
		var mine = ((this.ds || {}).rules || []).filter(function(r) { return r.mac === d.mac.toLowerCase(); });
		var sched = E('button', { 'class': 'cbi-button cbi-button-neutral st-btn st-ib', 'title': 'Time schedule - block or allow this device at set times', 'click': function() { self.schedDialog(d, who); } }, [icon('clock', 16)]);
		var del = E('button', { 'class': 'cbi-button cbi-button-neutral st-btn st-ib', 'title': 'Delete this device',
			'click': function() {
				self.confirm('Delete ' + who + '?',
					'This removes its custom name and type, its static lease and fixed IP in OpenWrt, any block, and all of its traffic history. ' +
					'A device that is still connected will show up again as a new, unnamed device.',
					'Delete', 'cbi-button-negative', function() { self.run(['remove', d.mac], who + ' was deleted.'); });
			} }, [icon('trash', 16)]);

		var reset = d.custom ? E('button', { 'class': 'cbi-button cbi-button-neutral st-btn st-ib', 'title': 'Forget custom name and type',
			'click': function() {
				fs.exec('/usr/bin/odash', ['deldev', d.mac]).then(function() { return self.reload(); });
			} }, [icon('undo', 16)]) : E('span', { 'class': 'st-ib st-ib-ph' });

		function check() {
			var v = host.value.trim(), ok = !v || HOST_RE.test(v);
			hint.className = 'st-hint' + (ok ? '' : ' st-err');
			hint.textContent = ok ? '' : 'Use letters, digits and -';
			var f = fixed.value.trim(), ipok = !f || IP_RE.test(f);
			ipHint.className = 'st-hint' + (ipok ? '' : ' st-err');
			ipHint.textContent = !ipok ? 'Invalid IPv4 address' : '';
			var ld = toKbps(limDn.value), lu = toKbps(limUp.value), limok = !isNaN(ld) && !isNaN(lu);
			limHint.className = 'st-hint' + (limok ? '' : ' st-err');
			limHint.textContent = limok ? '' : 'Use a number like 2 or 0.5';
			save.disabled = !(ok && ipok && limok);
			return ok && ipok && limok;
		}

		/* shown name: the custom name, else the name the device announced on the network, else its address */
		var title = d.name || d.hostname || d.ip || d.mac.toUpperCase();

		var activeNow = ((this.ds || {}).active || []).indexOf(d.mac.toLowerCase()) >= 0;
		var tags = [
			activeNow ? E('span', { 'class': 'st-tag st-tag-blk', 'title': 'Cut off by its time schedule right now' }, 'blocked by schedule') : '',
			mine.some(function(r) { return r.on; }) ? E('span', { 'class': 'st-tag', 'title': 'This device has a time schedule' }, 'scheduled') : '',
			d.blocked ? E('span', { 'class': 'st-tag st-tag-blk', 'title': 'Blocked from the network' }, 'blocked') : '',
			(d.down_kbps || d.up_kbps) ? E('span', { 'class': 'st-tag st-tag-lim', 'title': 'Speed limit active' }, 'limited') : ''];
		name.setAttribute('placeholder', title);

		var dot = E('span', { 'class': 'dv-dot' }), band = E('span', { 'class': 'dv-band' }, ''),  sig = E('div', { 'class': 'dv-sig' }), spd = E('div', { 'class': 'dv-spd' });
		var lim = (d.down_kbps || d.up_kbps) ? '\u2193 ' + (fromKbps(d.down_kbps) || '\u221e') + '  \u2191 ' + (fromKbps(d.up_kbps) || '\u221e') + ' Mbit/s' : '';
		var cell = function(cls, l, v) { return E('div', { 'class': 'dv-c ' + cls }, [E('small', {}, l), v ? E('b', {}, v) : E('b', { 'class': 'mu' }, cls === 'f' ? 'Auto' : 'None')]); };
		var info = E('div', { 'class': 'dv-info' }, [cell('h', 'Hostname', d.hostname || ''), cell('f', 'Fixed IP', d.fixed_ip || ''), cell('l', 'Speed limit', lim)]);
		var open = function() { node.classList.toggle('open'); };
		var qb = function(ic, tl, fn, cls) { return E('button', { 'class': 'cbi-button st-btn st-ib ' + (cls || 'cbi-button-neutral'), 'title': tl, 'click': function(ev) { ev.stopPropagation(); fn(); } }, [icon(ic, 16)]); };
		var node = E('div', { 'class': 'dv-item st-row' + (d.blocked ? ' st-blocked' : '') }, [
			E('div', { 'class': 'dv-h', 'click': function(ev) { if (!ev.target.closest('.st-menu,.st-pick')) open(); } }, [
				E('div', { 'class': 'st-dev' }, iconBox), dot,
				E('div', { 'class': 'dv-t' }, [E('b', {}, title), ' ', E('span', {}, tags), E('div', { 'class': 'st-meta' }, (d.fixed_ip && d.fixed_ip === d.ip ? '' : (d.ip || 'offline') + ' \u00b7 ') + d.mac.toUpperCase())]),
				info, band, sig, spd,
				E('div', { 'class': 'dv-q' }, [qb('edit', 'Edit', open), qb('clock', 'Time schedule', function() { sched.click(); }), qb(d.blocked ? 'unlock' : 'ban', d.blocked ? 'Unblock' : 'Block', function() { block.click(); }, d.blocked ? 'cbi-button-positive' : 'cbi-button-neutral')])]),
			E('div', { 'class': 'dv-e' }, [
				E('div', { 'class': 'dv-g' }, [
					E('div', {}, [E('label', {}, 'Name'), name]),
					E('div', { 'class': 'st-host' }, [E('label', {}, 'Hostname'), host, hint]),
					E('div', {}, [E('label', {}, 'Fixed IP'), E('div', { 'class': 'st-ipwrap' }, [fixed, useCur]), ipHint]),
					E('div', {}, [E('label', {}, 'Limit (Mbit/s)'), E('div', { 'class': 'st-lim' }, [E('span', { 'class': 'st-arrow', 'title': 'Download' }, '\u2193'), limDn, E('span', { 'class': 'st-arrow', 'title': 'Upload' }, '\u2191'), limUp]), limHint])]),
				E('div', { 'class': 'dv-a' }, [save, sched, block, del, reset])])]);
		return { d: d, node: node, dot: dot, band: band, sig: sig, spd: spd, title: title };
	},


});
