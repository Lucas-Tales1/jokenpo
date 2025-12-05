import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getHistorico } from "../services/restService";
import ChatGlobal from "../components/ChatGlobal";
import type { Partida } from "../types";

const Inicio: React.FC = () =>{
    const navigate = useNavigate();
    const [historico, setHistorico] = useState<Partida[]>([]);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const carregarHistorico = async () => {
        try {
          const dados = await getHistorico();
          setHistorico(dados);
        } catch (error) {
          console.error("Erro ao carregar histórico:", error);
        } finally {
          setLoading(false);
        }
      };
      carregarHistorico();
    }, []);
  
    const handleNovaPartida = () => {
      navigate("/criar");
    };
  
    const handleEncontrarPartida = () => {
      navigate("/entrar");
    }
  
    const formatarData = (data: string) => {
      return new Date(data).toLocaleString("pt-BR");
    };
  
    return (        
          <div className="p-4 max-w-4xl mx-auto mt-10 bg-white rounded shadow-md">
              <h1 className="text-[#292931] py-3 rounded font-bold text-4xl text-center mb-6">Página Inicial</h1>
              
              <div className="flex flex-col gap-4 mb-8">
                <button
                onClick={handleNovaPartida}
                className="w-full bg-[#940852] text-white py-3 rounded hover:bg-[#6e063d] font-semibold"
                >
                Criar sala
                </button>
                <button
                onClick={handleEncontrarPartida}
                className="w-full bg-[#940852] text-white py-3 rounded hover:bg-[#6e063d] font-semibold"
                >
                Encontrar sala
                </button>
              </div>

              <ChatGlobal />

              <div className="border-t-2 pt-6">
                <h2 className="text-2xl font-bold text-[#292931] mb-4">Histórico de Partidas</h2>
                
                {loading ? (
                  <p className="text-center text-gray-500">Carregando histórico...</p>
                ) : historico.length === 0 ? (
                  <p className="text-center text-gray-500">Nenhuma partida registrada ainda.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-[#940852] text-white">
                          <th className="border border-gray-300 px-4 py-2 text-left">Jogador 1</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Jogador 2</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Vencedor</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Data</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historico.map((partida, index) => (
                          <tr key={index} className="hover:bg-gray-100 transition-colors">
                            <td className="border border-gray-300 px-4 py-2">{partida.jogador1}</td>
                            <td className="border border-gray-300 px-4 py-2">{partida.jogador2}</td>
                            <td className="border border-gray-300 px-4 py-2">
                              {partida.vencedor ? (
                                <span className="font-semibold text-[#940852]">{partida.vencedor}</span>
                              ) : (
                                <span className="text-gray-500">Empate</span>
                              )}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-sm text-gray-600">
                              {formatarData(partida.data)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
          </div>
    );
}

export default Inicio;