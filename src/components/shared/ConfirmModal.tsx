import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Info, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
    isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'تأكيد',
    cancelText = 'إلغاء',
    type = 'danger',
    isLoading = false
}) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (isOpen) {
            // Save current active element to restore later
            triggerRef.current = document.activeElement as HTMLElement;
            
            // Set initial focus to the modal content or a specific button
            // Small delay to ensure modal is rendered
            const timer = setTimeout(() => {
                const focusableElements = modalRef.current?.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                if (focusableElements && focusableElements.length > 0) {
                    (focusableElements[0] as HTMLElement).focus();
                }
            }, 100);
            return () => clearTimeout(timer);
        } else if (triggerRef.current) {
            // Restore focus when closing
            triggerRef.current.focus();
        }
    }, [isOpen]);

    // Handle focus trapping
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.key === 'Escape') {
                onClose();
                return;
            }

            if (e.key === 'Tab') {
                const focusableElements = modalRef.current?.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                
                if (!focusableElements || focusableElements.length === 0) return;

                const firstElement = focusableElements[0] as HTMLElement;
                const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

                if (e.shiftKey) { // Shift + Tab
                    if (document.activeElement === firstElement) {
                        lastElement.focus();
                        e.preventDefault();
                    }
                } else { // Tab
                    if (document.activeElement === lastElement) {
                        firstElement.focus();
                        e.preventDefault();
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const iconMap = {
        danger: AlertTriangle,
        warning: AlertCircle,
        info: Info
    };

    const iconColors = {
        danger: 'text-red-500 bg-red-500/10',
        warning: 'text-amber-500 bg-amber-500/10',
        info: 'text-brand-primary bg-brand-primary/10'
    };

    const buttonVariants = {
        danger: 'danger' as const,
        warning: 'primary' as const,
        info: 'primary' as const
    };

    const Icon = iconMap[type];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        ref={modalRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="modal-title"
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden border border-border-default"
                    >
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${iconColors[type]}`}>
                                    <Icon className="w-7 h-7" />
                                </div>
                                <button
                                    onClick={onClose}
                                    aria-label="إغلاق النافذة"
                                    className="p-2 hover:bg-surface-primary rounded-xl transition-colors text-text-muted hover:text-text-primary"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <h3 id="modal-title" className="text-2xl font-black text-text-primary mb-3">{title}</h3>
                            <p className="text-text-secondary font-bold leading-relaxed mb-10">{message}</p>

                            <div className="flex items-center gap-4">
                                <Button
                                    variant={buttonVariants[type]}
                                    isLoading={isLoading}
                                    onClick={onConfirm}
                                    fullWidth
                                    size="lg"
                                >
                                    {confirmText}
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={onClose}
                                    fullWidth
                                    size="lg"
                                    disabled={isLoading}
                                >
                                    {cancelText}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
