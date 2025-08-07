import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/Login';
import PrivateRoute from './components/PrivateRoute';
import CreateClient from './pages/CreateClient';
import GetClients from './pages/GetClient';
import Register from './pages/Register';
import AssignLead from './pages/AssignLead';
import UserList from './pages/UserList';
import AdminRoute from './components/AdminRoute';
import SalesReportForm from './pages/SalesReportForm';
import SalesReports from './pages/SalesReports';
import EditUsers from './pages/EditUsers';


function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            <LoginPage />
          }
        />
        {/* Protected Layout with Sidebar */}

          <Route element={<PrivateRoute />}>
            {/* <Route path="/" element={<DashboardLayout>
              <Dashboard />
            </DashboardLayout>} /> */}
            
            
            <Route path="/" element={<DashboardLayout>
              <GetClients />
            </DashboardLayout>} />
            <Route path="/createreport" element={<DashboardLayout>
              <SalesReportForm />
            </DashboardLayout>} />
            <Route path="/getreport" element={<DashboardLayout>
              <SalesReports />
            </DashboardLayout>} />
          </Route>




          <Route element={<AdminRoute />}>
          <Route path="/createClient" element={<DashboardLayout>
              <CreateClient />
          </DashboardLayout>} />
          <Route path="/editUsers" element={<DashboardLayout>
              <EditUsers />
          </DashboardLayout>} />
          <Route path="/getUsers" element={<DashboardLayout>
              <UserList />
            </DashboardLayout>} />
            <Route path="/assignLead" element={<DashboardLayout>
              <AssignLead />
            </DashboardLayout>} />
             <Route path="/register" element={<DashboardLayout>
              <Register />
            </DashboardLayout>} />
        </Route>


      </Routes>
    </Router>
  );
}

export default App;

