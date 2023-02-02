import React from 'react';
import { useDrag } from 'react-dnd';

const chosenMap = require('./items.json');

export default function Item({userId, item_id, growthStage, position_x, position_y}) {
    const [{isDragging}, drag] = useDrag(() => ({
      type: "item",
      item: {userId, item_id, growthStage, position_x, position_y},
    //   end: (_item, monitor) => {const dropResult = monitor.dropResult(); if (dropResult) {console.log(dropResult);};},  
      collect: monitor => ({
        isDragging: !!monitor.isDragging(),
        item: !!monitor.getItem()
      }),
    }))
  
    const importedImg = require("../../../public" + chosenMap[item_id]
                        .find(o => o.growthStage === growthStage)["img-garden"] + ".png")
                        .default

    return (
      <div
        ref={drag}
        userid={userId}
        item_id={item_id}
        growthstage={growthStage}
        style={{
          opacity: isDragging ? 0.5 : 1,
          padding: '2px',
        }}
      >
      <img src={importedImg} alt='plant'></img> 
      </div>
    );
  };