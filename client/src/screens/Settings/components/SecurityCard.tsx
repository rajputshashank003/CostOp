import React from "react";
import { Shield, Users } from "lucide-react";

interface SecurityCardProps {
    allowInvites: boolean;
    setAllowInvites: (v: boolean) => void;
}

const SecurityCard = ({ allowInvites, setAllowInvites }: SecurityCardProps) => {
    return (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-8">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                    <Shield size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-extrabold text-slate-900 leading-none mb-1">Security &amp; Privileges</h3>
                    <p className="text-[13px] font-medium text-slate-500">Control who can perform administrative actions</p>
                </div>
            </div>
            <div className="p-6 flex items-start sm:items-center justify-between gap-6 flex-col sm:flex-row">
                <div className="flex gap-4">
                    <div className="mt-1 w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0 text-slate-400">
                        <Users size={18} />
                    </div>
                    <div>
                        <h4 className="text-[15px] font-bold text-slate-800 mb-1">Allow Member Invitations</h4>
                        <p className="text-[13px] text-slate-500 font-medium leading-relaxed max-w-lg">
                            When enabled, any active member can invite coworkers to this workspace. If disabled, only <span className="font-bold text-indigo-600">Owners</span> can send invites.
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => setAllowInvites(!allowInvites)}
                    className={`w-14 h-8 rounded-full transition-colors relative flex-shrink-0 cursor-pointer shadow-inner ${allowInvites ? 'bg-emerald-500' : 'bg-slate-300'}`}
                >
                    <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full shadow-md transition-transform duration-300 ${allowInvites ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
            </div>
        </div>
    );
};

export default SecurityCard;
