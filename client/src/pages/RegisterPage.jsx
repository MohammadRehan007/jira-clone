import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Button from '../components/common/Button';
import { CheckSquare, User, Mail, Lock, Building } from 'lucide-react';

const RegisterPage = () => {
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Developer');
  const [department, setDepartment] = useState('Engineering');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await register({ name, email, password, role, department });
      addToast('Account created successfully! Welcome to Jira Engine.', 'success');
      navigate('/board');
    } catch (err) {
      addToast(err.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-6 text-white text-center">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center mx-auto mb-2 border border-white/20">
            <CheckSquare className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-black">Join Jira Engine Workspace</h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-3.5">
          <Input
            label="Full Name *"
            icon={User}
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Email Address *"
            type="email"
            icon={Mail}
            placeholder="john@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password *"
            type="password"
            icon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Team Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              options={[
                { value: 'Developer', label: 'Developer' },
                { value: 'Tester', label: 'Tester (QA)' },
                { value: 'ProjectLead', label: 'Project Lead' },
                { value: 'Viewer', label: 'Viewer' }
              ]}
            />

            <Input
              label="Department"
              icon={Building}
              placeholder="Frontend Dev"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
          </div>

          <Button variant="primary" size="lg" isLoading={loading} type="submit" className="w-full mt-2 font-bold">
            Create Account & Login
          </Button>

          <p className="text-center text-xs text-slate-500 mt-2">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
