import { AccessGate } from './security/session'
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
import ProfilePassword from './components/password-profile'
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
import ForgotPassword from './components/password-forgot'
import ResetPassword from './components/password-reset'

function App() {
  return (
    <>
      <AccessGate>
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePublic />} />
          <Route path="/about" element={<About />} />
          <Route path="/contactUs" element={<ContactUs />} />
          <Route path="/marketing" element={<Marketing />} />
          <Route path="/login" element={<Login onLoginSuccess={() => {}} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Resident */}
          <Route path="/resident" element={<HomeResidents />} />
          <Route path="/resident/profile" element={<ProfileResident />} />
          <Route path="/resident/profile/edit" element={<ProfileResidentEdit />} />
          <Route path="/resident/maintenance" element={<ResidentMaintenance />} />
          <Route path="/resident/documents" element={<DocumentsResident />} />
          <Route
            path="/resident/profile/password"
            element={<ProfilePassword userType="resident" backPath="/resident/profile" title="Change Resident Password" />}
          />

          {/* Admin. Keep only ONE route for Village Data. */}
          <Route path="/admin" element={<HomeAdmins />} />
          <Route path="/admin/profile" element={<ProfileAdmin />} />
          <Route path="/admin/profile/edit" element={<ProfileAdminEdit />} />
          <Route path="/admin/people" element={<ManageUsers />} />
          <Route path="/admin/maintenance" element={<MaintenanceAdmin />} />
          <Route path="/admin/documents" element={<DocumentsAdmin />} />
          <Route path="/admin/purchase-orders" element={<PurchaseOrders />} />
          <Route path="/admin/village-properties" element={<AdminVillageProperties />} />
          <Route
            path="/admin/profile/password"
            element={<ProfilePassword userType="admin" backPath="/admin/profile" title="Change Admin Password" />}
          />

          {/* Village Manager. Uses the manager-scoped API in the Village Data component. */}
          <Route path="/village-manager" element={<HomeVillageManager />} />
          <Route path="/village-manager/profile" element={<ProfileVillage />} />
          <Route path="/village-manager/profile/edit" element={<ProfileVillageEdit />} />
          <Route path="/village-manager/village-data" element={<AdminVillageProperties />} />
          <Route path="/village-manager/my-village" element={<MyVillage />} />
          <Route path="/village-manager/maintenance" element={<MaintenanceVillage />} />
          <Route path="/village-manager/residents" element={<ManageUsersVillage />} />
          <Route path="/village-manager/documents" element={<DocumentsVillage />} />
          <Route path="/village-manager/purchase-orders" element={<PurchaseOrders />} />
          <Route
            path="/village-manager/profile/password"
            element={<ProfilePassword userType="villageManager" backPath="/village-manager/profile" title="Change Village Manager Password" />}
          />

          <Route
            path="*"
            element={<main className="container py-5"><h1>Page not found</h1></main>}
          />
        </Routes>
      </AccessGate>
      <Footer />
    </>
  )
}

export default App
