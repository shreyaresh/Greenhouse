import React, { useState, useEffect} from 'react';
import Layout from '../Layout';
import { get, post } from '../../utilities';
import { socket } from '../../client-socket';
import FriendModal from './popups/FriendModal';

export default function Friends() {
    const [friendName, setFriendName] = useState('');
    const [message, setMessage] = useState('');
    const [requests, setRequests] = useState([]);
    const [friends, setFriends] = useState([]);
    const [color, setColor] = useState('#6f8531')



    function handleSubmit(e){
        e.preventDefault();
        post('/api/make-request', {type: 'friend-request', to: friendName}).then((res) => {
            if(res.status === 200){
                setMessage(res.msg);
                setColor('#6f8531');
            } else {
                setMessage(res.err)
                setColor('#FF6961');
            }
        }).catch(res => {
            if(res.err){
                setMessage(res.err)
                setColor('#FF6961');
            } else {
                setMessage(res.msg)
                setColor('#6f8531');
            }
        })
    }

    useEffect(() => {
        setTimeout(setMessage(''), 1000);
        return () => {}
    }, [handleSubmit]);


    useEffect(() => {
        socket.on("updated", function (res) {
            if (!(res.err)) {
                setFriends(res.friends);
                get('/api/requests', {type: 'friend-request'}).then(res => {
                    setRequests(res)
                }).catch(res => console.log(res));
        }});


        get('/api/requests', {type: 'friend-request'}).then(res => {
            console.log(res)
            setRequests(res)
        }).catch(res => console.log(res));
        
        get('/api/friends').then(res => {
            console.log(res)
            setFriends(res)
        }).catch(res => console.log(res))

        return () => {
            socket.removeAllListeners();
        }
    }, []);

    function handleAction(e, status, id){
        e.preventDefault();
        post('/api/handle-request', {status: status, type: 'friend-request', type_id: id}).then(res => {
            console.log(res);
            if (res.err) {
                setMessage(res.err);
                setColor('#6f8531');
            } else if (res.msg){
                setMessage(res.msg);
                setColor('#FF6961');
            }

        })
        get('/api/requests', {type: 'friend-request'})
        .then(res => setRequests(res))
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
                    <p style={{'color': `${color}`}}>{message}</p>
                </div>
                <div className="columns-wrap">
                    <div className="column friend-list">
                        <h2>Friends</h2>
                        { (friends.length) ? friends.map((req, index) => {
                            return(
                                <div className="request" key={index}>
                                    <div className="requester">{req.username}</div>
                                    <FriendModal friend={req.username} friendId={req.id}/>
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
                                        <div className="button-wrapper">
                                            <button onClick={(e) => handleAction(e, '2', req.friendReqId)}>accept</button>
                                        </div>
                                        <div className="button-wrapper">
                                            <button onClick={(e) => handleAction(e, '3', req.friendReqId)}>reject</button>
                                        </div>
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