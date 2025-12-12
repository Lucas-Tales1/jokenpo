# Jokenpô 

Sistema distribuído de um jogo de pedra, papel e tesoura desenvolvido como projeto acadêmico da disciplina de **Desenvolvimento de Sistemas Distribuídos**.

---

## 📋 Visão Geral

Jokenpô é uma aplicação que implementa um jogo de pedra, papel e tesoura (jokenpô) em uma arquitetura de sistemas distribuídos com múltiplos serviços e comunicações via REST e SOAP.

**Tecnologias principais:**
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **API Gateway**: Node.js + Express + WebSocket
- **REST Service**: Django + Python
- **SOAP Service**: Java + Jakarta XML-WS

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                    Web Client (React)                    │
│              (http://localhost:5173)                     │
└────────────────────┬────────────────────────────────────┘
                     │  HTTP + WebSocket
┌────────────────────▼────────────────────────────────────┐
│           API Gateway (Node.js/Express + WS)             │
│              (http://localhost:3000)                     │
│              (ws://localhost:3000/chat)                  │
└────────────┬────────────────────────────┬────────────────┘
             │                            │
     ┌───────▼────────┐          ┌────────▼──────────┐
     │  REST Service  │          │   SOAP Service    │
     │   Django/Py    │          │   Java/XML-WS     │
     │ :8000/api      │          │ :8080/soap        │
     └────────────────┘          └───────────────────┘
                
```

---

## 📁 Estrutura do Projeto

```
jokenpo/
├── web-client/           # Frontend React + TypeScript
│   ├── src/
│   │   ├── components/   # Componentes React
│   │   ├── pages/        # Páginas da aplicação
│   │   ├── services/     # Integração com APIs
│   │   └── types/        # Tipos TypeScript
│   └── package.json
│
├── api-gateway/          # Gateway de API + WebSocket (Node.js)
│   ├── index.js          # Servidor Node
│   ├── services/         # Clientes REST e SOAP
│   └── package.json
│
├── rest_service/         # Serviço REST (Django)
│   ├── historico/        # App Django com modelos
│   │   ├── models.py     # Modelo Partida
│   │   ├── views.py      # Endpoints REST
│   │   └── urls.py       # Rotas
│   ├── manage.py
│   └── db.sqlite3        # Banco de dados
│
└── soap-service/         # Serviço SOAP (Java)
    ├── src/main/java/com/jokenpo/
    │   ├── JokenpoService.java
    │   ├── JokenpoServiceImpl.java
    │   ├── JokenpoServer.java
    │   └── Main.java
    └── pom.xml
```

---

## 🚀 Quick Start

### Pré-requisitos
- **Node.js** v16+ (para api-gateway e web-client)
- **Python** 3.8+ (para rest_service)
- **Java** 11+ (para soap-service)
- **Maven** (para compilar soap-service)

### Instalação e Execução

#### 1️⃣ **REST Service** (Django - porta 8000)
```bash
cd rest_service
pip install -r requirements.txt  
python manage.py migrate
python manage.py runserver 8000
```

#### 2️⃣ **SOAP Service** (Java - porta 8080)
```bash
cd soap-service
mvn clean compile exec:java
```

#### 3️⃣ **API Gateway** (Node.js - porta 3000 + WebSocket)
```bash
cd api-gateway
npm install
node index.js
```

#### 4️⃣ **Web Client** (React - porta 5173)
```bash
cd web-client
npm install
npm run dev
```

**Acesse a aplicação em:** `http://localhost:5173`

---

## 📡 Serviços

### REST Service (Django)
- **Porta**: 8000
- **Função**: Gerenciar histórico de partidas e persistência de dados
- **Modelo Principal**: `Partida` (jogador1, jogador2, vencedor, data)
- **Endpoints**:
  - `GET /api/historico/` - Listar partidas
  - `POST /api/historico/` - Criar nova partida
  - `GET /api/historico/<id>/` - Obter detalhes da partida

### SOAP Service (Java)
- **Porta**: 8080
- **Função**: Lógica principal do jogo (validar jogadas, determinar vencedor)
- **Serviços**:
  - `JokenpoService` - Interface WSDL
  - `JokenpoServiceImpl` - Implementação
  - `Sala` - Gerenciar salas de jogo

### API Gateway (Node)
- **Porta**: 3000
- **Função**: Intermediar requisições entre cliente e serviços backend
- **Recursos**:
  - Roteamento para REST e SOAP
  - CORS habilitado
  - Segurança com Helmet
  - Expõe WebSocket

### Web Client (React)
- **Porta**: 5173 (desenvolvimento) / Build: `dist/`
- **Função**: Interface de usuário interativa
- **Features**:
  - Criação e entrada em salas
  - Histórico de partidas
  - Interface 

---

## 📨 Fila de mensagens (RabbitMQ)

- **Função**: troca de eventos entre serviços (notificações de partidas, chat, resultados).
- **Implementação**: produtor/cliente em Java ([soap-service/src/main/java/com/jokenpo/rabbitmq/EventPublisher.java](soap-service/src/main/java/com/jokenpo/rabbitmq/EventPublisher.java#L1), [soap-service/src/main/java/com/jokenpo/rabbitmq/RabbitMQClient.java](soap-service/src/main/java/com/jokenpo/rabbitmq/RabbitMQClient.java#L1)) e consumidor em Python ([rest_service/historico/consumer.py](rest_service/historico/consumer.py#L1)).
- **Observação**: o API Gateway e os serviços publicam eventos em filas/exchanges; consumidores processam eventos para atualizar o histórico e sincronizar o estado das salas.

---

## 🛠️ Comandos Úteis

| Serviço | Comando |
|---------|---------|
| REST Service | `python manage.py runserver 8000` |
| SOAP Service | `mvn clean compile exec:java` |
| API Gateway | `node index.js` |
| Web Client (dev) | `npm run dev` |

---

## 👨‍💻 Desenvolvido por

Lucas Tales, Manoel Pinto e Marcos Alexandre - Disciplina de Desenvolvimento de Sistemas Distribuídos

---
