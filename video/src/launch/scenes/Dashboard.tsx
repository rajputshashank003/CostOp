import { AbsoluteFill, interpolate } from "remotion";
import { C } from "../../brand";
import {
    AIIcon,
    ArrowDownToLine,
    BrowserFrame,
    DeptCard,
    DupIcon,
    GradIcon,
    Header,
    inr,
    InsightRow,
    InsightShell,
    RenewalRow,
    RenewalsCard,
    SeatIcon,
    Sidebar,
    SpendCard,
    Tile,
    Users,
} from "../appui";
import { ramp, useAt, useT, VOLine } from "../Synced";
import { at, B, counterAt, endOf } from "../timing";

const BX = 180;
const BY = 165;
const BW = 1560;
const BH = 880;
// AI Insights card centre, in screen coordinates (camera zoom target)
const FOCUS = { x: BX + 1328, y: BY + 52 + 560 };

const Pop: React.FC<{ t0: number; children: React.ReactNode; className?: string }> = ({ t0, children, className }) => {
    const s = useAt(t0, { damping: 15, stiffness: 140, mass: 0.8 });
    return (
        <div className={className} style={{ opacity: s, transform: `translateY(${interpolate(s, [0, 1], [30, 0])}px) scale(${interpolate(s, [0, 1], [0.96, 1])})` }}>
            {children}
        </div>
    );
};

const Slide: React.FC<{ t0: number; children: React.ReactNode }> = ({ t0, children }) => {
    const s = useAt(t0);
    return <div style={{ opacity: s, transform: `translateX(${interpolate(s, [0, 1], [24, 0])}px)` }}>{children}</div>;
};

export const DASH_T = {
    spend: at("subscription"),
    renewals: at("one simple"),
    dept: at("simple"),
    insights: at("dashboard"),
    ai: at("with AI"),
    row1: at("shows you"),
    row2: at("exactly"),
    cut: at("cut."),
};

