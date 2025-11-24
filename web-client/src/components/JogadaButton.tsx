import React from "react";
import { type Jogada } from "../types";

interface Props {
  jogada: Jogada;
  onClick: (j: Jogada) => void;
  label: string;
  icon: React.ReactNode;
  disabled?: boolean;
}

const JogadaButton: React.FC<Props> = ({ jogada, onClick, label, icon, disabled = false }) => {
  const handleClick = () => {
    console.log(`Botão clicado: ${jogada}`);
    if (!disabled) {
      onClick(jogada);
    }
  };
  
  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`flex flex-col items-center p-2 rounded transition ${
        disabled
          ? "bg-gray-300 text-gray-500 cursor-not-allowed opacity-50"
          : "bg-gray-200 hover:bg-gray-300 cursor-pointer"
      }`}
    >
      {icon}
      {label}
    </button>
  );
};

export default JogadaButton;
