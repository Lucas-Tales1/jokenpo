import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";

import { GiPaper, GiRock, GiScissors } from "react-icons/gi";

import JogadaButton from "../components/JogadaButton";
import { type Jogada } from "../types";
import { jogar } from "../services/soapService";

const Sala: React.FC = () => {
  const { idSala } = useParams<{ idSala: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const jogador = (location.state as any)?.jogador || "Jogador";

  const [resultado, setResultado] = useState("");
  const [jogadaRealizada, setJogadaRealizada] = useState(false);
  const [partidaFinalizada, setPartidaFinalizada] = useState(false);

  const handleJogada = async (j: Jogada) => {
    console.log("handleJogada chamada com:", j);
    if (!idSala) {
      console.log("Aviso: idSala não definido");
      return;
    }
    
    if (jogadaRealizada) {
      setResultado("Você já fez sua jogada! Aguarde o outro jogador.");
      return;
    }

    try {
      console.log(`Enviando jogada: ${j} para a sala ${idSala} como ${jogador}`);
      const res = await jogar(Number(idSala), jogador, j);
      console.log(`Resultado recebido: ${res}`);
      
      // Marca que este jogador já fez sua jogada
      setJogadaRealizada(true);
      
      // Verifica se a partida já acabou
      if (res && !res.toLowerCase().includes("aguardando")) {
        setPartidaFinalizada(true);
      }
      
      setResultado(res);
    } catch (error) {
      console.error('Erro ao enviar jogada:', error);
      setResultado('Erro ao enviar a jogada. Tente novamente.');
    }
  };

  useEffect(() => {
  }, []);


  useEffect(() => {
    if (partidaFinalizada && resultado && !resultado.toLowerCase().includes("aguardando")) {
      const timer = setTimeout(() => {
        navigate("/resultado", { 
          state: { resultado, idSala, jogador } 
        });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [partidaFinalizada, resultado, idSala, jogador, navigate]);

  // Polling para verificar resultado periodicamente (enquanto aguarda o outro jogador)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    // Se o jogador já jogou mas a partida não terminou, fica verificando
    if (jogadaRealizada && !partidaFinalizada && resultado.toLowerCase().includes("aguardando")) {
      interval = setInterval(async () => {
        try {
          const res = await jogar(Number(idSala), jogador, "check");
          console.log("Resultado do polling:", res);
          
          // Se o resultado mudou para "ganhou" ou "empate", atualiza o estado
          if (res && !res.toLowerCase().includes("aguardando")) {
            setResultado(res);
            setPartidaFinalizada(true);

            if (interval) clearInterval(interval);
            interval = null;
          }
        } catch (error) {
          console.log("Erro ao verificar resultado (esperado):", error);
        }
      }, 1000); // Verifica a cada 1 segundo
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [jogadaRealizada, partidaFinalizada, resultado, idSala, jogador]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Sala {idSala}</h1>
        <h2 className="text-center mb-4">{jogador}</h2>
        
        {/* Botões de jogada*/}
        <div className="flex justify-around mb-4">
          <JogadaButton 
            jogada="pedra" 
            onClick={handleJogada} 
            label="Pedra" 
            icon={<GiRock size={48} />}
            disabled={jogadaRealizada}
          />
          <JogadaButton 
            jogada="papel" 
            onClick={handleJogada} 
            label="Papel" 
            icon={<GiPaper size={48} />}
            disabled={jogadaRealizada}
          />
          <JogadaButton 
            jogada="tesoura" 
            onClick={handleJogada} 
            label="Tesoura" 
            icon={<GiScissors size={48} />}
            disabled={jogadaRealizada}
          />
        </div>

        {/* Mensagem de resultado */}
        {resultado && !resultado.toLowerCase().includes("aguardando") && (
          <div className="text-center text-[#292931] mb-4 p-4 bg-[#fdf1f8] rounded">
            <div className="text-lg font-semibold">{resultado}</div>
          </div>
        )}

        {/* Se já jogou mas está aguardando o outro, mostra mensagem */}
        {jogadaRealizada && resultado && resultado.toLowerCase().includes("aguardando") && (
          <div className="text-center p-4 bg-[#D6CEB5] rounded mb-4">
            <p className="text-sm text-[#292931]">Aguardando a jogada do outro jogador...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sala;
