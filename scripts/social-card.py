"""Optional maintainer tool: regenerate the original diagram card (requires Pillow).
The generated PNG is committed; this is NOT required to build or run OrbitLab.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import math

root = Path(__file__).resolve().parents[1]
image = Image.new('RGB', (1200, 630), '#f0efe9')
d = ImageDraw.Draw(image)
def font(size):
    for name in ('C:/Windows/Fonts/segoeui.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'):
        if Path(name).exists():
            return ImageFont.truetype(name, size)
    return ImageFont.load_default(size=size)
d.rounded_rectangle((35, 30, 1165, 110), 18, fill='#322d2a')
d.text((65, 47), 'OrbitLab', font=font(34), fill='#f0efe9')
d.text((820, 59), 'THE ORBITAL FIELDBOOK', font=font(17), fill='#f0efe9')
d.text((65, 174), 'What keeps a\nsatellite in orbit?', font=font(54), fill='#322d2a', spacing=0)
d.text((65, 340), 'Change one thing. Follow the motion.\nMake the mathematics visible.', font=font(25), fill='#65615b', spacing=10)
d.text((65, 550), 'SIMULATE / LEARN / QUESTION', font=font(18), fill='#322d2a')
d.rounded_rectangle((680, 155, 1135, 535), 10, fill='#242925')
d.ellipse((740, 230, 1080, 460), outline='#b5d8bc', width=3)
d.ellipse((940, 299, 1030, 389), fill='#3b4541', outline='#8eaaa0', width=2)
d.ellipse((785, 243, 799, 257), fill='#e4b675')
d.text((705, 490), 'IDEAL TWO-BODY ORBITS', font=font(16), fill='#b5d8bc')
image.save(root / 'public/social.png', optimize=True)
