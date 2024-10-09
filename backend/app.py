from flask import Flask
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
#from flask_jwt_extended.exceptions import NoAuthorizationError
#from werkzeug.exceptions import Unauthorized
from routes.auth import auth_bp
from routes.room import room_bp
from routes.match import match_bp
from dotenv import load_dotenv
import os

app = Flask(__name__)

load_dotenv('.env.dev' if os.getenv('FLASK_ENV') == 'development' else '.env.dummy')

app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")

bcrypt = Bcrypt(app)
jwt = JWTManager(app)

#@app.errorhandler(NoAuthorizationError)
#@app.errorhandler(Unauthorized)
#def handle_jwt_error(e):
#   return redirect('/')  # Redirects to the base URL '/'

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(room_bp, url_prefix='/api/rooms')
app.register_blueprint(match_bp, url_prefix='/api/matches')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000)
