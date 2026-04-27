import { useEffect } from "react";

export default function Modal({ open, title, children, actions, onClose }) {
  useEffect(() => {
    if (!open) return undefined;
    function onKeyDown(e) {
      if (e.key === "Escape") onClose?.();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modalOverlay" role="dialog" aria-modal="true" onMouseDown={onClose}>
      <div className="modalCard" onMouseDown={(e) => e.stopPropagation()}>
        {title ? <div className="modalTitle">{title}</div> : null}
        <div className="modalBody">{children}</div>
        <div className="modalActions">{actions}</div>
      </div>
    </div>
  );
}

