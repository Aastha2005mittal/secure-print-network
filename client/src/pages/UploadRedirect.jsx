import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRoomByCode, createSession, getMe } from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Loader2, Shield, Printer } from 'lucide-react';

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

    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes orb1 {
      0%, 100% { transform: translate(0, 0) scale(1); }
      50%       { transform: translate(30px, -20px) scale(1.08); }
    }
    @keyframes orb2 {
      0%, 100% { transform: translate(0, 0) scale(1); }
      50%       { transform: translate(-20px, 25px) scale(1.05); }
    }
    .orb1 { animation: orb1 9s ease-in-out infinite; }
    .orb2 { animation: orb2 11s ease-in-out infinite; }

    .name-input {
      width: 100%;
      background: rgba(255,255,255,0.03);
      border: none;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      color: white;
      font-size: 22px;
      font-family: 'Syne', sans-serif;
      font-weight: 700;
      padding: 12px 0;
      outline: none;
      letter-spacing: -0.01em;
      transition: border-color 0.2s;
      caret-color: #6366f1;
    }
    .name-input::placeholder { color: rgba(255,255,255,0.15); font-weight: 400; font-family: 'DM Sans', sans-serif; font-size: 16px; }
    .name-input:focus { border-bottom-color: #6366f1; }

    .field-glow {
      position: absolute; bottom: 0; left: 0;
      height: 1px;
      background: linear-gradient(90deg, #6366f1, #a78bfa);
      width: 0;
      transition: width 0.35s ease;
    }
    .name-wrap:focus-within .field-glow { width: 100%; }

    input:-webkit-autofill,
    input:-webkit-autofill:focus {
      -webkit-box-shadow: 0 0 0 1000px #0a0b12 inset !important;
      -webkit-text-fill-color: white !important;
    }
  `}</style>
);

/* Animated loader screen */
const LoadingScreen = ({ label }) => (
    <div style={{ minHeight: '100vh', background: '#080910', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 }}>
        <div style={{ position: 'relative', width: 56, height: 56 }}>
            <div style={{ position: 'absolute', inset: 0, border: '2px solid rgba(99,102,241,0.15)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', inset: 0, border: '2px solid transparent', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
            <div style={{ position: 'absolute', inset: 8, border: '1px solid rgba(99,102,241,0.2)', borderRadius: '50%' }} />
        </div>
        <div style={{ textAlign: 'center' }}>
            <p className="syne" style={{ fontSize: 16, fontWeight: 700, color: 'white', marginBottom: 6 }}>{label}</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>Please wait…</p>
        </div>
    </div>
);

export default function UploadRedirect() {
    const { uniqueCode } = useParams();
    const navigate = useNavigate();
    const [step, setStep] = useState('checking');
    const [name, setName] = useState('');
    const [roomId, setRoomId] = useState(null);
    const [focused, setFocused] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                const { data: roomData } = await getRoomByCode(uniqueCode);
                setRoomId(roomData.roomId);
                const token = localStorage.getItem('token');
                if (token) {
                    try {
                        const { data: currentSession } = await getMe();
                        if (currentSession && currentSession.roomId === roomData.roomId) {
                            navigate(`/session/${currentSession.id}`);
                            return;
                        }
                    } catch {
                        localStorage.removeItem('token');
                    }
                }
                setStep('name');
            } catch {
                navigate('/');
            }
        };
        if (uniqueCode) init();
    }, [uniqueCode, navigate]);

    const handleStartSession = async (e) => {
        if (e) e.preventDefault();
        if (!roomId) return;
        setStep('loading');
        try {
            const { data: sessionData } = await createSession(roomId, name.trim());
            localStorage.setItem('token', sessionData.token);
            navigate(`/session/${sessionData.session.id}`);
        } catch {
            setStep('name');
        }
    };

    if (step === 'checking') return <FontLoader />, <LoadingScreen label="Connecting…" />;
    if (step === 'loading') return <FontLoader />, <LoadingScreen label="Preparing Your Room" />;

    return (
        <>
            <FontLoader />
            <div className="grid-bg" style={{ minHeight: '100vh', background: '#080910', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>

                {/* Glow orbs */}
                <div className="orb1" style={{ position: 'fixed', top: '-5%', right: '-5%', width: 480, height: 480, background: 'rgba(99,102,241,0.1)', borderRadius: '50%', filter: 'blur(120px)', pointerEvents: 'none' }} />
                <div className="orb2" style={{ position: 'fixed', bottom: '-10%', left: '-5%', width: 400, height: 400, background: 'rgba(139,92,246,0.08)', borderRadius: '50%', filter: 'blur(130px)', pointerEvents: 'none' }} />

                <motion.div
                    initial={{ opacity: 0, y: 28, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 10 }}
                >
                    {/* Logo mark */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 36 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 30, height: 30, border: '1px solid rgba(99,102,241,0.4)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Printer size={14} color="#818cf8" />
                            </div>
                            <span className="syne" style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>
                                Secure<span style={{ color: '#818cf8' }}>Print</span>
                            </span>
                        </div>
                    </div>

                    {/* Card */}
                    <div style={{
                        border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: 28,
                        background: 'rgba(255,255,255,0.025)',
                        backdropFilter: 'blur(24px)',
                        overflow: 'hidden',
                        boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
                    }}>

                        {/* Window chrome */}
                        <div style={{ padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: 7 }}>
                            <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(239,68,68,0.45)' }} />
                            <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(234,179,8,0.45)' }} />
                            <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(34,197,94,0.45)' }} />
                        </div>

                        <div style={{ padding: '36px 36px 32px' }}>

                            {/* Heading */}
                            <div style={{ marginBottom: 36 }}>
                                <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 10 }}>Step 1 of 1</p>
                                <h1 className="syne" style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 10 }}>
                                    What should we<br />call you?
                                </h1>
                                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6 }}>
                                    Enter your name to begin, or proceed with a random identity.
                                </p>
                            </div>

                            {/* Name field */}
                            <form onSubmit={handleStartSession} noValidate>
                                <label style={{ display: 'block', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 10 }}>Your Name</label>
                                <div className="name-wrap" style={{ position: 'relative', marginBottom: 36 }}>
                                    <input
                                        className="name-input"
                                        type="text"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        placeholder="e.g. Arjun Sharma (Optional)"
                                        required
                                        autoFocus
                                        onFocus={() => setFocused(true)}
                                        onBlur={() => setFocused(false)}
                                    />
                                    <div className="field-glow" />
                                </div>

                                {/* CTA */}
                                <button
                                    type="submit"
                                    style={{
                                        width: '100%',
                                        padding: '17px',
                                        borderRadius: 16,
                                        border: 'none',
                                        background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
                                        color: 'white',
                                        fontSize: 14,
                                        fontWeight: 600,
                                        letterSpacing: '0.02em',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 10,
                                        transition: 'all 0.25s ease',
                                        boxShadow: '0 8px 28px rgba(99,102,241,0.35)',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                                >
                                    {name.trim() ? 'Enter Room' : 'Proceed Anonymously'}
                                    <ArrowRight size={16} />
                                </button>
                            </form>
                        </div>

                        {/* Footer strip */}
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', padding: '14px 36px', display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.01)' }}>
                            <Shield size={11} color="rgba(255,255,255,0.2)" />
                            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.05em' }}>
                                End-to-end encrypted · Files auto-delete after printing
                            </span>
                        </div>
                    </div>

                    {/* Subtle code label */}
                    <p style={{ textAlign: 'center', marginTop: 16, fontSize: 10, color: 'rgba(255,255,255,0.15)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                        Room · <span style={{ color: 'rgba(99,102,241,0.5)', fontFamily: 'monospace' }}>{uniqueCode}</span>
                    </p>
                </motion.div>
            </div>
        </>
    );
}