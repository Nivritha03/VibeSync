import cv2
import numpy as np
import base64
import logging
import os
from deepface import DeepFace

# Set logging level for deepface to avoid clutter
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3' 

logger = logging.getLogger(__name__)

# DeepFace will automatically download the required models (e.g., VGG-Face, Emotion)
# The first run might take some time as it downloads ~150-200MB of weights.

def _predict_single_frame(frame):
    """
    Detect faces in a single frame and return the emotion prediction
    using DeepFace. Returns (label, confidence) or (None, 0.0)
    """
    try:
        if frame is None or frame.size == 0:
            logger.error("Empty frame passed to DeepFace.analyze")
            return None, 0.0
            
        logger.info(f"Processing frame of shape: {frame.shape}")
        
        # Preprocessing: Normalize brightness and contrast to handle poor lighting
        # DeepFace does some of this, but manual normalization helps RetinaFace
        
        # Switch to retinaface for highest possible accuracy
        results = DeepFace.analyze(
            img_path=frame, 
            actions=['emotion'],
            enforce_detection=False, 
            detector_backend='retinaface',
            silent=True
        )
        
        if not results:
            logger.warning("DeepFace returned no results")
            return "neutral", 0.0

        face_result = results[0]
        dominant_emotion = face_result.get('dominant_emotion')
        emotion_confidence = face_result.get('emotion', {}).get(dominant_emotion, 0.0)

        # STRICT THRESHOLD: Only accept if AI is at least 60% sure
        conf_score = emotion_confidence / 100.0
        if conf_score < 0.6:
            logger.warning(f"Confidence too low ({conf_score}), rejecting prediction.")
            return "neutral", 0.0

        logger.info(f"Dominant emotion verified: {dominant_emotion} ({emotion_confidence}%)")
        return dominant_emotion, conf_score

    except ValueError as ve:
        # DeepFace raises ValueError if no face is detected when enforce_detection=True
        logger.warning(f"No face detected: {ve}")
        return None, 0.0
    except Exception as e:
        import traceback
        logger.error(f"DeepFace analysis error: {str(e)}")
        logger.error(traceback.format_exc())
        return None, 0.0


def detect_emotion_from_image(base64_string):
    """
    Decode a base64 string from the frontend, extract the frame,
    and predict the emotion using DeepFace.
    """
    try:
        # Expected format: data:image/jpeg;base64,...
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]

        image_data = base64.b64decode(base64_string)
        np_arr = np.frombuffer(image_data, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if frame is None:
            return {"emotion": "neutral", "confidence": 0.0, "method": "frame_decode_error"}
            
        label, conf = _predict_single_frame(frame)
        
        if label:
            return {
                "emotion": label,
                "confidence": float(round(conf * 100, 2)), # Convert to percentage and ensure float
                "method": "deepface_inference",
            }
        else:
            return {
                "emotion": "neutral",
                "confidence": 0.0,
                "method": "no_face_detected",
            }

    except Exception as e:
        logger.error(f"Error decoding image: {e}")
        return {
            "emotion": "neutral",
            "confidence": 0.0,
            "method": "decode_exception",
            "error": str(e)
        }