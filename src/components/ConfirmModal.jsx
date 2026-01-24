import React from 'react';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, type = 'default' }) => {
    if (!isOpen) return null;

    const isDormida = type === 'dormida';

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
            <div className={`wood-panel p-8 max-w-sm w-full text-center relative border-4 ${isDormida ? 'border-yellow-400' : 'border-table-oakDark'} shadow-2xl scale-in-center`}>

                {/* Decorative Nails */}
                <div className="absolute top-3 left-3 w-3 h-3 rounded-full bg-black/30"></div>
                <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-black/30"></div>
                <div className="absolute bottom-3 left-3 w-3 h-3 rounded-full bg-black/30"></div>
                <div className="absolute bottom-3 right-3 w-3 h-3 rounded-full bg-black/30"></div>

                {isDormida && (
                    <div className="text-5xl mb-4 animate-bounce">✨🏆✨</div>
                )}

                <h2 className={`text-2xl font-black mb-2 tracking-tight ${isDormida ? 'text-yellow-400 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]' : 'text-white'}`}>
                    {title}
                </h2>

                <p className="text-white/90 font-medium mb-8 leading-relaxed">
                    {message}
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={onConfirm}
                        className={`w-full py-4 rounded-lg font-black text-white shadow-lg transition-all active:scale-95 ${isDormida
                                ? 'bg-yellow-600 hover:bg-yellow-500 animate-pulse-gold border-b-4 border-yellow-800'
                                : 'bg-table-green hover:bg-table-greenDark border-b-4 border-table-greenDark'
                            }`}
                    >
                        {isDormida ? '¡SÍ, ES DORMIDA! 🔥' : 'CONFIRMAR'}
                    </button>

                    <button
                        onClick={onCancel}
                        className="w-full py-2 text-white/60 font-bold hover:text-white transition-colors text-sm"
                    >
                        TAL VEZ NO...
                    </button>
                </div>

                {isDormida && (
                    <div className="absolute -top-10 -left-10 text-6xl opacity-20 -rotate-12 select-none">🎲</div>
                )}
                {isDormida && (
                    <div className="absolute -bottom-10 -right-10 text-6xl opacity-20 rotate-12 select-none">🎲</div>
                )}
            </div>

            <style jsx>{`
                .scale-in-center {
                    animation: scale-in-center 0.4s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
                }
                @keyframes scale-in-center {
                    0% { transform: scale(0); opacity: 1; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default ConfirmModal;
