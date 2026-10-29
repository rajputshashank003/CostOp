import { Receipt } from "lucide-react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C } from "../brand";
import { useIn } from "../lib";

export const LogoReveal: React.FC = () => {
    const f = useCurrentFrame();
    const r = interpolate(f, [0, 16], [0, 1400], { extrapolateRight: "clamp" });
    const tile = useIn(8, { damping: 11, stiffness: 130 });
    const word = useIn(18, { damping: 14 });
    const tag = useIn(30, { damping: 200 });
    return (
        <AbsoluteFill style={{ background: C.emerald600, clipPath: `circle(${r}px at 50% 50%)` }} className="items-center justify-center">
            <div
                className="bg-white rounded-[3rem] shadow-2xl flex items-center justify-center"
                style={{ width: 240, height: 240, transform: `scale(${tile}) rotate(${interpolate(tile, [0, 1], [-30, 0])}deg)` }}
            >
                <Receipt size={140} color={C.emerald600} strokeWidth={2} />
            </div>
            <div
                className="font-extrabold tracking-tight text-white"
                style={{ fontSize: 170, marginTop: 50, opacity: word, transform: `translateY(${interpolate(word, [0, 1], [60, 0])}px)` }}
            >
                CostOp
            </div>
            <div className="font-semibold" style={{ fontSize: 46, color: C.emerald100, opacity: tag, marginTop: 10 }}>
                SaaS spend, under control.
            </div>
        </AbsoluteFill>
    );
};
