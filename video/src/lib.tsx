import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { TransitionPresentation, TransitionPresentationComponentProps } from "@remotion/transitions";
import { C } from "./brand";

type SpringCfg = { damping?: number; stiffness?: number; mass?: number };

export const useIn = (delay = 0, config: SpringCfg = { damping: 14, stiffness: 120, mass: 0.8 }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    return spring({ frame: frame - delay, fps, config });
};

export const useCount = (to: number, start: number, end: number, from = 0) => {
    const frame = useCurrentFrame();
    return interpolate(frame, [start, end], [from, to], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.cubic),
    });
};

// Kinetic headline: each word springs up out of a blur
export const Words: React.FC<{ text: string; delay?: number; stagger?: number; className?: string; style?: React.CSSProperties }> = ({
    text,
    delay = 0,
    stagger = 3,
    className,
    style,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    return (
        <span className={className} style={style}>
            {text.split(" ").map((w, i, all) => {
                const s = spring({ frame: frame - delay - i * stagger, fps, config: { damping: 13, stiffness: 140 } });
                return (
                    <span
                        key={i}
                        style={{
                            display: "inline-block",
                            marginRight: i < all.length - 1 ? "0.25em" : 0,
                            opacity: Math.min(1, s * 1.4),
                            transform: `translateY(${interpolate(s, [0, 1], [70, 0])}px)`,
                            filter: `blur(${interpolate(s, [0, 1], [10, 0], { extrapolateRight: "clamp" })}px)`,
                        }}
                    >
                        {w}
                    </span>
                );
            })}
        </span>
    );
};

// Marker-style swipe behind text, like the site's "SaaS spend." underline
export const Highlight: React.FC<{ children: React.ReactNode; delay: number; color?: string }> = ({ children, delay, color = C.emerald200 }) => {
    const s = useIn(delay, { damping: 200 });
    return (
        <span style={{ position: "relative", display: "inline-block" }}>
            <span
                style={{
                    position: "absolute",
                    left: -14,
                    right: -2,
                    top: "18%",
                    bottom: "2%",
                    background: color,
                    borderRadius: 18,
                    transform: `scaleX(${s})`,
                    transformOrigin: "left center",
                }}
            />
            <span style={{ position: "relative" }}>{children}</span>
        </span>
    );
};

// Pop-in wrapper (scale + rise + fade)
export const Pop: React.FC<{ delay: number; children: React.ReactNode; from?: number; y?: number; style?: React.CSSProperties; className?: string }> = ({
    delay,
    children,
    from = 0.85,
    y = 60,
    style,
    className,
}) => {
    const s = useIn(delay);
    return (
        <div
            className={className}
            style={{
                ...style,
                opacity: Math.min(1, s * 1.5),
                transform: `translateY(${interpolate(s, [0, 1], [y, 0])}px) scale(${interpolate(s, [0, 1], [from, 1])})`,
            }}
        >
            {children}
        </div>
    );
};

// Whip transition: vertical slide with a motion-blur smear in the middle
const Whip: React.FC<TransitionPresentationComponentProps<Record<string, unknown>>> = ({ children, presentationDirection, presentationProgress }) => {
    const p = presentationProgress;
    const y = presentationDirection === "entering" ? (1 - p) * 100 : -p * 100;
    const blur = Math.sin(p * Math.PI) * 28;
    return (
        <AbsoluteFill style={{ transform: `translateY(${y}%)`, filter: `blur(${blur}px)` }}>{children}</AbsoluteFill>
    );
};

export const whip = (): TransitionPresentation<Record<string, unknown>> => ({ component: Whip, props: {} });
