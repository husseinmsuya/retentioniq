import os

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWKClient

security = HTTPBearer()

CLERK_ISSUER_URL = os.getenv("CLERK_ISSUER_URL")

if not CLERK_ISSUER_URL:
    raise RuntimeError("CLERK_ISSUER_URL is missing in backend .env")

JWKS_URL = f"{CLERK_ISSUER_URL}/.well-known/jwks.json"
jwks_client = PyJWKClient(JWKS_URL)


def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> str:
    token = credentials.credentials

    try:
        signing_key = jwks_client.get_signing_key_from_jwt(token)

        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            issuer=CLERK_ISSUER_URL,
            options={"verify_aud": False},
        )

        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid Clerk token")

        return user_id

    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired authentication token")