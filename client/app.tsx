import { Routes, Route } from "react-router-dom";
import HomePublic from "./components/home-public";
import HomeAdmins from "./components/home-admins";
import HomeResidents from "./components/home-residents";
import Login from "./components/login";
import Register from "./components/register";
import Navbar from "./components/navbar";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePublic />} />
        <Route path="/admin" element={<HomeAdmins />} />
        <Route path="/resident" element={<HomeResidents />} />
        <Route path="/login" element={<Login onLoginSuccess={() => {}} />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </>
  );
}

export default App;