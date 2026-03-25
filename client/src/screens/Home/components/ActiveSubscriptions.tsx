import { Search, SlidersHorizontal, X, CalendarRange, Users } from "lucide-react";
import map from "lodash/map";
import size from "lodash/size";
import { AnimatePresence, motion } from "framer-motion";
import SubscriptionCard from "./SubscriptionCard";
import TimeframeDropdown from "../../../components/TimeframeDropdown/TimeframeDropdown";
import MonthPicker from "../../../components/MonthPicker/MonthPicker";
import { useContext, useEffect, useState } from "react";
import HomeContext from "../context";
import { teamsApi } from "../../../utils/api_request/teams";

interface Props {
    localSearch: string;
    setLocalSearch: (val: string) => void;
    availableCategories: any[];
    onSetArchive: (sub: any) => void;
}

export default function ActiveSubscriptions({ localSearch, setLocalSearch, availableCategories, onSetArchive }: Props) {
    const {
        subscriptions, filterCategory, setFilterCategory, filterCycle, setFilterCycle,
        dateStart, setDateStart, dateEnd, setDateEnd,
        filterTeam, setFilterTeam
    } = useContext(HomeContext);

    const [availableTeams, setAvailableTeams] = useState<any[]>([{ value: "all", label: "All Teams" }]);

    useEffect(() => {
        teamsApi.get_all().then((res: any) => {
            const mapped = map((res || []), (t: any) => ({ value: String(t.id), label: t.name }));
            setAvailableTeams([{ value: "all", label: "All Teams" }, ...mapped]);
        }).catch(console.error);
    }, []);

    const hasActiveFilters = localSearch || filterCategory !== "All Categories" || filterCycle !== "All Cycles" || dateStart || dateEnd || (filterTeam && filterTeam !== "all");

    const clearFilters = () => {
        setLocalSearch("");
        setFilterCategory("All Categories");
        setFilterCycle("All Cycles");
        setFilterTeam("all");
        setDateStart("");
        setDateEnd("");
    };

    return (
        <div>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 gap-4">
                <h3 className="text-lg whitespace-nowrap font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    Active Subscriptions
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-xs font-semibold">{size(subscriptions)}</span>
                </h3>

                {/* Search, Category, Cycle, Team filters */}
                <div className="flex flex-col xl:flex-row items-start xl:items-center gap-3 w-full xl:w-auto mt-2 md:mt-0">
                    <div className="relative w-full xl:w-[220px]">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search subscriptions..."
                            value={localSearch}
                            onChange={(e) => setLocalSearch(e.target.value)}
                            className="w-full bg-white border border-slate-200 text-slate-700 text-[12px] font-bold rounded-lg pl-8 pr-3 py-1.5 outline-none hover:border-emerald-300 focus:ring-2 focus:ring-emerald-100 transition-all shadow-sm placeholder:text-slate-400 placeholder:font-medium"
                        />
                    </div>

                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full xl:w-auto">
                        <div className="w-full sm:w-auto">
                            <TimeframeDropdown
                                value={filterCategory}
                                onChange={(v) => setFilterCategory(v as string)}
                                options={availableCategories}
                            />
                        </div>
                        <div className="w-full sm:w-auto">
                            <TimeframeDropdown
                                value={filterCycle}
                                onChange={(v) => setFilterCycle(v as string)}
                                options={[
                                    { value: "All Cycles", label: "All Cycles" },
                                    { value: "Monthly", label: "Monthly" },
                                    { value: "Yearly", label: "Yearly" }
                                ]}
                                align="left"
                            />
                        </div>
                        <div className="col-span-2 sm:col-span-1 w-full sm:w-auto">
                            <TimeframeDropdown
                                value={filterTeam || "all"}
                                onChange={(v) => setFilterTeam(v as string)}
                                options={availableTeams}
                                align="left"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Date Range filter row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-6 w-full">
                <span className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 mb-1 sm:mb-0">
                    <CalendarRange size={13} />
                    Billing date
                </span>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="flex-1 sm:flex-none sm:w-[130px]">
                        <MonthPicker value={dateStart} onChange={setDateStart} placeholder="From" maxDate={dateEnd} />
                    </div>
                    <span className="text-slate-400 font-extrabold text-[10px] uppercase">→</span>
                    <div className="flex-1 sm:flex-none sm:w-[130px]">
                        <MonthPicker value={dateEnd} onChange={setDateEnd} placeholder="To" minDate={dateStart} align="right" />
                    </div>
                    {(dateStart || dateEnd) && (
                        <button
                            onClick={() => { setDateStart(""); setDateEnd(""); }}
                            className="p-1.5 bg-slate-100 rounded-md text-slate-500 hover:bg-rose-100 hover:text-rose-600 transition-colors"
                            title="Clear dates"
                        >
                            <X size={13} className="stroke-[3]" />
                        </button>
                    )}
                </div>
            </div>

            {size(subscriptions) === 0 && hasActiveFilters ? (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center gap-4 py-16 px-6 bg-white border border-dashed border-slate-200 rounded-2xl text-center"
                >
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                        <SlidersHorizontal size={22} />
                    </div>
                    <div>
                        <p className="text-slate-800 font-bold text-[15px]">No results match your filters</p>
                        <p className="text-slate-500 text-sm mt-1 font-medium flex flex-wrap gap-1 justify-center">
                            {filterCategory !== "All Categories" && (
                                <span className="inline-flex items-center bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-xs font-semibold">{filterCategory}</span>
                            )}
                            {filterCycle !== "All Cycles" && (
                                <span className="inline-flex items-center bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-xs font-semibold">{filterCycle}</span>
                            )}
                            {localSearch && (
                                <span className="inline-flex items-center bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-xs font-semibold">"{localSearch}"</span>
                            )}
                            {(dateStart || dateEnd) && (
                                <span className="inline-flex items-center bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-xs font-semibold">
                                    {dateStart || "…"} → {dateEnd || "…"}
                                </span>
                            )}
                        </p>
                    </div>
                    <button
                        onClick={clearFilters}
                        className="flex items-center gap-1.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg transition-colors shadow-sm"
                    >
                        <X size={14} />
                        Clear filters
                    </button>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
                    <AnimatePresence>
                        {map(subscriptions, (sub: any) => (
                            <SubscriptionCard key={sub.id} sub={sub} onArchiveClick={() => onSetArchive(sub)} clickable />
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
