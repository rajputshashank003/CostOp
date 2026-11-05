import { useState } from 'react';
import { Bell, ExternalLink, Send, CheckCircle2, Sparkles } from 'lucide-react';
import { organizationApi } from '../../../utils/api_request/organization';
import toast from 'react-hot-toast';
import UpgradeModal from '../../../components/UpgradeModal/UpgradeModal';

interface Props {
    isPro: boolean;
    webhookUrl: string;
    setWebhookUrl: (url: string) => void;
}

export default function SlackIntegrationCard({ isPro, webhookUrl, setWebhookUrl }: Props) {
    const [isTesting, setIsTesting] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    const handleTestNotification = async () => {
        if (!webhookUrl) {
            toast.error('Please enter a Slack Webhook URL first.');
            return;
        }
        setIsTesting(true);
        try {
            await organizationApi.test_slack(webhookUrl);
            toast.success('Test alert sent to your Slack channel! Check Slack.');
        } catch (err: any) {
            toast.error(err?.response?.data?.error || 'Failed to send test alert. Please verify your Webhook URL.');
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm p-4 sm:p-6 mb-8">
            <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                        <Bell size={20} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-bold text-slate-900">Slack Webhook Notifications</h2>
                            {!isPro && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[10px] font-black uppercase tracking-wider">
                                    <Sparkles size={10} /> PRO
                                </span>
                            )}
                        </div>
                        <p className="text-[13px] text-slate-500 font-medium">
                            Send real-time software renewal and expiration warnings to your Slack channels
                        </p>
                    </div>
                </div>

                <a
                    href="https://api.slack.com/messaging/webhooks"
                    target="_blank"
                    rel="noreferrer"
                    className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-600 font-semibold transition-colors"
                >
                    <span>Slack Webhook Docs</span>
                    <ExternalLink size={12} />
                </a>
            </div>

            {!isPro ? (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50/30 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-900">Automate Renewals in Slack</h4>
                        <p className="text-xs text-slate-600 max-w-lg">
                            Upgrade to CostOp Pro to connect your company Slack channels. Receive renewal reminders 7, 2, and 1 day before auto-pay executes.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowUpgradeModal(true)}
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                        <Sparkles size={14} /> Upgrade to Pro
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    <div>
                        <label htmlFor="slack-webhook-url" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                            Incoming Webhook URL
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <input
                                id="slack-webhook-url"
                                type="url"
                                placeholder="https://hooks.slack.com/services/T.../B.../..."
                                value={webhookUrl}
                                onChange={(e) => setWebhookUrl(e.target.value)}
                                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-medium text-slate-700 text-sm"
                            />
                            <button
                                type="button"
                                onClick={handleTestNotification}
                                disabled={isTesting || !webhookUrl}
                                className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                                {isTesting ? (
                                    <span className="w-4 h-4 border-2 border-slate-400 border-t-slate-700 rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Send size={14} />
                                        <span>Test Connection</span>
                                    </>
                                )}
                            </button>
                        </div>
                        <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                            <CheckCircle2 size={12} className="text-emerald-500" />
                            <span>Renewal alerts will automatically trigger to this channel when alerts fire.</span>
                        </p>
                    </div>
                </div>
            )}

            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
            />
        </div>
    );
}
