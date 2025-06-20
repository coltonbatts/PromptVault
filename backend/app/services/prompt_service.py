from sqlalchemy.orm import Session
from sqlalchemy import func, text, desc, asc
from typing import List, Optional, Tuple
import logging

from ..models.prompt import Prompt
from ..schemas.prompt import PromptCreate, PromptUpdate, PromptSearchParams

logger = logging.getLogger(__name__)


class PromptService:
    """Service class for prompt-related business logic."""
    
    @staticmethod
    def create_prompt(db: Session, prompt_data: PromptCreate) -> Prompt:
        """Create a new prompt."""
        try:
            # Normalize tags (lowercase, strip whitespace)
            normalized_tags = [tag.lower().strip() for tag in prompt_data.tags if tag.strip()]
            
            db_prompt = Prompt(
                title=prompt_data.title.strip(),
                content=prompt_data.content.strip(),
                tags=normalized_tags
            )
            
            db.add(db_prompt)
            db.commit()
            db.refresh(db_prompt)
            
            logger.info(f"Created prompt with ID: {db_prompt.id}")
            return db_prompt
            
        except Exception as e:
            logger.error(f"Error creating prompt: {e}")
            db.rollback()
            raise
    
    @staticmethod
    def get_prompt(db: Session, prompt_id: int) -> Optional[Prompt]:
        """Get a prompt by ID."""
        return db.query(Prompt).filter(Prompt.id == prompt_id).first()
    
    @staticmethod
    def update_prompt(db: Session, prompt_id: int, prompt_data: PromptUpdate) -> Optional[Prompt]:
        """Update an existing prompt."""
        try:
            db_prompt = db.query(Prompt).filter(Prompt.id == prompt_id).first()
            if not db_prompt:
                return None
            
            # Update only provided fields
            update_data = prompt_data.model_dump(exclude_unset=True)
            
            # Normalize tags if provided
            if 'tags' in update_data:
                update_data['tags'] = [tag.lower().strip() for tag in update_data['tags'] if tag.strip()]
            
            for field, value in update_data.items():
                setattr(db_prompt, field, value)
            
            db.commit()
            db.refresh(db_prompt)
            
            logger.info(f"Updated prompt with ID: {prompt_id}")
            return db_prompt
            
        except Exception as e:
            logger.error(f"Error updating prompt {prompt_id}: {e}")
            db.rollback()
            raise
    
    @staticmethod
    def delete_prompt(db: Session, prompt_id: int) -> bool:
        """Delete a prompt by ID."""
        try:
            db_prompt = db.query(Prompt).filter(Prompt.id == prompt_id).first()
            if not db_prompt:
                return False
            
            db.delete(db_prompt)
            db.commit()
            
            logger.info(f"Deleted prompt with ID: {prompt_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting prompt {prompt_id}: {e}")
            db.rollback()
            raise
    
    @staticmethod
    def search_prompts(db: Session, params: PromptSearchParams) -> Tuple[List[Prompt], int]:
        """Search prompts with full-text search and filtering."""
        try:
            query = db.query(Prompt)
            
            # Apply full-text search if query provided
            if params.query and params.query.strip():
                search_query = params.query.strip()
                # Use PostgreSQL full-text search
                query = query.filter(
                    Prompt.search_vector.match(search_query)
                ).order_by(
                    func.ts_rank(Prompt.search_vector, func.plainto_tsquery('english', search_query)).desc()
                )
            
            # Apply tag filtering
            if params.tags:
                # Normalize tags for comparison
                normalized_tags = [tag.lower().strip() for tag in params.tags]
                query = query.filter(Prompt.tags.overlap(normalized_tags))
            
            # Apply sorting (if not already sorted by search rank)
            if not (params.query and params.query.strip()):
                sort_column = getattr(Prompt, params.sort_by, Prompt.created_at)
                if params.sort_order == "desc":
                    query = query.order_by(desc(sort_column))
                else:
                    query = query.order_by(asc(sort_column))
            
            # Get total count before pagination
            total = query.count()
            
            # Apply pagination
            prompts = query.offset(params.offset).limit(params.limit).all()
            
            logger.info(f"Search returned {len(prompts)} prompts out of {total} total")
            return prompts, total
            
        except Exception as e:
            logger.error(f"Error searching prompts: {e}")
            raise
    
    @staticmethod
    def get_all_tags(db: Session) -> List[str]:
        """Get all unique tags from all prompts."""
        try:
            # Use PostgreSQL array functions to get unique tags
            result = db.execute(
                text("SELECT DISTINCT unnest(tags) as tag FROM prompts ORDER BY tag")
            )
            tags = [row[0] for row in result if row[0]]  # Filter out empty strings
            
            logger.info(f"Retrieved {len(tags)} unique tags")
            return tags
            
        except Exception as e:
            logger.error(f"Error getting tags: {e}")
            raise 