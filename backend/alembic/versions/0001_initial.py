"""initial schema

Revision ID: 0001_initial
Revises: 
Create Date: 2025-12-10
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    user_role = sa.Enum("member", "librarian", name="userrole")
    user_role.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False, unique=True),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("role", user_role, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "books",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("author", sa.String(length=255), nullable=False),
        sa.Column("isbn", sa.String(length=50), nullable=False, unique=True),
        sa.Column("category", sa.String(length=100), nullable=False),
        sa.Column("copies_total", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("copies_available", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True)),
    )
    op.create_index("ix_books_isbn", "books", ["isbn"], unique=True)

    op.create_table(
        "borrowings",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("book_id", sa.Integer(), sa.ForeignKey("books.id", ondelete="CASCADE"), nullable=False),
        sa.Column("member_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("borrow_date", sa.Date(), nullable=False),
        sa.Column("due_date", sa.Date(), nullable=False),
        sa.Column("return_date", sa.Date()),
        sa.Column("fine", sa.Numeric(10, 2), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_borrowings_member", "borrowings", ["member_id"])
    op.create_index("ix_borrowings_book", "borrowings", ["book_id"])


def downgrade():
    op.drop_index("ix_borrowings_book", table_name="borrowings")
    op.drop_index("ix_borrowings_member", table_name="borrowings")
    op.drop_table("borrowings")

    op.drop_index("ix_books_isbn", table_name="books")
    op.drop_table("books")

    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")

    op.execute("DROP TYPE IF EXISTS userrole")
