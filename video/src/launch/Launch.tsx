import { AbsoluteFill, Easing } from "remotion";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fontFamily } from "../brand";
import { whip } from "../lib";
import { Background } from "../scenes/Background";
import { Scene } from "./Synced";
import { B, ORDER, sceneFrames, SceneKey, T } from "./timing";
import { Sound } from "./Sound";
import { Hook } from "./scenes/Hook";
import { Ghosts } from "./scenes/Ghosts";
import { Renewals } from "./scenes/Renewals";
import { Counter } from "./scenes/Counter";
import { Logo } from "./scenes/Logo";
import { Dashboard } from "./scenes/Dashboard";
import { Features } from "./scenes/Features";
import { CTA } from "./scenes/CTA";

const SCENES: Record<SceneKey, React.FC> = { hook: Hook, ghosts: Ghosts, renewals: Renewals, counter: Counter, logo: Logo, dashboard: Dashboard, features: Features, cta: CTA };
const timing = linearTiming({ durationInFrames: T, easing: Easing.inOut(Easing.cubic) });

export const CostOpLaunch: React.FC = () => (
    <AbsoluteFill style={{ fontFamily }}>
        <Background />
        <TransitionSeries>
            {ORDER.flatMap((k, i) => {
                const Comp = SCENES[k];
                return [
                    ...(i > 0 ? [<TransitionSeries.Transition key={`t${k}`} presentation={whip()} timing={timing} />] : []),
                    <TransitionSeries.Sequence key={k} durationInFrames={sceneFrames(k)}>
                        <Scene start={B[k]}>
                            <Comp />
                        </Scene>
                    </TransitionSeries.Sequence>,
                ];
            })}
        </TransitionSeries>
        <Sound />
    </AbsoluteFill>
);
