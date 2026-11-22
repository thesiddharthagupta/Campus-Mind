import { useState, type FormEvent } from 'react';
import { ArrowRight, BookOpen, GraduationCap, ShieldCheck } from 'lucide-react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AuthSetupNotice } from '../components/AuthSetupNotice';

export function LoginPage() {
  const { configured, loading, user, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as { from?: string } | null)?.from ?? '/';
  if (configured && !loading && user) return <Navigate to={returnTo} replace />;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setSubmitting(true);
    const result = await signIn(email.trim(), password);
    setSubmitting(false);
    if (result.error) setError(result.error); else navigate(returnTo, { replace: true });
  }

  return <main className="auth-screen"><section className="auth-story"><Link to="/" className="auth-brand"><span className="brand-mark"><GraduationCap size={19}/></span><span>campusmind</span></Link><div className="auth-story-copy"><span className="eyebrow">YOUR LEARNING, IN ONE PLACE</span><h1>A little more clarity.<br/>A lot more confidence.</h1><p>Find your course material, build useful notes, and make steady progress toward your goals.</p><div className="auth-perk"><span><BookOpen size={16}/></span><div><strong>Everything follows your course structure</strong><small>From your semester down to each topic.</small></div></div><div className="auth-perk"><span><ShieldCheck size={16}/></span><div><strong>Your notes stay yours</strong><small>Personal study space, organized your way.</small></div></div></div><div className="auth-story-footer">A calmer way to keep learning.</div></section><section className="auth-panel"><div className="auth-form-wrap"><span className="eyebrow">WELCOME BACK</span><h2>Sign in to CampusMind</h2><p className="auth-description">Pick up right where your learning left off.</p>{!configured?<AuthSetupNotice/>:<form className="auth-form" onSubmit={handleSubmit}><label>Email address<input type="email" autoComplete="email" required placeholder="you@university.edu" value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Password<input type="password" autoComplete="current-password" required minLength={6} placeholder="Enter your password" value={password} onChange={e=>setPassword(e.target.value)}/></label>{error&&<p className="auth-error" role="alert">{error}</p>}<button className="button button-primary auth-submit" type="submit" disabled={submitting}>{submitting?'Signing in…':'Sign in'} {!submitting&&<ArrowRight size={16}/>}</button><p className="auth-switch">New to CampusMind? <Link to="/signup">Create an account</Link></p></form>}<div className="auth-footnote">By continuing, you agree to use CampusMind responsibly and respect the rights of resource contributors.</div></div></section></main>;
}
