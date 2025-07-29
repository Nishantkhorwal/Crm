import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/Login';
import PrivateRoute from './components/PrivateRoute';
import CreateClient from './pages/CreateClient';
import GetClients from './pages/GetClient';


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
            <Route path="/createClient" element={<DashboardLayout>
              <CreateClient />
            </DashboardLayout>} />
            <Route path="/" element={<DashboardLayout>
              <GetClients />
            </DashboardLayout>} />
          </Route>


      </Routes>
    </Router>
  );
}

export default App;

