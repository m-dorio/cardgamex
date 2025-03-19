import { useState } from "react";
import Gravatar from "./Gravatar";

const CardCreator = ({ addCustomCard }) => {
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [attack, setAttack] = useState("");
  const [description, setDesc] = useState("");
  const [playerImage, setPlayerImage] = useState(
    "./src/assets/images/avatar_1.png"
  );
  const handleCreateCard = () => {
    if (!name || !attack)
      return alert("Please enter a valid name and attack value.");

    const newCard = {
      name,
      attack: parseInt(attack, 10),
    };

    addCustomCard(newCard); // Add card to player deck
    setName(""); // Reset form
    setAttack("");
  };

  return (
    <div className="custom-card-creation p-4 border bg-gray-100">
      <div className="newcard-info">
        <div className="avatar">
          <Gravatar
            email={playerImage}
            size={100}
            fallback="./src/assets/images/avatar_1.png"
          />
        </div>
        <input
          type="text"
          value={name}
          onChange={(e) => setAvatar(e.target.value)}
          placeholder="URL to Avatar"
        />
      </div>

      <aside className="addinfo">
        <div className="header">
          <h1>Create Your Custom Card</h1>
        </div>
        <div className="card-info">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Card Name"
          />
          <input
            type="number"
            value={attack}
            onChange={(e) => setAttack(e.target.value)}
            placeholder="Attack Power"
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Description"
          />

          <button onClick={handleCreateCard}>Add Card</button>
        </div>
      </aside>
    </div>
  );
};

export default CardCreator;
