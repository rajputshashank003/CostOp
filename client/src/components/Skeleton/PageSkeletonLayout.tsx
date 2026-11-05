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
                <header className="h-[62px] desk:h-[76px] flex-shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-3 sm:px-4 desk:px-8 transition-all">
                    <div className="flex items-center gap-2.5 desk:gap-3 relative z-[60] flex-shrink-0">
                        <MobileNav />
                        <h1 className="text-lg desk:text-xl font-bold text-slate-900 hidden sm:block">{title}</h1>
                    </div>
                    <div className="flex items-center gap-2 desk:gap-4 flex-shrink-0">
                        <div className="flex items-center gap-2 desk:gap-3 ml-1 desk:ml-2 pl-2 desk:pl-4 border-l border-slate-200 flex-shrink-0">
                            <div className="text-right hidden sm:block">
                                <Shimmer className="h-3.5 w-20 desk:w-24 mb-1 rounded-md" />
                                <Shimmer className="h-3 w-28 desk:w-32 rounded-md hidden desk:block" />
                            </div>
                            <Shimmer className="w-8 h-8 desk:w-10 desk:h-10 rounded-full" />
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
