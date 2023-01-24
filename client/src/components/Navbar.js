import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { get, post} from '../utilities';
import { googleLogout } from "@react-oauth/google";
import Logo from '../public/small-logo.png';

export default function Navbar({loggedIn}) {
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();
  
    function logout(e) {
        googleLogout();
        post("/api/logout").then((res) => {
            setSuccess(true);
        }).catch(error => alert(error));
        e.preventDefault();
    }

    useEffect(() => {
        if(success){
            localStorage.removeItem('token')
            navigate('/', {replace: true});
        }
    }, [success]);

    return(
        <div id="navbar">
            <a href={loggedIn ? "/dashboard" : "/"}>
                <div className="logo-wrap">
                    <img src={Logo} alt="logo" className="logo"/>
                    greenhouse
                </div>
            </a>
            <div className="links">
            {loggedIn ? ['Dashboard','Friends','Profile'].map(el => {
                return(
                    <a key={el} href={`/${el.toLowerCase()}`}>{el}</a>
                )
            }) : null }
            {loggedIn ? <a href="/" onClick={logout}>Logout</a> : null}
            </div>
        </div>
    )
}