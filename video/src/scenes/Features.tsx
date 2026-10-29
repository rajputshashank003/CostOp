import { BellRing, Copy, UserX } from "lucide-react";
import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";
import { C } from "../brand";
import { Highlight, Pop, useIn, Words } from "../lib";
import { HeroRow, Zoom } from "../ui";

export const BEAT = 46;

const BEATS = [
    {
        Icon: BellRing,
        line1: "Alerts before",
        line2: "you're charged.",
        row: { n: "Figma Team", c: "", d: "Auto-renews Nov 2", color: "bg-purple-100 text-purple-600" },
        chip: "Renews in 3 days",
        chipClass: "text-amber-700 bg-amber-50 border-amber-100",
    },
    {
        Icon: UserX,
        line1: "Spot unused",
        line2: "seats.",
        row: { n: "Slack Pro", c: "", d: "16 of 20 seats active", color: "bg-amber-100 text-amber-600" },
        chip: "Save $35.00/mo",
        chipClass: "text-emerald-700 bg-emerald-50 border-emerald-100",
    },
    {
        Icon: Copy,
        line1: "Cut duplicate",
        line2: "tools.",
        row: { n: "Zoom Pro", c: "", d: "Overlaps with Google Meet", color: "bg-blue-100 text-blue-600" },
        chip: "Duplicate",
        chipClass: "text-violet-700 bg-violet-50 border-violet-100",
    },
];

const Beat: React.FC<{ i: number }> = ({ i }) => {
    const f = useCurrentFrame();
    const b = BEATS[i];
    const icon = useIn(0, { damping: 11, stiffness: 160 });
    const chip = useIn(16, { damping: 10, stiffness: 180 });
    const last = i === BEATS.length - 1;
    const out = last ? 0 : interpolate(f, [BEAT - 8, BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return (
        <AbsoluteFill
            className="items-center justify-center"
            style={{ opacity: 1 - out, transform: `translateX(${-out * 300}px)`, filter: `blur(${out * 16}px)` }}
        >
            <div
                className="w-44 h-44 rounded-[2.75rem] bg-white shadow-xl flex items-center justify-center"
                style={{ transform: `scale(${icon}) rotate(${interpolate(icon, [0, 1], [20, 0])}deg)` }}
            >
                <b.Icon size={96} color={C.emerald600} strokeWidth={2.2} />
            </div>
            <div className="font-extrabold tracking-tight text-center" style={{ color: C.emerald950, fontSize: 110, lineHeight: 1.04, marginTop: 60 }}>
                <Words text={b.line1} stagger={2} />
                <br />
                <Highlight delay={10}>
                    <Words text={b.line2} delay={4} stagger={2} />
                </Highlight>
            </div>
            <Pop delay={10} style={{ marginTop: 80 }}>
                <Zoom k={2} width={460}>
                    <HeroRow
                        {...b.row}
                        right={
                            <span className={`text-[12px] font-bold px-2 py-1 rounded-md border ${b.chipClass}`} style={{ transform: `scale(${chip})`, display: "inline-block" }}>
                                {b.chip}
                            </span>
                        }
                    />
                </Zoom>
            </Pop>
        </AbsoluteFill>
    );
};

export const Features: React.FC = () => (
    <AbsoluteFill>
        {BEATS.map((_, i) => (
            <Sequence key={i} from={i * BEAT} durationInFrames={i === BEATS.length - 1 ? Infinity : BEAT}>
                <Beat i={i} />
            </Sequence>
        ))}
    </AbsoluteFill>
);
