"""Rename notes_id column to note_id

Revision ID: 001_rename_notes_id
Revises: cff72840579c
Create Date: 2026-08-31 23:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "001_rename_notes_id"
down_revision: Union[str, Sequence[str], None] = "cff72840579c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Drop the old index first
    op.drop_index("ix_notes_notes_id", table_name="notes")

    # Rename the column
    op.alter_column("notes", "notes_id", new_column_name="note_id")

    # Create the new index
    op.create_index(op.f("ix_notes_note_id"), "notes", ["note_id"], unique=True)


def downgrade() -> None:
    """Downgrade schema."""
    # Drop the new index
    op.drop_index(op.f("ix_notes_note_id"), table_name="notes")

    # Rename the column back
    op.alter_column("notes", "note_id", new_column_name="notes_id")

    # Create the old index
    op.create_index("ix_notes_notes_id", "notes", ["notes_id"], unique=True)
