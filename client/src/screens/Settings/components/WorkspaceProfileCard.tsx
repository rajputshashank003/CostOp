import React from "react";
import { Building2 } from "lucide-react";

interface WorkspaceProfileCardProps {
    teamName: string;
    setTeamName: (v: string) => void;
}

const WorkspaceProfileCard = ({ teamName, setTeamName }: WorkspaceProfileCardProps) => {
    return (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-6">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                    <Building2 size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-extrabold text-slate-900 leading-none mb-1">Workspace Profile</h3>
                    <p className="text-[13px] font-medium text-slate-500">Update your company's core identity</p>
                </div>
            </div>
            <div className="p-6">
                <label className="text-[13px] font-bold text-slate-700 uppercase tracking-widest pl-1 mb-2 block">
                    Organization Name
                </label>
                <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full max-w-md px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none text-[15px] font-bold text-slate-800 focus:border-emerald-500 focus:bg-white transition-all"
                />
            </div>
        </div>
    );
};

export default WorkspaceProfileCard;
