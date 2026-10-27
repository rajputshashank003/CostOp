import React from "react";
import PageSkeletonLayout from "./PageSkeletonLayout";
import Shimmer from "./Shimmer";

export default function ProfileSkeleton() {
    return (
        <PageSkeletonLayout title="User Profile">
            <div className="p-4 sm:p-8 max-w-5xl mx-auto w-full space-y-8">
                {/* Profile Card Header Skeleton */}
                <div className="bg-white rounded-[2rem] border border-slate-200/90 p-6 sm:p-8 shadow-xs">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                        <div className="flex items-center gap-5">
                            <Shimmer className="w-20 h-20 rounded-2xl flex-shrink-0" />
                            <div className="space-y-2">
                                <Shimmer className="h-6 w-44 rounded-md" />
                                <Shimmer className="h-4 w-56 rounded-md" />
                                <div className="flex gap-2 pt-1">
                                    <Shimmer className="h-5 w-20 rounded-full" />
                                    <Shimmer className="h-5 w-24 rounded-full" />
                                </div>
                            </div>
                        </div>
                        <Shimmer className="h-10 w-32 rounded-xl" />
                    </div>

                    {/* Profile Stats Metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
                        {[1, 2, 3].map((idx) => (
                            <div key={idx} className="bg-slate-50/80 p-4 rounded-xl border border-slate-100 space-y-2">
                                <Shimmer className="h-3 w-24 rounded-md" />
                                <Shimmer className="h-7 w-28 rounded-md" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Assigned Software Stack Section */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center px-2">
                        <Shimmer className="h-5 w-48 rounded-md" />
                        <Shimmer className="h-4 w-20 rounded-md" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((idx) => (
                            <div key={idx} className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3.5">
                                    <Shimmer className="w-12 h-12 rounded-xl flex-shrink-0" />
                                    <div className="space-y-1.5">
                                        <Shimmer className="h-4 w-32 rounded-md" />
                                        <Shimmer className="h-3 w-24 rounded-md" />
                                    </div>
                                </div>
                                <div className="text-right space-y-1.5">
                                    <Shimmer className="h-5 w-20 rounded-md ml-auto" />
                                    <Shimmer className="h-3 w-16 rounded-md ml-auto" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </PageSkeletonLayout>
    );
}
