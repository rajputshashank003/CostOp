import React from "react";
import PageSkeletonLayout from "./PageSkeletonLayout";
import Shimmer from "./Shimmer";

export default function OrgSettingsSkeleton() {
    return (
        <PageSkeletonLayout title="Org & Plan Settings">
            <div className="p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto space-y-8">
                {/* Admin Banner Skeleton */}
                <div className="bg-slate-900 rounded-[2rem] p-6 sm:p-8 shadow-xl relative overflow-hidden">
                    <div className="space-y-4 max-w-2xl">
                        <Shimmer className="h-6 w-52 rounded-full bg-slate-800" />
                        <Shimmer className="h-9 w-3/4 max-w-md rounded-xl bg-slate-800" />
                        <Shimmer className="h-4 w-5/6 rounded-md bg-slate-800" />
                        <div className="pt-2">
                            <Shimmer className="h-10 w-48 rounded-xl bg-slate-800" />
                        </div>
                    </div>
                </div>

                {/* Form & Sidebar Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Form Settings (7 cols) */}
                    <div className="lg:col-span-7 bg-white rounded-[2rem] border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
                        <div className="flex items-center justify-between pb-5 border-b border-slate-100">
                            <div className="space-y-1.5">
                                <Shimmer className="h-5 w-40 rounded-md" />
                                <Shimmer className="h-3 w-56 rounded-md" />
                            </div>
                            <Shimmer className="h-6 w-24 rounded-full" />
                        </div>

                        {[1, 2, 3, 4].map((idx) => (
                            <div key={idx} className="space-y-2">
                                <Shimmer className="h-3.5 w-36 rounded-md" />
                                <Shimmer className="h-12 w-full rounded-xl" />
                                <Shimmer className="h-2.5 w-48 rounded-md" />
                            </div>
                        ))}

                        <div className="pt-4 flex justify-end">
                            <Shimmer className="h-12 w-36 rounded-xl" />
                        </div>
                    </div>

                    {/* Right Column: Cards (5 cols) */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-white rounded-[2rem] border border-slate-200/90 p-6 shadow-sm space-y-4">
                            <Shimmer className="h-5 w-44 rounded-md" />
                            <div className="space-y-3">
                                {[1, 2, 3].map((idx) => (
                                    <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-100">
                                        <Shimmer className="h-3 w-28 rounded-md" />
                                        <Shimmer className="h-4 w-16 rounded-md" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-[2rem] border border-slate-200/90 p-6 shadow-sm flex items-start gap-3">
                            <Shimmer className="w-10 h-10 rounded-xl flex-shrink-0" />
                            <div className="space-y-2 flex-1">
                                <Shimmer className="h-4 w-40 rounded-md" />
                                <Shimmer className="h-3 w-full rounded-md" />
                                <Shimmer className="h-3 w-4/5 rounded-md" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageSkeletonLayout>
    );
}
