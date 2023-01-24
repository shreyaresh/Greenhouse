import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { post, get } from '../../utilities';
import Layout from '../Layout';
import { SHA256 } from 'crypto-js';

export default function Verify(){
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [verified, setVerified] = useState(false);
    const navigate = useNavigate();
    let [searchParams, setSearchParams] = useSearchParams();

    function handleSubmit(e) {
        e.preventDefault();
        if(!code){
            setError("You didn't enter a code!");
            return;
        }
        post('/api/verify', { email: searchParams.get("email"), code: code }).then((res) => {
            setVerified(true);
        }).catch((res) => {
            setError("Something went wrong. You may have an invalid code.");
        });
    }

    useEffect(() => {
        if(!searchParams.get("email")){
            navigate('/', {replace: true});
        } else {
            get('/api/is-verified', { email: searchParams.get("email") }).then((res) => {
                if(res.verified){
                    let hash= SHA256(searchParams.get("email") + "greenhouse" + new Date().toDateString())
                    localStorage.setItem('token', hash)
                    navigate('/dashboard', {replace: true})
                }
            }).catch(err => window.alert(err));
        }
    }, [searchParams]);

    useEffect(() => {
        if(verified){
            let hash= SHA256(searchParams.get("email") + "greenhouse" + new Date().toDateString())
            localStorage.setItem('token', hash)
            navigate('/dashboard', {replace: true});
        }
    }, [verified]);

    function resendVerification(e) {
        e.preventDefault();
        post('/api/get-verify-code', {email: searchParams.get("email")}).then(() => {
            setError("New verification email sent!");
        }).catch(res => setError(res.err));
    }

    return(
        <Layout loggedIn={false}>
            <div className="auth">
                <h2 style={{textAlign:'center'}}>Thanks for signing up! We sent a verification code to your email.<br/>Please check your inbox for a verification code.</h2>
                {error}
                <form onSubmit={handleSubmit} method="POST">
                    <input type="text" placeholder="Verification Code"
                        value={code} onChange={(e) => setCode(e.target.value)}/>
                    <input type="submit" value="Submit"/>
                </form>
                
                <div>Didn't get an email? <span onClick={resendVerification}><u>Resend verification email</u></span></div>
            </div>
        </Layout>
    )
}