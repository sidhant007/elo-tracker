from bson.objectid import ObjectId
from config import get_db
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.match_model import record_singles_match, record_doubles_match
import re

db = get_db()
match_bp = Blueprint('match', __name__)

def get_username(user_id):
    user = db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return None
    return user['username']

def validate_score(score):
    match = re.match(r'^(\d+)-(\d+)$', score)
    if not match:
        return False
    x = int(match.group(1))
    y = int(match.group(2))
    return (x >= 0 and y >= 0 and x >= y)

@match_bp.route('/add', methods=['POST'])
@jwt_required()
def add_match():
    print(f"HIT add_match: {request.get_json()}")
    current_user_id = get_jwt_identity()  # Get the user's identity from the JWT token
    username = get_username(current_user_id)
    if not username:
        return jsonify({"msg": "User not found"}), 404

    data = request.get_json()
    match_type = data.get('type')  # 'singles' or 'doubles'
    room_name = data.get('room_name')  # Room name provided in the request
    room = db.rooms.find_one({"name": room_name})
    if not room:
        return jsonify({"msg": "Room not found"}), 404

    score = data.get('score')
    if score is not None and not validate_score(score):
        return jsonify({"msg": "Invalid score format"}), 400

    if match_type == 'singles':
        winner_name = data.get('winner_name')
        loser_name = data.get('loser_name')

        if not winner_name or not loser_name:
            return jsonify({"msg": "Winner and loser names are required"}), 400 

        winner = next((user for user in room['users'] if user['username'] == winner_name), None)
        loser = next((user for user in room['users'] if user['username'] == loser_name), None)

        if not winner or not loser:
            return jsonify({"msg": "Winner or loser not found in room"}), 404

        response, status_code = record_singles_match(room['_id'], score, username, winner_name, loser_name)
        return jsonify(response), status_code

    elif match_type == 'doubles':
        winning_team = data.get('winning_team')  # List of two player names
        losing_team = data.get('losing_team')  # List of two player names

        if not winning_team or not losing_team or len(winning_team) != 2 or len(losing_team) != 2:
            return jsonify({"msg": "Both teams must have two players"}), 400

        if len(set(winning_team)) != 2 or len(set(losing_team)) != 2:
            return jsonify({"msg": "A player cannot be listed twice in the same team"}), 400

        response, status_code = record_doubles_match(room['_id'], score, username, winning_team, losing_team)
        return jsonify(response), status_code

    return jsonify({"msg": "Invalid match type"}), 400
