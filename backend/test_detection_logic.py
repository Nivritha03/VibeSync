import base64
import numpy as np
import cv2
from emotion_detector import detect_emotion_from_image

# Create a small dummy white image and encode to base64
img = np.ones((100, 100, 3), dtype=np.uint8) * 255
_, buffer = cv2.imencode('.jpg', img)
b64 = base64.b64encode(buffer).decode('utf-8')
data_url = f"data:image/jpeg;base64,{b64}"

print("Testing detect_emotion_from_image with dummy data...")
try:
    result = detect_emotion_from_image(data_url)
    print(f"Result: {result}")
except Exception as e:
    import traceback
    print(f"FAILED: {e}")
    traceback.print_exc()
