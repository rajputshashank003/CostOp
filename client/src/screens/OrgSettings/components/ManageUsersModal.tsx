import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminOrgsApi, AdminOrgItem } from '../../../utils/api_request/adminUsers';
import OrgDetailModal from './OrgDetailModal';
import { 
    Building2, 
    Search, 
    X, 
    RefreshCw, 
    Crown, 
    Shield, 
    ChevronLeft, 
    ChevronRight, 
    Sparkles, 
    Users, 
    ArrowRight,
    CheckCircle2,
    Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ManageUsersModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ManageUsersModal({ isOpen, onClose }: ManageUsersModalProps) {
    const [organizations, setOrganizations] = useState<AdminOrgItem[]>([]);
    const [pagination, setPagination] = useState<{ page: number; limit: number; total: number; total_pages: number } | null>(null);
    const [page, setPage] = useState<number>(1);
    const [limit] = useState<number>(10);
    const [search, setSearch] = useState<string>('');
    const [searchInput, setSearchInput] = useState<string>('');
    const [planFilter, setPlanFilter] = useState<'all' | 'pro' | 'free'>('all');
    
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isError, setIsError] = useState<boolean>(false);
    const [togglingOrgId, setTogglingOrgId] = useState<number | null>(null);
    
    // Organization selected for detail modal & member list
    const [selectedOrg, setSelectedOrg] = useState<AdminOrgItem | null>(null);

    // Responsive screen detection
    const [isMobile, setIsMobile] = useState<boolean>(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Esc key listener to close modal
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !selectedOrg) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, selectedOrg, onClose]);

    // Debounced search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput.trim());
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

    // Fetch organizations from paginated API
    const fetchOrganizations = useCallback(async (currentPage: number, currentSearch: string, currentPlan: string) => {
        setIsLoading(true);
        setIsError(false);
        try {
            const data = await adminOrgsApi.get_organizations({
                page: currentPage,
                limit,
                search: currentSearch,
                plan: currentPlan,
            });
            setOrganizations(data.organizations || []);
            setPagination(data.pagination || null);
        } catch (err: any) {
            console.error('Failed to load organizations:', err);
            setIsError(true);
            toast.error(err?.response?.data?.error || 'Failed to load workspaces');
        } finally {
            setIsLoading(false);
        }
    }, [limit]);

    useEffect(() => {
        if (isOpen) {
            fetchOrganizations(page, search, planFilter);
        }
    }, [isOpen, page, search, planFilter, fetchOrganizations]);

    // Handle Pro access toggle at Organization level
    const handleTogglePro = async (orgId: number, currentIsPro: boolean) => {
        setTogglingOrgId(orgId);
        try {
            const res = await adminOrgsApi.toggle_pro(orgId, !currentIsPro);
            toast.success(res.message || (res.is_pro ? 'Pro access granted to organization!' : 'Pro access revoked from organization!'));

            // Optimistically update organization in state
            setOrganizations((prev) =>
                prev.map((o) =>
                    o.id === orgId
                        ? { ...o, is_pro: res.is_pro, plan: res.plan, member_limit: res.is_pro ? 100 : 30 }
                        : o
                )
            );

            // Also update selectedOrg if modal is open
            setSelectedOrg((prev) =>
                prev && prev.id === orgId
                    ? { ...prev, is_pro: res.is_pro, plan: res.plan, member_limit: res.is_pro ? 100 : 30 }
                    : prev
            );
        } catch (err: any) {
            console.error('Failed to toggle organization pro access:', err);
            toast.error(err?.response?.data?.error || 'Failed to update Pro access');
        } finally {
            setTogglingOrgId(null);
        }
    };

    const formatDateShort = (dateStr?: string) => {
        if (!dateStr) return '—';
        try {
            return new Date(dateStr).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            });
        } catch {
            return dateStr;
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 overflow-hidden">
                    {/* Backdrop */}
                    <motion.div
                        key="manage-users-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.24 }}
                        className="fixed inset-0 bg-slate-950/65 backdrop-blur-md"
                        onClick={onClose}
                    />

                    {/* Modal Box - Slides in from bottom on open, slides out to bottom on close */}
                    <motion.div
                        key="manage-users-modal-box"
                        initial={{ y: '100%', opacity: 0.6 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: '100%', opacity: 0.4 }}
                        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                        className="relative z-10 w-full max-w-6xl h-[88vh] min-h-[85vh] max-h-[92vh] sm:h-[86vh] sm:min-h-[80vh] sm:max-h-[90vh] bg-white rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                {/* Mobile drag handle indicator */}
                <div className="sm:hidden pt-2.5 pb-0.5 flex justify-center bg-gradient-to-b from-slate-50 to-white">
                    <div className="w-10 h-1 bg-slate-200 rounded-full" />
                </div>

                {/* Modal Header - Mobile Single-Row Optimized */}
                <div className="px-4 sm:px-8 pt-2 sm:pt-5 pb-3 sm:pb-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-emerald-50/20">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 shadow-xs">
                                <Building2 size={18} className="sm:hidden" />
                                <Building2 size={20} className="hidden sm:block" />
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight leading-tight">
                                        Manage Workspaces & Users
                                    </h2>
                                    {pagination && (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200/80 whitespace-nowrap">
                                            {pagination.total} {pagination.total === 1 ? 'workspace' : 'workspaces'}
                                        </span>
                                    )}
                                </div>
                                <p className="text-[11px] sm:text-xs text-slate-500 font-semibold mt-0.5 hidden sm:block">
                                    Select an organization to view its team members and grant or revoke workspace Pro tier access
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                            <button
                                type="button"
                                onClick={() => fetchOrganizations(page, search, planFilter)}
                                disabled={isLoading}
                                className="p-2 sm:p-2.5 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                                title="Refresh list"
                            >
                                <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="p-2 sm:p-2.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                                title="Close modal"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="px-4 sm:px-8 py-2.5 sm:py-4 bg-white border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
                    {/* Search Input */}
                    <div className="relative flex-1 max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <Search size={15} />
                        </div>
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search by workspace, owner, or email..."
                            className="w-full pl-9 pr-8 py-2 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold text-xs sm:text-sm placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        />
                        {searchInput && (
                            <button
                                type="button"
                                onClick={() => setSearchInput('')}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                                <X size={13} />
                            </button>
                        )}
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center gap-1 p-1 bg-slate-100/80 rounded-xl self-stretch sm:self-auto justify-between sm:justify-start">
                        <button
                            type="button"
                            onClick={() => {
                                setPlanFilter('all');
                                setPage(1);
                            }}
                            className={`flex-1 sm:flex-none text-center px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                                planFilter === 'all'
                                    ? 'bg-white text-slate-900 shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            All Workspaces
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setPlanFilter('pro');
                                setPage(1);
                            }}
                            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                                planFilter === 'pro'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'text-slate-600 hover:text-emerald-700'
                            }`}
                        >
                            <Crown size={12} />
                            <span>Pro Only</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setPlanFilter('free');
                                setPage(1);
                            }}
                            className={`flex-1 sm:flex-none text-center px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                                planFilter === 'free'
                                    ? 'bg-white text-slate-900 shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Free Tier
                        </button>
                    </div>
                </div>

                {/* Table or Cards Body */}
                <div className="flex-1 overflow-y-auto min-h-[320px]">
                    {isLoading ? (
                        <div className="p-4 sm:p-6 space-y-3">
                            {[1, 2, 3, 4, 5, 6, 7].map((idx) => (
                                <div
                                    key={idx}
                                    className="h-16 bg-slate-100/70 rounded-2xl animate-pulse flex items-center px-4 gap-4"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-slate-200" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 w-40 bg-slate-200 rounded" />
                                        <div className="h-3 w-60 bg-slate-200 rounded" />
                                    </div>
                                    <div className="w-20 h-6 bg-slate-200 rounded-full" />
                                </div>
                            ))}
                        </div>
                    ) : isError ? (
                        <div className="p-12 text-center">
                            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
                                <Shield size={24} />
                            </div>
                            <h3 className="text-base font-black text-slate-900">Failed to load organizations</h3>
                            <p className="text-xs text-slate-500 font-medium mt-1 mb-4">
                                Check database connectivity or your network connection.
                            </p>
                            <button
                                type="button"
                                onClick={() => fetchOrganizations(page, search, planFilter)}
                                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-extrabold hover:bg-emerald-700 transition-colors cursor-pointer"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : organizations.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                                <Building2 size={22} />
                            </div>
                            <h3 className="text-base font-black text-slate-900">No organizations found</h3>
                            <p className="text-xs text-slate-500 font-medium mt-1">
                                {search ? `No organizations matching "${search}".` : 'No organizations match this filter.'}
                            </p>
                            {(search || planFilter !== 'all') && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchInput('');
                                        setPlanFilter('all');
                                    }}
                                    className="mt-4 px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                                >
                                    Clear all filters
                                </button>
                            )}
                        </div>
                    ) : isMobile ? (
                        /* Mobile Responsive Card List */
                        <div className="p-4 space-y-3">
                            {organizations.map((org) => {
                                const initial = (org.name?.trim()?.[0] || 'O').toUpperCase();
                                return (
                                    <div
                                        key={org.id}
                                        onClick={() => setSelectedOrg(org)}
                                        className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs hover:border-emerald-300 transition-all cursor-pointer flex flex-col gap-3"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-bold flex items-center justify-center flex-shrink-0 text-sm shadow-2xs">
                                                    {initial}
                                                </div>
                                                <div className="min-w-0">
                                                    <span className="text-sm font-extrabold text-slate-900 truncate block">
                                                        {org.name}
                                                    </span>
                                                    <span className="text-xs text-slate-500 font-medium block truncate">
                                                        Owner: {org.owner_name} ({org.owner_email || 'No email'})
                                                    </span>
                                                </div>
                                            </div>

                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex-shrink-0 ${
                                                org.is_pro
                                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                                    : 'bg-slate-100 text-slate-600'
                                            }`}>
                                                {org.is_pro ? 'PRO' : 'FREE'}
                                            </span>
                                        </div>

                                        {/* Chips */}
                                        <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-100 font-semibold text-slate-500">
                                            <div className="truncate flex items-center gap-1.5">
                                                <Users size={12} className="text-emerald-600" />
                                                <span>{org.member_count} {org.member_count === 1 ? 'member' : 'members'}</span>
                                            </div>
                                            <div className="text-right text-slate-400 text-[10px]">
                                                Created {formatDateShort(org.created_at)}
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <div className="flex items-center justify-between pt-1">
                                            <span className="text-[11px] font-bold text-emerald-600 inline-flex items-center gap-1">
                                                View Users ({org.member_count}) <ArrowRight size={12} />
                                            </span>

                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleTogglePro(org.id, org.is_pro);
                                                }}
                                                disabled={togglingOrgId === org.id}
                                                className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                                                    org.is_pro
                                                        ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                                                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                                }`}
                                            >
                                                {togglingOrgId === org.id
                                                    ? 'Updating...'
                                                    : org.is_pro
                                                    ? 'Revoke Pro'
                                                    : '+ Give Pro'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* Desktop & Tablet Table Layout */
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-black uppercase tracking-wider text-slate-400 select-none">
                                        <th className="py-3.5 px-6">Workspace Organization</th>
                                        <th className="py-3.5 px-4">Owner</th>
                                        <th className="py-3.5 px-4">Plan Status</th>
                                        <th className="py-3.5 px-4">Active Members</th>
                                        <th className="py-3.5 px-4">Created</th>
                                        <th className="py-3.5 px-6 text-right">Pro Management</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                                    {organizations.map((org) => {
                                        const initial = (org.name?.trim()?.[0] || 'O').toUpperCase();
                                        return (
                                            <tr
                                                key={org.id}
                                                onClick={() => setSelectedOrg(org)}
                                                className="hover:bg-emerald-50/30 transition-colors cursor-pointer group"
                                            >
                                                {/* Workspace Name & ID */}
                                                <td className="py-3.5 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-bold flex items-center justify-center flex-shrink-0 text-xs shadow-2xs">
                                                            {initial}
                                                        </div>
                                                        <div>
                                                            <span className="font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors block text-sm">
                                                                {org.name}
                                                            </span>
                                                            <span className="text-[11px] text-slate-400 font-mono">
                                                                Org ID: #{org.id}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Owner */}
                                                <td className="py-3.5 px-4">
                                                    <div className="font-semibold text-slate-800">
                                                        {org.owner_name}
                                                    </div>
                                                    <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                                                        {org.owner_email || '—'}
                                                    </div>
                                                </td>

                                                {/* Plan Status Badge */}
                                                <td className="py-3.5 px-4">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                                                        org.is_pro
                                                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs'
                                                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                                                    }`}>
                                                        {org.is_pro ? (
                                                            <>
                                                                <Crown size={11} /> PRO (100 SEATS)
                                                            </>
                                                        ) : (
                                                            'FREE (30 SEATS)'
                                                        )}
                                                    </span>
                                                </td>

                                                {/* Active Members */}
                                                <td className="py-3.5 px-4">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs">
                                                        <Users size={12} className="text-emerald-600" />
                                                        {org.member_count} {org.member_count === 1 ? 'user' : 'users'}
                                                    </span>
                                                </td>

                                                {/* Created Date */}
                                                <td className="py-3.5 px-4 text-slate-500">
                                                    {formatDateShort(org.created_at)}
                                                </td>

                                                {/* Quick Actions */}
                                                <td className="py-3.5 px-6 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleTogglePro(org.id, org.is_pro);
                                                        }}
                                                        disabled={togglingOrgId === org.id}
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-2xs ${
                                                            org.is_pro
                                                                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                                                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                                                        }`}
                                                    >
                                                        {togglingOrgId === org.id ? (
                                                            <>
                                                                <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                                <span>...</span>
                                                            </>
                                                        ) : org.is_pro ? (
                                                            'Revoke Pro'
                                                        ) : (
                                                            <>
                                                                <Sparkles size={12} />
                                                                <span>Give Pro</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pagination Footer - Optimized for Mobile & Desktop */}
                <div className="px-3.5 sm:px-8 py-2.5 sm:py-3.5 border-t border-slate-100 bg-slate-50/95 flex items-center justify-between gap-2 flex-shrink-0">
                    {pagination && pagination.total_pages > 1 ? (
                        <>
                            {/* Prev Button */}
                            <button
                                type="button"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={pagination.page <= 1 || isLoading}
                                className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-extrabold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer shadow-2xs active:scale-95 min-w-[70px]"
                            >
                                <ChevronLeft size={14} />
                                <span>Prev</span>
                            </button>

                            {/* Center: Page Number & Range */}
                            <div className="flex flex-col items-center justify-center text-center px-1">
                                <span className="text-xs font-black text-slate-800 whitespace-nowrap">
                                    Page {pagination.page} of {pagination.total_pages}
                                </span>
                                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 whitespace-nowrap mt-0.5">
                                    {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} workspaces
                                </span>
                            </div>

                            {/* Next Button */}
                            <button
                                type="button"
                                onClick={() => setPage((p) => Math.min(pagination.total_pages, p + 1))}
                                disabled={pagination.page >= pagination.total_pages || isLoading}
                                className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-extrabold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer shadow-2xs active:scale-95 min-w-[70px]"
                            >
                                <span>Next</span>
                                <ChevronRight size={14} />
                            </button>
                        </>
                    ) : pagination ? (
                        <div className="w-full text-center py-1">
                            <span className="text-[11px] font-semibold text-slate-400">
                                Showing all {pagination.total} {pagination.total === 1 ? 'workspace' : 'workspaces'}
                            </span>
                        </div>
                    ) : (
                        <div className="w-full text-center py-1 flex items-center justify-center">
                            <div className="h-4 w-32 bg-slate-200/80 rounded animate-pulse" />
                        </div>
                    )}
                </div>
                    </motion.div>
                </div>
            )}

            {/* Individual Organization Detail Modal & Members List */}
            <OrgDetailModal
                key="org-detail-modal"
                org={selectedOrg}
                isOpen={!!selectedOrg}
                onClose={() => setSelectedOrg(null)}
                onTogglePro={handleTogglePro}
                isToggling={togglingOrgId === selectedOrg?.id}
            />
        </AnimatePresence>
    );
}
