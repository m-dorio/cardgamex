import { useState } from "react";

const GameModeSelector = ({ onSelectMode }) => {
  const [selectedMode, setSelectedMode] = useState(null);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">Select Game Mode</h1>

      <button
        onClick={() => onSelectMode("singleplayer")}
        className="bg-blue-500 text-white p-3 m-2 rounded-lg w-48"
      >
        🎮 Play vs AI (Singleplayer)
      </button>

      <button
        onClick={() => onSelectMode("multiplayer")}
        className="bg-green-500 text-white p-3 m-2 rounded-lg w-48"
      >
        🌍 Play Online (Multiplayer)
      </button>
    </div>
  );
};

export default GameModeSelector;
