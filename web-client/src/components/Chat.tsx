import { useEffect, useMemo, useRef, useState } from 'react';
import { WsClient } from '../services/wsClient';

type Props = { idSala: string; nome: string };

export default function Chat({ idSala, nome }: Props) {
  const [messages, setMessages] = useState<Array<{ nome: string; texto: string }>>([]);
  const [input, setInput] = useState('');
  const client = useMemo(() => new WsClient(), []);
  const joinedRef = useRef(false);

  useEffect(() => {
    client.onMessage((data) => {
      if (data?.type === 'MSG' && data.idSala === idSala) {
        setMessages((prev) => [...prev, { nome: data.nome ?? 'anon', texto: data.texto ?? '' }]);
      }
    });
    client.connect();
    client.onOpen(() => {
      if (!joinedRef.current) {
        client.entrar(idSala, nome);
        joinedRef.current = true;
      }
    });
    return () => client.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idSala, nome]);

  const send = () => {
    if (!input.trim()) return;
    client.enviarMensagem(idSala, nome, input.trim());
    setInput('');
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') send();
  };

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
      <h3>Chat da sala {idSala}</h3>
      <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 8, background: '#fafafa', padding: 8 }}>
        {messages.length === 0 && <div style={{ color: '#888' }}>Nenhuma mensagem ainda.</div>}
        {messages.map((m, i) => (
          <div key={i}><strong>{m.nome}:</strong> {m.texto}</div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          placeholder="Digite sua mensagem"
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={send} style={{ padding: '8px 12px' }}>Enviar</button>
      </div>
    </div>
  );
}
