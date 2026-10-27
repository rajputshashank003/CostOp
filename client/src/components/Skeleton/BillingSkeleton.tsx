import React from "react";
import PageSkeletonLayout from "./PageSkeletonLayout";
import Shimmer from "./Shimmer";

export default function BillingSkeleton() {
    return (
        <PageSkeletonLayout title="Plans & Billing">
            <div className="p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto space-y-8">
                {/* Hero Header Skeleton */}
                <div className="text-center max-w-2xl mx-auto pt-2 sm:pt-4">
                    <Shimmer className="h-6 w-44 rounded-full mx-auto mb-3" />
                    <Shimmer className="h-9 sm:h-11 w-3/4 max-w-lg rounded-xl mx-auto mb-3" />
                    <Shimmer className="h-4 w-5/6 max-w-md rounded-md mx-auto" />
                </div>

                {/* Orders Banner Skeleton */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        <Shimmer className="w-10 h-10 rounded-xl" />
                        <div>
                            <Shimmer className="h-4 w-40 mb-2 rounded-md" />
                            <Shimmer className="h-3 w-64 rounded-md" />
                        </div>
                    </div>
                    <Shimmer className="h-10 w-32 rounded-xl" />
                </div>

                {/* Usage Meter Card Skeleton */}
                <div className="bg-white rounded-[2rem] border border-slate-200/90 p-6 sm:p-8 shadow-xs">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Shimmer className="w-10 h-10 rounded-xl" />
                            <div>
                                <Shimmer className="h-5 w-44 mb-2 rounded-md" />
                                <Shimmer className="h-3 w-56 rounded-md" />
                            </div>
                        </div>
                        <Shimmer className="h-6 w-24 rounded-full" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                            <div className="flex justify-between">
                                <Shimmer className="h-3 w-28 rounded-md" />
                                <Shimmer className="h-3 w-16 rounded-md" />
                            </div>
                            <Shimmer className="h-3 w-full rounded-full" />
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                            <div className="flex justify-between">
                                <Shimmer className="h-3 w-28 rounded-md" />
                                <Shimmer className="h-3 w-16 rounded-md" />
                            </div>
                            <Shimmer className="h-3 w-full rounded-full" />
                        </div>
                    </div>
                </div>

                {/* Interval Toggle Shimmer */}
                <div className="flex justify-center pt-2">
                    <Shimmer className="h-11 w-64 rounded-full" />
                </div>

                {/* 2 Plan Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {[1, 2].map((idx) => (
                        <div key={idx} className="bg-white rounded-[2rem] border border-slate-200/90 p-6 sm:p-8 shadow-xs flex flex-col justify-between h-[460px]">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <Shimmer className="h-6 w-28 rounded-md" />
                                    <Shimmer className="h-5 w-16 rounded-full" />
                                </div>
                                <Shimmer className="h-4 w-48 rounded-md" />
                                <div className="pt-2">
                                    <Shimmer className="h-12 w-36 rounded-xl" />
                                </div>
                                <div className="space-y-3 pt-6 border-t border-slate-100">
                                    {[1, 2, 3, 4].map((f) => (
                                        <div key={f} className="flex items-center gap-3">
                                            <Shimmer className="w-5 h-5 rounded-full flex-shrink-0" />
                                            <Shimmer className="h-3.5 w-3/4 rounded-md" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <Shimmer className="h-12 w-full rounded-xl mt-6" />
                        </div>
                    ))}
                </div>
            </div>
        </PageSkeletonLayout>
    );
}
