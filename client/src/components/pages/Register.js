import React, { useState, useEffect } from 'react';
import Layout from '../Layout.js';
import { get, post} from '../../utilities';
import { useNavigate } from 'react-router';

export default function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [success, setSuccess] = useState(false);

    const navigate = useNavigate();

    function handleSubmit(e) {
        post('/api/register', { username: username, email: email, password: password }).then(() => {
            setSuccess(true);
        }).catch(error => window.alert(error));
        e.preventDefault();   
    }

    useEffect(() => {
        if(success) {
            navigate(`/verify?email=${email}`, { replace: true});
        }
    }, [success]);

        return(
            <Layout loggedIn={false}>
                <div className="auth">
                    <form onSubmit={handleSubmit} method="POST">
                        <input type="text" 
                            placeholder={"username"}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <input type="text" 
                            placeholder={"email"}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <input type="password" 
                            placeholder={"password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <input type="submit" value="Submit"/>
                    </form>
                </div>
            </Layout>
        )
}