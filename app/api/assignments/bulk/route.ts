/**
 * ASSIGNMENTS BULK OPERATIONS API
 * POST /api/assignments/bulk - Bulk duplicate, archive, export
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  duplicateAssignment,
  archiveAssignment,
} from '@/lib/services/assignment-management';
import { bulkGrade } from '@/lib/services/assignment-grading';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { action, assignment_ids } = body;
    
    if (!action) {
      return NextResponse.json(
        { error: 'action is required' },
        { status: 400 }
      );
    }
    
    if (action === 'duplicate') {
      const { assignment_id, created_by } = body;
      
      if (!assignment_id || !created_by) {
        return NextResponse.json(
          { error: 'assignment_id and created_by are required' },
          { status: 400 }
        );
      }
      
      const duplicate = await duplicateAssignment(assignment_id, created_by);
      return NextResponse.json(duplicate, { status: 201 });
    }
    
    if (action === 'archive_multiple') {
      if (!assignment_ids || !Array.isArray(assignment_ids)) {
        return NextResponse.json(
          { error: 'assignment_ids array is required' },
          { status: 400 }
        );
      }
      
      const { archived_by } = body;
      if (!archived_by) {
        return NextResponse.json(
          { error: 'archived_by is required' },
          { status: 400 }
        );
      }
      
      const results = await Promise.all(
        assignment_ids.map(id => archiveAssignment(id, archived_by))
      );
      
      return NextResponse.json({ archived: results.length });
    }
    
    if (action === 'bulk_grade') {
      const { grades } = body;
      
      if (!grades || !Array.isArray(grades)) {
        return NextResponse.json(
          { error: 'grades array is required' },
          { status: 400 }
        );
      }
      
      const result = await bulkGrade(grades);
      return NextResponse.json(result);
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error in bulk operation:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to perform bulk operation' },
      { status: 500 }
    );
  }
}
