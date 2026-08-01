import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to perform this action? This action cannot be undone.',
  confirmText = 'Delete',
  confirmVariant = 'danger',
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col items-center text-center gap-4 py-2">
        <div className="w-14 h-14 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div>
          <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
          <p className="text-xs text-rose-200/70 max-w-sm">{message}</p>
        </div>

        <div className="flex items-center justify-end gap-3 w-full mt-4 pt-4 border-t border-white/10">
          <Button variant="outline" onClick={onClose} disabled={isLoading} className="flex-1">
            Cancel
          </Button>
          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            isLoading={isLoading}
            className="flex-1 font-bold"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
