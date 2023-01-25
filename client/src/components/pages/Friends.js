import React, { useState, useEffect } from 'react';
import Layout from '../Layout';
import { get, post } from '../../utilities';
import { socket } from '../../client-socket';

export default function Friends() {
    const [friendName, setFriendName] = useState('');
    const [message, setMessage] = useState('');
    const [requests, setRequests] = useState([]);
    const [friends, setFriends] = useState([]);

    function handleSubmit(e){
        e.preventDefault();
        post('/api/make-request', {type: 'friend-request', to: friendName}).then((res) => {
            if(res.status === 200){
                console.log('hello!')
                setMessage(res);
            } else {
                setMessage(res);
            }
        }).catch(res => {
            if(res.err){
                setMessage(res.err);
            } else {
                setMessage(res.msg);
            }
        });
    }

    useEffect(() => {
        
        get('/api/requests', {type: 'friend-request'}).then(res => {
            console.log(res)
            setRequests(res)
        }).catch(res => console.log(res));
        
        get('/api/friends').then(res => {
            console.log(res)
            setFriends(res)
        }).catch(res => console.log(res))


        socket.on("updated", (res) => {
            if (!("error" in res)) {
                setFriends(res.friends);
                get('/api/requests', {type: 'friend-request'}).then(res => {
                    console.log(res)
                    setRequests(res)
                }).catch(res => console.log(res));
        }});

        return () => {
            socket.removeAllListeners();
        }
    }, []);

    function handleAction(e, status, id){
        e.preventDefault();
        post('/api/handle-request', {status: status, type: 'friend-request', type_id: id}).then(res => {
            console.log(res)
        }).get('/api/requests', {type: 'friend-request'})
        .then(res => setFriends(res))
        .catch(res => console.log(res));
    }

    return(
        <Layout loggedIn={true}>
            <div id="friends">
                <div className="search">
                    <h2>Find a friend</h2>
                    <form onSubmit={handleSubmit} method="POST">
                        <input type="text" placeholder="Enter username"
                            value={friendName} onChange={(e) => setFriendName(e.target.value)}/>
                        <input type="submit" value="Submit"/>
                    </form>
                    {message}
                </div>
                <div className="columns-wrap">
                    <div className="column friend-list">
                        <h2>Friends</h2>
                        { (friends.length) ? friends.map((req, index) => {
                            return(
                                <div className="request" key={index}>
                                    <div className="requester">{req.username}</div>
                                </div>
                            )
                        }) : <></>}
                    </div>
                    <div className="column friend-requests">
                        <h2>Requests</h2>
                        {(requests) ? requests.map((req, index) => {
                            return(
                                <div className="request" key={index}>
                                    <div className="requester">{req.usernameFrom}</div>
                                    <div className="actions">
                                        <button onClick={(e) => handleAction(e, '2', req.friendReqId)}>accept</button>
                                        <button onClick={(e) => handleAction(e, '3', req.friendReqId)}>reject</button>
                                    </div>
                                </div>
                            )
                        }) : <></>}
                    </div>
                </div>
            </div>
        </Layout>
    )
}