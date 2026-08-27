from PIL import Image
import numpy as np

def process_logo():
    img = Image.open('logo.png').convert('RGBA')
    data = np.array(img, dtype=np.float32)
    
    # R, G, B, A
    r = data[:, :, 0]
    g = data[:, :, 1]
    b = data[:, :, 2]
    a = data[:, :, 3]
    
    # Background is near white (r > 240, g > 240, b > 240)
    # Brightness metric
    brightness = (r + g + b) / 3.0
    
    # Calculate transparency based on whiteness
    # White background (brightness >= 245) becomes alpha 0
    # Anti-alias edge: between 220 and 245
    new_a = np.clip((250.0 - brightness) / 30.0 * 255.0, 0, 255)
    
    # Detect black/dark text ("Free") where r, g, b are all dark (e.g. max(r,g,b) < 100 or brightness < 80)
    # We want to change the dark text "Free" to pure white #FFFFFF for dark theme visibility
    is_dark_text = (r < 80) & (g < 80) & (b < 80) & (new_a > 50)
    # Smooth transition for anti-aliasing on dark text
    is_grey_edge = (r < 180) & (g < 180) & (b < 180) & (np.abs(r - g) < 25) & (np.abs(g - b) < 25) & (new_a > 30)
    
    # For dark text and grey anti-aliasing edges of the text, make color white
    mask_white = is_dark_text | is_grey_edge
    
    data[:, :, 0] = np.where(mask_white, 255.0, r)
    data[:, :, 1] = np.where(mask_white, 255.0, g)
    data[:, :, 2] = np.where(mask_white, 255.0, b)
    data[:, :, 3] = new_a
    
    out_img = Image.fromarray(data.astype(np.uint8), 'RGBA')
    out_img.save('logo.png', 'PNG')
    out_img.save('logo-dark.png', 'PNG')
    print("Logo processed successfully!")

if __name__ == '__main__':
    process_logo()
