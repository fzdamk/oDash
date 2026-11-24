'use strict';
'require baseclass';
'require dom';
'require ui';
'require form';

/* oDash settings: edits the "main" section of /etc/config/odash.
 * "Save & Apply" reloads the service (procd config trigger). */
return baseclass.extend({
	render: function() {
		var m, s, o;

		m = new form.Map('odash', _('oDash settings'),
			_('Settings for the traffic statistics, device blocking and speed limits. Changes take effect after "Save & Apply", which restarts the service.'));

		s = m.section(form.NamedSection, 'main', 'odash', _('General'));
		s.addremove = false;

		o = s.option(form.Flag, 'enabled', _('Enable oDash'),
			_('When disabled nothing is counted, and device blocks and speed limits are not enforced. Saved statistics and device settings are kept.'));
		o.default = o.enabled = '1';
		o.disabled = '0';
		o.rmempty = false;

		o = s.option(form.DynamicList, 'lan_iface', _('LAN interfaces'),
			_('Interfaces whose clients are measured (traffic entering and leaving them), for example br-lan.'));
		o.default = 'br-lan';
		o.rmempty = false;
		o.validate = function(sid, v) {
			return (v === null || v === '' || /^[A-Za-z0-9_.\-]+$/.test(v)) ? true : _('Enter a valid interface name');
		};

		o = s.option(form.Value, 'interval', _('Read interval (seconds)'),
			_('How often the counters are read. Lower values make the live view fresher but use a little more CPU.'));
		o.datatype = 'range(5,3600)';
		o.default = '30';
		o.placeholder = '30';

		o = s.option(form.ListValue, 'group', _('Group domains'),
			_('"Registrable" groups subdomains under one site (youtube.com); "Full" keeps every hostname separate.'));
		o.value('registrable', _('Registrable domain (youtube.com)'));
		o.value('full', _('Full hostname (rr1---sn-abc.googlevideo.com)'));
		o.default = 'registrable';

		o = s.option(form.Value, 'retention_days', _('History (days)'),
			_('How many days of statistics are kept ("All time" in the Usage page shows this period).'));
		o.datatype = 'range(1,3650)';
		o.default = '365';
		o.placeholder = '365';

		o = s.option(form.Value, 'idle_timeout', _('Idle timeout'),
			_('How long an idle connection stays in the kernel counter set, for example 30m, 2h. Must be longer than the read interval.'));
		o.default = '2h';
		o.placeholder = '2h';
		o.validate = function(sid, v) {
			return (v === null || v === '' || /^[0-9]+[smhd]$/.test(v)) ? true : _('Use a number followed by s, m, h or d (for example 2h)');
		};

		o = s.option(form.Flag, 'manage_dnsmasq', _('Manage dnsmasq query logging'),
			_('Turns on dnsmasq query logging automatically. It is needed to show domain names instead of IP addresses.'));
		o.default = o.enabled = '1';
		o.disabled = '0';
		o.rmempty = false;

		s = m.section(form.NamedSection, 'main', 'odash', _('Storage'));
		s.addremove = false;

		o = s.option(form.ListValue, 'persist_file', _('Keep statistics across reboots'),
			_('Working files always live in RAM. When this is on, the statistics are also copied to flash and restored after a reboot or power cut.'));
		o.value('/etc/odash/stats.tsv', _('Yes - save to flash'));
		o.value('off', _('No - lost on reboot'));
		o.default = '/etc/odash/stats.tsv';
		o.cfgvalue = function(sid) {
			var v = this.map.data.get('odash', sid, 'persist_file');
			return (v === undefined || v === null || v === '') ? '/etc/odash/stats.tsv' : v;
		};
		o.rmempty = false;

		o = s.option(form.Value, 'save_interval', _('Save every (seconds)'),
			_('How often the statistics are copied to flash, only when something changed. A sudden power cut loses at most this much.'));
		o.datatype = 'range(60,86400)';
		o.default = '300';
		o.placeholder = '300';
		o.depends('persist_file', '/etc/odash/stats.tsv');

		return m.render();
	},

	handleSave: function() {
		var tasks = [];
		document.querySelectorAll('#maincontent .cbi-map').forEach(function(map) { tasks.push(dom.callClassMethod(map, 'save')); });
		return Promise.all(tasks);
	},
	handleSaveApply: function(ev, mode) {
		return this.handleSave(ev).then(function() { ui.changes.apply(mode == '0'); });
	},
	handleReset: function() {
		var tasks = [];
		document.querySelectorAll('#maincontent .cbi-map').forEach(function(map) { tasks.push(dom.callClassMethod(map, 'reset')); });
		return Promise.all(tasks);
	}
});
