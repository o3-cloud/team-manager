import type { ReactNode } from "react";

export interface ModalProps {
  open?: boolean;
  onClose?: () => void;
  children?: ReactNode;
  title?: string;
}

export function Modal({ open = false, onClose, children, title }: ModalProps) {
  if (!open) return null;

  return (
    <dialog open className="modal modal-open">
      <div className="modal-box">
        {title && <h3 className="font-bold text-lg">{title}</h3>}
        <div>{children}</div>
        {onClose && (
          <div className="modal-action">
            <button type="button" aria-label="Close" onClick={onClose}>
              Close
            </button>
          </div>
        )}
      </div>
      {onClose && <div className="modal-backdrop" onClick={onClose} onKeyDown={undefined} />}
    </dialog>
  );
}
