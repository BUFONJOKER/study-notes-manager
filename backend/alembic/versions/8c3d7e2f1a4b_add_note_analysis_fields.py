"""add analysis fields to notes

Revision ID: 8c3d7e2f1a4b
Revises: 94fedaeace1a
Create Date: 2026-10-13

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "8c3d7e2f1a4b"
down_revision: Union[str, Sequence[str], None] = "94fedaeace1a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column("notes", sa.Column("analysis_result", sa.JSON(), nullable=True))
    op.add_column("notes", sa.Column("summary_result", sa.String(), nullable=True))
    op.add_column("notes", sa.Column("key_concepts", sa.JSON(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("notes", "key_concepts")
    op.drop_column("notes", "summary_result")
    op.drop_column("notes", "analysis_result")
