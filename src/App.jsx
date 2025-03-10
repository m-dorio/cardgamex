import { useState, useEffect } from "react";
import CardCreator from "./components/CardCreator";
import GameBoard from "./components/GameBoard";
import socket from "./socket";

const App = () => {
  const [playerCards, setPlayerCards] = useState([
    { name: "Fire Dragon", attack: 20 },
    { name: "Lightning Phoenix", attack: 15 },
    { name: "Water Serpent", attack: 10 },
  ]);
  const [roomId, setRoomId] = useState(null);
  const [mode, setMode] = useState(null);

  // Handle room creation for multiplayer mode
  useEffect(() => {
    if (mode === "multiplayer") {
      socket.emit("create-room", (room) => {
        setRoomId(room);
      });
    } else {
      setRoomId(null); // Reset room ID when switching to AI mode
    }
  }, [mode]);

  // Add custom card to the player's deck
  const addCustomCard = (newCard) => {
    setPlayerCards((prevCards) => [...prevCards, newCard]);
  };

  return (
    <div className="game-container p-4">
      <h1 className="text-2xl font-bold mb-4">⚔ Trading Card Game ⚔</h1>

      {/* Mode Selection */}
      {!mode && (
        <div className="mb-4">
          <button className="bg-blue-500 text-white p-2 m-2 rounded" onClick={() => setMode("bot")}>
            Play vs AI
          </button>
          <button className="bg-green-500 text-white p-2 m-2 rounded" onClick={() => setMode("multiplayer")}>
            Play Multiplayer
          </button>
        </div>
      )}

      {/* Card Creator */}
      <CardCreator addCustomCard={addCustomCard} />

      {/* Game Board only renders if a mode is selected */}
      {mode && <GameBoard playerCards={playerCards} mode={mode} roomId={roomId} />}
    </div>
  );
};

export default App;
