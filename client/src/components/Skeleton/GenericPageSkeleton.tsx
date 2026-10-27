import React from "react";
import PageSkeletonLayout from "./PageSkeletonLayout";
import Shimmer from "./Shimmer";

export default function GenericPageSkeleton() {
    return (
        <PageSkeletonLayout title="CostOp">
            <div className="p-4 sm:p-8 max-w-6xl mx-auto w-full space-y-6">
                {/* Metrics Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[1, 2, 3].map((idx) => (
                        <div key={idx} className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-2">
                            <Shimmer className="h-3.5 w-24 rounded-md" />
                            <Shimmer className="h-7 w-32 rounded-md" />
                        </div>
                    ))}
                </div>

                {/* Main Content Skeleton Box */}
                <div className="bg-white rounded-[2rem] border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                        <div className="space-y-1.5">
                            <Shimmer className="h-5 w-48 rounded-md" />
                            <Shimmer className="h-3 w-64 rounded-md" />
                        </div>
                        <Shimmer className="h-9 w-28 rounded-xl" />
                    </div>

                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-slate-50/70 rounded-xl border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <Shimmer className="w-10 h-10 rounded-xl flex-shrink-0" />
                                    <div className="space-y-1.5">
                                        <Shimmer className="h-4 w-36 rounded-md" />
                                        <Shimmer className="h-3 w-48 rounded-md" />
                                    </div>
                                </div>
                                <Shimmer className="h-6 w-20 rounded-full" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </PageSkeletonLayout>
    );
}
