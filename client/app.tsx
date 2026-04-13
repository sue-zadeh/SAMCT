import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePublic from "./components/home-public";

import Navbar from "./components/navbar";

function App() {
  return (
    <BrowserRouter>
        <Navbar />
      <Routes>
        <Route path="/" element={<HomePublic />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;