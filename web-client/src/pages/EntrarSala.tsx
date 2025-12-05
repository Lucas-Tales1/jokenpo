import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { entrarSala, listarSalasAbertas } from "../services/soapService";
import { FiRefreshCw } from "react-icons/fi";

interface Sala {
  id: number;
  jogador1: string;
  status: string;
}

const EntrarSala: React.FC = () => {
  const [jogador, setJogador] = useState("");
  const [salas, setSalas] = useState<Sala[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const carregarSalas = async () => {
    setLoading(true);
    try {
      const salasAbertas = await listarSalasAbertas();
      setSalas(salasAbertas);
    } catch (error) {
      console.error("Erro ao carregar salas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarSalas();
  }, []);

  const handleEntrarSala = async (idSala: number) => {
    if (!jogador.trim()) {
      alert("Por favor, digite seu nome!");
      return;
    }

    try {
      const sucesso = await entrarSala(idSala, jogador);
      if (sucesso) {
        navigate(`/sala/${idSala}`, { state: { jogador } });
      } else {
        alert("Não foi possível entrar na sala. A sala pode estar cheia ou não existe!");
        carregarSalas();
      }
    } catch (error) {
      console.error("Erro ao entrar na sala:", error);
      alert("Erro ao conectar. Tente novamente!");
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto mt-10">
      {/* Seção de nome do jogador */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-3xl font-bold text-[#292931] mb-4 text-center">Encontrar Sala</h1>
        
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            placeholder="Digite seu nome para entrar em uma sala"
            value={jogador}
            onChange={(e) => setJogador(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && carregarSalas()}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#940852] text-gray-800"
          />
          <button
            onClick={carregarSalas}
            disabled={loading}
            className="bg-[#940852] text-white px-6 py-3 rounded-lg hover:bg-[#6e063d] disabled:bg-gray-400 font-semibold flex items-center gap-2 transition-colors"
          >
            <FiRefreshCw size={20} />
            Atualizar
          </button>
        </div>
      </div>

      {/* Grid de salas */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500 text-lg">Carregando salas abertas...</p>
        </div>
      ) : salas.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500 text-xl mb-4">Nenhuma sala aberta no momento.</p>
          <p className="text-gray-400">Por que não cria uma nova sala?</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {salas.map((sala) => (
            <div
              key={sala.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="bg-linear-to-r from-[#940852] to-[#6e063d] p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">Sala #{sala.id}</h2>
                  <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {sala.status}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm opacity-75">Jogador 1</p>
                    <p className="text-lg font-semibold">{sala.jogador1}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-75">Aguardando</p>
                    <p className="text-lg font-semibold">Segundo jogador</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {jogador ? (
                  <button
                    onClick={() => handleEntrarSala(sala.id)}
                    className="w-full bg-[#940852] text-white py-3 rounded-lg hover:bg-[#6e063d] font-semibold transition-colors"
                  >
                    Entrar como {jogador}
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full bg-gray-300 text-gray-500 py-3 rounded-lg font-semibold cursor-not-allowed"
                  >
                    Digite seu nome acima
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EntrarSala;
