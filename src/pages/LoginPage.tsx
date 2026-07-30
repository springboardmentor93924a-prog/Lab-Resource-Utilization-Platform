import { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowRight, Eye, EyeOff, Github, Lock, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { loginUser } from '../features/auth/authThunks';
import { setRememberMe } from '../features/auth/authSlice';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';

type LoginFormValues = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, error, rememberMe } = useAppSelector((state) => state.auth);
  const from = (location.state as { from?: Location })?.from?.pathname ?? '/dashboard';
  const [showPassword, setShowPassword] = useState(false);
  const [googleStep, setGoogleStep] = useState<'idle' | 'mock'>('idle');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const onSubmit = async (data: LoginFormValues) => {
    await dispatch(loginUser(data));
  };

  const handleGoogleLogin = () => {
    setGoogleStep('mock');
    setTimeout(() => {
      window.alert('Mock Google authentication succeeded. Redirecting to dashboard.');
      void dispatch(loginUser({ email: 'google.user@university.edu', password: 'Password123!' }));
      setGoogleStep('idle');
    }, 1200);
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-large">
        <div className="auth-hero">
          <div className="hero-badge">Secure sign-in</div>
          <h2>Welcome back</h2>
          <p>Access your lab operations workspace with enterprise-grade security.</p>
        </div>

        <form className="form-stack" onSubmit={handleSubmit(onSubmit)}>
          <label className="field">
            <Mail size={16} />
            <input type="email" placeholder="Email address" {...register('email', { required: 'Email is required' })} />
          </label>
          {errors.email && <p className="field-error">{errors.email.message}</p>}

          <label className="field">
            <Lock size={16} />
            <input type={showPassword ? 'text' : 'password'} placeholder="Password" {...register('password', { required: 'Password is required' })} />
            <button type="button" className="icon-btn" onClick={() => setShowPassword((value) => !value)}>
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </label>
          {errors.password && <p className="field-error">{errors.password.message}</p>}

          <div className="auth-row">
            <label className="checkbox-row">
              <input type="checkbox" checked={rememberMe} onChange={(event) => dispatch(setRememberMe(event.target.checked))} />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password">Forgot password?</Link>
          </div>

          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Login'} <ArrowRight size={16} />
          </button>
        </form>

        <div className="divider">or continue with</div>
        <div className="oauth-grid">
          <button className="oauth-btn" type="button" onClick={handleGoogleLogin} disabled={googleStep === 'mock'}>
            <Sparkles size={16} />{googleStep === 'mock' ? 'Authenticating...' : 'Continue with Google'}
          </button>
          <button className="oauth-btn" type="button">
            <ShieldCheck size={16} /> Continue with Microsoft
          </button>
          <button className="oauth-btn" type="button">
            <Github size={16} /> Continue with GitHub
          </button>
        </div>

        {error && <p className="field-error">{error}</p>}

        <div className="auth-links">
          <span>New here?</span>
          <Link to="/register">Create account</Link>
        </div>
      </div>
    </div>
  );
}
