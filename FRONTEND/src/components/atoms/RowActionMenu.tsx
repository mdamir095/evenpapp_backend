import { useState, useRef, useEffect } from "react";
import { ListRestart, MoreVertical, Pencil, Trash2, Power, PowerOff, MapPinned, Shield, ShieldOff, FileText } from "lucide-react";
import { createPortal } from "react-dom";
import ModalMap from "./ModalMap";

type RowActionMenuProps = {
  onEdit?: () => void;
  onDelete?: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
  onResetPassword?: () => void;
  canResetPassword?: boolean;
  onActivate?: () => void;
  onDeactivate?: () => void;
  onBlock?: () => void;
  onUnblock?: () => void;
  onLocation?: () => void;
  onQuotation?: () => void;
  canActivate?: boolean;
  canDeactivate?: boolean;
  canBlock?: boolean;
  canUnblock?: boolean;
  isActive?: boolean;
  isBlocked?: boolean;
  showLocationOption?: boolean;
  showQuotationOption?: boolean;
};

export const RowActionMenu = ({
  onEdit,
  onDelete,
  canEdit = false,
  canDelete = false,
  onResetPassword,
  canResetPassword = false,
  onActivate,
  onDeactivate,
  onBlock,
  onUnblock,
  onLocation,
  onQuotation,
  canActivate = false,
  canDeactivate = false,
  canBlock = false,
  canUnblock = false,
  isActive = true,
  isBlocked = false,
  showLocationOption = true,
  showQuotationOption = false,
}: RowActionMenuProps) => {
  const [open, setOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<'top' | 'bottom'>('bottom');
  const [coords, setCoords] = useState<{ top: number; right: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const computePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    // Estimate dropdown height if not rendered yet
    const estimatedDropdownHeight = 140; // px
    const dropdownHeight = dropdownRef.current?.getBoundingClientRect().height ?? estimatedDropdownHeight;

    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
      // Position above the button with small gap
      const top = Math.max(0, rect.top - dropdownHeight - 8);
      const right = Math.max(0, window.innerWidth - rect.right);
      setCoords({ top, right });
    } else {
      setPosition('bottom');
      // Position below the button with small gap
      const top = Math.min(window.innerHeight - dropdownHeight, rect.bottom + 8);
      const right = Math.max(0, window.innerWidth - rect.right);
      setCoords({ top, right });
    }
  };

  useEffect(() => {
    if (!open) return;
    computePosition();

    const handleResize = () => computePosition();
    const handleScroll = () => computePosition();

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node | null;
      const isInsideContainer = containerRef.current?.contains(target as Node) ?? false;
      const isInsideDropdown = dropdownRef.current?.contains(target as Node) ?? false;
      if (!isInsideContainer && !isInsideDropdown) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const dropdownPositionClasses = position === 'top'
    ? 'origin-bottom-right'
    : 'origin-top-right';

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        ref={buttonRef}
        onMouseDown={(e) => {
          // Prevent the button from stealing focus which can cause scroll-into-view on some browsers
          e.preventDefault();
        }}
        onClick={() => setOpen((prev) => !prev)}
        className="p-1 text-neutral-500 hover:text-black cursor-pointer"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Row actions"
      >
        <MoreVertical className="size-5" />
      </button>

      {open && coords && createPortal(
        <div
          ref={dropdownRef}
          className={`w-41 rounded-md bg-white border border-gray-200 shadow-lg z-[9] ${dropdownPositionClasses}`}
          role="menu"
          style={{ position: 'fixed', top: coords.top, right: coords.right }}
        >
          <ul className="text-sm text-gray-700">
            {canEdit && (
              <li
                onClick={() => {
                  setOpen(false);
                  onEdit?.();
                }}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                role="menuitem"
              >
                <Pencil className="size-4" /> Edit
              </li>
            )}
            {canDelete && (
              <li
                onClick={() => {
                  setOpen(false);
                  onDelete?.();
                }}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-gray-700 cursor-pointer"
                role="menuitem"
              >
                <Trash2 className="size-4" /> Delete
              </li>
            )}
            {canResetPassword && (
              <li
                onClick={() => {
                  setOpen(false);
                  onResetPassword?.();
                }}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-gray-700 cursor-pointer"
                role="menuitem"
              >
                <ListRestart  className="size-4" /> Reset Password
              </li>
            )}
            {canActivate && !isActive && (
              <li
                onClick={() => {
                  setOpen(false);
                  onActivate?.();
                }}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-green-700 cursor-pointer"
                role="menuitem"
              >
                <Power className="size-4" /> Activate
              </li>
            )}
            {canDeactivate && isActive && (
              <li
                onClick={() => {
                  setOpen(false);
                  onDeactivate?.();
                }}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-orange-700 cursor-pointer"
                role="menuitem"
              >
                <PowerOff className="size-4" /> Deactivate
              </li>
            )}
            {canBlock && !isBlocked && (
              <li
                onClick={() => {
                  setOpen(false);
                  onBlock?.();
                }}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-red-700 cursor-pointer"
                role="menuitem"
              >
                <ShieldOff className="size-4" /> Block
              </li>
            )}
            {canUnblock && isBlocked && (
              <li
                onClick={() => {
                  setOpen(false);
                  onUnblock?.();
                }}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-blue-700 cursor-pointer"
                role="menuitem"
              >
                <Shield className="size-4" /> Unblock
              </li>
            )}
            {showLocationOption && (
              <li
                onClick={() => {
                  setOpen(false);
                  onLocation?.();
                }}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-gray-700 cursor-pointer"
                role="menuitem"
              >
                <MapPinned  className="size-4" /> Add Location
              </li>
            )}
            {showQuotationOption && (
              <li
                // onClick={() => {
                //   setOpen(false);
                //   onQuotation?.();
                // }}
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-gray-700 cursor-pointer"
                role="menuitem"
              >
                <FileText className="size-4" /> Create Quotation
              </li>
              
            )}
          </ul>
        </div>,
        document.body
      )}
    </div>
  );
};
