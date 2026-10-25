import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import ForgotPasswordModal from '../components/layout/ForgotPasswordModal';
import { CheckSquare, Lock, Mail, KeyRound } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await login(email, password);
      addToast('Welcome back! Logged in successfully.', 'success');
      navigate('/board');
    } catch (err) {
      addToast(err.response?.data?.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-8 text-white text-center">
          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center mx-auto mb-3 border border-white/20">
            <CheckSquare className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">Jira Engine</h1>
          <p className="text-xs text-blue-200 mt-1 font-medium">
            Production Ticketing & Sprint Management System
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-4">
          <Input
            label="Email Address"
            type="email"
            icon={Mail}
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="flex flex-col gap-1">
            <Input
              label="Password"
              type="password"
              icon={Lock}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="flex justify-end mt-1">
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(true)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors flex items-center gap-1"
              >
                <KeyRound className="w-3.5 h-3.5" />
                Forgot Password?
              </button>
            </div>
          </div>

          <Button variant="primary" size="lg" isLoading={loading} type="submit" className="w-full mt-2 font-bold">
            Sign In to Dashboard
          </Button>

          <p className="text-center text-xs text-slate-400 mt-2">
            Workspace accounts are created and managed by System Admin.
          </p>
        </form>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
      />
    </div>
  );
};

export default LoginPage;
