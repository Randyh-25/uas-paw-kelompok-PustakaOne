"""add cover_url to books

Revision ID: 0002_add_cover_url
Revises: 0001_initial
Create Date: 2025-12-19

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0002_add_cover_url'
down_revision = '0001_initial'
branch_labels = None
depends_on = None


def upgrade():
    # Add cover_url column to books table
    op.add_column('books', sa.Column('cover_url', sa.String(length=500), nullable=True))


def downgrade():
    # Remove cover_url column from books table
    op.drop_column('books', 'cover_url')
