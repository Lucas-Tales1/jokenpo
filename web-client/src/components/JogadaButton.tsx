import React from "react";
import { type Jogada } from "../types";

interface Props {
  jogada: Jogada;
  onClick: (j: Jogada) => void;
  label: string;
  icon: React.ReactNode;
}

const JogadaButton: React.FC<Props> = ({ jogada, onClick, label, icon }) => (
  <button
    onClick={() => onClick(jogada)}
    className="flex flex-col items-center bg-gray-200 p-2 rounded hover:bg-gray-300"
  >
    {icon}
    {label}
  </button>
);

export default JogadaButton;
