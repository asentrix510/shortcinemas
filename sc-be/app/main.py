from fastapi import FastAPI
from fastapi import Depends
from fastapi import UploadFile
from fastapi import File
from fastapi import Form

from sqlalchemy.orm import Session

from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import Base
from app.database import engine
from app.database import get_db

from app.models.video import Video
from app.models.user import User

from app.utils.auth import (
    hash_password,
    verify_password,
    create_access_token
)

import os
import shutil

INSTANCE_NAME = os.getenv(
    "INSTANCE_NAME",
    "unknown"
)

Base.metadata.create_all(bind=engine)

os.makedirs(
    "app/uploads",
    exist_ok=True
)

app = FastAPI()

app.mount(
    "/uploads",
    StaticFiles(directory="app/uploads"),
    name="uploads"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():

    return {
        "message": "ShortCinemas Backend Running",
        "instance": INSTANCE_NAME
    }

@app.post("/register")
def register(
    data: dict,
    db: Session = Depends(get_db)
):

    user = User(
        username=data["username"],
        email=data["email"],
        password=hash_password(
            data["password"]
        )
    )

    db.add(user)
    db.commit()

    return {
        "message": "User registered"
    }

@app.post("/login")
def login(
    data: dict,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.email == data["email"]
    ).first()

    if not user:
        return {
            "error": "Invalid email"
        }

    if not verify_password(
        data["password"],
        user.password
    ):
        return {
            "error": "Wrong password"
        }

    token = create_access_token(
        {
            "user_id": user.id
        }
    )

    return {
        "access_token": token
    }

@app.post("/upload")
def upload_media(
    title: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    allowed_images = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ]

    allowed_videos = [
        "video/mp4",
        "video/webm"
    ]

    if (
        file.content_type not in allowed_images
        and
        file.content_type not in allowed_videos
    ):
        return {
            "error": "Unsupported file type"
        }

    file_location = (
        f"app/uploads/{file.filename}"
    )

    with open(
        file_location,
        "wb"
    ) as buffer:

        shutil.copyfileobj(
            file.file,
            buffer
        )

    media_type = (
        "image"
        if file.content_type
        in allowed_images
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
    db.refresh(media)

    return {
        "message": "Upload successful",
        "instance": INSTANCE_NAME
    }

@app.get("/videos")
def get_videos(
    db: Session = Depends(get_db)
):

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

    return {
        "handled_by": INSTANCE_NAME,
        "videos": result
    }