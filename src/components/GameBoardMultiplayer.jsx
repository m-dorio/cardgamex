import { useState, useEffect } from "react";
import socket from "../socket";

const GameBoardMultiplayer = ({ playerCards, roomId, updateLeaderboard, onExit }) => {
  const [playerHP, setPlayerHP] = useState(100);
  const [enemyHP, setEnemyHP] = useState(100);
  const [turn, setTurn] = useState(null);
  const [message, setMessage] = useState("");
  const [players, setPlayers] = useState({});
  const [playerId, setPlayerId] = useState(null);
  const [enemyId, setEnemyId] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [scoreboard, setScoreboard] = useState({});

  useEffect(() => {
    socket.on("update-players", (playersData) => {
      setPlayers(playersData);
      setPlayerId(socket.id);
      const ids = Object.keys(playersData);
      if (ids.length === 2) {
        setEnemyId(ids.find((id) => id !== socket.id));
      }
    });

    socket.on("update-scores", (scores) => {
      setScoreboard(scores);
    });

    return () => {
      socket.off("update-players");
      socket.off("update-scores");
    };
  }, [roomId]);

  useEffect(() => {
    socket.on("set-turn", (newTurn) => {
      if (!gameOver) {
        setTurn(newTurn);
      }
    });

    return () => {
      socket.off("set-turn");
    };
  }, [gameOver]);

  useEffect(() => {
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
  }, [gameOver]);

  const handlePlayerAttack = (card) => {
    if (gameOver || turn !== playerId) return;
    const damage = Math.floor(card.attack * (1 + Math.random() * 0.5));
    socket.emit("attack", { roomId, attackerId: socket.id, damage });
  };

  return (
    <div className="p-4 border bg-gray-200">
      <h2 className="text-2xl font-bold">⚔ Multiplayer Battle ⚔</h2>
      <p className="my-4 text-md">{message}</p>

      <div className="flex justify-between">
        <div className="player text-center">
          <h3>🔥 {players[playerId]?.name || "You"}</h3>
          <span>HP: {playerHP}</span>
        </div>
        <div className="opponent text-center">
          <h3>👹 {players[enemyId]?.name || "Waiting for opponent..."}</h3>
          <span>HP: {enemyHP}</span>
        </div>
      </div>

      {!gameOver &&
        playerCards.map((card, index) => (
          <button
            key={index}
            onClick={() => handlePlayerAttack(card)}
            className={`bg-red-500 text-white p-2 rounded ${
              turn !== playerId ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={turn !== playerId}
          >
            Attack with {card.name}
          </button>
        ))}
    </div>
  );
};

export default GameBoardMultiplayer;