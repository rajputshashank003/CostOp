import "./index.css";
import { Composition } from "remotion";
import { CostOpPromo, PROMO_DURATION } from "./Promo";
import { FPS, HEIGHT, WIDTH } from "./brand";
import { CostOpLaunch } from "./launch/Launch";
import * as L from "./launch/timing";

export const RemotionRoot: React.FC = () => (
    <>
        <Composition id="CostOpLaunch" component={CostOpLaunch} durationInFrames={L.DURATION_S * L.FPS} fps={L.FPS} width={L.W} height={L.H} />
        <Composition id="CostOpPromo" component={CostOpPromo} durationInFrames={PROMO_DURATION} fps={FPS} width={WIDTH} height={HEIGHT} />
    </>
);
