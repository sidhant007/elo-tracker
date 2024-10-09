from bson.objectid import ObjectId
from config import get_db

db = get_db()

# Create a room with a name, password, and an empty list of users
def create_new_room(name, password, owner_username):
    room = {
        "name": name,
        "password": password,
        "owner": owner_username,
        "users": []  # Users will be added as they join the room
    }
    db.rooms.insert_one(room)

# Add a new user to a room
def add_user_to_room(room_id, username, elo_singles=1500, elo_doubles=1500):
    user = {
        "username": username,
        "eloSingles": elo_singles,
        "eloDoubles": elo_doubles,
    }

    db.rooms.update_one(
        {"_id": ObjectId(room_id)},
        {"$addToSet": {"users": user}}
    )

    return user
