import GameBoardAI from "./GameBoardAI";
import GameBoardMultiplayer from "./GameBoardMultiplayer";

const GameBoard = ({ playerCards, mode, ...props }) => {
  return mode === "bot" ? (
    <GameBoardAI playerCards={playerCards} {...props} />
  ) : (
    <GameBoardMultiplayer playerCards={playerCards} {...props} />

  );
};

export default GameBoard;
