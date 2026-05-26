from sqlalchemy import Column, Integer, String
from app.database import Base

class Video(Base):
    __tablename__ = "videos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    filename = Column(String)
    media_type = Column(String)
    status = Column(String, default="uploaded")
    uploaded_by = Column(Integer)