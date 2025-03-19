const Leaderboard = () => {
  return (
    <div className="menu">
      <div className="leaderboard-container">
        <h3>🏆 Leaderboard</h3>
        <div className="leaderboard">
          <ol>
            {Array.isArray(leaderboard) &&
              leaderboard
                .slice() // Create a shallow copy of the array
                .reverse() // Reverse the array copy
                .map((player, index) => (
                  <li key={index}>
                    {player.name} - Wins: {player.wins} | Losses:{" "}
                    {player.losses}
                  </li>
                ))}
          </ol>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
