import { useState } from 'react';
import { useStore } from '../../data/store';
import { Save, Lock, User, Mail, Check, AlertCircle } from 'lucide-react';

export function AdminSettings() {
  const { adminUser, updateAdminProfile } = useStore();
  const [name, setName] = useState(adminUser?.name || 'Admin User');
  const [email, setEmail] = useState(adminUser?.email || 'admin@needlecollection.com');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword && newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    setSaving(true);
    const res = await updateAdminProfile({
      name: name.trim(),
      email: email.trim(),
      ...(newPassword ? { currentPassword, newPassword } : {}),
    });
    setSaving(false);

    if (res.ok) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMessage({ type: 'success', text: 'Admin account settings updated successfully.' });
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to update settings.' });
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl mb-1">Admin Settings</h1>
        <p className="text-sm text-stone">Manage your administrator profile and login credentials</p>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        <div className="bg-ivory border border-hairline p-6 space-y-5">
          <h2 className="text-sm font-medium uppercase tracking-[0.15em] text-ink flex items-center gap-2">
            <User size={16} className="text-oxblood" /> Account Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-[0.15em] text-stone mb-1 block">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full border border-hairline px-3 py-2.5 text-sm outline-none focus:border-oxblood"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.15em] text-stone mb-1 block">Admin Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full border border-hairline px-3 py-2.5 text-sm outline-none focus:border-oxblood"
                />
                <Mail size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone/50" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-ivory border border-hairline p-6 space-y-5">
          <h2 className="text-sm font-medium uppercase tracking-[0.15em] text-ink flex items-center gap-2">
            <Lock size={16} className="text-oxblood" /> Change Password
          </h2>
          <p className="text-xs text-stone">Leave blank if you do not wish to change your password.</p>

          <div>
            <label className="text-[10px] uppercase tracking-[0.15em] text-stone mb-1 block">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full border border-hairline px-3 py-2.5 text-sm outline-none focus:border-oxblood"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-[0.15em] text-stone mb-1 block">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full border border-hairline px-3 py-2.5 text-sm outline-none focus:border-oxblood"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.15em] text-stone mb-1 block">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full border border-hairline px-3 py-2.5 text-sm outline-none focus:border-oxblood"
              />
            </div>
          </div>
        </div>

        {message && (
          <div className={`p-4 border flex items-center gap-2 text-sm ${
            message.type === 'success'
              ? 'bg-sage/10 border-sage/30 text-sage'
              : 'bg-terracotta/10 border-terracotta/30 text-terracotta'
          }`}>
            {message.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-oxblood text-ivory px-6 py-3 text-[11px] uppercase tracking-[0.15em] font-medium hover:bg-ink transition-smooth disabled:opacity-50"
        >
          <Save size={14} /> {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}

