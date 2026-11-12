import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const AuthPage: React.FC = () => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, fullName, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-origin-subtle flex flex-col justify-center items-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-origin-ink text-white font-semibold text-lg mb-4 shadow-card">
            O
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-origin-ink">ORIGIN AI</h1>
          <p className="text-sm text-origin-muted mt-1">
            One Command. Infinite Possibilities.
          </p>
        </div>

        <div className="bg-white border border-origin-border rounded-2xl shadow-card p-6 sm:p-8">
          <div className="flex rounded-lg bg-origin-subtle p-1 mb-6 border border-origin-border">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                mode === 'login'
                  ? 'bg-white text-origin-ink shadow-subtle'
                  : 'text-origin-muted hover:text-origin-ink'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                mode === 'register'
                  ? 'bg-white text-origin-ink shadow-subtle'
                  : 'text-origin-muted hover:text-origin-ink'
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            {mode === 'register' && (
              <Input
                label="Full Name"
                type="text"
                required
                placeholder="Alex Rivera"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            )}

            <Input
              label="Work Email"
              type="email"
              required
              placeholder="alex@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Password"
              type="password"
              required
              minLength={8}
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                {error}
              </div>
            )}

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              {mode === 'login' ? 'Sign in to Command Center' : 'Initialize Workspace'}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-origin-border grid grid-cols-2 gap-3 text-[11px] text-origin-faint">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>Isolated per-user storage</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-origin-accent flex-shrink-0" />
              <span>Human-in-the-loop approvals</span>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-origin-faint mt-6 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-origin-accent" />
          Autonomous Multi-Agent Platform · FastAPI + LangGraph
        </p>
      </motion.div>
    </div>
  );
};
