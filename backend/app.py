import logging
import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv

load_dotenv()
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta, datetime

from emotion_detector import detect_emotion_from_image
from music_api import recommend_music

# ─── Logging setup ──────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

# ─── Flask app & Config ─────────────────────────────────────────────
app = Flask(__name__)
CORS(app)

# Database / Auth Config
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET', 'A_VERY_SECRET_KEY_REPLACE_IN_PROD')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

jwt = JWTManager(app)

MONGO_URI = os.environ.get("MONGO_URI")
if not MONGO_URI:
    raise ValueError("No MONGO_URI setup in your .env file!")

# Create a new client and connect to the server
mongo_client = MongoClient(MONGO_URI, server_api=ServerApi('1'))
try:
    mongo_client.admin.command('ping')
    logger.info("Successfully connected to MongoDB Atlas!")
except Exception as e:
    logger.error("Error connecting to MongoDB: %s", e)

db = mongo_client["VibeSync"]
users_collection = db["users"]
history_collection = db["history"]

# ─── Auth Endpoints ─────────────────────────────────────────────────
@app.route("/auth/register", methods=["POST"])
def register():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"message": "Username and password required"}), 400

    if users_collection.find_one({"username": username}):
        return jsonify({"message": "User already exists"}), 409

    hashed = generate_password_hash(password)
    users_collection.insert_one({"username": username, "password_hash": hashed})

    return jsonify({"message": "Registration successful"}), 201

@app.route("/auth/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    user = users_collection.find_one({"username": username})
    if user and check_password_hash(user["password_hash"], password):
        access_token = create_access_token(identity=username)
        return jsonify({"access_token": access_token, "username": username}), 200

    return jsonify({"message": "Invalid credentials"}), 401

@app.route("/auth/me", methods=["GET"])
@jwt_required()
def me():
    current_user = get_jwt_identity()
    return jsonify({"username": current_user}), 200


# ─── Core Application Endpoints ─────────────────────────────────────
@app.route("/")
def home():
    return jsonify({
        "status": "running",
        "service": "VibeSync Emotion Music API",
        "endpoints": {
            "POST /auth/register": "Register account",
            "POST /auth/login": "Login account",
            "POST /detect-emotion": "Detect emotion from base64 image payload",
            "GET /health": "Health check",
        },
    })


@app.route("/health")
def health():
    return jsonify({"status": "healthy"})


@app.route("/detect-emotion", methods=["POST"])
@jwt_required()
def detect():
    try:
        data = request.json
        if not data or "image" not in data:
            return jsonify({"error": "Missing 'image' parameter in JSON payload. Expected base64 string."}), 400
            
        base64_string = data["image"]

        # Step 1: Detect emotion from image payload
        result = detect_emotion_from_image(base64_string)
        emotion = result.get("emotion")
        confidence = result.get("confidence")
        method = result.get("method")

        logger.info(
            f"Detected emotion: {emotion} "
            f"(confidence={confidence}, method={method})"
        )

        if emotion == "neutral" and confidence == 0.0:
             return jsonify({
                 "emotion": "None",
                 "confidence": 0,
                 "songs": [],
                 "message": "No face detected or model failed."
             })

        # Step 2: Get music recommendations
        songs = []
        if emotion and emotion != "None":
            songs = recommend_music(emotion)

        # Step 3: Save to history for analytics
        try:
            current_user = get_jwt_identity()
            if emotion and emotion != "None":
                history_collection.insert_one({
                    "username": current_user,
                    "emotion": emotion.capitalize(),
                    "timestamp": datetime.utcnow()
                })
        except Exception as e:
            logger.error(f"Failed to save history: {e}")

        # Step 4: Determine display emotion
        display_emotion = str(emotion).capitalize() if emotion else "Neutral"
        num_songs = len(songs) if songs else 0

        logger.info(f"Returning result: {display_emotion} with {num_songs} songs")

        return jsonify({
            "emotion": display_emotion,
            "confidence": float(confidence) if confidence is not None else 0.0,
            "detection_method": method,
            "songs": songs if songs else [],
            "song_count": num_songs,
        })

    except Exception as e:
        import traceback
        error_info = traceback.format_exc()
        with open("backend_errors.log", "a") as f:
            f.write(f"\n--- {datetime.now()} ---\n{error_info}\n")
        logger.error(f"Detection error: {str(e)}")
        return jsonify({
            "error": "Failed to detect emotion or fetch music",
            "detail": str(e),
            "traceback": error_info if app.debug else None
        }), 500


@app.route("/analytics/history", methods=["GET"])
@jwt_required()
def get_history():
    try:
        current_user = get_jwt_identity()
        # Get last 50 entries
        history = list(history_collection.find(
            {"username": current_user},
            {"_id": 0, "emotion": 1, "timestamp": 1}
        ).sort("timestamp", -1).limit(50))
        
        return jsonify(history)
    except Exception as e:
        logger.error(f"Error fetching history: {e}")
        return jsonify({"error": "Failed to fetch history"}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, host="0.0.0.0", port=port)