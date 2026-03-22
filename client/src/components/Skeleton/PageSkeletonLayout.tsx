import React from "react";
import Sidebar from "../Sidebar/Sidebar";
import MobileNav from "../MobileNav/MobileNav";
import Shimmer from "./Shimmer";

interface PageSkeletonLayoutProps {
    title: string;
    children: React.ReactNode;
}

export default function PageSkeletonLayout({ title, children }: PageSkeletonLayoutProps) {
    return (
        <div className="flex min-h-screen bg-[#f0f0f5]">
            <Sidebar />
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="h-[76px] flex-shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8">
                    <div className="flex items-center gap-3 relative z-[60]">
                        <MobileNav />
                        <h1 className="text-xl font-bold text-slate-900 hidden sm:block">{title}</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 border-l border-slate-200 pl-2 sm:pl-4">
                            <div className="text-right hidden sm:block">
                                <Shimmer className="h-3.5 w-24 mb-1.5 rounded-md" />
                                <Shimmer className="h-3 w-32 rounded-md" />
                            </div>
                            <Shimmer className="w-10 h-10 rounded-full" />
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
