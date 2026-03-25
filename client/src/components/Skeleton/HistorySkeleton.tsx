import map from "lodash/map";
import range from "lodash/range";
import PageSkeletonLayout from "./PageSkeletonLayout";
import Shimmer from "./Shimmer";

export default function HistorySkeleton() {
    return (
        <PageSkeletonLayout title="Archived History">
            <div className="p-4 sm:p-8 flex flex-col gap-5">
                {/* Graph widget skeleton */}
                <div className="bg-white rounded-[1.5rem] border border-slate-200 p-6 opacity-60">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Shimmer className="w-10 h-10 rounded-xl bg-slate-300" />
                            <div>
                                <Shimmer className="h-4 w-36 mb-2 rounded-md bg-slate-300" />
                                <Shimmer className="h-3 w-52 rounded-md bg-slate-300" />
                            </div>
                        </div>
                        <Shimmer className="h-8 w-32 rounded-lg bg-slate-300" />
                    </div>
                    {/* Bar chart area */}
                    <div className="flex items-end justify-around gap-2 h-40 mt-4">
                        {map(range(6), (i) => (
                            <div key={i} className="flex flex-col items-center gap-2 flex-1">
                                <Shimmer
                                    className="w-full rounded-t-md bg-slate-200"
                                    style={{ height: `${20 + (i % 3) * 30}%` }}
                                />
                                <Shimmer className="h-2 w-8 rounded-md bg-slate-300" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Department spend widget skeleton */}
                <div className="bg-white rounded-[1.5rem] border border-slate-200 p-6 opacity-60">
                    <div className="flex items-center gap-3 mb-5">
                        <Shimmer className="w-10 h-10 rounded-xl bg-slate-300" />
                        <div>
                            <Shimmer className="h-4 w-44 mb-2 rounded-md bg-slate-300" />
                            <Shimmer className="h-3 w-56 rounded-md bg-slate-300" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {map(range(4), (i) => (
                            <div key={i} className="flex flex-col gap-2">
                                <div className="flex justify-between">
                                    <Shimmer className="h-3 w-20 rounded-md bg-slate-300" />
                                    <Shimmer className="h-3 w-12 rounded-md bg-slate-300" />
                                </div>
                                <Shimmer className="h-2 w-full rounded-full bg-slate-200" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Toolbar skeleton */}
                <div className="flex items-center justify-between">
                    <Shimmer className="h-5 w-40 rounded-md bg-slate-300" />
                    <div className="flex gap-2">
                        <Shimmer className="h-8 w-40 rounded-lg bg-slate-200" />
                        <Shimmer className="h-8 w-32 rounded-lg bg-slate-200" />
                    </div>
                </div>

                {/* Subscription cards grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
                    {map(range(6), (i) => (
                        <div key={i} className="bg-white rounded-[1.5rem] border border-slate-200 p-5 opacity-60">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <Shimmer className="w-12 h-12 rounded-xl bg-slate-300" />
                                    <div>
                                        <Shimmer className="h-4 w-24 mb-2 rounded-md bg-slate-300" />
                                        <Shimmer className="h-3 w-16 rounded-md bg-slate-300" />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-3 mb-6">
                                <Shimmer className="h-3 w-full rounded-md bg-slate-300" />
                                <Shimmer className="h-3 w-3/4 rounded-md bg-slate-300" />
                            </div>
                            <div className="flex items-center justify-between mt-auto">
                                <Shimmer className="h-6 w-20 rounded-md bg-slate-300" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </PageSkeletonLayout>
    );
}
