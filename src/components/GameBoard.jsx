<<<<<<< HEAD
import GameBoardAI from "./GameBoardAI";
import GameBoardMultiplayer from "./GameBoardMultiplayer";

const GameBoard = ({ playerCards, mode, ...props }) => {
  return mode === "bot" ? (
    <GameBoardAI playerCards={playerCards} {...props} />
  ) : (
    <GameBoardMultiplayer playerCards={playerCards} {...props} />
=======
import { useState, useEffect } from "react";
import socket from "../socket";

const GameBoard = ({ playerCards, mode, roomId, updateLeaderboard, onExit }) => {
  const [playerHP, setPlayerHP] = useState(100);
  const [enemyHP, setEnemyHP] = useState(100);
  const [turn, setTurn] = useState(null);
  const [message, setMessage] = useState("");
  const [players, setPlayers] = useState({});
  const [playerId, setPlayerId] = useState(null);
  const [enemyId, setEnemyId] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [scoreboard, setScoreboard] = useState({});

  useEffect(() => {
    if (mode === "multiplayer") {
      socket.on("update-players", (playersData) => {
        setPlayers(playersData);
        setPlayerId(socket.id);

        const ids = Object.keys(playersData);
        if (ids.length === 2) {
          const enemy = ids.find((id) => id !== socket.id);
          setEnemyId(enemy);
        }
      });

      socket.on("player-ready-update", (updatedPlayers) => {
        setPlayers(updatedPlayers);
      });

      socket.on("update-scores", (scores) => {
        console.log("🔄 Updating Scoreboard:", scores);
        setScoreboard(scores);
      });

      return () => {
        socket.off("update-players");
        socket.off("player-ready-update");
        socket.off("update-scores");
      };
    }
  }, [mode, roomId]);

  useEffect(() => {
    if (mode === "multiplayer") {
      socket.on("dice-roll-result", ({ turn, diceRolls }) => {
        setMessage("🎲 Rolling the dice...");
        setTimeout(() => {
          setTurn(turn);
          setGameStarted(true);
          setMessage(`🎲 You (${diceRolls[playerId] || "?"}) vs Opponent (${diceRolls[enemyId] || "?"})`);
        }, 2000);
      });

      return () => {
        socket.off("dice-roll-result");
      };
    }
  }, [mode, roomId, enemyId]);

  useEffect(() => {
    if (mode === "multiplayer") {
      socket.on("set-turn", (newTurn) => {
        if (!gameOver) {
          setTurn(newTurn);
          setGameStarted(true);
        }
      });

      return () => {
        socket.off("set-turn");
      };
    }
  }, [mode, roomId, gameOver]);

  useEffect(() => {
    if (mode === "multiplayer") {
      socket.on("receive-attack", ({ damage }) => {
        setPlayerHP((prevHP) => {
          const newHP = Math.max(0, prevHP - damage);
          if (newHP === 0) {
            setGameOver(true);
            updateLeaderboard("losses");
            socket.emit("game-over", { roomId, winnerId: enemyId, loserId: playerId });
            setMessage("💀 You lost! Game Over.");
          }
          return newHP;
        });
      });

      socket.on("enemy-damaged", ({ damage }) => {
        setEnemyHP((prevHP) => {
          const newHP = Math.max(0, prevHP - damage);
          if (newHP === 0) {
            setGameOver(true);
            updateLeaderboard("wins");
            socket.emit("game-over", { roomId, winnerId: playerId, loserId: enemyId });
            setMessage("🎉 You Won! Game Over.");
          }
          return newHP;
        });
      });

      return () => {
        socket.off("receive-attack");
        socket.off("enemy-damaged");
      };
    }
  }, [mode, roomId]);

  const handleReady = () => {
    socket.emit("player-ready", roomId);
  };

  const handlePlayerAttack = (card) => {
    if (gameOver || turn !== playerId) return;

    const damage = Math.floor(card.attack * (1 + Math.random() * 0.5));

    if (mode === "multiplayer" && roomId) {
      socket.emit("attack", { roomId, attackerId: socket.id, damage });
    }
  };

  const handlePlayAgain = () => {
    setGameOver(false);
    setMessage("");
    setPlayerHP(100);
    setEnemyHP(100);
    setGameStarted(false);
    setTurn(null);

    socket.emit("request-play-again", roomId);
  };

  const handleExitRoom = () => {
    if (mode === "multiplayer") {
      socket.emit("leave-room", roomId);
    }
    onExit();
  };

  return (
    <div className="p-4 border bg-gray-200">
      <div className="roominfo">
        <h2 className="text-2xl font-bold">⚔ Battle Arena Phase ⚔</h2>
        <span className="text-xl font-bold">Room ID: {roomId}</span>
      </div>
      <div className="flex justify-between">
        <div className="player text-center">
          <h3>🔥 {players[playerId]?.name || "You"}</h3>
          <span>HP: {playerHP}</span>
        </div>
        <div className="phase">
          <p className="my-4 text-lg font-bold">
            <span>Status:</span>
            {!gameStarted
              ? players[playerId]?.ready
                ? "✅ I'm Ready (Waiting for opponent)"
                : "⏳ Waiting for the other player to get ready..."
              : gameOver
              ? ""
              : turn === playerId
              ? "🔥 Your Turn! Choose an attack."
              : "⏳ Waiting for opponent's attack..."}
          </p>
        </div>
        <div className="opponent text-center">
          <h3>👹 {players[enemyId]?.name || "Waiting for opponent..."}</h3>
          <span>HP: {enemyHP}</span>
        </div>
      </div>

      {!gameStarted && players[playerId] && players[enemyId] && (
        <button onClick={handleReady} className="bg-yellow-500 text-white p-3 rounded">
          {players[playerId]?.ready ? "✅ I'm Ready" : "✔ Ready"}
        </button>
      )}

      {gameStarted && !gameOver &&
        playerCards.map((card, index) => (
          <button key={index} onClick={() => handlePlayerAttack(card)} 
            className={`bg-red-500 text-white p-2 rounded ${
              turn !== playerId ? "opacity-50 cursor-not-allowed" : ""
            }`} 
            disabled={turn !== playerId}>
            Attack with {card.name}
          </button>
        ))}

      {message && <p className="my-4 text-md">{message}</p>}

      {/* ✅ Scoreboard Section */}
      {gameOver && (
        <div className="mt-4 text-center">
          <h3 className="text-xl font-bold">🏆 Scoreboard</h3>
          <p>{players[playerId]?.name || "You"}: Wins: {scoreboard[playerId]?.wins || 0}, Losses: {scoreboard[playerId]?.losses || 0}</p>
          <p>{players[enemyId]?.name || "Opponent"}: Wins: {scoreboard[enemyId]?.wins || 0}, Losses: {scoreboard[enemyId]?.losses || 0}</p>

          <button onClick={handlePlayAgain} className="bg-blue-500 text-white p-2 rounded">Play Again?</button>
          <button onClick={handleExitRoom} className="bg-red-500 text-white p-2 rounded ml-2">Exit Room</button>
        </div>
      )}
    </div>
>>>>>>> bb73d670d9c3c43d0c28b3fe0fa2cff4b8cefcce
  );
};

export default GameBoard;
