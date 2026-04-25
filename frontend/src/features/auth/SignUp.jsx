import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import { ArrowRight, Check } from 'lucide-react';
import Navbar from '../../components/Navbar';
import LogoIcon from '../../components/ui/LogoIcon';

const GoogleIcon = () => (
  <svg className="w-4 h-4 mr-2.5 flex-shrink-0" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const SignUp = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('inviteToken');

  const handleGoogleSignUp = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      const success = await loginWithGoogle(tokenResponse.access_token);
      setIsLoading(false);
      if (success) navigate('/dashboard');
    },
    onError: () => console.error('Google Sign Up Failed'),
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const payload = inviteToken ? { ...formData, inviteToken } : formData;
    const success = await register(payload);
    setIsLoading(false);
    if (success) navigate('/dashboard');
  };

  const perks = [
    'Unlimited invoices, forever free',
    'One-click Stripe & UPI payments',
    'Automated payment reminders',
    'Custom branded invoice templates',
  ];

  return (
    <div className="w-full bg-background min-h-screen flex flex-col selection:bg-brand/10 selection:text-brand">

      {/* ── Navbar ── */}
      <Navbar />

      {/* ── Main Content ── */}
      <div className="flex-1 w-full overflow-x-hidden px-2 sm:px-4 lg:px-[5%]">
        <div className="mx-auto w-full max-w-[1600px] border-x min-h-[calc(100vh-4rem)] flex"
          style={{ borderColor: 'var(--color-line)' }}>

          {/* LEFT: Branding Panel */}
          <div className="hidden lg:flex flex-col justify-center flex-1 items-start px-16 py-16 relative overflow-hidden border-r bg-muted/10"
            style={{ borderColor: 'var(--color-line)' }}>
            {/* dot-grid texture */}
            <div className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(var(--pattern-foreground) 1px, transparent 0)',
                backgroundSize: '16px 16px',
                '--pattern-foreground': 'color-mix(in oklab, var(--color-foreground) 6%, transparent)',
              }}
            />

            <div className="relative z-10 max-w-lg">
              <LogoIcon className="h-14 w-auto mb-8 opacity-90" />

              <h2 className="text-5xl font-bold text-foreground tracking-tighter leading-tight font-heading mb-6">
                Start getting paid<br />
                <span className="text-brand">in minutes.</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-12">
                Join thousands of freelancers and small teams who switched from spreadsheets to Swift Invoice.
              </p>

              {/* Perks list */}
              <ul className="flex flex-col gap-4 border-t pt-10" style={{ borderColor: 'var(--color-line)' }}>
                {perks.map((perk, i) => (
                  <li key={i} className="flex items-center gap-4">
                    <div className="size-6 rounded-sm bg-brand/10 border border-brand/20 flex items-center justify-center flex-shrink-0">
                      <Check size={13} className="text-brand" strokeWidth={3} />
                    </div>
                    <span className="text-base font-semibold text-foreground tracking-tight">{perk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* RIGHT: Form Panel */}
          <div className="flex-1 flex flex-col justify-center items-center px-8 py-16 lg:max-w-[50%] w-full">
            <div className="w-full max-w-[400px] space-y-10">

              {/* Invite notice */}
              {inviteToken && (
                <div className="border-l-4 border-brand bg-brand/5 px-4 py-3 text-sm text-foreground font-medium rounded-sm">
                  🎉 You've been invited to join a team workspace.
                </div>
              )}

              {/* Header */}
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-sm border bg-muted/30 px-2 py-1 font-mono text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4"
                  style={{ borderColor: 'var(--color-border)' }}>
                  <span className="size-1.5 rounded-full bg-brand animate-pulse flex-shrink-0" />
                  FREE FOREVER
                </div>
                <h1 className="text-4xl font-bold text-foreground tracking-tighter font-heading">
                  {inviteToken ? 'Join your team.' : 'Create your account.'}
                </h1>
                <p className="text-base text-muted-foreground leading-relaxed">
                  {inviteToken
                    ? 'Set up your profile to access shared invoices and clients.'
                    : 'Start generating professional invoices in seconds. No credit card required.'}
                </p>
              </div>

              {/* Form */}
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block font-heading">
                    Full Name
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full h-12 px-4 bg-transparent border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 rounded-sm transition-all"
                    style={{ borderColor: 'var(--color-line)' }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block font-heading">
                    Email address
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full h-12 px-4 bg-transparent border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 rounded-sm transition-all"
                    style={{ borderColor: 'var(--color-line)' }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block font-heading">
                    Password
                  </label>
                  <input
                    name="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full h-12 px-4 bg-transparent border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 rounded-sm transition-all"
                    style={{ borderColor: 'var(--color-line)' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-brand hover:bg-brand-hover text-white flex items-center justify-center font-bold text-sm rounded-sm tracking-tight transition-colors disabled:opacity-60 disabled:cursor-not-allowed gap-2"
                >
                  {isLoading ? 'Creating account...' : (
                    <>Create account <ArrowRight size={16} /></>
                  )}
                </button>

                {/* Divider */}
                <div className="relative flex items-center gap-4 py-1">
                  <div className="flex-1 border-t" style={{ borderColor: 'var(--color-line)' }} />
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex-shrink-0">
                    Or sign up with
                  </span>
                  <div className="flex-1 border-t" style={{ borderColor: 'var(--color-line)' }} />
                </div>

                <button
                  type="button"
                  onClick={() => handleGoogleSignUp()}
                  disabled={isLoading}
                  className="w-full h-12 bg-background border text-foreground flex items-center justify-center font-semibold text-sm rounded-sm tracking-tight transition-colors hover:bg-muted disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ borderColor: 'var(--color-line)' }}
                >
                  <GoogleIcon />
                  Continue with Google
                </button>
              </form>

              <p className="text-sm text-muted-foreground font-medium">
                Already have an account?{' '}
                <Link to="/signin" className="font-bold text-foreground hover:text-brand hover:underline transition-colors">
                  Sign in →
                </Link>
              </p>

              {/* Legal */}
              <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
                By creating an account, you agree to our{' '}
                <a href="#" className="underline hover:text-foreground transition-colors">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="underline hover:text-foreground transition-colors">Privacy Policy</a>.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SignUp;
