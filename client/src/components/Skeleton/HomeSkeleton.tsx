import React from "react";
import map from "lodash/map";
import range from "lodash/range";
import PageSkeletonLayout from "./PageSkeletonLayout";
import Shimmer from "./Shimmer";

export default function HomeSkeleton() {
    return (
        <PageSkeletonLayout title="Dashboard">
            <div className="p-4 sm:p-8">
                {/* Metrics Row Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-8">
                    {/* Widget 1 Skeleton */}
                    <div className="bg-white rounded-[1.5rem] border border-slate-200 p-6 flex items-center justify-between">
                        <div>
                            <Shimmer className="h-4 w-32 mb-4 rounded-md" />
                            <Shimmer className="h-10 w-48 rounded-md" />
                        </div>
                        <Shimmer className="w-16 h-16 rounded-2xl" />
                    </div>

                    {/* Widget 2 Skeleton */}
                    <div className="bg-white rounded-[1.5rem] border border-slate-200 p-6">
                        <Shimmer className="h-4 w-40 mb-6 rounded-md" />
                        <div className="flex flex-col gap-3">
                            <Shimmer className="h-16 w-full rounded-xl" />
                            <Shimmer className="h-16 w-full rounded-xl" />
                        </div>
                    </div>
                </div>

                {/* Subscriptions Grid Skeleton */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Shimmer className="h-6 w-48 rounded-md" />
                        <Shimmer className="h-5 w-8 rounded-md" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
                        {map(range(8), (i) => (
                            <div key={i} className="bg-white rounded-[1.5rem] border border-slate-200 p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <Shimmer className="w-12 h-12 rounded-xl" />
                                        <div>
                                            <Shimmer className="h-4 w-24 mb-2 rounded-md" />
                                            <Shimmer className="h-3 w-16 rounded-md" />
                                        </div>
                                    </div>
                                    <Shimmer className="w-8 h-8 rounded-full" />
                                </div>
                                <div className="space-y-3 mb-6">
                                    <Shimmer className="h-3 w-full rounded-md" />
                                    <Shimmer className="h-3 w-3/4 rounded-md" />
                                </div>
                                <div className="flex items-center justify-between mt-auto">
                                    <Shimmer className="h-6 w-20 rounded-md" />
                                    <Shimmer className="h-8 w-24 rounded-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </PageSkeletonLayout>
    );
}
