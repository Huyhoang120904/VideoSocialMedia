"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { userService, UserUpdateRequest, UserResponse } from "@/services/api";
import { toast } from "sonner";

interface EditUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserResponse | null;
  onUserUpdated: () => void;
}

export default function EditUserModal({
  open,
  onOpenChange,
  user,
  onUserUpdated,
}: EditUserModalProps) {
  const [formData, setFormData] = useState<UserUpdateRequest>({
    username: "",
    mail: "",
    phoneNumber: "",
    password: "",
    enable: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        mail: user.mail,
        phoneNumber: user.phoneNumber || "",
        password: "",
        enable: user.enable !== undefined ? user.enable : true,
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username || !formData.mail) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!user) {
      toast.error("No user selected");
      return;
    }

    try {
      setLoading(true);
      // Remove password from request if it's empty
      const updateData = { ...formData };
      if (!updateData.password) {
        delete updateData.password;
      }

      const response = await userService.updateUserById(user.id, updateData);
      if (response.code === 1000) {
        toast.success("User updated successfully");
        onOpenChange(false);
        onUserUpdated();
      } else {
        toast.error(response.message || "Failed to update user");
      }
    } catch (error: unknown) {
      console.error("Failed to update user:", error);
      const errorObj = error as { response?: { data?: { message?: string } } };
      toast.error(errorObj.response?.data?.message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof UserUpdateRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user information. Leave password empty to keep current
            password.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username *
              </Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                className="col-span-3"
                placeholder="Enter username"
                disabled={loading}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.mail}
                onChange={(e) => handleInputChange("mail", e.target.value)}
                className="col-span-3"
                placeholder="Enter email"
                disabled={loading}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                value={formData.phoneNumber}
                onChange={(e) =>
                  handleInputChange("phoneNumber", e.target.value)
                }
                className="col-span-3"
                placeholder="Enter phone number"
                disabled={loading}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                New Password
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="col-span-3"
                placeholder="Enter new password (leave empty to keep current)"
                disabled={loading}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="enable" className="text-right">
                Account Status
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Switch
                  id="enable"
                  checked={formData.enable}
                  onCheckedChange={(checked) => {
                    setFormData((prev) => ({ ...prev, enable: checked }));
                  }}
                  disabled={loading}
                />
                <span className="text-sm text-muted-foreground">
                  {formData.enable ? "Active" : "Disabled"}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
