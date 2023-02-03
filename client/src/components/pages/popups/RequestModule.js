import React, {useState, useEffect} from 'react';
import {socket} from '../../../client-socket';
import { get, post } from '../../../utilities';

export default function RequestModule() {
    const [toggle, setToggle] = useState(false);
    const [friendRequests, setFriendRequests] = useState([]);
    const [gardenRequests, setGardenRequests] = useState([]);

    useEffect(() => {
        get('/api/requests', {type: 'friend-request'}).then(res => {
            setFriendRequests(res)
        }).catch(res => console.log(res));
        get('/api/requests', {type: 'garden-request'}).then(res => {
            setGardenRequests(res)
        }).catch(res => console.log(res));

        socket.on("updated", function (res) {
            if (!(res.err)) {
                get('/api/requests', {type: 'friend-request'}).then(res => {
                    setRequests(res)
                }).catch(res => console.log(res));
                }
            })

        return () => socket.off("updated")
    }, [])


    function handleAction(e, status, id){
        e.preventDefault();
        post('/api/handle-request', {status: status, type: 'friend-request', type_id: id})
        get('/api/requests', {type: 'friend-request'})
        .then(res => setFriendRequests(res))
        .catch(res => console.log(res));

        get('/api/requests', {type: 'garden-request'})
        .then(res => setGardenRequests(res))
        .catch(res => console.log(res));
    }


    return (
        <div id='request-module'>
            <div className='inner-wrapper'>
                <h3>requests</h3>
                <div className='button-container'>
                    <button onClick={(e) => setToggle(false)}>friends</button>
                    <button onClick={(e) => setToggle(true)}>gardens</button>
                </div>
                <div className='content'>
                   { ((toggle) ? gardenRequests.map((req, index) => {
                    return(
                        <div className="request" key={index}>
                            <div className="requester">{req.usernameFrom}</div>
                            <div className="actions">
                                <div className="button-wrapper">
                                    <button onClick={(e) => handleAction(e, '2', req.gardenReqId)}>accept</button>
                                </div>
                                <div className="button-wrapper">
                                    <button onClick={(e) => handleAction(e, '3', req.gardenReqId)}>reject</button>
                                </div>
                            </div>
                        </div>
                    )}):
                    
                    friendRequests.map((req, index) => {
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
                        )})
                    
                    )}
                </div>
            </div>

        </div>
    )
}