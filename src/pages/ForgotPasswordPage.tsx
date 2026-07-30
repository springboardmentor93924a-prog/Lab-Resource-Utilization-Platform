import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Mail, ShieldCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';

type ForgotPasswordFormValues = {
  email: string;
  otp: string;
  password: string;
  confirmPassword: string;
};

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'email' | 'otp' | 'reset' | 'success'>('email');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>();

  const onSubmit = (data: ForgotPasswordFormValues) => {
    if (step === 'email') {
      setStep('otp');
      return;
    }
    if (step === 'otp') {
      if (data.otp !== '123456') {
        window.alert('Use 123456 for demo verification.');
        return;
      }
      setStep('reset');
      return;
    }
    if (data.password !== data.confirmPassword) {
      window.alert('Passwords do not match.');
      return;
    }
    setStep('success');
    window.setTimeout(() => navigate('/login', { replace: true }), 1500);
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-large">
        <div className="auth-hero">
          <div className="hero-badge">Password recovery</div>
          <h2>{step === 'success' ? 'Password updated' : 'Recover your access'}</h2>
          <p>{step === 'email' ? 'Enter your email to receive a verification code.' : step === 'otp' ? 'Verify your code and continue.' : step === 'reset' ? 'Create a new secure password.' : 'You can now sign in with your new password.'}</p>
        </div>

        <form className="form-stack" onSubmit={handleSubmit(onSubmit)}>
          {step === 'email' && (
            <>
              <label className="field">
                <Mail size={16} />
                <input type="email" placeholder="Email address" {...register('email', { required: 'Email is required' })} />
              </label>
              {errors.email && <p className="field-error">{errors.email.message}</p>}
            </>
          )}

          {step === 'otp' && (
            <label className="field">
              <ShieldCheck size={16} />
              <input placeholder="Verification code" {...register('otp', { required: 'OTP is required' })} />
            </label>
          )}

          {step === 'reset' && (
            <>
              <label className="field">
                <ShieldCheck size={16} />
                <input type="password" placeholder="New password" {...register('password', { required: 'Password is required' })} />
              </label>
              <label className="field">
                <ShieldCheck size={16} />
                <input type="password" placeholder="Confirm password" {...register('confirmPassword', { required: 'Confirm your password' })} />
              </label>
            </>
          )}

          {step === 'success' && <div className="success-pill"><CheckCircle2 size={18} /> Password reset successful.</div>}

          <button className="primary-btn" type="submit">
            {step === 'email' ? 'Send OTP' : step === 'otp' ? 'Verify code' : step === 'reset' ? 'Save password' : 'Continue'} <ArrowRight size={16} />
          </button>
        </form>

        <div className="auth-links">
          <Link to="/login">Back to login</Link>
        </div>
      </div>
    </div>
  );
}
