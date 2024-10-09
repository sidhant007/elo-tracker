from pymongo import MongoClient

def get_db():
    print("Getting db...")
    client = MongoClient("mongodb://localhost:27017/")
    db = client["tableTennisApp"]
    print("Got db")
    return db
