import secrets

# Generate a secure JWT secret key
jwt_secret_key = secrets.token_hex(32)  # Generates a 64-character hex string

print(jwt_secret_key)
