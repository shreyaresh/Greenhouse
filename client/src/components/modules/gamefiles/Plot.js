import React from 'react';
import { DndProvider, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import empty from '../../../public/empty-garden.png';
import Item from './Item';
import { socket } from '../../../client-socket';
  
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
    socket.emit("garden:update", {
        gardenId: gardenId,
        userId: userId,
        old_position_x: items[idx].position_y,
        old_position_y: items[idx].position_x,
        position_x: x,
        position_y: y,
        item_id: item.item_id,
        growthStage: item.growthStage
      })
    // items[idx].position_x = x;
    // items[idx].position_y = y;
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
  