from fastapi import FastAPI, Depends, UploadFile, File
from sqlalchemy.orm import Session
from app.database import Base, engine, get_db
from app.models.user import User
from app.models.video import Video
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Form
from fastapi.staticfiles import StaticFiles
from app.utils.auth import (
    hash_password,
    verify_password,
    create_access_token
)
import shutil

Base.metadata.create_all(bind=engine)

app = FastAPI()
app.mount(
    "/uploads",
    StaticFiles(directory="app/uploads"),
    name="uploads"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {
        "message": "ShortCinemas Backend Running"
    }

@app.post("/register")
def register(data: dict, db: Session = Depends(get_db)):

    user = User(
        username=data["username"],
        email=data["email"],
        password=hash_password(data["password"])
    )

    db.add(user)
    db.commit()

    return {
        "message": "User registered"
    }

@app.post("/login")
def login(data: dict, db: Session = Depends(get_db)):

    user = db.query(User).filter(
        User.email == data["email"]
    ).first()

    if not user:
        return {"error": "Invalid email"}

    if not verify_password(
        data["password"],
        user.password
    ):
        return {"error": "Wrong password"}

    token = create_access_token({
        "user_id": user.id
    })

    return {
        "access_token": token
    }

@app.post("/upload")
def upload_media(
    title: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    allowed_image_types = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ]

    allowed_video_types = [
        "video/mp4",
        "video/webm"
    ]

    if (
        file.content_type not in allowed_image_types
        and file.content_type not in allowed_video_types
    ):
        return {
            "error": "Unsupported file type"
        }

    file_location = f"app/uploads/{file.filename}"

    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    media_type = (
        "image"
        if file.content_type in allowed_image_types
        else "video"
    )

    media = Video(
        title=title,
        filename=file.filename,
        media_type=media_type,
        status="uploaded"
    )

    db.add(media)
    db.commit()

    return {
        "message": "Upload successful",
        "filename": file.filename,
        "media_type": media_type
    }

@app.get("/videos")
def get_videos(db: Session = Depends(get_db)):

    videos = db.query(Video).all()

    result = []

    for video in videos:
        result.append({
    "id": video.id,
    "title": video.title,
    "filename": video.filename,
    "media_type": video.media_type,
    "status": video.status
})

    return result