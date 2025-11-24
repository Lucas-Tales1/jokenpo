import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Resultado: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const resultado = (location.state as any)?.resultado || "Resultado não disponível";
  const idSala = (location.state as any)?.idSala || null;
  const jogador = (location.state as any)?.jogador || "Jogador";

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
