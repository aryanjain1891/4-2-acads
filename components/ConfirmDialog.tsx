"use client";

import Modal from "./Modal";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export default function ConfirmDialog({ open, onClose, onConfirm, title, message }: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="mb-4 text-sm text-muted">{message}</p>
      <div className="flex gap-2 justify-end">
        <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-surface-hover">Cancel</button>
        <button onClick={() => { onConfirm(); onClose(); }} className="rounded-lg bg-danger px-4 py-2 text-sm font-medium text-white hover:opacity-90">Delete</button>
      </div>
    </Modal>
  );
}
