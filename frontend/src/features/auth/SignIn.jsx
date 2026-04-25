import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import { ArrowRight } from 'lucide-react';
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

const SignIn = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      const success = await loginWithGoogle(tokenResponse.access_token);
      setIsLoading(false);
      if (success) navigate('/dashboard');
    },
    onError: () => console.error('Google Sign In Failed'),
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await login(formData);
    setIsLoading(false);
    if (success) navigate('/dashboard');
  };

  return (
    <div className="w-full bg-background min-h-screen flex flex-col selection:bg-brand/10 selection:text-brand">

      {/* ── Navbar ── */}
      <Navbar />

      {/* ── Main Content ── */}
      <div className="flex-1 w-full overflow-x-hidden px-2 sm:px-4 lg:px-[5%]">
        <div className="mx-auto w-full max-w-[1600px] border-x min-h-[calc(100vh-4.5rem)] flex"
          style={{ borderColor: 'var(--color-line)' }}>

          {/* LEFT: Form Panel */}
          <div className="flex-1 flex flex-col justify-center items-center px-8 py-16 lg:max-w-[50%] w-full border-r"
            style={{ borderColor: 'var(--color-line)' }}>
            <div className="w-full max-w-[400px] space-y-10">

              {/* Header */}
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-sm border bg-muted/30 px-2 py-1 font-mono text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-4"
                  style={{ borderColor: 'var(--color-border)' }}>
                  <span className="size-1.5 rounded-full bg-brand animate-pulse flex-shrink-0" />
                  SECURE LOGIN
                </div>
                <h1 className="text-4xl font-bold text-foreground tracking-tighter font-heading">
                  Welcome back.
                </h1>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Sign in to manage your invoices and get paid faster.
                </p>
              </div>

              {/* Form */}
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground block font-heading">
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
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground font-heading">
                      Password
                    </label>
                    <Link to="#" className="text-xs font-semibold text-muted-foreground hover:text-foreground hover:underline transition-colors">
                      Forgot password?
                    </Link>
                  </div>
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
                  className="w-full h-12 bg-brand hover:bg-brand-hover text-white flex items-center justify-center font-medium text-sm rounded-sm tracking-tight transition-colors disabled:opacity-60 disabled:cursor-not-allowed gap-2"
                >
                  {isLoading ? 'Signing in...' : (
                    <>Sign in <ArrowRight size={16} /></>
                  )}
                </button>

                {/* Divider */}
                <div className="relative flex items-center gap-4 py-1">
                  <div className="flex-1 border-t" style={{ borderColor: 'var(--color-line)' }} />
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground flex-shrink-0">
                    Or continue with
                  </span>
                  <div className="flex-1 border-t" style={{ borderColor: 'var(--color-line)' }} />
                </div>

                <button
                  type="button"
                  onClick={() => handleGoogleLogin()}
                  disabled={isLoading}
                  className="w-full h-12 bg-background border text-foreground flex items-center justify-center font-semibold text-sm rounded-sm tracking-tight transition-colors hover:bg-muted disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ borderColor: 'var(--color-line)' }}
                >
                  <GoogleIcon />
                  Continue with Google
                </button>
              </form>

              <p className="text-sm text-muted-foreground font-medium">
                Don't have an account?{' '}
                <Link to="/signup" className="font-semibold text-foreground hover:text-brand hover:underline transition-colors">
                  Sign up free →
                </Link>
              </p>
            </div>
          </div>

          {/* RIGHT: Branding Panel */}
          <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden bg-muted/10">
            {/* dot-grid texture */}
            <div className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(var(--pattern-foreground) 1px, transparent 0)',
                backgroundSize: '16px 16px',
                '--pattern-foreground': 'color-mix(in oklab, var(--color-foreground) 6%, transparent)',
              }}
            />

            {/* Brand message */}
            <div className="relative z-10 flex flex-col items-start px-16 max-w-lg">
              <div className="mb-12">
                <LogoIcon className="h-16 w-auto mb-8 opacity-90" />
                <h2 className="text-5xl font-bold text-foreground tracking-tighter leading-tight font-heading mb-6">
                  Invoicing that<br />
                  <span className="text-brand">actually works.</span>
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Create professional invoices in seconds, automate follow-ups, and get paid — without the manual work.
                </p>
              </div>

              {/* Social proof strip */}
              <div className="w-full border-t pt-8" style={{ borderColor: 'var(--color-line)' }}>
                <div className="flex flex-col gap-5">
                  {[
                    { quote: '"Cut our billing time from hours to minutes."', name: 'Riya S., Product Lead' },
                    { quote: '"Finally — invoicing that feels like software."', name: 'Arjun M., Freelancer' },
                  ].map((t, i) => (
                    <div key={i} className="border-l-2 border-brand pl-4">
                      <p className="text-sm font-medium text-foreground leading-relaxed">{t.quote}</p>
                      <p className="font-mono text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mt-2">{t.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SignIn;
