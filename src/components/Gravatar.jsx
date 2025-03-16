import React, { useState } from "react";
import md5 from "md5";

const Gravatar = ({ email, size = 50, fallback }) => {
  const emailHash =
    email.includes("@") && email.includes(".")
      ? md5(email.trim().toLowerCase())
      : null;
  const gravatarUrl = emailHash
    ? `https://www.gravatar.com/avatar/${emailHash}?s=${size}&d=404`
    : email; // Use input as a direct URL if not an email

  const [imgSrc, setImgSrc] = useState(gravatarUrl);

  // Reload on input change
  React.useEffect(() => {
    setImgSrc(gravatarUrl);
  }, [gravatarUrl]);

  return (
     <img
      key={imgSrc} // Force re-render
      src={imgSrc}
      alt="Player Avatar"
      width={size}
      height={size}
      onError={() => setImgSrc(fallback)} // Fallback on error
    />
  );
};

export default Gravatar;
