import React, {useEffect, useState} from 'react';
import { get } from '../../utilities';
import { Plot } from '../modules/gamefiles/Plot.js';
import { useLocation } from 'react-router-dom';
import { Inventory } from '../modules/gamefiles/Inventory.js';
import Layout from '../Layout.js';
import { socket } from '../../client-socket.js';

export default function Garden () {

    const gardenId = useLocation().state.gardenId;
    const [items, setItems] = useState([])
    const [user, setUser] = useState({})

    useEffect(() => {

        socket.emit("join", {roomId: gardenId})

        get('/api/whoami')
        .then((res) => setUser(res._id))
        
        get('/api/garden', {gardenId : gardenId})
        .then((res) => setItems(res.items))

        socket.on("garden:add", (res) => {
            if(!res.error){
                setItems(res.items)
            } else {
                console.log(res.error)
            }
        })
    
        socket.on("garden:update", (res) => {
            if(!res.error){
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

        return () => {
            socket.emit("leave", {roomId: gardenId});
            socket.off('garden:update');
            socket.off('garden:delete');
            socket.off('garden:add');
        }    
    }, [])


    function refresh() {
        console.log(items)
    }
    useEffect(() => refresh(), [items])

    console.log(`current items: `, items);

    return (
        // <Layout loggedIn={true}>
            <div className="garden-page-container">
                <div className='plot'>
                    <Plot positions={items} gardenId={gardenId} userId={user}/>
                </div>
                <div className='inventory'>
                    <Inventory gardenId={gardenId} userId={user} />
                </div>
            </div>
        // </Layout>
    );
}