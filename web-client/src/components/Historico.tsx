import React from "react";
import { type Partida } from "../types";

interface Props {
  historico: Partida[];
}

const Historico: React.FC<Props> = ({ historico }) => (
  <div className="border-t pt-2">
    <h2 className="font-bold mb-2">Histórico:</h2>
    <ul className="text-sm max-h-40 overflow-auto">
      {historico.map((h, i) => (
        <li key={i}>
          {h.jogador} jogou {h.jogada} em {new Date(h.data).toLocaleString()}
        </li>
      ))}
    </ul>
  </div>
);

export default Historico;
