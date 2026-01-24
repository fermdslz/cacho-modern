import React, { useState, useEffect } from 'react';
import { INITIAL_SCORES } from './constants';
import SetupScreen from './components/SetupScreen';
import GameBoard from './components/GameBoard';
import WinnerScreen from './components/WinnerScreen';
import ScoreModal from './components/ScoreModal';
import HistoryModal from './components/HistoryModal';
import ConfirmModal from './components/ConfirmModal';

const App = () => {
  const [players, setPlayers] = useState([]);
  const [gameState, setGameState] = useState('setup');
  const [dormidaWinner, setDormidaWinner] = useState(null);
  const [tempNames, setTempNames] = useState(['', '']);
  const [activeTab, setActiveTab] = useState(0);
  const [modal, setModal] = useState(null);
  const [moveLog, setMoveLog] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: null, type: 'default' });

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem('cacho_classic_v2');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setPlayers(data.players || []);
        setGameState(data.gameState || 'setup');
        setDormidaWinner(data.dormidaWinner || null);
        setMoveLog(data.moveLog || []);
      } catch (e) {
        console.error("Error parsing saved game", e);
      }
    }
  }, []);

  useEffect(() => {
    if (players.length > 0) {
      localStorage.setItem('cacho_classic_v2', JSON.stringify({ players, gameState, dormidaWinner, moveLog }));
    }
  }, [players, gameState, dormidaWinner, moveLog]);

  const handleStartGame = () => {
    const filteredNames = tempNames.filter(n => n.trim() !== '');
    if (filteredNames.length < 1) return alert("Añade al menos un jugador");

    const newPlayers = filteredNames.map(name => ({
      name,
      score: { ...INITIAL_SCORES },
      total: 0
    }));
    setPlayers(newPlayers);
    setGameState('playing');
    setDormidaWinner(null);
    setMoveLog([]); // Reset log
    setActiveTab(0);
  };

  const updateScore = (pos, value) => {
    // 1. Confirmación de Dormida
    if (value === 'DORMIDA') {
      setConfirmConfig({
        isOpen: true,
        type: 'dormida',
        title: '¡EL SUEÑO DE TODO CACHERO!',
        message: '¡NO PUEDE SER! 😱 ¿Es una DORMIDA REAL? ¡Confirma para hacer historia!',
        onConfirm: () => {
          setConfirmConfig({ isOpen: false });
          processUpdateScore(pos, value);
        }
      });
      return;
    }

    processUpdateScore(pos, value);
  };

  const processUpdateScore = (pos, value) => {
    const newPlayers = [...players];
    const currentPlayer = newPlayers[activeTab];

    // 2. Guardar en Historial antes de cerrar modal (necesitamos el label)
    if (modal) {
      setMoveLog(prev => [...prev, {
        player: currentPlayer.name,
        label: modal.label,
        value: value,
        timestamp: new Date().toISOString()
      }]);
    }

    currentPlayer.score = { ...currentPlayer.score, [pos]: value };

    let total = 0;
    Object.values(currentPlayer.score).forEach(v => {
      if (typeof v === 'number') total += v;
    });
    currentPlayer.total = total;

    setPlayers(newPlayers);
    setModal(null);

    if (value === 'DORMIDA') {
      setDormidaWinner(currentPlayer.name);
      setGameState('finished');
    }
  };

  const finishGameManual = () => {
    setConfirmConfig({
      isOpen: true,
      title: '¿CERRAMOS LA PLANILLA?',
      message: '¿Ya se cansaron? ¡Cerramos el cacho y vemos quién manda!',
      type: 'default',
      onConfirm: () => {
        setConfirmConfig({ isOpen: false });
        setGameState('finished');
      }
    });
  };

  const resetGameHard = () => {
    setConfirmConfig({
      isOpen: true,
      title: '¡BORRÓN Y CUENTA NUEVA!',
      message: '¡Mesa limpia! ¿Quién se anima a otra partidita?',
      type: 'default',
      onConfirm: () => {
        setConfirmConfig({ isOpen: false });
        localStorage.removeItem('cacho_classic_v2');
        window.location.reload();
      }
    });
  };

  return (
    <div className="min-h-screen">
      {gameState === 'setup' && (
        <SetupScreen
          tempNames={tempNames}
          setTempNames={setTempNames}
          onStart={handleStartGame}
        />
      )}

      {gameState === 'playing' && (
        <GameBoard
          players={players}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onCellClick={setModal}
          onFinishGame={finishGameManual}
          onResetGame={resetGameHard}
          onOpenHistory={() => setShowHistory(true)}
        />
      )}

      {gameState === 'finished' && (
        <WinnerScreen
          players={players}
          dormidaWinner={dormidaWinner}
          onReset={resetGameHard}
        />
      )}

      <ScoreModal
        modal={modal}
        onClose={() => setModal(null)}
        onUpdateScore={updateScore}
      />

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        type={confirmConfig.type}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
      />

      {showHistory && (
        <HistoryModal
          moveLog={moveLog}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
};

export default App;
