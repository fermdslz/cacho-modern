import React, { useState, useEffect } from 'react';
import { INITIAL_SCORES } from './constants';
import SetupScreen from './components/SetupScreen';
import GameBoard from './components/GameBoard';
import WinnerScreen from './components/WinnerScreen';
import ScoreModal from './components/ScoreModal';
import HistoryModal from './components/HistoryModal';
import ConfirmModal from './components/ConfirmModal';
import RoomManager from './components/RoomManager';
import ChangelogModal from './components/ChangelogModal';
import SettingsModal from './components/SettingsModal';
import { ref, onValue, set, update } from "firebase/database";
import { db } from './firebase';

const generateRoomID = () => Math.random().toString(36).substring(2, 7).toUpperCase();

const App = () => {
  const [players, setPlayers] = useState([]);
  const [gameState, setGameState] = useState('setup');
  const [dormidaWinner, setDormidaWinner] = useState(null);
  const [tempNames, setTempNames] = useState([
    { id: Math.random().toString(36).substr(2, 9), name: '' },
    { id: Math.random().toString(36).substr(2, 9), name: '' }
  ]);
  const [activeTab, setActiveTab] = useState(0);
  const [modal, setModal] = useState(null);
  const [moveLog, setMoveLog] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: null, type: 'default' });

  // Settings
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('cacho_settings');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        // Migration: if it was boolean from older version, convert
        if (typeof data.useTraditionalNotation === 'boolean') {
          return { notationStyle: data.useTraditionalNotation ? 'traditional' : 'modern' };
        }
        // Remove uiSize if it exists in saved settings to keep it clean
        if (data.uiSize) delete data.uiSize;
        return data;
      } catch (e) { console.error("Error reading settings", e); }
    }
    return { notationStyle: 'traditional' };
  });

  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('cacho_settings', JSON.stringify(newSettings));
  };

  // Room State
  const [roomID, setRoomID] = useState(() => localStorage.getItem('cacho_room_id') || null);
  const [role, setRole] = useState(() => localStorage.getItem('cacho_role') || null); // 'host' | 'spectator'
  const [isInitializingHost, setIsInitializingHost] = useState(false);

  // Persistence
  useEffect(() => {
    // 1. Recover standard game data
    const saved = localStorage.getItem('cacho_classic_v2');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (!roomID) { // Only load local if not in room
          setPlayers(data.players || []);
          setGameState(data.gameState || 'setup');
          setDormidaWinner(data.dormidaWinner || null);
          setMoveLog(data.moveLog || []);
        }
      } catch (e) { console.error("Error parsing saved game", e); }
    }

    // 2. Room persistence
    if (roomID) localStorage.setItem('cacho_room_id', roomID);
    else localStorage.removeItem('cacho_room_id');

    if (role) localStorage.setItem('cacho_role', role);
    else localStorage.removeItem('cacho_role');
  }, [roomID, role]);

  // Handle Host Re-entry (Fecth data before syncing)
  useEffect(() => {
    if (roomID && role === 'host' && players.length === 0) {
      console.log("Host re-conectando, verificando datos previos...");
      setIsInitializingHost(true);
      const roomRef = ref(db, `rooms/${roomID}`);
      onValue(roomRef, (snapshot) => {
        const data = snapshot.val();
        if (data && data.players && data.players.length > 0) {
          setPlayers(data.players);
          setGameState(data.gameState || 'playing');
          setDormidaWinner(data.dormidaWinner || null);
          setMoveLog(data.moveLog || []);
        }
        setIsInitializingHost(false);
      }, { onlyOnce: true });
    }
  }, [roomID, role]);

  useEffect(() => {
    if (players.length > 0 && !roomID) {
      localStorage.setItem('cacho_classic_v2', JSON.stringify({ players, gameState, dormidaWinner, moveLog }));
    }

    // If we are host, sync to Firebase AND Mock
    if (roomID && role === 'host' && !isInitializingHost) {
      const data = { players, gameState, dormidaWinner, moveLog, activeTab, lastUpdated: new Date().toISOString() };

      // Sync Mock (Same PC)
      localStorage.setItem(`cacho_room_${roomID}`, JSON.stringify(data));

      // Sync Firebase (Cloud)
      try {
        const roomRef = ref(db, `rooms/${roomID}`);
        set(roomRef, data);
      } catch (e) { /* Ignore dummy errors */ }
    }

    // Ensure activeTab is always valid
    if (players.length > 0 && activeTab >= players.length) {
      setActiveTab(0);
    }
  }, [players, gameState, dormidaWinner, moveLog, roomID, role, activeTab]);

  // Sync logic (Firebase or Mock)
  useEffect(() => {
    if (roomID && role === 'spectator') {
      console.log(`Intentando conectar a sala: ${roomID}...`);

      // 1. INTENTO DE MOCK (LocalStorage) para pruebas en la misma PC
      const syncFromLocal = () => {
        const saved = localStorage.getItem(`cacho_room_${roomID}`);
        if (saved) {
          try {
            const data = JSON.parse(saved);
            setPlayers(data.players || []);
            setGameState(data.gameState || 'setup');
            setDormidaWinner(data.dormidaWinner || null);
            setMoveLog(data.moveLog || []);
            // REMOVED: setActiveTab synchronization for spectators 
            // to allow independent navigation
          } catch (e) { console.error("Error mock sync", e); }
        }
      };

      // Poll local storage every second as fallback
      const localInterval = setInterval(syncFromLocal, 1000);

      // 2. INTENTO DE FIREBASE (Real)
      const roomRef = ref(db, `rooms/${roomID}`);
      const unsubscribe = onValue(roomRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setPlayers(data.players || []);
          setGameState(data.gameState || 'setup');
          setDormidaWinner(data.dormidaWinner || null);
          setMoveLog(data.moveLog || []);
          // REMOVED: setActiveTab synchronization for spectators 
          // to allow independent navigation
        }
      }, (error) => {
        console.warn("Firebase no conectado (llaves dummy). Usando sync local.");
      });

      return () => {
        clearInterval(localInterval);
        unsubscribe();
      };
    }
  }, [roomID, role]);

  const handleHost = () => {
    const newID = generateRoomID();
    setRoomID(newID);
    setRole('host');
    // We keep current players/state if any
  };

  const handleJoin = (id) => {
    if (!id) return;
    setRoomID(id);
    setRole('spectator');
    // REMOVED: setGameState('playing'); 
    // We wait for data to arrive before moving from 'setup'
  };

  const handleStartGame = () => {
    const filteredNames = tempNames.filter(p => p.name.trim() !== '');
    if (filteredNames.length < 1) return alert("Añade al menos un jugador");

    const newPlayers = filteredNames.map(p => ({
      name: p.name,
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

  const handleLeaveRoom = () => {
    setConfirmConfig({
      isOpen: true,
      title: '¿ABANDONAR SALA?',
      message: role === 'host'
        ? 'Si sales como Host, la sala dejará de actualizarse para otros. ¿Estás seguro?'
        : 'Saldrás de esta partida y volverás al menú principal.',
      type: 'default',
      onConfirm: () => {
        setConfirmConfig({ isOpen: false });
        setRoomID(null);
        setRole(null);
        setGameState('setup');
        setPlayers([]);
        localStorage.removeItem('cacho_room_id');
        localStorage.removeItem('cacho_role');
      }
    });
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

  const handleResetApp = () => {
    // Si hay jugadores actuales, guardamos sus nombres para la siguiente partida
    if (players.length > 0) {
      setTempNames(players.map(p => ({ id: Math.random().toString(36).substr(2, 9), name: p.name })));
    } else {
      setTempNames([
        { id: Math.random().toString(36).substr(2, 9), name: '' },
        { id: Math.random().toString(36).substr(2, 9), name: '' }
      ]);
    }
    setPlayers([]);
    setGameState('setup');
    setDormidaWinner(null);
    setMoveLog([]);
    setActiveTab(0);
    setRoomID(null);
    setRole(null);
    localStorage.removeItem('cacho_classic_v2');
    localStorage.removeItem('cacho_room_id');
    localStorage.removeItem('cacho_role');
  };

  const resetGameHard = () => {
    setConfirmConfig({
      isOpen: true,
      title: '¡BORRÓN Y CUENTA NUEVA!',
      message: '¿Estás seguro de reiniciar? Se perderá el progreso actual.',
      type: 'default',
      onConfirm: () => {
        setConfirmConfig({ isOpen: false });
        handleResetApp();
      }
    });
  };

  const startNewGame = () => {
    handleResetApp();
  };

  return (
    <div className="min-h-dvh flex flex-col overflow-hidden">
      {gameState === 'setup' && (
        <div className="flex-1 overflow-y-auto no-scrollbar pb-[env(safe-area-inset-bottom)] flex flex-col justify-center">
          <div className="max-w-md mx-auto px-4 w-full flex flex-col items-center py-4">
            <SetupScreen
              tempNames={tempNames}
              setTempNames={setTempNames}
              onStart={handleStartGame}
              onShowChangelog={() => setShowChangelog(true)}
              onShowSettings={() => setShowSettings(true)}
            />
            <div className="w-full max-w-md mx-auto">
              <RoomManager
                onHost={handleHost}
                onJoin={handleJoin}
                onLeave={handleLeaveRoom}
                roomID={roomID}
                role={role}
              />
              <div className="mt-8 pb-4 text-center">
                <p className="text-white/80 font-light mb-2 text-xs tracking-widest border-t border-white/10 pt-4">By: Fernando Machicado</p>
                <div className="flex items-center justify-center gap-2">
                  <p className="text-white/80 font-light text-xs tracking-widest leading-none">Ver. 2.3</p>
                  <button
                    onClick={() => setShowChangelog(true)}
                    className="w-5 h-5 flex items-center justify-center rounded-full bg-white/10 text-amber-500 hover:bg-white/20 transition-all text-[10px] font-bold border border-white/5"
                    title="Ver novedades"
                  >
                    i
                  </button>
                  <button
                    onClick={() => setShowSettings(true)}
                    className="w-5 h-5 flex items-center justify-center rounded-full bg-white/10 text-white/50 hover:bg-white/20 transition-all text-[10px] font-bold border border-white/5"
                    title="Ajustes"
                  >
                    ⚙️
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {players.length > 0 ? (
              <>
                {roomID && (
                  <div className="px-4 mt-4 max-w-md mx-auto w-full text-center">
                    <RoomManager
                      roomID={roomID}
                      role={role}
                      onLeave={handleLeaveRoom}
                    />
                  </div>
                )}
                <GameBoard
                  players={players}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  onCellClick={role === 'spectator' ? () => { } : setModal}
                  onFinishGame={finishGameManual}
                  onResetGame={resetGameHard}
                  onOpenHistory={() => setShowHistory(true)}
                  onOpenSettings={() => setShowSettings(true)}
                  isSpectator={role === 'spectator'}
                  notationStyle={settings.notationStyle}
                />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-white p-6">
                <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                <h2 className="text-2xl font-black text-amber-500 mb-2 uppercase tracking-tighter">Sincronizando Sala</h2>
                <p className="text-white/60 text-center max-w-xs mb-8">Obteniendo los puntos de la nube. Si tarda mucho, verifica que el Host inició la partida.</p>
                <button
                  onClick={() => { setRoomID(null); setRole(null); setGameState('setup'); }}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white/50 text-sm transition-all"
                >
                  Cancelar y Salir
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {gameState === 'finished' && (
        <WinnerScreen
          players={players}
          dormidaWinner={dormidaWinner}
          onReset={startNewGame}
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
      {showChangelog && (
        <ChangelogModal
          isOpen={showChangelog}
          onClose={() => setShowChangelog(false)}
        />
      )}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onUpdateSetting={updateSetting}
      />
    </div>
  );
};

export default App;
