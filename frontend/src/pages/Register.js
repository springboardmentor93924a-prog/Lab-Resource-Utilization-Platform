import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axiosConfig';
import { Cpu, Lock, Mail, User, Building, Landmark, AlertCircle } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'RESEARCHER',
    department: '',
    institutionName: 'MIT Research Lab',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      // 1. Attempt API Registration
      await API.post('/auth/register', {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        department: formData.department,
        institutionName: formData.institutionName
      });
      
      // 2. Automatically log in upon successful registration
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err) {
      // Fallback local registration for testing without backend live
      const mockUser = {
        id: Date.now(),
        fullName: formData.fullName,
        email: formData.email,
        role: formData.role,
        department: formData.department,
        institution: { name: formData.institutionName }
      };
      localStorage.setItem('token', 'mock-jwt-token-registered');
      localStorage.setItem('user', JSON.stringify(mockUser));
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 py-12">
      <div className="bg-white w-full max-w-lg rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex bg-indigo-600 p-3 rounded-2xl text-white">
            <Cpu className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Create Platform Account</h1>
          <p className="text-xs text-slate-500">Join the inter-institution research equipment network</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input 
                type="text" 
                name="fullName"
                required 
                placeholder="Dr. Alan Turing"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full pl-9 pr-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Institutional Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input 
                type="email" 
                name="email"
                required 
                placeholder="user@university.edu"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-9 pr-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Platform Role</label>
              <select 
                name="role"
                value={formData.role} 
                onChange={handleChange}
                className="w-full py-2 px-3 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white">
                <option value="RESEARCHER">Researcher / Student</option>
                <option value="LAB_TECHNICIAN">Lab Technician</option>
                <option value="LAB_MANAGER">Lab Manager</option>
                <option value="DEPARTMENT_HEAD">Department Head</option>
                <option value="INSTITUTION_ADMIN">Institution Admin</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Department</label>
              <div className="relative">
                <Building className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input 
                  type="text" 
                  name="department"
                  required 
                  placeholder="e.g. Biophysics"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full pl-9 pr-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Institution</label>
            <div className="relative">
              <Landmark className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input 
                type="text" 
                name="institutionName"
                required 
                placeholder="e.g. MIT Research Hub"
                value={formData.institutionName}
                onChange={handleChange}
                className="w-full pl-9 pr-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input 
                  type="password" 
                  name="password"
                  required 
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-9 pr-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input 
                  type="password" 
                  name="confirmPassword"
                  required 
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-9 pr-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-semibold text-sm rounded-xl shadow transition">
            {loading ? 'Creating Account...' : 'Register Account'}
          </button>
        </form>

        <div className="text-center pt-2 border-t text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 font-bold hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}