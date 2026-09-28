from fastapi import APIRouter
from app.api import quantum, ai, learning, assessment, demos

api_router = APIRouter()

api_router.include_router(quantum.router)
api_router.include_router(ai.router)
api_router.include_router(learning.router)
api_router.include_router(assessment.router)
api_router.include_router(demos.router)
