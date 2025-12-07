import { useEffect, useMemo, useRef, useState } from 'react';
import { WsClient } from '../services/wsClient';

type Props = { nome: string };

export default function GlobalChat({ nome }: Props) {
  const client = useMemo(() => new WsClient(), []);
  const [messages, setMessages] = useState<Array<{ nome: string; texto: string }>>([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const joinedRef = useRef(false);

  useEffect(() => {
    client.onMessage((data) => {
      if (data?.type === 'MSG_GLOBAL') {
        setMessages((prev) => [...prev, { nome: data.nome ?? 'anon', texto: data.texto ?? '' }]);
      }
    });
    client.onOpen(() => {
      setConnected(true);
      if (!joinedRef.current) {
        client.joinGlobal(nome);
        joinedRef.current = true;
      }
    });
    client.onClose(() => setConnected(false));
    client.connect();
    return () => client.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nome]);

  const send = () => {
    const texto = input.trim();
    if (!texto || !connected) return;
    client.sendGlobal(nome, texto);
    setInput('');
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') send();
  };

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, position: 'relative', zIndex: 2 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Chat Global</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: connected ? '#16a34a' : '#dc2626', display: 'inline-block' }} />
          <span>{connected ? 'Conectado' : 'Desconectado'}</span>
          <strong>Olá, {nome}</strong>
        </div>
      </div>
      <div style={{ maxHeight: 220, overflowY: 'auto', marginBottom: 8, background: '#fafafa', padding: 8, pointerEvents: 'auto' }}>
        {messages.length === 0 && <div style={{ color: '#888' }}>Nenhuma mensagem ainda. Comece a conversa!</div>}
        {messages.map((m, i) => (
          <div key={i}><strong>{m.nome}:</strong> {m.texto}</div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, pointerEvents: 'auto', position: 'relative', zIndex: 3 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          placeholder="Digite sua mensagem..."
          style={{ flex: 1, padding: 8 }}
          disabled={!connected}
        />
        <button onClick={send} style={{ padding: '8px 12px' }} disabled={!connected}>Enviar</button>
      </div>
    </div>
  );
}
