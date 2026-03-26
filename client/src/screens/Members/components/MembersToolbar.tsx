import { Search } from "lucide-react";
import { useContext } from "react";
import MembersContext from "../context";
import TimeframeDropdown from "../../../components/TimeframeDropdown/TimeframeDropdown";

export default function MembersToolbar() {
    const {
        teams, selectedTeamId, setSelectedTeamId,
        searchQuery, setSearchQuery,
        subscriptionFilter, setSubscriptionFilter
    } = useContext(MembersContext);

    // Format teams for dropdown — always show "All Teams" first
    const availableTeams = [
        { value: "all", label: "All Teams" },
        ...teams.map((t: any) => ({ value: String(t.id), label: t.name }))
    ];

    return (
        <div className="flex flex-col gap-3 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="relative w-full xl:w-[280px]">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search members, designation..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-slate-200 text-slate-700 text-[12px] font-bold rounded-lg pl-8 pr-3 py-1.5 outline-none hover:border-emerald-300 focus:ring-2 focus:ring-emerald-100 transition-all shadow-sm placeholder:text-slate-400 placeholder:font-medium"
                    />
                </div>

                <div className="grid grid-cols-2 md:flex md:flex-wrap items-center gap-2 w-full lg:w-auto">
                    <div className="w-full md:w-auto">
                        <TimeframeDropdown
                            value={selectedTeamId === null ? "all" : String(selectedTeamId)}
                            onChange={(v) => setSelectedTeamId(v === "all" ? null : Number(v))}
                            options={availableTeams}
                            align="left"
                        />
                    </div>
                    <div className="w-full md:w-auto">
                        <TimeframeDropdown
                            value={subscriptionFilter}
                            onChange={(v) => setSubscriptionFilter(v as string)}
                            options={[
                                { value: "all", label: "All Members" },
                                { value: "has", label: "Has Subscription" },
                                { value: "without", label: "Without Subscription" }
                            ]}
                            align="left"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
