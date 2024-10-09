from dotenv import load_dotenv
import os
from pymongo import MongoClient

load_dotenv('.env.dev' if os.getenv('FLASK_ENV') == 'development' else '.env.dummy')
MONGO_URI = os.getenv("MONGO_URI")

def get_db():
    print("Getting db...")
    client = MongoClient(MONGO_URI)
    #client = MongoClient("mongodb://localhost:27017/")
    db = client["tableTennisApp"]
    print("Got db")
    return db
