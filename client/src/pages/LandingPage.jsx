import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createShop } from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Printer, ArrowRight, Lock, Store,
  Loader2, CheckCircle2, Eye, EyeOff, Sparkles, AlertCircle
} from 'lucide-react';

const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');
    *, *::before, *::after { box-sizing: border-box; font-family: 'DM Sans', sans-serif; }
    .syne { font-family: 'Syne', sans-serif; }

    @keyframes ticker {
      0%   { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    @keyframes floatCard {
      0%, 100% { transform: translateY(0px) rotate(-0.5deg); }
      50%       { transform: translateY(-10px) rotate(0.5deg); }
    }
    .ticker-wrap { overflow: hidden; white-space: nowrap; }
    .ticker-inner { display: inline-flex; animation: ticker 24s linear infinite; }
    .float-card { animation: floatCard 6s ease-in-out infinite; }

    .grid-bg {
      background-image:
        linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px),
        linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px);
      background-size: 52px 52px;
    }

    input:-webkit-autofill,
    input:-webkit-autofill:focus {
      -webkit-box-shadow: 0 0 0 1000px #0a0b12 inset !important;
      -webkit-text-fill-color: white !important;
      transition: background-color 5000s ease-in-out 0s;
    }

    .underline-field {
      border: 0;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      background: transparent;
      color: white;
      width: 100%;
      padding: 14px 36px 14px 0;
      outline: none;
      font-size: 15px;
      transition: border-color 0.2s;
    }
    .underline-field::placeholder { color: rgba(255,255,255,0.2); }
    .underline-field:focus { border-color: #6366f1; }
    .field-line {
      position: absolute;
      bottom: 0; left: 0;
      height: 1px;
      background: linear-gradient(90deg, #6366f1, #a78bfa);
      width: 0;
      transition: width 0.3s ease;
    }
    .field-wrap:focus-within .field-line { width: 100%; }
  `}</style>
);

const TICKER = ['QR Upload', 'Instant Chat', 'Auto Delete', 'No App Needed', 'Live Dashboard', 'Zero Cables', 'Privacy First'];

export default function LandingPage() {
  const navigate = useNavigate();
  const [fields, setFields] = useState({ name: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [status, setStatus] = useState('idle');
  const [serverErr, setServerErr] = useState('');

  const set = (k) => (e) => setFields(p => ({ ...p, [k]: e.target.value }));

  const handleCreateShop = async (e) => {
    e.preventDefault();
    if (status === 'loading') return;
    setStatus('loading');
    setServerErr('');
    try {
      const { data } = await createShop({
        name: fields.name.trim(),
        ownerEmail: fields.email.trim().toLowerCase(),
        ownerPassword: fields.password,
      });

      // Store auth info for auto-login
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('shop', JSON.stringify(data.shop));

      setStatus('success');
      setTimeout(() => navigate('/owner/dashboard'), 1500);
    } catch (err) {
      setStatus('error');
      const msg = err?.response?.data?.message || err?.message || 'Something went wrong.';
      setServerErr(msg.toLowerCase().includes('email')
        ? 'That email is already in use — try logging in.'
        : msg);
    }
  };

  return (
    <>
      <FontLoader />
      <div className="min-h-screen overflow-x-hidden" style={{ background: '#080910', color: 'white' }}>

        {/* Grid bg */}
        <div className="fixed inset-0 grid-bg pointer-events-none" />

        {/* Glow orbs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div style={{ position: 'absolute', top: '0%', left: '10%', width: '600px', height: '600px', background: 'rgba(99,102,241,0.09)', borderRadius: '50%', filter: 'blur(140px)' }} />
          <div style={{ position: 'absolute', bottom: '5%', right: '5%', width: '400px', height: '400px', background: 'rgba(139,92,246,0.07)', borderRadius: '50%', filter: 'blur(120px)' }} />
        </div>

        {/* NAV */}
        <nav style={{ position: 'relative', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 64px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, border: '1px solid rgba(99,102,241,0.4)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Printer size={15} color="#818cf8" />
            </div>
            <span className="syne" style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)' }}>
              Secure<span style={{ color: '#818cf8' }}>Print</span>
            </span>
          </div>
          <Link to="/login" style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', textDecoration: 'none', fontWeight: 500 }}
            onMouseEnter={e => e.target.style.color = 'white'}
            onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.35)'}
          >
            Owner Login →
          </Link>
        </nav>

        {/* TICKER */}
        <div className="ticker-wrap" style={{ padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.015)' }}>
          <div className="ticker-inner">
            {[...TICKER, ...TICKER].map((item, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 20, padding: '0 24px', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', fontWeight: 500 }}>
                <span style={{ width: 5, height: 5, background: '#6366f1', borderRadius: '50%', display: 'inline-block' }} />
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* HERO */}
        <div style={{ position: 'relative', zIndex: 10, maxWidth: 1380, margin: '0 auto', padding: '72px 64px 80px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 80, alignItems: 'start' }}>

            {/* LEFT */}
            <div>
              {/* Badge */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: '1px solid rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.05)', padding: '6px 16px', borderRadius: 999, marginBottom: 40 }}>
                <span style={{ width: 6, height: 6, background: '#4ade80', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Live on 150+ shops</span>
              </div>

              {/* Headline */}
              <h1 className="syne" style={{ fontSize: 'clamp(3rem,6.5vw,6rem)', fontWeight: 800, lineHeight: 0.9, letterSpacing: '-0.02em', marginBottom: 28 }}>
                Print Orders<br />
                <span style={{ background: 'linear-gradient(135deg, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Without the</span>
                <br />Chaos.
              </h1>

              <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 17, fontWeight: 300, maxWidth: 420, lineHeight: 1.7, marginBottom: 48, fontStyle: 'italic' }}>
                Customers scan your QR, upload files, and message you — all from their phone. No cables, no apps, no chaos.
              </p>

              {/* Features */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 56 }}>
                {[
                  'Scan QR → instant file upload, no app install',
                  'Files auto-delete after print — privacy by default',
                  'Live chat dashboard, all orders in one place',
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.1 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'rgba(255,255,255,0.45)' }}
                  >
                    <CheckCircle2 size={13} color="#818cf8" style={{ flexShrink: 0 }} />
                    {item}
                  </motion.div>
                ))}
              </div>

              {/* Stats */}
              <div style={{ display: 'inline-flex', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, overflow: 'hidden', background: 'rgba(255,255,255,0.02)' }}>
                {[['150+', 'Shops'], ['12K+', 'Files'], ['99.9%', 'Uptime']].map(([v, l], i) => (
                  <div key={l} style={{ padding: '18px 32px', borderRight: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none', textAlign: 'center' }}>
                    <div className="syne" style={{ fontSize: 28, fontWeight: 800, color: 'white' }}>{v}</div>
                    <div style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginTop: 3 }}>{l}</div>
                  </div>
                ))}
              </div>

              {/* Floating mock card */}
              <div className="float-card" style={{ marginTop: 56, width: 256 }}>
                <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, background: 'rgba(255,255,255,0.025)', backdropFilter: 'blur(20px)', padding: 20, boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <div style={{ width: 30, height: 30, background: 'rgba(99,102,241,0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Store size={13} color="#818cf8" />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>New Order</div>
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)' }}>Just now</div>
                    </div>
                    <span style={{ marginLeft: 'auto', width: 7, height: 7, background: '#4ade80', borderRadius: '50%' }} />
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>thesis_final.pdf</span><span style={{ color: '#818cf8' }}>×2</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>resume_v3.docx</span><span style={{ color: '#818cf8' }}>×1</span></div>
                  </div>
                  <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8, fontSize: 9, color: 'rgba(255,255,255,0.25)' }}>
                    <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: '65%', background: 'linear-gradient(90deg,#6366f1,#a78bfa)', borderRadius: 99 }} />
                    </div>
                    Printing…
                  </div>
                </div>
              </div>
            </div>

            {/* SIGNUP CARD */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              style={{ position: 'sticky', top: 32 }}
            >
              <div style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: 28, background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(24px)', overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.7)' }}>

                {/* Window chrome */}
                <div style={{ padding: '16px 28px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: 7 }}>
                  <span style={{ width: 11, height: 11, borderRadius: '50%', background: 'rgba(239,68,68,0.5)' }} />
                  <span style={{ width: 11, height: 11, borderRadius: '50%', background: 'rgba(234,179,8,0.5)' }} />
                  <span style={{ width: 11, height: 11, borderRadius: '50%', background: 'rgba(34,197,94,0.5)' }} />
                </div>

                <div style={{ padding: '32px 36px 36px' }}>
                  <h2 className="syne" style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Start Your Shop</h2>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)', marginBottom: 32 }}>Free to set up. Ready in 60 seconds.</p>

                  {/* Server error */}
                  <AnimatePresence>
                    {status === 'error' && serverErr && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ overflow: 'hidden', marginBottom: 24 }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: '#f87171', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 12, padding: '12px 16px' }}>
                          <AlertCircle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
                          {serverErr}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Success */}
                  <AnimatePresence>
                    {status === 'success' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '48px 0', textAlign: 'center' }}
                      >
                        <Sparkles size={36} color="#818cf8" />
                        <p className="syne" style={{ fontSize: 20, fontWeight: 700 }}>Shop Created!</p>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>Redirecting to login…</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {status !== 'success' && (
                    <form onSubmit={handleCreateShop} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

                      {/* Shop Name */}
                      <div>
                        <label style={{ display: 'block', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)', marginBottom: 8 }}>Shop Name</label>
                        <div className="field-wrap" style={{ position: 'relative' }}>
                          <input
                            type="text"
                            value={fields.name}
                            onChange={set('name')}
                            placeholder="e.g. Campus Print Hub"
                            required
                            autoComplete="organization"
                            className="underline-field"
                          />
                          <div className="field-line" />
                        </div>
                      </div>

                      {/* Email */}
                      <div>
                        <label style={{ display: 'block', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)', marginBottom: 8 }}>Owner Email</label>
                        <div className="field-wrap" style={{ position: 'relative' }}>
                          <input
                            type="email"
                            value={fields.email}
                            onChange={set('email')}
                            placeholder="you@yourshop.com"
                            required
                            autoComplete="email"
                            className="underline-field"
                          />
                          <div className="field-line" />
                        </div>
                      </div>

                      {/* Password */}
                      <div>
                        <label style={{ display: 'block', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)', marginBottom: 8 }}>Password</label>
                        <div className="field-wrap" style={{ position: 'relative' }}>
                          <input
                            type={showPw ? 'text' : 'password'}
                            value={fields.password}
                            onChange={set('password')}
                            placeholder="Min. 8 characters"
                            required
                            autoComplete="new-password"
                            className="underline-field"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPw(v => !v)}
                            style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.25)', padding: 0, display: 'flex', alignItems: 'center' }}
                          >
                            {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                          <div className="field-line" />
                        </div>
                      </div>

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={status === 'loading'}
                        style={{
                          width: '100%', padding: '18px', borderRadius: 16, fontWeight: 600, fontSize: 14,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                          background: status === 'loading' ? '#4338ca' : 'linear-gradient(135deg, #6366f1, #7c3aed)',
                          border: 'none', color: 'white', cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                          boxShadow: '0 8px 32px rgba(99,102,241,0.35)',
                          opacity: status === 'loading' ? 0.7 : 1,
                          transition: 'all 0.2s',
                          letterSpacing: '0.02em',
                          marginTop: 4,
                        }}
                        onMouseEnter={e => { if (status !== 'loading') e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                      >
                        {status === 'loading'
                          ? <><Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} /> Creating…</>
                          : <>Launch Shop <ArrowRight size={16} /></>
                        }
                      </button>
                    </form>
                  )}

                  <p style={{ marginTop: 24, textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.18)', lineHeight: 1.7 }}>
                    Files encrypted & auto-deleted after printing.<br />No data sold. Ever.
                  </p>
                </div>
              </div>

              {/* Subtle lock badge */}
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em' }}>
                  <Lock size={10} />
                  SSL Encrypted · GDPR Safe
                </div>
              </div>
            </motion.div>

          </div>
        </div>

        {/* FOOTER */}
        <footer style={{ position: 'relative', zIndex: 10, borderTop: '1px solid rgba(255,255,255,0.04)', padding: '28px 64px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.18)' }}>© 2026 SecurePrint</span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.18)' }}>Built for modern print shops</span>
        </footer>

      </div>
    </>
  );
}