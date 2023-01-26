let io;
const Joi = require("joi");
const Garden = require("./models/garden");
const User = require("./models/user");
const { FriendRequest } = require('./models/request');

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
  const socket = this;
  const gardenSchema = Joi.object({
    gardenId: Joi.string(),
    userId: Joi.string(),
    growthTime: Joi.number(),
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
    return callback({
      error: "Invalid payload.",
      errorDetails: error.details,
    });
  }
  // check if another item exists at location
  try{
  const alrExists  = await Garden.findOne({_id : payload.gardenId, items: {$elemMatch: {
    position_x: payload.old_position_x,
    position_y: payload.old_position_y  
  }}});
  } catch {
    return callback({
      error: "Unable to query for existing item.",
    });
  }

  if (alrExists) {
    return callback({
      error: "Item already exists at location."
    })
  }

  try{
  const updatedGarden =  await Garden.findByIdAndUpdate(payload.gardenId,
    { $set : {"items.$[item].position_x": payload.position_x, "items.$[item].position_y": payload.position_y }}, 
    {arrayFilters: [{
      "item.item_id": item_id,
      "item.position_x": payload.old_position_x,
      "item.position_y": payload.old_position_y
    }]},
    {new:true}
  );
    socket.to(payload.gardenId).emit('garden:update', updatedGarden);

  } catch {
    return callback({
      error: "Unable to query and update item."
    });
  }
}

async function gardenItemAdd(payload) {
  const socket = this;
  const gardenSchema = Joi.object({
    gardenId: Joi.string(),
    userId: Joi.string(),
    growthTime: Joi.number(),
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
    return callback({
      error: "Invalid payload.",
      errorDetails: error.details,
    });
  } 
  // check if another item exists at location
  try {
  const alrExists  = await Garden.findOne({_id : payload.gardenId, items: {$elemMatch: {
    position_x: payload.position_x,
    position_y: payload.position_y  
  }}});
  } catch {
    return callback({
      error: "Unable to query for item.",
    });
  }
  if (alrExists) {
    return callback({
      error: "Item already exists at location.",
      errorDetails: error.details,
    });
  }

  try {
    const doNotOwn  = await User.findOne({_id : payload.userId, items: {$elemMatch: {
      item_id: payload.item_id,
      growthTime: payload.growthTime,
      growthStage: payload.growthStage,
      quantity: {$lt: 1}
    }}});
    } catch {
      return callback({
        error: "Unable to query for item.",
      });
    }
    if (doNotOwn) {
      return callback({
        error: "You do not own this item.",
        errorDetails: error.details,
      });
    }

  // to consider: user can take an item out and essentially reset growth time periodically
  try {
    await User.findByIdAndUpdate(payload.userId, {$inc: {"inventory.$[item].quantity" : -1}}, {arrayFilters: [{
      "item.item_id": item_id,
      "item.growthStage": payload.growthStage,
      "item.growthStage": payload.growthTime
    }]})
    const updatedGarden = await Garden.findByIdAndUpdate(payload.gardenId,
      { $addToSet : {items : {
        userId: userId,
        growthTime: growthTime,
        position_x: position_x,
        position_y: position_y,
        item_id: item_id,
        growthStage: growthStage
      }}},
      {new:true}); 
      socket.to(payload.gardenId).emit('garden:add', updatedGarden);
  } catch {
    return callback({
      error: "Unable to query and update for new item.",
    });
  }
}

async function gardenItemDelete (payload, res) {
  const socket = this;
  const gardenSchema = Joi.object({
    gardenId: Joi.string(),
    userId: Joi.string(),
    userIdCurrent: Joi.string(),
    growthTime: Joi.number(),
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
    return callback({
      error: "Invalid payload.",
      errorDetails: error.details,
    });
  } 

  if (payload.userId !== payload.userIdCurrent) {
    return callback({
      err: "This plant belongs to your partner!"
    })
  };

  try{
   const updatedDoc = await User.findByIdAndUpdate(payload.userId, {$inc: {"inventory.$[item].quantity" : 1}}, {arrayFilters: [{
    "item.item_id": item_id,
    "item.growthStage": payload.growthStage,
    "item.growthStage": payload.growthTime
  }]}, 
    {new: true});
    socket.emit("updated", {userId: payload.userId});
    socket.to(payload.gardenId).emit('garden:delete', updatedDoc);
  } catch {
    return callback({
      err: "Unable to query and update item."
    })
  }
}


User.watch([{ $match: {operationType: {$in: ['update']}}}], {fullDocument: 'updateLookup'}).
      on('change', data => {
        ((getSocketFromUserID(String(data.fullDocument._id))) ? getSocketFromUserID(String(data.fullDocument._id)).emit("updated", data.fullDocument) : null);
      });

module.exports = {
  init: (http) => {
    io = require("socket.io")(http);
    
    io.on("connection", (socket) => {

      console.log(`socket has connected ${socket.id}`);
      socket.on("garden:update", gardenItemUpdate);
      socket.on("garden:add", gardenItemAdd);
      socket.on("garden:delete", gardenItemDelete);
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
