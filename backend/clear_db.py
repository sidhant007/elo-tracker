from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")  # Replace with your MongoDB URI
db = client["tableTennisApp"]

# Drop specific collections
db.users.drop()
db.rooms.drop()
db.matches.drop()
