"""
Arma el video de fondo del hero (static/video/hero-collage.mp4): un collage de ~40 segundos con fragmentos
de publicidades de casas de apuestas, sin audio.

Usa ffmpeg. Los videos originales (descargados de YouTube) no van en el repo:
  SRC_DIR=/ruta/a/los/videos python3 scripts/build_hero_collage.py
"""

import glob
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DIR = os.environ.get('SRC_DIR', os.path.expanduser('~/Descargas'))
OUT = os.path.join(ROOT, 'static', 'video', 'hero-collage.mp4')

CLIP = 2.25  # segundos por fragmento
FADE = 0.25  # fundido entre fragmentos
SIZE = (1280, 720)

# id de YouTube -> marca (solo para identificar el archivo)
VIDEOS = {
    '0A45DTpno8s': 'Apuesta Total',
    'aPT17sxjpIg': 'Betsson',
    '-Bb01UYUjso': 'Betwarrior (Montiel)',
    'iUAV91C8lhM': 'bplay',
    '_V5ajsvknYI': 'Betano',
    'hUJTy4fjWDk': 'bplay (Dibu Martinez)',
    'ONrmjfRzHtc': 'bplay (Tevez)',
}

# (id, segundo de inicio) en el orden del collage. Se evitan las placas finales con logos.
# El primero (la cara de Montiel) y el ultimo (las piernas) abren y cierran el bucle.
CLIPS = [
    ('-Bb01UYUjso', 2),
    ('0A45DTpno8s', 18),
    ('aPT17sxjpIg', 4),
    ('hUJTy4fjWDk', 12),
    ('iUAV91C8lhM', 20),
    ('0A45DTpno8s', 24),
    ('ONrmjfRzHtc', 1),
    ('_V5ajsvknYI', 3),
    ('-Bb01UYUjso', 4),
    ('iUAV91C8lhM', 44),
    ('hUJTy4fjWDk', 16),
    ('aPT17sxjpIg', 9),
    ('_V5ajsvknYI', 6),
    ('ONrmjfRzHtc', 4),
    ('-Bb01UYUjso', 32),
    ('hUJTy4fjWDk', 24),
    ('iUAV91C8lhM', 100),
    ('0A45DTpno8s', 40),
    ('aPT17sxjpIg', 12),
    ('iUAV91C8lhM', 76),
]


def _source(video_id):
    matches = glob.glob(os.path.join(SRC_DIR, f'YTSave*{video_id}*'))
    if not matches:
        sys.exit(f'No encuentro el video {video_id} ({VIDEOS[video_id]}) en {SRC_DIR}')
    return matches[0]


def main():
    width, height = SIZE
    inputs, filters = [], []
    for i, (video_id, start) in enumerate(CLIPS):
        inputs += ['-ss', str(start), '-t', str(CLIP + 0.1), '-i', _source(video_id)]
        # recorta arriba y abajo (leyendas legales, logos de canal, QR) y llena el cuadro
        filters.append(
            f'[{i}:v]crop=iw*0.8:ih*0.8:iw*0.1:ih*0.06,scale={width}:{height},'
            f'setsar=1,fps=25,format=yuv420p,trim=duration={CLIP},setpts=PTS-STARTPTS[v{i}]'
        )

    # fundidos encadenados
    last, offset = 'v0', 0.0
    for i in range(1, len(CLIPS)):
        offset += CLIP - FADE
        out = f'x{i}'
        filters.append(f'[{last}][v{i}]xfade=transition=fade:duration={FADE}:offset={offset:.2f}[{out}]')
        last = out

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    subprocess.run(
        ['ffmpeg', '-loglevel', 'error', '-y', *inputs, '-filter_complex', ';'.join(filters), '-map', f'[{last}]',
         '-an', '-c:v', 'libx264', '-profile:v', 'high', '-level', '4.0',
         # yuv420p: el xfade deja el video en 4:4:4, que muchos navegadores (Vivaldi, Safari, Firefox) no reproducen
         '-pix_fmt', 'yuv420p', '-crf', '28', '-preset', 'slow', '-movflags', '+faststart', OUT],
        check=True,
    )
    duration = subprocess.run(
        ['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', OUT],
        capture_output=True, text=True, check=True,
    ).stdout.strip()
    print(f'{OUT}: {float(duration):.1f} s, {os.path.getsize(OUT) / 1e6:.1f} MB')


if __name__ == '__main__':
    main()
