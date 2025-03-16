import { useState } from "react";
import Gravatar from "./Gravatar";

const CardCreator = ({ addCustomCard }) => {
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [attack, setAttack] = useState("");

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
    <div className="custom-card p-4 border bg-gray-100">
      <Gravatar
        email="michaelangelo.dorio@gmail.com"
        size={100}
        fallback="./src/assets/images/avatar_1.png"
      />
      <span>Create Your Custom Card</span>
      <input
        type="text"
        value={name}
        onChange={(e) => setAvatar(e.target.value)}
        placeholder="URL to Avatar"
      />
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
      <button onClick={handleCreateCard}>Add Card</button>
    </div>
  );
};

export default CardCreator;
