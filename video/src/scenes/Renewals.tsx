import { CreditCard } from "lucide-react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { C, usd } from "../brand";
import { Highlight, Words } from "../lib";

const CHARGES = [
    { amount: 1188, what: "Notion · Annual plan renewed", at: 8 },
    { amount: 659.88, what: "Adobe CC · Auto-renewed", at: 30 },
    { amount: 2400, what: "Salesforce · 10 seats renewed", at: 52 },
];

const Notification: React.FC<{ i: number }> = ({ i }) => {
    const f = useCurrentFrame();
    const { fps } = useVideoConfig();
    const ch = CHARGES[i];
    const s = spring({ frame: f - ch.at, fps, config: { damping: 13, stiffness: 150 } });
    // Each later card pushes this one down
    const pushes = CHARGES.slice(i + 1).reduce(
        (acc, c) => acc + spring({ frame: f - c.at, fps, config: { damping: 15, stiffness: 150 } }),
        0,
    );
    const shake = Math.sin((f - ch.at) * 2.4) * interpolate(f - ch.at, [6, 22], [14, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return (
        <div
            className="absolute bg-white/95 rounded-[2.75rem] shadow-2xl flex items-center gap-7 px-9 py-8"
            style={{
                width: 940,
                left: 70,
                top: 0,
                opacity: Math.min(1, s * 1.5) * interpolate(pushes, [1, 2], [1, 0.55], { extrapolateLeft: "clamp" }),
                transform: `translateY(${interpolate(s, [0, 1], [-260, 0]) + pushes * 232}px) translateX(${shake}px) scale(${1 - pushes * 0.04})`,
            }}
        >
            <div className="w-24 h-24 rounded-3xl flex items-center justify-center flex-shrink-0" style={{ background: C.rose100 }}>
                <CreditCard size={52} color={C.rose500} strokeWidth={2.2} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-400 uppercase tracking-widest" style={{ fontSize: 26 }}>
                        Card •••• 4242
                    </span>
                    <span className="font-semibold text-slate-400" style={{ fontSize: 26 }}>
                        now
                    </span>
                </div>
                <div className="font-extrabold text-slate-900" style={{ fontSize: 46, marginTop: 4 }}>
                    Charged {usd.format(ch.amount)}
                </div>
                <div className="font-semibold text-slate-500" style={{ fontSize: 32 }}>
                    {ch.what}
                </div>
            </div>
        </div>
    );
};

export const Renewals: React.FC = () => (
    <AbsoluteFill>
        <div className="absolute" style={{ top: 230, left: 0, right: 0, height: 760 }}>
            {CHARGES.map((_, i) => (
                <Notification key={i} i={i} />
            ))}
        </div>
        <div className="absolute w-full font-extrabold tracking-tight text-center" style={{ top: 1140, color: C.emerald950, fontSize: 112, lineHeight: 1.04 }}>
            <Words text="Renewals you" delay={36} />
            <br />
            <Highlight delay={56} color="#fecdd3">
                <Words text="forgot about." delay={44} />
            </Highlight>
        </div>
    </AbsoluteFill>
);
