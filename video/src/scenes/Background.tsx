import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C } from "../brand";

export const Background: React.FC = () => {
    const f = useCurrentFrame();
    return (
        <AbsoluteFill style={{ background: C.emerald50, overflow: "hidden" }}>
            <div
                style={{
                    position: "absolute",
                    width: 900,
                    height: 900,
                    borderRadius: "50%",
                    background: C.emerald200,
                    opacity: 0.55,
                    filter: "blur(160px)",
                    left: -300 + Math.sin(f / 70) * 120,
                    top: -200 + Math.cos(f / 90) * 100,
                }}
            />
            <div
                style={{
                    position: "absolute",
                    width: 800,
                    height: 800,
                    borderRadius: "50%",
                    background: C.emerald100,
                    opacity: 0.9,
                    filter: "blur(140px)",
                    right: -280 + Math.cos(f / 80) * 120,
                    bottom: -160 + Math.sin(f / 60) * 100,
                }}
            />
        </AbsoluteFill>
    );
};
