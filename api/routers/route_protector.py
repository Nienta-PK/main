from fastapi import APIRouter, Depends
from utils.deps import get_current_user, AuthUser

router = APIRouter()

@router.get("/protected-route")
async def protected_route(current_user: AuthUser = Depends(get_current_user)):
    return {"message": f"Hello, {current_user.username}! You are authenticated."}
