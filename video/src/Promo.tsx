import { AbsoluteFill, Easing } from "remotion";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fontFamily } from "./brand";
import { whip } from "./lib";
import { Background } from "./scenes/Background";
import { Hook } from "./scenes/Hook";
import { Ghosts } from "./scenes/Ghosts";
import { Renewals } from "./scenes/Renewals";
import { BigNumber } from "./scenes/BigNumber";
import { LogoReveal } from "./scenes/LogoReveal";
import { Dashboard } from "./scenes/Dashboard";
import { BEAT, Features } from "./scenes/Features";
import { CTA } from "./scenes/CTA";

const T = 12;
const timing = linearTiming({ durationInFrames: T, easing: Easing.inOut(Easing.cubic) });

const SCENES: [React.FC, number][] = [
    [Hook, 105],
    [Ghosts, 140],
    [Renewals, 125],
    [BigNumber, 150],
    [LogoReveal, 70],
    [Dashboard, 175],
    [Features, BEAT * 3 + 12],
    [CTA, 150],
];

export const PROMO_DURATION = SCENES.reduce((a, [, d]) => a + d, 0) - T * (SCENES.length - 1);

export const CostOpPromo: React.FC = () => (
    <AbsoluteFill style={{ fontFamily }}>
        <Background />
        <TransitionSeries>
            {SCENES.flatMap(([Scene, d], i) => [
                ...(i > 0 ? [<TransitionSeries.Transition key={`t${i}`} presentation={whip()} timing={timing} />] : []),
                <TransitionSeries.Sequence key={`s${i}`} durationInFrames={d}>
                    <Scene />
                </TransitionSeries.Sequence>,
            ])}
        </TransitionSeries>
    </AbsoluteFill>
);
