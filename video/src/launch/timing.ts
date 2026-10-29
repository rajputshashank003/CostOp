import WORDS from "../voiceover-words.json";

export const FPS = 30;
export const W = 1920;
export const H = 1080;
export const VO = 1.0; // voiceover starts 1s into the video
export const DURATION_S = 45;
export const T = 12; // transition length in frames

export type Word = { text: string; start: number; end: number };
export const words = WORDS as Word[];

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

// Index of the first transcript word of `phrase` (matched word by word, ignoring case/punctuation)
export const findPhrase = (phrase: string) => {
    const toks = phrase.split(" ").map(norm);
    for (let i = 0; i + toks.length <= words.length; i++) {
        if (toks.every((t, k) => norm(words[i + k].text) === t)) return i;
    }
    throw new Error(`phrase not in voiceover: ${phrase}`);
};

// Absolute video time (s) when a phrase / word is spoken
export const at = (phrase: string, k = 0) => VO + words[findPhrase(phrase) + k].start;
export const endOf = (phrase: string) => {
    const i = findPhrase(phrase) + phrase.split(" ").length - 1;
    return VO + words[i].end;
};

// Scene boundaries (absolute seconds). Each lands just before its first spoken word.
export const B = {
    hook: 0,
    ghosts: at("Tools no one") - 0.3,
    renewals: at("Annual plans") - 0.3,
    counter: at("It adds up") - 0.3,
    logo: at("Meet Costop") - 0.32,
    dashboard: at("every subscription in") - 0.36,
    features: at("Get alerted") - 0.3,
    cta: at("Take control") - 0.3,
    end: DURATION_S,
};

export const ORDER = ["hook", "ghosts", "renewals", "counter", "logo", "dashboard", "features", "cta"] as const;
export type SceneKey = (typeof ORDER)[number];

// TransitionSeries durations so that scene i starts exactly at B[i]
export const sceneFrames = (k: SceneKey) => {
    const i = ORDER.indexOf(k);
    const next = i === ORDER.length - 1 ? B.end : B[ORDER[i + 1]];
    return Math.round((next - B[k]) * FPS) + (i === ORDER.length - 1 ? 0 : T);
};

// Counter used whenever an amount is spoken: ₹10 → ₹1,000
export const COUNT_FROM = 10;
export const COUNT_TO = 1000;
export const counterAt = (t: number, t0: number, t1: number) => {
    const p = Math.min(1, Math.max(0, (t - t0) / (t1 - t0)));
    const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; // easeInOutCubic
    return COUNT_FROM + (COUNT_TO - COUNT_FROM) * e;
};
