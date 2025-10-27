import React, { useState, useMemo, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Search,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserResponse, TableColumn, BaseComponentProps } from "@/types";
import {
  LoadingSpinner,
  EmptyState,
  StatusBadge,
} from "@/components/optimized";
import { useDebounce } from "@/components/optimized";

interface UserTableProps extends BaseComponentProps {
  users: UserResponse[];
  loading?: boolean;
  onEdit?: (user: UserResponse) => void;
  onDelete?: (user: UserResponse) => void;
  onView?: (user: UserResponse) => void;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
}

const UserTableRow = memo<{
  user: UserResponse;
  columns: TableColumn<UserResponse>[];
  onEdit?: (user: UserResponse) => void;
  onDelete?: (user: UserResponse) => void;
  onView?: (user: UserResponse) => void;
}>(({ user, columns, onEdit, onDelete, onView }) => {
  const handleEdit = useCallback(() => {
    onEdit?.(user);
  }, [onEdit, user]);

  const handleDelete = useCallback(() => {
    onDelete?.(user);
  }, [onDelete, user]);

  const handleView = useCallback(() => {
    onView?.(user);
  }, [onView, user]);

  return (
    <TableRow>
      {columns.map((column) => (
        <TableCell key={String(column.key)}>
          {column.render
            ? column.render(user[column.key as keyof UserResponse], user)
            : String(user[column.key as keyof UserResponse] || "—")}
        </TableCell>
      ))}
    </TableRow>
  );
});

UserTableRow.displayName = "UserTableRow";

const UserTableHeader = memo<{
  columns: TableColumn<UserResponse>[];
  sortField: keyof UserResponse;
  sortOrder: "asc" | "desc";
  onSort: (field: keyof UserResponse) => void;
}>(({ columns, sortField, sortOrder, onSort }) => {
  return (
    <TableHeader>
      <TableRow>
        {columns.map((column) => (
          <TableHead
            key={String(column.key)}
            className={cn(
              column.sortable && "cursor-pointer hover:bg-muted/50"
            )}
            onClick={() =>
              column.sortable && onSort(column.key as keyof UserResponse)
            }
          >
            <div className="flex items-center space-x-1">
              <span>{column.title}</span>
              {column.sortable && sortField === column.key && (
                <span className="text-xs">
                  {sortOrder === "asc" ? "↑" : "↓"}
                </span>
              )}
            </div>
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
});

UserTableHeader.displayName = "UserTableHeader";

const UserTableSearch = memo<{
  searchTerm: string;
  onSearchChange: (value: string) => void;
}>(({ searchTerm, onSearchChange }) => {
  return (
    <div className="flex items-center space-x-2">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>
    </div>
  );
});

UserTableSearch.displayName = "UserTableSearch";

const UserTablePagination = memo<{
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
}>(({ pagination }) => {
  const handlePrevious = useCallback(() => {
    pagination.onChange(pagination.current - 1, pagination.pageSize);
  }, [pagination]);

  const handleNext = useCallback(() => {
    pagination.onChange(pagination.current + 1, pagination.pageSize);
  }, [pagination]);

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        Showing {(pagination.current - 1) * pagination.pageSize + 1} to{" "}
        {Math.min(pagination.current * pagination.pageSize, pagination.total)}{" "}
        of {pagination.total} results
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={pagination.current === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={
            pagination.current * pagination.pageSize >= pagination.total
          }
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
});

UserTablePagination.displayName = "UserTablePagination";

export const UserTable = memo<UserTableProps>(
  ({
    className,
    users,
    loading = false,
    onEdit,
    onDelete,
    onView,
    pagination,
  }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [sortField, setSortField] = useState<keyof UserResponse>("username");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    // Debounce search term to avoid excessive filtering
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const columns: TableColumn<UserResponse>[] = useMemo(
      () => [
        {
          key: "username",
          title: "Username",
          sortable: true,
          render: (value, user) => <div className="font-medium">{value}</div>,
        },
        {
          key: "mail",
          title: "Email",
          sortable: true,
          render: (value) => (
            <div className="text-sm text-muted-foreground">{value}</div>
          ),
        },
        {
          key: "phoneNumber",
          title: "Phone",
          render: (value) => <div className="text-sm">{value || "—"}</div>,
        },
        {
          key: "roles",
          title: "Role",
          render: (_, user) => (
            <div className="flex gap-1">
              {user.roles.map((role) => (
                <Badge key={role.id} variant="secondary">
                  {role.name}
                </Badge>
              ))}
            </div>
          ),
        },
        {
          key: "enable",
          title: "Status",
          render: (value) => (
            <StatusBadge status={value ? "active" : "inactive"}>
              {value ? "Active" : "Inactive"}
            </StatusBadge>
          ),
        },
        {
          key: "actions",
          title: "Actions",
          render: (_, user) => (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onView && (
                  <DropdownMenuItem onClick={() => onView(user)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </DropdownMenuItem>
                )}
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(user)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(user)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ),
        },
      ],
      [onEdit, onDelete, onView]
    );

    const filteredAndSortedUsers = useMemo(() => {
      let filtered = users.filter(
        (user) =>
          user.username
            .toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase()) ||
          user.mail.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );

      filtered.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];

        if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
        if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });

      return filtered;
    }, [users, debouncedSearchTerm, sortField, sortOrder]);

    const handleSort = useCallback(
      (field: keyof UserResponse) => {
        if (sortField === field) {
          setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
          setSortField(field);
          setSortOrder("asc");
        }
      },
      [sortField, sortOrder]
    );

    const handleSearchChange = useCallback((value: string) => {
      setSearchTerm(value);
    }, []);

    if (loading) {
      return (
        <div className={cn("space-y-4", className)}>
          <div className="h-10 bg-muted animate-pulse rounded" />
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className={cn("space-y-4", className)}>
        {/* Search */}
        <UserTableSearch
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
        />

        {/* Table */}
        {filteredAndSortedUsers.length === 0 ? (
          <EmptyState
            title="No users found"
            description="Try adjusting your search criteria or create a new user."
          />
        ) : (
          <div className="rounded-md border">
            <Table>
              <UserTableHeader
                columns={columns}
                sortField={sortField}
                sortOrder={sortOrder}
                onSort={handleSort}
              />
              <TableBody>
                {filteredAndSortedUsers.map((user) => (
                  <UserTableRow
                    key={user.id}
                    user={user}
                    columns={columns}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onView={onView}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        {pagination && <UserTablePagination pagination={pagination} />}
      </div>
    );
  }
);

UserTable.displayName = "UserTable";
