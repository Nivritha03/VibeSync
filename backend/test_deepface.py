import os
import sys

try:
    from deepface import DeepFace
    print("DeepFace is installed")
    # Try to load a model to see if it works
    # We will use a dummy image (all zeros) to trigger model loading
    import numpy as np
    dummy_img = np.zeros((224, 224, 3), dtype=np.uint8)
    try:
        DeepFace.analyze(dummy_img, actions=['emotion'], enforce_detection=False, silent=True)
        print("DeepFace model loaded successfully")
    except Exception as e:
        print(f"DeepFace model load failed: {e}")
except ImportError:
    print("DeepFace is not installed")
except Exception as e:
    print(f"An unexpected error occurred: {e}")
