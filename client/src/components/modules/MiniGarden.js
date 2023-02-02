import React from 'react';
import empty from '../../public/empty-garden.png';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import hyacinth from '../../public/hyacinth.png';
import lilies from '../../public/lilies.png';
import hydrangeas from '../../public/hydrangeas.png';
import sunflower from '../../public/sunflowers.png';

let itemPosition = [4,4];
let observer = null;

function emitChange() {
  observer(itemPosition)
}

export function observe(o) {
  observer = o
  emitChange()
}


function Board({position, plant}) {

  const chosenMap = {'8b494f1f-aa63-4134-a2fa-f6f07216a448': hyacinth, 'e0fd2b8a-3585-4380-ba79-d5ca524fdebe': sunflower, '5540a077-31bd-41de-8ef1-da91b7dbb289': hydrangeas, '68e272d4-caa1-416d-85b6-dbfd01c97f16': lilies}

  const plotHeight = 8;
  const plotWidth=8;



  function Item() {
    const [{isDragging}, drag] = useDrag(() => ({
      type: "item",
      collect: monitor => ({
        isDragging: !!monitor.isDragging(),
      }),
    }))
  
    return (
      <div
        ref={drag}
        style={{
          opacity: isDragging ? 0.5 : 1,
          cursor: 'move',
          width: '100%',
          height: '100%',
          display:'flex',
          justifyContent: 'center',
          padding: '2px',
          alignItems:'flex-end'
        }}
      >
      <img src={chosenMap[plant]} alt='plant'></img> 
      </div>
    );
  };

function moveItem(toX, toY) {
  itemPosition = [toX, toY];
  emitChange();
}

function renderPosition(i, position) {
  const x = i % plotWidth;
  const y = Math.floor(i / plotHeight);
  return (
  <div key={i}>
    <Square x={x} y={y}>
      {renderItem(x, y, Array(position))}
    </Square>
  </div>
  );
}

function Square ({ x, y, children }) {

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: 'item',
      drop: () => moveItem(x, y),
      collect: monitor => ({
        // item: !!monitor.getItem(),
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
  // if (coords.some(a => [x,y].every((v, i) => v === a[i]))){
  if (x === coords[0][0] && y === coords[0][1]) {
    return <Item />
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
          renderPosition(i, position)
        )})}
    </div>
    </DndProvider>
  </div>
)};


// array of positions
export function MiniGarden({position, plant}) {
  return (
    <Board position={position} plant={plant}></Board>
  )};
