import { useState, useEffect } from 'react';
import { FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { PieChart, Home, NotebookPen ,LogOut, BadgeIndianRupee, Settings, UserPlus, FileBarChart,  Send, Edit } from "lucide-react"




export default function Sidebar({ isOpen, toggleSidebar }) {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const userString = localStorage.getItem("user");
    if (userString) {
      try {
        const user = JSON.parse(userString);
        setUserRole(user.role || null);
        console.log("role",user.role);
      } catch (err) {
        console.error("Invalid token");
      }
    }
  }, []);
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };
  return (
    <>
      {!isOpen && (
        <button onClick={toggleSidebar} className="fixed rounded-full top-2 left-2 z-50 bg-blue-800 px-2 py-2 text-white">
          <FiChevronRight />
        </button>
      )}

      <div
        className={`bg-[#011638] fixed top-0 left-0 z-40 min-h-screen transition-all duration-300 ${
          isOpen ? 'w-64' : 'w-0 -translate-x-full md:translate-x-0'
        }`}
      >
        <div className={`flex h-16 ${isOpen ? 'border-b border-gray-700' : ''} justify-between items-center px-4 py-4 `}>
          {isOpen ? (
            <h2 className="text-xl text-white font-bold flex items-center gap-2">
              <Home className="h-5 w-5" />
              ROF
              
            </h2>
          ) : (
            <button onClick={toggleSidebar} className="text-2xl text-white w-10">
              <FiChevronRight />
            </button>
          )}
          {isOpen && (
            <button onClick={toggleSidebar} className="text-2xl text-white w-10">
              <FiChevronLeft />
            </button>
          )}
        </div>

        {isOpen && (
          <ul className="mt-4 px-4 space-y-2">
            
            <li className=''>
              <Link to="/">
              <button className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-100 hover:text-gray-900 hover:bg-gray-100">
                <PieChart className="mr-2 h-4 w-4" />
                Dashboard
              </button>
              </Link>
            </li>
            {/* <li>
                <Link to="/getreport">
                  <button className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-100 hover:text-gray-900 hover:bg-gray-100">
                    <FileBarChart className="mr-2 h-4 w-4" />
                    Sales Reports
                  </button>
                </Link>
              </li> */}
            {userRole === 'user' && (
              <li>
                <Link to="/createreport">
                  <button className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-100 hover:text-gray-900 hover:bg-gray-100">
                    <NotebookPen className="mr-2 h-4 w-4" />
                    Create Report
                  </button>
                </Link>
              </li>
            )}
            
            {userRole === 'admin' && (  
              <li className=''>
                <Link to="/createClient">
                <button className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-100 hover:text-gray-900 hover:bg-gray-100">
                  <NotebookPen className="mr-2 h-4 w-4" />
                  Create Client
                </button>
                </Link>
              </li>
            )}  
            {userRole === 'admin' && (
              <li>
                <Link to="/register">
                  <button className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-100 hover:text-gray-900 hover:bg-gray-100">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Register User
                  </button>
                </Link>
              </li>
            )}
            {userRole === 'admin' && (
              <li>
                <Link to="/getUsers">
                  <button className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-100 hover:text-gray-900 hover:bg-gray-100">
                    <Send className="mr-2 h-4 w-4" />
                    Assign Lead
                  </button>
                </Link>
              </li>
            )}
            {userRole === 'admin' && (
              <li>
                <Link to="/editUsers">
                  <button className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-100 hover:text-gray-900 hover:bg-gray-100">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Users
                  </button>
                </Link>
              </li>
            )}
            
            <li className=''>
              
              <button onClick={handleLogout} className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-100 hover:text-gray-900 hover:bg-gray-100">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </button>
              
            </li>
            
           
            
          </ul>
        )}
      </div>
      
    </>
  );
}

       
