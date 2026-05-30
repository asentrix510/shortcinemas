from app.worker import celery_app
from app.database import SessionLocal
from app.models.video import Video

import time


@celery_app.task
def process_video(video_id):

    db = SessionLocal()

    video = db.query(Video).filter(
        Video.id == video_id
    ).first()

    if video:

        video.status = "processing"
        db.commit()

        time.sleep(10)

        video.status = "completed"
        db.commit()

    db.close()

    print(f"Finished video {video_id}")