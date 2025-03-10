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
  const [joinRoomId, setJoinRoomId] = useState(""); // For joining a room

  // Handle room creation
  useEffect(() => {
    if (mode === "multiplayer" && !roomId) {
      socket.emit("create-room", (newRoom) => {
        setRoomId(newRoom);
        socket.emit("join-game", newRoom, { playerCards });
      });
    }
  }, [mode]);

  // Handle joining an existing room
  const handleJoinRoom = () => {
    if (joinRoomId) {
      setMode("multiplayer");
      setRoomId(joinRoomId);
      socket.emit("join-game", joinRoomId, { playerCards });
    }
  };

  // Add custom card
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
            Create Multiplayer Game
          </button>

          {/* Join existing multiplayer room */}
          <div className="mt-4">
            <input
              type="text"
              placeholder="Enter Room ID"
              value={joinRoomId}
              onChange={(e) => setJoinRoomId(e.target.value)}
              className="border p-2"
            />
            <button className="bg-yellow-500 text-white p-2 ml-2 rounded" onClick={handleJoinRoom}>
              Join Room
            </button>
          </div>
        </div>
      )}

      {/* Display Room ID when created */}
      {mode === "multiplayer" && roomId && <p className="text-green-600">Room ID: {roomId}</p>}

      {/* Card Creator */}
      <CardCreator addCustomCard={addCustomCard} />

      {/* Game Board */}
      {mode && <GameBoard playerCards={playerCards} mode={mode} roomId={roomId} />}
    </div>
  );
};

export default App;
