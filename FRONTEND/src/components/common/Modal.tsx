import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Button } from '../atoms/Button';

type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  size?: ModalSize;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  hideCloseButton?: boolean;
}

const sizeClasses: Record<ModalSize, string> = {
  xs: 'max-w-xs',
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  full: 'w-full h-full',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  size = 'md',
  title = '',
  children,
  footer,
  hideCloseButton = false,
}) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded shadow-lg w-full ${sizeClasses[size]} ${
          size === 'full' ? 'h-full overflow-auto' : ''
        }`}
        onClick={(e) => e.stopPropagation()} // prevent closing on modal click
      >
        {/* Header */}
        {(title || !hideCloseButton) && (
          <div className="flex items-center justify-between px-4 py-3 border-b">
            {title}
            {/* {title && <h2 className="text-lg font-semibold">{title}</h2>} */}
            {!hideCloseButton && (
              <Button
                variant="secondary"
                onClick={onClose}
                className="text-gray-900 hover:text-gray-700"
                aria-label="Close"
              >
                ✕
              </Button>
              
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-4 text-gray-900">{children}</div>

        {/* Footer */}
        {footer && <div className="px-4 py-3 border-t">{footer}</div>}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
