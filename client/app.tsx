import { Routes, Route } from 'react-router-dom'

import HomePublic from './components/home-public'
import HomeAdmins from './components/home-admins'
import HomeResidents from './components/home-residents'
import HomeVillageManager from './components/home-village-manager'
import ContactUs from './components/contactus'
import Marketing from './components/marketing'
import About from './components/about'

import Login from './components/login'
import Register from './components/register'
import Footer from './components/footer'

import ProfileAdmin from './components/profile-admin'
import ProfileAdminEdit from './components/profile-admin-edit'

import ProfileResident from './components/profile-resident'
import ProfileResidentEdit from './components/profile-resident-edit'

import ProfileVillage from './components/profile-village'
import ProfileVillageEdit from './components/profile-village-edit'

import ProfilePassword from './components/profile-password'
import PurchaseOrders from './components/purchase-orders'

import ManageUsers from './components/manage-users'
import ManageUsersVillage from './components/manage-users-village'

import ResidentMaintenance from './components/maintenance-resident'
import MaintenanceVillage from './components/maintenance-village'

import DocumentsVillage from './components/documents-village'
import DocumentsResident from './components/documents-resident'
import DocumentsAdmin from './components/documents-admin'
import MaintenanceAdmin from './components/maintenance-admin'
import AdminVillageProperties from './components/admin-village-properties'

import MyVillage from './components/my-village'
// forgot password
import ForgotPassword from "./components/forgot-password";
import ResetPassword from "./components/reset-password";

function App() {
  return (
    <>
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<HomePublic />} />
        <Route path="/about" element={<About />} />
        {/* <Route path="/availability" element={<HomePublic />} /> */}
        <Route path="/contactUs" element={<ContactUs />} />
        <Route path="/marketing" element={<Marketing />} />

        {/* Auth */}
        <Route path="/login" element={<Login onLoginSuccess={() => {}} />} />
        <Route path="/register" element={<Register />} />

        {/* Resident */}
        <Route path="/resident" element={<HomeResidents />} />
        <Route path="/resident/profile" element={<ProfileResident />} />
        <Route
          path="/resident/profile/edit"
          element={<ProfileResidentEdit />}
        />
        <Route path="/resident/maintenance" element={<ResidentMaintenance />} />

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

        <Route
          path="/village-manager/purchase-orders"
          element={<PurchaseOrders />}
        />
        {/* Admin */}
        <Route path="/admin" element={<HomeAdmins />} />
        <Route path="/admin/profile" element={<ProfileAdmin />} />
        <Route path="/admin/profile/edit" element={<ProfileAdminEdit />} />
        <Route path="/admin/people" element={<ManageUsers />} />
        <Route path="/admin/maintenance" element={<MaintenanceAdmin />} />
        <Route path="/admin/documents" element={<DocumentsAdmin />} />
        <Route path="/admin/purchase-orders" element={<PurchaseOrders />} />

        <Route path="/resident/documents" element={<DocumentsResident />} />

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
        <Route
          path="/admin/village-properties"
          element={<AdminVillageProperties />}
        />

        {/* Village Manager */}
        <Route path="/village-manager" element={<HomeVillageManager />} />
        <Route path="/village-manager/profile" element={<ProfileVillage />} />
        <Route
          path="/village-manager/profile/edit"
          element={<ProfileVillageEdit />}
        />
        <Route
          path="/village-manager/documents"
          element={<DocumentsVillage />}
        />

        <Route path="/village-manager/my-village" element={<MyVillage />} />

        <Route
          path="/village-manager/residents"
          element={<ManageUsersVillage />}
        />
        <Route
          path="/village-manager/maintenance"
          element={<MaintenanceVillage />}
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
          {/* forgot password */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>

      <Footer />
    </>
  )
}

export default App
