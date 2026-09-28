from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.schemas import LessonModule
from app.services.learning.curriculum_data import get_all_modules, get_module_by_id

router = APIRouter(prefix="/learning", tags=["Learning Curriculum"])

@router.get("/modules", response_model=List[LessonModule])
async def list_modules():
    """
    Retrieve all structured learning curriculum modules.
    """
    return get_all_modules()


@router.get("/modules/{module_id}", response_model=LessonModule)
async def get_module_detail(module_id: str):
    """
    Retrieve single learning module by ID.
    """
    mod = get_module_by_id(module_id)
    if not mod:
        raise HTTPException(status_code=404, detail="Module not found")
    return mod
