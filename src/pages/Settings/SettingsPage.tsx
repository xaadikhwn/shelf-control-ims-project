import { useState } from 'react';
import {
  User,
  Building2,
  Bell,
  Palette,
  Save,
  Globe,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';

export default function SettingsPage() {
  const { user } = useAuth();
  const { addToast } = useUI();
  const [activeTab, setActiveTab] = useState('profile');
  const safeUser = user ?? { name: 'User', role: 'Staff', email: '', initials: 'US' };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'company', label: 'Company', icon: Building2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Application preferences & configuration"
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={<Save className="w-4 h-4" />}
            onClick={() => addToast('Settings saved successfully', 'success')}
          >
            Save Changes
          </Button>
        }
      />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tabs sidebar */}
        <div className="lg:w-56 flex-shrink-0">
          <div className="bg-navy-800 border border-navy-500/50 rounded-xl p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-accent-blue/10 text-accent-blue-light'
                    : 'text-text-secondary hover:bg-navy-700/50 hover:text-text-primary'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-navy-800 border border-navy-500/50 rounded-xl p-6">
            {activeTab === 'profile' && (
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-4">
                  Profile Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-accent-blue/20 rounded-full flex items-center justify-center text-2xl font-bold text-accent-blue">
                      {safeUser.initials}
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary">
                        {safeUser.name}
                      </p>
                      <p className="text-sm text-text-secondary">{safeUser.role}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        defaultValue={safeUser.name}
                        className="w-full bg-navy-700 border border-navy-500/50 rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                          type="email"
                          defaultValue={safeUser.email}
                          className="w-full bg-navy-700 border border-navy-500/50 rounded-lg pl-9 pr-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue/50"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                        Role
                      </label>
                      <input
                        type="text"
                        defaultValue={safeUser.role}
                        disabled
                        className="w-full bg-navy-700/50 border border-navy-500/30 rounded-lg px-3 py-2 text-sm text-text-muted cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                        Phone
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                          type="tel"
                          defaultValue="+44 7700 900000"
                          className="w-full bg-navy-700 border border-navy-500/50 rounded-lg pl-9 pr-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue/50"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'company' && (
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-4">
                  Company Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                      Company Name
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input
                        type="text"
                        defaultValue="BizManage Ltd"
                        className="w-full bg-navy-700 border border-navy-500/50 rounded-lg pl-9 pr-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue/50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                      Industry
                    </label>
                    <select className="w-full bg-navy-700 border border-navy-500/50 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue/50">
                      <option>Textiles & Manufacturing</option>
                      <option>Retail</option>
                      <option>Wholesale</option>
                      <option>Services</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                      Website
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input
                        type="url"
                        defaultValue="https://bizmanage.co.uk"
                        className="w-full bg-navy-700 border border-navy-500/50 rounded-lg pl-9 pr-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue/50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                      Address
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input
                        type="text"
                        defaultValue="London, United Kingdom"
                        className="w-full bg-navy-700 border border-navy-500/50 rounded-lg pl-9 pr-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue/50"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                      Default Currency
                    </label>
                    <select className="w-full bg-navy-700 border border-navy-500/50 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue/50">
                      <option>GBP (£) — British Pound</option>
                      <option>USD ($) — US Dollar</option>
                      <option>EUR (€) — Euro</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-4">
                  Notification Preferences
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'Low stock alerts', desc: 'Get notified when products fall below reorder point', enabled: true },
                    { label: 'Overdue payment reminders', desc: 'Alert when customer payments are past due', enabled: true },
                    { label: 'New order notifications', desc: 'Receive alerts for new sales orders', enabled: true },
                    { label: 'Payroll reminders', desc: 'Monthly payroll processing reminders', enabled: false },
                    { label: 'Expense approval requests', desc: 'Notifications for pending expense approvals', enabled: true },
                    { label: 'System updates', desc: 'Updates about BizManage system changes', enabled: false },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between p-3 bg-navy-700/30 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium text-text-primary">
                          {item.label}
                        </p>
                        <p className="text-xs text-text-muted">{item.desc}</p>
                      </div>
                      <button
                        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                          item.enabled ? 'bg-accent-blue' : 'bg-navy-500'
                        }`}
                        onClick={() =>
                          addToast(
                            `${item.label} ${item.enabled ? 'disabled' : 'enabled'}`,
                            'info'
                          )
                        }
                        aria-label={`Toggle ${item.label}`}
                      >
                        <span
                          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                            item.enabled ? 'translate-x-5' : ''
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-4">
                  Appearance
                </h3>
                <div className="space-y-6">
                  <div>
                    <p className="text-sm font-medium text-text-primary mb-3">
                      Theme
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Dark', active: true, colors: ['#0a0e1a', '#111827', '#3b82f6'] },
                        { label: 'Light', active: false, colors: ['#f8fafc', '#ffffff', '#3b82f6'] },
                        { label: 'System', active: false, colors: ['#0a0e1a', '#f8fafc', '#3b82f6'] },
                      ].map((theme) => (
                        <button
                          key={theme.label}
                          className={`p-3 rounded-lg border transition-all ${
                            theme.active
                              ? 'border-accent-blue bg-accent-blue/5'
                              : 'border-navy-500/50 hover:border-navy-400'
                          }`}
                          onClick={() =>
                            addToast(`${theme.label} theme selected`, 'info')
                          }
                        >
                          <div className="flex gap-1 mb-2">
                            {theme.colors.map((c, i) => (
                              <span
                                key={i}
                                className="w-6 h-6 rounded"
                                style={{ backgroundColor: c }}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-text-secondary text-left">
                            {theme.label}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary mb-3">
                      Sidebar Density
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {['Comfortable', 'Compact'].map((opt) => (
                        <button
                          key={opt}
                          className={`p-3 rounded-lg border text-sm text-text-secondary transition-all ${
                            opt === 'Comfortable'
                              ? 'border-accent-blue bg-accent-blue/5'
                              : 'border-navy-500/50 hover:border-navy-400'
                          }`}
                          onClick={() =>
                            addToast(`${opt} density applied`, 'info')
                          }
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
