import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { get, post} from '../utilities';
import { googleLogout } from "@react-oauth/google";
import Logo from '../public/small-logo.png';
import coin from '../public/coin.png';
import NotifIcon from '../public/notifIcon.png';
import Notifications from './pages/popups/Notifications';
import { socket } from '../client-socket';

export default function Navbar({loggedIn}) {
    const [success, setSuccess] = useState(false);
    const [clicked, setClicked] = useState(false);
    const [currency, setCurrency] = useState(0)
    const navigate = useNavigate();
  
    function logout(e) {
        googleLogout();
        post("/api/logout").then((res) => {
            setSuccess(true);
        }).catch(error => alert(error));
        e.preventDefault();
    }

    function loadNotifs (e) {
        if (clicked) {
            setClicked(false);
        } else {
            setClicked(true);
        }
        e.preventDefault()
        }

    useEffect(() => {
        get('/api/currency').then(
            (res) => setCurrency(res.currency)
        )
    }, [])

    socket.on("updated", function (res) {
        if (!(res.err)) {
            setCurrency(res.currency);
    }})

    useEffect(() => {
        if(success){
            localStorage.removeItem('token')
            navigate('/', {replace: true});
        }
    }, [success]);

    return(
        <div className='all-wrapper'>
        <div id="navbar">
            <a href={loggedIn ? "/dashboard" : "/"}>
                <div className="logo-wrap">
                    <img src={Logo} alt="logo" className="logo"/>
                    greenhouse
                </div>
            </a>
            
            <div className="links">
            {loggedIn ? <img src={NotifIcon} alt='notification icon' className='logo' onClick={loadNotifs}></img> : null}
            {(loggedIn) ? <div className="currency">
            <img src={coin} alt="coin"></img>
            {currency}
            </div>: null}
            {loggedIn ? ['Dashboard','Friends','Profile'].map(el => {
                return(
                    <a className="link" key={el} href={`/${el.toLowerCase()}`}>{el}</a>
                )
            }) : null }
            {loggedIn ? <a className="link" href="/" onClick={logout}>Logout</a> : null}
            </div>
        </div>
        {((loggedIn && clicked) ? 
            <div className = "notifs-wrapper">
                <Notifications/>
                </div>: null)}
        </div>
    )
}