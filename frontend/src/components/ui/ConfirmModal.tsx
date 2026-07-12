import { Modal } from "./Modal";
import { Button } from "./Button";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  type?: "danger" | "primary";
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  type = "primary",
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
          <Button title="Cancel" variant="secondary" size="md" onClick={onClose} />
          <Button
            title={confirmText}
            variant={type === "danger" ? "danger" : "primary"}
            size="md"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          />
        </div>
      </div>
    </Modal>
  );
}
export default ConfirmModal;
