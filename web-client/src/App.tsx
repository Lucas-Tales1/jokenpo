// src/App.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { MdContentCut, MdPanTool, MdGesture } from "react-icons/md";

type Jogada = "pedra" | "papel" | "tesoura";

const API_GATEWAY = "http://localhost:3000";

function App() {
  const [sala, setSala] = useState<string>("");
  const [salaCriada, setSalaCriada] = useState(false);
  const [idSala, setIdSala] = useState<number | null>(null);
  const [historico, setHistorico] = useState<string[]>([]);
  const [resultado, setResultado] = useState<string>("");

  // ------------------- REST: Histórico -------------------
  const fetchHistorico = async () => {
    try {
      const res = await axios.get(`${API_GATEWAY}/jogo/historico`);
      setHistorico(res.data.historico || []);
    } catch (err) {
      console.error("Erro ao buscar histórico:", err);
    }
  };

  useEffect(() => {
    fetchHistorico();
  }, []);

  // ------------------- SOAP: Criar Sala -------------------
  const criarSala = async () => {
    if (!sala.trim()) return alert("Digite um nome de sala!");
    try {
      const res = await axios.post(`${API_GATEWAY}/jogo/soap/criar-sala`, { jogador: sala });
      setIdSala(res.data.id);
      setSalaCriada(true);
      setResultado("");
      fetchHistorico();
    } catch (err) {
      console.error("Erro ao criar sala SOAP:", err);
    }
  };

  // ------------------- SOAP: Jogar -------------------
  const jogar = async (jogada: Jogada) => {
    if (!idSala) return alert("Sala não criada!");
    try {
      const res = await axios.post(`${API_GATEWAY}/jogo/soap/jogar`, {
        idSala,
        jogador: sala,
        jogada,
      });
      setResultado(res.data.resultado);
      fetchHistorico();
    } catch (err) {
      console.error("Erro ao jogar SOAP:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      {!salaCriada ? (
        <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold mb-4 text-center">Criar Sala</h1>
          <input
            type="text"
            placeholder="Nome do jogador"
            value={sala}
            onChange={(e) => setSala(e.target.value)}
            className="border rounded p-2 w-full mb-4"
          />
          <button
            onClick={criarSala}
            className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600"
          >
            Criar Sala
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

          {resultado && (
            <div className="text-center text-lg font-semibold mb-4">{resultado}</div>
          )}

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
