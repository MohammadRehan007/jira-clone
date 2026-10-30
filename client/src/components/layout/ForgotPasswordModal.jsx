import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Mail, KeyRound, CheckCircle2, Lock, Copy, Check, Sparkles } from 'lucide-react';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [useCustomPassword, setUseCustomPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (user?.email) {
        setEmail(user.email);
      } else {
        setEmail('');
      }
      setUseCustomPassword(false);
      setNewPassword('');
      setConfirmPassword('');
      setSuccessData(null);
      setCopied(false);
    }
  }, [isOpen, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      addToast('Please enter your account email address', 'error');
      return;
    }

    if (useCustomPassword) {
      if (!newPassword.trim()) {
        addToast('Please enter your new password', 'error');
        return;
      }
      if (newPassword.length < 6) {
        addToast('Password should be at least 6 characters long', 'error');
        return;
      }
      if (newPassword !== confirmPassword) {
        addToast('Passwords do not match', 'error');
        return;
      }
    }

    try {
      setLoading(true);
      const payload = {
        email: email.trim().toLowerCase(),
        ...(useCustomPassword && newPassword.trim() ? { newPassword: newPassword.trim() } : {})
      };

      const res = await axiosClient.post('/auth/forgot-password', payload);
      addToast(res.data.message || 'Password reset successful!', 'success');
      setSuccessData(res.data);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to reset password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (successData?.tempPassword) {
      navigator.clipboard.writeText(successData.tempPassword);
      setCopied(true);
      addToast('Temporary password copied to clipboard!', 'info');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleClose = () => {
    setEmail('');
    setUseCustomPassword(false);
    setNewPassword('');
    setConfirmPassword('');
    setSuccessData(null);
    setCopied(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Forgot / Reset Password"
      subtitle="Reset your password or generate new secure login credentials"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            {successData ? 'Close' : 'Cancel'}
          </Button>
          {!successData && (
            <Button variant="primary" isLoading={loading} onClick={handleSubmit}>
              {useCustomPassword ? 'Set New Password' : 'Reset & Send Credentials'}
            </Button>
          )}
        </>
      }
    >
      {successData ? (
        <div className="py-4 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">Password Reset Completed</h3>
          <p className="text-xs text-slate-600 max-w-sm">
            {successData.message}
          </p>

          {successData.tempPassword && (
            <div className="w-full max-w-sm mt-2 p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Your Temporary Password
              </span>
              <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-300 font-mono text-sm font-bold text-blue-700">
                <span className="select-all">{successData.tempPassword}</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-1 text-xs"
                  title="Copy password"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-400">
                Please copy this password and store it safely, or use it to sign in immediately.
              </p>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-1">
          <Input
            label="Account Email Address *"
            type="email"
            icon={Mail}
            placeholder="e.g. user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Toggle between auto-generate or custom password */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={useCustomPassword}
                onChange={(e) => setUseCustomPassword(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                I want to set my own new password directly
              </span>
            </label>

            {useCustomPassword ? (
              <div className="flex flex-col gap-3 pt-1 border-t border-slate-200">
                <Input
                  label="New Password *"
                  type="password"
                  icon={Lock}
                  placeholder="Enter at least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <Input
                  label="Confirm New Password *"
                  type="password"
                  icon={Lock}
                  placeholder="Re-enter your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            ) : (
              <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                A secure temporary password will be generated for your account, sent to your email, and displayed on screen.
              </p>
            )}
          </div>
        </form>
      )}
    </Modal>
  );
};

export default ForgotPasswordModal;
