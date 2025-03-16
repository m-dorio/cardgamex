import { useState, useEffect } from "react";

const GameBoardAI = ({ playerCards, updateLeaderboard, onExit }) => {
  const [playerHP, setPlayerHP] = useState(100);
  const [enemyHP, setEnemyHP] = useState(100);
  const [message, setMessage] = useState("Roll the dice to start!");
  const [gameOver, setGameOver] = useState(false);
  const [turn, setTurn] = useState(null);
  const [playerDice, setPlayerDice] = useState(null);
  const [enemyDice, setEnemyDice] = useState(null);
  const [aiSelectedCard, setAiSelectedCard] = useState(null);

  const rollDice = () => {
    console.log("Rolling dice...");
    const playerRoll = Math.floor(Math.random() * 6) + 1;
    const enemyRoll = Math.floor(Math.random() * 6) + 1;
    setPlayerDice(playerRoll);
    setEnemyDice(enemyRoll);
    setMessage(`🎲 You rolled ${playerRoll}, AI rolled ${enemyRoll}`);

    if (playerRoll > enemyRoll) {
      setMessage("🎉 You won the roll! Your turn to attack.");
      console.log("Player won the roll!");
      setTimeout(() => {
        setTurn("player");
        console.log("Turn is now Player.");
      }, 0);
    } else if (enemyRoll > playerRoll) {
      setMessage("🤖 AI won the roll! AI is preparing to attack...");
      console.log("AI won the roll!");
      setTimeout(() => {
        setTurn("enemy");
        console.log("Turn is now Enemy.");
      }, 0);
    } else {
      setMessage("🎲 It's a tie! Rolling again...");
      console.log("It's a tie, re-rolling...");
      setTimeout(rollDice, 1500);
    }
  };

  useEffect(() => {
    if (!gameOver && turn === null) {
      console.log("Starting the game...");
      rollDice(); // Start the game if not over and turn is not yet set
    }
  }, [gameOver, turn]);

  useEffect(() => {
    if (turn === "enemy" && !gameOver) {
      console.log("AI's turn...");
      setTimeout(() => enemyAttack(), 2000);
    }
  }, [turn, gameOver]); // Combine both dependencies into a single useEffect

  const handleAttack = (card) => {
    if (gameOver || turn !== "player") return; // Only allow if it's the player's turn

    setMessage(`Player is attacking with ${card.name}`); // Update message correctly

    const damage = Math.floor(card.attack * (1 + Math.random() * 0.5)); // Calculate damage
    setEnemyHP((prev) => {
      const newHP = Math.max(0, prev - damage); // Subtract damage from enemy HP

      if (newHP === 0) {
        setGameOver(true); // Game over if enemy HP is 0
        setMessage("🎉 You Won! Game Over."); // Player wins
        updateLeaderboard("wins");
      } else {
        setTimeout(() => {
          console.log("AI's turn after player attack.");

          setTurn("enemy"); // Switch turn to enemy after attack
          setMessage("🤖 AI is preparing to attack...");
        }, 1500);
      }
      return newHP;
    });
  };

  const enemyAttack = () => {
    if (gameOver || turn !== "enemy") return; // Ensure AI doesn't attack if it's not its turn

    console.log("AI is attacking...");
    const randomCard =
      playerCards[Math.floor(Math.random() * playerCards.length)];
    setAiSelectedCard(randomCard.name);
    console.log(`AI selected ${randomCard.name} to attack`);

    setTimeout(() => {
      const enemyDamage = Math.floor(
        randomCard.attack * (1 + Math.random() * 0.5)
      );
      console.log(`AI deals ${enemyDamage} damage.`);
      setPlayerHP((prev) => {
        const newHP = Math.max(0, prev - enemyDamage);
        if (newHP === 0) {
          setGameOver(true);
          setMessage("💀 You lost! Game Over.");
          updateLeaderboard("losses");
        } else {
          // Transition back to player's turn after a delay
          setTimeout(() => {
            setAiSelectedCard(null);
            setTurn("player"); // Set the turn to player after AI attack
            setMessage("🎉 Your turn to attack!");
          }, 1500);
        }
        return newHP;
      });
    }, 1500);
  };

  const handlePlayAgain = () => {
    console.log("Resetting game...");
    setGameOver(false);
    setMessage("Roll the dice to start!");
    setPlayerHP(100);
    setEnemyHP(100);
    setTurn(null);
    setPlayerDice(null);
    setEnemyDice(null);
    setAiSelectedCard(null);
    rollDice();
  };

  return (
    <div
      style={{
        padding: "16px",
        border: "1px solid #ccc",
        backgroundColor: "#333",
      }}
    >
      <h2 style={{ fontSize: "24px", fontWeight: "bold" }}>⚔ AI Battle ⚔</h2>
      <p style={{ margin: "16px 0", fontSize: "16px" }}>{message}</p>
      {!gameOver && aiSelectedCard && (
        <span
          style={{ textAlign: "center", color: "#e53e3e", fontWeight: "bold" }}
        >
          🤖 AI used {aiSelectedCard}!
        </span>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "16px",
        }}
      >
        <div className="player" style={{ textAlign: "center" }}>
          <h3>🔥 You</h3>
          <span>HP: {playerHP}</span>
          <p>Dice: {playerDice ?? "?"}</p>
        </div>
        <div className="opponent" style={{ textAlign: "center" }}>
          <h3>🤖 AI Opponent</h3>
          <span>HP: {enemyHP}</span>
          <p>Dice: {enemyDice ?? "?"}</p>
        </div>
      </div>

      {!gameOver &&
        playerCards.map((card, index) => (
          <button
            key={index}
            onClick={() => handleAttack(card)}
            style={{
              padding: "8px",
              borderRadius: "4px",
              backgroundColor:
                turn === "enemy" && aiSelectedCard === card.name
                  ? "#e53e3e" // red-700
                  : turn === "player"
                  ? "#3182ce" // red-500
                  : "#333", // gray-500
              color: "white",
              cursor:
                turn !== "player" || gameOver || playerHP === 0 || enemyHP === 0
                  ? "not-allowed"
                  : "pointer",
              margin: "8px",
            }}
            disabled={
              turn !== "player" || gameOver || playerHP === 0 || enemyHP === 0
            }
          >
            Attack with {card.name}
          </button>
        ))}

      {gameOver && (
        <div style={{ marginTop: "16px", textAlign: "center" }}>
          <button
            onClick={handlePlayAgain}
            style={{
              backgroundColor: "#3182ce",
              color: "white",
              padding: "8px",
              borderRadius: "4px",
              marginRight: "8px",
            }}
          >
            Play Again?
          </button>
          <button
            onClick={onExit}
            style={{
              backgroundColor: "#e53e3e",
              color: "white",
              padding: "8px",
              borderRadius: "4px",
            }}
          >
            Exit
          </button>
        </div>
      )}
    </div>
  );
};

export default GameBoardAI;
