import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { MdPanTool, MdGesture, MdContentCut } from "react-icons/md";
import JogadaButton from "../components/JogadaButton";
import Historico from "../components/Historico";
import { type Jogada, type Partida } from "../types";
import { jogar } from "../services/soapService";
import { getHistorico } from "../services/restService";

const Sala: React.FC = () => {
  const { idSala } = useParams<{ idSala: string }>();
  const location = useLocation();
  const jogador = (location.state as any)?.jogador || "Jogador";

  const [resultado, setResultado] = useState("");
  const [historico, setHistorico] = useState<Partida[]>([]);

  const handleJogada = async (j: Jogada) => {
    if (!idSala) return;
    const res = await jogar(Number(idSala), jogador, j);
    setResultado(res);
    fetchHistorico();
  };

  const fetchHistorico = async () => {
    const res = await getHistorico();
    setHistorico(res);
  };

  useEffect(() => {
    fetchHistorico();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Sala {idSala}</h1>
        <h2 className="text-center mb-4">{jogador}</h2>
        <div className="flex justify-around mb-4">
          <JogadaButton jogada="pedra" onClick={handleJogada} label="Pedra" icon={<MdPanTool size={48} />} />
          <JogadaButton jogada="papel" onClick={handleJogada} label="Papel" icon={<MdGesture size={48} />} />
          <JogadaButton jogada="tesoura" onClick={handleJogada} label="Tesoura" icon={<MdContentCut size={48} />} />
        </div>
        {resultado && <div className="text-center text-lg font-semibold mb-4">{resultado}</div>}
        <Historico historico={historico} />
      </div>
    </div>
  );
};

export default Sala;
