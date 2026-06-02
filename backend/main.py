from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

# Import our Supabase client
from supabase_client import supabase, check_connection

app = FastAPI(
    title="The Aiman's School Umerkot API",
    description="Python FastAPI backend communicating with Supabase database.",
    version="1.0.0",
)

# Enable CORS (Cross-Origin Resource Sharing)
# This allows your React frontend to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain (e.g., http://localhost:3000)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Pydantic Schemas for Requests/Responses ---

class InquiryCreate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    phone: str = Field(..., min_length=7, max_length=20)
    email: Optional[EmailStr] = None
    subject: str = Field(..., min_length=3, max_length=150)
    message: str = Field(..., min_length=5, max_length=2000)


# --- API Routes ---

@app.get("/")
def read_root():
    """
    Base welcome endpoint checking the overall API status.
    """
    db_connected = check_connection()
    return {
        "message": "Welcome to The Aiman's School Umerkot Python FastAPI API!",
        "status": "online",
        "database_connected": db_connected,
        "docs_url": "/docs",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }


@app.get("/api/db-status")
def get_db_status():
    """
    Performs a live query check to Supabase database.
    """
    is_ok = check_connection()
    if is_ok:
        return {"status": "ok", "message": "Successfully connected to Supabase Database."}
    else:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection is currently unavailable."
        )


@app.get("/api/notices")
def get_notices(limit: int = 10):
    """
    Fetches published, active notices from the notices table in Supabase.
    """
    try:
        response = (
            supabase.table("notices")
            .select("*")
            .eq("published", True)
            .order("published_at", desc=True)
            .limit(limit)
            .execute()
        )
        return {"notices": response.data}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch notices: {str(e)}"
        )


@app.get("/api/teachers")
def get_teachers():
    """
    Fetches school teachers list ordered by sort_order and name.
    """
    try:
        response = (
            supabase.table("teachers")
            .select("*")
            .order("sort_order", desc=False)
            .order("name", desc=False)
            .execute()
        )
        return {"teachers": response.data}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch teachers list: {str(e)}"
        )


@app.get("/api/blogs")
def get_blogs(limit: int = 6):
    """
    Fetches published blog posts.
    """
    try:
        response = (
            supabase.table("blogs")
            .select("*")
            .eq("published", True)
            .order("published_at", desc=True)
            .limit(limit)
            .execute()
        )
        return {"blogs": response.data}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch blog posts: {str(e)}"
        )


@app.post("/api/contact", status_code=status.HTTP_201_CREATED)
def submit_contact_inquiry(inquiry: InquiryCreate):
    """
    Accepts and registers a new contact inquiry into the Supabase database.
    """
    try:
        # Prepare data for insertion
        inquiry_data = {
            "full_name": inquiry.full_name,
            "phone": inquiry.phone,
            "email": inquiry.email,
            "subject": inquiry.subject,
            "message": inquiry.message,
            "status": "new",
            "created_at": datetime.utcnow().isoformat() + "Z"
        }
        
        response = supabase.table("contact_inquiries").insert(inquiry_data).execute()
        
        return {
            "status": "success",
            "message": "Inquiry submitted successfully.",
            "data": response.data[0] if response.data else None
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit inquiry: {str(e)}"
        )
