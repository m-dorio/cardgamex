import React, { useState } from "react";
import md5 from "md5";

const Gravatar = ({ email, size = 100, fallback = "./src/assets/images/avatar_1.png" }) => {
  const [imgSrc, setImgSrc] = useState(() => {
    const emailHash = md5(email.trim().toLowerCase());
    return `https://www.gravatar.com/avatar/${emailHash}?s=${size}&d=404`; // d=404 makes it return a 
  });

  return (
    <img
      src={imgSrc}
      alt="Gravatar"
      width={size}
      height={size}
      onError={() => setImgSrc(fallback)} 
    />
  );
};

export default Gravatar;
