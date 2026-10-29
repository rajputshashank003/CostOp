import { Bell, Receipt } from "lucide-react";
import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { C } from "../../brand";
import { DupIcon, inr, InsightRow, InsightShell, RenewalRow, RenewalsCard, SeatIcon, Tile } from "../appui";
import { ramp, useAt, useT, VOLine } from "../Synced";
import { at, B } from "../timing";

export const FEAT_T = {
    a: B.features,
    alert: at("alerted"),
    b: at("See the seats") - 0.3,
    nobody: at("nobody"),
    c: at("Catch the") - 0.3,
    same: at("same job."),
};

// Beat wrapper: slides in from the right at t0, out to the left at t1
const Beat: React.FC<{ t0: number; t1: number; children: React.ReactNode }> = ({ t0, t1, children }) => {
    const t = useT();
    const i = useAt(t0, { damping: 16, stiffness: 120, mass: 0.8 });
    const o = ramp(t, t1 - 0.25, t1);
    if (t > t1 + 0.05) return null;
    return (
        <AbsoluteFill style={{ opacity: Math.min(1, i * 1.5) * (1 - o), transform: `translateX(${interpolate(i, [0, 1], [80, 0]) - o * 120}px)`, filter: `blur(${o * 12}px)` }}>
            {children}
        </AbsoluteFill>
    );
};

const Text: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="absolute font-extrabold tracking-tight" style={{ left: 140, top: 380, width: 760, fontSize: 84, lineHeight: 1.08, color: C.emerald950 }}>
        {children}
    </div>
);

const Right: React.FC<{ children: React.ReactNode; zoom?: number; top?: number }> = ({ children, zoom = 1.6, top = 300 }) => (
    <div className="absolute" style={{ left: 1000, top }}>
        <div style={{ zoom }}>{children}</div>
    </div>
);

