from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime


class PromptBase(BaseModel):
    """Base schema for Prompt with common fields."""
    title: str = Field(..., min_length=1, max_length=255, description="Prompt title")
    content: str = Field(..., min_length=1, description="Prompt content")
    tags: List[str] = Field(default_factory=list, description="List of tags")


class PromptCreate(PromptBase):
    """Schema for creating a new prompt."""
    pass


class PromptUpdate(BaseModel):
    """Schema for updating an existing prompt."""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    content: Optional[str] = Field(None, min_length=1)
    tags: Optional[List[str]] = None


class PromptResponse(PromptBase):
    """Schema for prompt response with all fields."""
    id: int
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class PromptSearchParams(BaseModel):
    """Schema for search parameters."""
    query: Optional[str] = Field(None, description="Search query for full-text search")
    tags: Optional[List[str]] = Field(None, description="Filter by tags")
    limit: int = Field(default=20, ge=1, le=100, description="Number of results to return")
    offset: int = Field(default=0, ge=0, description="Number of results to skip")
    sort_by: str = Field(default="created_at", description="Field to sort by")
    sort_order: str = Field(default="desc", pattern="^(asc|desc)$", description="Sort order")


class PromptListResponse(BaseModel):
    """Schema for paginated prompt list response."""
    prompts: List[PromptResponse]
    total: int
    limit: int
    offset: int
    has_more: bool 