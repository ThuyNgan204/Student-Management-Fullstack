"use client";

import { ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "../ui/button";

interface FormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onSubmit: (e: React.FormEvent) => void;
  children: ReactNode;
  onCancel?: () => void;
  submitText?: string;
}

export default function FormModal({
  open,
  onOpenChange,
  title,
  onSubmit,
  children,
  onCancel,
  submitText = "Submit",
}: FormModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          {children}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel ?? (() => onOpenChange(false))}>
              Cancel
            </Button>
            <Button type="submit">{submitText}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
