from fastapi import FastAPI, Depends, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from supabase_client import supabase_admin
from dependencies import get_current_user
from models import TodoCreate, TodoUpdate
from config import settings
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG if settings.DEBUG else logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="TaskFlow API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled server error", exc_info=exc)
    detail = str(exc) if settings.DEBUG else "Internal server error"
    request_origin = request.headers.get("origin")
    allowed_origin = request_origin if request_origin in settings.cors_origins else (
        settings.cors_origins[0] if settings.cors_origins else ""
    )
    return JSONResponse(
        status_code=500,
        content={"detail": detail},
        headers={
            "Access-Control-Allow-Origin": allowed_origin,
            "Access-Control-Allow-Credentials": "true",
        },
    )


@app.get("/health")
async def health():
    return {"status": "ok", "environment": settings.APP_ENV}


@app.get("/todos")
async def get_todos(user=Depends(get_current_user)):
    try:
        response = supabase_admin.table("todos") \
            .select("*") \
            .eq("user_id", user.id) \
            .execute()
        return response.data
    except Exception as e:
        logger.error(f"Error fetching todos: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch todos")


@app.post("/todos")
async def create_todo(todo: TodoCreate, user=Depends(get_current_user)):
    try:
        # Check if profile exists (Hack/Fallback if trigger is missing)
        # In a real app, we rely on the trigger. verifying here for hackathon robustness.
        profile = supabase_admin.table("profiles").select("id").eq("id", user.id).execute()
        if not profile.data:
            logger.info(f"Profile missing for user {user.id}, creating entry...")
            supabase_admin.table("profiles").insert({"id": user.id}).execute()

        response = supabase_admin.table("todos") \
            .insert({
                "user_id": user.id,
                "title": todo.title
            }) \
            .execute()
        return response.data
    except Exception as e:
        logger.error(f"Error creating todo: {e}")
        raise HTTPException(status_code=500, detail="Failed to create todo")


@app.put("/todos/{todo_id}")
async def update_todo(todo_id: str, todo: TodoUpdate, user=Depends(get_current_user)):
    try:
        response = supabase_admin.table("todos") \
            .update(todo.model_dump(exclude_none=True)) \
            .eq("id", todo_id) \
            .eq("user_id", user.id) \
            .execute()

        return response.data
    except Exception as e:
        logger.error(f"Error updating todo {todo_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update todo")


@app.delete("/todos/{todo_id}")
async def delete_todo(todo_id: str, user=Depends(get_current_user)):
    try:
        supabase_admin.table("todos") \
            .delete() \
            .eq("id", todo_id) \
            .eq("user_id", user.id) \
            .execute()

        return {"message": "Deleted"}
    except Exception as e:
        logger.error(f"Error deleting todo {todo_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete todo")
