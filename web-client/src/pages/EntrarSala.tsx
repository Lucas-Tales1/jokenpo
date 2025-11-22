import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { entrarSala } from "../services/soapService";

const EntrarSala: React.FC = () => {
  const [jogador, setJogador] = useState("");
  const [idSala, setIdSala] = useState<number | null>(null);
  const navigate = useNavigate();

  const handleEntrar = async () => {
    if (!jogador.trim() || !idSala) return alert("Preencha todos os campos!");
    const sucesso = await entrarSala(idSala, jogador);
    if (sucesso) navigate(`/sala/${idSala}`, { state: { jogador } });
    else alert("Não foi possível entrar na sala!");
  };

  return (
    <div className="p-4 max-w-md mx-auto mt-20 bg-white rounded shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-center">Entrar na Sala</h1>
      <input
        type="text"
        placeholder="Seu nome"
        value={jogador}
        onChange={(e) => setJogador(e.target.value)}
        className="border p-2 w-full mb-2 rounded"
      />
      <input
        type="number"
        placeholder="ID da sala"
        value={idSala || ""}
        onChange={(e) => setIdSala(Number(e.target.value))}
        className="border p-2 w-full mb-4 rounded"
      />
      <button
        onClick={handleEntrar}
        className="bg-green-500 text-white w-full py-2 rounded hover:bg-green-600"
      >
        Entrar
      </button>
    </div>
  );
};

export default EntrarSala;
