'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { changePassword } from '@/lib/auth/actions';

// Base password validation
const passwordValidation = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  );

// Schema for changing password (requires current password)
const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordValidation,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

// Schema for setting password (no current password required)
const setPasswordSchema = z
  .object({
    currentPassword: z.string().optional(),
    newPassword: passwordValidation,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type PasswordFormData = z.infer<typeof changePasswordSchema>;

interface ChangePasswordFormProps {
  hasExistingPassword: boolean;
}

export function ChangePasswordForm({ hasExistingPassword }: ChangePasswordFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(hasExistingPassword ? changePasswordSchema : setPasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(data: PasswordFormData) {
    setIsLoading(true);

    try {
      const result = await changePassword({
        currentPassword: hasExistingPassword ? data.currentPassword : undefined,
        newPassword: data.newPassword,
      });

      if (!result.success) {
        toast.error(result.error || 'Failed to update password');
        return;
      }

      toast.success(hasExistingPassword ? 'Password changed successfully' : 'Password set successfully');
      reset();
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
      {hasExistingPassword && (
        <div className="space-y-2">
          <Label htmlFor="currentPassword">Current password</Label>
          <Input
            id="currentPassword"
            type="password"
            autoComplete="current-password"
            disabled={isLoading}
            {...register('currentPassword')}
          />
          {errors.currentPassword && (
            <p className="text-sm text-destructive">
              {errors.currentPassword.message}
            </p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="newPassword">
          {hasExistingPassword ? 'New password' : 'Password'}
        </Label>
        <Input
          id="newPassword"
          type="password"
          autoComplete="new-password"
          disabled={isLoading}
          {...register('newPassword')}
        />
        {errors.newPassword && (
          <p className="text-sm text-destructive">
            {errors.newPassword.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm {hasExistingPassword ? 'new ' : ''}password</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          disabled={isLoading}
          {...register('confirmPassword')}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-destructive">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
        <p className="font-medium">Password requirements:</p>
        <ul className="mt-1 list-inside list-disc space-y-0.5">
          <li>At least 8 characters</li>
          <li>One uppercase letter</li>
          <li>One lowercase letter</li>
          <li>One number</li>
        </ul>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {hasExistingPassword ? 'Change password' : 'Set password'}
      </Button>
    </form>
  );
}
