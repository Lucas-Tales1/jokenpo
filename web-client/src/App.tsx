// src/App.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { MdContentCut, MdPanTool, MdGesture } from "react-icons/md";

type Jogada = "pedra" | "papel" | "tesoura";

const API_GATEWAY = "http://localhost:3000";

function App() {
  const [sala, setSala] = useState<string>("");
  const [salaCriada, setSalaCriada] = useState(false);
  const [historico, setHistorico] = useState<string[]>([]);
  const [resultado, setResultado] = useState<string>("");

  const criarSala = () => {
    if (sala.trim() === "") {
      alert("Digite um nome de sala!");
      return;
    }
    setSalaCriada(true);
    fetchHistorico();
  };

  const fetchHistorico = async () => {
    try {
      const res = await axios.get(`${API_GATEWAY}/jogo/historico`);
      setHistorico(res.data.historico || []);
    } catch (err) {
      console.error("Erro ao buscar histórico:", err);
    }
  };

  const jogar = async (jogada: Jogada) => {
    try {
      const res = await axios.post(`${API_GATEWAY}/jogo/jogar`, { jogada });
      if (res.data.resultado) {
        setResultado(res.data.resultado);
        fetchHistorico();
      }
    } catch (err) {
      console.error("Erro ao jogar:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      {!salaCriada ? (
        <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold mb-4 text-center">Criar Sala</h1>
          <input
            type="text"
            placeholder="Nome da sala"
            value={sala}
            onChange={(e) => setSala(e.target.value)}
            className="border rounded p-2 w-full mb-4"
          />
          <button
            onClick={criarSala}
            className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600"
          >
            Criar
          </button>
        </div>
      ) : (
        <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold mb-4 text-center">Sala: {sala}</h1>
          <div className="flex justify-around mb-4">
            <button onClick={() => jogar("pedra")} className="flex flex-col items-center">
              <MdPanTool size={48} />
              Pedra
            </button>
            <button onClick={() => jogar("papel")} className="flex flex-col items-center">
              <MdGesture size={48} />
              Papel
            </button>
            <button onClick={() => jogar("tesoura")} className="flex flex-col items-center">
              <MdContentCut size={48} />
              Tesoura
            </button>
          </div>

          {resultado && <div className="text-center text-lg font-semibold mb-4">{resultado}</div>}

          <div className="border-t pt-2">
            <h2 className="font-bold mb-2">Histórico:</h2>
            <ul className="text-sm max-h-40 overflow-auto">
              {historico.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
