import { ArrowRight, Microscope, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function WelcomePage() {
  return (
    <div className="auth-page welcome-page">
      <div className="hero-card hero-card-large">
        <div className="hero-badge">Enterprise Lab Operations</div>
        <h1>Run your research infrastructure with clarity and control.</h1>
        <p>Coordinate inventory, bookings, maintenance, approvals, and analytics from one intelligent workspace built for modern labs.</p>
        <div className="hero-actions">
          <Link to="/register" className="primary-btn">Create account <ArrowRight size={16} /></Link>
          <Link to="/login" className="secondary-btn">Open portal</Link>
        </div>
        <div className="feature-row">
          <div className="feature-pill"><Microscope size={16} /> Smart inventory</div>
          <div className="feature-pill"><ShieldCheck size={16} /> Secure access</div>
          <div className="feature-pill"><Sparkles size={16} /> AI insights</div>
        </div>
      </div>
    </div>
  );
}
