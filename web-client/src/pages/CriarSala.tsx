import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { criarSala } from "../services/soapService";

const CriarSala: React.FC = () => {
  const [jogador, setJogador] = useState("");
  const navigate = useNavigate();

  const handleCriar = async () => {
    if (!jogador.trim()) return alert("Digite seu nome!");
    const idSala = await criarSala(jogador);
    navigate(`/sala/${idSala}`, { state: { jogador } });
  };

  return (
    <div className="p-4 max-w-md mx-auto mt-20 bg-white rounded shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-center">Criar Sala</h1>
      <input
        type="text"
        placeholder="Seu nome"
        value={jogador}
        onChange={(e) => setJogador(e.target.value)}
        className="border p-2 w-full mb-4 rounded"
      />
      <button
        onClick={handleCriar}
        className="bg-[#940852] text-white w-full py-2 rounded hover:bg-[#6e063d]"
      >
        Criar Sala
      </button>
    </div>
  );
};

export default CriarSala;
