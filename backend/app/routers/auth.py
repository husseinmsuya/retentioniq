from fastapi import APIRouter
from pydantic import BaseModel, EmailStr

router = APIRouter()

class AuthRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterRequest(AuthRequest):
    full_name: str
    role: str = "Analyst"
    tenant_name: str

@router.post("/sign-in")
def sign_in(payload: AuthRequest):
    # TODO: validate user, issue JWT with tenant_id and role claims.
    return {"message": "Connect database and JWT service", "token": None}

@router.post("/sign-up")
def sign_up(payload: RegisterRequest):
    # TODO: create tenant user and send email verification.
    return {"message": "Registration endpoint ready", "user_id": None}

@router.post("/forgot-password")
def forgot_password(email: str):
    return {"message": "Password reset email provider not configured"}

@router.post("/reset-password")
def reset_password(token: str, new_password: str):
    return {"message": "Reset password flow ready"}

@router.post("/verify-email")
def verify_email(token: str):
    return {"message": "Email verification flow ready"}
