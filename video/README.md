# CostOp videos (Remotion)

| Composition | Format | Notes |
|---|---|---|
| `CostOpLaunch` | 16:9 · 1920×1080 · 30 fps · 45s | Narrated launch video, ₹, synced to `public/voiceover.mp3` |
| `CostOpPromo` | 9:16 · 1080×1920 · 30 fps · 33s | Earlier silent draft ($) |

```bash
npm install
npm run dev                                                    # Remotion Studio
npx remotion render CostOpLaunch out/costop-launch-16x9.mp4 --crf=16 --audio-bitrate=256k
```

## Audio files are not in the repo
Generated audio is git-ignored. To render `CostOpLaunch` locally, first create it:

1. Put `ELEVENLABS_API_KEY=...` in `video/.env`.
2. Narration: generate the script with ElevenLabs and save it as `public/voiceover.mp3`, then run steps 2–3 of
   *Swapping the voiceover* below.
3. Music: `python3 -I scripts/compose_music.py` → `public/music.wav`.
4. Sound effects: `python3 -I -c "import sys; sys.path.insert(0,'scripts'); import eleven; eleven.sfx('<prompt>', 'public/sfx/<name>.mp3', <seconds>)"`
   for each of `whoosh pop tick notify riser impact chime typing` (prompts used: soft airy whoosh, soft UI pop,
   short digital tick, two-tone notification ding, soft cinematic riser, deep logo-reveal impact, bright success chime,
   soft laptop typing).

## Launch video pipeline
- `public/voiceover.mp3` – ElevenLabs narration (Vinay M). `src/voiceover-words.json` holds word timestamps
  from ElevenLabs Scribe; every caption, scene cut and sound effect is placed from these (`src/launch/timing.ts`).
- `public/voiceover-master.wav` – the narration after `scripts/master_voice.py` (compression + limiter).
- `public/music.wav` – original underscore from `scripts/compose_music.py` (lift lands on "Meet CostOp").
- `public/sfx/*.mp3` – ElevenLabs sound effects. Placement and levels live in `src/launch/Sound.tsx`.
- `scripts/eleven.py` – tiny ElevenLabs client; reads `ELEVENLABS_API_KEY` from `video/.env` (git-ignored).

## Swapping the voiceover
1. Replace `public/voiceover.mp3`.
2. Re-transcribe: `python3 -I -c "import sys,json; sys.path.insert(0,'scripts'); import eleven; r=eleven.transcribe('public/voiceover.mp3'); json.dump([{'text':w['text'],'start':w['start'],'end':w['end']} for w in r['words'] if w['type']=='word'], open('src/voiceover-words.json','w'))"`
3. Re-master: `afconvert -f WAVE -d LEI16 public/voiceover.mp3 /tmp/vo.wav && python3 -I scripts/master_voice.py /tmp/vo.wav public/voiceover-master.wav`
4. Re-render. Scenes re-time themselves as long as the script's wording is unchanged.
