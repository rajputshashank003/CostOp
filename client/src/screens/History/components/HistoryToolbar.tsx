import { Search, X, CalendarRange } from "lucide-react";
import size from "lodash/size";
import { useContext } from "react";
import HistoryContext from "../context";
import TimeframeDropdown from "../../../components/TimeframeDropdown/TimeframeDropdown";
import MonthPicker from "../../../components/MonthPicker/MonthPicker";

export default function HistoryToolbar() {
    const {
        archived,
        localSearch, setLocalSearch,
        filterCategory, setFilterCategory,
        availableCategories,
        filterCycle, setFilterCycle,
        dateStart, setDateStart,
        dateEnd, setDateEnd
    } = useContext(HistoryContext);

    const hasDateFilter = dateStart || dateEnd;

    return (
        <div className="flex flex-col gap-3 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    Archived Subscriptions
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-xs font-semibold">
                        {size(archived)}
                    </span>
                </h3>

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
                        />
                    </div>
                </div>
            </div>

            {/* Date Range filter row */}
            <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-400 flex-shrink-0">
                    <CalendarRange size={13} />
                    Billing date
                </span>
                <div className="flex items-center gap-2">
                    <div className="w-[45%]">
                        <MonthPicker value={dateStart} onChange={setDateStart} placeholder="From" maxDate={dateEnd} />
                    </div>
                    <span className="text-slate-400 font-extrabold text-[18px] uppercase flex-shrink-0">→</span>
                    <div className="w-[45%]">
                        <MonthPicker value={dateEnd} onChange={setDateEnd} placeholder="To" minDate={dateStart} align="right" />
                    </div>
                    {hasDateFilter && (
                        <button
                            onClick={() => { setDateStart(""); setDateEnd(""); }}
                            className="p-1 text-slate-400 hover:text-rose-500 transition-colors flex-shrink-0"
                            title="Clear date range"
                        >
                            <X size={13} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
