"""initial schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-09-28 23:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    bind = op.get_bind()
    from app.db.session import Base
    import app.models  # ensure models are imported
    Base.metadata.create_all(bind=bind)

def downgrade() -> None:
    bind = op.get_bind()
    from app.db.session import Base
    import app.models
    Base.metadata.drop_all(bind=bind)
