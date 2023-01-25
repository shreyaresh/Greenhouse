import React from 'react';
import Navbar from "./Navbar.js";

export default function Layout({children, loggedIn}) {
    return(
        <>
        <Navbar loggedIn={loggedIn}/> 
        {children}
        </>
    )
}