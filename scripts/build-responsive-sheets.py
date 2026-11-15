import os
from PIL import Image, ImageDraw, ImageFont

src_dir = 'd:/game/hearthlight/.verification/responsive'
sheets_dir = 'd:/game/hearthlight/.verification/responsive/sheets'

os.makedirs(sheets_dir, exist_ok=True)

pairs = [
    (
        'responsive_sheet_1_mobile_landscape.jpg',
        'iphone-se-landscape-collection.png',
        'iphone-se-landscape-board.png',
        'iPhone SE (667x375 Mobile Landscape): 8-Card Grid Zero Spine Collision & Visible Mana Tray',
        'iPhone SE (667x375 Mobile Landscape): Full 1v1 Tavern Game Board with Zero Stage Overflow'
    ),
    (
        'responsive_sheet_2_forced_portrait.jpg',
        'iphone-16-pro-portrait-collection.png',
        'iphone-16-pro-portrait-board.png',
        'iPhone 16 Pro Vertical (393x852 Portrait): Auto-Rotated 90° Landscape Collection Stage',
        'iPhone 16 Pro Vertical (393x852 Portrait): Auto-Rotated 90° 1v1 Game Board & Hand Fan'
    ),
    (
        'responsive_sheet_3_menu_and_hero.jpg',
        'iphone-16-pro-landscape-menu.png',
        'desktop-widescreen-hero-select.png',
        'iPhone 16 Pro (852x393 Landscape): Fluid Relic Box, Center Play Medallion & Safe-Area HUD',
        'Desktop Widescreen (1440x900): 3x3 Hero Select Chamber & Right Jaina Pedestal'
    ),
    (
        'responsive_sheet_4_tablet_and_desktop.jpg',
        'ipad-air-landscape-board.png',
        'desktop-widescreen-board.png',
        'iPad Air (1180x820 Tablet Landscape): Full Battlefield with Minion Rows & Mana Tray',
        'Desktop Widescreen (1440x900): Crisp Tavern Battlefield with Playable Card Fan'
    )
]

HEADER_H = 38
IMAGE_W = 1280
IMAGE_H = 720
SLOT_H = HEADER_H + IMAGE_H
TOTAL_H = SLOT_H * 2

for out_name, f1, f2, t1, t2 in pairs:
    p1 = os.path.join(src_dir, f1)
    p2 = os.path.join(src_dir, f2)
    if not os.path.exists(p1) or not os.path.exists(p2):
        print(f"Skipping {out_name}: missing input file(s)")
        continue

    im1 = Image.open(p1).convert('RGB')
    im2 = Image.open(p2).convert('RGB')

    # Fit images into 1280x720 keeping aspect ratio with centered dark tavern background
    def fit_image(im):
        bg = Image.new('RGB', (IMAGE_W, IMAGE_H), (14, 9, 6))
        # calculate scale to fit within IMAGE_W x IMAGE_H
        scale = min(IMAGE_W / im.width, IMAGE_H / im.height)
        nw = int(im.width * scale)
        nh = int(im.height * scale)
        resized = im.resize((nw, nh), Image.Resampling.LANCZOS)
        offset_x = (IMAGE_W - nw) // 2
        offset_y = (IMAGE_H - nh) // 2
        bg.paste(resized, (offset_x, offset_y))
        return bg

    fitted1 = fit_image(im1)
    fitted2 = fit_image(im2)

    sheet = Image.new('RGB', (IMAGE_W, TOTAL_H), (18, 12, 8))
    sheet.paste(fitted1, (0, HEADER_H))
    sheet.paste(fitted2, (0, SLOT_H + HEADER_H))

    draw = ImageDraw.Draw(sheet)

    # Banner 1
    draw.rectangle([0, 0, IMAGE_W, HEADER_H], fill=(22, 13, 7))
    draw.text((16, 10), t1, fill=(250, 230, 162))
    draw.line([0, HEADER_H - 1, IMAGE_W, HEADER_H - 1], fill=(142, 97, 41), width=1)

    # Banner 2
    draw.rectangle([0, SLOT_H, IMAGE_W, SLOT_H + HEADER_H], fill=(22, 13, 7))
    draw.text((16, SLOT_H + 10), t2, fill=(250, 230, 162))
    draw.line([0, SLOT_H + HEADER_H - 1, IMAGE_W, SLOT_H + HEADER_H - 1], fill=(142, 97, 41), width=1)

    out_path = os.path.join(sheets_dir, out_name)
    sheet.save(out_path, 'JPEG', quality=85, optimize=True)
    print(f'Generated sheet: {out_path} ({os.path.getsize(out_path) // 1024} KB)')

print('All 4 responsive verification sheets generated successfully!')
