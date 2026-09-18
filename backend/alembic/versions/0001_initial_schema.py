"""0001_initial_schema

Revision ID: 0001_initial_schema
Revises: 
Create Date: 2026-09-06

"""
from alembic import op
import sqlalchemy as sa

revision = '0001_initial_schema'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # users
    op.create_table(
        'users',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('username', sa.String(length=64), nullable=False),
        sa.Column('full_name', sa.String(length=128), nullable=False),
        sa.Column('role', sa.String(length=32), nullable=False),
        sa.Column('password_hash', sa.String(length=256), nullable=False),
        sa.Column('totp_secret', sa.String(length=64), server_default='', nullable=False),
        sa.Column('mfa_enrolled', sa.Boolean(), server_default='0', nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default='1', nullable=False),
        sa.Column('msp_id', sa.String(length=64), server_default='PoliceMSP', nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=True)

    # cases
    op.create_table(
        'cases',
        sa.Column('case_id', sa.String(length=64), nullable=False),
        sa.Column('title', sa.String(length=256), nullable=False),
        sa.Column('description', sa.String(length=1024), server_default='', nullable=False),
        sa.Column('classification_ceiling', sa.String(length=32), server_default='CONFIDENTIAL', nullable=False),
        sa.Column('status', sa.String(length=32), server_default='ACTIVE', nullable=False),
        sa.Column('owning_msp', sa.String(length=64), server_default='PoliceMSP', nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('case_id')
    )

    # assignments
    op.create_table(
        'assignments',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('user_id', sa.String(length=64), nullable=False),
        sa.Column('case_id', sa.String(length=64), nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default='1', nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['case_id'], ['cases.case_id']),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_assignments_case_id'), 'assignments', ['case_id'], unique=False)
    op.create_index(op.f('ix_assignments_user_id'), 'assignments', ['user_id'], unique=False)

    # documents
    op.create_table(
        'documents',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('case_id', sa.String(length=64), nullable=False),
        sa.Column('filename', sa.String(length=256), nullable=False),
        sa.Column('content_hash', sa.String(length=64), nullable=False),
        sa.Column('blob_hash', sa.String(length=64), nullable=False),
        sa.Column('chunk_merkle_root', sa.String(length=64), nullable=False),
        sa.Column('chunk_count', sa.Integer(), server_default='0', nullable=False),
        sa.Column('size_bytes', sa.Integer(), nullable=False),
        sa.Column('mime_type', sa.String(length=64), server_default='application/pdf', nullable=False),
        sa.Column('doc_type', sa.String(length=32), nullable=False),
        sa.Column('classification', sa.String(length=32), nullable=False),
        sa.Column('uploader_id', sa.String(length=64), nullable=False),
        sa.Column('storage_path', sa.String(length=512), nullable=False),
        sa.Column('wrapped_dek', sa.String(length=512), nullable=False),
        sa.Column('nonce_hex', sa.String(length=64), nullable=False),
        sa.Column('ledger_tx_id', sa.String(length=128), nullable=False),
        sa.Column('tsa_token_hash', sa.String(length=64), server_default='', nullable=False),
        sa.Column('status', sa.String(length=32), server_default='ACTIVE', nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['case_id'], ['cases.case_id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_documents_case_id'), 'documents', ['case_id'], unique=False)
    op.create_index(op.f('ix_documents_content_hash'), 'documents', ['content_hash'], unique=False)
    op.create_index(op.f('ix_documents_blob_hash'), 'documents', ['blob_hash'], unique=False)

    # chunks
    op.create_table(
        'chunks',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('doc_id', sa.String(length=64), nullable=False),
        sa.Column('chunk_index', sa.Integer(), nullable=False),
        sa.Column('chunk_hash', sa.String(length=64), nullable=False),
        sa.Column('chunk_text', sa.Text(), nullable=False),
        sa.Column('page_number', sa.Integer(), server_default='1', nullable=False),
        sa.Column('qdrant_point_id', sa.String(length=64), server_default='', nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['doc_id'], ['documents.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_chunks_doc_id'), 'chunks', ['doc_id'], unique=False)

    # audit_logs
    op.create_table(
        'audit_logs',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('event_id', sa.String(length=64), nullable=False),
        sa.Column('actor_id', sa.String(length=64), nullable=False),
        sa.Column('actor_role', sa.String(length=32), nullable=False),
        sa.Column('action', sa.String(length=32), nullable=False),
        sa.Column('case_id', sa.String(length=64), server_default='', nullable=False),
        sa.Column('outcome', sa.String(length=16), nullable=False),
        sa.Column('reason', sa.String(length=256), server_default='', nullable=False),
        sa.Column('raw_query_encrypted', sa.Text(), server_default='', nullable=False),
        sa.Column('ledger_tx_id', sa.String(length=128), server_default='', nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_audit_logs_event_id'), 'audit_logs', ['event_id'], unique=True)
    op.create_index(op.f('ix_audit_logs_actor_id'), 'audit_logs', ['actor_id'], unique=False)
    op.create_index(op.f('ix_audit_logs_action'), 'audit_logs', ['action'], unique=False)
    op.create_index(op.f('ix_audit_logs_case_id'), 'audit_logs', ['case_id'], unique=False)

def downgrade() -> None:
    op.drop_table('audit_logs')
    op.drop_table('chunks')
    op.drop_table('documents')
    op.drop_table('assignments')
    op.drop_table('cases')
    op.drop_table('users')

