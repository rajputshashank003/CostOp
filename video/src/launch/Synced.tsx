import React, { createContext, useContext } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C } from "../brand";
import { findPhrase, VO, words } from "./timing";

// Absolute start time (s) of the scene we're inside, so children can sync to the voiceover
const SceneStart = createContext(0);
export const Scene: React.FC<{ start: number; children: React.ReactNode }> = ({ start, children }) => (
    <SceneStart.Provider value={start}>{children}</SceneStart.Provider>
);

// Current absolute video time in seconds
export const useT = () => {
    const frame = useCurrentFrame();
    const start = useContext(SceneStart);
    return start + frame / 30;
};

// Spring that fires at an absolute time
export const useAt = (t: number, config = { damping: 14, stiffness: 120, mass: 0.8 }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const start = useContext(SceneStart);
    return spring({ frame: frame - Math.round((t - start) * fps), fps, config });
};

export const ramp = (t: number, t0: number, t1: number) =>
    interpolate(t, [t0, t1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

// A line of text whose words appear exactly as the narrator says them.
// `display` must have the same number of words as the spoken phrase.
export const VOLine: React.FC<{
    phrase: string;
    display?: string;
    hl?: number[]; // word indexes (within the phrase) that get the marker
    hlColor?: string;
    color?: string;
    lead?: number; // seconds a word appears before it is spoken
    style?: React.CSSProperties;
}> = ({ phrase, display, hl = [], hlColor = C.emerald200, color, lead = 0.08, style }) => {
    const t = useT();
    const i0 = findPhrase(phrase);
    const toks = (display ?? phrase).split(" ");
    return (
        <span style={style}>
            {toks.map((raw, k) => {
                const glue = raw.endsWith("~"); // "auto-~" renders glued to the next word
                const tok = glue ? raw.slice(0, -1) : raw;
                const w = words[i0 + k];
                const ws = VO + w.start - lead;
                const p = spring({ frame: Math.round((t - ws) * 30), fps: 30, config: { damping: 15, stiffness: 150 } });
                const marked = hl.includes(k);
                const m = marked ? spring({ frame: Math.round((t - ws - 0.05) * 30), fps: 30, config: { damping: 200 } }) : 0;
                return (
                    <span key={k} style={{ position: "relative", display: "inline-block", marginRight: k < toks.length - 1 && !glue ? "0.24em" : 0 }}>
                        {marked && (
                            <span
                                style={{
                                    position: "absolute",
                                    left: "-0.14em",
                                    right: hl.includes(k + 1) ? "-0.38em" : "-0.14em",
                                    top: "16%",
                                    bottom: "2%",
                                    background: hlColor,
                                    borderRadius: "0.16em",
                                    transform: `scaleX(${m})`,
                                    transformOrigin: "left center",
                                }}
                            />
                        )}
                        <span
                            style={{
                                position: "relative",
                                display: "inline-block",
                                color,
                                opacity: Math.min(1, p * 1.4),
                                transform: `translateY(${interpolate(p, [0, 1], [0.35, 0])}em)`,
                                filter: `blur(${interpolate(p, [0, 1], [8, 0], { extrapolateRight: "clamp" })}px)`,
                            }}
                        >
                            {tok}
                        </span>
                    </span>
                );
            })}
        </span>
    );
};
