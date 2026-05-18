import requests
import logging
import random
import os
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

CLIENT_ID = os.environ.get("JAMENDO_CLIENT_ID", "0d1a003b")
JAMENDO_BASE = "https://api.jamendo.com/v3.0/tracks/"
REQUEST_TIMEOUT = 10  # seconds

# ─── Emotion → Jamendo tags mapping ─────────────────────────────────
# Jamendo has limited tags; we map each emotion to mood/genre combos
# that actually return results. Multiple tag groups provide fallbacks.
EMOTION_TAG_MAP = {
    "happy": [
        "happy+pop",
        "upbeat+dance",
        "joyful",
        "feelgood",
        "happy",
    ],
    "sad": [
        "sad+acoustic",
        "melancholy",
        "emotional+piano",
        "sad",
        "ballad",
    ],
    "angry": [
        "aggressive+rock",
        "metal",
        "intense",
        "angry",
        "hardrock",
    ],
    "fear": [
        "dark+ambient",
        "suspense",
        "cinematic+dark",
        "horror",
        "dark",
    ],
    "surprise": [
        "energetic+electronic",
        "funky",
        "upbeat",
        "energetic",
        "electro",
    ],
    "disgust": [
        "grunge",
        "punk",
        "alternative+rock",
        "punk",
        "indie",
    ],
    "neutral": [
        "chill+lofi",
        "relaxing",
        "ambient",
        "chill",
        "calm",
    ],
}


def _fetch_tracks(tags, limit=5):
    """
    Query Jamendo API with given tags. Returns list of track dicts or empty list.
    """
    url = (
        f"{JAMENDO_BASE}?client_id={CLIENT_ID}"
        f"&tags={tags}"
        f"&limit={limit}"
        f"&format=json"
        f"&order=popularity_total"
        f"&include=musicinfo"
    )

    try:
        response = requests.get(url, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
        data = response.json()

        if "results" not in data or not data["results"]:
            return []

        return data["results"]

    except requests.exceptions.Timeout:
        logger.error(f"Jamendo API timeout for tags: {tags}")
        return []
    except requests.exceptions.RequestException as e:
        logger.error(f"Jamendo API error: {e}")
        return []
    except (ValueError, KeyError) as e:
        logger.error(f"Failed to parse Jamendo response: {e}")
        return []


def recommend_music(emotion):
    """
    Recommend music tracks based on detected emotion.

    Args:
        emotion (str): One of the 7 emotion labels.

    Returns:
        list[dict]: List of song dicts with title, artist, audio, image, duration.
    """
    emotion = emotion.lower().strip()
    tag_options = EMOTION_TAG_MAP.get(emotion, EMOTION_TAG_MAP["neutral"])

    # Shuffle the tag options to add variety across requests
    tag_list = tag_options.copy()
    random.shuffle(tag_list)

    all_tracks = []
    seen_ids = set()

    # Try each tag group until we have enough unique tracks
    for tags in tag_list:
        if len(all_tracks) >= 5:
            break

        results = _fetch_tracks(tags, limit=5)

        for track in results:
            track_id = track.get("id")
            if track_id and track_id not in seen_ids:
                seen_ids.add(track_id)
                all_tracks.append({
                    "title":    track.get("name", "Unknown"),
                    "artist":   track.get("artist_name", "Unknown"),
                    "audio":    track.get("audio", ""),
                    "image":    track.get("image", ""),
                    "duration": track.get("duration", 0),
                    "album":    track.get("album_name", ""),
                })

    # If we still have nothing, try a generic fallback
    if not all_tracks:
        logger.warning(f"No tracks found for emotion '{emotion}', using fallback")
        fallback_results = _fetch_tracks("pop", limit=5)
        for track in fallback_results:
            all_tracks.append({
                "title":    track.get("name", "Unknown"),
                "artist":   track.get("artist_name", "Unknown"),
                "audio":    track.get("audio", ""),
                "image":    track.get("image", ""),
                "duration": track.get("duration", 0),
                "album":    track.get("album_name", ""),
            })

    logger.info(f"Recommended {len(all_tracks)} tracks for emotion '{emotion}'")
    return all_tracks[:8]  # Return up to 8 tracks for variety