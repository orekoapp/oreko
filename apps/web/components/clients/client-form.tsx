'use client';

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { createClientSchema, type CreateClientInput } from '@/lib/validations/client';
import { cn } from '@/lib/utils';

interface ClientFormProps {
  defaultValues?: Partial<CreateClientInput>;
  onSubmit: (data: CreateClientInput) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

export function ClientForm({
  defaultValues,
  onSubmit,
  isLoading = false,
  submitLabel = 'Save Client',
}: ClientFormProps) {
  const form = useForm<CreateClientInput>({
    resolver: zodResolver(createClientSchema),
    defaultValues: {
      type: 'individual',
      name: '',
      email: '',
      phone: '',
      website: '',
      company: '',
      taxId: '',
      notes: '',
      tags: [],
      address: {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
      },
      contacts: [],
      ...defaultValues,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'contacts',
  });

  const clientType = form.watch('type');

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data);
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="type">Client Type</Label>
              <Select
                value={clientType}
                onValueChange={(value) => form.setValue('type', value as 'individual' | 'company')}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.type && (
                <p className="text-sm text-destructive">{form.formState.errors.type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">{clientType === 'company' ? 'Contact Name' : 'Full Name'} *</Label>
              <Input
                id="name"
                {...form.register('name')}
                placeholder={clientType === 'company' ? 'Primary contact name' : 'John Doe'}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
          </div>

          {clientType === 'company' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company">Company Name</Label>
                <Input
                  id="company"
                  {...form.register('company')}
                  placeholder="Acme Inc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxId">Tax ID / VAT</Label>
                <Input
                  id="taxId"
                  {...form.register('taxId')}
                  placeholder="123-45-6789"
                />
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...form.register('email')}
                placeholder="client@example.com"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                {...form.register('phone')}
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="text"
              {...form.register('website')}
              placeholder="example.com"
            />
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader>
          <CardTitle>Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {form.formState.errors.address && typeof form.formState.errors.address.message === 'string' && (
            <p className="text-sm text-destructive">{form.formState.errors.address.message}</p>
          )}
          <div className="space-y-2">
            <Label htmlFor="address.street">Street Address</Label>
            <Input
              id="address.street"
              {...form.register('address.street')}
              placeholder="123 Main St"
            />
            {form.formState.errors.address?.street && (
              <p className="text-sm text-destructive">{form.formState.errors.address.street.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="address.city">City</Label>
              <Input
                id="address.city"
                {...form.register('address.city')}
                placeholder="New York"
              />
              {form.formState.errors.address?.city && (
                <p className="text-sm text-destructive">{form.formState.errors.address.city.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="address.state">State / Province</Label>
              <Input
                id="address.state"
                {...form.register('address.state')}
                placeholder="NY"
              />
              {form.formState.errors.address?.state && (
                <p className="text-sm text-destructive">{form.formState.errors.address.state.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="address.postalCode">Postal Code</Label>
              <Input
                id="address.postalCode"
                {...form.register('address.postalCode')}
                placeholder="10001"
              />
              {form.formState.errors.address?.postalCode && (
                <p className="text-sm text-destructive">{form.formState.errors.address.postalCode.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="address.country">Country</Label>
              <Input
                id="address.country"
                {...form.register('address.country')}
                placeholder="United States"
              />
              {form.formState.errors.address?.country && (
                <p className="text-sm text-destructive">{form.formState.errors.address.country.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Contacts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Additional Contacts</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ name: '', email: '', phone: '', role: '', isPrimary: false })}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Contact
          </Button>
        </CardHeader>
        <CardContent>
          {fields.length === 0 ? (
            <p className="text-sm text-muted-foreground">No additional contacts added.</p>
          ) : (
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="relative rounded-lg border p-4"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 h-8 w-8"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>

                  <div className="grid gap-4 pr-8 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        {...form.register(`contacts.${index}.name`)}
                        placeholder="Contact name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        {...form.register(`contacts.${index}.email`)}
                        placeholder="contact@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input
                        type="tel"
                        {...form.register(`contacts.${index}.phone`)}
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Input
                        {...form.register(`contacts.${index}.role`)}
                        placeholder="e.g., Project Manager"
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex items-center space-x-2">
                    <Checkbox
                      id={`contacts.${index}.isPrimary`}
                      checked={form.watch(`contacts.${index}.isPrimary`)}
                      onCheckedChange={(checked) =>
                        form.setValue(`contacts.${index}.isPrimary`, checked === true)
                      }
                    />
                    <Label htmlFor={`contacts.${index}.isPrimary`} className="text-sm font-normal">
                      Primary contact
                    </Label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            {...form.register('notes')}
            placeholder="Internal notes about this client..."
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
