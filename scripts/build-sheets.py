import os
from PIL import Image, ImageDraw, ImageFont

d = 'screenshots/collection'
c = 'screenshots/collection/compressed'
s = 'screenshots/collection/sheets'

os.makedirs(c, exist_ok=True)
os.makedirs(s, exist_ok=True)

# Compress all PNGs to JPEG
for f in os.listdir(d):
    if f.endswith('.png'):
        src_path = os.path.join(d, f)
        dst_path = os.path.join(c, f.replace('.png', '.jpg'))
        try:
            im = Image.open(src_path).convert('RGB')
            im.save(dst_path, 'JPEG', quality=85, optimize=True)
            print(f'Compressed {f} -> {dst_path}')
        except Exception as e:
            print(f'Error compressing {f}: {e}')

pairs = [
    (
        'sheet_1_browse_and_filter.jpg',
        '01_collection_browse.jpg',
        '02_mana_filter_and_search.jpg',
        'Flow 1: Collection Browse (8-Card Slicing & Badges with Settled Card Artwork)',
        'Flow 2: Sticky Mana Filter (3) Active (22 Mage Cards across 3 Pages)'
    ),
    (
        'sheet_2_hero_and_inspect.jpg',
        '03_hero_select_toast.jpg',
        '04_card_inspect_browse.jpg',
        'Flow 3: Hero Select with Warning Toast & Enhanced Crests',
        'Flow 4: 3D Card Inspect Modal in Browse Mode'
    ),
    (
        'sheet_3_deck_editor_and_inspect.jpg',
        '05_deck_editor.jpg',
        '06_card_inspect_deck_builder.jpg',
        'Flow 5: Deck Editor (DECK LIMIT: 2 & DECK LIMIT: 1 ★ & Unclipped Header)',
        'Flow 6: Card Inspect in Deck-Building (+/- Controls)'
    ),
    (
        'sheet_4_incomplete_and_my_decks.jpg',
        '07_incomplete_deck_modal.jpg',
        '08_active_deck_in_my_decks.jpg',
        'Flow 7: Incomplete Deck Exit Confirmation Modal',
        'Flow 8: My Decks (Active Deck Glow + Incomplete (4/30) Badge)'
    )
]

# Dedicated banner height: 36px per slide
# Image height: 720px per slide
# Total slide slot = 756px. Total sheet height = 1512px.
# This guarantees that ZERO pixels of the screenshot are ever occluded or drawn over!
HEADER_H = 36
IMAGE_W = 1280
IMAGE_H = 720
SLOT_H = HEADER_H + IMAGE_H # 756
TOTAL_H = SLOT_H * 2        # 1512

for out_name, f1, f2, t1, t2 in pairs:
    p1 = os.path.join(c, f1)
    p2 = os.path.join(c, f2)
    if not os.path.exists(p1) or not os.path.exists(p2):
        print(f"Skipping {out_name}: missing input file(s)")
        continue
    im1 = Image.open(p1).convert('RGB').resize((IMAGE_W, IMAGE_H), Image.Resampling.LANCZOS)
    im2 = Image.open(p2).convert('RGB').resize((IMAGE_W, IMAGE_H), Image.Resampling.LANCZOS)
    
    sheet = Image.new('RGB', (IMAGE_W, TOTAL_H), (18, 12, 8))
    
    # Slot 1: Banner at y=0..36, Image 1 at y=36..756
    sheet.paste(im1, (0, HEADER_H))
    
    # Slot 2: Banner at y=756..792, Image 2 at y=792..1512
    sheet.paste(im2, (0, SLOT_H + HEADER_H))
    
    draw = ImageDraw.Draw(sheet)
    
    # Draw Banner 1 (Dedicated space above image 1)
    draw.rectangle([0, 0, IMAGE_W, HEADER_H], fill=(22, 13, 7))
    draw.text((15, 9), t1, fill=(250, 230, 162))
    draw.line([0, HEADER_H - 1, IMAGE_W, HEADER_H - 1], fill=(142, 97, 41), width=1)
    
    # Draw Banner 2 (Dedicated space above image 2)
    draw.rectangle([0, SLOT_H, IMAGE_W, SLOT_H + HEADER_H], fill=(22, 13, 7))
    draw.text((15, SLOT_H + 9), t2, fill=(250, 230, 162))
    draw.line([0, SLOT_H + HEADER_H - 1, IMAGE_W, SLOT_H + HEADER_H - 1], fill=(142, 97, 41), width=1)
    
    out_path = os.path.join(s, out_name)
    sheet.save(out_path, 'JPEG', quality=85, optimize=True)
    print(f'Generated sheet: {out_path} ({os.path.getsize(out_path) // 1024} KB)')

print('All composite sheets generated successfully!')
