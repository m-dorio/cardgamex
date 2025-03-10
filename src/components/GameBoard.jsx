import { useState, useEffect, useCallback } from "react";
import socket from "../socket";

const GameBoard = ({ playerCards, mode, roomId }) => {
  const [playerHP, setPlayerHP] = useState(100);
  const [enemyHP, setEnemyHP] = useState(100);
  const [turn, setTurn] = useState("player");
  const [message, setMessage] = useState("");

  // ✅ Refactored Attack Function
  const handlePlayerAttack = useCallback((card) => {
    if (turn !== "player") return;

    const damage = card.attack;
    setEnemyHP((prev) => Math.max(0, prev - damage));
    setMessage(`You attacked with ${card.name} for ${damage} damage!`);

    setTurn("enemy"); // Switch turn

    if (mode === "multiplayer" && roomId) {
      socket.emit("attack", { roomId, attackerId: socket.id, damage });
    } else {
      setTimeout(() => handleEnemyAttack(), 1500);
    }
  }, [turn, mode, roomId]);

  const handleEnemyAttack = useCallback(() => {
    if (enemyHP <= 0) {
      setMessage("🎉 You won!");
      return;
    }

    const damage = Math.floor(Math.random() * 15) + 5;
    setPlayerHP((prev) => Math.max(0, prev - damage));
    setMessage(`Enemy attacked for ${damage} damage!`);

    if (playerHP - damage <= 0) {
      setMessage("💀 You lost!");
    } else {
      setTurn("player");
    }
  }, [enemyHP, playerHP]);

  // ✅ Listen for attack events in Multiplayer Mode
  useEffect(() => {
    if (mode === "multiplayer") {
      socket.on("receive-attack", (damage) => {
        setPlayerHP((prev) => Math.max(0, prev - damage));
        setMessage(`Opponent attacked for ${damage} damage!`);
        setTurn("player");
      });
    }

    return () => {
      socket.off("receive-attack"); // Cleanup event listener
    };
  }, [mode]);

  return (
    <div className="p-4 border bg-gray-200 text-center">
      <h2 className="text-2xl font-bold">⚔ Battle Arena ⚔</h2>
      <div className="flex justify-between">
        <h3>🔥 Player HP: {playerHP}</h3>
        <h3>👹 Enemy HP: {enemyHP}</h3>
      </div>
      <p className="my-4">{message}</p>
      
      {turn === "player" && playerCards.map((card, index) => (
        <button key={index} onClick={() => handlePlayerAttack(card)} className="bg-red-500 text-white p-2 rounded">
          Attack with {card.name}
        </button>
      ))}
    </div>
  );
};

export default GameBoard;
