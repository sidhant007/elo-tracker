from datetime import datetime
from bson.objectid import ObjectId
from config import get_db

db = get_db()

def calculate_elo(winner_elo, loser_elo, k_factor=32):
    expected_score_winner = 1 / (1 + 10 ** ((loser_elo - winner_elo) / 400))
    delta = k_factor * (1 - expected_score_winner)
    return delta

def record_singles_match(room_id, score, addedBy, winner_username, loser_username):
    room = db.rooms.find_one({"_id": ObjectId(room_id)})
    if not room:
        return {"msg": "Room not found"}, 404

    # Fetch both the winner and loser inside the room's users list
    winner = next((user for user in room['users'] if user['username'] == winner_username), None)
    loser = next((user for user in room['users'] if user['username'] == loser_username), None)

    # Ensure both players exist
    if not winner or not loser:
        return {"msg": "One or both players not found in room"}, 404

    # Calculate the ELO delta based on the current ratings of the winner and loser
    delta = calculate_elo(winner['eloSingles'], loser['eloSingles'])

    # Update the winner's and loser's ELO by adding/subtracting the delta
    winner['eloSingles'] += delta
    loser['eloSingles'] -= delta

    # Update the room with the new ELO values for both players
    db.rooms.update_one(
        {"_id": ObjectId(room_id), "users.username": winner_username},
        {"$set": {"users.$.eloSingles": winner['eloSingles']}}
    )
    db.rooms.update_one(
        {"_id": ObjectId(room_id), "users.username": loser_username},
        {"$set": {"users.$.eloSingles": loser['eloSingles']}}
    )

    # Record the match in the database
    match = {
        "roomId": room_id,
        "score": score,
        "addedBy": addedBy,
        "winning_usernames": [winner_username],
        "losing_usernames": [loser_username],
        "type": "singles",
        "delta": delta,
        "date": datetime.now()
    }
    db.matches.insert_one(match)

    return {"msg": "Singles match recorded and ELO updated successfully"}, 200

def record_doubles_match(room_id, score, addedBy, winning_usernames, losing_usernames):
    # Fetch the room by room_id
    room = db.rooms.find_one({"_id": ObjectId(room_id)})

    if not room:
        return {"msg": "Room not found"}, 404

    # Find both teams in the room's users list
    team1 = [user for user in room['users'] if user['username'] in winning_usernames]
    team2 = [user for user in room['users'] if user['username'] in losing_usernames]

    if len(team1) != 2 or len(team2) != 2:
        return {"msg": "Each team must have exactly two players"}, 400

    # Calculate the average ELO for both teams
    team1_avg_elo = sum(player["eloDoubles"] for player in team1) / 2
    team2_avg_elo = sum(player["eloDoubles"] for player in team2) / 2

    # Calculate the ELO delta
    delta = calculate_elo(team1_avg_elo, team2_avg_elo)

    # Apply the ELO delta to both players in the winning and losing teams
    for player in team1:
        player["eloDoubles"] += delta
        db.rooms.update_one(
            {"_id": ObjectId(room_id), "users.username": player["username"]},
            {"$set": {"users.$.eloDoubles": player["eloDoubles"]}}
        )

    for player in team2:
        player["eloDoubles"] -= delta
        db.rooms.update_one(
            {"_id": ObjectId(room_id), "users.username": player["username"]},
            {"$set": {"users.$.eloDoubles": player["eloDoubles"]}}
        )

    # Record the match in the database
    match = {
        "roomId": room_id,
        "score": score,
        "addedBy": addedBy,
        "winning_usernames": winning_usernames,
        "losing_usernames": losing_usernames,
        "type": "doubles",
        "delta": delta,
        "date": datetime.now()
    }
    db.matches.insert_one(match)

    return {"msg": "Doubles match recorded and ELO updated successfully"}, 200
