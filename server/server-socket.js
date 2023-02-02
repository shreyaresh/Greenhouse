let io;
const Joi = require("joi");
const Garden = require("./models/garden");
const User = require("./models/user");

const userToSocketMap = {}; // maps user ID to socket object
const socketToUserMap = {}; // maps socket ID to user object

const getSocketFromUserID = (userid) => userToSocketMap[userid];
const getUserFromSocketID = (socketid) => socketToUserMap[socketid];
const getSocketFromSocketID = (socketid) => io.sockets.connected[socketid];

const addUser = (user, socket) => {
  const oldSocket = userToSocketMap[user._id];
  if (oldSocket && oldSocket.id !== socket.id) {
    // there was an old tab open for this user, force it to disconnect
    // FIXME: is this the behavior you want?
    oldSocket.disconnect();
    delete socketToUserMap[oldSocket.id];
  }

  userToSocketMap[user._id] = socket;
  socketToUserMap[socket.id] = user;
};

const removeUser = (user, socket) => {
  if (user) delete userToSocketMap[user._id];
  delete socketToUserMap[socket.id];
};

// move from one location to another
async function gardenItemUpdate (payload) {
  const io = this;
  const gardenSchema = Joi.object({
    gardenId: Joi.string(),
    userId: Joi.string(),
    old_position_x: Joi.number(),
    old_position_y: Joi.number(),
    position_x: Joi.number(),
    position_y: Joi.number(),
    item_id: Joi.string(),
    growthStage: Joi.number()
  })

  const { error, value } = gardenSchema.tailor("create").validate(payload, {
    abortEarly: false, // return all errors and not just the first one
    stripUnknown: true, // remove unknown attributes from the payload
  });

  if (error) {
     return {
      error: "Invalid payload.",
      errorDetails: error.details,
    };
  }
  // check if another item exists at location
  try{
  const alrExists  = await Garden.findOne({_id : payload.gardenId, items: {$elemMatch: {
    position_x: payload.position_x,
    position_y: payload.position_y  
  }}});
  
  if (alrExists) {
    return {
      error: "Item already exists at location."
    }
    }
  } catch {
    return {
      error: "Unable to query for existing item.",
    };
  }

  try{
  const updatedGarden =  await Garden.findOneAndUpdate({_id: payload.gardenId},
    { $set : {"items.$[item].position_x": payload.position_x, "items.$[item].position_y": payload.position_y}}, 
    {arrayFilters: [{ 
      "item.item_id": payload.item_id,
     "item.position_x": payload.old_position_x,
     "item.position_y": payload.old_position_y
      }],
    new: true,
    useFindAndModify: false});
    return { msg : "Success!", doc : updatedGarden};

  } catch {
    return {
      error: "Unable to query and update item."
    };
  }
}

async function gardenItemAdd(payload) {
  const gardenSchema = Joi.object({
    gardenId: Joi.string(),
    userId: Joi.string(),
    position_x: Joi.number(),
    position_y: Joi.number(),
    item_id: Joi.string(),
    growthStage: Joi.number()
  })

  const { error, value } = gardenSchema.tailor("create").validate(payload, {
    abortEarly: false, // return all errors and not just the first one
    stripUnknown: true, // remove unknown attributes from the payload
  });

  if (error) {
    return {
      error: "Invalid payload.",
      errorDetails: error.details,
    };
  } 
  // check if another item exists at location
  try {
  const alrExists  = await Garden.findOne({_id : payload.gardenId, items: {$elemMatch: {
    position_x: payload.position_x,
    position_y: payload.position_y  
  }}});
    if (alrExists) {
      return {
        error: "Item already exists at location.",
        errorDetails: error.details,
      };
    }
  } catch {
    return {
      error: "Unable to query for item.",
    };
  }


  try {
    const doNotOwn  = await User.findOne({_id : payload.userId, items: {$elemMatch: {
      item_id: payload.item_id,
      growthTime: payload.growthTime,
      growthStage: payload.growthStage,
      quantity: {$lt: 1}
    }}});

    if (doNotOwn) {
      return {
        error: "You do not own this item.",
        errorDetails: error.details,
      };
    }

    } catch {
      return {
        error: "Unable to query for item.",
      };
    }
   

  try {
    const enough = await User.find({_id: payload.userId, "inventory.item_id": payload.item_id, "inventory.growthStage" : payload.growthStage, "inventory.quantity": {$gt : 0}})
    if (!enough.length) {
      return { error: "Not enough items"};
    }
    await User.findByIdAndUpdate(payload.userId, {$inc: {"inventory.$[item].quantity" : -1}}, {arrayFilters: [{
      "item.item_id": payload.item_id,
      "item.growthStage": payload.growthStage
    }], useFindAndModify: false})

    const updatedGarden = await Garden.findOneAndUpdate({_id: payload.gardenId},
      { $addToSet : {items : {
        userId: payload.userId,
        position_x: payload.position_x,
        position_y: payload.position_y,
        item_id: payload.item_id,
        growthStage: payload.growthStage
      }}},
      {new:true,
      useFindAndModify: false}); 
      return {msg: "Success", doc: updatedGarden}
    
  } catch {
    return {
      error: "Unable to query and update for new item.",
    };
  }
}

