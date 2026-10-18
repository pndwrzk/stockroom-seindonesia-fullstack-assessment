"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  USER_ROLE_IDS,
  userRoles,
} from "@/features/auth/constants/user-roles";
import { getStoreService } from "@/features/stores/services/get-store.service";
import { getStoresService } from "@/features/stores/services/get-stores.service";
import type { UserFormValues } from "@/features/users/schemas/user-mutation.schema";
import { userFormSchema } from "@/features/users/schemas/user-mutation.schema";
import type { UserRecord } from "@/features/users/schemas/users.schema";

type UserFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserRecord | null;
  actorRole: number;
  actorStoreId: string | null;
  isSaving: boolean;
  onSubmit: (values: UserFormValues) => Promise<boolean>;
};

type StoreOption = {
  id: string;
  name: string;
  code: string;
};

const editableRoles: Record<number, number[]> = {
  [USER_ROLE_IDS.OWNER]: [USER_ROLE_IDS.MANAGER, USER_ROLE_IDS.STAFF],
  [USER_ROLE_IDS.MANAGER]: [USER_ROLE_IDS.STAFF],
  [USER_ROLE_IDS.STAFF]: [],
};

export function UserFormDialog({
  open,
  onOpenChange,
  user,
  actorRole,
  actorStoreId,
  isSaving,
  onSubmit,
}: UserFormDialogProps) {
  const [stores, setStores] = useState<StoreOption[]>([]);
  const [storeError, setStoreError] = useState<string | null>(null);
  const [isLoadingStores, setIsLoadingStores] = useState(true);
  const isOwner = actorRole === USER_ROLE_IDS.OWNER;
  const allowedRoles = editableRoles[actorRole] ?? [];
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      nik: "",
      username: "",
      password: "",
      name: "",
      storeId: "",
    },
  });
  const { reset } = form;

  useEffect(() => {
    if (!open) {
      return;
    }

    reset({
      nik: user?.nik ?? "",
      username: user?.username ?? "",
      password: "",
      name: user?.name ?? "",
      ...(user ? { role: user.role } : {}),
      storeId: isOwner ? user?.storeId ?? "" : actorStoreId ?? "",
    });
  }, [actorStoreId, isOwner, open, reset, user]);

  useEffect(() => {
    if (!open) {
      return;
    }

    let isCurrent = true;

    const storeRequest = isOwner
      ? getStoresService({ page: 1, limit: 100 }).then((response) => response.data)
      : actorStoreId
        ? getStoreService(actorStoreId).then((store) => [store])
        : Promise.reject(new Error("Your account is not assigned to a store."));

    void storeRequest
      .then((availableStores) => {
        if (isCurrent) {
          setStores(availableStores);
          setStoreError(null);
          setIsLoadingStores(false);
        }
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          setStoreError(
            error instanceof Error ? error.message : "Unable to retrieve stores."
          );
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoadingStores(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [actorStoreId, isOwner, open]);

  const submit = form.handleSubmit(async (values) => {
    if (!user && !values.password) {
      form.setError("password", { message: "Password is required." });
      return;
    }

    if (!allowedRoles.includes(values.role) && values.role !== user?.role) {
      form.setError("role", { message: "You cannot assign this role." });
      return;
    }

    if (await onSubmit(values)) {
      onOpenChange(false);
    }
  });

  const roleOptions = Array.from(
    new Set([...allowedRoles, ...(user ? [user.role] : [])])
  ).sort((first, second) => first - second);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{user ? "Update user" : "Add user"}</DialogTitle>
        </DialogHeader>

        <form className="space-y-3" onSubmit={submit}>
          <FormField label="NIK" htmlFor="user-nik" error={form.formState.errors.nik?.message}>
            <Input id="user-nik" autoComplete="off" required {...form.register("nik")} />
          </FormField>
          <FormField label="Name" htmlFor="user-name" error={form.formState.errors.name?.message}>
            <Input id="user-name" autoComplete="name" required {...form.register("name")} />
          </FormField>
          <FormField label="Username" htmlFor="user-username" error={form.formState.errors.username?.message}>
            <Input id="user-username" autoComplete="username" required {...form.register("username")} />
          </FormField>
          <FormField
            label={user ? "Password (leave blank to keep current)" : "Password"}
            htmlFor="user-password"
            error={form.formState.errors.password?.message}
          >
            <Input
              id="user-password"
              type="password"
              autoComplete="new-password"
              required={!user}
              {...form.register("password")}
            />
          </FormField>
          <FormField label="Role" htmlFor="user-role" error={form.formState.errors.role?.message}>
            <Controller
              control={form.control}
              name="role"
              render={({ field }) => (
                <Select
                  value={field.value ? String(field.value) : null}
                  onValueChange={(value) => field.onChange(Number(value))}
                >
                  <SelectTrigger id="user-role" aria-required="true">
                    <SelectValue placeholder="Select a role">
                      {(value) => {
                        const role = Number(value);
                        return role === USER_ROLE_IDS.MANAGER
                          ? userRoles[USER_ROLE_IDS.MANAGER]
                          : role === USER_ROLE_IDS.STAFF
                            ? userRoles[USER_ROLE_IDS.STAFF]
                            : "Select a role";
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((role) => (
                      <SelectItem
                        key={role}
                        value={String(role)}
                        disabled={!allowedRoles.includes(role)}
                      >
                        {role === USER_ROLE_IDS.OWNER
                          ? userRoles[USER_ROLE_IDS.OWNER]
                          : role === USER_ROLE_IDS.MANAGER
                            ? userRoles[USER_ROLE_IDS.MANAGER]
                            : userRoles[USER_ROLE_IDS.STAFF]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
          <FormField label="Store" htmlFor="user-store" error={undefined}>
            {isOwner ? (
              <Controller
                control={form.control}
                name="storeId"
                render={({ field }) => (
                  <Select
                    value={field.value || null}
                    onValueChange={(value) => field.onChange(String(value))}
                  >
                    <SelectTrigger
                      id="user-store"
                      aria-required="true"
                      disabled={isLoadingStores}
                    >
                      <SelectValue
                        placeholder={isLoadingStores ? "Loading stores..." : "Select a store"}
                      >
                        {(value) =>
                          stores.find((store) => store.id === value)?.name ??
                          (isLoadingStores ? "Loading stores..." : "Select a store")
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {stores.map((store) => (
                        <SelectItem key={store.id} value={store.id}>
                          {store.name} ({store.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            ) : (
              <Input
                id="user-store"
                value={
                  stores[0]
                    ? `${stores[0].name} (${stores[0].code})`
                    : isLoadingStores
                      ? "Loading store..."
                      : ""
                }
                readOnly
                disabled={isLoadingStores}
                aria-required="true"
              />
            )}
            {form.formState.errors.storeId?.message && (
              <p role="alert" className="text-xs text-destructive">
                {form.formState.errors.storeId.message}
              </p>
            )}
            {storeError && <p role="alert" className="text-xs text-destructive">{storeError}</p>}
          </FormField>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isSaving}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving || form.formState.isSubmitting}>
              {isSaving ? "Saving..." : user ? "Save changes" : "Create user"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FormField({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  error: string | undefined;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