const Alert: React.FC = () => {
    const s = useAt(FEAT_T.alert - 0.05, { damping: 13, stiffness: 150, mass: 0.8 });
    const t = useT();
    const ring = Math.sin(Math.max(0, t - FEAT_T.alert) * 30) * interpolate(t - FEAT_T.alert, [0, 0.7], [18, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return (
        <div
            className="bg-white rounded-[1.25rem] flex items-center gap-4 px-5 py-4 border border-slate-100"
            style={{ width: 470, boxShadow: "0 25px 60px -20px rgba(2,44,34,0.35)", opacity: s, transform: `translateY(${interpolate(s, [0, 1], [-60, 0])}px)` }}
        >
            <div className="w-11 h-11 rounded-xl bg-emerald-600 flex items-center justify-center flex-shrink-0">
                <Receipt size={24} color="white" />
            </div>
            <div className="flex-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    <span>CostOp</span>
                    <span style={{ transform: `rotate(${ring}deg)`, display: "inline-block" }}>
                        <Bell size={14} className="text-amber-500" />
                    </span>
                </div>
                <div className="text-[16px] font-extrabold text-slate-900">Figma renews in 3 days</div>
                <div className="text-[12px] font-semibold text-slate-500">{inr(250)} will be charged on Nov 2 · Review or cancel</div>
            </div>
        </div>
    );
};

const Seat: React.FC<{ i: number }> = ({ i }) => {
    const unused = i >= 6;
    const flip = useAt(FEAT_T.nobody + (i - 6) * 0.12, { damping: 11, stiffness: 170, mass: 0.7 });
    const on = unused ? flip : 0;
    return (
        <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-[15px] font-bold"
            style={{
                background: unused ? `rgba(255,241,242,${on})` : C.emerald100,
                color: unused ? "#e11d48" : C.emerald700,
                border: unused ? `2px dashed rgba(244,63,94,${0.25 + 0.75 * on})` : "2px solid transparent",
                transform: `scale(${unused ? 1 + 0.15 * Math.sin(Math.min(on, 1) * Math.PI) : 1})`,
            }}
        >
            {unused ? (on > 0.5 ? "–" : "") : "ABCDEF"[i]}
        </div>
    );
};

export const Features: React.FC = () => {
    const badge = useAt(FEAT_T.same - 0.05, { damping: 10, stiffness: 180, mass: 0.7 });
    return (
        <AbsoluteFill>
            <Beat t0={FEAT_T.a} t1={FEAT_T.b}>
                <Text>
                    <VOLine phrase="Get alerted before you're charged." hl={[2, 3, 4]} />
                </Text>
                <Right zoom={1.55} top={250}>
                    <Alert />
                    <div style={{ height: 22 }} />
                    <div style={{ width: 470 }}>
                        <RenewalsCard>
                            <RenewalRow name="Figma" tile="bg-purple-100 text-purple-600" date="Renews Nov 2 · in 3 days" cost={250} />
                            <RenewalRow name="Slack" tile="bg-amber-100 text-amber-600" date="Renews Nov 11" cost={180} />
                        </RenewalsCard>
                    </div>
                </Right>
            </Beat>
            <Beat t0={FEAT_T.b} t1={FEAT_T.c}>
                <Text>
                    <VOLine phrase="See the seats nobody uses." hl={[3, 4]} />
                </Text>
                <Right zoom={1.6} top={260}>
                    <div style={{ width: 470 }}>
                        <InsightShell
                            icon={<SeatIcon />}
                            iconClass="bg-emerald-50 text-emerald-600"
                            title="Unused Seats"
                            badge="Slack Pro"
                            badgeClass="text-slate-600 bg-slate-50 border-slate-200"
                            footerR={<span className="text-xs font-bold text-rose-500">{inr(72)}/mo wasted</span>}
                        >
                            <div className="grid grid-cols-5 gap-3 py-2 px-1">
                                {Array.from({ length: 10 }, (_, i) => (
                                    <Seat key={i} i={i} />
                                ))}
                            </div>
                            <InsightRow left={<Tile letter="S" cls="bg-amber-100 text-amber-600" />} title="Slack Pro" sub="6/10 seats used" right="4 unused" rightClass="text-rose-500" />
                        </InsightShell>
                    </div>
                </Right>
            </Beat>
            <Beat t0={FEAT_T.c} t1={B.cta + 1}>
                <Text>
                    <VOLine phrase="Catch the tools that do the same job." hl={[6, 7]} />
                </Text>
                <Right zoom={1.6} top={300}>
                    <div style={{ width: 470 }}>
                        <InsightShell
                            icon={<DupIcon />}
                            iconClass="bg-emerald-50 text-emerald-600"
                            title="Duplicate Tools"
                            badge="1 duplicate"
                            badgeClass="text-rose-600 bg-rose-50 border-rose-100"
                            style={{ boxShadow: `0 0 0 ${badge * 3}px rgba(244,63,94,${0.25 * badge})` }}
                            footerR={<span className="text-xs font-bold text-emerald-600">Keep one, save {inr(210)}/mo</span>}
                        >
                            <InsightRow left={<Tile letter="Z" cls="bg-blue-100 text-blue-600" />} title="Zoom Workplace" sub="Video calls · 2 teams" right={`${inr(350)}/mo`} rightClass="text-slate-600" />
                            <div className="flex items-center gap-2 px-3" style={{ opacity: badge }}>
                                <div className="h-px flex-1 bg-rose-200" />
                                <span className="text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-md" style={{ transform: `scale(${badge})` }}>
                                    Same job
                                </span>
                                <div className="h-px flex-1 bg-rose-200" />
                            </div>
                            <InsightRow left={<Tile letter="G" cls="bg-emerald-100 text-emerald-700" />} title="Google Meet" sub="Video calls · 3 teams" right={`${inr(210)}/mo`} rightClass="text-slate-600" />
                        </InsightShell>
                    </div>
                </Right>
            </Beat>
        </AbsoluteFill>
    );
};
