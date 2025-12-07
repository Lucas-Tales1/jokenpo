import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Resultado: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const resultado = (location.state as any)?.resultado || "Resultado não disponível";
  const jogador = (location.state as any)?.jogador || "Jogador";
  const perdeu = Boolean((location.state as any)?.perdeu);
  const empate = Boolean((location.state as any)?.empate);

  const handleNovaPartida = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-6 text-center">Resultado</h1>
        
        <div className="mb-6 p-6 bg-[#fdf1f8] rounded-lg">
          <p className="text-2xl font-bold text-[#6e063d]">{resultado}</p>
        </div>

        {perdeu && !empate && (
          <div className="mb-4 p-4 bg-yellow-100 text-yellow-800 rounded">
            <p className="text-sm">Você perdeu a série. Mais sorte na próxima!</p>
          </div>
        )}
        {empate && (
          <div className="mb-4 p-4 bg-blue-100 text-blue-800 rounded">
            <p className="text-sm">Série empatada! Boa partida de ambos.</p>
          </div>
        )}

        <p className="text-[#292931] mb-4">Você jogou como: <strong>{jogador}</strong></p>
        
        <button
          onClick={handleNovaPartida}
          className="w-full bg-[#940852] text-white py-3 rounded hover:bg-[#6e063d] font-semibold"
        >
          Jogar Novamente
        </button>
      </div>
    </div>
  );
};

export default Resultado;
