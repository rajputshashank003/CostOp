import React from "react";
import PageSkeletonLayout from "./PageSkeletonLayout";
import Shimmer from "./Shimmer";

export default function SettingsSkeleton() {
    return (
        <PageSkeletonLayout title="Workspace Settings">
            <div className="p-4 sm:p-8 max-w-4xl w-full mx-auto space-y-6">
                {/* Billing / Plan Card Skeleton */}
                <div className="bg-white rounded-[1.75rem] border border-slate-200/90 p-6 sm:p-8 shadow-xs">
                    <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
                        <div className="flex items-center gap-3">
                            <Shimmer className="w-10 h-10 rounded-xl" />
                            <div>
                                <Shimmer className="h-5 w-44 mb-2 rounded-md" />
                                <Shimmer className="h-3 w-56 rounded-md" />
                            </div>
                        </div>
                        <Shimmer className="h-6 w-20 rounded-full" />
                    </div>
                    <div className="space-y-4">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                            <div className="space-y-2">
                                <Shimmer className="h-4 w-32 rounded-md" />
                                <Shimmer className="h-3 w-48 rounded-md" />
                            </div>
                            <Shimmer className="h-9 w-28 rounded-xl" />
                        </div>
                    </div>
                </div>

                {/* Workspace Profile Card Skeleton */}
                <div className="bg-white rounded-[1.75rem] border border-slate-200/90 p-6 sm:p-8 shadow-xs">
                    <div className="flex items-center gap-3 pb-5 border-b border-slate-100 mb-6">
                        <Shimmer className="w-10 h-10 rounded-xl" />
                        <div>
                            <Shimmer className="h-5 w-40 mb-2 rounded-md" />
                            <Shimmer className="h-3 w-60 rounded-md" />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <Shimmer className="h-3 w-28 rounded-md" />
                        <Shimmer className="h-11 w-full rounded-xl" />
                    </div>
                </div>

                {/* Slack Integration Card Skeleton */}
                <div className="bg-white rounded-[1.75rem] border border-slate-200/90 p-6 sm:p-8 shadow-xs">
                    <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
                        <div className="flex items-center gap-3">
                            <Shimmer className="w-10 h-10 rounded-xl" />
                            <div>
                                <Shimmer className="h-5 w-48 mb-2 rounded-md" />
                                <Shimmer className="h-3 w-64 rounded-md" />
                            </div>
                        </div>
                        <Shimmer className="h-6 w-16 rounded-full" />
                    </div>
                    <div className="space-y-3">
                        <Shimmer className="h-3 w-36 rounded-md" />
                        <Shimmer className="h-11 w-full rounded-xl" />
                    </div>
                </div>

                {/* Security Card Skeleton */}
                <div className="bg-white rounded-[1.75rem] border border-slate-200/90 p-6 sm:p-8 shadow-xs">
                    <div className="flex items-center gap-3 pb-5 border-b border-slate-100 mb-6">
                        <Shimmer className="w-10 h-10 rounded-xl" />
                        <div>
                            <Shimmer className="h-5 w-36 mb-2 rounded-md" />
                            <Shimmer className="h-3 w-52 rounded-md" />
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="space-y-1.5">
                            <Shimmer className="h-4 w-40 rounded-md" />
                            <Shimmer className="h-3 w-64 rounded-md" />
                        </div>
                        <Shimmer className="w-12 h-6 rounded-full" />
                    </div>
                </div>

                {/* Save Button Shimmer */}
                <div className="flex justify-end pb-8">
                    <Shimmer className="h-12 w-44 rounded-xl" />
                </div>
            </div>
        </PageSkeletonLayout>
    );
}
