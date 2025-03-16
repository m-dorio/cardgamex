import { useState, useEffect } from "react";

const GameBoardAI = ({ playerCards, updateLeaderboard, onExit }) => {
  const [playerName, setPlayerName] = useState("");
  const [isNameSet, setIsNameSet] = useState(false);
  const [playerHP, setPlayerHP] = useState(100);
  const [enemyHP, setEnemyHP] = useState(100);
  const [message, setMessage] = useState("Roll the dice to start!");
  const [gameOver, setGameOver] = useState(false);
  const [turn, setTurn] = useState(null);
  const [playerDice, setPlayerDice] = useState(null);
  const [enemyDice, setEnemyDice] = useState(null);
  const [aiSelectedCard, setAiSelectedCard] = useState(null);
  const [isRollingDice, setIsRollingDice] = useState(false);

  const rollDice = () => {
    setIsRollingDice(true);
    const playerRoll = Math.floor(Math.random() * 6) + 1;
    const enemyRoll = Math.floor(Math.random() * 6) + 1;
    setPlayerDice(playerRoll);
    setEnemyDice(enemyRoll);
    setMessage(`🎲 ${playerName} rolled ${playerRoll}, AI rolled ${enemyRoll}`);

    if (playerRoll > enemyRoll) {
      setMessage("🎉 You won the roll! Your turn to attack.");
      setTimeout(() => {
        setTurn("player");
        setIsRollingDice(false);
      }, 0);
    } else if (enemyRoll > playerRoll) {
      setMessage("🤖 AI won the roll! AI is preparing to attack...");
      setTimeout(() => {
        setTurn("enemy");
        setIsRollingDice(false);
      }, 0);
    } else {
      setMessage("🎲 It's a tie! Rolling again...");
      setTimeout(rollDice, 1500);
    }
  };

  useEffect(() => {
    if (!gameOver && turn === null && isNameSet) {
      rollDice();
    }
  }, [gameOver, turn, isNameSet]);

  useEffect(() => {
    if (turn === "enemy" && !gameOver) {
      setTimeout(() => enemyAttack(), 2000);
    }
  }, [turn, gameOver]);

  const handleAttack = (card) => {
    if (gameOver || turn !== "player") return;

    const damage = Math.floor(card.attack * (1 + Math.random() * 0.5));

    setEnemyHP((prev) => {
      const newHP = Math.max(0, prev - damage);

      if (newHP === 0) {
        setGameOver(true);
        setMessage("🎉 You Won! Game Over.");
        updateLeaderboard("wins");
      } else {
        setTimeout(() => {
          setTurn("enemy");
          setMessage("🤖 AI is preparing to attack...");
        }, 0);
      }

      return newHP;
    });
  };

  const enemyAttack = () => {
    if (gameOver || turn !== "enemy") return;

    const randomCard =
      playerCards[Math.floor(Math.random() * playerCards.length)];
    setAiSelectedCard(randomCard.name);

    setTimeout(() => {
      const enemyDamage = Math.floor(
        randomCard.attack * (1 + Math.random() * 0.5)
      );
      setPlayerHP((prev) => {
        const newHP = Math.max(0, prev - enemyDamage);
        if (newHP === 0) {
          setGameOver(true);
          setMessage("💀 You lost! Game Over.");
          updateLeaderboard("losses");
        } else {
          setTimeout(() => {
            setAiSelectedCard(null);
            setTurn("player");
            setMessage("🎉 Your turn to attack!");
          }, 1500);
        }
        return newHP;
      });
    }, 1500);
  };

  const handlePlayAgain = () => {
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

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (playerName.trim() !== "") {
      setIsNameSet(true);
    }
  };

  return (
    <div className="container" 
      style={{
        padding: "16px",
        border: "1px solid #ccc",
        backgroundColor: "#333",
      }}
    >
      {!isNameSet ? (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <h2>Enter Your Name to Start the Battle</h2>
          <form onSubmit={handleNameSubmit}>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Your Name"
              style={{
                padding: "8px",
                margin: "8px",
                borderRadius: "4px",
              }}
              required
            />
            <button
              type="submit"
              style={{
                backgroundColor: "#3182ce",
                color: "white",
                padding: "8px",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Start Battle
            </button>
          </form>
        </div>
      ) : (
        <>
          <h2 style={{ fontSize: "24px", fontWeight: "bold" }}>
            ⚔ AI Battle ⚔
          </h2>
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
              <h3>🔥 {playerName}</h3>
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
                  backgroundColor: turn === "player" ? "#3182ce" : "#333",
                  color: "white",
                  cursor: turn !== "player" || gameOver ? "not-allowed" : "pointer",
                  margin: "8px",
                }}
                disabled={turn !== "player" || gameOver}
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
        </>
      )}
    </div>
  );
};

export default GameBoardAI;
