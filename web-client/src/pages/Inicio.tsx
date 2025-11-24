import React from "react";
import { useNavigate } from "react-router-dom";

const Inicio: React.FC = () =>{
    const navigate = useNavigate();
  
  
    const handleNovaPartida = () => {
      navigate("/criar");
    };
  
    const handleEncontrarPartida = () => {
      navigate("/entrar");
    }
  
    return (        
          <div className="p-4 max-w-md mx-auto mt-20 bg-white rounded shadow-md flex flex-col gap-5 items-center">
              <h1 className="text-[#292931] py-3 rounded font-bold text-4xl">Página Inicial</h1>
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
    );
}

export default Inicio;