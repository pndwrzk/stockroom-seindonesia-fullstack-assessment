"use client";

import { createElement, useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type UseConfirmDialogOptions<T> = {
  title: string;
  description: string | ((target: T) => string);
  confirmLabel: string;
  onConfirm: (target: T) => Promise<boolean>;
};

export function useConfirmDialog<T>({
  title,
  description,
  confirmLabel,
  onConfirm,
}: UseConfirmDialogOptions<T>) {
  const [target, setTarget] = useState<T | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const requestConfirmation = (item: T) => setTarget(item);
  const handleOpenChange = (open: boolean) => {
    if (!open && !isConfirming) {
      setTarget(null);
    }
  };
  const handleConfirm = async () => {
    if (!target || isConfirming) {
      return;
    }

    setIsConfirming(true);
    try {
      if (await onConfirm(target)) {
        setTarget(null);
      }
    } finally {
      setIsConfirming(false);
    }
  };

  return {
    requestConfirmation,
    dialog: createElement(ConfirmDialog, {
      open: target !== null,
      onOpenChange: handleOpenChange,
      title,
      description:
        target && typeof description === "function"
          ? description(target)
          : typeof description === "string"
            ? description
            : "",
      confirmLabel,
      isLoading: isConfirming,
      onConfirm: () => void handleConfirm(),
    }),
  };
}
