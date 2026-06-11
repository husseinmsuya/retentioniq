from fastapi import APIRouter

router = APIRouter()

@router.get("/dashboard")
def dashboard():
    return {
        "kpis": [],
        "churn_trend": [],
        "retention_trend": [],
        "revenue_impact": [],
        "segment_distribution": [],
        "probability_distribution": [],
    }

@router.get("/customers")
def customers():
    return {"items": [], "total": 0, "page": 1, "page_size": 25}

@router.get("/revenue")
def revenue():
    return {"monthly": [], "quarterly": [], "annual": []}
