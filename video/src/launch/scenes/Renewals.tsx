import { IndianRupee } from "lucide-react";
import { AbsoluteFill, interpolate, spring } from "remotion";
import { C } from "../../brand";
import { useT, VOLine } from "../Synced";
import { at } from "../timing";

export const DEBITS = [
    { amount: "₹960", via: "UPI AutoPay", what: "Notion Plus · Annual plan renewed", word: "Annual plans" },
    { amount: "₹499", via: "Card •••• 4242", what: "Adobe Express · Auto-renewed", word: "auto debits" },
    { amount: "₹350", via: "UPI AutoPay", what: "Zoom Workplace · Monthly plan", word: "quietly" },
];

const Banner: React.FC<{ i: number }> = ({ i }) => {
    const t = useT();
    const sp = (tt: number, d = 13) => spring({ frame: Math.round((t - tt) * 30), fps: 30, config: { damping: d, stiffness: 150 } });
    const d = DEBITS[i];
    const s = sp(at(d.word));
    const pushes = DEBITS.slice(i + 1).reduce((a, n) => a + sp(at(n.word), 16), 0);
    const surprise = at("surprise.");
    const shakeT = t - surprise;
    const shake = i === DEBITS.length - 1 && shakeT > 0 ? Math.sin(shakeT * 55) * interpolate(shakeT, [0, 0.45], [16, 0], { extrapolateRight: "clamp" }) : 0;
    const glow = i === DEBITS.length - 1 ? interpolate(shakeT, [0, 0.2, 1.2], [0, 1, 0.5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
    return (
        <div
            className="absolute bg-white/95 rounded-[1.75rem] flex items-center gap-6 px-7 py-6"
            style={{
                width: 760,
                left: 0,
                top: 0,
                boxShadow: `0 30px 80px -25px rgba(2,44,34,0.35), 0 0 0 ${glow * 4}px rgba(244,63,94,${0.5 * glow})`,
                opacity: Math.min(1, s * 1.5) * interpolate(pushes, [1, 2], [1, 0.5], { extrapolateLeft: "clamp" }),
                transform: `translateY(${interpolate(s, [0, 1], [-200, 0]) + pushes * 170}px) translateX(${shake}px) scale(${1 - pushes * 0.04})`,
            }}
        >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: C.rose100 }}>
                <IndianRupee size={34} color={C.rose500} strokeWidth={2.4} />
            </div>
            <div className="flex-1">
                <div className="flex justify-between text-[15px] font-bold text-slate-400 uppercase tracking-widest">
                    <span>{d.via}</span>
                    <span className="normal-case tracking-normal font-semibold">now</span>
                </div>
                <div className="text-[30px] font-extrabold text-slate-900 leading-tight">{d.amount} debited</div>
                <div className="text-[19px] font-semibold text-slate-500">{d.what}</div>
            </div>
        </div>
    );
};

export const Renewals: React.FC = () => (
    <AbsoluteFill>
        <div className="absolute font-extrabold tracking-tight" style={{ left: 140, top: 330, width: 760, fontSize: 70, lineHeight: 1.12, color: C.emerald950 }}>
            <VOLine phrase="Annual plans and auto debits that renew quietly" display="Annual plans and auto-~ debits that renew quietly…" />
            <div style={{ height: 30 }} />
            <VOLine phrase="and show up as a surprise." hl={[5]} hlColor="#fecdd3" />
        </div>
        <div className="absolute" style={{ left: 1010, top: 300 }}>
            {DEBITS.map((_, i) => (
                <Banner key={i} i={i} />
            ))}
        </div>
    </AbsoluteFill>
);
