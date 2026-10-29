import { Receipt } from "lucide-react";
import { AbsoluteFill, interpolate } from "remotion";
import { C } from "../../brand";
import { ramp, useAt, useT } from "../Synced";
import { at, B } from "../timing";

export const Logo: React.FC = () => {
    const t = useT();
    const r = interpolate(ramp(t, B.logo, B.logo + 0.45), [0, 1], [0, 1300]);
    const meet = useAt(at("Meet"), { damping: 200, stiffness: 120, mass: 1 });
    const tile = useAt(at("Meet") - 0.02, { damping: 11, stiffness: 130, mass: 0.8 });
    const word = useAt(at("Costop,") - 0.06, { damping: 14, stiffness: 140, mass: 0.8 });
    return (
        <AbsoluteFill style={{ background: C.emerald600, clipPath: `circle(${r}px at 50% 50%)` }} className="items-center justify-center">
            <div className="font-semibold" style={{ fontSize: 48, color: C.emerald100, opacity: meet, marginBottom: 34, transform: `translateY(${(1 - meet) * 20}px)` }}>
                Meet
            </div>
            <div className="flex items-center gap-10">
                <div
                    className="bg-white rounded-[2.75rem] flex items-center justify-center"
                    style={{ width: 200, height: 200, boxShadow: "0 30px 80px -20px rgba(0,0,0,0.35)", transform: `scale(${tile}) rotate(${interpolate(tile, [0, 1], [-25, 0])}deg)` }}
                >
                    <Receipt size={118} color={C.emerald600} strokeWidth={2} />
                </div>
                <div
                    className="font-extrabold tracking-tight text-white"
                    style={{ fontSize: 190, opacity: word, transform: `translateX(${interpolate(word, [0, 1], [-50, 0])}px)`, filter: `blur(${(1 - word) * 10}px)` }}
                >
                    CostOp
                </div>
            </div>
        </AbsoluteFill>
    );
};
