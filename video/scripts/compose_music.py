"""Original launch underscore for the CostOp promo (no samples, no third-party audio).

96 BPM, bar = 2.5s. Calm/curious until the lift on bar 9 (22.5s) which lands on
"Meet CostOp", full section to 37.5s, then resolves and fades by 45s.
"""
import pathlib
import wave

import numpy as np

SR = 44100
LEN = 45.0
BPM = 96
BEAT = 60 / BPM
BAR = BEAT * 4
LIFT = 9 * BAR  # 22.5s
OUTRO = 15 * BAR  # 37.5s
rng = np.random.default_rng(7)
N = int(SR * LEN)
L = np.zeros(N)
R = np.zeros(N)


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def add(sig, t0, pan=0.0, gain=1.0):
    i = int(t0 * SR)
    if i >= N:
        return
    sig = sig[: N - i] * gain
    L[i : i + len(sig)] += sig * np.sqrt(0.5 * (1 - pan))
    R[i : i + len(sig)] += sig * np.sqrt(0.5 * (1 + pan))


def env(n, a, d_tau):
    t = np.arange(n) / SR
    e = np.exp(-t / d_tau)
    na = max(1, int(a * SR))
    e[:na] *= np.linspace(0, 1, na)
    return e




def piano(m, dur=2.4, vel=1.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = hz(m)
    s = np.zeros(n)
    for k, amp in enumerate([1.0, 0.45, 0.22, 0.12, 0.06], start=1):
        detune = 1 + 0.0007 * k * k  # slight inharmonicity
        s += amp * np.sin(2 * np.pi * f * k * detune * t) * np.exp(-t * (1.6 + 1.1 * k))
    hammer = rng.normal(0, 1, n) * np.exp(-t * 300) * 0.04  # felt thump
    return (s + hammer) * env(n, 0.004, 9) * vel * 0.22


def pad(notes, dur, bright=0.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = np.zeros(n)
    for m in notes:
        for det in (-0.08, 0.0, 0.08):
            f = hz(m) * 2 ** (det / 12)
            ph = rng.uniform(0, 2 * np.pi)
            # soft saw from a few harmonics, more harmonics when bright
            for k in range(1, 4 + int(4 * bright)):
                s += np.sin(2 * np.pi * f * k * t + ph * k) / (k ** 1.6)
    s /= len(notes) * 3
    a = min(0.9, dur / 3)
    e = np.ones(n)
    na, nr = int(a * SR), int(0.8 * SR)
    e[:na] = np.linspace(0, 1, na) ** 2
    e[-nr:] *= np.linspace(1, 0, nr)
    trem = 1 + 0.06 * np.sin(2 * np.pi * 0.25 * t)
    return s * e * trem * 0.13


def pluck(m, vel=1.0):
    n = int(0.45 * SR)
    t = np.arange(n) / SR
    f = hz(m)
    s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 30)
    return s * env(n, 0.002, 0.09) * vel * 0.12


def kick():
    n = int(0.5 * SR)
    t = np.arange(n) / SR
    f = 42 + 90 * np.exp(-t * 32)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 7) * 0.55


def bass(m, dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = hz(m)
    s = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t)
    return s * env(n, 0.01, dur * 0.8) * 0.20


def shaker():
    n = int(0.08 * SR)
    s = rng.normal(0, 1, n) * env(n, 0.002, 0.02)
    s = s - np.convolve(s, np.ones(6) / 6, mode="same")  # crude highpass
    return s * 0.05


# Chords as MIDI note lists (A minor family, then a lift to C major)
Am, F, C, G, Em = [57, 60, 64], [53, 57, 60], [48, 55, 60, 64], [55, 59, 62], [52, 55, 59]
calm = [Am, F, C, G, Am, F, C, G, Am]          # bars 0-8
lift = [F, C, G, Am, F, G]                      # bars 9-14
roots = {id(Am): 45, id(F): 41, id(C): 36, id(G): 43, id(Em): 40}

