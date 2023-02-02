import React , {useEffect, useState} from 'react';
import { DndProvider, useDrop } from 'react-dnd';
import { get, post } from '../../../utilities';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {socket} from '../../../client-socket';
import Item from './Item';
const chosenMap = require('./items.json');


export function Inventory ({gardenId, userId}) {
    const [items, setItems] = useState([]);

    useEffect(() => {
        get('/api/items')
        .then((res) => setItems(res))
    },[])

    socket.on("garden:delete", (res) => {
        if (!res.err) {
            setItems(res.inventory)
        }
    })

    socket.on("updated", (res) => {
        if (!res.err) {
            setItems(res.inventory)
        }
    })

    function moveItem(item) {
        socket.emit("garden:delete", {
            gardenId: gardenId,
            userId: item.userId,
            userIdCurrent: userId,
            growthTime: item.growthTime,
            position_x: item.position_x,
            position_y: item.position_y,
            item_id: item.item_id,
            growthStage: item.growthStage
          });
    }

    function canDropHere (item) {
        if (item.userId !== userId) {
            return false;
        }
        return true;
    }

    function InventoryBlock ({ children }) {
  
        const [{ isOver }, drop] = useDrop(
          () => ({
            accept: 'item',
            drop(item, monitor) {return moveItem(monitor.getItem())},
            canDrop(item, monitor) {return canDropHere(monitor.getItem())},
            collect: monitor => ({
              item: !!monitor.getDropResult(),
              isOver: !!monitor.isOver()
            })
          }),
        )
      
        return (
          <div ref={drop} style={{
            position: 'relative',
            width: '100%',
            height: '100%',
          }}>
          <div className="inventory">
                <div style={{
                width: '90%',
                height: '100%', 
                display:'flex'}}>
                  {children}
                </div>
            </div>
      
          {isOver && canDrop && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: '100%',
                zIndex: 1,
                opacity: 0.5,
                backgroundColor: '#ffffff',
                opacity: '0.6',
                borderRadius: '10px'
              }}
            />
          )}
            {isOver && !canDrop && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: '100%',
                zIndex: 1,
                opacity: 0.5,
                backgroundColor: '#ff6961',
                opacity: '0.6',
                borderRadius: '10px'
              }}
            />
          )}
        </div>
        );
      }

      function renderItem (item) {
          return <Item userId={item.userId} item_id={item.item_id} growthStage={item.growthStage} growthTime={item.growthTime}/>
        };
      

    return (
        <DndProvider backend={HTML5Backend}>
            <InventoryBlock>
                {items.map((item, index) => {
                return(
                    <div className='inventory-item' key={index}>
                        {renderItem(item)}
                    </div>
                )})}
            </InventoryBlock>
        </DndProvider>
    );
}