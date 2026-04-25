import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Menu, X, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LogoIcon from './ui/LogoIcon';

const NAV_LINKS = [
  { label: 'Features',    id: 'features' },
  { label: 'How it works',id: 'how-it-works' },
  { label: 'Pricing',     id: 'pricing' },
  { label: 'Customers',   id: 'testimonials' },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isLanding = location.pathname === '/';

  const handleLogout = async () => { await logout(); navigate('/signin'); };

  const handleNavClick = (e, id) => {
    if (isLanding) {
      e.preventDefault();
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      setMobileOpen(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full overflow-x-hidden bg-background px-2 sm:px-4 lg:px-[5%] pt-2">
        <div className="screen-line-top screen-line-bottom relative mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between gap-2 border-x px-6 sm:px-12 md:px-16 lg:px-24"
          style={{ borderColor: 'var(--color-line)' }}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group transition-transform ease-out active:scale-[0.98]">
            <LogoIcon className="h-8 w-auto" />
            <span className="text-lg sm:text-xl font-bold tracking-tighter text-foreground font-heading mt-0.5">
              Swift Invoice<span className="text-brand">.</span>
            </span>
          </Link>

          <div className="flex-1" />

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(({ label, id }) => (
              <a
                key={id}
                href={`/#${id}`}
                onClick={(e) => handleNavClick(e, id)}
                className="text-sm font-medium tracking-tight text-muted-foreground transition-colors hover:text-foreground"
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="flex-1" />

          {/* Right controls */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link to="/dashboard" className="hidden md:block">
                  <button className="btn-secondary h-10 px-6 text-sm">Dashboard</button>
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn-ghost h-10 w-10 p-0 hidden md:flex items-center justify-center text-muted-foreground"
                  title="Sign out"
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link to="/signin">
                  <button className="btn-ghost h-10 px-6 text-sm font-medium">Log in</button>
                </Link>
                <Link to="/signup">
                  <button className="btn-brand h-10 px-6 text-sm font-medium flex items-center gap-2">
                    <Zap size={14} className="fill-current" />
                    Get Started
                  </button>
                </Link>
              </div>
            )}

            {/* Mobile toggle */}
            <button
              className="btn-ghost md:hidden h-10 w-10 p-0 flex items-center justify-center"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* chanhdai corner markers — top-left & top-right */}
          <div className="absolute top-[-3.5px] left-[-4.5px] z-10 flex size-2 border bg-background"
            style={{ borderColor: 'var(--color-line)' }} />
          <div className="absolute top-[-3.5px] right-[-4.5px] z-10 flex size-2 border bg-background"
            style={{ borderColor: 'var(--color-line)' }} />
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden mx-auto w-full max-w-[1600px] border-x border-b bg-background px-6 pb-6"
            style={{ borderColor: 'var(--color-line)' }}
          >
            <nav className="flex flex-col gap-0 pt-4">
              {NAV_LINKS.map(({ label, id }) => (
                <a
                  key={id}
                  href={`/#${id}`}
                  onClick={(e) => handleNavClick(e, id)}
                  className="py-4 text-base font-medium tracking-tight text-muted-foreground hover:text-foreground border-b last:border-0 transition-colors"
                  style={{ borderColor: 'var(--color-line)' }}
                >
                  {label}
                </a>
              ))}
            </nav>
            <div className="flex flex-col gap-3 pt-6">
              {user ? (
                <>
                  <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
                    <button className="btn-secondary w-full h-12 justify-center text-base">Dashboard</button>
                  </Link>
                  <button onClick={handleLogout} className="text-base font-medium text-destructive hover:underline text-left py-2">Sign out</button>
                </>
              ) : (
                <>
                  <Link to="/signin" onClick={() => setMobileOpen(false)}>
                    <button className="btn-secondary w-full h-12 justify-center text-base">Log in</button>
                  </Link>
                  <Link to="/signup" onClick={() => setMobileOpen(false)}>
                    <button className="btn-brand w-full h-12 justify-center text-base">Get Started Free</button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Navbar;
