import React from "react";
import map from "lodash/map";
import range from "lodash/range";
import PageSkeletonLayout from "./PageSkeletonLayout";
import Shimmer from "./Shimmer";

export default function HistorySkeleton() {
    return (
        <PageSkeletonLayout title="Archived History">
            <div className="p-4 sm:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 mt-4">
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
