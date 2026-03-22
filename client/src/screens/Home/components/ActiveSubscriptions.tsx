import { Search } from "lucide-react";
import map from "lodash/map";
import size from "lodash/size";
import { AnimatePresence } from "framer-motion";
import SubscriptionCard from "./SubscriptionCard";
import TimeframeDropdown from "../../../components/TimeframeDropdown/TimeframeDropdown";
import { useContext } from "react";
import HomeContext from "../context";

interface Props {
    localSearch: string;
    setLocalSearch: (val: string) => void;
    availableCategories: any[];
    onSetDelete: (sub: any) => void;
}

export default function ActiveSubscriptions({ localSearch, setLocalSearch, availableCategories, onSetDelete }: Props) {
    const { subscriptions, filterCategory, setFilterCategory, filterCycle, setFilterCycle } = useContext(HomeContext);

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    Active Subscriptions
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-xs font-semibold">{size(subscriptions)}</span>
                </h3>

                {/* Backend-Driven Unified Filters */}
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 w-full md:w-auto">
                    <div className="relative w-full sm:w-[200px]">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search subscriptions..."
                            value={localSearch}
                            onChange={(e) => setLocalSearch(e.target.value)}
                            className="w-full bg-white border border-slate-200 text-slate-700 text-[12px] font-bold rounded-lg pl-8 pr-3 py-1.5 outline-none hover:border-emerald-300 focus:ring-2 focus:ring-emerald-100 transition-all shadow-sm placeholder:text-slate-400 placeholder:font-medium"
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <TimeframeDropdown
                            value={filterCategory}
                            onChange={(v) => setFilterCategory(v as string)}
                            options={availableCategories}
                        />
                        <TimeframeDropdown
                            value={filterCycle}
                            onChange={(v) => setFilterCycle(v as string)}
                            options={[
                                { value: "All Cycles", label: "All Cycles" },
                                { value: "Monthly", label: "Monthly" },
                                { value: "Yearly", label: "Yearly" }
                            ]}
                            align="right"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
                <AnimatePresence>
                    {map(subscriptions, (sub: any) => (
                        <SubscriptionCard key={sub.id} sub={sub} onDeleteClick={() => onSetDelete(sub)} />
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
