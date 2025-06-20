from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..services.prompt_service import PromptService
from ..schemas.prompt import (
    PromptCreate,
    PromptUpdate,
    PromptResponse,
    PromptSearchParams,
    PromptListResponse
)

router = APIRouter(prefix="/api/prompts", tags=["prompts"])


@router.post("/", response_model=PromptResponse, status_code=201)
async def create_prompt(
    prompt_data: PromptCreate,
    db: Session = Depends(get_db)
):
    """Create a new prompt."""
    try:
        prompt = PromptService.create_prompt(db, prompt_data)
        return prompt
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating prompt: {str(e)}")


@router.get("/", response_model=PromptListResponse)
async def search_prompts(
    query: Optional[str] = Query(None, description="Search query for full-text search"),
    tags: Optional[List[str]] = Query(None, description="Filter by tags"),
    limit: int = Query(20, ge=1, le=100, description="Number of results to return"),
    offset: int = Query(0, ge=0, description="Number of results to skip"),
    sort_by: str = Query("created_at", description="Field to sort by"),
    sort_order: str = Query("desc", regex="^(asc|desc)$", description="Sort order"),
    db: Session = Depends(get_db)
):
    """Search and list prompts with pagination and filtering."""
    try:
        search_params = PromptSearchParams(
            query=query,
            tags=tags,
            limit=limit,
            offset=offset,
            sort_by=sort_by,
            sort_order=sort_order
        )
        
        prompts, total = PromptService.search_prompts(db, search_params)
        
        return PromptListResponse(
            prompts=prompts,
            total=total,
            limit=limit,
            offset=offset,
            has_more=offset + limit < total
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching prompts: {str(e)}")


@router.get("/{prompt_id}", response_model=PromptResponse)
async def get_prompt(
    prompt_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific prompt by ID."""
    prompt = PromptService.get_prompt(db, prompt_id)
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    return prompt


@router.put("/{prompt_id}", response_model=PromptResponse)
async def update_prompt(
    prompt_id: int,
    prompt_data: PromptUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing prompt."""
    try:
        prompt = PromptService.update_prompt(db, prompt_id, prompt_data)
        if not prompt:
            raise HTTPException(status_code=404, detail="Prompt not found")
        return prompt
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating prompt: {str(e)}")


@router.delete("/{prompt_id}", status_code=204)
async def delete_prompt(
    prompt_id: int,
    db: Session = Depends(get_db)
):
    """Delete a prompt."""
    try:
        success = PromptService.delete_prompt(db, prompt_id)
        if not success:
            raise HTTPException(status_code=404, detail="Prompt not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting prompt: {str(e)}")


@router.get("/tags/all", response_model=List[str])
async def get_all_tags(db: Session = Depends(get_db)):
    """Get all unique tags from all prompts."""
    try:
        tags = PromptService.get_all_tags(db)
        return tags
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving tags: {str(e)}") 