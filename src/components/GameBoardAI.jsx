import { useState, useEffect } from "react";

const GameBoardAI = ({ playerCards, updateLeaderboard, onExit }) => {
  const [playerName, setPlayerName] = useState("");
  const [isNameSet, setIsNameSet] = useState(false);
  const [playerDice, setPlayerDice] = useState(null);
  const [playerHP, setPlayerHP] = useState(100);
  const [playerDamage, setPlayerDamage] = useState(0);
  const [enemyDice, setEnemyDice] = useState(null);
  const [enemyHP, setEnemyHP] = useState(100);
  const [enemyDamage, setEnemyDamage] = useState(0);
  const [message, setMessage] = useState("Toss a dice to see who goes first!");
  const [gameOver, setGameOver] = useState(false);
  const [turn, setTurn] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [aiSelectedCard, setAiSelectedCard] = useState(null);
  const [rollingDice, setRollingDice] = useState(false);
  const [damage, setDamage] = useState(0);
  const [cardAttack, setCardAttack] = useState(0);
  const [isAttacked, setIsAttacked] = useState(false);

  const rand = (cardAttack) => {
    return Math.round(cardAttack * (1 + Math.random() * 0.5));
  };

  const rollDice = () => {
    if (rollingDice || gameOver) return;

    setRollingDice(true);
    const playerRoll = Math.round(Math.random() * 5) + 1;
    const enemyRoll = Math.round(Math.random() * 5) + 1;

    setPlayerDice(playerRoll);
    setEnemyDice(enemyRoll);
    setMessage(`🎲 ${playerName} rolled ${playerRoll}, AI rolled ${enemyRoll}`);

    setTimeout(() => {
      if (playerRoll > enemyRoll) {
        setMessage("🎉 You won the roll! Your turn to attack.");
        setTurn("player");
      } else if (enemyRoll > playerRoll) {
        setMessage("🤖 AI won the roll! AI is preparing to attack...");
        setTurn("enemy");
      } else {
        setMessage("It's a tie!, ⚔ Rolling the 🎲🎲 again...");
        rollDice();
      }
      setRollingDice(false);
    }, 2000);
  };

  useEffect(() => {
    if (!gameOver && turn === null && isNameSet) {
      setTimeout(() => {
        rollDice();
      }, 3000);
    }
  }, [gameOver, turn, isNameSet]);

  useEffect(() => {
    if (turn === "enemy" && !gameOver) {
      setTimeout(() => enemyAttack(), 2000);
    }
  }, [turn, gameOver]);

  // PLAYER
  const handleAttack = (card) => {
    if (gameOver || turn !== "player") return;
    const attackDamage = card.attack;
    setSelectedCard(card.name);

    if (playerDice <= enemyDice) {
      setMessage("🚫 Your 🎲 roll is too low! Can't attack.");
      rollDice();
      return;
    }
    setSelectedCard(card.name);
    playerCards.map((card, index) => setCardAttack(attackDamage));
    setPlayerDamage(attackDamage);
    setIsAttacked(true);
    setEnemyHP((prev) => {
      const newHP = Math.max(0, prev - attackDamage);

      if (newHP === 0) {
        setTimeout(() => {
          setGameOver(true);
          setMessage("🎉 You Won! Game Over.");
          updateLeaderboard("wins");
        }, 2000);
      } else {
        setTimeout(() => {
          setTurn(null);
          setMessage("🤖 AI is preparing to attack...");
        }, 0);
      }
      return newHP;
    });
  };

  // AI
  const enemyAttack = () => {
    if (gameOver || turn !== "enemy") return; // Ensure AI doesn't attack if it's not its turn
    if (enemyDice <= playerDice) {
      setMessage("🚫 Your 🎲 roll is too low! Can't attack.");
      rollDice();
      return;
    }
    const randomCard =
      playerCards[Math.floor(Math.random() * playerCards.length)];
    setAiSelectedCard(randomCard.name);
    console.log(`AI selected ${randomCard.name} to attack`);

    const attackDamage = randomCard.attack;
    setEnemyDamage(attackDamage);
    setTimeout(() => {
      console.log(`AI deals ${attackDamage} damage.`);
      setPlayerHP((prev) => {
        const newHP = Math.max(0, prev - attackDamage);
        if (newHP === 0) {
          setGameOver(true);
          setMessage("💀 You lost! Game Over.");
          updateLeaderboard("losses");
        } else {
          // Transition back to player's turn after a delay
          setTimeout(() => {
            setAiSelectedCard(null);
            setTurn(null);
            setMessage("Enemy's turn is over.");
          }, 1500);
        }
        return newHP;
      });
    }, 1500);
  };

  const handlePlayAgain = () => {
    setGameOver(false);
    setMessage("Rolling the 🎲🎲");
    setPlayerHP(100);
    setEnemyHP(100);
    setTurn(null);
    setPlayerDice(null);
    setEnemyDice(null);
    setEnemyDamage(0);
    setDamage(0);
    setPlayerDamage(0);
    setAiSelectedCard(null);
    rollDice();
    rand();
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (playerName.trim() !== "") {
      setIsNameSet(true);
    }
  };

  return (
    <div className="container" style={{}}>
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
              Ready ✔
            </button>
          </form>
        </div>
      ) : (
        <>
          <h2 style={{ fontSize: "24px", fontWeight: "bold" }}>
            ⚔ AI Battle ⚔
          </h2>
          <div className="stats" style={{}}>
            <div
              className="opponent opponent-container"
              style={{ textAlign: "center" }}
            >
              <div className="battle-status">
                <h3>🤖 AI Opponent</h3>
                <div className="hp-bar-container">
                  <div
                    className={`hp-bar hp-bar-enemy ${
                      enemyHP < 30 ? "low" : enemyHP < 50 ? "mid" : ""
                    }`}
                    style={{ width: `${enemyHP}%` }}
                  ></div>

                  <span className="hp-text">HP: {enemyHP}</span>
                </div>
              </div>
              <p className="battle-data">
                <span>DMG: {enemyDamage ?? "🔥"}</span>
                <span>Roll: {enemyDice ?? "🎲"}</span>
              </p>
            </div>

            <div className="phase-status">
              <p
                className="tooltip"
                style={{ margin: "16px 0", fontSize: "16px" }}
              >
                <span> {message}</span>
              </p>
              {!gameOver && aiSelectedCard && (
                <>
                  <span
                    className="ai-tooltip"
                    style={{
                      textAlign: "center",
                      color: "#e53e3e",
                      fontWeight: "bold",
                    }}
                  >
                    🤖 AI used {aiSelectedCard}! -{enemyDamage}hp
                  </span>
                </>
              )}
            </div>

            <div
              className="player player-container"
              style={{ textAlign: "center" }}
            >
              <div className="battle-status ">
                <h3>🔥 {playerName}</h3>
                <div className="hp-bar-container">
                  <div
                    className={`hp-bar hp-bar-player ${
                      playerHP < 30 ? "low" : playerHP < 50 ? "mid" : ""
                    }`}
                    style={{ width: `${playerHP}%` }}
                  ></div>

                  <span className="hp-text">HP: {playerHP}</span>
                </div>
              </div>
              <p className="battle-data">
                <span>DMG: {playerDamage}</span>
                <span>Roll: {playerDice ?? "🎲"}</span>
              </p>
            </div>
            {!gameOver && isAttacked && (
              <p style={{ margin: "16px 0", fontSize: "16px" }}>
                <span>
                  Used {selectedCard} ⚔ with {playerDamage ?? "🔥"} damage.
                </span>
              </p>
            )}
          </div>

          <div className="atkbuttons">
            {!gameOver &&
              playerCards.map((card, index) => (
                <button
                  key={index}
                  onClick={() => handleAttack(card)}
                  style={{
                    padding: "8px",
                    borderRadius: "4px",
                    backgroundColor: turn === "player" ? "#3182ce" : "#1a1a1a",
                    color: "white",
                    cursor:
                      turn !== "player" || gameOver ? "not-allowed" : "pointer",
                    margin: "8px",
                  }}
                  disabled={turn !== "player" || rollingDice || gameOver}
                >
                  {card.name} ⚔ [{card.attack}]
                </button>
              ))}
          </div>
          {gameOver && (
            <div className="endbtn">
              <div style={{ marginTop: "0", textAlign: "center" }}>
                <button
                  onClick={handlePlayAgain}
                  style={{
                    backgroundColor: "#3182ce",
                    color: "white",
                    padding: "8px",
                    borderRadius: "4px",
                    marginRight: "8px",
                    width: "160px",
                  }}
                >
                  Play Again?
                </button>
                <button
                  onClick={onExit}
                  style={{
                    backgroundColor: "#044756",
                    color: "white",
                    padding: "8px",
                    borderRadius: "4px",
                  }}
                >
                  Exit
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GameBoardAI;
