import React, { useState, useEffect, useRef } from 'react';
import { getMe, getMyMessages, sendMessage, uploadFiles, getMyFiles, markAsReadCustomer } from '../api';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, FileUp, FileText, CheckCheck, Loader2, Printer, Shield, Download, X } from 'lucide-react';

const FontLoader = () => (
    <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; font-family: 'DM Sans', sans-serif; }
    .syne { font-family: 'Syne', sans-serif; }

    ::-webkit-scrollbar { width: 3px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.2); border-radius: 99px; }

    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes msgIn {
      from { opacity: 0; transform: translateY(10px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes pulse2 {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }
    @keyframes uploadPulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.4); }
      50%       { box-shadow: 0 0 0 12px rgba(99,102,241,0); }
    }

    .msg-in { animation: msgIn 0.22s cubic-bezier(0.16,1,0.3,1) forwards; }
    .pulse2  { animation: pulse2 1.8s ease-in-out infinite; }

    .chat-bg {
      background-color: #080910;
      background-image:
        radial-gradient(circle at 20% 20%, rgba(99,102,241,0.04) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(139,92,246,0.03) 0%, transparent 50%),
        linear-gradient(rgba(99,102,241,0.025) 1px, transparent 1px),
        linear-gradient(90deg, rgba(99,102,241,0.025) 1px, transparent 1px);
      background-size: auto, auto, 44px 44px, 44px 44px;
    }

    .msg-input {
      flex: 1;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 14px;
      padding: 13px 18px;
      font-size: 14px;
      color: white;
      outline: none;
      transition: border-color 0.2s;
      min-width: 0;
    }
    .msg-input::placeholder { color: rgba(255,255,255,0.2); }
    .msg-input:focus { border-color: rgba(99,102,241,0.45); }

    input:-webkit-autofill { -webkit-box-shadow: 0 0 0 1000px #0a0b12 inset !important; -webkit-text-fill-color: white !important; }
  `}</style>
);

const Spinner = ({ size = 40 }) => (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <div style={{ position: 'absolute', inset: 0, border: '2px solid rgba(99,102,241,0.12)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', inset: 0, border: '2px solid transparent', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.85s linear infinite' }} />
    </div>
);

const formatTime = (d) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export default function RoomPage() {
    const [session, setSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [files, setFiles] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadFiles_, setUploadFiles_] = useState([]);
    const [loading, setLoading] = useState(true);
    const socketRef = useRef();
    const chatEndRef = useRef();
    const fileInputRef = useRef();

    const initializingRef = useRef(false);

    useEffect(() => {
        if (initializingRef.current) return;
        initializingRef.current = true;
        initSession();
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const initSession = async () => {
        try {
            const [sessRes, msgRes, fileRes] = await Promise.all([getMe(), getMyMessages(), getMyFiles()]);
            setSession(sessRes.data);
            setMessages(msgRes.data);
            setFiles(fileRes.data);

            const token = localStorage.getItem('token');
            const socketUrl = import.meta.env.VITE_BACKEND_URL || '/';
            const socket = io(socketUrl, { auth: { token } });
            socketRef.current = socket;

            socket.on('newMessage', (msg) => {
                setMessages(prev => {
                    if (prev.find(m => m.id === msg.id)) return prev;
                    return [...prev, msg];
                });
                if (msg.senderType === 'owner') markAsReadCustomer();
            });

            socket.on('newFile', (file) => {
                setFiles(prev => {
                    if (prev.find(f => f.id === file.id)) return prev;
                    return [file, ...prev];
                });
            });

            markAsReadCustomer();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;
        try {
            await sendMessage(inputValue);
            setInputValue('');
        } catch (err) { console.error(err); }
    };

    const handleFileUpload = async (e) => {
        const selected = Array.from(e.target.files);
        if (!selected.length) return;
        setUploadFiles_(selected);
        setUploading(true);
        try {
            await uploadFiles(selected);
        } catch (err) {
            console.error('Upload Error:', err);
            const backendMsg = err.response?.data?.message;
            const errorText = Array.isArray(backendMsg) ? backendMsg.join(', ') : (backendMsg || err.message || 'Unknown error');
            alert(`Upload failed: ${errorText}`);
        }
        finally {
            setUploading(false);
            setUploadFiles_([]);
            e.target.value = '';
        }
    };

    if (loading) return (
        <>
            <FontLoader />
            <div style={{ minHeight: '100vh', background: '#080910', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                <Spinner size={48} />
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em' }}>Connecting to your secure room…</p>
            </div>
        </>
    );

    const displayName = session?.customerName && session.customerName !== 'Customer'
        ? session.customerName
        : session?.sessionCode;

    return (
        <>
            <FontLoader />
            <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#080910', color: 'white', overflow: 'hidden' }}>

                {/* HEADER */}
                <header style={{ flexShrink: 0, padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(8,9,16,0.9)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, border: '1px solid rgba(99,102,241,0.35)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Printer size={14} color="#818cf8" />
                        </div>
                        <div>
                            <p className="syne" style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>{displayName}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                <span className="pulse2" style={{ width: 5, height: 5, background: '#4ade80', borderRadius: '50%', display: 'inline-block' }} />
                                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Secure Session</span>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => fileInputRef.current.click()}
                        style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 10, color: '#818cf8', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', letterSpacing: '0.02em' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.14)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; }}
                    >
                        <FileUp size={13} /> Upload File
                    </button>
                </header>

                {/* MESSAGES */}
                <div className="chat-bg" style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>

                    {/* Welcome note */}
                    <div style={{ margin: '0 auto 16px', maxWidth: 320, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)', borderRadius: 16, padding: '12px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 6 }}>
                            <Shield size={11} color="#818cf8" />
                            <span style={{ fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(99,102,241,0.7)', fontWeight: 600 }}>End-to-End Encrypted</span>
                        </div>
                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', lineHeight: 1.65 }}>
                            Your files and messages are isolated. Everything auto-deletes after printing or 24 hours.
                        </p>
                    </div>

                    {messages.map((msg, i) => {
                        const isMe = msg.senderType === 'customer';
                        const isFile = msg.messageType === 'file';
                        let fileData = null;
                        if (isFile) { try { fileData = JSON.parse(msg.content); } catch { } }

                        return (
                            <div
                                key={msg.id}
                                className="msg-in"
                                style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', animationDelay: `${Math.min(i * 0.015, 0.25)}s` }}
                            >
                                <div style={{
                                    maxWidth: '78%',
                                    padding: isFile ? '10px 14px' : '10px 14px',
                                    borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                    background: isMe
                                        ? 'linear-gradient(135deg, #6366f1, #7c3aed)'
                                        : 'rgba(255,255,255,0.055)',
                                    border: isMe ? 'none' : '1px solid rgba(255,255,255,0.07)',
                                    boxShadow: isMe ? '0 4px 18px rgba(99,102,241,0.28)' : 'none',
                                }}>
                                    {isFile && fileData ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{ width: 34, height: 34, background: 'rgba(255,255,255,0.1)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <FileText size={16} />
                                            </div>
                                            <div style={{ minWidth: 0 }}>
                                                <p style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160, marginBottom: 3 }}>{fileData.fileName}</p>
                                                <a
                                                    href={fileData.fileUrl.replace('/upload/', '/upload/fl_attachment/')}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', display: 'flex', alignItems: 'center', gap: 3, textDecoration: 'none' }}
                                                >
                                                    <Download size={9} /> Download file
                                                </a>
                                            </div>
                                        </div>
                                    ) : (
                                        <p style={{ fontSize: 14, lineHeight: 1.5, color: isMe ? 'white' : 'rgba(255,255,255,0.85)' }}>{msg.content}</p>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 4, marginTop: 5, opacity: 0.45 }}>
                                        <span style={{ fontSize: 9 }}>{formatTime(msg.createdAt)}</span>
                                        {isMe && (
                                            <CheckCheck
                                                size={11}
                                                color={msg.isRead ? '#a5b4fc' : 'rgba(255,255,255,0.5)'}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={chatEndRef} />
                </div>

                {/* UPLOAD OVERLAY */}
                <AnimatePresence>
                    {uploading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{ position: 'fixed', inset: 0, background: 'rgba(8,9,16,0.85)', backdropFilter: 'blur(12px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
                        >
                            <motion.div
                                initial={{ scale: 0.92, y: 16 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.94, y: 8 }}
                                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 24, padding: '36px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center', maxWidth: 300, width: '100%', boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}
                            >
                                <div style={{ animation: 'uploadPulse 1.5s ease-in-out infinite', borderRadius: '50%' }}>
                                    <Spinner size={48} />
                                </div>
                                <div>
                                    <p className="syne" style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>Uploading…</p>
                                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', lineHeight: 1.6 }}>
                                        {uploadFiles_.length > 0
                                            ? uploadFiles_.map(f => f.name).join(', ')
                                            : 'Securing your files…'}
                                    </p>
                                </div>
                                <div style={{ width: '100%', height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                                    <motion.div
                                        initial={{ width: '0%' }}
                                        animate={{ width: '85%' }}
                                        transition={{ duration: 2.5, ease: 'easeInOut' }}
                                        style={{ height: '100%', background: 'linear-gradient(90deg,#6366f1,#a78bfa)', borderRadius: 99 }}
                                    />
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* INPUT BAR */}
                <form
                    onSubmit={handleSendMessage}
                    style={{ flexShrink: 0, padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(8,9,16,0.95)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', gap: 10 }}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        multiple
                        style={{ display: 'none' }}
                        accept=".jpg,.jpeg,.png,.pdf,.docx,.heic,.heif,.webp"
                    />

                    <button
                        type="button"
                        onClick={() => fileInputRef.current.click()}
                        style={{ width: 44, height: 44, borderRadius: 12, border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', flexShrink: 0, transition: 'all 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; e.currentTarget.style.color = '#818cf8'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; }}
                    >
                        <FileUp size={17} />
                    </button>

                    <input
                        type="text"
                        className="msg-input"
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        placeholder="Type a message…"
                    />

                    <button
                        type="submit"
                        disabled={!inputValue.trim()}
                        style={{
                            width: 44, height: 44, borderRadius: 12, border: 'none', flexShrink: 0,
                            background: inputValue.trim() ? 'linear-gradient(135deg,#6366f1,#7c3aed)' : 'rgba(255,255,255,0.04)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
                            boxShadow: inputValue.trim() ? '0 4px 18px rgba(99,102,241,0.35)' : 'none',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { if (inputValue.trim()) e.currentTarget.style.transform = 'scale(1.07)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                    >
                        <Send size={16} color={inputValue.trim() ? 'white' : 'rgba(255,255,255,0.2)'} />
                    </button>
                </form>

            </div>
        </>
    );
}