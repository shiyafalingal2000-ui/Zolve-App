from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

class Task(BaseModel):
    title: str
    description: str
    location: str
    price: int
    urgency: str
    status: str = "open"
    user_email: str

@app.get("/")
def root():
    return {"message": "Zolve API is running"}

@app.get("/tasks")
def get_tasks():
    response = supabase.table("Tasks").select("*").execute()
    return response.data

@app.post("/tasks")
def create_task(task: Task):
    data = {
        "Title": task.title,
        "Description": task.description,
        "Location": task.location,
        "Price": task.price,
        "Urgency": task.urgency,
        "Status": task.status,
        "user_email": task.user_email
    }
    response = supabase.table("Tasks").insert(data).execute()
    return response.data

@app.put("/tasks/{task_id}")
def update_task(task_id: int, status: str):
    response = supabase.table("Tasks").update({"Status": status}).eq("id", task_id).execute()
    return response.data
