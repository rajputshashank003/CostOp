import React from "react";
import PageSkeletonLayout from "./PageSkeletonLayout";
import Shimmer from "./Shimmer";

export default function SubscriptionDetailSkeleton() {
    return (
        <PageSkeletonLayout title="Subscription Details">
            <div className="p-4 sm:p-8 max-w-5xl mx-auto w-full space-y-6">
                {/* Header Card Skeleton */}
                <div className="bg-white rounded-[2rem] border border-slate-200/90 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <Shimmer className="w-16 h-16 rounded-2xl flex-shrink-0" />
                        <div className="space-y-2">
                            <Shimmer className="h-6 w-40 rounded-md" />
                            <div className="flex gap-2">
                                <Shimmer className="h-5 w-24 rounded-full" />
                                <Shimmer className="h-5 w-20 rounded-full" />
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Shimmer className="h-10 w-28 rounded-xl" />
                        <Shimmer className="h-10 w-28 rounded-xl" />
                    </div>
                </div>

                {/* Metrics Row (3 cards) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[1, 2, 3].map((idx) => (
                        <div key={idx} className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-2">
                            <Shimmer className="h-3 w-24 rounded-md" />
                            <Shimmer className="h-7 w-32 rounded-md" />
                        </div>
                    ))}
                </div>

                {/* 2-column Grid: Members & Sidebar */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
                        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                            <Shimmer className="h-5 w-36 rounded-md" />
                            <Shimmer className="h-8 w-24 rounded-lg" />
                        </div>
                        <div className="space-y-3">
                            {[1, 2, 3, 4].map((idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <Shimmer className="w-9 h-9 rounded-full" />
                                        <div className="space-y-1">
                                            <Shimmer className="h-3.5 w-28 rounded-md" />
                                            <Shimmer className="h-3 w-40 rounded-md" />
                                        </div>
                                    </div>
                                    <Shimmer className="h-6 w-16 rounded-full" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4 h-fit">
                        <Shimmer className="h-5 w-32 rounded-md pb-2 border-b border-slate-100" />
                        <div className="space-y-3">
                            {[1, 2, 3, 4].map((idx) => (
                                <div key={idx} className="flex justify-between py-1.5 border-b border-slate-50">
                                    <Shimmer className="h-3 w-20 rounded-md" />
                                    <Shimmer className="h-3 w-24 rounded-md" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </PageSkeletonLayout>
    );
}
