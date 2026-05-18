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

# Enable CORS with more explicit settings to handle all frontend origins and headers
CORS(app, resources={r"/*": {
    "origins": "*",
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization", "Access-Control-Allow-Origin"]
}})

@app.before_request
def log_request_info():
    logger.info('Headers: %s', request.headers)
    # logger.info('Body: %s', request.get_data()) # Avoid logging sensitive data like passwords

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
@app.route("/signup", methods=["POST"])
@app.route("/auth/register", methods=["POST"]) # Keep alias for backward compat
def register():
    data = request.json
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({"message": "Name, Email and Password are required"}), 400
    
    # Check if user already exists
    if users_collection.find_one({"email": email}):
        return jsonify({"message": "User already exists"}), 400

    hashed = generate_password_hash(password)
    users_collection.insert_one({
        "name": name,
        "email": email, 
        "password_hash": hashed,
        "createdAt": datetime.utcnow()
    })

    return jsonify({"message": "Registration successful"}), 201

@app.route("/login", methods=["POST"])
@app.route("/auth/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    user = users_collection.find_one({"email": email})
    if user and check_password_hash(user["password_hash"], password):
        # Include name in the identity or as extra data
        access_token = create_access_token(identity=email)
        return jsonify({
            "access_token": access_token, 
            "email": email,
            "name": user.get("name", email.split('@')[0])
        }), 200

    return jsonify({"message": "Invalid credentials"}), 401

@app.route("/profile", methods=["GET"])
@app.route("/auth/me", methods=["GET"])
@jwt_required()
def me():
    current_user_email = get_jwt_identity()
    user = users_collection.find_one({"email": current_user_email}, {"_id": 0, "password_hash": 0})
    if not user:
        return jsonify({"message": "User not found"}), 404
    return jsonify(user), 200

@app.route("/logout", methods=["POST"])
def logout():
    # Frontend handles JWT removal. Backend could blacklist if needed.
    return jsonify({"message": "Logged out successfully"}), 200


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
            current_user_email = get_jwt_identity()
            if emotion and emotion != "None":
                history_collection.insert_one({
                    "email": current_user_email,
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
        current_user_email = get_jwt_identity()
        # Get last 50 entries
        history = list(history_collection.find(
            {"email": current_user_email},
            {"_id": 0, "emotion": 1, "timestamp": 1}
        ).sort("timestamp", -1).limit(50))
        
        return jsonify(history)
    except Exception as e:
        logger.error(f"Error fetching history: {e}")
        return jsonify({"error": "Failed to fetch history"}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)