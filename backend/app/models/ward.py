"""
Ward ORM model.
Represents administrative wards with infrastructure and budget indices.
"""
from sqlalchemy import Column, Integer, String, CheckConstraint
from app.database import Base


class Ward(Base):
    """
    Ward model representing an administrative area.
    
    Attributes:
        id: Primary key
        name: Unique ward name
        infra_index: Infrastructure quality index (0-100, higher is better)
        budget_index: Budget allocation index (0-100, higher is more allocated)
    """
    __tablename__ = "wards"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    infra_index = Column(Integer, nullable=False)
    budget_index = Column(Integer, nullable=False)
    
    __table_args__ = (
        CheckConstraint('infra_index >= 0 AND infra_index <= 100', name='check_infra_index_range'),
        CheckConstraint('budget_index >= 0 AND budget_index <= 100', name='check_budget_index_range'),
    )
