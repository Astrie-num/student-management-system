  import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
  import './App.css';
  import Navbar from './components/Navbar';
  import Home from './pages/Home';
  import Dashboard from './pages/Dashboard';
  import Login from './components/Login';
  import Register from './components/Register';
  import { isAdmin, isAuthenticated } from './utils/auth';


  function PrivateRoute({children}) {
    if(!isAuthenticated()) {
      return <Navigate to='/login'/>;
    }
    if(!isAdmin()) {
      return <Navigate to='/' />;
    }
    return children;
  }

  function App() {
    return (
      <Router>
        <div className="App">
          <Navbar /> {/* Persistent navigation bar */}
          <div className="content">
            <Routes>

              <Route path="/" element={<Home />} />
              
              <Route path="/dashboard"element={ 
                <PrivateRoute>  
                  <Dashboard /> 
                </PrivateRoute>} 
              />

              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </div>
        </div>
      </Router>
    );
  }

  export default App;