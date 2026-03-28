import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginOwner } from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Eye, EyeOff, AlertCircle, Printer, ArrowRight, Lock } from 'lucide-react';

const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; font-family: 'DM Sans', sans-serif; }
    .syne { font-family: 'Syne', sans-serif; }

    .grid-bg {
      background-image:
        linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px);
      background-size: 48px 48px;
    }
    @keyframes orb1 {
      0%,100% { transform: translate(0,0) scale(1); }
      50%      { transform: translate(24px,-18px) scale(1.07); }
    }
    @keyframes orb2 {
      0%,100% { transform: translate(0,0) scale(1); }
      50%      { transform: translate(-18px,22px) scale(1.05); }
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .orb1 { animation: orb1 10s ease-in-out infinite; }
    .orb2 { animation: orb2 13s ease-in-out infinite; }

    .field-line {
      position: absolute; bottom: 0; left: 0;
      height: 1px;
      background: linear-gradient(90deg, #6366f1, #a78bfa);
      width: 0; transition: width 0.3s ease;
    }
    .field-wrap:focus-within .field-line { width: 100%; }

    .underline-input {
      width: 100%; background: transparent; border: none;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      color: white; font-size: 15px; padding: 12px 36px 12px 0;
      outline: none; transition: border-color 0.2s; caret-color: #6366f1;
    }
    .underline-input::placeholder { color: rgba(255,255,255,0.18); }
    .underline-input:focus { border-bottom-color: #6366f1; }

    input:-webkit-autofill,
    input:-webkit-autofill:focus {
      -webkit-box-shadow: 0 0 0 1000px #0a0b12 inset !important;
      -webkit-text-fill-color: white !important;
    }
  `}</style>
);

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await loginOwner(email.trim().toLowerCase(), password);
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('shop', JSON.stringify(data.shop));
      navigate('/owner/dashboard');
    } catch {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FontLoader />
      <div className="grid-bg" style={{ minHeight:'100vh', background:'#080910', display:'flex', alignItems:'center', justifyContent:'center', padding:24, position:'relative', overflow:'hidden' }}>

        {/* Orbs */}
        <div className="orb1" style={{ position:'fixed', top:'-5%', right:'-5%', width:500, height:500, background:'rgba(99,102,241,0.09)', borderRadius:'50%', filter:'blur(130px)', pointerEvents:'none' }} />
        <div className="orb2" style={{ position:'fixed', bottom:'-8%', left:'-5%', width:420, height:420, background:'rgba(139,92,246,0.07)', borderRadius:'50%', filter:'blur(120px)', pointerEvents:'none' }} />

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          style={{ width:'100%', maxWidth:400, position:'relative', zIndex:10 }}
        >
          {/* Logo */}
          <div style={{ display:'flex', justifyContent:'center', marginBottom:32 }}>
            <Link to="/" style={{ display:'flex', alignItems:'center', gap:8, textDecoration:'none' }}>
              <div style={{ width:30, height:30, border:'1px solid rgba(99,102,241,0.4)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Printer size={14} color="#818cf8" />
              </div>
              <span className="syne" style={{ fontSize:13, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(255,255,255,0.5)' }}>
                Secure<span style={{ color:'#818cf8' }}>Print</span>
              </span>
            </Link>
          </div>

          {/* Card */}
          <div style={{ border:'1px solid rgba(255,255,255,0.07)', borderRadius:28, background:'rgba(255,255,255,0.025)', backdropFilter:'blur(24px)', overflow:'hidden', boxShadow:'0 40px 80px rgba(0,0,0,0.6)' }}>

            {/* Window chrome */}
            <div style={{ padding:'14px 24px', borderBottom:'1px solid rgba(255,255,255,0.04)', display:'flex', gap:7 }}>
              <span style={{ width:10, height:10, borderRadius:'50%', background:'rgba(239,68,68,0.45)' }} />
              <span style={{ width:10, height:10, borderRadius:'50%', background:'rgba(234,179,8,0.45)' }} />
              <span style={{ width:10, height:10, borderRadius:'50%', background:'rgba(34,197,94,0.45)' }} />
            </div>

            <div style={{ padding:'36px 36px 32px' }}>
              <h1 className="syne" style={{ fontSize:26, fontWeight:800, letterSpacing:'-0.02em', marginBottom:6 }}>Welcome back.</h1>
              <p style={{ fontSize:13, color:'rgba(255,255,255,0.3)', marginBottom:32 }}>Sign in to your shop dashboard.</p>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ overflow:'hidden', marginBottom:24 }}
                  >
                    <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:'#f87171', background:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.18)', borderRadius:12, padding:'11px 14px' }}>
                      <AlertCircle size={13} style={{ flexShrink:0 }} />
                      {error}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleLogin} noValidate style={{ display:'flex', flexDirection:'column', gap:28 }}>

                {/* Email */}
                <div>
                  <label style={{ display:'block', fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(255,255,255,0.25)', marginBottom:8 }}>Email</label>
                  <div className="field-wrap" style={{ position:'relative' }}>
                    <input
                      type="email"
                      className="underline-input"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="owner@yourshop.com"
                      required
                      autoComplete="email"
                    />
                    <div className="field-line" />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label style={{ display:'block', fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(255,255,255,0.25)', marginBottom:8 }}>Password</label>
                  <div className="field-wrap" style={{ position:'relative' }}>
                    <input
                      type={showPw ? 'text' : 'password'}
                      className="underline-input"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(v => !v)}
                      style={{ position:'absolute', right:0, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.22)', padding:0, display:'flex', alignItems:'center', transition:'color 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.22)'}
                    >
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                    <div className="field-line" />
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width:'100%', padding:'17px', borderRadius:16, border:'none',
                    background:'linear-gradient(135deg,#6366f1,#7c3aed)',
                    color:'white', fontSize:14, fontWeight:600, letterSpacing:'0.02em',
                    display:'flex', alignItems:'center', justifyContent:'center', gap:10,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.65 : 1,
                    boxShadow:'0 8px 28px rgba(99,102,241,0.35)',
                    transition:'all 0.2s', marginTop:4,
                  }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  {loading ? (
                    <>
                      <div style={{ width:17, height:17, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
                      Signing in…
                    </>
                  ) : (
                    <>Sign In <ArrowRight size={15} /></>
                  )}
                </button>
              </form>
            </div>

            {/* Footer strip */}
            <div style={{ borderTop:'1px solid rgba(255,255,255,0.04)', padding:'14px 36px', display:'flex', alignItems:'center', justifyContent:'center', gap:6, background:'rgba(255,255,255,0.01)' }}>
              <Lock size={10} color="rgba(255,255,255,0.18)" />
              <span style={{ fontSize:11, color:'rgba(255,255,255,0.18)' }}>
                Don't have a shop?{' '}
                <Link to="/" style={{ color:'#818cf8', fontWeight:600, textDecoration:'none' }}
                  onMouseEnter={e => e.target.style.textDecoration='underline'}
                  onMouseLeave={e => e.target.style.textDecoration='none'}
                >
                  Start for free →
                </Link>
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}