import base64
import numpy as np
from PIL import Image, ImageOps
import io

def getMassCenter(arr: np.array) -> tuple[int]:

    total_mass = np.sum(arr)

    if not total_mass:
        return arr.shape[1] / 2, arr.shape[0] / 2

    x_sum = np.sum(arr, 0)
    y_sum = np.sum(arr, 1)

    cx = np.sum(np.arange(arr.shape[1]) * x_sum) / total_mass
    cy = np.sum(np.arange(arr.shape[0]) * y_sum) / total_mass

    return cx, cy


def preprocessImage(base64_str : str) -> np.array:
    if ',' in base64_str:
        base64_str = base64_str.split(',')[1]

    image_bytes = base64.b64decode(base64_str)

    img = Image.open(io.BytesIO(image_bytes)).convert('L')

    bbox = img.getbbox()
    if not bbox:
        return np.zeros((1,28,28,1))

    number = img.crop(bbox)

    width, height = number.size

    if width > height:
        new_w = 20
        new_h = max(1, int(round((height * 20.0) / width)))
    else:
        new_h = 20
        new_w = max(1, int(round((width * 20.0) / height)))

    number = number.resize((new_w, new_h), Image.Resampling.LANCZOS)

    canvas = Image.new('L', (28, 28), color=0)
    x_pos = (28 - new_w) // 2
    y_pos = (28 - new_h) // 2
    canvas.paste(number, (x_pos, y_pos))

    arr = np.array(canvas, dtype=np.float32)

    cx, cy = getMassCenter(arr)

    shift_x = int(round(14.0 - cx))
    shift_y = int(round(14.0 - cy))

    arr = np.roll(arr, shift_y, axis=0)
    if shift_y > 0:
        arr[:shift_y, :] = 0
    elif shift_y < 0:
        arr[shift_y:, :] = 0

    arr = np.roll(arr, shift_x, axis=1)
    if shift_x > 0:
        arr[:, :shift_x] = 0
    elif shift_x < 0:
        arr[:, shift_x:] = 0

    arr /= 255

    return arr.reshape((1, 28, 28, 1))

