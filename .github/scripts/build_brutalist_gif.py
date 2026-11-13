import os
from PIL import Image, ImageDraw, ImageFont

def make_variant(theme='light'):
    is_dark = theme == 'dark'
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    source_path = os.path.join(base_dir, 'assets', 'giphy.webp')
    
    if not os.path.exists(source_path):
        print(f"Source image not found: {source_path}")
        return

    im = Image.open(source_path)
    try:
        font = ImageFont.truetype('consolab.ttf', 10)
    except Exception:
        font = ImageFont.load_default()

    img_w, img_h = im.size # 245, 310
    pad_x, pad_top, pad_bot = 12, 44, 12
    box_w = img_w + pad_x * 2 # 269
    box_h = pad_top + img_h + pad_bot # 366
    shadow_offset = 5
    canvas_w = box_w + shadow_offset # 274
    canvas_h = box_h + shadow_offset # 371
    
    c_shadow = (0, 0, 0, 255)
    c_bg = (13, 17, 23, 255) if is_dark else (255, 255, 255, 255)
    c_border = (48, 54, 61, 255) if is_dark else (0, 0, 0, 255)
    c_chip_bg = (22, 27, 34, 255) if is_dark else (255, 230, 0, 255)
    c_chip_border = (48, 54, 61, 255) if is_dark else (0, 0, 0, 255)
    c_chip_text = (201, 209, 217, 255) if is_dark else (0, 0, 0, 255)
    
    b_width = 2 if is_dark else 3
    
    frames = []
    durations = []
    
    for i in range(im.n_frames):
        im.seek(i)
        durations.append(im.info.get('duration', 100))
        frame_img = im.convert('RGBA')
        
        canvas = Image.new('RGBA', (canvas_w, canvas_h), (0, 0, 0, 0))
        draw = ImageDraw.Draw(canvas)
        
        # 1. Brutalist Block Shadow
        draw.rectangle(
            [shadow_offset, shadow_offset, box_w + shadow_offset - 1, box_h + shadow_offset - 1],
            fill=c_shadow
        )
        
        # 2. Main Container Box
        draw.rectangle(
            [0, 0, box_w - 1, box_h - 1],
            fill=c_bg,
            outline=c_border,
            width=b_width
        )
        
        # 3. Header separator line
        draw.line([(0, 32), (box_w - 1, 32)], fill=c_border, width=b_width)
        
        # 4. Square Window Controls (Red, Yellow, Green)
        draw.rectangle([10, 11, 21, 22], fill=(255, 95, 86, 255), outline=c_border, width=1)
        draw.rectangle([26, 11, 37, 22], fill=(255, 189, 46, 255), outline=c_border, width=1)
        draw.rectangle([42, 11, 53, 22], fill=(39, 201, 63, 255), outline=c_border, width=1)
        
        # 5. Status Chip Badge
        chip_w, chip_h = 92, 18
        chip_x0 = box_w - chip_w - 10
        chip_y0 = 7
        draw.rectangle(
            [chip_x0, chip_y0, chip_x0 + chip_w, chip_y0 + chip_h],
            fill=c_chip_bg,
            outline=c_chip_border,
            width=1
        )
        chip_text = 'ULQUIORRA.GIF'
        draw.text((chip_x0 + 8, chip_y0 + 2), chip_text, font=font, fill=c_chip_text)
        
        # 6. Inner Anime Frame & Border
        inner_x = pad_x
        inner_y = pad_top
        draw.rectangle(
            [inner_x - 2, inner_y - 2, inner_x + img_w + 1, inner_y + img_h + 1],
            outline=c_border,
            width=2
        )
        canvas.paste(frame_img, (inner_x, inner_y), frame_img)
        
        frames.append(canvas)
        
    out_path = os.path.join(base_dir, 'assets', f'giphy-{theme}.webp')
    frames[0].save(
        out_path,
        save_all=True,
        append_images=frames[1:],
        duration=durations,
        loop=0,
        quality=95,
        method=6
    )
    print(f'Successfully saved {out_path}: {len(frames)} frames')

if __name__ == '__main__':
    make_variant('light')
    make_variant('dark')

