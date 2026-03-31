import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, X, Check, CheckCheck, Trash2, AlertCircle, Clock, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { notificationsApi } from '../../utils/api_request/notifications';
import toast from 'react-hot-toast';

interface Notification {
    id: number;
    title: string;
    message: string;
    source: 'alert_triggered' | 'expiring_tomorrow' | 'custom_alert';
    is_read: boolean;
    created_at: string;
    subscription_id?: number | null;
}

function timeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

function sourceIcon(source: string) {
    switch (source) {
        case 'expiring_tomorrow': return <AlertCircle size={14} className="text-amber-500" />;
        case 'custom_alert': return <Clock size={14} className="text-violet-500" />;
        default: return <Zap size={14} className="text-emerald-500" />;
    }
}

function sourceColor(source: string) {
    switch (source) {
        case 'expiring_tomorrow': return 'border-l-amber-400';
        case 'custom_alert': return 'border-l-violet-400';
        default: return 'border-l-emerald-400';
    }
}

export default function NotificationBell() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const data = await notificationsApi.get_all();
            setNotifications(data.notifications || []);
            setUnreadCount(data.unread_count || 0);
        } catch {
            // silently fail
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        // Poll every 60 seconds
        const interval = setInterval(fetchNotifications, 60_000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkRead = async (id: number) => {
        await notificationsApi.mark_read(id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const handleMarkAllRead = async () => {
        await notificationsApi.mark_all_read();
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
    };

    const handleDelete = async (id: number, wasUnread: boolean) => {
        await notificationsApi.delete(id);
        setNotifications(prev => prev.filter(n => n.id !== id));
        if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1));
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => {
                    setOpen(v => !v);
                    if (!open) fetchNotifications();
                }}
                className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors duration-200 group"
                aria-label="Notifications"
            >
                <Bell
                    size={20}
                    className={`transition-colors duration-200 ${unreadCount > 0 ? 'text-emerald-600' : 'text-slate-500 group-hover:text-slate-700'}`}
                />
                <AnimatePresence>
                    {unreadCount > 0 && (
                        <motion.span
                            key="badge"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm"
                        >
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </motion.span>
                    )}
                </AnimatePresence>
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        key="notif-dropdown"
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="fixed sm:absolute sm:right-0 inset-x-2 sm:inset-x-auto top-[76px] sm:top-full sm:mt-2 sm:w-[380px] bg-white rounded-2xl shadow-2xl border border-slate-100 z-[200] overflow-hidden flex flex-col max-h-[calc(100vh-90px)]"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 shrink-0">
                            <div className="flex items-center gap-2">
                                <Bell size={16} className="text-emerald-600" />
                                <span className="font-semibold text-slate-800 text-sm">Notifications</span>
                                {unreadCount > 0 && (
                                    <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                                        {unreadCount} new
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-1">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllRead}
                                        className="flex items-center gap-1 text-xs text-slate-500 hover:text-emerald-600 transition-colors px-2 py-1 rounded-lg hover:bg-emerald-50"
                                    >
                                        <CheckCheck size={13} />
                                        Mark all read
                                    </button>
                                )}
                                <button
                                    onClick={() => setOpen(false)}
                                    className="p-1 rounded-lg hover:bg-slate-100 transition-colors text-slate-400"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Notification List */}
                        <div className="flex-1 overflow-y-auto min-h-[100px] sm:max-h-[420px]">
                            {loading && notifications.length === 0 ? (
                                <div className="py-12 text-center text-slate-400 text-sm">Loading…</div>
                            ) : notifications.length === 0 ? (
                                <div className="py-12 text-center">
                                    <Bell size={32} className="mx-auto text-slate-200 mb-3" />
                                    <p className="text-slate-400 text-sm">No notifications yet</p>
                                </div>
                            ) : (
                                <ul className="divide-y divide-slate-50">
                                    {notifications.map(notif => (
                                        <motion.li
                                            key={notif.id}
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className={`group flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors border-l-[3px] ${sourceColor(notif.source)} ${!notif.is_read ? 'bg-emerald-50/30' : 'bg-white'}`}
                                        >
                                            <div className="mt-0.5 shrink-0">{sourceIcon(notif.source)}</div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm leading-snug truncate ${!notif.is_read ? 'font-semibold text-slate-800' : 'font-normal text-slate-600'}`}>
                                                    {notif.title}
                                                </p>
                                                <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{notif.message}</p>
                                                <p className="text-[10px] text-slate-300 mt-1">{timeAgo(notif.created_at)}</p>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {!notif.is_read && (
                                                    <button
                                                        onClick={() => handleMarkRead(notif.id)}
                                                        className="p-1 rounded-lg hover:bg-emerald-100 text-slate-400 hover:text-emerald-600 transition-colors"
                                                        title="Mark as read"
                                                    >
                                                        <Check size={13} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(notif.id, !notif.is_read)}
                                                    className="p-1 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </motion.li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/60 text-xs text-slate-400 text-center">
                                {notifications.length} total notification{notifications.length !== 1 ? 's' : ''}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
