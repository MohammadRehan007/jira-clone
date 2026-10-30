import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import axiosClient from '../api/axiosClient';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { Lock, KeyRound, CheckCircle2, AlertCircle, ArrowLeft, CheckSquare } from 'lucide-react';

const ResetPasswordPage = () => {
  const { token: paramToken } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const token = paramToken || searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!token) {
      setErrorMessage('Reset token is missing or invalid. Please request a new password reset link.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    try {
      setLoading(true);
      const res = await axiosClient.post(`/auth/reset-password/${token}`, {
        password: password.trim()
      });

      addToast(res.data?.message || 'Password updated successfully!', 'success');
      setIsSuccess(true);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reset password. The link may have expired.';
      setErrorMessage(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 p-8 text-white text-center">
          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center mx-auto mb-3 border border-white/20">
            <KeyRound className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">Set New Password</h1>
          <p className="text-xs text-blue-200 mt-1 font-medium">
            Enter your new secure password below
          </p>
        </div>

        <div className="p-8">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center text-center gap-4 py-2">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-lg font-bold text-slate-800">Password Updated!</h2>
              <p className="text-xs text-slate-600 max-w-xs leading-relaxed">
                Your password has been encrypted and updated. You can now sign in to Jira Engine with your new credentials.
              </p>
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/login')}
                className="w-full mt-2 font-bold"
              >
                Sign In to Dashboard
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {errorMessage && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs text-rose-700">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {!token ? (
                <div className="text-center py-4">
                  <p className="text-xs text-slate-600 mb-4">
                    Invalid or missing password reset link. Please go back to the login page and request a new link.
                  </p>
                  <Button variant="secondary" onClick={() => navigate('/login')} className="w-full">
                    Return to Login
                  </Button>
                </div>
              ) : (
                <>
                  <Input
                    label="New Password *"
                    type="password"
                    icon={Lock}
                    placeholder="Enter at least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoFocus
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

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-500 flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>Your password will be securely encrypted with bcrypt.</span>
                  </div>

                  <Button
                    variant="primary"
                    size="lg"
                    isLoading={loading}
                    type="submit"
                    className="w-full mt-2 font-bold"
                  >
                    Save & Update Password
                  </Button>

                  <div className="text-center mt-2">
                    <Link
                      to="/login"
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Back to Login
                    </Link>
                  </div>
                </>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
