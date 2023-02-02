import React, { useEffect, useState } from 'react';
import Layout from '../Layout';
import { get, post } from '../../utilities';
import { useNavigate } from 'react-router';
import { socket }  from '../../client-socket';
import FriendsModule from './popups/FriendsModule';
import GardensModule from './popups/GardensModule';


export default function Dashboard({handleLogout}) {
    const [userInfo, setUserInfo] = useState({});
    const [email, setEmail] = useState('');
    const [verified, setVerified] = useState(true);
    const [friends, setFriends] = useState([]);
    const [gardens, setGardens] = useState([]);
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

    useEffect(() => {
        get('/api/friends').then((res) => {
            setFriends(res)
        }).catch(res => console.log(res))
        get('/api/all-gardens').then((res) => {
            setGardens(res)
        }).catch(res => console.log(res))
    }, [])

    // update friends
    useEffect(() => {
        socket.on("updated", function (res) {
            if (!(res.err)) {
                setFriends(res.friends);
                get('/api/all-gardens').then((res) => {
                    setGardens(res)
                }).catch(res => console.log(res))
        }});

        return () => {
            socket.removeAllListeners();
        }
    }, [socket]);

    return(
        <Layout loggedIn={true}>
            <div id="dashboard">
                <div className='friends-component'>
                    <FriendsModule friends={friends} />
                </div>
                <div className='gardens'>
                    <GardensModule gardens={gardens} />
                </div>
            </div>
        </Layout>
    )
}