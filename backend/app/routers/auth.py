from fastapi import APIRouter, Depends
from fastapi.responses import RedirectResponse
from starlette.requests import Request
from sqlalchemy.ext.asyncio import AsyncSession
from authlib.integrations.starlette_client import OAuth
from app.config import settings
from app.database import get_db
from app.services.auth import get_or_create_user, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

oauth = OAuth()

oauth.register(
    name="google",
    client_id=settings.google_client_id,
    client_secret=settings.google_client_secret,
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)


@router.get("/google")
async def login_google(request: Request):
    redirect_uri = request.url_for("auth_google_callback")
    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/google/callback", name="auth_google_callback")
async def auth_google_callback(request: Request, db: AsyncSession = Depends(get_db)):
    token = await oauth.google.authorize_access_token(request)
    user_info = token.get("userinfo")
    user = await get_or_create_user(
        db,
        provider="google",
        user_info={
            "id": user_info["sub"],
            "email": user_info["email"],
            "name": user_info.get("name", ""),
            "avatar_url": user_info.get("picture"),
        },
    )
    access_token = create_access_token({"sub": str(user.id)})
    return RedirectResponse(
        f"{settings.frontend_url}/auth/callback?token={access_token}"
    )


