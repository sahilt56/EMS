import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Dropdown from '../components/ui/Dropdown';

export const Auth = () => {
  const { user, signup, login, loginWithGoogle, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Attendee'); // Attendee or Organizer
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const cardRef = useRef(null);
  const formRef = useRef(null);
  const isSigningUp = useRef(false);

  // Automatically redirect when user context populates, ONLY if not currently signing up
  // to avoid a race condition where the default 'Attendee' role triggers a redirect before we update to 'Organizer'
  useEffect(() => {
    if (user && !isSigningUp.current) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // GSAP Premium Entrance Animation
  useEffect(() => {
    gsap.fromTo(
      cardRef.current,
      { y: 50, opacity: 0, scale: 0.9 },
      { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out' }
    );
  }, []);

  // GSAP Form switch animation
  useEffect(() => {
    if (formRef.current) {
      gsap.fromTo(
        formRef.current,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, [isLogin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Sign in via Firebase
        await login(email, password);
        // Note: No manual navigate here! The useEffect will navigate when the user context updates.
      } else {
        isSigningUp.current = true;
        // Sign up via Firebase
        const credential = await signup(email, password);
        
        // Wait briefly for AuthContext to detect user state change and auto-provision MongoDB user record
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Self-configure MongoDB user role if Organizer was selected
        if (role === 'Organizer') {
          api.defaults.headers.common['Authorization'] = `Bearer ${await credential.user.getIdToken()}`;
          await api.patch('/auth/select-role', { role: 'Organizer' });
          await api.patch('/auth/profile', { address });
          await refreshUser(); // Update the local user context state
        }
        
        navigate('/dashboard'); // Proceed to dashboard after role is safely configured
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Authentication failed. Please verify credentials.');
      setLoading(false); // Only toggle loading off if there's an error. If successful, keep loading state active until redirect.
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Google Sign-In failed.');
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[90vh] bg-slate-950 flex items-center justify-center p-4 overflow-hidden">
      {/* Background radial highlight - indigo glow */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-brand-500/15 blur-[100px] pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute w-[300px] h-[300px] rounded-full bg-secondary-500/10 blur-[80px] pointer-events-none top-1/4 left-1/4"></div>

      <Card ref={cardRef} className="w-full max-w-md mt-16 border border-brand-500/20 bg-slate-900/80 backdrop-blur-xl p-8 shadow-2xl shadow-brand-500/10 relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white tracking-wide mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-sm text-slate-400">
            {isLogin ? 'Access your tickets and lounges' : 'Register to host or buy event tickets'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg border border-red-500/20 bg-red-500/10 text-sm text-red-400 font-medium">
            {error}
          </div>
        )}

        <div ref={formRef}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={loading}
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
            />

            {!isLogin && (
              <>
                <Dropdown
                  label="Account Role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  options={[
                    { value: 'Attendee', label: 'Attendee (Buy & Attend)' },
                    { value: 'Organizer', label: 'Organizer (Create & Host)' }
                  ]}
                  required
                />
                {role === 'Organizer' && (
                  <Input
                    label="Company / Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your physical address or company location"
                    required
                    disabled={loading}
                  />
                )}
              </>
            )}

            <Button type="submit" disabled={loading} className="w-full py-3.5 mt-4 bg-brand-500 hover:bg-brand-600 text-white font-semibold text-lg transition-all shadow-lg shadow-brand-500/25">
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>
        </div>

        <div className="relative flex py-6 items-center justify-center">
          <div className="flex-grow border-t border-darkBorder"></div>
          <span className="flex-shrink mx-4 text-xs text-slate-500 font-semibold uppercase tracking-wider">or continue with</span>
          <div className="flex-grow border-t border-darkBorder"></div>
        </div>

        {/* Social login */}
        <Button
          variant="secondary"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-3 py-3.5 bg-white/5 border-white/10 hover:bg-white/10 transition-colors"
        >
          {/* Custom Google Vector Icon */}
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span className="text-sm font-semibold text-slate-200">Google</span>
        </Button>

        <div className="text-center mt-8">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-brand-400 hover:text-brand-300 font-semibold transition-colors"
          >
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Auth;
