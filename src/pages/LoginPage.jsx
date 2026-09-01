import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, ROLES } from '../context/AuthContext.jsx';
import { SEED_USERS } from '../db/seedData.js';
import { Radio, Lock, User, Shield, ArrowRight, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [usernameOrEmail, setUsernameOrEmail] = useState('dispatcher');
  const [password, setPassword] = useState('dispatch123');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');

    if (!usernameOrEmail.trim() || !password.trim()) {
      setError('Please provide terminal username and password.');
      return;
    }

    const res = await login(usernameOrEmail, password);
    if (res.success) {
      navigate('/admin/management');
    } else {
      setError(res.error || 'Authentication rejected.');
    }
  };

  const handleSelectDemoPersona = (user) => {
    setUsernameOrEmail(user.username);
    setPassword(user.password);
    setError('');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center p-4 font-sans select-none relative overflow-hidden">
      
      {/* Background Ambience Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 dark:bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 lg:p-8 space-y-6 relative z-10">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-600/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 mb-1">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div className="flex items-center justify-center space-x-1.5 text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Transport Operations Terminal</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            CITYFLOW COMMAND
          </h1>
          <p className="text-xs text-muted-foreground font-mono">
            Smart Scheduling & Real-Time Route Operations Engine
          </p>
        </div>

        {/* Error Callout */}
        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-mono flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          <div>
            <label className="block text-muted-foreground uppercase font-bold mb-1 text-[11px]">
              Terminal Username or Email
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                placeholder="e.g. dispatcher or dispatcher@cityflow.in"
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-muted/50 border border-input text-foreground text-xs outline-none focus:border-primary transition-all font-sans"
              />
            </div>
          </div>

          <div>
            <label className="block text-muted-foreground uppercase font-bold mb-1 text-[11px]">
              Terminal Access Key / Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-muted/50 border border-input text-foreground text-xs outline-none focus:border-primary transition-all font-sans"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-xs flex items-center justify-center space-x-2 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <span>{isLoading ? 'Authenticating Operator...' : 'Authenticate & Enter Control Room'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* One-Click Demo Personas */}
        <div className="pt-2 border-t border-border space-y-2.5">
          <div className="flex items-center justify-between font-mono text-[11px]">
            <span className="text-muted-foreground font-bold uppercase tracking-wider">
              One-Click Demo Personas:
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
              Instant Fill
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
            {SEED_USERS.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => handleSelectDemoPersona(user)}
                className={`p-2 rounded-lg border text-left transition-all ${
                  usernameOrEmail === user.username
                    ? 'bg-primary/10 border-primary text-foreground font-bold'
                    : 'bg-muted/30 border-border hover:bg-muted/60 text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground truncate">{user.name.split(' ')[0]}</span>
                  <span className={`px-1 rounded text-[9px] font-bold ${
                    user.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-600' :
                    user.role === 'DISPATCHER' ? 'bg-emerald-500/20 text-emerald-600' :
                    user.role === 'OPERATOR' ? 'bg-blue-500/20 text-blue-600' : 'bg-slate-500/20 text-slate-600'
                  }`}>
                    {user.role}
                  </span>
                </div>
                <div className="text-[10px] text-muted-foreground truncate mt-0.5">
                  {user.designation}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Public Passenger Link */}
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-xs font-mono text-muted-foreground hover:text-foreground underline transition-colors"
          >
            ← Switch to Public Passenger View
          </button>
        </div>

      </div>

      <div className="mt-4 text-[11px] font-mono text-muted-foreground text-center">
        CityFlow v2.0 • ISO 27001 Public Transportation Data Security Standard
      </div>

    </div>
  );
}

