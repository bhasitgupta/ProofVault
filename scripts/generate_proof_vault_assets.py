import os
from PIL import Image, ImageDraw, ImageFilter

SRC_IMG = r"C:\Users\Bhasit Gupta\.gemini\antigravity-ide\brain\bc714a3a-fede-4c29-bbc2-17ad73993142\.user_uploaded\media_1789908938553.png"
PUB_DIR = r"C:\Users\Bhasit Gupta\Desktop\proof-vault\frontend\public"
SRC_ASSETS_DIR = r"C:\Users\Bhasit Gupta\Desktop\proof-vault\frontend\src\assets"

os.makedirs(PUB_DIR, exist_ok=True)
os.makedirs(SRC_ASSETS_DIR, exist_ok=True)

img = Image.open(SRC_IMG).convert("RGBA")

# 1. Master Logo (public/logo.png)
img.save(os.path.join(PUB_DIR, "logo.png"), format="PNG")
img.save(os.path.join(SRC_ASSETS_DIR, "logo.png"), format="PNG")

# 2. Favicon (PNG & ICO)
fav32 = img.resize((32, 32), Image.Resampling.LANCZOS)
fav32.save(os.path.join(PUB_DIR, "favicon.png"), format="PNG")
fav16 = img.resize((16, 16), Image.Resampling.LANCZOS)
fav48 = img.resize((48, 48), Image.Resampling.LANCZOS)

img.save(
    os.path.join(PUB_DIR, "favicon.ico"),
    format="ICO",
    sizes=[(16, 16), (32, 32), (48, 48)]
)

# 3. Apple Touch Icon (180x180)
touch_icon = Image.new("RGBA", (180, 180), (11, 15, 25, 255))
resized_touch = img.resize((160, 160), Image.Resampling.LANCZOS)
touch_icon.paste(resized_touch, (10, 10), resized_touch)
touch_icon.save(os.path.join(PUB_DIR, "apple-touch-icon.png"), format="PNG")

# 4. Social Sharing Card (OG Image: 1200x630)
# Dark luxurious background #080C14 with subtle radial illumination
og_w, og_h = 1200, 630
og = Image.new("RGBA", (og_w, og_h), (8, 12, 20, 255))

# Create radial gradient glow in center
glow = Image.new("RGBA", (og_w, og_h), (0, 0, 0, 0))
glow_draw = ImageDraw.Draw(glow)
center_x, center_y = og_w // 2, og_h // 2
for r in range(350, 0, -5):
    alpha = int(35 * (1 - r / 350))
    glow_draw.ellipse(
        (center_x - r, center_y - r - 20, center_x + r, center_y + r - 20),
        fill=(37, 99, 235, alpha)
    )
glow = glow.filter(ImageFilter.GaussianBlur(30))
og = Image.alpha_composite(og, glow)

# Place logo scaled to 520x520 in center
logo_og = img.resize((520, 520), Image.Resampling.LANCZOS)
paste_x = (og_w - 520) // 2
paste_y = (og_h - 520) // 2
og.paste(logo_og, (paste_x, paste_y), logo_og)

og.convert("RGB").save(os.path.join(PUB_DIR, "og-image.jpg"), format="JPEG", quality=95)
og.save(os.path.join(PUB_DIR, "og-image.png"), format="PNG")

print("Generated all Proof Vault brand assets successfully!")
