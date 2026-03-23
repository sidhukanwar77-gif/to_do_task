from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import Base, engine
from app import models
from app.routers import auth, tasks

Base.metadata.create_all(bind=engine)  # create tables

app = FastAPI(title='Task Manager', version='1.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=False,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(auth.router)
app.include_router(tasks.router)

# Serve frontend files
app.mount('/', StaticFiles(directory='frontend', html=True), name='frontend')

