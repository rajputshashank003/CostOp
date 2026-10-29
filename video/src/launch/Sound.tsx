import { Audio, interpolate, Sequence, staticFile } from "remotion";
import { HOOK_CARDS } from "./scenes/Hook";
import { DEBITS } from "./scenes/Renewals";
import { COUNT_T0, COUNT_T1 } from "./scenes/Counter";
import { DASH_T } from "./scenes/Dashboard";
import { FEAT_T } from "./scenes/Features";
import { CTA_T } from "./scenes/CTA";
import { at, B, counterAt, DURATION_S, FPS, VO, words } from "./timing";

type Hit = [file: string, t: number, vol: number];

// Ticks whenever the ₹ counter crosses another 25, at least 2 frames apart
const counterTicks = (t0: number, t1: number, vol: number): Hit[] => {
    const out: Hit[] = [];
    let last = -1;
    let lastF = -10;
    for (let f = Math.floor(t0 * FPS); f <= Math.ceil(t1 * FPS); f++) {
        const step = Math.floor(counterAt(f / FPS, t0, t1) / 25);
        if (step !== last && f - lastF >= 2) {
            out.push(["tick", f / FPS, vol]);
            lastF = f;
        }
        last = step;
    }
    return out;
};

const HITS: Hit[] = [
    // scene transitions
    ...[B.ghosts, B.renewals, B.counter, B.dashboard, B.features, B.cta].map((t): Hit => ["whoosh", t - 0.12, 0.61]),
    ["whoosh", FEAT_T.b - 0.2, 0.32],
    ["whoosh", FEAT_T.c - 0.2, 0.32],
    // hook: a soft pop per card
    ...HOOK_CARDS.map((c): Hit => ["pop", at(c.word) - 0.02, 0.72]),
    // ghosts: tags and price pulse
    ...[0, 1, 2, 3].map((i): Hit => ["tick", at("in months.") + i * 0.14, 0.8]),
    ["pop", at("billing."), 0.64],
    // renewals: a notification per debit, thud on "surprise"
    ...DEBITS.map((d): Hit => ["notify", at(d.word) - 0.03, 0.72]),
    ["pop", at("surprise."), 0.8],
    // counter
    ...counterTicks(COUNT_T0, COUNT_T1, 0.5),
    ["pop", COUNT_T1, 0.88],
    // reveal
    ["riser", at("Meet") - 2.0, 0.67],
    ["impact", at("Meet") - 0.04, 0.55],
    // dashboard
    ...[DASH_T.spend, DASH_T.renewals, DASH_T.dept].map((t): Hit => ["pop", t - 0.1, 0.51]),
    ...counterTicks(DASH_T.spend, DASH_T.insights, 0.22),
    ["whoosh", DASH_T.ai - 0.1, 0.35],
    ["pop", DASH_T.row1 - 0.05, 0.56],
    ["pop", DASH_T.row2 - 0.05, 0.56],
    ["tick", DASH_T.cut, 0.8],
    // features
    ["notify", FEAT_T.alert - 0.05, 0.45],
    ...[0, 1, 2, 3].map((i): Hit => ["tick", FEAT_T.nobody + i * 0.12, 0.72]),
    ["pop", FEAT_T.same - 0.05, 0.8],
    // CTA
    ["pop", CTA_T.start - 0.05, 0.8],
    ["typing", CTA_T.typeFrom, 0.72],
    ["chime", CTA_T.typeTo, 0.88],
];

// Speaking intervals (merged), used to duck the music under the narrator
const speech = (() => {
    const iv: [number, number][] = [];
    for (const w of words) {
        const s = VO + w.start;
        const e = VO + w.end;
        if (iv.length && s - iv[iv.length - 1][1] < 0.45) iv[iv.length - 1][1] = e;
        else iv.push([s, e]);
    }
    return iv;
})();

const musicVolume = (f: number) => {
    const t = f / FPS;
    // distance (s) to the nearest speech interval → smooth duck
    let d = Infinity;
    for (const [s, e] of speech) d = Math.min(d, t < s ? s - t : t > e ? t - e : 0);
    const duck = interpolate(d, [0, 0.35], [1, 0], { extrapolateRight: "clamp" });
    const base = t > at("Meet") - 0.1 ? 0.75 : 0.85; // the calm section is quieter in the score itself
    const ducked = base * 0.42;
    const v = base + (ducked - base) * duck;
    return v * interpolate(t, [DURATION_S - 2.5, DURATION_S], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
};

export const Sound: React.FC = () => (
    <>
        <Audio src={staticFile("music.wav")} volume={musicVolume} />
        <Sequence from={Math.round(VO * FPS)}>
            <Audio src={staticFile("voiceover-master.wav")} volume={1} />
        </Sequence>
        {HITS.map(([file, t, vol], i) => (
            <Sequence key={i} from={Math.max(0, Math.round(t * FPS))} durationInFrames={FPS * 3}>
                <Audio src={staticFile(`sfx/${file}.mp3`)} volume={vol} />
            </Sequence>
        ))}
    </>
);
