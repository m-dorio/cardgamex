import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import socket from "./socket";
import GameBoard from "./components/GameBoard";
import CardCreator from "./components/CardCreator";
import GameModeSelector from "./components/GameModeSelector";
import Gravatar from "./components/Gravatar";

const App = () => {
  const [roomId, setRoomId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [playerImage, setPlayerImage] = useState(
    "./src/assets/images/avatar_1.png"
  );
   const [inputValue, setInputValue] = useState(""); 
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
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const handleConnect = () => setIsOnline(true);
    const handleDisconnect = () => setIsOnline(false);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, []);

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

  const updateLeaderboard = (playerName, result) => {
    if (!playerName) {
      console.warn("Player name is missing. Cannot update leaderboard.");
      return;
    }

    const scores = JSON.parse(localStorage.getItem("leaderboard")) || [];
    let player = scores.find((p) => p.name === playerName);

    if (player) {
      // Ensure `wins` and `losses` are numbers before updating
      player.wins = player.wins || 0;
      player.losses = player.losses || 0;
      player[result] += 1; // Safely increment 'wins' or 'losses'
    } else {
      // Add a new player record with default values
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

  const handleSetAvatar = () => {
    setPlayerImage(inputValue.trim() || "./src/assets/images/avatar_1.png"); // Use default if empty
  };

  return (
    <main className="game-section">
      <section className="game-container">
        <div className="gameinfo">
          <div className="topcontainer">
            <h1>Card Arena Battle</h1>
            <span
              className={`text-sm font-bold ${
                isOnline ? "text-green-500" : "text-red-500"
              }`}
            >
              Server is
              {isOnline ? " Online 🟢" : " Offline 🔴"}
            </span>
          </div>
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
            <div className="menu">
              <div className="leaderboard-container">
                <h3>🏆 Leaderboard</h3>
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
              </div>
            </div>
          )}
        </div>
        {mode === "multiplayer" && (
          <div className="customcontainer">
            <div className="rooms">
              <div className="createroom">
                <button
                  onClick={createRoom}
                  className="bg-green-500 text-white p-3 rounded-lg"
                >
                  Create New Room
                </button>
              </div>

              <div className="lobbycontainer">
                <input
                  type="text"
                  placeholder="Enter Your Name or Nickname"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  required
                />

                <input
                  type="text"
                  placeholder="Image URL or Gravatar (Optional)"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                
                <button onClick={handleSetAvatar}>Set Avatar</button>
                <Gravatar
                  email={playerImage}
                  size={50}
                  fallback="./src/assets/images/avatar_1.png"
                />
              </div>

              <div className="joinroom">
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
          </div>
        )}
        {mode === "createcard" && (
          <CardCreator
            addCustomCard={(card) => setPlayerCards([...playerCards, card])}
          />
        )}

        {!gameStarted && mode === "bot" && (
          <div className="startbtn">
            <button onClick={() => setGameStarted(true)}>
              Start AI Battle 👹
            </button>
          </div>
        )}
      </section>
      {(gameStarted || mode) && (
        <button
          onClick={() => {
            setGameStarted(false);
            setMode(null);
            setRoomId("");
          }}
          className="bg-gray-500 text-white p-2 rounded-lg mt-4"
        >
          🔙 Back
        </button>
      )}
    </main>
  );
};

export default App;
