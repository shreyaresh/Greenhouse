import React, { useEffect, useState } from 'react';
import Layout from '../Layout';
import { get, post } from '../../utilities';
import { useNavigate } from 'react-router';

export default function Dashboard({handleLogout}) {
    const [userInfo, setUserInfo] = useState({});
    const [email, setEmail] = useState('');
    const [verified, setVerified] = useState(true);
    const navigate = useNavigate();

    // get email
    useEffect(() => {
        get('/api/whoami').then((user) => {
            if(user.email){
                setEmail(user.email);
                setUserInfo({username: user.name, id: user._id});
            }
        }).catch(error => window.alert(error));
    }, []);

    // check verification
    useEffect(() => {
        if(email){
            get('/api/is-verified', { email: email }).then((res) => {
                if(!res.verified){
                    setVerified(res.verified);
                }
            }).catch(error => window.alert(error))
        }
    }, [email]);

    useEffect(() => {
        if(userInfo){
            console.log(userInfo)
        }
    }, [userInfo]);

    useEffect(() => {
        if(!verified){
            navigate('/verify')
        }
    }, [verified]);

    return(
        <Layout loggedIn={true}>
            <div id="dashboard">
                {/* {!verified && <div className="verify">Please check your email to verify your account before you continue. Resend email</div>} */}
                are you verified? {verified ? "yes" : "no"}
            </div>
        </Layout>
    )
}