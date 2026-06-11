from fastapi import APIRouter

router = APIRouter()

@router.get("/overview")
def overview():
    return {"users": 0, "roles": ["Admin", "Analyst", "Manager"], "permissions": [], "audit_logs": []}
