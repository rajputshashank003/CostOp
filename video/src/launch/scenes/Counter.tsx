import { AbsoluteFill, interpolate } from "remotion";
import { C } from "../../brand";
import { inr } from "../appui";
import { useAt, useT, VOLine } from "../Synced";
import { at, counterAt, endOf } from "../timing";

export const COUNT_T0 = at("thousands");
export const COUNT_T1 = endOf("every year.");

const TICKER = Array.from({ length: 60 }, (_, i) => 99 + ((i * 37) % 9) * 50);

export const Counter: React.FC = () => {
    const t = useT();
    const v = counterAt(t, COUNT_T0, COUNT_T1);
    const land = useAt(COUNT_T1, { damping: 8, stiffness: 220, mass: 0.6 });
    const num = useAt(COUNT_T0 - 0.15, { damping: 14, stiffness: 140, mass: 0.8 });
    return (
        <AbsoluteFill className="items-center">
            {[0, 1, 2, 3].map((col) => (
                <div
                    key={col}
                    className="absolute font-bold text-slate-900"
                    style={{
                        left: [90, 420, 1330, 1640][col],
                        top: col % 2 ? -1800 : 0,
                        fontSize: 30,
                        opacity: 0.07,
                        transform: `translateY(${(col % 2 ? 1 : -1) * (t - 17) * 220}px)`,
                        filter: `blur(${col === 1 || col === 2 ? 3 : 1}px)`,
                    }}
                >
                    {TICKER.map((x, i) => (
                        <div key={i} style={{ lineHeight: "52px" }}>
                            {inr(x + col * 10)} debited
                        </div>
                    ))}
                </div>
            ))}
            <div className="absolute w-full text-center font-bold" style={{ top: 230, fontSize: 64, color: C.emerald950, opacity: 0.75 }}>
                <VOLine phrase="It adds up" display="It adds up." />
            </div>
            <div
                className="absolute w-full text-center font-black tracking-tighter"
                style={{
                    top: 350,
                    fontSize: 250,
                    lineHeight: 1,
                    color: C.slate900,
                    fontVariantNumeric: "tabular-nums",
                    opacity: num,
                    transform: `scale(${interpolate(num, [0, 1], [0.85, 1]) * (1 + 0.07 * Math.sin(Math.min(land, 1) * Math.PI))})`,
                }}
            >
                {inr(v)}
            </div>
            <div className="absolute w-full flex justify-center" style={{ top: 660 }}>
                <div className="bg-white shadow-xl rounded-3xl font-extrabold" style={{ fontSize: 60, color: C.emerald950, padding: "10px 40px", transform: "rotate(-3deg)" }}>
                    <VOLine phrase="every year." lead={0.05} />
                </div>
            </div>
        </AbsoluteFill>
    );
};
