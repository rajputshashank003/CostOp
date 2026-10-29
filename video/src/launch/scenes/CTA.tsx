import { ArrowRight, Receipt } from "lucide-react";
import { AbsoluteFill, interpolate } from "remotion";
import { C } from "../../brand";
import { ramp, useAt, useT, VOLine } from "../Synced";
import { at, B, endOf } from "../timing";

const URL = "costop.in";
export const CTA_T = {
    start: at("Start free"),
    typeFrom: at("at costop.in.") - 0.1,
    typeTo: endOf("costop.in.") + 0.15,
};

export const CTA: React.FC = () => {
    const t = useT();
    const logo = useAt(B.cta + 0.1, { damping: 200, stiffness: 100, mass: 1 });
    const btn = useAt(CTA_T.start - 0.05, { damping: 12, stiffness: 150, mass: 0.8 });
    const typed = interpolate(t, [CTA_T.typeFrom, CTA_T.typeTo], [0, URL.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const done = useAt(CTA_T.typeTo, { damping: 10, stiffness: 160, mass: 0.7 });
    const caret = Math.floor(t * 2.2) % 2 === 0 && typed < URL.length;
    const settle = ramp(t, CTA_T.typeTo + 0.6, B.end);
    return (
        <AbsoluteFill className="items-center" style={{ transform: `scale(${1 + 0.025 * settle})` }}>
            <div className="absolute flex items-center gap-4" style={{ top: 150, opacity: logo, transform: `translateY(${(1 - logo) * 20}px)` }}>
                <Receipt size={64} color={C.emerald600} strokeWidth={2.2} />
                <span className="font-extrabold tracking-tight" style={{ fontSize: 62, color: C.emerald950 }}>
                    CostOp
                </span>
            </div>
            <div className="absolute w-full text-center font-extrabold tracking-tight" style={{ top: 300, fontSize: 116, lineHeight: 1.06, color: C.emerald950 }}>
                <VOLine phrase="Take control of your" />
                <br />
                <VOLine phrase="SaaS spend." hl={[0, 1]} color={C.emerald600} hlColor={C.emerald200} />
            </div>
            <div className="absolute flex items-center gap-8" style={{ top: 650 }}>
                <div
                    className="font-bold text-white rounded-[1.6rem] flex items-center gap-4"
                    style={{
                        background: C.emerald600,
                        fontSize: 40,
                        padding: "26px 46px",
                        boxShadow: `0 24px 60px -18px ${C.emerald600}aa`,
                        opacity: btn,
                        transform: `scale(${interpolate(btn, [0, 1], [0.7, 1])})`,
                    }}
                >
                    Start free <ArrowRight size={40} strokeWidth={2.6} />
                </div>
                <div
                    className="bg-white rounded-full flex items-center gap-4 border border-slate-200"
                    style={{
                        height: 96,
                        minWidth: 420,
                        padding: "0 40px",
                        fontSize: 44,
                        boxShadow: `0 20px 50px -20px rgba(2,44,34,0.3), 0 0 0 ${done * 5}px rgba(16,185,129,${0.35 * done})`,
                        opacity: btn,
                        transform: `scale(${(interpolate(btn, [0, 1], [0.7, 1])) * (1 + 0.05 * Math.sin(Math.min(done, 1) * Math.PI))})`,
                    }}
                >
                    <span className="text-slate-400">⌕</span>
                    <span className="font-bold" style={{ color: C.slate900 }}>
                        {URL.slice(0, Math.floor(typed))}
                        <span style={{ opacity: caret ? 1 : 0, color: C.emerald600 }}>|</span>
                    </span>
                </div>
            </div>
        </AbsoluteFill>
    );
};
