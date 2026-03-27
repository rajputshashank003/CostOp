import { Search, X, CalendarRange } from "lucide-react";
import size from "lodash/size";
import { useContext, useEffect, useState } from "react";
import HistoryContext from "../context";
import TimeframeDropdown from "../../../components/TimeframeDropdown/TimeframeDropdown";
import MonthPicker from "../../../components/MonthPicker/MonthPicker";

export default function HistoryToolbar() {
    const {
        archived,
        localSearch, 
        setLocalSearch,
        filterCategory, 
        setFilterCategory,
        availableCategories,
        filterCycle, 
        setFilterCycle,
        filterTeam, 
        setFilterTeam,
        availableTeams,
        dateStart, 
        setDateStart,
        dateEnd, 
        setDateEnd
    } = useContext(HistoryContext);

    const hasDateFilter = dateStart || dateEnd;

    return (
        <div className="flex flex-col gap-3 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <h3 className="text-lg whitespace-nowrap font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    Archived Subscriptions
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-xs font-semibold">
                        {size(archived)}
                    </span>
                </h3>

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
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-2 w-full">
                <span className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 mb-1 sm:mb-0">
                    <CalendarRange size={13} />
                    Billing date
                </span>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="w-fit">
                        <MonthPicker value={dateStart} onChange={setDateStart} placeholder="From" maxDate={dateEnd} />
                    </div>
                    <span className="text-slate-400 font-extrabold text-[10px] uppercase">→</span>
                    <div className="w-fit">
                        <MonthPicker value={dateEnd} onChange={setDateEnd} placeholder="To" minDate={dateStart} align="right" />
                    </div>
                    {hasDateFilter && (
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
        </div>
    );
}
