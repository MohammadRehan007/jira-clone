import React, { useState } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import axiosClient from '../../api/axiosClient';
import { useToast } from '../../context/ToastContext';
import { Mail, KeyRound, CheckCircle2 } from 'lucide-react';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      addToast('Please enter your email address', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await axiosClient.post('/auth/forgot-password', { email });
      addToast(res.data.message || 'Password reset email sent!', 'success');
      setSuccess(true);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to reset password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setSuccess(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Reset Your Password"
      subtitle="Enter your account email to receive a new temporary password"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            {success ? 'Close' : 'Cancel'}
          </Button>
          {!success && (
            <Button variant="primary" isLoading={loading} onClick={handleSubmit}>
              Reset & Send Password
            </Button>
          )}
        </>
      }
    >
      {success ? (
        <div className="py-6 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">Check Your Inbox</h3>
          <p className="text-xs text-slate-600 max-w-xs">
            We have emailed a new temporary password to <strong className="text-slate-900">{email}</strong>. Use it to log in and update your credentials.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          <Input
            label="Account Email Address *"
            type="email"
            icon={Mail}
            placeholder="e.g. user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
            <KeyRound className="w-3.5 h-3.5 text-blue-500 inline" /> A secure temporary password will be auto-generated and emailed to you.
          </p>
        </form>
      )}
    </Modal>
  );
};

export default ForgotPasswordModal;
