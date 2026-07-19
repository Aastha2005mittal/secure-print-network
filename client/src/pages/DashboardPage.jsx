import React, { useEffect, useState, useRef } from 'react';
import { getShopSessions, getSessionMessages, sendOwnerMessage, markPrinted, getSessionFiles, markAsReadOwner, downloadFile } from '../api';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Printer, Check, Send, Search,
    MessageSquare, FileText, User, CheckCheck,
    MoreVertical, Zap, Download, Copy, ExternalLink, X
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const FontLoader = () => (
    <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; font-family: 'DM Sans', sans-serif; }
    .syne { font-family: 'Syne', sans-serif; }

    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.25); border-radius: 99px; }

    .grid-bg {
      background-image:
        linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px);
      background-size: 48px 48px;
    }

    @keyframes msgIn {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .msg-in { animation: msgIn 0.2s ease forwards; }

    @keyframes pulse2 {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
    .pulse2 { animation: pulse2 1.8s ease-in-out infinite; }

    input:-webkit-autofill,
    input:-webkit-autofill:focus {
      -webkit-box-shadow: 0 0 0 1000px #0d0e18 inset !important;
      -webkit-text-fill-color: white !important;
    }
    
    .glass-modal {
      background: rgba(13, 14, 24, 0.8);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 24px 80px rgba(0, 0, 0, 0.8);
    }
  `}</style>
);

const Avatar = ({ name, size = 36, onClick }) => {
    const initials = name ? name.slice(0, 2).toUpperCase() : '??';
    const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];
    const color = colors[name?.charCodeAt(0) % colors.length] || colors[0];
    return (
        <div
            onClick={onClick}
            style={{
                width: size, height: size, borderRadius: '50%', flexShrink: 0,
                background: `${color}22`, border: `1px solid ${color}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: size * 0.33, fontWeight: 700, color,
                fontFamily: 'Syne, sans-serif',
                cursor: onClick ? 'pointer' : 'default'
            }}
        >
            {initials}
        </div>
    );
};

