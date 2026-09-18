"""0003_incidents_and_certificates

Revision ID: 0003_incidents_and_certificates
Revises: 0002_verification_receipts
Create Date: 2026-09-06

"""
from alembic import op
import sqlalchemy as sa

revision = '0003_incidents_and_certificates'
down_revision = '0002_verification_receipts'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # incidents
    op.create_table(
        'incidents',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('doc_id', sa.String(length=64), nullable=False),
        sa.Column('failing_check', sa.String(length=64), nullable=False),
        sa.Column('actor_id', sa.String(length=64), nullable=False),
        sa.Column('details', sa.Text(), server_default='', nullable=False),
        sa.Column('status', sa.String(length=32), server_default='OPEN', nullable=False),
        sa.Column('ledger_tx_id', sa.String(length=128), server_default='', nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_incidents_doc_id'), 'incidents', ['doc_id'], unique=False)

    # certificates
    op.create_table(
        'certificates',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('doc_id', sa.String(length=64), nullable=False),
        sa.Column('issuer_id', sa.String(length=64), nullable=False),
        sa.Column('certificate_type', sa.String(length=32), server_default='BSA_63_SCHEDULE', nullable=False),
        sa.Column('pdf_path', sa.String(length=512), nullable=False),
        sa.Column('pdf_hash', sa.String(length=64), nullable=False),
        sa.Column('ledger_tx_id', sa.String(length=128), server_default='', nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_certificates_doc_id'), 'certificates', ['doc_id'], unique=False)

def downgrade() -> None:
    op.drop_table('certificates')
    op.drop_table('incidents')

