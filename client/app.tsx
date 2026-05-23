import { Routes, Route } from "react-router-dom";
import HomePublic from "./components/home-public";
import HomeAdmins from "./components/home-admins";
import HomeResidents from "./components/home-residents";
import HomeVillageManager from "./components/home-village-manager";
import Login from "./components/login";
import Register from "./components/register";
import Footer from "./components/footer";

import ProfileAdmin from "./components/profile-admin";
import ProfileAdminEdit from "./components/profile-admin-edit";

import ProfileResident from "./components/profile-resident";
import ProfileResidentEdit from "./components/profile-resident-edit";

import ProfileVillage from "./components/profile-village";
import ProfileVillageEdit from "./components/profile-village-edit";
import {ManagerMaintenance} from "./components/manager-maintenance";
import {ResidentMaintenance} from "./components/resident-maintenance";

import ProfilePassword from "./components/profile-password";

import ManageUsers from "./components/manage-users";
import ManageUsersVillage from "./components/manage-users-village";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePublic />} />
        <Route path="/about" element={<HomePublic />} />
        <Route path="/availability" element={<HomePublic />} />
        <Route path="/contact" element={<HomePublic />} />

        <Route path="/login" element={<Login onLoginSuccess={() => {}} />} />
        <Route path="/register" element={<Register />} />

        <Route path="/resident" element={<HomeResidents />} />
        <Route path="/resident/profile" element={<ProfileResident />} />
        <Route path="/resident/profile/edit" element={<ProfileResidentEdit />} />
        <Route path="/maintenance/request" element={<ManagerMaintenance />} />
        <Route path="/resident/maintenance" element={< ResidentMaintenance/>} />


        <Route
          path="/resident/profile/password"
          element={
            <ProfilePassword
              userType="resident"
              backPath="/resident/profile"
              title="Change Resident Password"
            />
          }
        />

        <Route path="/admin" element={<HomeAdmins />} />
        <Route path="/admin/profile" element={<ProfileAdmin />} />
        <Route path="/admin/profile/edit" element={<ProfileAdminEdit />} />
        <Route
          path="/admin/profile/password"
          element={
            <ProfilePassword
              userType="admin"
              backPath="/admin/profile"
              title="Change Admin Password"
            />
          }
        />
        <Route path="/admin/people" element={<ManageUsers />} />

        <Route path="/village-manager" element={<HomeVillageManager />} />
        <Route path="/village-manager/profile" element={<ProfileVillage />} />
        <Route
          path="/village-manager/profile/edit"
          element={<ProfileVillageEdit />}
        />
        <Route
          path="/village-manager/profile/password"
          element={
            <ProfilePassword
              userType="villageManager"
              backPath="/village-manager/profile"
              title="Change Village Manager Password"
            />
          }
        />
        <Route
          path="/village-manager/residents"
          element={<ManageUsersVillage />}
        />
      </Routes>

      <Footer />
    </>
  );
}

export default App;