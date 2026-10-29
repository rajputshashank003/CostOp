"""Minimal ElevenLabs client. Reads ELEVENLABS_API_KEY from video/.env; never prints it."""
import json
import pathlib
import ssl
import sys
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
KEY = next(l.split("=", 1)[1].strip() for l in (ROOT / ".env").read_text().splitlines() if l.startswith("ELEVENLABS_API_KEY="))
API = "https://api.elevenlabs.io/v1"
# python.org builds on macOS ship without root certs; use the system bundle
CTX = ssl.create_default_context(cafile="/etc/ssl/cert.pem")


def call(path, body=None):
    req = urllib.request.Request(API + path, headers={"xi-api-key": KEY, "Content-Type": "application/json"})
    if body is not None:
        req.data = json.dumps(body).encode()
    try:
        with urllib.request.urlopen(req, context=CTX) as r:
            return r.read()
    except urllib.error.HTTPError as e:
        sys.exit(f"HTTP {e.code}: {e.read().decode()[:400]}")


if __name__ == "__main__":
    if sys.argv[1] == "voices":
        for v in json.loads(call("/voices"))["voices"]:
            l = v.get("labels", {})
            print(v["voice_id"], "|", v["name"], "|", v.get("category"), "|", l.get("gender"), l.get("accent"), l.get("age"), l.get("descriptive") or l.get("description"), l.get("use_case") or l.get("use case"))
    elif sys.argv[1] == "user":
        s = json.loads(call("/user/subscription"))
        print("tier:", s.get("tier"), "| used:", s.get("character_count"), "/", s.get("character_limit"))
    elif sys.argv[1] == "tts":
        voice_id, out, text = sys.argv[2], sys.argv[3], sys.argv[4]
        audio = call(
            f"/text-to-speech/{voice_id}?output_format=mp3_44100_128",
            {
                "text": text,
                "model_id": "eleven_multilingual_v2",
                "voice_settings": {"stability": 0.55, "similarity_boost": 0.8, "style": 0.15, "use_speaker_boost": True, "speed": 0.92},
            },
        )
        pathlib.Path(out).write_bytes(audio)
        print("wrote", out, len(audio), "bytes")


def transcribe(path):
    """Speech-to-text with word timestamps (Scribe)."""
    boundary = "----costop" + str(hash(path))[-8:]
    data = pathlib.Path(path).read_bytes()
    parts = [
        f'--{boundary}\r\nContent-Disposition: form-data; name="model_id"\r\n\r\nscribe_v1\r\n'.encode(),
        f'--{boundary}\r\nContent-Disposition: form-data; name="timestamps_granularity"\r\n\r\nword\r\n'.encode(),
        f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="a.mp3"\r\nContent-Type: audio/mpeg\r\n\r\n'.encode() + data + b"\r\n",
        f"--{boundary}--\r\n".encode(),
    ]
    req = urllib.request.Request(API + "/speech-to-text", data=b"".join(parts), headers={"xi-api-key": KEY, "Content-Type": f"multipart/form-data; boundary={boundary}"})
    try:
        with urllib.request.urlopen(req, context=CTX) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        sys.exit(f"HTTP {e.code}: {e.read().decode()[:400]}")


def sfx(text, out, seconds=None, influence=0.5):
    body = {"text": text, "prompt_influence": influence}
    if seconds:
        body["duration_seconds"] = seconds
    pathlib.Path(out).write_bytes(call("/sound-generation", body))
    print("wrote", out)
