import React, {useEffect, useState} from 'react';
import { get, post } from '../../utilities';
import { Plot, observe } from '../modules/gamefiles/Plot.js';
import { useLocation } from 'react-router-dom';
import { Inventory } from '../modules/gamefiles/Inventory.js';
import Layout from '../Layout.js';
import { socket } from '../../client-socket.js';

export default function Garden () {

    const gardenId = useLocation().state.gardenId;
    const [items, setItems] = useState([])
    const [user, setUser] = useState({})
    const [timer, setTimer] = useState(new Date());

    useEffect(() => {
        socket.emit("join", {roomId: gardenId})
        get('/api/whoami')
        .then((res) => setUser(res._id))
        get('/api/garden', {gardenId : gardenId})
        .then((res) => setItems(res.items))
        return (() => socket.emit("leave", {roomId: gardenId}))
        
    }, [])

    // useEffect(()=>{
    //     observe((res) => setItems(res))
    // }, [])

    // useEffect(() => {
    //     const interval = setInterval(() => {
    //        setTimer(new Date());
    //     }, 500);
     
    //     return () => clearInterval(interval);
     
    //  }, [])

    useEffect(() => {
        socket.on("garden:add", (res) => {
            if(!res.error){
                setItems(res.items)
            } else {
                console.log(res.error)
            }
        })
    
        socket.on("garden:update", (res) => {
            if(!res.error){
                console.log('success: ', res.items)
                setItems(res.items)
            } else {
                console.log(res.error)
            }
        })
    
        socket.on("garden:delete", (res) => {
            if(!res.error){
                setItems(res.items)
            } else {
                console.log(res.error)
            }
        })    
    }, [])

    console.log(`current items: `, items);

    return (
            <div className="garden-page-container">
                <div className='plot'>
                    <Plot positions={items} gardenId={gardenId} userId={user}/>
                </div>
                <div className='inventory'>
                    <Inventory gardenId={gardenId} userId={user} />
                </div>
            </div>
    );
}