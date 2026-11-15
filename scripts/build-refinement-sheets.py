import os
from PIL import Image, ImageDraw

src_dir = 'd:/game/hearthlight/.verification/refinements'
sheets_dir = 'd:/game/hearthlight/.verification/refinements/sheets'

os.makedirs(sheets_dir, exist_ok=True)

HEADER_H = 40
IMAGE_W = 1280
IMAGE_H = 680
SLOT_H = HEADER_H + IMAGE_H

def fit_image(im, target_w=IMAGE_W, target_h=IMAGE_H):
    bg = Image.new('RGB', (target_w, target_h), (14, 9, 6))
    scale = min(target_w / im.width, target_h / im.height)
    nw = int(im.width * scale)
    nh = int(im.height * scale)
    resized = im.resize((nw, nh), Image.Resampling.LANCZOS)
    offset_x = (target_w - nw) // 2
    offset_y = (target_h - nh) // 2
    bg.paste(resized, (offset_x, offset_y))
    return bg

# Sheet 1: Main Menu & Collection Browse
p1 = os.path.join(src_dir, '01_main_menu_toast.png')
p2 = os.path.join(src_dir, '02_collection_browse.png')

im1 = Image.open(p1).convert('RGB')
im2 = Image.open(p2).convert('RGB')

fitted1 = fit_image(im1)
fitted2 = fit_image(im2)

sheet1 = Image.new('RGB', (IMAGE_W, SLOT_H * 2), (18, 12, 8))
sheet1.paste(fitted1, (0, HEADER_H))
sheet1.paste(fitted2, (0, SLOT_H + HEADER_H))

draw1 = ImageDraw.Draw(sheet1)
# Header 1
draw1.rectangle([0, 0, IMAGE_W, HEADER_H], fill=(22, 13, 7))
draw1.text((16, 12), '1. Main Menu: Proportional Walnut Box & 1v1 Tavern Arena Toast Notification (Battlefield Removed)', fill=(250, 230, 162))
draw1.line([0, HEADER_H - 1, IMAGE_W, HEADER_H - 1], fill=(142, 97, 41), width=1)

# Header 2
draw1.rectangle([0, SLOT_H, IMAGE_W, SLOT_H + HEADER_H], fill=(22, 13, 7))
draw1.text((16, SLOT_H + 12), '2. Collection Browse: Clean Cards (Zero Rarity Badges/Legend Crowns), No Avatar Star, Compact Search', fill=(250, 230, 162))
draw1.line([0, SLOT_H + HEADER_H - 1, IMAGE_W, SLOT_H + HEADER_H - 1], fill=(142, 97, 41), width=1)

out1 = os.path.join(sheets_dir, 'refinements_sheet_1_menu_and_collection.jpg')
sheet1.save(out1, 'JPEG', quality=88, optimize=True)
print(f'Generated: {out1}')

# Sheet 2: Inspect Modal, Hero Select Fireblast, Deck Editor Drag
p3 = os.path.join(src_dir, '03_card_inspect.png')
p4 = os.path.join(src_dir, '04_hero_select_fireblast.png')
p5 = os.path.join(src_dir, '05_deck_editor_drag.png')

im3 = Image.open(p3).convert('RGB')
im4 = Image.open(p4).convert('RGB')
im5 = Image.open(p5).convert('RGB')

# Top row: im3 and im4 side-by-side (each 640x540)
HALF_W = 640
ROW1_H = 540
fitted3 = fit_image(im3, HALF_W, ROW1_H)
fitted4 = fit_image(im4, HALF_W, ROW1_H)

# Bottom row: im5 full width (1280x680)
ROW2_H = 680
fitted5 = fit_image(im5, IMAGE_W, ROW2_H)

TOTAL_H2 = HEADER_H + ROW1_H + HEADER_H + ROW2_H
sheet2 = Image.new('RGB', (IMAGE_W, TOTAL_H2), (18, 12, 8))

sheet2.paste(fitted3, (0, HEADER_H))
sheet2.paste(fitted4, (HALF_W, HEADER_H))
sheet2.paste(fitted5, (0, HEADER_H + ROW1_H + HEADER_H))

draw2 = ImageDraw.Draw(sheet2)
# Header row 1
draw2.rectangle([0, 0, IMAGE_W, HEADER_H], fill=(22, 13, 7))
draw2.text((16, 12), '3. Card Inspect Modal: Zero Redundant Badges (Left) | 4. Hero Select: Pure Fireblast Illustration CS2_034.jpg (Right)', fill=(250, 230, 162))
draw2.line([0, HEADER_H - 1, IMAGE_W, HEADER_H - 1], fill=(142, 97, 41), width=1)

# Header row 2
r2_top = HEADER_H + ROW1_H
draw2.rectangle([0, r2_top, IMAGE_W, r2_top + HEADER_H], fill=(22, 13, 7))
draw2.text((16, r2_top + 12), '5. Deck Editor: HTML5 Drag-and-Drop Card to Deck List Verified (Drop Zone & Card Count 30/30)', fill=(250, 230, 162))
draw2.line([0, r2_top + HEADER_H - 1, IMAGE_W, r2_top + HEADER_H - 1], fill=(142, 97, 41), width=1)

out2 = os.path.join(sheets_dir, 'refinements_sheet_2_inspect_hero_drag.jpg')
sheet2.save(out2, 'JPEG', quality=88, optimize=True)
print(f'Generated: {out2}')
