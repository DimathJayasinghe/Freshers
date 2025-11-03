import React from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-950 text-white shadow-2xl">
          <div className="p-4 border-b border-zinc-800">
            <h3 className="text-base font-semibold">{title}</h3>
          </div>
          {description && (
            <div className="p-4 text-sm text-zinc-300 whitespace-pre-wrap break-words">
              {description}
            </div>
          )}
          <div className="p-4 flex items-center justify-end gap-2 border-t border-zinc-800">
            <button
              type="button"
              className="px-3 py-1.5 rounded-md border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-sm"
              onClick={onCancel}
              disabled={loading}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              className="px-3 py-1.5 rounded-md border border-red-700 bg-red-600 hover:bg-red-500 text-sm disabled:opacity-60"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? 'Working…' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
