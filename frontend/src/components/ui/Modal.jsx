import React, { useEffect } from 'react';

/**
 * Reusable Modal overlay
 */
export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  className = ''
}) => {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
      <div className={`w-full max-w-lg bg-darkSurface border border-darkBorder rounded-2xl overflow-hidden shadow-2xl ${className}`}>
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-darkBorder">
          <h3 className="font-bold text-base text-slate-100">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {children}
        </div>

        {/* Modal Footer */}
        {footer && (
          <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-darkBorder bg-slate-900/20">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
