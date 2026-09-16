import { useState, useEffect } from 'react';
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
  Lock,
  Eye,
  EyeOff,
  GraduationCap,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { authApi } from '../../services/authApi';
import type { Theme } from '../../context/UIContext';

// ── Company settings stored in localStorage ──────────────
const COMPANY_KEY = 'biz-company-settings';

interface CompanySettings {
  name: string;
  industry: string;
  website: string;
  address: string;
  currency: string;
}

function loadCompanySettings(): CompanySettings {
  try {
    const raw = localStorage.getItem(COMPANY_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {
    name: 'BizManage Ltd',
    industry: 'Textiles & Manufacturing',
    website: 'https://bizmanage.co.uk',
    address: 'London, United Kingdom',
    currency: 'GBP (£) — British Pound',
  };
}

function saveCompanySettings(s: CompanySettings) {
  try {
    localStorage.setItem(COMPANY_KEY, JSON.stringify(s));
  } catch { /* ignore */ }
}

// ── Manager / Academic info stored in localStorage ───────
const MANAGER_KEY = 'biz-manager-info';

interface ManagerInfo {
  supervisorName: string;
  programme: string;
  studentId: string;
  university: string;
}

function loadManagerInfo(): ManagerInfo {
  try {
    const raw = localStorage.getItem(MANAGER_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {
    supervisorName: 'Miss Eleanor Leist',
    programme: 'MSc Computing Science',
    studentId: '100536271',
    university: 'University of Hertfordshire',
  };
}

function saveManagerInfo(info: ManagerInfo) {
  try {
    localStorage.setItem(MANAGER_KEY, JSON.stringify(info));
  } catch { /* ignore */ }
}

// ── Field component helpers ───────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  'w-full bg-navy-700 border border-navy-500/50 rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue transition-colors';

const disabledClass =
  'w-full bg-navy-700/50 border border-navy-500/30 rounded-lg px-3 py-2 text-sm text-text-muted cursor-not-allowed';

// ── Main Component ─────────────────────────────────────────
export default function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const { addToast, theme, setTheme } = useUI();
  const [activeTab, setActiveTab] = useState('profile');

  const safeUser = user ?? { name: 'User', role: 'Staff', email: '', initials: 'US', id: '' };

  // Profile fields
  const [profileName, setProfileName] = useState(safeUser.name);
  const [profileEmail, setProfileEmail] = useState(safeUser.email);
  const [profilePhone, setProfilePhone] = useState('+44 7700 900000');
  const [profileSaving, setProfileSaving] = useState(false);

  // Sync with user object when it changes (e.g. after login)
  useEffect(() => {
    setProfileName(user?.name ?? '');
    setProfileEmail(user?.email ?? '');
  }, [user]);

  // Password fields
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);

  // Manager / academic info
  const [managerInfo, setManagerInfo] = useState<ManagerInfo>(loadManagerInfo);
  const [managerSaving, setManagerSaving] = useState(false);

  // Company settings
  const [company, setCompany] = useState<CompanySettings>(loadCompanySettings);
  const [companySaving, setCompanySaving] = useState(false);

  // Notification toggles (local state — can be extended later)
  const [notifToggles, setNotifToggles] = useState<Record<string, boolean>>({
    'Low stock alerts': true,
    'Overdue payment reminders': true,
    'New order notifications': true,
    'Payroll reminders': false,
    'Expense approval requests': true,
    'System updates': false,
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'company', label: 'Company', icon: Building2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  // ── Save handlers ──────────────────────────────────────

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    try {
      await updateProfile({ full_name: profileName, email: profileEmail });
      addToast('Profile updated successfully', 'success');
    } catch (err: any) {
      addToast(err?.message || 'Failed to update profile', 'error');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPwd || !newPwd || !confirmPwd) {
      addToast('Please fill in all password fields', 'warning');
      return;
    }
    if (newPwd !== confirmPwd) {
      addToast('New password and confirm password do not match', 'error');
      return;
    }
    if (newPwd.length < 8) {
      addToast('New password must be at least 8 characters', 'warning');
      return;
    }
    setPwdSaving(true);
    try {
      await authApi.changePassword({ current_password: currentPwd, new_password: newPwd });
      addToast('Password changed successfully', 'success');
      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
    } catch (err: any) {
      addToast(err?.response?.data?.error?.message || err?.message || 'Failed to change password', 'error');
    } finally {
      setPwdSaving(false);
    }
  };

  const handleSaveManager = () => {
    setManagerSaving(true);
    saveManagerInfo(managerInfo);
    setTimeout(() => {
      addToast('Academic / manager info saved', 'success');
      setManagerSaving(false);
    }, 400);
  };

  const handleSaveCompany = () => {
    setCompanySaving(true);
    saveCompanySettings(company);
    setTimeout(() => {
      addToast('Company settings saved', 'success');
      setCompanySaving(false);
    }, 400);
  };

  // ── Password strength indicator ────────────────────────
  const pwdStrength = (pwd: string): { label: string; color: string; width: string } => {
    if (!pwd) return { label: '', color: 'bg-navy-500', width: '0%' };
    if (pwd.length < 6) return { label: 'Weak', color: 'bg-red-500', width: '25%' };
    if (pwd.length < 8) return { label: 'Fair', color: 'bg-yellow-500', width: '50%' };
    if (pwd.length < 12 || !/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd))
      return { label: 'Good', color: 'bg-blue-500', width: '75%' };
    return { label: 'Strong', color: 'bg-emerald-500', width: '100%' };
  };
  const strength = pwdStrength(newPwd);

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Application preferences & configuration"
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
        <div className="flex-1 space-y-6">

          {/* ── Profile Tab ─────────────────────────── */}
          {activeTab === 'profile' && (
            <>
              {/* Profile Information */}
              <div className="bg-navy-800 border border-navy-500/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">
                  Profile Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-accent-blue/20 rounded-full flex items-center justify-center text-2xl font-bold text-accent-blue">
                      {safeUser.initials}
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary">{safeUser.name}</p>
                      <p className="text-sm text-text-secondary">{safeUser.role}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Full Name">
                      <input
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className={inputClass}
                        placeholder="Your full name"
                      />
                    </Field>
                    <Field label="Email Address">
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                          type="email"
                          value={profileEmail}
                          onChange={(e) => setProfileEmail(e.target.value)}
                          className={`${inputClass} pl-9`}
                          placeholder="your@email.com"
                        />
                      </div>
                    </Field>
                    <Field label="Role">
                      <input
                        type="text"
                        value={safeUser.role}
                        disabled
                        className={disabledClass}
                      />
                    </Field>
                    <Field label="Phone">
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                          type="tel"
                          value={profilePhone}
                          onChange={(e) => setProfilePhone(e.target.value)}
                          className={`${inputClass} pl-9`}
                          placeholder="+44 7700 900000"
                        />
                      </div>
                    </Field>
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<Save className="w-4 h-4" />}
                      onClick={handleSaveProfile}
                      disabled={profileSaving}
                    >
                      {profileSaving ? 'Saving…' : 'Save Profile'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Change Password */}
              <div className="bg-navy-800 border border-navy-500/50 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="w-5 h-5 text-accent-blue" />
                  <h3 className="text-lg font-semibold text-text-primary">Change Password</h3>
                </div>
                <div className="space-y-4">
                  <Field label="Current Password">
                    <div className="relative">
                      <input
                        type={showCurrentPwd ? 'text' : 'password'}
                        value={currentPwd}
                        onChange={(e) => setCurrentPwd(e.target.value)}
                        className={`${inputClass} pr-10`}
                        placeholder="Enter current password"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPwd((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                        aria-label="Toggle current password visibility"
                      >
                        {showCurrentPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </Field>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="New Password">
                      <div className="relative">
                        <input
                          type={showNewPwd ? 'text' : 'password'}
                          value={newPwd}
                          onChange={(e) => setNewPwd(e.target.value)}
                          className={`${inputClass} pr-10`}
                          placeholder="Min. 8 characters"
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPwd((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                          aria-label="Toggle new password visibility"
                        >
                          {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {newPwd && (
                        <div className="mt-1.5 space-y-1">
                          <div className="h-1 w-full bg-navy-600 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                              style={{ width: strength.width }}
                            />
                          </div>
                          <p className="text-[11px] text-text-muted">{strength.label}</p>
                        </div>
                      )}
                    </Field>
                    <Field label="Confirm New Password">
                      <div className="relative">
                        <input
                          type={showConfirmPwd ? 'text' : 'password'}
                          value={confirmPwd}
                          onChange={(e) => setConfirmPwd(e.target.value)}
                          className={`${inputClass} pr-10 ${
                            confirmPwd && newPwd !== confirmPwd ? 'border-red-500/70' : ''
                          }`}
                          placeholder="Repeat new password"
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPwd((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                          aria-label="Toggle confirm password visibility"
                        >
                          {showConfirmPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {confirmPwd && (
                        <p className={`text-[11px] mt-1 flex items-center gap-1 ${newPwd === confirmPwd ? 'text-emerald-400' : 'text-red-400'}`}>
                          {newPwd === confirmPwd
                            ? <><CheckCircle className="w-3 h-3" /> Passwords match</>
                            : <><AlertCircle className="w-3 h-3" /> Passwords do not match</>}
                        </p>
                      )}
                    </Field>
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<Lock className="w-4 h-4" />}
                      onClick={handleChangePassword}
                      disabled={pwdSaving}
                    >
                      {pwdSaving ? 'Updating…' : 'Update Password'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Academic / Manager Info */}
              <div className="bg-navy-800 border border-navy-500/50 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <GraduationCap className="w-5 h-5 text-accent-blue" />
                  <h3 className="text-lg font-semibold text-text-primary">Academic / Manager Info</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Supervisor / Manager Name">
                    <input
                      type="text"
                      value={managerInfo.supervisorName}
                      onChange={(e) => setManagerInfo((p) => ({ ...p, supervisorName: e.target.value }))}
                      className={inputClass}
                      placeholder="e.g. Miss Eleanor Leist"
                    />
                  </Field>
                  <Field label="Programme / Department">
                    <input
                      type="text"
                      value={managerInfo.programme}
                      onChange={(e) => setManagerInfo((p) => ({ ...p, programme: e.target.value }))}
                      className={inputClass}
                      placeholder="e.g. MSc Computing Science"
                    />
                  </Field>
                  <Field label="Student / Employee ID">
                    <input
                      type="text"
                      value={managerInfo.studentId}
                      onChange={(e) => setManagerInfo((p) => ({ ...p, studentId: e.target.value }))}
                      className={inputClass}
                      placeholder="e.g. 100536271"
                    />
                  </Field>
                  <Field label="University / Organisation">
                    <input
                      type="text"
                      value={managerInfo.university}
                      onChange={(e) => setManagerInfo((p) => ({ ...p, university: e.target.value }))}
                      className={inputClass}
                      placeholder="e.g. University of Hertfordshire"
                    />
                  </Field>
                </div>
                <div className="flex justify-end pt-4">
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Save className="w-4 h-4" />}
                    onClick={handleSaveManager}
                    disabled={managerSaving}
                  >
                    {managerSaving ? 'Saving…' : 'Save Info'}
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* ── Company Tab ─────────────────────────── */}
          {activeTab === 'company' && (
            <div className="bg-navy-800 border border-navy-500/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                Company Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Company Name">
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="text"
                      value={company.name}
                      onChange={(e) => setCompany((p) => ({ ...p, name: e.target.value }))}
                      className={`${inputClass} pl-9`}
                      placeholder="Your company name"
                    />
                  </div>
                </Field>
                <Field label="Industry">
                  <select
                    value={company.industry}
                    onChange={(e) => setCompany((p) => ({ ...p, industry: e.target.value }))}
                    className={inputClass}
                  >
                    <option>Textiles &amp; Manufacturing</option>
                    <option>Retail</option>
                    <option>Wholesale</option>
                    <option>Services</option>
                    <option>Technology</option>
                    <option>Healthcare</option>
                    <option>Finance</option>
                  </select>
                </Field>
                <Field label="Website">
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="url"
                      value={company.website}
                      onChange={(e) => setCompany((p) => ({ ...p, website: e.target.value }))}
                      className={`${inputClass} pl-9`}
                      placeholder="https://example.com"
                    />
                  </div>
                </Field>
                <Field label="Address">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="text"
                      value={company.address}
                      onChange={(e) => setCompany((p) => ({ ...p, address: e.target.value }))}
                      className={`${inputClass} pl-9`}
                      placeholder="City, Country"
                    />
                  </div>
                </Field>
                <div className="md:col-span-2">
                  <Field label="Default Currency">
                    <select
                      value={company.currency}
                      onChange={(e) => setCompany((p) => ({ ...p, currency: e.target.value }))}
                      className={inputClass}
                    >
                      <option>GBP (£) — British Pound</option>
                      <option>USD ($) — US Dollar</option>
                      <option>EUR (€) — Euro</option>
                      <option>PKR (₨) — Pakistani Rupee</option>
                    </select>
                  </Field>
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Save className="w-4 h-4" />}
                  onClick={handleSaveCompany}
                  disabled={companySaving}
                >
                  {companySaving ? 'Saving…' : 'Save Company'}
                </Button>
              </div>
            </div>
          )}

          {/* ── Notifications Tab ───────────────────── */}
          {activeTab === 'notifications' && (
            <div className="bg-navy-800 border border-navy-500/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                Notification Preferences
              </h3>
              <div className="space-y-4">
                {Object.entries(notifToggles).map(([label, enabled]) => {
                  const descriptions: Record<string, string> = {
                    'Low stock alerts': 'Get notified when products fall below reorder point',
                    'Overdue payment reminders': 'Alert when customer payments are past due',
                    'New order notifications': 'Receive alerts for new sales orders',
                    'Payroll reminders': 'Monthly payroll processing reminders',
                    'Expense approval requests': 'Notifications for pending expense approvals',
                    'System updates': 'Updates about BizManage system changes',
                  };
                  return (
                    <div key={label} className="flex items-center justify-between p-3 bg-navy-700/30 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-text-primary">{label}</p>
                        <p className="text-xs text-text-muted">{descriptions[label]}</p>
                      </div>
                      <button
                        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                          enabled ? 'bg-accent-blue' : 'bg-navy-500'
                        }`}
                        onClick={() => {
                          setNotifToggles((p) => ({ ...p, [label]: !p[label] }));
                          addToast(`${label} ${enabled ? 'disabled' : 'enabled'}`, 'info');
                        }}
                        aria-label={`Toggle ${label}`}
                      >
                        <span
                          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                            enabled ? 'translate-x-5' : ''
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Appearance Tab ──────────────────────── */}
          {activeTab === 'appearance' && (
            <div className="bg-navy-800 border border-navy-500/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Appearance</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-medium text-text-primary mb-3">Theme</p>
                  <div className="grid grid-cols-3 gap-3">
                    {(
                      [
                        { id: 'dark' as Theme, label: 'Dark', colors: ['#0a0e1a', '#111827', '#3b82f6'] },
                        { id: 'light' as Theme, label: 'Light', colors: ['#f0f4ff', '#ffffff', '#3b82f6'] },
                        { id: 'system' as Theme, label: 'System', colors: ['#0a0e1a', '#f0f4ff', '#3b82f6'] },
                      ] as const
                    ).map((t) => (
                      <button
                        key={t.id}
                        className={`p-3 rounded-lg border transition-all ${
                          theme === t.id
                            ? 'border-accent-blue bg-accent-blue/10 ring-1 ring-accent-blue/40'
                            : 'border-navy-500/50 hover:border-navy-400'
                        }`}
                        onClick={() => {
                          setTheme(t.id);
                          addToast(`${t.label} theme applied`, 'success');
                        }}
                        aria-pressed={theme === t.id}
                        aria-label={`${t.label} theme`}
                      >
                        <div className="flex gap-1 mb-2">
                          {t.colors.map((c, i) => (
                            <span key={i} className="w-6 h-6 rounded" style={{ backgroundColor: c }} />
                          ))}
                        </div>
                        <p className="text-xs text-text-secondary text-left">{t.label}</p>
                        {theme === t.id && (
                          <p className="text-[10px] text-accent-blue-light mt-0.5">● Active</p>
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-text-muted mt-3">
                    Theme is saved automatically and applied on every visit.
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary mb-3">Sidebar Density</p>
                  <div className="grid grid-cols-2 gap-3">
                    {['Comfortable', 'Compact'].map((opt) => (
                      <button
                        key={opt}
                        className={`p-3 rounded-lg border text-sm text-text-secondary transition-all ${
                          opt === 'Comfortable'
                            ? 'border-accent-blue bg-accent-blue/5'
                            : 'border-navy-500/50 hover:border-navy-400'
                        }`}
                        onClick={() => addToast(`${opt} density applied`, 'info')}
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
  );
}
