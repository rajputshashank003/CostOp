import React from "react";
import PageSkeletonLayout from "./PageSkeletonLayout";
import Shimmer from "./Shimmer";

export default function OrdersSkeleton() {
    return (
        <PageSkeletonLayout title="Order History & Invoices">
            <div className="p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto space-y-6">
                {/* 3 Top Summary Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[1, 2, 3].map((idx) => (
                        <div key={idx} className="bg-white rounded-[1.5rem] border border-slate-200/90 p-5 shadow-xs flex items-center justify-between">
                            <div className="space-y-2">
                                <Shimmer className="h-3.5 w-24 rounded-md" />
                                <Shimmer className="h-7 w-28 rounded-md" />
                            </div>
                            <Shimmer className="w-12 h-12 rounded-2xl flex-shrink-0" />
                        </div>
                    ))}
                </div>

                {/* Filter and Search Bar */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <Shimmer className="h-10 w-full sm:w-64 rounded-xl" />
                    <div className="flex gap-2">
                        <Shimmer className="h-10 w-28 rounded-xl" />
                        <Shimmer className="h-10 w-10 rounded-xl" />
                    </div>
                </div>

                {/* Table Skeleton */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                        <Shimmer className="h-4 w-28 rounded-md" />
                        <Shimmer className="h-4 w-20 rounded-md" />
                    </div>
                    <div className="divide-y divide-slate-100">
                        {[1, 2, 3, 4, 5, 6].map((idx) => (
                            <div key={idx} className="p-4 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <Shimmer className="w-9 h-9 rounded-xl flex-shrink-0" />
                                    <div className="space-y-1.5">
                                        <Shimmer className="h-4 w-32 rounded-md" />
                                        <Shimmer className="h-3 w-44 rounded-md" />
                                    </div>
                                </div>
                                <div className="hidden md:flex items-center gap-8">
                                    <Shimmer className="h-3.5 w-24 rounded-md" />
                                    <Shimmer className="h-3.5 w-24 rounded-md" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <Shimmer className="h-6 w-16 rounded-full" />
                                    <Shimmer className="h-8 w-24 rounded-lg" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </PageSkeletonLayout>
    );
}
