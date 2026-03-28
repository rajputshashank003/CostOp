import { useState, useRef, useEffect, useContext } from "react";
import { ArrowRightLeft, Search, Plus, Check, Loader2 } from "lucide-react";
import MembersContext from "../context";

interface Props {
    userId: number;
    currentTeamId: number;
}

export default function MoveTeamDropdown({ userId, currentTeamId }: Props) {
    const { allTeams, handleMoveToTeam, handleCreateTeam } = useContext(MembersContext);

    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [newTeamName, setNewTeamName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [movingToId, setMovingToId] = useState<number | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setIsCreating(false);
                setSearch("");
            }
        };
        if (isOpen) document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [isOpen]);

    // Focus search when dropdown opens
    useEffect(() => {
        if (isOpen && searchRef.current) {
            setTimeout(() => searchRef.current?.focus(), 50);
        }
    }, [isOpen]);

    const moveTargets = allTeams.filter(
        (t: any) => t.id !== currentTeamId && t.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleMove = async (teamId: number) => {
        setMovingToId(teamId);
        await handleMoveToTeam(userId, currentTeamId, teamId);
        setMovingToId(null);
        setIsOpen(false);
        setSearch("");
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTeamName.trim()) return;
        setIsSubmitting(true);
        await handleCreateTeam(newTeamName.trim());
        setNewTeamName("");
        setIsCreating(false);
        setIsSubmitting(false);
    };

    return (
        <div className="relative" ref={containerRef}>
            {/* Trigger button */}
            <button
                onClick={() => setIsOpen((o) => !o)}
                className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-emerald-600 px-2 py-1 rounded-lg hover:bg-emerald-50 transition-all border border-transparent hover:border-emerald-200 cursor-pointer"
            >
                <ArrowRightLeft size={13} />
                <span className="hidden sm:inline">Move</span>
            </button>

            {/* Dropdown panel */}
            {isOpen && (
                <div className="absolute right-0 top-9 z-50 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
                    {/* Search */}
                    <div className="p-2 border-b border-slate-100">
                        <div className="flex items-center gap-2 px-2 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
                            <Search size={13} className="text-slate-400 flex-shrink-0" />
                            <input
                                ref={searchRef}
                                type="text"
                                placeholder="Search teams..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full text-xs bg-transparent outline-none text-slate-700 placeholder-slate-400 font-medium"
                            />
                        </div>
                    </div>

                    {/* Team list */}
                    <div className="max-h-44 overflow-y-auto py-1">
                        {moveTargets.length === 0 ? (
                            <p className="text-xs text-slate-400 text-center py-4 font-medium">
                                {search ? "No teams match" : "No other teams"}
                            </p>
                        ) : (
                            moveTargets.map((t: any) => (
                                <button
                                    key={t.id}
                                    onClick={() => handleMove(t.id)}
                                    disabled={movingToId !== null}
                                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 font-semibold cursor-pointer transition-colors disabled:opacity-50"
                                >
                                    <span className="truncate">{t.name}</span>
                                    {movingToId === t.id && (
                                        <Loader2 size={13} className="animate-spin text-emerald-500 flex-shrink-0" />
                                    )}
                                </button>
                            ))
                        )}
                    </div>

                    {/* Create new team */}
                    <div className="border-t border-slate-100 p-2">
                        {!isCreating ? (
                            <button
                                onClick={() => setIsCreating(true)}
                                className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-bold text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            >
                                <Plus size={13} />
                                Create new team
                            </button>
                        ) : (
                            <form onSubmit={handleCreate} className="flex items-center gap-1.5">
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Team name..."
                                    value={newTeamName}
                                    onChange={(e) => setNewTeamName(e.target.value)}
                                    className="flex-1 min-w-0 text-xs px-2 py-1.5 border border-slate-200 rounded-lg outline-none focus:border-emerald-400 font-medium text-slate-700 placeholder-slate-400"
                                />
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !newTeamName.trim()}
                                    className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors disabled:opacity-50 cursor-pointer flex-shrink-0"
                                >
                                    {isSubmitting
                                        ? <Loader2 size={13} className="animate-spin" />
                                        : <Check size={13} />
                                    }
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
