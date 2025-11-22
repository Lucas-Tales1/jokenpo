// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CriarSala from "./pages/CriarSala";
import Sala from "./pages/Sala";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CriarSala />} />
        <Route path="/sala/:nomeSala" element={<Sala />} />
      </Routes>
    </Router>
  );
}

export default App;