export const Dashboard: React.FC = () => {
    const t = useT();
    const enter = useAt(B.dashboard, { damping: 18, stiffness: 90, mass: 1 });
    const zoom = ramp(t, DASH_T.ai - 0.1, DASH_T.ai + 0.8);
    const z = 1 - Math.pow(1 - zoom, 3);
    const scale = 1 + 0.95 * z;
    const spend = counterAt(t, DASH_T.spend, endOf("simple dashboard"));
    const glow = interpolate(t, [DASH_T.cut, DASH_T.cut + 0.2, DASH_T.cut + 1], [0, 1, 0.6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const cap1 = 1 - ramp(t, DASH_T.ai - 0.3, DASH_T.ai - 0.05);
    const analyzing = t < DASH_T.row1 - 0.1;

    return (
        <AbsoluteFill>
            <div
                className="absolute"
                style={{
                    left: BX,
                    top: BY,
                    transformOrigin: `${FOCUS.x - BX}px ${FOCUS.y - BY}px`,
                    transform: `translate(${(960 - FOCUS.x) * z}px, ${(620 - FOCUS.y) * z}px) scale(${scale})${
                        // drop the 3D tilt once landed so the camera zoom re-rasterises crisply
                        enter < 0.999 ? ` perspective(1800px) rotateX(${interpolate(enter, [0, 1], [24, 0])}deg) translateY(${interpolate(enter, [0, 1], [420, 0])}px)` : ""
                    }`,
                    opacity: Math.min(1, enter * 2),
                }}
            >
                <BrowserFrame url="costop.in/home" width={BW} height={BH}>
                    <div className="flex h-full">
                        <Sidebar />
                        <div className="flex-1 flex flex-col" style={{ background: "#f0f0f5" }}>
                            <Header />
                            <div className="p-8 flex flex-col gap-6">
                                <div className="grid grid-cols-3 gap-6" style={{ height: 268 }}>
                                    <Pop t0={DASH_T.spend - 0.1}>
                                        <SpendCard value={spend} />
                                    </Pop>
                                    <Pop t0={DASH_T.renewals - 0.1}>
                                        <RenewalsCard>
                                            <Slide t0={DASH_T.renewals + 0.1}>
                                                <RenewalRow name="Figma" tile="bg-purple-100 text-purple-600" date="Nov 2" cost={250} />
                                            </Slide>
                                            <Slide t0={DASH_T.renewals + 0.2}>
                                                <RenewalRow name="Slack" tile="bg-amber-100 text-amber-600" date="Nov 11" cost={180} />
                                            </Slide>
                                            <p className="text-[12px] font-semibold text-slate-400 text-center">+ 3 more renewals</p>
                                        </RenewalsCard>
                                    </Pop>
                                    <Pop t0={DASH_T.dept - 0.1}>
                                        <DeptCard grow={ramp(t, DASH_T.dept, DASH_T.dept + 0.8)} />
                                    </Pop>
                                </div>
                                <div className="flex items-center gap-2 text-[15px] font-bold tracking-wider text-slate-500 mt-1">✦ COST INSIGHTS</div>
                                <div className="grid grid-cols-3 gap-6" style={{ height: 262 }}>
                                    <Pop t0={DASH_T.insights - 0.05}>
                                        <InsightShell
                                            icon={<DupIcon />}
                                            iconClass="bg-emerald-50 text-emerald-600"
                                            title="Duplicate Tools"
                                            badge="1 found"
                                            badgeClass="text-rose-600 bg-rose-50 border-rose-100"
                                            footerR={<span className="text-xs font-bold text-emerald-600">Save {inr(210)}/mo</span>}
                                        >
                                            <InsightRow left={<Tile letter="Z" cls="bg-blue-100 text-blue-600" />} title="Zoom Workplace" sub="Video calls · 2 teams" right={`${inr(350)}/mo`} rightClass="text-rose-500" />
                                            <InsightRow left={<Tile letter="G" cls="bg-emerald-100 text-emerald-700" />} title="Google Meet" sub="Video calls · 3 teams" right={`${inr(210)}/mo`} rightClass="text-rose-500" />
                                        </InsightShell>
                                    </Pop>
                                    <Pop t0={DASH_T.insights + 0.08}>
                                        <InsightShell
                                            icon={<SeatIcon />}
                                            iconClass="bg-emerald-50 text-emerald-600"
                                            title="Unused Seats"
                                            badge="4 seats"
                                            badgeClass="text-rose-600 bg-rose-50 border-rose-100"
                                            footerR={<span className="text-xs font-bold text-rose-500">{inr(72)}/mo wasted</span>}
                                        >
                                            <InsightRow left={<Tile letter="S" cls="bg-amber-100 text-amber-600" />} title="Slack Pro" sub="6/10 seats used" right={`${inr(72)}/mo`} rightClass="text-rose-500" />
                                            <InsightRow left={<Tile letter="F" cls="bg-purple-100 text-purple-600" />} title="Figma" sub="4/4 seats used" right="All used" rightClass="text-emerald-600" />
                                        </InsightShell>
                                    </Pop>
                                    <Pop t0={DASH_T.insights + 0.16}>
                                        <InsightShell
                                            icon={<AIIcon />}
                                            iconClass="bg-gradient-to-br from-emerald-500 to-teal-600"
                                            title="AI Insights"
                                            badge={analyzing ? "Analyzing..." : "3 tips"}
                                            badgeClass={analyzing ? "text-slate-400 bg-slate-50 border-slate-200" : "text-emerald-600 bg-emerald-50 border-emerald-100"}
                                            footerR={
                                                <span
                                                    className="text-xs font-bold text-emerald-600 rounded-md px-1.5 py-0.5"
                                                    style={{ background: `rgba(16,185,129,${0.2 * glow})`, transform: `scale(${1 + 0.12 * glow})`, display: "inline-block" }}
                                                >
                                                    Save up to {inr(200)}/mo
                                                </span>
                                            }
                                        >
                                            {analyzing ? (
                                                <>
                                                    <div className="h-10 bg-slate-50 rounded-xl" />
                                                    <div className="h-10 bg-slate-50 rounded-xl" />
                                                </>
                                            ) : (
                                                <>
                                                    <Slide t0={DASH_T.row1 - 0.05}>
                                                        <InsightRow left={<GradIcon g="from-amber-500 to-orange-600"><ArrowDownToLine size={12} /></GradIcon>} title="Optimize Slack seats" right={`${inr(120)}/mo`} />
                                                    </Slide>
                                                    <Slide t0={DASH_T.row2 - 0.05}>
                                                        <InsightRow left={<GradIcon g="from-violet-500 to-purple-600"><Users size={12} /></GradIcon>} title="Drop Zoom, keep Meet" right={`${inr(80)}/mo`} />
                                                    </Slide>
                                                </>
                                            )}
                                        </InsightShell>
                                    </Pop>
                                </div>
                            </div>
                        </div>
                    </div>
                </BrowserFrame>
            </div>
            {/* captions sit above the product on a soft fade */}
            <div className="absolute inset-x-0 top-0" style={{ height: 210, background: `linear-gradient(${C.emerald50}, ${C.emerald50}e6 60%, transparent)` }} />
            <div className="absolute w-full text-center font-extrabold tracking-tight" style={{ top: 52, fontSize: 64, color: C.emerald950, opacity: cap1 }}>
                <VOLine phrase="every subscription in one simple dashboard" display="Every subscription, in one simple dashboard." hl={[4, 5]} />
            </div>
            <div className="absolute w-full text-center font-extrabold tracking-tight" style={{ top: 52, fontSize: 64, color: C.emerald950 }}>
                <VOLine phrase="with AI that shows you exactly what to cut." display="With AI that shows you exactly what to cut." hl={[5, 6, 7, 8]} />
            </div>
        </AbsoluteFill>
    );
};
