import React, { useState, useEffect, useRef } from "react";
import { conectarWS, enviarMensagemWS, ouvirMensagensWS } from "../services/socketService";
import { FiSend } from "react-icons/fi";

interface Mensagem {
  nomeJogador: string;
  mensagem: string;
  timestamp: string;
}

const ChatGlobal: React.FC = () => {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [inputMensagem, setInputMensagem] = useState("");
  const [nomeJogador, setNomeJogador] = useState("");
  const [conectado, setConectado] = useState(false);
  const [nomeDigitado, setNomeDigitado] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ws = conectarWS();

    ws.onopen = () => {
      setConectado(true);
      console.log("WS conectado");
      ws.send(JSON.stringify({ tipo: "joinRoom", room: "chat-global" }));
    };

    ws.onclose = () => setConectado(false);

    const remover = ouvirMensagensWS((dados) => {
      if (dados.tipo === "receber_mensagem" && dados.nomeJogador && dados.mensagem) {
        setMensagens((prev) => [...prev, {
          nomeJogador: dados.nomeJogador,
          mensagem: dados.mensagem,
          timestamp: dados.timestamp || new Date().toISOString()
        }]);
      }
    });

    return () => remover();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  const handleSetarNome = () => {
    if (nomeDigitado.trim()) setNomeJogador(nomeDigitado.trim());
  };

  const handleEnviarMensagem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeJogador || !inputMensagem.trim()) return;
    enviarMensagemWS("chat-global", nomeJogador, inputMensagem);
    setInputMensagem("");
  };

  if (!nomeJogador) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold text-[#292931] mb-4">Chat Global</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Defina seu nome"
            value={nomeDigitado}
            onChange={(e) => setNomeDigitado(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSetarNome()}
            className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#940852]"
          />
          <button
            onClick={handleSetarNome}
            className="bg-[#940852] text-white px-6 py-2 rounded hover:bg-[#6e063d] font-semibold"
          >Entrar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-[#292931]">Chat Global</h2>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${conectado ? "bg-green-500" : "bg-red-500"}`}></div>
          <span className="text-sm text-gray-600">{conectado ? "Conectado" : "Desconectado"}</span>
          <span className="text-sm font-semibold text-[#940852] ml-2">Olá, {nomeJogador}</span>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded mb-4 h-64 overflow-y-auto p-4">
        {mensagens.length === 0 ? (
          <p className="text-center text-gray-500 mt-24">Nenhuma mensagem ainda.</p>
        ) : (
          mensagens.map((msg, i) => (
            <div key={i} className={`mb-3 ${msg.nomeJogador === nomeJogador ? "text-right" : "text-left"}`}>
              <div className={`inline-block max-w-xs px-4 py-2 rounded-lg ${msg.nomeJogador === nomeJogador ? "bg-[#940852] text-white rounded-br-none" : "bg-gray-200 text-[#292931] rounded-bl-none"}`}>
                <p className="text-xs font-semibold opacity-75">{msg.nomeJogador}</p>
                <p className="text-sm">{msg.mensagem}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleEnviarMensagem} className="flex gap-2">
        <input
          type="text"
          placeholder="Digite sua mensagem..."
          value={inputMensagem}
          onChange={(e) => setInputMensagem(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#940852]"
          disabled={!conectado}
        />
        <button
          type="submit"
          disabled={!conectado || !inputMensagem.trim()}
          className="bg-[#940852] text-white px-4 py-2 rounded hover:bg-[#6e063d] disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 font-semibold"
        >
          <FiSend size={18} /> Enviar
        </button>
      </form>
    </div>
  );
};

export default ChatGlobal;
