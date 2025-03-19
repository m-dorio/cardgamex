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
  const [message, setMessage] = useState("Roll the dice to start!");
  const [gameOver, setGameOver] = useState(false);
  const [turn, setTurn] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [aiSelectedCard, setAiSelectedCard] = useState(null);
  const [rollingDice, setRollingDice] = useState(false);
  const [damage, setDamage] = useState(0);
  const [cardAttack, setCardAttack] = useState(0);
  const playerRoll = Math.floor(Math.random() * 6) + 1;
  const enemyRoll = Math.floor(Math.random() * 6) + 1;

  const rand = () => {
    setDamage(Math.floor(cardAttack * (1 + Math.random() * 0.5)));
  };

  const rollDice = () => {
    if (rollingDice || gameOver) return;

    setRollingDice(true);

    setPlayerDice(playerRoll);

    setEnemyDice(enemyRoll);
    setMessage(`🎲 ${playerName} rolled ${playerRoll}, AI rolled ${enemyRoll}`);

    setTimeout(() => {
      if (playerRoll > enemyRoll) {
        setMessage("🎉 You won the roll! Your turn to attack.");
        setTimeout(() => {
          setTurn("player");
        }, 0);
      } else if (enemyRoll > playerRoll) {
        setMessage("🤖 AI won the roll! AI is preparing to attack...");
        setTimeout(() => {
          setTurn("enemy");
        }, 0);
      } else {
        setMessage("🎲 It's a tie! Rolling again...");
        setTimeout(rollDice, 1500);
      }
      setRollingDice(false);
    }, 2000);
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
    if (playerDice <= enemyDice) {
      setMessage("🚫 Your dice roll is too low! Can't attack.");
      return;
    }
    setSelectedCard(card.name);
    playerCards.map((card, index) => setCardAttack(card.attack));
    setPlayerDamage(damage);
    setEnemyHP((prev) => {
      const newHP = Math.max(0, prev - damage);

      if (newHP === 0) {
        setGameOver(true);
        setMessage("🎉 You Won! Game Over.");
        updateLeaderboard("wins");
      } else {
        setTimeout(() => {
          rand();
          setTurn(null);
          setMessage("🤖 AI is preparing to attack...");
        }, 1500);
      }

      return newHP;
    });
  };

  const enemyAttack = (card) => {
    if (enemyDice <= playerDice) {
      setMessage("🤖 AI's dice roll is too low! AI can't attack.");
      setTurn("player");
      return;
    }

    const randomCard =
      playerCards[Math.floor(Math.random() * playerCards.length)];
    setAiSelectedCard(randomCard.name);
    playerCards.map((card, index) => setCardAttack(card.attack));
    setEnemyDamage(damage);
    setPlayerHP((prev) => {
      const newHP = Math.max(0, prev - damage);

      if (newHP === 0) {
        setGameOver(true);
        setMessage("💀 You lost! Game Over.");
        updateLeaderboard("losses");
      } else {
        setTimeout(() => {
          rand();
          setAiSelectedCard(null);
          setTurn(null);
          setMessage("🎉 Your turn to attack!");
          rollDice();
        }, 1500);
      }

      return newHP;
    });
  };

  const handlePlayAgain = () => {
    setGameOver(false);
    setMessage("Roll the dice to start!");
    setPlayerHP(100);
    setEnemyHP(100);
    setTurn(null);
    setPlayerDice(0);
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
            <div className="opponent" style={{ textAlign: "center" }}>
              <div className="battle-status">
                <h3>🤖 AI Opponent</h3>
                <span>HP: {enemyHP}</span>
              </div>
              <p className="battle-data">
                <span>
                  DMG: {enemyDamage} + bonus {enemyDice} dmg
                </span>
                <span>Dice: {enemyDice}</span>
              </p>
            </div>
            <p style={{ margin: "16px 0", fontSize: "16px" }}>
              <span>Total Damage {damage + enemyDice}</span>
            </p>

            <div className="phase-status">
              <p style={{ margin: "16px 0", fontSize: "16px" }}>{message}</p>

              {!gameOver && aiSelectedCard && (
                <>
                  <span
                    style={{
                      textAlign: "center",
                      color: "#e53e3e",
                      fontWeight: "bold",
                    }}
                  >
                    🤖 AI used {aiSelectedCard}!
                  </span>
                </>
              )}
            </div>

            <div className="player" style={{ textAlign: "center" }}>
              <div className="battle-status">
                <h3>🔥 {playerName}</h3>
                <span> HP: {playerHP}</span>
              </div>
              <p className="battle-data">
                <span>
                  DMG: {damage} + bonus {playerDice} dmg
                </span>
                <span> Dice: {playerDice ?? "?"}</span>
              </p>
            </div>
            <p style={{ margin: "16px 0", fontSize: "16px" }}>
              <span>
                Used {selectedCard} ⚔ with {damage}, bonus dmg of: {playerDice}{" "}
                and
              </span>
              <span> Total Damage {damage + playerDice}</span>
            </p>
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
