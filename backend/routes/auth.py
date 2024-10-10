from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_bcrypt import generate_password_hash, check_password_hash
from flask_jwt_extended import verify_jwt_in_request, create_access_token
from models.user_model import create_user, find_user_by_username

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/ping', methods=['GET'])
def ping():
    print(f"HIT ping")
    return jsonify({"current_date": str(datetime.now())}), 200

@auth_bp.route('/validate-token', methods=['GET'])
def validate_token():
    try:
        verify_jwt_in_request()  # This will throw an error if the token is invalid
        return jsonify({"msg": "Token is valid"}), 200
    except Exception as e:
        return jsonify({"msg": "Invalid token"}), 401

@auth_bp.route('/register', methods=['POST'])
def register_user():
    print(f"HIT register_user: {request.get_json()['username']}")
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if find_user_by_username(username):
        return jsonify({"msg": "User already exists"}), 400

    hashed_password = generate_password_hash(password).decode('utf-8')
    create_user(username, hashed_password)
    return jsonify({"msg": "User registered successfully"}), 201

@auth_bp.route('/login', methods=['POST'])
def login_user():
    print(f"HIT login_user: {request.get_json()['username']}")
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = find_user_by_username(username)
    if not user or not check_password_hash(user['password'], password):
        return jsonify({"msg": "Invalid credentials"}), 401

    access_token = create_access_token(identity=str(user["_id"]))
    return jsonify({"token": access_token}), 200
