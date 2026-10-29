import { AbsoluteFill, interpolate } from "remotion";
import { C } from "../../brand";
import { inr } from "../appui";
import { ramp, useAt, useT, VOLine } from "../Synced";
import { at } from "../timing";

const ROWS = [
    { n: "Zoom Workplace", tile: "bg-blue-100 text-blue-600", d: 112, cost: 350 },
    { n: "Loom Business", tile: "bg-violet-100 text-violet-600", d: 87, cost: 250 },
    { n: "Miro Starter", tile: "bg-amber-100 text-amber-600", d: 143, cost: 210 },
    { n: "Calendly Teams", tile: "bg-slate-100 text-slate-600", d: 61, cost: 160 },
];

const Row: React.FC<{ i: number }> = ({ i }) => {
    const r = ROWS[i];
    const t = useT();
    const enter = useAt(at("Tools no one") + i * 0.12);
    const tag = useAt(at("in months.") + i * 0.14, { damping: 10, stiffness: 180, mass: 0.7 });
    const renew = useAt(at("renewing") + i * 0.1, { damping: 12, stiffness: 160, mass: 0.7 });
    const bill = at("billing.") + i * 0.08;
    const pulse = Math.sin(Math.min(1, ramp(t, bill, bill + 0.35)) * Math.PI);
    const dead = ramp(t, at("in months.") + i * 0.14, at("in months.") + i * 0.14 + 0.4);
    return (
        <div
            className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4"
            style={{ opacity: enter, transform: `translateX(${interpolate(enter, [0, 1], [60, 0])}px)` }}
        >
            <div className="flex items-center gap-4" style={{ opacity: interpolate(dead, [0, 1], [1, 0.55]), filter: `grayscale(${dead})` }}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-extrabold ${r.tile}`}>{r.n.charAt(0)}</div>
                <div>
                    <div className="text-[20px] font-bold text-slate-900">{r.n}</div>
                    <div className="text-[14px] font-semibold text-rose-500" style={{ opacity: tag, transform: `scale(${0.8 + 0.2 * tag})`, transformOrigin: "left" }}>
                        Not opened in {r.d} days
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <span
                    className="text-[13px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-lg"
                    style={{ opacity: renew, transform: `scale(${renew})` }}
                >
                    Auto-renew on
                </span>
                <span
                    className="text-[17px] font-extrabold px-3 py-1.5 rounded-lg border"
                    style={{
                        color: pulse > 0.05 || t > bill ? "#e11d48" : C.slate900,
                        background: t > bill ? "#fff1f2" : "white",
                        borderColor: t > bill ? "#ffe4e6" : "#e2e8f0",
                        transform: `scale(${1 + 0.18 * pulse})`,
                    }}
                >
                    {inr(r.cost)}/mo
                </span>
            </div>
        </div>
    );
};

export const Ghosts: React.FC = () => {
    const panel = useAt(at("Tools no one") - 0.25, { damping: 16, stiffness: 120, mass: 0.9 });
    return (
        <AbsoluteFill>
            <div className="absolute font-extrabold tracking-tight" style={{ left: 140, top: 330, width: 720, fontSize: 80, lineHeight: 1.08, color: C.emerald950 }}>
                <VOLine phrase="Tools no one has opened in months." />
                <div style={{ height: 40 }} />
                <div style={{ fontSize: 58, lineHeight: 1.15, width: 800 }}>
                    <VOLine phrase="Still renewing, still billing." display="Still renewing. Still billing." hl={[2, 3]} hlColor="#fecdd3" />
                </div>
            </div>
            <div
                className="absolute bg-white rounded-[2rem] border border-slate-200 p-7"
                style={{
                    left: 960,
                    top: 250,
                    width: 820,
                    boxShadow: "0 40px 100px -30px rgba(2,44,34,0.35)",
                    opacity: panel,
                    transform: `translateY(${interpolate(panel, [0, 1], [80, 0])}px) scale(${interpolate(panel, [0, 1], [0.95, 1])})`,
                }}
            >
                <div className="flex items-center gap-3 mb-5">
                    <span className="text-[24px] font-extrabold text-slate-900">Active Subscriptions</span>
                    <span className="text-[14px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-lg">10</span>
                </div>
                <div className="flex flex-col gap-3">
                    {ROWS.map((_, i) => (
                        <Row key={i} i={i} />
                    ))}
                </div>
            </div>
        </AbsoluteFill>
    );
};
