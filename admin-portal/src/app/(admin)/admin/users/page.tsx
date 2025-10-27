"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserPlus, Users } from "lucide-react";
import { PageHeader, StatsCard } from "@/components/molecules";
import { UserTable } from "@/components/organisms/UserTable";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { useUsers, useDeleteUser } from "@/hooks/queries";
import CreateUserModal from "@/components/admin/create-user-modal";
import EditUserModal from "@/components/admin/edit-user-modal";
import { UserResponse } from "@/types";

function UsersPageContent() {
  const [currentPage, setCurrentPage] = useState(0);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const pageSize = 10;

  const {
    data: usersResponse,
    isLoading,
    error,
  } = useUsers(currentPage, pageSize);
  const deleteUserMutation = useDeleteUser();

  const users = (usersResponse as any)?.result?.content || [];
  const totalElements = (usersResponse as any)?.result?.totalElements || 0;
  const totalPages = (usersResponse as any)?.result?.totalPages || 0;

  const handleDeleteUser = async (user: UserResponse) => {
    if (
      window.confirm(`Are you sure you want to delete user "${user.username}"?`)
    ) {
      try {
        await deleteUserMutation.mutateAsync(user.id);
      } catch (error) {
        // Error handling is done in the mutation
      }
    }
  };

  const handleEditUser = (user: UserResponse) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleUserCreated = () => {
    // React Query will automatically refetch the data
  };

  const handleUserUpdated = () => {
    // React Query will automatically refetch the data
  };

  const handlePaginationChange = (page: number, newPageSize: number) => {
    setCurrentPage(page);
  };

  if (error) {
    throw error; // Let ErrorBoundary handle it
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users Management"
        description="Manage all users on the platform"
        action={
          <Button onClick={() => setCreateModalOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Total Users"
          value={totalElements}
          description="All registered users"
          icon={Users}
        />
        <StatsCard
          title="Active Users"
          value={users.filter((user: UserResponse) => user.enable).length}
          description="Currently active"
          icon={UserPlus}
        />
        <StatsCard
          title="Admin Users"
          value={
            users.filter((user: UserResponse) =>
              user.roles?.some((role: any) => role.name === "ADMIN")
            ).length
          }
          description="Users with admin privileges"
          icon={Users}
        />
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users List</CardTitle>
          <CardDescription>Manage and view all platform users</CardDescription>
        </CardHeader>
        <CardContent>
          <UserTable
            users={users}
            loading={isLoading}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
            pagination={{
              current: currentPage + 1,
              pageSize,
              total: totalElements,
              onChange: handlePaginationChange,
            }}
          />
        </CardContent>
      </Card>

      {/* Modals */}
      <CreateUserModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onUserCreated={handleUserCreated}
      />

      <EditUserModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        user={selectedUser}
        onUserUpdated={handleUserUpdated}
      />
    </div>
  );
}

export default function UsersPage() {
  return (
    <ErrorBoundary context="Users Page">
      <UsersPageContent />
    </ErrorBoundary>
  );
}
