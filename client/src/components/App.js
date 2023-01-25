import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes as Switch, Route, Outlet, Navigate } from "react-router-dom";
import { SHA256 } from 'crypto-js';
import NotFound from "./pages/NotFound.js";
import Landing from "./pages/Landing.js";
import Dashboard from "./pages/Dashboard.js";
import Login from "./pages/Login.js";
import Register from "./pages/Register.js";
import Friends from "./pages/Friends.js";
import { get, post } from "../utilities";
import Verify from "./pages/Verify.js";

const AuthLayout = () => {
    const isLoggedIn = localStorage.getItem('token') != null;
    if(isLoggedIn){
        return <Outlet/>
    }
    return <Navigate to="/login" replace/>
}

const PublicLayout = () => {
    const isLoggedIn = localStorage.getItem('token') != null;
    if(!isLoggedIn){
        return <Outlet/>
    }
    return <Navigate to="/dashboard" replace/>
}

/**
 * Define the "App" component
 */
const App = () => {

  useEffect(() => {
    get("/api/whoami").then((user) => {
      if (user._id) {
        // they are registed in the database, and currently logged in.
        // setUserId(user._id);
        let hash= SHA256(user._id + "greenhouse" + new Date().toDateString())
        localStorage.setItem('token', hash)
      } else {
          localStorage.removeItem('token')
      }
    });
  }, []);

  return (
    <>
      <Router>
          <Switch>
                <Route exact path="/" element={<Landing/>}/>
                <Route path="/verify" element={<Verify/>}/>
                <Route element={<PublicLayout/>}>
                    <Route path="/login" element={<Login/>}/>
                    <Route path="/register" element={<Register/>}/>
                </Route>
                <Route element={<AuthLayout/>}>
                    <Route path="/dashboard" element={<Dashboard/>}/>
                    <Route path="/friends" element={<Friends/>}/>
                </Route>
            
                <Route path="*" element={<NotFound/>}/>
          </Switch>
        {/* <Landing path="/" userId={userId} />
        <Dashboard path="/dashboard" userId={userId} handleLogout={handleLogout} />
        <Login path="/login" handleLogin={handleLogin} userId={userId} />
        <Register path="/register" userId={userId} /> */}
      </Router>
    </>
  );
};

export default App;
