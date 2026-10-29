import { AbsoluteFill, interpolate } from "remotion";
import { C } from "../brand";
import { Highlight, Pop, useCount, useIn, Words } from "../lib";
import { HeroRow, HeroSpendCard, Zoom } from "../ui";

const ROWS = [
    { n: "Figma Team", c: "$145.00", d: "Renews in 3 days", color: "bg-purple-100 text-purple-600" },
    { n: "Slack Pro", c: "$89.50", d: "Renews in 12 days", color: "bg-amber-100 text-amber-600" },
    { n: "Github Copilot", c: "$19.00", d: "Renews in 21 days", color: "bg-slate-100 text-slate-600" },
];

const Row: React.FC<{ i: number }> = ({ i }) => {
    const s = useIn(42 + i * 6);
    return <HeroRow {...ROWS[i]} style={{ opacity: s, transform: `translateX(${interpolate(s, [0, 1], [30, 0])}px)` }} />;
};

export const Hook: React.FC = () => {
    const total = useCount(2459, 28, 70);
    return (
        <AbsoluteFill className="items-center" style={{ paddingTop: 300 }}>
            <div className="font-extrabold tracking-tight text-center" style={{ color: C.emerald950, fontSize: 108, lineHeight: 1.04, width: 940 }}>
                <Words text="Your team pays" />
                <br />
                <Words text="for tools" delay={8} />
                <br />
                <Highlight delay={24}>
                    <Words text="nobody opens." delay={14} />
                </Highlight>
            </div>
            <Pop delay={26} style={{ marginTop: 100 }}>
                <Zoom k={1.75} width={520}>
                    <HeroSpendCard total={total} rows={[0, 1, 2].map((i) => <Row key={i} i={i} />)} />
                </Zoom>
            </Pop>
        </AbsoluteFill>
    );
};
