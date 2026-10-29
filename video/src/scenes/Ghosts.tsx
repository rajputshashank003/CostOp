import { Ghost } from "lucide-react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C } from "../brand";
import { Pop, useIn, Words } from "../lib";
import { HeroRow, Zoom } from "../ui";

const TOOLS = [
    { n: "Canva Pro", c: "$119.99", days: 205, color: "bg-sky-100 text-sky-600" },
    { n: "Miro Starter", c: "$80.00", days: 143, color: "bg-amber-100 text-amber-600" },
    { n: "Zoom Pro", c: "$15.99", days: 112, color: "bg-blue-100 text-blue-600" },
    { n: "Loom Business", c: "$12.50", days: 87, color: "bg-violet-100 text-violet-600" },
    { n: "Calendly Teams", c: "$48.00", days: 61, color: "bg-slate-100 text-slate-600" },
];

const GhostRow: React.FC<{ i: number }> = ({ i }) => {
    const t = TOOLS[i];
    const enter = useIn(14 + i * 5);
    const dead = useIn(52 + i * 7, { damping: 200 });
    const tag = useIn(52 + i * 7, { damping: 10, stiffness: 180 });
    return (
        <div className="relative" style={{ opacity: enter, transform: `translateY(${interpolate(enter, [0, 1], [40, 0])}px)` }}>
            <div style={{ opacity: interpolate(dead, [0, 1], [1, 0.55]), filter: `grayscale(${dead})` }}>
                <HeroRow n={t.n} c={t.c} d={`${t.c}/mo · still billing`} color={t.color} right={<span />} />
            </div>
            <div
                className="absolute right-4 top-1/2 text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-1 rounded-md"
                style={{ transform: `translateY(-50%) scale(${tag})` }}
            >
                Last opened {t.days}d ago
            </div>
        </div>
    );
};

export const Ghosts: React.FC = () => {
    const f = useCurrentFrame();
    const icon = useIn(4);
    return (
        <AbsoluteFill className="items-center" style={{ paddingTop: 200 }}>
            <div
                className="w-36 h-36 rounded-[2.5rem] bg-white shadow-xl flex items-center justify-center"
                style={{ transform: `scale(${icon}) translateY(${Math.sin(f / 8) * 10}px) rotate(${Math.sin(f / 12) * 6}deg)` }}
            >
                <Ghost size={84} color={C.emerald600} strokeWidth={2.2} />
            </div>
            <div className="font-extrabold tracking-tight text-center" style={{ color: C.emerald950, fontSize: 112, lineHeight: 1.04, marginTop: 50 }}>
                <Words text="Ghost" delay={6} />
                <br />
                <Words text="subscriptions." delay={10} />
            </div>
            <Zoom k={1.75} width={520} style={{ marginTop: 70 }}>
                <div className="space-y-3">
                    {TOOLS.map((_, i) => (
                        <GhostRow key={i} i={i} />
                    ))}
                </div>
            </Zoom>
            <Pop delay={92} style={{ marginTop: 60 }}>
                <div className="font-bold text-center" style={{ fontSize: 48, color: C.emerald950, opacity: 0.7 }}>
                    Unused. Still on your card.
                </div>
            </Pop>
        </AbsoluteFill>
    );
};
