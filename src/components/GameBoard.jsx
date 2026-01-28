import React from 'react';
import { INITIAL_SCORES } from '../constants';

const GameBoard = ({ players, activeTab, setActiveTab, onCellClick, onFinishGame, onResetGame, onOpenHistory, isSpectator = false }) => {

    const currentPlayer = players[activeTab] || players[0];

    // Safety check for missing player
    if (!currentPlayer) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-white p-6">
                <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-xl font-bold animate-pulse text-amber-500 uppercase">Cargando Tablero...</p>
                <p className="text-white/40 text-sm mt-2">Buscando datos del jugador...</p>
            </div>
        );
    }

    const currentScore = currentPlayer.score || INITIAL_SCORES;

    const scrollContainer = React.useRef(null);
    const isDragging = React.useRef(false);
    const dragMoved = React.useRef(false);
    const startX = React.useRef(0);
    const scrollLeft = React.useRef(0);

    const handleMouseDown = (e) => {
        isDragging.current = true;
        dragMoved.current = false;
        startX.current = e.pageX - scrollContainer.current.offsetLeft;
        scrollLeft.current = scrollContainer.current.scrollLeft;

        scrollContainer.current.classList.add('cursor-grabbing');
        scrollContainer.current.classList.remove('cursor-grab');

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const stopDragging = () => {
        setTimeout(() => {
            isDragging.current = false;
            dragMoved.current = false;
        }, 50);

        if (scrollContainer.current) {
            scrollContainer.current.classList.remove('cursor-grabbing');
            scrollContainer.current.classList.add('cursor-grab');
        }

        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };

    const handleMouseUp = () => {
        stopDragging();
    };

    const handleMouseMove = (e) => {
        if (!isDragging.current) return;

        const x = e.pageX - scrollContainer.current.offsetLeft;
        const dist = Math.abs(x - startX.current);

        if (dist > 5) {
            dragMoved.current = true;
        }

        if ((e.buttons & 1) === 0) {
            stopDragging();
            return;
        }

        e.preventDefault();
        const walk = (x - startX.current) * 2;
        scrollContainer.current.scrollLeft = scrollLeft.current - walk;
    };

    const renderCell = (pos, label, type) => {
        const val = currentScore[pos] !== undefined ? currentScore[pos] : null;
        const isSet = val !== null;
        return (
            <div
                onClick={() => !isSpectator && onCellClick({ pos, label, type })}
                className={`h-20 rounded-lg flex flex-col items-center justify-center transition-all relative
                    ${isSpectator ? 'cursor-default' : 'cursor-pointer'}
                    ${isSet
                        ? 'bg-white border-2 border-table-oak shadow-sm'
                        : 'bg-table-paper/90 hover:bg-white border border-gray-300 shadow-inner opacity-90'
                    }
                    ${!isSet && isSpectator ? 'hover:bg-table-paper/90' : ''}
                `}
            >
                <span className={`text-[10px] uppercase font-bold mb-1 ${isSet ? 'text-gray-500' : 'text-gray-400'}`}>{label}</span>
                <span className={`text-3xl font-black ${isSet ? 'text-table-ink' : 'text-transparent'}`}>
                    {val === null ? '-' : (val === 0 ? 'X' : val)}
                </span>
            </div>
        );
    };

    return (
        <div className="max-w-md mx-auto p-4 pb-24 responsive-scale">

            {/* Tabs Jugadores */}
            <div
                ref={scrollContainer}
                onMouseDown={handleMouseDown}
                className="flex gap-1 overflow-x-auto mb-4 py-2 no-scrollbar pl-1 cursor-grab active:cursor-grabbing select-none"
            >
                {players.map((p, i) => (
                    <button
                        key={i}
                        onMouseUp={(e) => {
                            if (dragMoved.current) {
                                e.stopPropagation();
                                return;
                            }
                            setActiveTab(i);
                        }}
                        className={`px-4 py-2 rounded-t-lg font-bold whitespace-nowrap transition-all border-t-2 border-x-2 relative
                            ${activeTab === i
                                ? 'bg-[#F9F7F1] text-table-oakDark border-white shadow-lg z-10 -mb-1 pb-3'
                                : 'bg-table-oakDark/80 text-white/70 border-table-oakDark/50 hover:bg-table-oakDark'}`}
                    >
                        {p.name} <span className="ml-1 opacity-60 text-xs">({p.total})</span>
                    </button>
                ))}
            </div>

            {/* Contenedor Principal */}
            <div className={`p-3 rounded-b-xl rounded-tr-xl shadow-2xl min-h-[400px] transition-colors ${isSpectator ? 'bg-[#f0ece2]' : 'bg-[#F9F7F1]'}`}>
                <div className="grid grid-cols-3 gap-2 mb-2">
                    {renderCell('1-1', 'Balas', 'num-1')}
                    {renderCell('1-2', 'Escalera', 'major-Escalera')}
                    {renderCell('1-3', 'Cuadras', 'num-4')}

                    {renderCell('2-1', 'Tontos', 'num-2')}
                    {renderCell('2-2', 'Full', 'major-Full')}
                    {renderCell('2-3', 'Quinas', 'num-5')}

                    {renderCell('3-1', 'Trenes', 'num-3')}
                    {renderCell('3-2', 'Poker', 'major-Poker')}
                    {renderCell('3-3', 'Senas', 'num-6')}
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t-2 border-dashed border-gray-300">
                    {renderCell('4-1', '1ra Grande', 'grande')}
                    {renderCell('4-2', '2da Grande', 'grande')}
                </div>
            </div>

            <div
                className="fixed bottom-4 left-0 w-full px-4 pointer-events-none"
                style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
                <div className="max-w-md mx-auto wood-panel p-3 flex justify-between items-center pointer-events-auto shadow-2xl border-white/10">
                    <div>
                        <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider">
                            {isSpectator ? `Viendo a ${currentPlayer.name}` : `Turno de ${currentPlayer.name}`}
                        </p>
                        <div className="text-3xl font-black text-white">{currentPlayer.total} <span className="text-sm font-normal text-white/60">pts</span></div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={onOpenHistory} className="bg-table-oakLight text-white p-3 rounded shadow-wood hover:shadow-wood-pressed hover:translate-y-[2px] transition-all border-b border-table-oak" title="Ver Historial">
                            📋
                        </button>
                        {!isSpectator && (
                            <>
                                <button onClick={onFinishGame} className="bg-table-green text-white px-4 py-2 rounded shadow-wood hover:shadow-wood-pressed hover:translate-y-[2px] transition-all font-bold text-xs uppercase tracking-wide border-b border-table-greenDark">
                                    Terminar
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GameBoard;
