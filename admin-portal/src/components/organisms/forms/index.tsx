import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { BaseComponentProps, FormFieldProps } from "@/types";

// ============================================================================
// FORM VALIDATION SCHEMAS
// ============================================================================

export const createUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  mail: z.string().email("Please enter a valid email address"),
  phoneNumber: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const updateUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  mail: z.string().email("Please enter a valid email address"),
  phoneNumber: z.string().optional(),
  password: z.string().optional(),
  enable: z.boolean().optional(),
});

export const uploadVideoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  file: z.instanceof(File, "Please select a video file"),
});

// ============================================================================
// FORM FIELD COMPONENT
// ============================================================================

interface FormFieldComponentProps extends FormFieldProps {
  children: React.ReactNode;
}

export function FormField({
  label,
  required = false,
  error,
  helpText,
  children,
}: FormFieldComponentProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
      {helpText && !error && (
        <p className="text-sm text-muted-foreground">{helpText}</p>
      )}
    </div>
  );
}

// ============================================================================
// FORM COMPONENT
// ============================================================================

interface FormProps extends BaseComponentProps {
  onSubmit: (data: any) => void | Promise<void>;
  loading?: boolean;
  initialValues?: Record<string, any>;
  schema?: z.ZodSchema<any>;
  children: React.ReactNode;
}

export function Form({
  className,
  onSubmit,
  loading = false,
  initialValues,
  schema,
  children,
}: FormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    getValues,
  } = useForm({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: initialValues,
  });

  const handleFormSubmit = async (data: any) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className={cn("space-y-4", className)}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            register,
            errors,
            loading,
            watch,
            setValue,
            getValues,
            reset,
          });
        }
        return child;
      })}
    </form>
  );
}

// ============================================================================
// SPECIFIC FORM COMPONENTS
// ============================================================================

interface CreateUserFormProps extends BaseComponentProps {
  onSubmit: (data: z.infer<typeof createUserSchema>) => void | Promise<void>;
  loading?: boolean;
}

export function CreateUserForm({
  className,
  onSubmit,
  loading,
}: CreateUserFormProps) {
  return (
    <Form
      className={className}
      onSubmit={onSubmit}
      loading={loading}
      schema={createUserSchema}
    >
      <FormField label="Username" required error={undefined}>
        <Input
          placeholder="Enter username"
          disabled={loading}
          {...register("username")}
        />
      </FormField>

      <FormField label="Email" required error={undefined}>
        <Input
          type="email"
          placeholder="Enter email address"
          disabled={loading}
          {...register("mail")}
        />
      </FormField>

      <FormField label="Phone Number" error={undefined}>
        <Input
          placeholder="Enter phone number"
          disabled={loading}
          {...register("phoneNumber")}
        />
      </FormField>

      <FormField label="Password" required error={undefined}>
        <Input
          type="password"
          placeholder="Enter password"
          disabled={loading}
          {...register("password")}
        />
      </FormField>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create User"}
        </Button>
      </div>
    </Form>
  );
}

interface UpdateUserFormProps extends BaseComponentProps {
  onSubmit: (data: z.infer<typeof updateUserSchema>) => void | Promise<void>;
  loading?: boolean;
  initialValues?: Partial<z.infer<typeof updateUserSchema>>;
}

export function UpdateUserForm({
  className,
  onSubmit,
  loading,
  initialValues,
}: UpdateUserFormProps) {
  return (
    <Form
      className={className}
      onSubmit={onSubmit}
      loading={loading}
      schema={updateUserSchema}
      initialValues={initialValues}
    >
      <FormField label="Username" required error={undefined}>
        <Input
          placeholder="Enter username"
          disabled={loading}
          {...register("username")}
        />
      </FormField>

      <FormField label="Email" required error={undefined}>
        <Input
          type="email"
          placeholder="Enter email address"
          disabled={loading}
          {...register("mail")}
        />
      </FormField>

      <FormField label="Phone Number" error={undefined}>
        <Input
          placeholder="Enter phone number"
          disabled={loading}
          {...register("phoneNumber")}
        />
      </FormField>

      <FormField label="New Password" error={undefined}>
        <Input
          type="password"
          placeholder="Leave blank to keep current password"
          disabled={loading}
          {...register("password")}
        />
      </FormField>

      <FormField label="Account Status" error={undefined}>
        <div className="flex items-center space-x-2">
          <Switch disabled={loading} {...register("enable")} />
          <Label>Enable account</Label>
        </div>
      </FormField>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update User"}
        </Button>
      </div>
    </Form>
  );
}

interface UploadVideoFormProps extends BaseComponentProps {
  onSubmit: (data: z.infer<typeof uploadVideoSchema>) => void | Promise<void>;
  loading?: boolean;
}

export function UploadVideoForm({
  className,
  onSubmit,
  loading,
}: UploadVideoFormProps) {
  return (
    <Form
      className={className}
      onSubmit={onSubmit}
      loading={loading}
      schema={uploadVideoSchema}
    >
      <FormField label="Video File" required error={undefined}>
        <Input
          type="file"
          accept="video/*"
          disabled={loading}
          {...register("file")}
        />
      </FormField>

      <FormField label="Title" required error={undefined}>
        <Input
          placeholder="Enter video title"
          disabled={loading}
          {...register("title")}
        />
      </FormField>

      <FormField label="Description" error={undefined}>
        <Textarea
          placeholder="Enter video description"
          disabled={loading}
          rows={3}
          {...register("description")}
        />
      </FormField>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Uploading..." : "Upload Video"}
        </Button>
      </div>
    </Form>
  );
}
