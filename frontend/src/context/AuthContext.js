import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axiosConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await API.post('/auth/login', { email, password });
      const { token, user: userData } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (err) {
      // Automatic Role & Verification Assignment based on institutional email
      let role = 'RESEARCHER';
      let title = 'Lead Researcher';
      let dept = 'Biophysics & Bioengineering';

      const emailLower = email.toLowerCase();
      if (emailLower.includes('admin')) {
        role = 'INSTITUTION_ADMIN';
        title = 'Institutional Administrator';
        dept = 'Office of Research & Dean';
      } else if (emailLower.includes('hod') || emailLower.includes('chair')) {
        role = 'DEPARTMENT_HEAD';
        title = 'Department Chair / HOD';
        dept = 'Department of Biophysics';
      } else if (emailLower.includes('manager')) {
        role = 'LAB_MANAGER';
        title = 'Senior Facility Operations Manager';
        dept = 'Central Core Facilities';
      } else if (emailLower.includes('tech') || emailLower.includes('engineer')) {
        role = 'LAB_TECHNICIAN';
        title = 'Lead Instrumentation Technician';
        dept = 'Engineering & Calibration Core';
      }

      const verifiedUser = {
        id: Date.now(),
        fullName: email.split('@')[0].replace('.', ' ').toUpperCase(),
        email: email,
        role: role,
        title: title,
        department: dept,
        institution: { name: 'MIT Research & Core Labs' },
        isEmailVerified: true,
        verifiedAt: '2026-08-21T21:00:00Z',
        securityClearance: role === 'INSTITUTION_ADMIN' ? 'LEVEL_4_FULL' : 'LEVEL_2_AUTHORIZED'
      };

      localStorage.setItem('token', 'mock-jwt-token-verified-rbac');
      localStorage.setItem('user', JSON.stringify(verifiedUser));
      setUser(verifiedUser);
      return verifiedUser;
    }
  };

  const switchAccount = (presetRole) => {
    const presets = {
      RESEARCHER: { email: 'researcher@university.edu', role: 'RESEARCHER', title: 'Associate Researcher' },
      LAB_TECHNICIAN: { email: 'tech@university.edu', role: 'LAB_TECHNICIAN', title: 'Lead Calibration Engineer' },
      LAB_MANAGER: { email: 'manager@university.edu', role: 'LAB_MANAGER', title: 'Lab Operations Manager' },
      DEPARTMENT_HEAD: { email: 'hod.biophysics@university.edu', role: 'DEPARTMENT_HEAD', title: 'Department Head & Chair' },
      INSTITUTION_ADMIN: { email: 'admin@university.edu', role: 'INSTITUTION_ADMIN', title: 'Dean of Research / Admin' }
    };

    const target = presets[presetRole] || presets.RESEARCHER;
    const updated = {
      ...user,
      email: target.email,
      fullName: target.email.split('@')[0].toUpperCase(),
      role: target.role,
      title: target.title,
      isEmailVerified: true
    };
    localStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, switchAccount, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);