# --- calm section ---------------------------------------------------------
motif = [76, 72, 74, 71]  # E5 C5 D5 B4, one per bar
for b, ch in enumerate(calm):
    t0 = b * BAR
    dur = BAR + 0.9 if b < 8 else BAR - 0.25  # bar 8 cuts just before the lift
    add(pad(ch, dur, bright=0.1 + 0.05 * b), t0, gain=0.8 + 0.06 * b)
    if b >= 1:
        add(piano(motif[b % 4], vel=0.75), t0 + BEAT * 0.0, pan=0.15)
        add(piano(motif[b % 4] - 5, vel=0.45), t0 + BEAT * 2.0, pan=-0.1)
    if 4 <= b <= 7:  # quiet pulse builds curiosity
        for i in range(8):
            add(pluck(ch[i % len(ch)] + 12, vel=0.35 + 0.08 * (b - 4)), t0 + i * BEAT / 2, pan=(-0.4, 0.4)[i % 2])

# --- lift section ---------------------------------------------------------
arp_pat = [0, 1, 2, 1, 2, 0, 1, 2]
motif2 = [81, 79, 76, 77, 79, 76]
for j, ch in enumerate(lift):
    b = 9 + j
    t0 = b * BAR
    add(pad([n + 12 for n in ch] + ch, BAR + 0.9, bright=0.8), t0, gain=0.9)
    add(piano(motif2[j], vel=0.9), t0, pan=0.2)
    add(piano(motif2[j] - 7, vel=0.55), t0 + BEAT * 1.5, pan=-0.15)
    root = {tuple(F): 41, tuple(C): 36, tuple(G): 43, tuple(Am): 45}[tuple(ch)]
    for i in range(8):
        add(pluck(ch[arp_pat[i] % len(ch)] + 24, vel=0.55), t0 + i * BEAT / 2, pan=(-0.5, 0.5)[i % 2])
        add(bass(root, BEAT / 2 * 0.9), t0 + i * BEAT / 2)
        add(shaker(), t0 + i * BEAT / 2 + BEAT / 4, pan=0.3)
    for i in range(4):
        add(kick(), t0 + i * BEAT)

# --- outro: resolve on C, ring out ------------------------------------------
t0 = OUTRO
add(pad(C + [67, 72], LEN - t0, bright=0.4), t0, gain=1.8)
for k, m in enumerate([72, 76, 79, 84]):
    add(piano(m, dur=6, vel=1.1), t0 + k * BEAT / 2, pan=-0.2 + 0.13 * k)
add(piano(36, dur=6, vel=1.2), t0)
add(kick(), t0)

# --- reverb (exponential-noise IR, FFT convolution) ------------------------
irn = int(2.8 * SR)
ti = np.arange(irn) / SR
ir_l = rng.normal(0, 1, irn) * np.exp(-ti * 2.4)
ir_r = rng.normal(0, 1, irn) * np.exp(-ti * 2.4)
ir_l[: int(0.02 * SR)] = 0
ir_r[: int(0.023 * SR)] = 0


def conv(x, ir):
    m = len(x) + len(ir) - 1
    nfft = 1 << (m - 1).bit_length()
    y = np.fft.irfft(np.fft.rfft(x, nfft) * np.fft.rfft(ir, nfft), nfft)[: len(x)]
    return y / np.sqrt(np.sum(ir ** 2))


wet_l, wet_r = conv(L, ir_l), conv(R, ir_r)
outL, outR = L + 0.32 * wet_l, R + 0.32 * wet_r

# gentle master fade + normalise to -1 dBFS
t = np.arange(N) / SR
fade = np.clip((LEN - t) / 5.0, 0, 1) ** 1.5
fade *= np.clip(t / 0.6, 0, 1)
outL *= fade
outR *= fade
peak = max(np.abs(outL).max(), np.abs(outR).max())
outL, outR = outL / peak * 0.89, outR / peak * 0.89

pcm = (np.stack([outL, outR], axis=1) * 32767).astype(np.int16)
out = pathlib.Path(__file__).resolve().parent.parent / "public" / "music.wav"
with wave.open(str(out), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print("wrote", out, f"{LEN}s")
