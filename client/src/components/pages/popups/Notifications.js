import React, { useEffect, useContext, useState } from 'react';
import { get, post } from '../../../utilities';
import { socket } from  '../../../client-socket';


export default function Notifications(props) {
  
    const [notifications, setNotifications] = useState([]);
    const [long, setLong] = useState(true)    

    useEffect (() => {
        get('/api/notifications').then((res) => {
            if (res.length > 5 && long) {
                setNotifications(res.slice(0,5))
            } else {
                setNotifications(res)
            }
        }).catch((err) => console.log(err));
    })

    socket.on("updated", function (res) {
        if (!(res.err)) {
            setNotifications(res.notifications);
    }})

    useEffect(() => {
        return (() => {socket.removeAllListeners()})
    }, [])


    function dateParser(dateString) {
        const date = new Date(dateString)
        const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
        ];
        return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    }

    function handleClear() {
        post('/api/clear-notifs')
        .then((res) => {
            setNotifications(res.notifications); 
            setLong(false);})
        .catch((err) => console.log(err))
    }

    function loadAll (e) {
        if (long) {
            setLong(false);
        } else {
            setLong(true);
        }
        e.preventDefault()
        }



    return(
       <div id = 'notifs-wrapper'>
            <h2>Notifications</h2>
            <div className="notification-list">
                    { (notifications.length) ? notifications.map((req, index) => {
                        return(
                            <div className="notif" key={index}>
                                <h5 className="date">{dateParser(req.date)}</h5>
                                <p className="message">{req.content}</p>
                            </div>
                        )
                    }) : <></>}
            </div>
            {long ? <p className="show-text" onClick={loadAll}>show more...</p> : <p className="show-text" onClick={loadAll}>show less</p>}

            <div className="clearButton">
                <button onClick={handleClear}>clear notifications</button>
            </div>
       </div>
    )

    }