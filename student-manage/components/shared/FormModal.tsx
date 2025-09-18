"use client";

import { ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "../ui/button";

interface FormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onSubmit: (e: React.FormEvent) => void;
  children: ReactNode;
}

export default function FormModal({ open, onOpenChange, title, onSubmit, children }: FormModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          {children}
            <>
            <Button type="button" variant="outline" onClick={() => setEditingStudent(null)}>
              Cancel
            </Button>
            <Button type="submit">Update</Button>
          </>
        </form>
      </DialogContent>
    </Dialog>
  );
}
