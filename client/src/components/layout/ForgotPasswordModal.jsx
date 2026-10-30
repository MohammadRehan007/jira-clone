import React, { useState } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import axiosClient from '../../api/axiosClient';
import { useToast } from '../../context/ToastContext';
import { Mail, CheckCircle2, Send, ArrowLeft } from 'lucide-react';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      addToast('Please enter your account email address', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await axiosClient.post('/auth/forgot-password', {
        email: email.trim().toLowerCase()
      });
      addToast(res.data.message || 'Password reset link sent to your email!', 'success');
      setSubmitted(true);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to send reset link', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setSubmitted(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Forgot Password"
      subtitle="Enter your account email to receive a password reset link"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            {submitted ? 'Close' : 'Cancel'}
          </Button>
          {!submitted && (
            <Button variant="primary" icon={Send} isLoading={loading} onClick={handleSubmit}>
              Send Reset Link
            </Button>
          )}
        </>
      }
    >
      {submitted ? (
        <div className="py-5 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">Check Your Email</h3>
          <p className="text-xs text-slate-600 max-w-sm leading-relaxed">
            A secure link to set your new password has been sent to <strong className="text-slate-900">{email}</strong>. Please check your inbox (and spam folder) and click the link to proceed.
          </p>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-800 max-w-sm mt-2">
            ⏱️ The reset link will remain active for <strong>60 minutes</strong>.
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          <p className="text-xs text-slate-600 leading-relaxed">
            Enter the email address associated with your Jira Engine account. We will email you a secure link where you can enter and set your new password.
          </p>
          <Input
            label="Registered Email Address *"
            type="email"
            icon={Mail}
            placeholder="e.g. yourname@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
        </form>
      )}
    </Modal>
  );
};

export default ForgotPasswordModal;
