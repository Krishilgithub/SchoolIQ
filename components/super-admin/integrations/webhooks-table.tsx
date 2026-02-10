"use client";

import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Webhook,
  Plus,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export interface WebhookConfig {
  id: string;
  url: string;
  events: string[];
  is_active: boolean;
  secret_key: string;
  created_at: string;
}

interface WebhooksTableProps {
  webhooks: WebhookConfig[];
  onToggle: (webhookId: string, active: boolean) => void;
  onEdit: (webhookId: string) => void;
  onDelete: (webhookId: string) => void;
  onAdd: () => void;
}

export function WebhooksTable({
  webhooks,
  onToggle,
  onEdit,
  onDelete,
  onAdd,
}: WebhooksTableProps) {
  const handleToggle = async (webhookId: string, active: boolean) => {
    try {
      await onToggle(webhookId, active);
      toast.success(active ? "Webhook enabled" : "Webhook disabled");
    } catch (error) {
      toast.error("Failed to update webhook");
    }
  };

  const columns: ColumnDef<WebhookConfig>[] = [
    {
      accessorKey: "url",
      header: "Webhook URL",
      cell: ({ row }) => (
        <div className="max-w-75">
          <div className="flex items-center gap-2">
            <Webhook className="h-4 w-4 text-muted-foreground" />
            <p className="font-mono text-sm truncate">{row.getValue("url")}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "events",
      header: "Events",
      cell: ({ row }) => {
        const events = row.getValue("events") as string[];
        return (
          <div className="flex flex-wrap gap-1">
            {events.slice(0, 2).map((event) => (
              <Badge
                key={event}
                variant="outline"
                className="bg-blue-100 text-blue-800"
              >
                {event}
              </Badge>
            ))}
            {events.length > 2 && (
              <Badge variant="outline" className="bg-gray-100 text-gray-800">
                +{events.length - 2} more
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => {
        const active = row.getValue("is_active") as boolean;
        return (
          <Badge
            variant="outline"
            className={
              active
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }
          >
            {active ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => (
        <div className="text-sm">
          {new Date(row.getValue("created_at")).toLocaleDateString()}
        </div>
      ),
    },
    {
      id: "toggle",
      header: "Enable",
      cell: ({ row }) => {
        const webhook = row.original;
        return (
          <Switch
            checked={webhook.is_active}
            onCheckedChange={(checked: boolean) =>
              handleToggle(webhook.id, checked)
            }
          />
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const webhook = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(webhook.id)}>
                Edit Webhook
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(webhook.id)}
                className="text-red-600"
              >
                Delete Webhook
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: webhooks,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Webhooks</h3>
        <Button onClick={onAdd} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Webhook
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No webhooks configured.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
