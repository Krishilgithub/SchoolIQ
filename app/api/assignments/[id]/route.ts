/**
 * ASSIGNMENT BY ID API
 * GET /api/assignments/[id] - Get specific assignment
 * PUT /api/assignments/[id] - Update assignment
 * DELETE /api/assignments/[id] - Delete assignment
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getAssignmentById,
  updateAssignment,
  publishAssignment,
  closeAssignment,
  archiveAssignment,
  deleteAssignment,
} from '@/lib/services/assignment-management';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const assignment = await getAssignmentById(id);
    
    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(assignment);
  } catch (error: any) {
    console.error('Error fetching assignment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch assignment' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, updated_by } = body;
    
    if (!updated_by && !body.published_by && !body.closed_by && !body.archived_by) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    if (action === 'publish') {
      const assignment = await publishAssignment(
        id,
        body.published_by || updated_by,
        body.scheduled_at
      );
      return NextResponse.json(assignment);
    }
    
    if (action === 'close') {
      const assignment = await closeAssignment(id, body.closed_by || updated_by);
      return NextResponse.json(assignment);
    }
    
    if (action === 'archive') {
      const assignment = await archiveAssignment(id, body.archived_by || updated_by);
      return NextResponse.json(assignment);
    }
    
    // Standard update
    const assignment = await updateAssignment(id, body);
    return NextResponse.json(assignment);
  } catch (error: any) {
    console.error('Error updating assignment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update assignment' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const deleted_by = searchParams.get('deleted_by');
    
    if (!deleted_by) {
      return NextResponse.json(
        { error: 'deleted_by is required' },
        { status: 400 }
      );
    }
    
    await deleteAssignment(id, deleted_by);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting assignment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete assignment' },
      { status: 500 }
    );
  }
}
