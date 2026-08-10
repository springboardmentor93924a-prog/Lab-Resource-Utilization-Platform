import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowRight, Building2, Eye, EyeOff, Mail, Phone, ShieldCheck, User } from 'lucide-react';
import { registerUser } from '../features/auth/authThunks';
import { clearRegistrationSuccess } from '../features/auth/authSlice';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import type { UserRole } from '../features/auth/types';

type RegisterFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  institution: string;
  department: string;
  role: UserRole;
  password: string;
  confirmPassword: string;
  terms: boolean;
};

const roles: UserRole[] = ['Researcher', 'Student', 'Lab Technician', 'Lab Manager', 'Department Head', 'Institution Admin', 'System Admin'];

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, loading, error, registrationSuccess } = useAppSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      institution: 'Global Science University',
      department: '',
      role: 'Researcher',
      password: '',
      confirmPassword: '',
      terms: false,
    },
  });

  const passwordValue = watch('password') ?? '';
  const strength = useMemo(() => {
    let score = 0;
    if (passwordValue.length >= 8) score += 1;
    if (/[A-Z]/.test(passwordValue)) score += 1;
    if (/\d/.test(passwordValue)) score += 1;
    if (/[^A-Za-z0-9]/.test(passwordValue)) score += 1;
    return score;
  }, [passwordValue]);

  useEffect(() => {
    if (user && !registrationSuccess) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, registrationSuccess, navigate]);

  useEffect(() => {
    if (registrationSuccess) {
      const timer = window.setTimeout(() => {
        dispatch(clearRegistrationSuccess());
        navigate('/login', { replace: true });
      }, 1800);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [registrationSuccess, dispatch, navigate]);

  const onSubmit = async (data: RegisterFormValues) => {
    if (data.password !== data.confirmPassword) {
      window.alert('Passwords do not match.');
      return;
    }
    if (!data.terms) {
      window.alert('Please accept the terms and conditions.');
      return;
    }

    const result = await dispatch(registerUser({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      phone: data.phone,
      role: data.role,
      institution: data.institution,
      department: data.department,
    }));

    if (registerUser.fulfilled.match(result)) {
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-large">
        <div className="auth-hero">
          <div className="hero-badge">Create account</div>
          <h2>Join the next-gen lab platform</h2>
          <p>Create a secure workspace for bookings, maintenance, and collaboration.</p>
        </div>

        <form className="form-stack" onSubmit={handleSubmit(onSubmit)}>
          <div className="field-row">
            <label className="field">
              <User size={16} />
              <input placeholder="First name" {...register('firstName', { required: 'First name is required' })} />
            </label>
            <label className="field">
              <User size={16} />
              <input placeholder="Last name" {...register('lastName', { required: 'Last name is required' })} />
            </label>
          </div>
          {errors.firstName && <p className="field-error">{errors.firstName.message}</p>}
          {errors.lastName && <p className="field-error">{errors.lastName.message}</p>}

          <label className="field">
            <Mail size={16} />
            <input type="email" placeholder="University email" {...register('email', { required: 'Email is required' })} />
          </label>
          {errors.email && <p className="field-error">{errors.email.message}</p>}

          <label className="field">
            <Phone size={16} />
            <input type="tel" placeholder="Phone number" {...register('phone', { required: 'Phone number is required' })} />
          </label>
          {errors.phone && <p className="field-error">{errors.phone.message}</p>}

          <div className="field-row">
            <label className="field">
              <Building2 size={16} />
              <input placeholder="Institution" {...register('institution', { required: 'Institution is required' })} />
            </label>
            <label className="field">
              <Building2 size={16} />
              <input placeholder="Department" {...register('department', { required: 'Department is required' })} />
            </label>
          </div>
          {errors.institution && <p className="field-error">{errors.institution.message}</p>}
          {errors.department && <p className="field-error">{errors.department.message}</p>}

          <label className="field">
            <ShieldCheck size={16} />
            <select {...register('role')}>
              {roles.map((role) => <option key={role} value={role}>{role}</option>)}
            </select>
          </label>

          <label className="field">
            <ShieldCheck size={16} />
            <input type={showPassword ? 'text' : 'password'} placeholder="Password" {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Minimum 8 characters' } })} />
            <button type="button" className="icon-btn" onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
          </label>
          {errors.password && <p className="field-error">{errors.password.message}</p>}

          <div className="strength-meter" aria-label="Password strength">
            <div className={`strength-bar strength-${strength}`} />
            <span>{strength < 2 ? 'Weak' : strength < 4 ? 'Strong' : 'Excellent'}</span>
          </div>

          <label className="field">
            <ShieldCheck size={16} />
            <input type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm password" {...register('confirmPassword', { required: 'Please confirm your password' })} />
            <button type="button" className="icon-btn" onClick={() => setShowConfirmPassword((value) => !value)}>{showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
          </label>
          {errors.confirmPassword && <p className="field-error">{errors.confirmPassword.message}</p>}

          <label className="checkbox-row">
            <input type="checkbox" {...register('terms', { required: 'You must accept the terms' })} />
            <span>I accept the terms and privacy policy.</span>
          </label>
          {errors.terms && <p className="field-error">{errors.terms.message}</p>}

          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Continue'} <ArrowRight size={16} />
          </button>
        </form>

        {error && <p className="field-error">{error}</p>}
        {registrationSuccess && <p className="success-pill">Registration successful. Redirecting to login...</p>}

        <div className="auth-links">
          <span>Already have an account?</span>
          <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
