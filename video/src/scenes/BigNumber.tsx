import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, usd } from "../brand";
import { Pop, useCount, useIn } from "../lib";

const TICKER = Array.from({ length: 90 }, (_, i) => 1533 + ((i * 37) % 5) * 11.5);

export const BigNumber: React.FC = () => {
    const f = useCurrentFrame();
    const value = useCount(18396, 8, 72);
    const punch = useIn(72, { damping: 8, stiffness: 200 });
    const pill = useIn(80, { damping: 10, stiffness: 160 });
    return (
        <AbsoluteFill className="items-center justify-center">
            {/* Scrolling monthly charges behind the number */}
            <div className="absolute font-bold text-slate-900" style={{ left: 70, top: 0, fontSize: 40, opacity: 0.12, transform: `translateY(${-f * 14}px)` }}>
                {TICKER.map((v, i) => (
                    <div key={i} style={{ lineHeight: "64px", filter: "blur(1.5px)" }}>
                        {usd.format(v)}
                    </div>
                ))}
            </div>
            <div className="absolute font-bold text-slate-900 text-right" style={{ right: 70, top: -2400, fontSize: 40, opacity: 0.1, transform: `translateY(${f * 10}px)` }}>
                {TICKER.map((v, i) => (
                    <div key={i} style={{ lineHeight: "64px", filter: "blur(3px)" }}>
                        {usd.format(v * 0.6)}
                    </div>
                ))}
            </div>
            <Pop delay={0}>
                <div className="font-bold text-center" style={{ fontSize: 52, color: C.emerald950, opacity: 0.65, marginBottom: 20 }}>
                    That adds up to
                </div>
            </Pop>
            <div
                className="font-black tracking-tighter"
                style={{
                    fontSize: 230,
                    lineHeight: 1,
                    color: C.slate900,
                    fontVariantNumeric: "tabular-nums",
                    transform: `scale(${1 + 0.08 * Math.sin(Math.min(punch, 1) * Math.PI)})`,
                }}
            >
                ${Math.round(value).toLocaleString("en-US")}
            </div>
            <div
                className="bg-white shadow-xl rounded-3xl font-extrabold"
                style={{
                    fontSize: 80,
                    color: C.emerald950,
                    padding: "14px 44px",
                    marginTop: 30,
                    transform: `scale(${pill}) rotate(${interpolate(pill, [0, 1], [-14, -4])}deg)`,
                }}
            >
                /year
            </div>
            <Pop delay={98} style={{ marginTop: 80 }}>
                <div className="font-bold text-center" style={{ fontSize: 54, color: C.emerald950, width: 860, lineHeight: 1.25 }}>
                    on software nobody uses.
                </div>
            </Pop>
        </AbsoluteFill>
    );
};
