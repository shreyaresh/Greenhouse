import React, { useState, useEffect } from 'react';
import jwt_decode from "jwt-decode";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import Layout from "../Layout.js";
import { get, post} from '../../utilities';
import { SHA256 } from 'crypto-js';

import { socket } from "../../client-socket.js";
import { useNavigate } from 'react-router-dom';
const GOOGLE_CLIENT_ID = "239958526497-k9s3q5out7d1vbcp7h8gie4pl58f1m26.apps.googleusercontent.com";

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = (credentialResponse) => {
        const userToken = credentialResponse.credential;
        const decodedCredential = jwt_decode(userToken);
        console.log(`Logged in as ${decodedCredential.name}`);
        post("/api/google-login", { token: userToken }).then((res) => {
            post("/api/initsocket", { socketid: socket.id });
            let hash= SHA256(username + "greenhouse" + new Date().toDateString())
            localStorage.setItem('token', hash)
            navigate(res.url, {replace: true})
        });
    };


    function handleSubmit(e) {
        post('/api/login', { username: username, password: password }).then(res => {
            post("/api/initsocket", { socketid: socket.id });
            if (res.url === '/dashboard'){
                let hash= SHA256(username + "greenhouse" + new Date().toDateString())
                localStorage.setItem('token', hash)
            }
            navigate(res.url, {replace: true})
        }).catch(setMessage("incorrect username or password!"));    
        e.preventDefault();
    }
    
    return(
            
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <Layout loggedIn={false}>
            <div className="auth">
                <p className = "errorText"> {message} </p>
                <form onSubmit={handleSubmit} method="POST">
                    <input type="text" 
                        placeholder={"username"}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />

                    <input type="password" 
                        placeholder={"password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <input type="submit" value="Submit"/>
                </form>

                -- or --
                <GoogleLogin onSuccess={handleLogin} onError={(err) => console.log(err)} className="google-button"/>
            </div>
            </Layout>
        </GoogleOAuthProvider>
    )
}