// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CriarSala from "./pages/CriarSala";
import Sala from "./pages/Sala";
import EntrarSala from "./pages/EntrarSala";
import Resultado from "./pages/Resultado";
import Inicio from "./pages/Inicio";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/criar" element={<CriarSala />} />
        <Route path="/entrar" element={<EntrarSala/>} />
        <Route path="/sala/:idSala" element={<Sala />} />
        <Route path="/resultado" element={<Resultado />} />
      </Routes>
    </Router>
  );
}

export default App;