async function gardenItemDelete (payload) {
  const gardenSchema = Joi.object({
    gardenId: Joi.string(),
    userId: Joi.string(),
    userIdCurrent: Joi.string(),
    position_x: Joi.number(),
    position_y: Joi.number(),
    item_id: Joi.string(),
    growthStage: Joi.number()
  });

   const { error, value } = gardenSchema.tailor("create").validate(payload, {
    abortEarly: false, // return all errors and not just the first one
    stripUnknown: true, // remove unknown attributes from the payload
  });

  if (error) {
    return {
      error: "Invalid payload.",
      errorDetails: error.details,
    };
  } 

  if (payload.userId !== payload.userIdCurrent) {
    return {
      err: "This plant belongs to your partner!"
    }
  };

  try{

    const exists = await User.findOne({_id: payload.userId, "inventory.item_id": payload.item_id, "inventory.growthStage": payload.growthStage});

    if (!exists) {
      await User.findByIdAndUpdate(payload.userId, 
        {$push: {inventory:  {
        item_id: payload.item_id,
        growthStage: payload.growthStage,
        quantity: 1
      }}}, {new:true});
    } else {
      await User.findOneAndUpdate({_id: payload.userId}, 
        {$inc: {"inventory.$[item].quantity" : 1}},
        {arrayFilters: [{
        "item.item_id": payload.item_id,
        "item.growthStage": payload.growthStage
      }], 
        useFindAndModify: false});
    }

    const updatedDoc = await Garden.findOneAndUpdate({_id: payload.gardenId},
      {$pull : {items: {item_id : payload.item_id, position_x: payload.position_x, position_y: payload.position_y}}},
      {new: true,
      useFindAndModify: false})

    return {msg: "Success", doc: updatedDoc}
  } catch(err) {
    return {
      err: "Unable to query"
    }
  }
}

module.exports = {
  init: (http) => {

    User.watch([{ $match: {operationType: {$in: ['update']}}}], {fullDocument: 'updateLookup'}).
      on('change', data => {
        ((getSocketFromUserID(String(data.fullDocument._id))) ? 
        getSocketFromUserID(String(data.fullDocument._id)).emit("updated", data.fullDocument) 
        : null);
      });


    io = require("socket.io")(http);
    
    io.on("connection", (socket) => {

      console.log(`socket has connected ${socket.id}`);
      socket.on("join", (roomId) => {
        console.log('joined room ', roomId.roomId);
        socket.join(roomId.roomId)
      })
      socket.on("leave", (roomId) => {
        socket.leave(roomId.roomId)
      })

      socket.on("garden:update", async (payload) => {
        res = await gardenItemUpdate(payload)
        if (res.doc) {
          io.in(payload.gardenId).emit('garden:update', res.doc);
        } else {
          console.log(res.err)
        }
      });
      socket.on("garden:add", async (payload) => {
        res = await gardenItemAdd(payload)
        if (res.doc) {
          io.in(payload.gardenId).emit('garden:add', res.doc);
        } else {
          console.log(res.err)
        }
      });
      socket.on("garden:delete", async (payload) => {
        res = await gardenItemDelete(payload)
        if (res.doc) {
          io.in(payload.gardenId).emit('garden:delete', res.doc);
        } else {
          console.log(res.err)
        }
      });    
  

      socket.on("disconnect", (reason) => {
        const user = getUserFromSocketID(socket.id);
        removeUser(user, socket);
      });
    });
  },

  addUser: addUser,
  removeUser: removeUser,

  getSocketFromUserID: getSocketFromUserID,
  getUserFromSocketID: getUserFromSocketID,
  getSocketFromSocketID: getSocketFromSocketID,
  getIo: () => io
};
