import { ArrowDownToLine, TrendingDown, Users } from "lucide-react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C } from "../brand";
import { Highlight, Pop, useCount, useIn, Words } from "../lib";
import { AIInsights, InsightRow, RenewalItem, RenewalsWidget, SpendWidget, Zoom } from "../ui";

const Slide: React.FC<{ delay: number; children: React.ReactNode }> = ({ delay, children }) => {
    const s = useIn(delay);
    return <div style={{ opacity: s, transform: `translateX(${interpolate(s, [0, 1], [24, 0])}px)` }}>{children}</div>;
};

export const Dashboard: React.FC = () => {
    const f = useCurrentFrame();
    const spend = useCount(2459, 18, 60);
    const total = useCount(312, 70, 110);
    const glow = interpolate(f, [110, 120, 135], [0, 1, 0.6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return (
        <AbsoluteFill className="items-center" style={{ paddingTop: 150, transform: `translateY(${interpolate(f, [0, 180], [20, -40])}px)` }}>
            <div className="font-extrabold tracking-tight text-center" style={{ color: C.emerald950, fontSize: 104, lineHeight: 1.04 }}>
                <Words text="Every tool." />
                <br />
                <Highlight delay={14}>
                    <Words text="One dashboard." delay={6} />
                </Highlight>
            </div>
            <Zoom k={1.9} width={500} style={{ marginTop: 34 }}>
                <div className="flex flex-col gap-4">
                    <Pop delay={14} y={30} from={0.94}>
                        <SpendWidget value={spend} />
                    </Pop>
                    <Pop delay={30} y={30} from={0.94}>
                        <RenewalsWidget>
                            <Slide delay={40}>
                                <RenewalItem name="Figma Team" date="Nov 2" cost={145} />
                            </Slide>
                            <Slide delay={46}>
                                <RenewalItem name="Slack Pro" date="Nov 11" cost={89.5} />
                            </Slide>
                        </RenewalsWidget>
                    </Pop>
                    <Pop delay={56} y={30} from={0.94}>
                        <AIInsights total={total} glow={glow}>
                            <Slide delay={66}>
                                <InsightRow icon={<ArrowDownToLine size={12} />} gradient="from-amber-500 to-orange-600" title="Remove 4 unused Slack seats" save={35} />
                            </Slide>
                            <Slide delay={72}>
                                <InsightRow icon={<Users size={12} />} gradient="from-violet-500 to-purple-600" title="Zoom + Meet overlap" save={15.99} />
                            </Slide>
                            <Slide delay={78}>
                                <InsightRow icon={<TrendingDown size={12} />} gradient="from-rose-500 to-pink-600" title="Downgrade Miro to Free" save={80} />
                            </Slide>
                        </AIInsights>
                    </Pop>
                </div>
            </Zoom>
        </AbsoluteFill>
    );
};
