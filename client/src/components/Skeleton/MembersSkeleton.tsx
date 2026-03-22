import React from "react";
import map from "lodash/map";
import range from "lodash/range";
import PageSkeletonLayout from "./PageSkeletonLayout";
import Shimmer from "./Shimmer";

export default function MembersSkeleton() {
    return (
        <PageSkeletonLayout title="Workspace Members">
            <div className="p-4 sm:p-8 max-w-5xl mx-auto w-full">

                {/* Invite Card Skeleton */}
                <div className="bg-white rounded-[1.5rem] border border-slate-200 p-4 sm:p-6 mb-8 mt-2 sm:mt-4">
                    <div className="flex items-center gap-3 mb-6">
                        <Shimmer className="w-10 h-10 rounded-xl" />
                        <div>
                            <Shimmer className="h-5 w-32 mb-2 rounded-md" />
                            <Shimmer className="h-3 w-48 rounded-md" />
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Shimmer className="h-12 flex-1 rounded-xl" />
                        <Shimmer className="h-12 w-full sm:w-36 rounded-xl" />
                    </div>
                </div>

                {/* Active Members Skeleton */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2 pl-2">
                        <Shimmer className="h-4 w-32 rounded-md" />
                    </div>
                    {map(range(4), (i) => (
                        <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Shimmer className="w-12 h-12 rounded-full" />
                                <div>
                                    <Shimmer className="h-4 w-28 mb-2 rounded-md" />
                                    <Shimmer className="h-3 w-40 rounded-md" />
                                </div>
                            </div>
                            <Shimmer className="w-16 h-6 rounded-lg" />
                        </div>
                    ))}
                </div>

            </div>
        </PageSkeletonLayout>
    );
}
