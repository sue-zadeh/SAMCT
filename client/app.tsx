import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePublic from "./components/home-public";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePublic />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;