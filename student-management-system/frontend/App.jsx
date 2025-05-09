import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './components/Login';
import Register from './components/Register';


function App(){
    return(
        <Router>
            <Navbar />
                <Routes>
                <Route path = "/" element = {<Home />} />
                <Route path = "/register" element = {<Register />} />
                <Route path = "/login" element = {<Login />} />
                <Route path = "/dashboard" element = {<Dashboard />} />
                </Routes>
        </Router>
    );
}

export default App;



