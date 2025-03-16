import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import socket from "./socket";
import GameBoard from "./components/GameBoard";
import CardCreator from "./components/CardCreator";
import GameModeSelector from "./components/GameModeSelector";

const App = () => {
  const [roomId, setRoomId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [playerImage, setPlayerImage] = useState("");
  const [mode, setMode] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [playerCards, setPlayerCards] = useState([
    { name: "Fire Dragon", attack: 20 },
    { name: "Lightning Phoenix", attack: 15 },
    { name: "Water Serpent", attack: 10 },
  ]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [players, setPlayers] = useState({});
  const [scores, setScores] = useState({});

  useEffect(() => {
    const storedScores = JSON.parse(localStorage.getItem("leaderboard")) || [];
    setLeaderboard(storedScores);
  }, []);

  const handleSelectMode = (selectedMode) => {
    setMode(selectedMode);
    if (selectedMode === "multiplayer") {
      setGameStarted(false);
    }
  };

  const updateLeaderboard = (result) => {
    const scores = JSON.parse(localStorage.getItem("leaderboard")) || [];
    const existingPlayer = scores.find((p) => p.name === playerName);

    if (existingPlayer) {
      existingPlayer[result]++;
    } else {
      scores.push({
        name: playerName,
        wins: result === "wins" ? 1 : 0,
        losses: result === "losses" ? 1 : 0,
      });
    }

    localStorage.setItem("leaderboard", JSON.stringify(scores));
    setLeaderboard(scores);
  };

  const createRoom = () => {
    if (!playerName.trim()) {
      alert("Please enter your name before creating a room.");
      return;
    }
    const newRoomId = uuidv4().slice(0, 6);
    setRoomId(newRoomId);

    socket.emit("create-room", newRoomId, {
      name: playerName,
      image: playerImage || "/default-avatar.png",
    });

    setGameStarted(true);
  };

  useEffect(() => {
    socket.on("update-scores", (updatedScores) => {
      setScores(updatedScores);
      localStorage.setItem("leaderboard", JSON.stringify(updatedScores));
    });

    return () => {
      socket.off("update-scores");
    };
  }, []);

  useEffect(() => {
    socket.on("update-players", (playersData) => {
      setPlayers(playersData);
    });

    socket.on("room-created", (roomId) => {
      setRoomId(roomId);
      setGameStarted(true);
    });

    return () => {
      socket.off("update-players");
      socket.off("room-created");
    };
  }, []);

  const joinGame = () => {
    if (!roomId.trim() || !playerName.trim()) {
      alert("Please enter a valid Room ID and your name.");
      return;
    }

    socket.emit("join-game", roomId, {
      name: playerName,
      image: playerImage || "/default-avatar.png",
    });

    setGameStarted(true);
  };

  const handleExit = () => {
    socket.emit("leave-room", roomId);
    setGameStarted(false);
    setMode(null);
    setRoomId("");

    // Force leaderboard refresh
    const storedScores = JSON.parse(localStorage.getItem("leaderboard")) || [];
    setLeaderboard(storedScores);
  };

  return (
    <main className="game-section">
      <section className="game-container">
        <h1>Card Arena Battle</h1>

        {gameStarted ? (
          <GameBoard
            roomId={roomId}
            mode={mode}
            playerCards={playerCards}
            updateLeaderboard={updateLeaderboard}
            onExit={() => {
              setGameStarted(false);
              setMode(null);
              setRoomId("");
            }}
          />
        ) : !mode ? (
          <GameModeSelector onSelectMode={handleSelectMode} />
        ) : (
          <div>
            <h2>🏆 Leaderboard</h2>
            <div className="leaderboard">
              <ol>
                {Array.isArray(leaderboard) &&
                  leaderboard
                    .slice() // Create a shallow copy of the array
                    .reverse() // Reverse the array copy
                    .map((player, index) => (
                      <li key={index}>
                        {player.name} - Wins: {player.wins} | Losses:{" "}
                        {player.losses}
                      </li>
                    ))}
              </ol>
            </div>

            {mode === "bot" && (
              <div>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  required
                />
                <button onClick={() => setGameStarted(true)}>
                  Start AI Battle
                </button>
              </div>
            )}

            {mode === "multiplayer" && (
              <div>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Image URL (Optional)"
                  value={playerImage}
                  onChange={(e) => setPlayerImage(e.target.value)}
                />

                <button
                  onClick={createRoom}
                  className="bg-green-500 text-white p-3 rounded-lg"
                >
                  Create New Room
                </button>

                <div>
                  <input
                    type="text"
                    placeholder="Enter Room ID to Join"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                  />
                  <button
                    onClick={joinGame}
                    className="bg-blue-500 text-white p-3 rounded-lg"
                  >
                    Join Room
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <CardCreator
          addCustomCard={(card) => setPlayerCards([...playerCards, card])}
        />
      </section>
    </main>
  );
};

export default App;