const ProfileModal = ({shop, onClose }) => {
    console.log("Shop in profile modal", shop);
    const [copied, setCopied] = useState(false);
    const publicUrl = window.location.origin;
    const uploadUrl = `${publicUrl}/upload/${shop.uniqueCode === undefined ? shop.uniquecode : shop.uniqueCode}`;
    console.log("Upload url" , uploadUrl);

    const copyUrl = () => {
        navigator.clipboard.writeText(uploadUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed', inset: 0, zIndex: 100,
                background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
            }}
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="glass-modal"
                style={{
                    width: '100%', maxWidth: 440, borderRadius: 24,
                    padding: 32, position: 'relative'
                }}
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}
                >
                    <X size={20} />
                </button>

                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                        <Avatar name={shop.name} size={64} />
                    </div>
                    <h2 className="syne" style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{shop.name}</h2>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Shop Profile & QR Access</p>
                </div>

                <div style={{ background: 'white', padding: 20, borderRadius: 20, display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
                    <QRCodeSVG value={uploadUrl} size={180} level="H" includeMargin={false} />
                </div>

                <div style={{ spaceY: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>Customer Upload Link</label>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <div style={{
                                flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: 12, padding: '12px 14px', fontSize: 12, color: 'rgba(255,255,255,0.6)',
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                            }}>
                                {uploadUrl}
                            </div>
                            <button
                                onClick={copyUrl}
                                style={{
                                    padding: '0 14px', borderRadius: 12, background: copied ? '#4ade80' : 'rgba(99,102,241,0.15)',
                                    border: `1px solid ${copied ? '#4ade8044' : 'rgba(99,102,241,0.3)'}`, color: copied ? 'white' : '#818cf8',
                                    cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center'
                                }}
                            >
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                            </button>
                        </div>
                    </div>

                    <a
                        href={uploadUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            width: '100%', padding: '14px', borderRadius: 14, background: 'white',
                            color: 'black', fontWeight: 600, fontSize: 13, textDecoration: 'none',
                            transition: 'transform 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        Open Upload Page <ExternalLink size={14} />
                    </a>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default function DashboardPage() {
    const [sessions, setSessions] = useState([]);
    const [activeSession, setActiveSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [files, setFiles] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showProfile, setShowProfile] = useState(false);
    const shop = JSON.parse(localStorage.getItem('shop') || '{}');
    const socketRef = useRef();
    const chatEndRef = useRef();
    const activeSessionRef = useRef(activeSession);

    useEffect(() => {
        activeSessionRef.current = activeSession;
    }, [activeSession]);

    useEffect(() => {
        fetchSessions();
        const token = localStorage.getItem('token');
        const socket = io('/', { auth: { token } });
        socketRef.current = socket;

        socket.on('newMessage', (msg) => {
            if (activeSessionRef.current?.id === msg.uploadSessionId) {
                setMessages(prev => {
                    if (prev.find(m => m.id === msg.id)) return prev;
                    return [...prev, msg];
                });
            }
            fetchSessions();
        });

        socket.on('newFile', (file) => {
            if (activeSessionRef.current?.id === file.uploadSessionId) {
                setFiles(prev => {
                    if (prev.find(f => f.id === file.id)) return prev;
                    return [file, ...prev];
                });
            }
            fetchSessions();
        });

        return () => socket.disconnect();
    }, []); // Only on mount

    useEffect(() => {
        if (activeSession) {
            fetchSessionData(activeSession.id);
            setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
    }, [activeSession]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchSessions = async () => {
        try {
            const { data } = await getShopSessions(shop.id);
            setSessions(data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const fetchSessionData = async (sessionId) => {
        try {
            const [msgRes, fileRes] = await Promise.all([getSessionMessages(sessionId), getSessionFiles(sessionId)]);
            setMessages(msgRes.data);
            setFiles(fileRes.data);
            // Mark as read API
            await markAsReadOwner(sessionId);
            // Clear locally for immediate UI update
            setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, unreadCountForOwner: 0 } : s));
        } catch (err) { console.error(err); }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputValue.trim() || !activeSession) return;
        try {
            await sendOwnerMessage(activeSession.id, inputValue);
            setInputValue('');
        } catch (err) { console.error(err); }
    };

    const handleMarkPrinted = async (sessionId) => {
        try {
            await markPrinted(sessionId);
            fetchSessions();
        } catch (err) { console.error(err); }
    };

    const handleDownloadFile = async (fileId, fileName) => {
        if (!fileId) return;

        try {
            const { data } = await downloadFile(fileId);
            const url = window.URL.createObjectURL(data);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName || 'download';
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            alert('Download failed');
        }
    };

    const filteredSessions = sessions.filter(s =>
        (s.customerName || s.sessionCode || '').toLowerCase().includes(search.toLowerCase())
    );

    const formatTime = (d) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <>
            <FontLoader />
            <AnimatePresence>
                {showProfile && <ProfileModal shop={shop} onClose={() => setShowProfile(false)} />}
            </AnimatePresence>

            <div style={{ display: 'flex', height: '100vh', background: '#080910', color: 'white', overflow: 'hidden' }}>

                {/* ── SIDEBAR ── */}
                <div style={{ width: 300, flexShrink: 0, display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.015)' }}>

                    {/* Sidebar header */}
                    <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                            <Avatar name={shop.name} size={38} onClick={() => setShowProfile(true)} />
                            <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => setShowProfile(true)}>
                                <p className="syne" style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{shop.name || 'My Shop'}</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                                    <span className="pulse2" style={{ width: 5, height: 5, background: '#4ade80', borderRadius: '50%', display: 'inline-block' }} />
                                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Online</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowProfile(true)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.2)', padding: 4, display: 'flex' }}
                            >
                                <MoreVertical size={15} />
                            </button>
                        </div>

                        {/* Search */}
                        <div style={{ position: 'relative' }}>
                            <Search size={13} color="rgba(255,255,255,0.25)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search sessions…"
                                style={{
                                    width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                                    borderRadius: 10, padding: '9px 12px 9px 34px', fontSize: 12, color: 'white',
                                    outline: 'none', transition: 'border-color 0.2s',
                                }}
                                onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.4)'}
                                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.07)'}
                            />
                        </div>
                    </div>

                    {/* Session count */}
                    <div style={{ padding: '10px 20px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.25)' }}>Sessions</span>
                        <span style={{ fontSize: 10, color: 'rgba(99,102,241,0.7)', background: 'rgba(99,102,241,0.1)', borderRadius: 99, padding: '2px 8px', fontWeight: 600 }}>{filteredSessions.length}</span>
                    </div>

                    {/* Session list */}
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {loading ? (
                            <div style={{ padding: 32, textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>Loading…</div>
                        ) : filteredSessions.length === 0 ? (
                            <div style={{ padding: 32, textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>No sessions yet</div>
                        ) : filteredSessions.map(session => {
                            const isActive = activeSession?.id === session.id;
                            const lastMsg = session.messages?.[session.messages.length - 1]?.content || 'New session';
                            const displayName = (session.customerName && session.customerName !== 'Customer') ? session.customerName : session.sessionCode;
                            return (
                                <div
                                    key={session.id}
                                    onClick={() => setActiveSession(session)}
                                    style={{
                                        padding: '14px 20px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.03)',
                                        background: isActive ? 'rgba(99,102,241,0.08)' : 'transparent',
                                        borderLeft: isActive ? '2px solid #6366f1' : '2px solid transparent',
                                        transition: 'background 0.15s',
                                    }}
                                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.025)'; }}
                                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                                        <Avatar name={displayName} size={34} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                                <span style={{ fontSize: 12, fontWeight: 600, color: isActive ? 'white' : 'rgba(255,255,255,0.75)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 130 }}>
                                                    {displayName}
                                                </span>
                                                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', flexShrink: 0, marginLeft: 4 }}>
                                                    {formatTime(session.lastActivityAt)}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                                                    {lastMsg}
                                                </span>
                                                {session.unreadCountForOwner > 0 && (
                                                    <span style={{ background: '#6366f1', color: 'white', fontSize: 9, fontWeight: 700, width: 17, height: 17, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: 6 }}>
                                                        {session.unreadCountForOwner}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── MAIN PANEL ── */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
                    {activeSession ? (
                        <>
                            {/* Chat header */}
                            <div style={{ padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.015)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    {(() => {
                                        const displayName = (activeSession.customerName && activeSession.customerName !== 'Customer') ? activeSession.customerName : activeSession.sessionCode;
                                        return (
                                            <>
                                                <Avatar name={displayName} size={38} />
                                                <div>
                                                    <p className="syne" style={{ fontSize: 14, fontWeight: 700 }}>{displayName}</p>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                                                        <span className="pulse2" style={{ width: 5, height: 5, background: '#4ade80', borderRadius: '50%', display: 'inline-block' }} />
                                                        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Active Session</span>
                                                    </div>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>

                                <div style={{ display: 'flex', gap: 12 }}>
                                    <button
                                        onClick={() => handleMarkPrinted(activeSession.id)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px',
                                            background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)',
                                            borderRadius: 12, color: '#4ade80', fontSize: 12, fontWeight: 600,
                                            cursor: 'pointer', transition: 'all 0.2s', letterSpacing: '0.02em',
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.15)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                    >
                                        <Check size={13} /> Mark as Printed
                                    </button>
                                </div>
                            </div>

                            {/* Messages area */}
                            <div className="grid-bg" style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {messages.length === 0 && (
                                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <MessageSquare size={40} style={{ margin: '0 auto 10px' }} />
                                            <p style={{ fontSize: 13 }}>No messages yet</p>
                                        </div>
                                    </div>
                                )}

                                {messages.map((msg, i) => {
                                    const isOwner = msg.senderType === 'owner';
                                    const isFile = msg.messageType === 'file';
                                    let fileData = null;
                                    if (isFile) {
                                        try { fileData = JSON.parse(msg.content); } catch { }
                                    }
                                    const matchingFile = fileData
                                        ? files.find(file => file.id === fileData.fileId || file.fileUrl === fileData.fileUrl || file.fileName === fileData.fileName)
                                        : null;
                                    const fileId = fileData?.fileId || matchingFile?.id;

                                    return (
                                        <div
                                            key={msg.id}
                                            className="msg-in"
                                            style={{ display: 'flex', justifyContent: isOwner ? 'flex-end' : 'flex-start', animationDelay: `${Math.min(i * 0.02, 0.3)}s` }}
                                        >
                                            {!isOwner && (
                                                <div style={{ marginRight: 8, marginTop: 'auto' }}>
                                                    <Avatar name={(activeSession.customerName && activeSession.customerName !== 'Customer') ? activeSession.customerName : activeSession.sessionCode} size={26} />
                                                </div>
                                            )}
                                            <div style={{
                                                maxWidth: '62%', padding: isFile ? '10px 14px' : '10px 14px',
                                                borderRadius: isOwner ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                                background: isOwner
                                                    ? 'linear-gradient(135deg, #6366f1, #7c3aed)'
                                                    : 'rgba(255,255,255,0.06)',
                                                border: isOwner ? 'none' : '1px solid rgba(255,255,255,0.07)',
                                                boxShadow: isOwner ? '0 4px 20px rgba(99,102,241,0.3)' : 'none',
                                            }}>
                                                {isFile && fileData ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                        <div style={{ width: 34, height: 34, background: 'rgba(255,255,255,0.1)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                            <FileText size={16} />
                                                        </div>
                                                        <div style={{ minWidth: 0 }}>
                                                            <p style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>{fileData.fileName}</p>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDownloadFile(fileId, fileData.fileName)}
                                                                disabled={!fileId}
                                                                style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2, background: 'none', border: 'none', padding: 0, cursor: fileId ? 'pointer' : 'default' }}
                                                            >
                                                                <Download size={10} /> Download
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p style={{ fontSize: 13, lineHeight: 1.5, color: isOwner ? 'white' : 'rgba(255,255,255,0.85)' }}>{msg.content}</p>
                                                )}
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 4, marginTop: 4, opacity: 0.45 }}>
                                                    <span style={{ fontSize: 9 }}>{formatTime(msg.createdAt)}</span>
                                                    {isOwner && <CheckCheck size={11} />}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={chatEndRef} />
                            </div>

                            {/* Input bar */}
                            <form
                                onSubmit={handleSendMessage}
                                style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.015)', display: 'flex', gap: 10, flexShrink: 0 }}
                            >
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={e => setInputValue(e.target.value)}
                                    placeholder="Type a message…"
                                    style={{
                                        flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: 14, padding: '12px 18px', fontSize: 13, color: 'white', outline: 'none',
                                        transition: 'border-color 0.2s',
                                    }}
                                    onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.4)'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                                />
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim()}
                                    style={{
                                        width: 46, height: 46, borderRadius: 13, border: 'none', cursor: 'pointer',
                                        background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
                                        opacity: inputValue.trim() ? 1 : 0.4,
                                        transition: 'all 0.2s', flexShrink: 0,
                                    }}
                                    onMouseEnter={e => { if (inputValue.trim()) e.currentTarget.style.transform = 'scale(1.06)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                                >
                                    <Send size={17} color="white" />
                                </button>
                            </form>
                        </>
                    ) : (
                        /* Empty state */
                        <div className="grid-bg" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 40 }}>
                            <div style={{ width: 72, height: 72, border: '1px solid rgba(99,102,241,0.2)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(99,102,241,0.06)' }}>
                                <Zap size={30} color="#6366f1" />
                            </div>
                            <p className="syne" style={{ fontSize: 20, fontWeight: 700, color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>Select a session</p>
                            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', maxWidth: 320, textAlign: 'center', lineHeight: 1.7 }}>
                                Incoming print requests and customer messages appear here in real-time.
                            </p>

                            {sessions.length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 320, marginTop: 12 }}>
                                    {sessions.slice(0, 3).map(s => (
                                        <div
                                            key={s.id}
                                            onClick={() => setActiveSession(s)}
                                            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, cursor: 'pointer', transition: 'background 0.15s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.08)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                        >
                                            <Avatar name={s.customerName || s.sessionCode} size={28} />
                                            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{(s.customerName && s.customerName !== 'Customer') ? s.customerName : s.sessionCode}</span>
                                            {s.unreadCountForOwner > 0 && (
                                                <span style={{ marginLeft: 'auto', background: '#6366f1', color: 'white', fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 99 }}>{s.unreadCountForOwner}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}