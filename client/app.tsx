import { Routes, Route } from "react-router-dom";
import HomePublic from "./components/home-public";
import HomeAdmins from "./components/home-admins";
import HomeResidents from "./components/home-residents";
import HomeVillageManager from "./components/home-village-manager";
import Login from "./components/login";
import Register from "./components/register";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import ProfileAdmin from "./components/profile-admin";
import ProfileAdminEdit from "./components/profile-admin-edit";
import ProfileAdminPassword from "./components/profile-admin-password";
import ProfileResident from "./components/profile-resident";
import ManageUsers from "./components/manage-users";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePublic />} />
        <Route path="/about" element={<HomePublic />} />
        <Route path="/availability" element={<HomePublic />} />
        <Route path="/contact" element={<HomePublic />} />
        <Route path="/village-manager" element={<HomeVillageManager />} />

        <Route path="/login" element={<Login onLoginSuccess={() => {}} />} />
        <Route path="/register" element={<Register />} />

        <Route path="/resident" element={<HomeResidents />} />
        <Route path="/resident/profile" element={<ProfileResident />} />

        <Route path="/admin" element={<HomeAdmins />} />
        <Route path="/admin/profile" element={<ProfileAdmin />} />
        <Route path="/admin/profile/edit" element={<ProfileAdminEdit />} />
        <Route path="/admin/profile/password" element={<ProfileAdminPassword />} />
        <Route path="/admin/people" element={<ManageUsers />} />
      </Routes>

      <Footer />
    </>
  );
}

export default App;