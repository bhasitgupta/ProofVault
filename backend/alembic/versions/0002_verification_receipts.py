"""0002_verification_receipts

Revision ID: 0002_verification_receipts
Revises: 0001_initial_schema
Create Date: 2026-09-06

"""
from alembic import op
import sqlalchemy as sa

revision = '0002_verification_receipts'
down_revision = '0001_initial_schema'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_table(
        'receipts',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('doc_id', sa.String(length=64), nullable=False),
        sa.Column('verified', sa.Boolean(), server_default='0', nullable=False),
        sa.Column('blob_hash_match', sa.Boolean(), server_default='0', nullable=False),
        sa.Column('content_hash_match', sa.Boolean(), server_default='0', nullable=False),
        sa.Column('merkle_root_match', sa.Boolean(), server_default='0', nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_receipts_doc_id'), 'receipts', ['doc_id'], unique=False)

def downgrade() -> None:
    op.drop_table('receipts')

