import React from 'react';
import { useDrag } from 'react-dnd';

const chosenMap = require('./items.json');

export default function Item({userId, item_id, growthStage, growthTime, position_x, position_y}) {
    const [{item, isDragging}, drag] = useDrag(() => ({
      type: "item",
      item: {userId, item_id, growthStage, position_x, position_y},
    //   end: (_item, monitor) => {const dropResult = monitor.dropResult(); if (dropResult) {console.log(dropResult);};},  
      collect: monitor => ({
        isDragging: !!monitor.isDragging(),
        item: !!monitor.getItem()
      }),
    }))
  
    const importedImg = require("../../../public" + chosenMap[item_id].find(o => o.growthStage === growthStage)["img-garden"] + ".png").default

    return (
      <div
        ref={drag}
        userid={userId}
        item_id={item_id}
        growthstage={growthStage}
        growthtime={growthTime}
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
      <img src={importedImg} alt='plant'></img> 
      </div>
    );
  };