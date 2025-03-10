import { useState, useEffect } from "react";
import socket from "../socket";

const GameBoard = ({ playerCards, mode, roomId }) => {
  const [playerHP, setPlayerHP] = useState(100);
  const [enemyHP, setEnemyHP] = useState(100);
  const [turn, setTurn] = useState("player");
  const [message, setMessage] = useState("");
  const [players, setPlayers] = useState({});
  const [playerId, setPlayerId] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [playAgainVotes, setPlayAgainVotes] = useState(0); // Count "Play Again" votes

  useEffect(() => {
    if (mode === "multiplayer") {
      socket.on("update-players", (playersData) => {
        setPlayers(playersData);
        setPlayerId(socket.id);
      });

      socket.on("receive-attack", (damage) => {
        setPlayerHP((prev) => {
          const newHP = Math.max(0, prev - damage);
          if (newHP === 0) {
            setGameOver(true);
            setMessage("💀 You lost! Game Over.");
          }
          return newHP;
        });
        setTurn("player");
      });

      socket.on("play-again-vote", (voteCount) => {
        setPlayAgainVotes(voteCount);
        if (voteCount >= 2) resetGame(); // Reset only if both players vote
      });

      socket.on("player-left", () => {
        setMessage("Your opponent has left the room.");
        setGameOver(true);
      });
    }

    return () => {
      socket.off("update-players");
      socket.off("receive-attack");
      socket.off("play-again-vote");
      socket.off("player-left");
    };
  }, [mode]);

  const handlePlayerAttack = (card) => {
    if (gameOver || turn !== "player") return;
    if (!enemy) {
      setMessage("Waiting for an opponent...");
      return;
    }

    const damage = card.attack;
    setEnemyHP((prev) => {
      const newHP = Math.max(0, prev - damage);
      if (newHP === 0) {
        setGameOver(true);
        setMessage("🎉 You won! Game Over.");
      }
      return newHP;
    });
    setTurn("enemy");

    if (mode === "multiplayer" && roomId) {
      socket.emit("attack", { roomId, attackerId: socket.id, damage });
    } else {
      setTimeout(handleEnemyAttack, 1500);
    }
  };

  const handleEnemyAttack = () => {
    if (enemyHP <= 0 || gameOver) return;

    const damage = Math.floor(Math.random() * 15) + 5;
    setPlayerHP((prev) => {
      const newHP = Math.max(0, prev - damage);
      if (newHP === 0) {
        setGameOver(true);
        setMessage("💀 You lost! Game Over.");
      }
      return newHP;
    });

    setTurn("player");
  };

  // Vote to Play Again
  const handlePlayAgain = () => {
    socket.emit("vote-play-again", roomId);
  };

  // Reset Game State (only when both players vote)
  const resetGame = () => {
    setPlayerHP(100);
    setEnemyHP(100);
    setTurn("player");
    setMessage("");
    setGameOver(false);
    setPlayAgainVotes(0);
  };

  // Player Leaves Room
  const handleExitRoom = () => {
    socket.emit("leave-room", roomId);
    setMessage("You left the game.");
    setGameOver(true);
  };

  // Assign Player & Enemy
  const player = players[playerId] || { name: "You", image: "/default-avatar.png" };
  const enemyId = Object.keys(players).find(id => id !== playerId);
  const enemy = players[enemyId] || null;

  return (
    <div className="p-4 border bg-gray-200 text-center">
      <h2 className="text-2xl font-bold">⚔ Battle Arena ⚔</h2>

      <div className="flex justify-between">
        <div>
          <img src={player.image} alt="Player" className="w-16 h-16 rounded-full" />
          <h3>🔥 {player.name} (HP: {playerHP})</h3>
        </div>
        {enemy ? (
          <div>
            <img src={enemy.image} alt="Enemy" className="w-16 h-16 rounded-full" />
            <h3>👹 {enemy.name} (HP: {enemyHP})</h3>
          </div>
        ) : (
          <p className="text-gray-500">Waiting for an opponent...</p>
        )}
      </div>

      <p className="my-4 text-lg font-bold">{message}</p>

      {/* Disable attack buttons when the game is over */}
      {turn === "player" && enemy && !gameOver &&
        playerCards.map((card, index) => (
          <button key={index} onClick={() => handlePlayerAttack(card)} className="bg-red-500 text-white p-2 rounded">
            Attack with {card.name}
          </button>
        ))}

      {/* Play Again & Exit Buttons (Only show when game is over) */}
      {gameOver && (
        <div className="mt-4">
          <button onClick={handlePlayAgain} className="bg-blue-500 text-white p-2 rounded">
            Play Again? ({playAgainVotes}/2)
          </button>
          <button onClick={handleExitRoom} className="bg-red-500 text-white p-2 rounded ml-2">
            Exit Room
          </button>
        </div>
      )}
    </div>
  );
};

export default GameBoard;
