import { useState, useEffect } from "react";
import socket from "../socket";
import Gravatar from "./Gravatar";

const GameBoardMultiplayer = ({
  playerCards,
  roomId,
  updateLeaderboard,
  onExit,
}) => {
    const [playerImage, setPlayerImage] = useState(
    "./src/assets/images/avatar_1.png"
  );
  const [otherPlayerImage, setOtherPlayerImage] = useState(
    "./src/assets/images/avatar_1.png"
  );
  const [playerHP, setPlayerHP] = useState(100);
  const [playerDamage, setPlayerDamage] = useState(0);
  const [enemyHP, setEnemyHP] = useState(100);
  const [enemyDamage, setEnemyDamage] = useState(0);
  const [turn, setTurn] = useState(null);
  const [message, setMessage] = useState("");
  const [players, setPlayers] = useState({});
  const [playerId, setPlayerId] = useState(null);
  const [enemyId, setEnemyId] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [scoreboard, setScoreboard] = useState({});
  const [rollingDice, setRollingDice] = useState(false);
  const [diceResult, setDiceResult] = useState(null);
  const [damage, setDamage] = useState(0);
  useEffect(() => {
    socket.on("update-players", (playersData) => {
      setPlayers(playersData);
      setPlayerId(socket.id);
      const ids = Object.keys(playersData);
      if (ids.length === 2) {
        setEnemyId(ids.find((id) => id !== socket.id));
      }
    });

    socket.on("player-ready-update", setPlayers);
    socket.on("update-scores", setScoreboard);

    return () => {
      socket.off("update-players");
      socket.off("player-ready-update");
      socket.off("update-scores");
    };
  }, [roomId]);

  useEffect(() => {
    socket.on("dice-roll-result", ({ turn, diceRolls }) => {
      setMessage("🎲 Rolling the dice...");
      setTimeout(() => {
        setTurn(turn);
        setGameStarted(true);
        setMessage(
          `🎲 You (${diceRolls[playerId] || "?"}) vs Opponent (${
            diceRolls[enemyId] || "?"
          })`
        );
      }, 2000);
    });

    return () => socket.off("dice-roll-result");
  }, [roomId, playerId, enemyId]);

  useEffect(() => {
    socket.on("set-turn", (newTurn) => {
      if (!gameOver) {
        setTurn(newTurn);
        setGameStarted(true);
      }
    });

    return () => socket.off("set-turn");
  }, [roomId, gameOver]);

  useEffect(() => {
    socket.on("receive-attack", ({ damage }) => {
      setPlayerHP((prevHP) => {
        const newHP = Math.max(0, prevHP - damage);
        if (newHP === 0) {
          setMessage("💀 You lost! Game Over.");
          setGameOver(true);
          updateLeaderboard("losses");
          socket.emit("game-over", {
            roomId,
            winnerId: enemyId,
            loserId: playerId,
          });
        }
        return newHP;
      });
    });

    socket.on("enemy-damaged", ({ damage }) => {
      setEnemyHP((prevHP) => {
        const newHP = Math.max(0, prevHP - damage);
        if (newHP === 0) {
          setMessage("🎉 You Won! Game Over.");
          setGameOver(true);
          updateLeaderboard("wins");
          socket.emit("game-over", {
            roomId,
            winnerId: playerId,
            loserId: enemyId,
          });
        }
        return newHP;
      });
    });

    return () => {
      socket.off("receive-attack");
      socket.off("enemy-damaged");
    };
  }, [roomId, playerId, enemyId]);

  const handleReady = () => socket.emit("player-ready", roomId);

  const handleRollDice = () => {
    if (rollingDice || gameOver) return;
    setRollingDice(true);
    setMessage("🎲 Rolling the dice...");

    setTimeout(() => {
      const diceRoll = Math.floor(Math.random() * 6) + 1;
      setDiceResult(diceRoll);
      setRollingDice(false);

      if (diceRoll >= 4) {
        setMessage(`🎲 You rolled a ${diceRoll}!`);
      } else {
        setMessage(`🎲 You rolled a ${diceRoll}.`);
        socket.emit("set-turn", enemyId);
      }
    }, 2000);
  };

  const handlePlayerAttack = (card) => {
    if (players[playerId]) {
      if (gameOver || turn !== playerId || rollingDice) return;
      const damage = Math.floor(card.attack * (1 + Math.random() * 0.5));
      socket.emit("attack", { roomId, attackerId: socket.id, damage });
      setPlayerDamage(damage + diceResult);
      // setTimeout(handleRollDice, 1000);
    } else if (players[enemyId]) {
      if (gameOver || turn !== playerId || rollingDice) return;
      const damage = Math.floor(card.attack * (1 + Math.random() * 0.5));
      socket.emit("attack", { roomId, attackerId: socket.id, damage });
      setEnemyDamage(damage + diceResult);
      // setTimeout(handleRollDice, 1000);
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
    socket.emit("leave-room", roomId);
    onExit();
  };

    const handleSetAvatar = () => {
    setPlayerImage(inputValue.trim() || "./src/assets/images/avatar_1.png"); // Use default if empty
  };


  return (
    <div className="p-4 border bg-gray-200">
      <div className="roominfo">
        <h2 className="text-2xl font-bold">⚔ Battle Arena Phase ⚔</h2>
        <span className="text-xl font-bold">Room ID: {roomId}</span>
      </div>
      <div className="flex justify-between">
        <div className="player">
          <div className="attributes">
            <span className="phealth">HP: {playerHP}</span>
            <span className="pdamage">
              -{enemyDamage}HP + {diceResult} dmg
            </span>
          </div>
          <h4>🔥 {players[playerId]?.name || "You"}</h4>
          </div>
          <div className="profile">
            <Gravatar
            email={playerImage}
            size={100}
            fallback="./src/assets/images/avatar_1.png"
          />
        </div>
        <div className="phase">
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
        </div>
        <div className="opponent">
          <div className="profile">
             <Gravatar
            email={otherPlayerImage}
            size={50}
            fallback="./src/assets/images/avatar_1.png"
          />
          <h4>👹 {players[enemyId]?.name || "Waiting for opponent..."}</h4>
         </div>
          <div className="attributes">
             <span className="ophealth">HP: {enemyHP}</span>
          <span className="opdamage">
            -{playerDamage}HP + {diceResult} dmg
          </span>
         </div>
        </div>
      </div>

      {!gameStarted && players[playerId] && players[enemyId] && (
        <button
          onClick={handleReady}
          className="bg-yellow-500 text-white p-3 rounded"
        >
          {players[playerId]?.ready ? "✅ I'm Ready" : "✔ Ready"}
        </button>
      )}

      <div className="atkbuttons">
        {gameStarted &&
          !gameOver &&
          playerCards.map((card, index) => (
            <button
              key={index}
              onClick={() => handlePlayerAttack(card)}
              style={{
                padding: "8px",
                borderRadius: "4px",
                backgroundColor: turn !== playerId ? "#1a1a1a" : "#3182ce",
                color: "white",
                cursor:
                  turn !== playerId || gameOver ? "not-allowed" : "pointer",
                margin: "8px",
              }}
              disabled={gameOver || turn !== playerId || rollingDice}
              className={`p-3 rounded ${
                gameOver || turn !== playerId || rollingDice
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-500 text-white"
              }`}
            >
              Use {card.name} ⚔
            </button>
          ))}
      </div>

      {message && <p className="my-4 text-md">{message}</p>}

      {gameStarted && !gameOver && (
        <button
          onClick={handleRollDice}
          disabled={rollingDice || gameOver || turn !== playerId}
          className={`p-3 rounded ${
            rollingDice || gameOver || turn !== playerId
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 text-white"
          }`}
        >
          Roll Dice
        </button>
      )}

      {gameOver && (
        <div className="mt-4 text-center">
          <h3 className="text-xl font-bold">🏆 Scoreboard</h3>
          <p>
            {players[playerId]?.name || "You"}: Wins:{" "}
            {scoreboard[playerId]?.wins || 0}, Losses:{" "}
            {scoreboard[playerId]?.losses || 0}
          </p>
          <p>
            {players[enemyId]?.name || "Opponent"}: Wins:{" "}
            {scoreboard[enemyId]?.wins || 0}, Losses:{" "}
            {scoreboard[enemyId]?.losses || 0}
          </p>

          <div className="endbtn">
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
              onClick={handleExitRoom}
              style={{
                backgroundColor: "#044756",
                color: "white",
                padding: "8px",
                borderRadius: "4px",
              }}
            >
              Exit Room
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameBoardMultiplayer;
