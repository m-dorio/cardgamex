import { useState } from "react";

const GameModeSelector = ({ onSelectMode }) => {
  const [selectedMode, setSelectedMode] = useState(null);

  const handleSelectMode = (mode) => {
    setSelectedMode(mode);
    onSelectMode(mode);
  };

  return (
    <div className="gamemodeselector flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h3 className="text-2xl font-bold mb-6">Select Game Mode</h3>

      <button
        onClick={() => handleSelectMode("bot")}
        className={`bg-blue-500 text-white p-3 m-2 rounded-lg w-48 ${
          selectedMode ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={!!selectedMode}
      >
        🎮 Play vs AI (Singleplayer)
      </button>

      <button
        onClick={() => handleSelectMode("multiplayer")}
        className={`bg-green-500 text-white p-3 m-2 rounded-lg w-48 ${
          selectedMode ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={!!selectedMode}
      >
        🌍 Play Online (Multiplayer)
      </button>

       <button
        onClick={() => handleSelectMode("createcard")}
        className={`bg-green-500 text-white p-3 m-2 rounded-lg w-48 ${
          selectedMode ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={!!selectedMode}
      >
        🌍 Custom Card(Make yours)
      </button>
    </div>
  );
};

export default GameModeSelector;