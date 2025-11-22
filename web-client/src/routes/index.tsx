import React from "react";
import { Routes, Route } from "react-router-dom";
import CriarSala from "../pages/CriarSala";
import EntrarSala from "../pages/EntrarSala";
import Sala from "../pages/Sala";

const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/" element={<CriarSala />} />
    <Route path="/entrar" element={<EntrarSala />} />
    <Route path="/sala/:idSala" element={<Sala />} />
  </Routes>
);

export default AppRoutes;
