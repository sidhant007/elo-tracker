from config import get_db

db = get_db()
users_collection = db["users"]

def create_user(username, hashed_password):
    user = {
        "username": username,
        "password": hashed_password,
        "rooms": []
    }
    print(f"Creating user: {user}")
    users_collection.insert_one(user)

def find_user_by_username(username):
    print(f"Finding user by username: {username}")
    return users_collection.find_one({"username": username})
