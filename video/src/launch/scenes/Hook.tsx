import { AbsoluteFill, interpolate } from "remotion";
import { C } from "../../brand";
import { SubCard } from "../appui";
import { ramp, useAt, useT, VOLine } from "../Synced";
import { at } from "../timing";

export const HOOK_CARDS = [
    { name: "Figma", tile: "bg-purple-100 text-purple-600", cat: "DESIGN", amount: 250, next: "Nov 2", plan: "Team Plan (4 seats)", word: "your" },
    { name: "Slack", tile: "bg-amber-100 text-amber-600", cat: "COMMUNICATION", amount: 180, next: "Nov 11", plan: "Pro (10 seats)", word: "team" },
    { name: "Cursor", tile: "bg-slate-200 text-slate-800", cat: "AI", amount: 160, next: "Nov 14", plan: "Team Plan (4 seats)", word: "pays" },
    { name: "Notion", tile: "bg-stone-100 text-stone-700", cat: "PRODUCTIVITY", amount: 120, next: "Nov 20", plan: "Plus (6 seats)", word: "for" },
    { name: "Canva", tile: "bg-sky-100 text-sky-600", cat: "MARKETING", amount: 100, next: "Nov 28", plan: "Pro (1 seat)", word: "software" },
];

const Card: React.FC<{ i: number; dim: number }> = ({ i, dim }) => {
    const c = HOOK_CARDS[i];
    const s = useAt(at(c.word) - 0.05, { damping: 13, stiffness: 140, mass: 0.8 });
    const t = useT();
    const float = Math.sin(t * 1.3 + i) * 6;
    const rot = (i - 2) * 2.2;
    return (
        <div
            style={{
                opacity: Math.min(1, s * 1.4) * interpolate(dim, [0, 1], [1, 0.35]),
                filter: `grayscale(${dim}) blur(${dim * 2}px)`,
                transform: `translateY(${interpolate(s, [0, 1], [180, 0]) + float + Math.abs(i - 2) * 24 + dim * 70}px) rotate(${rot * s}deg) scale(${interpolate(s, [0, 1], [0.85, 1])})`,
                margin: "0 -6px",
            }}
        >
            <SubCard {...c} />
        </div>
    );
};

export const Hook: React.FC = () => {
    const t = useT();
    const swap = at("but how") - 0.25;
    const out = ramp(t, swap, swap + 0.35);
    const dim = ramp(t, swap, swap + 0.6);
    return (
        <AbsoluteFill className="items-center">
            <div
                className="absolute w-full text-center font-extrabold tracking-tight"
                style={{ top: 190, fontSize: 92, color: C.emerald950, opacity: 1 - out, transform: `translateY(${-out * 50}px)`, filter: `blur(${out * 8}px)` }}
            >
                <VOLine phrase="Every month, your team pays for software," display="Every month, your team pays for software." hl={[6]} />
            </div>
            <div className="absolute flex justify-center" style={{ top: 420, left: 0, right: 0 }}>
                {HOOK_CARDS.map((_, i) => (
                    <Card key={i} i={i} dim={dim} />
                ))}
            </div>
            <div className="absolute w-full text-center font-extrabold tracking-tight" style={{ top: 260, fontSize: 104, lineHeight: 1.08, color: C.emerald950 }}>
                <VOLine phrase="but how much of it" display="But how much of it…" />
                <br />
                <VOLine phrase="does anyone actually use?" hl={[2, 3]} />
            </div>
        </AbsoluteFill>
    );
};
