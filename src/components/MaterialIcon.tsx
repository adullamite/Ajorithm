import React from "react";

interface MaterialIconProps {
  name: string;
  className?: string;
  size?: number;
  filled?: boolean;
}

const MaterialIcon: React.FC<MaterialIconProps> = ({
  name,
  className = "",
  size = 24,
  filled = false,
}) => {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' ${size}`,
      }}
    >
      {name}
    </span>
  );
};

export default MaterialIcon;
