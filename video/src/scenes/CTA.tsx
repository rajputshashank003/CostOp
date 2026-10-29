import { ArrowRight, MousePointer2, Receipt } from "lucide-react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C } from "../brand";
import { Pop, useIn, Words } from "../lib";

export const CTA: React.FC = () => {
    const f = useCurrentFrame();
    const underline = useIn(22, { damping: 200 });
    const cursor = useIn(46, { damping: 18 });
    const press = interpolate(f, [66, 70, 76], [1, 0.93, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const ripple = interpolate(f, [70, 92], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return (
        <AbsoluteFill className="items-center" style={{ paddingTop: 330 }}>
            <Pop delay={0} y={20}>
                <div className="flex items-center gap-5">
                    <Receipt size={84} color={C.emerald600} strokeWidth={2.2} />
                    <span className="font-extrabold tracking-tight" style={{ fontSize: 84, color: C.emerald950 }}>
                        CostOp
                    </span>
                </div>
            </Pop>
            <div className="font-extrabold tracking-tight text-center" style={{ color: C.emerald950, fontSize: 124, lineHeight: 1.05, marginTop: 130 }}>
                <Words text="Take control" delay={4} />
                <br />
                <Words text="of your" delay={8} />
                <br />
                <span style={{ position: "relative", display: "inline-block", color: C.emerald600 }}>
                    <Words text="SaaS spend." delay={12} />
                    <svg
                        viewBox="0 0 100 10"
                        preserveAspectRatio="none"
                        style={{ position: "absolute", left: 0, bottom: 4, width: "100%", height: 34, zIndex: -1, transform: `scaleX(${underline})`, transformOrigin: "left" }}
                    >
                        <path d="M0 5 Q 50 10 100 5 L 100 10 L 0 10 Z" fill={C.emerald300} />
                    </svg>
                </span>
            </div>
            <Pop delay={30} style={{ marginTop: 130, position: "relative" }}>
                <div
                    className="font-bold text-white rounded-[2.25rem] flex items-center gap-6"
                    style={{
                        background: C.emerald600,
                        fontSize: 54,
                        padding: "40px 64px",
                        boxShadow: `0 30px 70px -20px ${C.emerald600}99, 0 0 0 ${ripple * 40}px rgba(16,185,129,${0.35 * (1 - ripple)})`,
                        transform: `scale(${press})`,
                    }}
                >
                    Start Tracking for Free
                    <ArrowRight size={56} strokeWidth={2.6} />
                </div>
                <div
                    style={{
                        position: "absolute",
                        right: 60,
                        bottom: -70,
                        opacity: cursor,
                        transform: `translate(${interpolate(cursor, [0, 1], [260, 0])}px, ${interpolate(cursor, [0, 1], [240, 0])}px) scale(${press})`,
                    }}
                >
                    <MousePointer2 size={88} fill={C.slate900} color="white" strokeWidth={1.5} />
                </div>
            </Pop>
            <Pop delay={84} style={{ marginTop: 120 }}>
                <div className="font-extrabold tracking-tight" style={{ fontSize: 96, color: C.emerald950 }}>
                    costop.in
                </div>
            </Pop>
        </AbsoluteFill>
    );
};
