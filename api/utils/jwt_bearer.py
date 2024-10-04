from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from typing import Optional
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
SECRET_KEY = os.getenv('AUTH_SECRET_KEY')
ALGORITHM = os.getenv('AUTH_ALGORITHM')

class JWTBearer(HTTPBearer):
    def __init__(self, auto_error: bool = True):
        super(JWTBearer, self).__init__(auto_error=auto_error)

    async def __call__(self, request: Request) -> Optional[str]:
        credentials: HTTPAuthorizationCredentials = await super(JWTBearer, self).__call__(request)
        if credentials:
            if not credentials.scheme == "Bearer":
                raise HTTPException(status_code=403, detail="Invalid authentication scheme.")
            token = credentials.credentials
            payload = self.verify_jwt(token)
            if not payload:
                raise HTTPException(status_code=403, detail="Invalid or expired token.")
            return token  # Return the token for further processing
        else:
            raise HTTPException(status_code=403, detail="Invalid authorization code.")

    def verify_jwt(self, jwtoken: str) -> Optional[dict]:
        try:
            # Decode the JWT token
            payload = jwt.decode(jwtoken, SECRET_KEY, algorithms=[ALGORITHM])
            # Optionally, you can add more validation (e.g., check token expiry)
            return payload  # Return the payload if token is valid
        except JWTError as e:
            print(f"JWT decoding error: {e}")  # Log the error for debugging
            return None
