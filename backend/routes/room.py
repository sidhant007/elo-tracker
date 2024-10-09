from bson.objectid import ObjectId
from config import get_db
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_bcrypt import check_password_hash
from models.room_model import create_new_room, add_user_to_room
from models.user_model import find_user_by_username
import pytz

def format_datetime_to_minute(dt_utc):
    # Convert the UTC datetime to the local timezone
    local_tz = pytz.timezone("America/Los_Angeles")  # Replace with your desired timezone
    dt_local = dt_utc.astimezone(local_tz)

    # Format the datetime to show only up to the minute
    return dt_local.strftime('%Y-%m-%d %H:%M')

db = get_db()
room_bp = Blueprint('room', __name__)

def get_username(user_id):
    user = db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return None
    return user['username']

@room_bp.route('/create', methods=['POST'])
@jwt_required()  # Require authentication
def create_room():
    print(f"HIT create_room: {request.get_json()}")
    current_user_id = get_jwt_identity()  # Get the user's identity from the JWT token
    username = get_username(current_user_id)
    if not username:
        return jsonify({"msg": "User not found"}), 404

    data = request.get_json()
    room_name = data.get('room_name')
    room_password = data.get('room_password')

    # Check if the room already exists
    if db.rooms.find_one({"name": room_name}):
        return jsonify({"msg": "Room already exists"}), 400

    # Create the room with the current user as the owner
    create_new_room(room_name, room_password, username)

    return jsonify({"msg": f"Room '{room_name}' created successfully, owned by {username}"}), 201

@room_bp.route('/join', methods=['POST'])
@jwt_required()  # Require authentication
def join_room():
    print(f"HIT join_room: {request.get_json()}")
    current_user_id = get_jwt_identity()
    username = get_username(current_user_id)
    if not username:
        return jsonify({"msg": "User not found"}), 404

    data = request.get_json()
    room_name = data.get('room_name')
    room_password = data.get('room_password')

    # Find the room by name
    room = db.rooms.find_one({"name": room_name})

    if not room:
        return jsonify({"msg": "Room not found"}), 404

    # Check the password
    if room['password'] != room_password:
        return jsonify({"msg": "Incorrect room password"}), 401

    # Check if the user already exists in the room
    if any(user['username'] == username for user in room.get('users', [])):
        return jsonify({"msg": "Username already exists in this room"}), 400

    # Add the user to the room with initial singles and doubles ELOs
    user = add_user_to_room(room["_id"], username, elo_singles=1500, elo_doubles=1500)
    return jsonify({"msg": f"User '{username}' added to room '{room_name}'"}), 200

@room_bp.route('/leave', methods=['POST'])
@jwt_required()  # Require authentication
def leave_room():
    print(f"HIT leave_room: {request.get_json()}")
    current_user_id = get_jwt_identity()
    username = get_username(current_user_id)
    if not username:
        return jsonify({"msg": "User not found"}), 404

    data = request.get_json()
    room_name = data.get('room_name')
    personal_password = data.get('personal_password')

    room = db.rooms.find_one({"name": room_name})
    if not room:
        return jsonify({"msg": "Room not found"}), 404

    user = find_user_by_username(username)
    if not user or not check_password_hash(user['password'], personal_password):
        return jsonify({"msg": "Invalid credentials"}), 401

    if any(user['username'] == username for user in room.get('users', [])):
        db.rooms.update_one({"_id": room["_id"]}, {"$pull": {"users": {"username": username}}})
        return jsonify({"msg": f"User '{username}' removed from room '{room_name}'"}), 200
    else:
        return jsonify({"msg": f"User '{username}' not found in room '{room_name}'"}), 404

@room_bp.route('/<room_name>/leaderboard', methods=['GET'])
@jwt_required()  # Require authentication
def leaderboard(room_name):
    print(f"HIT leaderboard for room_name: {room_name}")
    room = db.rooms.find_one({"name": room_name})

    if not room:
        return jsonify({"msg": "Room not found"}), 404

    match_type = request.args.get('type', 'singles')  # Get the match type (default to singles)

    if match_type == 'singles':
        # Sort by singles ELO
        users_sorted = sorted(room.get('users', []), key=lambda x: x['eloSingles'], reverse=True)
    elif match_type == 'doubles':
        # Sort by doubles ELO
        users_sorted = sorted(room.get('users', []), key=lambda x: x['eloDoubles'], reverse=True)
    else:
        return jsonify({"msg": "Invalid match type"}), 400

    leaderboard = [
        {"username": user["username"], "elo": user['eloSingles'] if match_type == 'singles' else user['eloDoubles']}
        for user in users_sorted
    ]

    return jsonify({"leaderboard": leaderboard}), 200

@room_bp.route('/<room_name>/all_matches', methods=['GET'])
@jwt_required()  # Require authentication
def all_matches(room_name):
    print(f"HIT all_matches for room_name: {room_name}")
    room = db.rooms.find_one({"name": room_name})

    if not room:
        return jsonify({"msg": "Room not found"}), 404

    matches = db.matches.find({"roomId": room["_id"]})
    matches = sorted(matches, key=lambda x: x["date"], reverse=True)
    matches = [
        {
            "winners": match["winning_usernames"],
            "losers": match["losing_usernames"],
            "type": match["type"],
            "delta": match["delta"],
            "date": format_datetime_to_minute(match["date"]),
            "score": match.get("score"),
            "addedBy": match.get("addedBy"),
        }
        for match in matches
    ]
    print(f"matches: {matches}")
    return jsonify({"matches": matches}), 200

# Helper function to convert MongoDB document to a JSON serializable dictionary
def serialize_room(room):
    room["_id"] = str(room["_id"])  # Convert room ObjectId to string
    if "users" in room:
        room["users"] = [str(user["username"]) for user in room["users"]]
    return room

@room_bp.route('/list', methods=['GET'])
@jwt_required()  # Require authentication
def list_rooms():
    print(f"HIT list_rooms")
    current_user_id = get_jwt_identity()
    username = get_username(current_user_id)
    if not username:
        return jsonify({"msg": "User not found"}), 404

    rooms = db.rooms.find({}, { "password": 0 }) # Exclude the password field
    serialized_rooms = [serialize_room(room) for room in rooms]

    my_rooms = [room for room in serialized_rooms if username in room.get('users', [])]
    other_rooms = [room for room in serialized_rooms if username not in room.get('users', [])]

    return jsonify({"myRooms": my_rooms, "otherRooms": other_rooms}), 200
