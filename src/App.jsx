import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import CardCreator from "./components/CardCreator";
import GameBoard from "./components/GameBoard";
import socket from "./socket";

const App = () => {
  const [playerCards, setPlayerCards] = useState([
    { name: "Fire Dragon", attack: 20 },
    { name: "Lightning Phoenix", attack: 15 },
    { name: "Water Serpent", attack: 10 },
  ]);
  const [roomId, setRoomId] = useState("");
  const [mode, setMode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [playerImage, setPlayerImage] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);

  // Load leaderboard from local storage
  useEffect(() => {
    const storedScores = JSON.parse(localStorage.getItem("leaderboard")) || [];
    setLeaderboard(storedScores);
  }, []);

  const updateLeaderboard = (result) => {
    const scores = JSON.parse(localStorage.getItem("leaderboard")) || [];
    const existingPlayer = scores.find((p) => p.name === playerName);

    if (existingPlayer) {
      existingPlayer[result] += 1;
    } else {
      scores.push({ name: playerName, wins: result === "wins" ? 1 : 0, losses: result === "losses" ? 1 : 0 });
    }

    localStorage.setItem("leaderboard", JSON.stringify(scores));
    setLeaderboard(scores);
  };

  const createRoom = () => {
    if (!playerName.trim()) {
      alert("Please enter your name before starting.");
      return;
    }
    const newRoomId = uuidv4().slice(0, 6);
    setRoomId(newRoomId);
    socket.emit("create-room", newRoomId);
  };

  const joinGame = () => {
    if (!roomId.trim() || !playerName.trim()) {
      alert("Please enter a Room ID and your name.");
      return;
    }
    socket.emit("join-game", roomId, {
      name: playerName,
      image: playerImage || "/default-avatar.png",
    });
    setGameStarted(true);
  };

  const handleExitToLobby = () => {
    setGameStarted(false);
    setMode("");
    setRoomId("");
  };

  return (
    <div className="game-container">
      <h1>Trading Card Game</h1>

      {!gameStarted ? (
        <div>
          <h2>🏆 Leaderboard</h2>
          <ul>
            {leaderboard.map((player, index) => (
              <li key={index}>
                {player.name} - Wins: {player.wins} | Losses: {player.losses}
              </li>
            ))}
          </ul>

          {!mode && (
            <>
              <button onClick={() => setMode("bot")}>Play vs AI</button>
              <button onClick={() => setMode("multiplayer")}>Play Multiplayer</button>
            </>
          )}

          {mode === "multiplayer" && (
            <div>
              {!roomId ? (
                <button onClick={createRoom}>Create Multiplayer Room</button>
              ) : (
                <p>Room ID: <strong>{roomId}</strong> (Share this with a friend)</p>
              )}

              <input
                type="text"
                placeholder="Enter Your Name"
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
              <input
                type="text"
                placeholder="Enter Room ID to Join"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
              />
              <button onClick={joinGame}>Join Room</button>
            </div>
          )}
        </div>
      ) : (
        <GameBoard playerCards={playerCards} mode={mode} roomId={roomId} updateLeaderboard={updateLeaderboard} onExit={handleExitToLobby} />
      )}

      <CardCreator addCustomCard={(card) => setPlayerCards([...playerCards, card])} />
    </div>
  );
};

export default App;
