'use client';

import { useEffect, useState } from 'react';
import { contentBlockService } from '@/lib/services/content-block';
import { ContentBlockResponse } from '@/lib/api/schemas';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ContentBlockEditorProps {
  stageId: string;
}

export default function ContentBlockEditor({
  stageId,
}: ContentBlockEditorProps) {
  const [contentBlocks, setContentBlocks] = useState<ContentBlockResponse[]>(
    [],
  );

  useEffect(() => {
    async function fetchContentBlocks() {
      try {
        const data = await contentBlockService.listContentBlocks(stageId);
        setContentBlocks(data);
      } catch (error) {
        console.error('Failed to fetch content blocks:', error);
      }
    }
    fetchContentBlocks();
  }, [stageId]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Content Blocks</h3>
        <Button>Add Content Block</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contentBlocks.map((block) => (
            <TableRow key={block.id}>
              <TableCell>{block.type}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" className="mr-2">
                  Edit
                </Button>
                <Button variant="destructive" size="sm">
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}