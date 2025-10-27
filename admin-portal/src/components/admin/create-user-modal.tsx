"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreateUserForm } from "@/components/organisms/forms";
import { useCreateUser } from "@/hooks/queries";
import { ModalProps } from "@/types";

export default function CreateUserModal({
  open,
  onOpenChange,
  onUserCreated,
}: ModalProps & { onUserCreated: () => void }) {
  const createUserMutation = useCreateUser();

  const handleSubmit = async (data: any) => {
    try {
      await createUserMutation.mutateAsync(data);
      onUserCreated();
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Add a new user to the platform. Fill in the required information
            below.
          </DialogDescription>
        </DialogHeader>
        <CreateUserForm
          onSubmit={handleSubmit}
          loading={createUserMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
