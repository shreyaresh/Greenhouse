import React, {useEffect, useState} from 'react';
import { get } from '../../utilities';
import { Inventory, Plot } from '../modules/gamefiles/Plot.js';
import { useLocation } from 'react-router-dom';
import Layout from '../Layout.js';
import { socket } from '../../client-socket.js';

export default function Garden () {

    const gardenId = useLocation().state.gardenId;
    const [items, setItems] = useState([]);
    const [user, setUser] = useState({});
    const [name, setName] = useState('');
    const [inventory, setInventory] = useState([]);


    useEffect(() => {

        socket.emit("join", {roomId: gardenId})

        get('/api/whoami')
        .then((res) => setUser(res._id))
        
        get('/api/garden', {gardenId : gardenId})
        .then((res) => {setItems(res.items); setName(res.name)})

        get('/api/items')
        .then((res) => setInventory(res))


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
            console.log('received response: ', res);
            if(!res.error){
                setItems(res.items)
            } else {
                console.log(res.error)
            }
        })

        socket.on("updated", (res) => {
            if (!res.err) {
                console.log('updated user inventory: ', res);
                setInventory(res.inventory)
            }
        })

        return () => {
            socket.emit("leave", {roomId: gardenId});
            socket.off('garden:update');
            socket.off('garden:delete');
            socket.off('garden:add');
            socket.off('updated');
        }    
    }, [])

    return (
        <Layout loggedIn={true}>
            <div id="garden-page-container">
                <div className='left-els'>
                    <h1 className='title'>{name}</h1>
                    <div className='plot'>
                        <Plot positions={items} gardenId={gardenId} userId={user}/>
                    </div>
                </div>
                <div id='inventory'>
                    <Inventory gardenId={gardenId} inventory={inventory} userId={user} />
                </div>
            </div>
        </Layout>
    );
}