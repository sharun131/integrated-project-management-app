import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import GlassPanel from './ui/GlassPanel';

const Modal = ({ isOpen, onClose, title, children }) => {
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
            // Prevent scrolling on body when modal is open
            document.body.style.overflow = 'hidden';
        }
        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex flex-col justify-center items-center p-4 sm:p-6 bg-[#03040b]/60 backdrop-blur-md">
            {/* Backdrop Layer */}
            <div
                className="absolute inset-0 transition-opacity cursor-pointer"
                onClick={onClose}
            ></div>

            {/* Modal Container - scrollable if content exceeds viewport */}
            <div className="relative z-10 w-full max-w-lg max-h-[90vh] flex flex-col animate-scale-in">
                <GlassPanel className="!bg-slate-900/90 !backdrop-blur-2xl border border-white/10 shadow-2xl p-8 flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-8 border-b border-white/5 pb-6 shrink-0">
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tight uppercase">{title}</h2>
                            <div className="h-1 w-12 bg-primary mt-2 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.5)]"></div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-slate-400 hover:text-white border border-white/5 hover:border-white/10"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content Area - Scrollable internally */}
                    <div className="relative overflow-y-auto custom-scrollbar flex-1 pr-2">
                        {children}
                    </div>
                </GlassPanel>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default Modal;
