"""create initial tables

Revision ID: xxxx_create_initial_tables
Revises: 
Create Date: 2025-12-09

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "xxxx_create_initial_tables"
down_revision = None
branch_labels = None
depends_on = None


userrole_enum = sa.Enum("ADMIN", "LIBRARIAN", "STUDENT", name="userrole")


def upgrade():
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("email", sa.String(length=255), nullable=False, unique=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("role", userrole_enum, nullable=False, server_default="STUDENT"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )

    op.create_table(
        "books",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("author", sa.String(length=255), nullable=False),
        sa.Column("isbn", sa.String(length=50), nullable=True, unique=True),
        sa.Column("copies_total", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("copies_available", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )

    op.create_table(
        "borrowings",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("book_id", sa.Integer(), sa.ForeignKey("books.id"), nullable=False),
        sa.Column("borrowed_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("due_date", sa.DateTime(), nullable=False),
        sa.Column("returned_at", sa.DateTime(), nullable=True),
        sa.Column("late_fee", sa.Integer(), nullable=True),
    )


def downgrade():
    op.drop_table("borrowings")
    op.drop_table("books")
    op.drop_table("users")
    op.execute("DROP TYPE userrole")
