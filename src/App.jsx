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

  const applyAttackBonus = (cards) => {
    return cards.map((card) => ({
      ...card,
      attack: Math.floor(card.attack * (1 + Math.random() * 0.5)), // ✅ 1.0x to 1.5x multiplier
    }));
  };

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
      existingPlayer[result] += 1;
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

    setPlayerCards(applyAttackBonus(playerCards));
    setGameStarted(true);
  };

  useEffect(() => {
  socket.on("update-scores", (scores) => {
    setPlayers((prevPlayers) => ({
      ...prevPlayers,
      scores, // ✅ Update scores from server
    }));
  });

  return () => {
    socket.off("update-scores");
  };
}, []);

  useEffect(() => {
    const handleRoomCreated = (roomId) => {
      setRoomId(roomId);
      setGameStarted(true);
    };

    const handleUpdatePlayers = (playersData) => {
      setPlayers(playersData);
    };

    socket.on("room-created", handleRoomCreated);
    socket.on("update-players", handleUpdatePlayers);

    return () => {
      socket.off("room-created", handleRoomCreated);
      socket.off("update-players", handleUpdatePlayers);
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
          />
        ) : !mode ? (
          <GameModeSelector onSelectMode={handleSelectMode} />
        ) : (
          <div>
            <h2>🏆 Leaderboard</h2>
            <ul>
              {leaderboard.map((player, index) => (
                <li key={index}>
                  {player.name} - Wins: {player.wins} | Losses: {player.losses}
                </li>
              ))}
            </ul>

            {mode === "bot" && (
              <div>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  required
                />
                <button onClick={() => setGameStarted(true)}>Start AI Battle</button>
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

                <button onClick={createRoom} className="bg-green-500 text-white p-3 rounded-lg">
                  Create New Room
                </button>

                <div>
                  <input
                    type="text"
                    placeholder="Enter Room ID to Join"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                  />
                  <button onClick={joinGame} className="bg-blue-500 text-white p-3 rounded-lg">
                    Join Room
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <CardCreator addCustomCard={(card) => setPlayerCards([...playerCards, card])} />
      </section>
    </main>
  );
};

export default App;
