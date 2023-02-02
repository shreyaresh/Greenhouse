import React , { useEffect, useState} from 'react';
import { DndProvider, useDrop } from 'react-dnd';
import { get, post } from '../../../utilities';
import { HTML5Backend } from 'react-dnd-html5-backend';
import empty from '../../../public/empty-garden.png';
import Item from './Item';
import { socket } from '../../../client-socket';
// const chosenMap = require('./items.json');
  
export function Plot({positions, gardenId, userId}) { 

var items = positions;

const plotHeight = 8;
const plotWidth = 8;

function renderPosition(i, items) {
    const x = i % plotWidth;
    const y = Math.floor(i / plotHeight);
    return (
    <div key={i}>
      <Square x={x} y={y}>
        {renderItem(x, y, items)}
      </Square>
    </div>
    );
  }
  
  function moveItem(item, x, y) {
    const idx = items.findIndex((el) => el.userId === item.userId && el.position_x === item.position_x && el.position_y === item.position_y);
    if (idx !== -1) { 
    socket.emit("garden:update", {
        gardenId: gardenId,
        userId: userId,
        old_position_x: items[idx].position_x,
        old_position_y: items[idx].position_y,
        position_x: x,
        position_y: y,
        item_id: item.item_id,
        growthStage: item.growthStage
      })
    } else {
    
    socket.emit("garden:add", {
        gardenId: gardenId,
        userId: userId,
        position_x: x,
        position_y: y,
        item_id: item.item_id,
        growthStage: item.growthStage
      })
    }
  }

  function Square ({ x, y, children }) {
  
    const [{ isOver }, drop] = useDrop(
      () => ({
        accept: 'item',
        drop: item => moveItem(item, x, y),
        collect: monitor => ({
          item: !!monitor.getDropResult(),
          isOver: !!monitor.isOver()
        })
      }),
      [x, y]
    )
  
    return (
      <div ref={drop} style={{
        position: 'relative',
        width: '100%',
        height: '100%',
      }}>
      <div className="square">
            <div style={{
            width: '90%',
            height: '100%', 
            display:'flex',  
            transform:'skewX(58deg)',
            alignItems:'flex-end'}}>
              {children}
            </div>
        </div>
  
      {isOver && (
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
    </div>
    );
  }
  
  function renderItem (x, y, coords) {
    const item = coords.find((el) => el.position_x === x &&  el.position_y === y)
    if (item) {
      return <Item userId={item.userId} item_id={item.item_id} growthStage={item.growthStage} growthTime={item.growthTime} position_x={item.position_x} position_y={item.position_y}/>
    };
    return null
  };
  
  
  return (
    <div id="garden-container">
      <img src={empty} alt='empty garden'></img>
      <DndProvider backend={HTML5Backend}>
      <div className='element-grid'>
        {[...Array(plotHeight*plotWidth)].map((arr, i) => {
          return(
            renderPosition(i, items)
          )})}
      </div>
      </DndProvider>
    </div>
  )};
  
export function Inventory ({gardenId, userId, inventory}) {

    function moveItem(item) {
        socket.emit("garden:delete", {
            gardenId: gardenId,
            userId: item.userId,
            userIdCurrent: userId,
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
  
        const [{ isOver , canDrop }, drop] = useDrop(
          () => ({
            accept: 'item',
            drop: item => moveItem(item),
            canDrop: item => canDropHere(item),
            collect: monitor => ({
              item: !!monitor.getDropResult(),
              isOver: !!monitor.isOver(),
              canDrop: !!monitor.canDrop()
            })
          }),
        )
      
        return (
          <div ref={drop} className="inventory-wrapper">
                {children}
      
          {isOver && canDrop && (
            <div
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                borderRadius: '25px',
                zIndex: 1,
                opacity: 0.5,
                backgroundColor: '#ffffff',
                opacity: '0.6',
              }}
            />
          )}
            {isOver && !canDrop && (
            <div
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                borderRadius: '25px',
                zIndex: 1,
                opacity: 0.5,
                backgroundColor: '#ff6961',
                opacity: '0.6',
              }}
            />
          )} 
        </div>
        );
      }

      function renderItem (item) {
          return <Item userId={item.userId} item_id={item.item_id} growthStage={item.growthStage}/>
        };
      

    return (
        <DndProvider backend={HTML5Backend}>
            <InventoryBlock>
                {inventory.map((item, index) => {
                return(
                    ((item.quantity) ?
                    <div id='inventory-item' key={index}>
                        {renderItem(item)}
                        <h3 className='item-quantity'> amount: {item.quantity}</h3>
                    </div> : null)
                )})}
            </InventoryBlock>
        </DndProvider>
    );
}