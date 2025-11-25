"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Shield, Plus, Edit, Trash2 } from "lucide-react";
import { roleService, RoleResponse } from "@/services/admin/roleService";
import { toast } from "sonner";
import { PageHeader, StatsCard, EmptyState } from "@/components/molecules";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

export default function RolesPage() {
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 12;

  const fetchRoles = async (page: number = 0) => {
    try {
      setLoading(true);
      const response = await roleService.getRoles(page, pageSize);

      if (response.code === 1000 && response.result) {
        setRoles(response.result.content);
        setTotalPages(response.result.totalPages);
        setTotalElements(response.result.totalElements);
      }
    } catch (error) {
      console.error("Failed to fetch roles:", error);
      toast.error("Failed to fetch roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles(currentPage);
  }, [currentPage]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
      try {
        await roleService.deleteRole(id);
        toast.success("Role deleted successfully");
        fetchRoles(currentPage);
      } catch (error) {
        console.error("Failed to delete role:", error);
        toast.error("Failed to delete role");
      }
    }
  };

  return (
    <ErrorBoundary context="Roles Page">
      <div className="space-y-6">
        <PageHeader
          title="Roles Management"
          description="Manage user roles and permissions"
          action={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Role
            </Button>
          }
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            title="Total Roles"
            value={totalElements}
            description="All system roles"
            icon={Shield}
          />
          <StatsCard
            title="Active Roles"
            value={roles.length}
            description="Currently in use"
            icon={Shield}
          />
          <StatsCard
            title="Total Permissions"
            value={roles.reduce((acc, role) => acc + (role.permissions?.length || 0), 0)}
            description="Across all roles"
            icon={Shield}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Roles List</CardTitle>
            <CardDescription>Manage system roles and their permissions</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Loading roles...</div>
              </div>
            ) : roles.length === 0 ? (
              <EmptyState
                icon={Shield}
                title="No roles found"
                description="Create your first role to get started"
              />
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell className="font-medium">
                          {role.roleName}
                        </TableCell>
                        <TableCell>{role.description}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {role.permissions?.slice(0, 3).map((perm) => (
                              <Badge key={perm.id} variant="outline">
                                {perm.permission}
                              </Badge>
                            ))}
                            {role.permissions && role.permissions.length > 3 && (
                              <Badge variant="outline">
                                +{role.permissions.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(role.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {totalPages > 1 && (
                  <div className="mt-4">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                            className={
                              currentPage === 0
                                ? "pointer-events-none opacity-50"
                                : "cursor-pointer"
                            }
                          />
                        </PaginationItem>

                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const page = i;
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => setCurrentPage(page)}
                                isActive={currentPage === page}
                                className="cursor-pointer"
                              >
                                {page + 1}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}

                        <PaginationItem>
                          <PaginationNext
                            onClick={() =>
                              setCurrentPage(Math.min(totalPages - 1, currentPage + 1))
                            }
                            className={
                              currentPage === totalPages - 1
                                ? "pointer-events-none opacity-50"
                                : "cursor-pointer"
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
}

