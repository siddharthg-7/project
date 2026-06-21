import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMockSession, setMockSession } from '../utils/planner';

export default function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      email: event.target.email.value.trim(),
      password: event.target.password.value,
      name: mode === 'register' ? event.target.name.value.trim() : undefined,
    };

    if (!payload.email || !payload.password) {
      setMessage('Email and password are required.');
      return;
    }

    try {
      if (mode === 'register') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) {
          setMessage(data.message || 'Registration failed');
          return;
        }
        localStorage.setItem('token', data.token);
        setMessage(data.message);
        navigate('/planner');
      } else {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: payload.email, password: payload.password })
        });
        const data = await res.json();
        if (!res.ok) {
          setMessage(data.message || 'Login failed');
          return;
        }
        localStorage.setItem('token', data.token);
        setMessage(data.message);
        navigate('/planner');
      }
    } catch (err) {
      setMessage('Network error: ' + err.message);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#111827,_#020617_55%)] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-4 py-10 lg:flex-row lg:gap-12">
        <section className="max-w-xl rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-cyan-500/10 backdrop-blur">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Smart Home Planner</p>
          <h1 className="mt-4 text-4xl font-black text-white">Login and start planning your dream home</h1>
          <p className="mt-3 text-slate-300">Use this first page for secure access, then continue to plot planning, Vastu analysis, parking, and budget estimation.</p>
          <ul className="mt-6 space-y-3 text-sm text-slate-200">
            <li>• Multi-page flow for login, planning, and analysis</li>
            <li>• Direction-wise Vastu and parking guidance</li>
            <li>• Budget estimation and smart room suggestions</li>
          </ul>
        </section>

        <section className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-cyan-500/10 backdrop-blur">
          <div className="flex gap-2 rounded-xl bg-slate-950/80 p-1">
            <button type="button" className={mode === 'login' ? 'rounded-xl bg-cyan-400 px-4 py-2 font-semibold text-slate-950' : 'rounded-xl px-4 py-2 text-slate-300'} onClick={() => setMode('login')}>Login</button>
            <button type="button" className={mode === 'register' ? 'rounded-xl bg-cyan-400 px-4 py-2 font-semibold text-slate-950' : 'rounded-xl px-4 py-2 text-slate-300'} onClick={() => setMode('register')}>Register</button>
          </div>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === 'register' && <input name="name" className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white" placeholder="Full name" />}
            <input name="email" type="email" className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white" placeholder="Email address" />
            <input name="password" type="password" className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white" placeholder="Password" />
            <button className="w-full rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 px-4 py-3 font-semibold text-slate-950">{mode === 'register' ? 'Create account' : 'Continue to planner'}</button>
          </form>
          {message && <p className="mt-4 text-sm text-emerald-200">{message}</p>}
        </section>
      </div>
    </main>
  );
}
