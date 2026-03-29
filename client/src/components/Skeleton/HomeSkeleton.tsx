import map from "lodash/map";
import range from "lodash/range";
import PageSkeletonLayout from "./PageSkeletonLayout";
import Shimmer from "./Shimmer";

function CardSkeleton() {
    return (
        <div className="bg-white rounded-[1.5rem] border border-slate-200 p-6 flex flex-col h-full">
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                    <Shimmer className="w-14 h-14 rounded-[1rem] flex-shrink-0" />
                    <div>
                        <Shimmer className="h-[18px] w-28 mb-2 rounded-md" />
                        <Shimmer className="h-5 w-16 rounded-md" />
                    </div>
                </div>
                <Shimmer className="w-9 h-9 rounded-xl flex-shrink-0" />
            </div>

            {/* Row 2 — 2-col cost / next-bill grid */}
            <div className="grid grid-cols-2 gap-3 mt-auto">
                <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                    <Shimmer className="h-3 w-16 mb-2 rounded-md" />
                    <Shimmer className="h-6 w-20 rounded-md" />
                </div>
                <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                    <Shimmer className="h-3 w-14 mb-2 rounded-md" />
                    <Shimmer className="h-5 w-24 rounded-md" />
                </div>
            </div>

            {/* Row 3 — Footer: plan type + added by */}
            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <Shimmer className="h-4 w-28 rounded-md" />
                <Shimmer className="h-3 w-32 rounded-md" />
            </div>
        </div>
    );
}

/* ── Widget Skeleton: matches the metric cards ──────────────────────── */
function SpendWidgetSkeleton() {
    return (
        <div className="bg-white rounded-[1.5rem] border border-slate-200 p-6 flex flex-col justify-between min-h-[180px]">
            <div className="flex justify-between items-start">
                <div>
                    <Shimmer className="h-4 w-32 mb-3 rounded-md" />
                    <Shimmer className="h-10 w-48 rounded-md" />
                </div>
                <Shimmer className="w-14 h-14 rounded-2xl flex-shrink-0" />
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100/80">
                <Shimmer className="h-8 w-44 rounded-lg" />
            </div>
        </div>
    );
}

function RenewalsWidgetSkeleton() {
    return (
        <div className="bg-white rounded-[1.5rem] border border-slate-200 p-6 min-h-[180px]">
            <Shimmer className="h-4 w-40 mb-5 rounded-md" />
            <div className="flex flex-col gap-3">
                <Shimmer className="h-14 w-full rounded-xl" />
                <Shimmer className="h-14 w-full rounded-xl" />
            </div>
        </div>
    );
}

function DeptWidgetSkeleton() {
    return (
        <div className="bg-white rounded-[1.5rem] border border-slate-200 p-6 min-h-[180px]">
            <Shimmer className="h-4 w-36 mb-5 rounded-md" />
            <div className="flex flex-col gap-3">
                <Shimmer className="h-4 w-full rounded-md" />
                <Shimmer className="h-2 w-full rounded-full" />
                <Shimmer className="h-4 w-3/4 rounded-md" />
                <Shimmer className="h-2 w-3/4 rounded-full" />
            </div>
        </div>
    );
}

/* ── Filter Bar Skeleton ─────────────────────────────────────────────── */
function FilterBarSkeleton() {
    return (
        <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <Shimmer className="h-6 w-48 rounded-md" />
                <div className="flex flex-wrap items-center gap-2">
                    <Shimmer className="h-8 w-[220px] rounded-lg" />
                    <Shimmer className="h-8 w-20 rounded-lg" />
                    <Shimmer className="h-8 w-24 rounded-lg" />
                    <Shimmer className="h-8 w-24 rounded-lg" />
                    <Shimmer className="h-8 w-16 rounded-lg" />
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Shimmer className="h-4 w-20 rounded-md" />
                <Shimmer className="h-8 w-28 rounded-lg" />
                <Shimmer className="h-4 w-4 rounded-sm" />
                <Shimmer className="h-8 w-28 rounded-lg" />
            </div>
        </div>
    );
}

/* ── Main HomeSkeleton ───────────────────────────────────────────────── */
export default function HomeSkeleton() {
    return (
        <PageSkeletonLayout title="Dashboard">
            <div className="p-4 sm:p-8">
                {/* ── Metrics Row — responsive like DashboardMetrics ── */}
                {/* Mobile: stacked cards */}
                <div className="md:hidden flex flex-col gap-4 mb-8">
                    <SpendWidgetSkeleton />
                    <RenewalsWidgetSkeleton />
                    <DeptWidgetSkeleton />
                </div>

                {/* Tablet: 2-col top + full-width department card below */}
                <div className="hidden md:flex lg:hidden flex-col gap-4 mb-8">
                    <div className="grid grid-cols-2 gap-4">
                        <SpendWidgetSkeleton />
                        <RenewalsWidgetSkeleton />
                    </div>
                    <DeptWidgetSkeleton />
                </div>

                {/* Desktop: 3-col equal grid */}
                <div className="hidden lg:grid grid-cols-3 gap-6 mb-8">
                    <SpendWidgetSkeleton />
                    <RenewalsWidgetSkeleton />
                    <DeptWidgetSkeleton />
                </div>

                {/* ── Filter bar + Subscription cards ── */}
                <FilterBarSkeleton />

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
                    {map(range(6), (i) => (
                        <CardSkeleton key={i} />
                    ))}
                </div>
            </div>
        </PageSkeletonLayout>
    );
}
