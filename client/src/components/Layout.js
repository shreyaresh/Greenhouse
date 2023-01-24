import React from 'react';
import Navbar from "./Navbar.js";
import Greenhouse from '../public/greenhouse-frontpage-animated.png';

export default function Layout({children, loggedIn}) {
    return(
        <>
        <Navbar loggedIn={loggedIn}/> 
        {children}
        {loggedIn ? null :  <>
                <img src={Greenhouse} alt="greenhouse" className="front-img"/>
        </>}
        </>
    )
}