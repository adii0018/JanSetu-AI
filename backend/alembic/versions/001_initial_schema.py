"""Initial schema with wards and complaints tables

Revision ID: 001
Revises: 
Create Date: 2026-09-01 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create wards table
    op.create_table(
        'wards',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('infra_index', sa.Integer(), nullable=False),
        sa.Column('budget_index', sa.Integer(), nullable=False),
        sa.CheckConstraint('infra_index >= 0 AND infra_index <= 100', name='check_infra_index_range'),
        sa.CheckConstraint('budget_index >= 0 AND budget_index <= 100', name='check_budget_index_range'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )
    op.create_index(op.f('ix_wards_id'), 'wards', ['id'], unique=False)
    op.create_index(op.f('ix_wards_name'), 'wards', ['name'], unique=True)
    
    # Create complaints table
    op.create_table(
        'complaints',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('tracking_id', sa.String(length=20), nullable=False),
        sa.Column('ward_id', sa.Integer(), nullable=False),
        sa.Column('raw_text', sa.Text(), nullable=False),
        sa.Column('language', sa.String(length=50), nullable=False),
        sa.Column('channel', sa.Enum('text', 'voice', 'whatsapp', name='complaintchannel'), nullable=False),
        sa.Column('category', sa.String(length=50), nullable=False),
        sa.Column('confidence', sa.Integer(), nullable=False),
        sa.Column('urgency', sa.Integer(), nullable=False),
        sa.Column('status', sa.Enum('submitted', 'under_review', 'approved', 'resolved', name='complaintstatus'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.CheckConstraint('confidence >= 0 AND confidence <= 100', name='check_confidence_range'),
        sa.CheckConstraint('urgency >= 0 AND urgency <= 100', name='check_urgency_range'),
        sa.ForeignKeyConstraint(['ward_id'], ['wards.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('tracking_id')
    )
    op.create_index(op.f('ix_complaints_category'), 'complaints', ['category'], unique=False)
    op.create_index(op.f('ix_complaints_created_at'), 'complaints', ['created_at'], unique=False)
    op.create_index(op.f('ix_complaints_id'), 'complaints', ['id'], unique=False)
    op.create_index(op.f('ix_complaints_tracking_id'), 'complaints', ['tracking_id'], unique=True)
    op.create_index(op.f('ix_complaints_ward_id'), 'complaints', ['ward_id'], unique=False)


def downgrade() -> None:
    # Drop complaints table
    op.drop_index(op.f('ix_complaints_ward_id'), table_name='complaints')
    op.drop_index(op.f('ix_complaints_tracking_id'), table_name='complaints')
    op.drop_index(op.f('ix_complaints_id'), table_name='complaints')
    op.drop_index(op.f('ix_complaints_created_at'), table_name='complaints')
    op.drop_index(op.f('ix_complaints_category'), table_name='complaints')
    op.drop_table('complaints')
    
    # Drop wards table
    op.drop_index(op.f('ix_wards_name'), table_name='wards')
    op.drop_index(op.f('ix_wards_id'), table_name='wards')
    op.drop_table('wards')
    
    # Drop enums
    sa.Enum(name='complaintstatus').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='complaintchannel').drop(op.get_bind(), checkfirst=True)
