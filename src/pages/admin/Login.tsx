import React, { useState } from 'react';
import { sendAdminOtp } from '@/lib/api';
import AdminLayout from '@/components/AdminLayout';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle'|'sending'|'sent'|'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus('sending');
    try {
      await sendAdminOtp(email.trim());
      setStatus('sent');
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to send OTP');
      setStatus('error');
    }
  }

  return (
    <AdminLayout title="Admin Login">
      <div className="max-w-md mx-auto bg-zinc-900 border border-red-500/30 rounded-xl p-6 text-white">
        <h2 className="text-xl font-semibold mb-2">Sign in</h2>
        <p className="text-sm text-gray-300 mb-6">Enter your admin email. We'll send a magic link to verify you.</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              className="w-full px-3 py-2 rounded-md bg-black border border-zinc-700 focus:border-red-500 outline-none"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {error && <div className="text-red-400 text-sm">{error}</div>}
          {status !== 'sent' ? (
            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-500 transition text-white font-medium py-2 rounded-md disabled:opacity-50"
              disabled={status === 'sending'}
            >
              {status === 'sending' ? 'Sending…' : 'Send magic link'}
            </button>
          ) : (
            <div className="bg-green-950/40 text-green-300 border border-green-700/30 rounded-md p-3 text-sm">
              Magic link sent. Check your inbox and open the link from this device. You'll be redirected to the admin dashboard.
            </div>
          )}
        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminLogin;
