import { useState, useRef, useEffect } from 'react';
import { Download, FileText, Table, Sparkles, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { reportsApi } from '../../utils/api_request/reports';
import { generateExecutiveReportPdf } from '../../utils/reportPdfGenerator';
import toast from 'react-hot-toast';
import UpgradeModal from '../UpgradeModal/UpgradeModal';

interface Props {
    isPro?: boolean;
    className?: string;
}

export default function ExportReportButton({ isPro = false, className = '' }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [menuPlacement, setMenuPlacement] = useState<'left' | 'right'>('right');
    const dropdownRef = useRef<HTMLDivElement>(null);

    const updatePlacement = () => {
        if (dropdownRef.current) {
            const rect = dropdownRef.current.getBoundingClientRect();
            // If anchoring to the right (extending to the left) would clip off the left viewport edge:
            if (rect.right < 240) {
                setMenuPlacement('left');
            } else if (window.innerWidth - rect.left < 240) {
                setMenuPlacement('right');
            } else {
                // On mobile default to left, on desktop default to right
                setMenuPlacement(window.innerWidth < 640 ? 'left' : 'right');
            }
        }
    };

    const handleToggle = () => {
        if (!isOpen) {
            updatePlacement();
        }
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        const handleResize = () => updatePlacement();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isOpen]);

    const handleAction = async (type: 'csv' | 'pdf') => {
        setIsOpen(false);
        if (!isPro) {
            setShowUpgradeModal(true);
            return;
        }

        setIsDownloading(true);
        try {
            if (type === 'csv') {
                toast.loading('Preparing CSV export...', { id: 'report-export' });
                await reportsApi.download_monthly_csv();
                toast.success('CSV Report downloaded!', { id: 'report-export' });
            } else {
                toast.loading('Generating Executive PDF...', { id: 'report-export' });
                const reportData = await reportsApi.get_monthly_data();
                generateExecutiveReportPdf(reportData);
                toast.success('PDF Report downloaded!', { id: 'report-export' });
            }
        } catch (err: any) {
            console.error('Export error:', err);
            toast.error(err?.response?.data?.error || 'Failed to generate report.', { id: 'report-export' });
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className={`relative inline-block ${className}`} ref={dropdownRef}>
            <motion.button
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={handleToggle}
                disabled={isDownloading}
                className="inline-flex items-center gap-1.5 min-[1200px]:gap-2 px-2.5 sm:px-3 min-[1200px]:px-4 py-1.5 min-[1200px]:py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs min-[1200px]:text-sm font-semibold shadow-xs transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/20 flex-shrink-0"
            >
                {isDownloading ? (
                    <span className="w-3.5 h-3.5 min-[1200px]:w-4 min-[1200px]:h-4 border-2 border-slate-300 border-t-emerald-600 rounded-full animate-spin" />
                ) : (
                    <Download className="w-3.5 h-3.5 min-[1200px]:w-4 min-[1200px]:h-4 text-slate-500" />
                )}
                <span className="hidden min-[1200px]:inline">Export Report</span>
                <span className="hidden sm:inline min-[1200px]:hidden">Export</span>
                <span className="sm:hidden">Report</span>

                {!isPro && (
                    <span className="inline-flex items-center gap-1 px-1 min-[1200px]:px-1.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[9px] min-[1200px]:text-[10px] font-black uppercase tracking-wider shadow-xs">
                        <Sparkles size={9} className="min-[1200px]:w-2.5 min-[1200px]:h-2.5" /> PRO
                    </span>
                )}
                <ChevronDown size={13} className={`text-slate-400 min-[1200px]:w-3.5 min-[1200px]:h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </motion.button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.94, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.94, y: -4 }}
                        transition={{ type: "spring", damping: 25, stiffness: 350, bounce: 0 }}
                        className={`absolute ${
                            menuPlacement === 'left' ? 'left-0 origin-top-left' : 'right-0 origin-top-right'
                        } mt-2 w-56 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-xl py-2 z-50 overflow-hidden max-w-[calc(100vw-24px)]`}
                    >
                        <div className="px-3 py-1.5 border-b border-slate-100 mb-1">
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Executive Reports</p>
                        </div>

                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            onClick={() => handleAction('pdf')}
                            className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors"
                        >
                            <span className="flex items-center gap-2">
                                <FileText size={16} className="text-emerald-600" />
                                <span>Download PDF Report</span>
                            </span>
                            {!isPro && (
                                <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">PRO</span>
                            )}
                        </motion.button>

                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            onClick={() => handleAction('csv')}
                            className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors"
                        >
                            <span className="flex items-center gap-2">
                                <Table size={16} className="text-teal-600" />
                                <span>Download CSV Data</span>
                            </span>
                            {!isPro && (
                                <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">PRO</span>
                            )}
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>

            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
            />
        </div>
    );
}
