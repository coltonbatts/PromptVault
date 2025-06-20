from sqlalchemy import Column, Integer, String, Text, DateTime, ARRAY
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import TSVECTOR

from ..database import Base


class Prompt(Base):
    """SQLAlchemy model for prompts table."""
    
    __tablename__ = "prompts"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    content = Column(Text, nullable=False)
    tags = Column(ARRAY(String), default=[], nullable=False)
    created_at = Column(
        DateTime(timezone=True), 
        server_default=func.now(),
        nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True), 
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )
    
    # Full-text search vector (generated column in PostgreSQL)
    # This is handled by the database, not SQLAlchemy
    search_vector = Column(TSVECTOR)
    
    def __repr__(self):
        return f"<Prompt(id={self.id}, title='{self.title[:50]}...')>"
    
    def to_dict(self):
        """Convert model instance to dictionary."""
        return {
            "id": self.id,
            "title": self.title,
            "content": self.content,
            "tags": self.tags or [],
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        } 