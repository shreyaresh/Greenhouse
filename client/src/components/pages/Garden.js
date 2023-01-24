import React, { useEffect, useState } from 'react';
import Layout from '../Layout';
import { get, post } from '../../utilities';
import { useNavigate } from 'react-router';
import socket from "../../client-socket";
import $ from "jquery";

export default function Garden(props) {

    const gardenObj = post("/api/garden", { gardenId: props.gardenId }).then((res) => {gardenObj = res;});
    const startUser = post("/api/whoami").then((res) => {startUser = res;});
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [garden, setGarden] = useState(gardenObj);
    const [user, setUser] = useState(startUser);
    const [item, setItem] = useState(null);

    useEffect(() => {
        socket.on("updated", (res) => {
            if (!("error" in res) && !res.error) {
                setUser(res)
            }});
        socket.on("garden:update", { title, completed: false }, (res) => {
            if (!("error" in res) && !res.error) {
                setGarden(res)
            }});
        socket.on("garden:delete", { title, completed: false }, (res) => {
            if (!("error" in res) && !res.error) {
                setGarden(res)
            }});
        socket.on("garden:add", { title, completed: false }, (res) => {
            if (!("error" in res) && !res.error) {
                setGarden(res)
            }});
        });

    // item object, position in Array
    function releaseItemInGarden (item, newPosition) {
        const new_pos_x = newPosition[0], new_pos_y = newPosition[1];

        if (item.position_x && item.position_y) {
            socket.emit("garden:update", {
                gardenId: props.gardenId,
                userId: item.userId,
                growthTime: item.growthTime,
                old_position_x: item.position_x,
                old_position_y: item.position_y,
                position_x: new_pos_x,
                position_y: new_pos_y,
                item_id: item.item_id,
                growthStage: item.growthStage
              });
            }
        if (Math.abs(+new_pos_x) < 4 && Math.abs(+new_pos_y) < 4) {
            socket.emit("garden:add", {
                gardenId: props.gardenId,
                userId: String(startUser._id),
                growthTime: item.growthTime,
                position_x: new_pos_x,
                position_y: new_pos_y,
                item_id: item.item_id,

              })};
        }
    }
    
    function releaseItemInInventory (item) {
        socket.emit("garden:delete", {
            gardenId: props.gardenId,
            userId: item.userId,
            userIdCurrent: String(startUser._id),
            growthTime: item.growthTime,
            position_x: item.position_x,
            position_y: item.position_y,
            item_id: item.item_id,
            growthStage: item.growthStage
          });

    <div className='Garden'>
        <div className="parent">
            <div className="garden-plot">
            </div>
            <div className="frame">
            </div>
        </div>
    </div>
    // <Inventory />
    
    
        
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
        }


