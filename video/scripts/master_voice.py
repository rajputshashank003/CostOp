"""Broadcast-style voice chain: gentle compression + makeup gain + soft peak limit.

usage: master_voice.py <in.wav> <out.wav>   (decode the mp3 first: afconvert -f WAVE -d LEI16 in.mp3 in.wav)
"""
import sys
import wave

import numpy as np

src, dst = sys.argv[1], sys.argv[2]
w = wave.open(src)
sr, ch = w.getframerate(), w.getnchannels()
x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).reshape(-1, ch).astype(float) / 32768
mono = x.mean(1)

# RMS envelope over ~15ms
win = int(0.015 * sr)
env = np.sqrt(np.convolve(mono ** 2, np.ones(win) / win, mode="same")) + 1e-9
lvl = 20 * np.log10(env)

THRESH, RATIO, MAKEUP = -24.0, 3.0, 11.0
over = np.maximum(0, lvl - THRESH)
gr = -over * (1 - 1 / RATIO)
# smooth gain changes (attack/release ~10ms/80ms approximated by asymmetric moving min/avg)
k = int(0.08 * sr)
gr = np.convolve(gr, np.ones(k) / k, mode="same")
gain = 10 ** ((gr + MAKEUP) / 20)
y = mono * gain

# soft limiter to -1 dBFS
ceil = 10 ** (-1 / 20)
y = np.tanh(y / ceil) * ceil

act = np.sqrt(np.convolve(y ** 2, np.ones(2205) / 2205, mode="same"))
print("peak dBFS", round(20 * np.log10(np.abs(y).max()), 1), "| speech rms", round(20 * np.log10(np.sqrt((act[act > 0.03] ** 2).mean())), 1))
out = wave.open(dst, "wb")
out.setnchannels(1)
out.setsampwidth(2)
out.setframerate(sr)
out.writeframes((y * 32767).astype(np.int16).tobytes())
