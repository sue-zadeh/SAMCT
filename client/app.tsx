import { Routes, Route } from "react-router-dom";
import HomePublic from "./components/home-public";
import HomeAdmins from "./components/home-admins";
import HomeResidents from "./components/home-residents";
import Navbar from "./components/navbar";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePublic />} />
        <Route path="/admin" element={<HomeAdmins />} />
        <Route path="/resident" element={<HomeResidents />} />
      </Routes>
    </>
  );
}

export default App;