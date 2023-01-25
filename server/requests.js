const User = require("./models/user");
const { GardenRequest, FriendRequest } = require('./models/request');
const Garden = require('./models/garden');
const uuid = require("uuid");


async function sendNotification (id, type, type_id, content) {
    await User.updateOne(
        { _id: id }, 
        { $push: { notifications: {
                type: type,
                typeId: type_id,
                date: new Date(),
                content: content
                } 
            } 
        }
      );
}

// sends a friend request: to (other person's username)
async function makeRequest (req, res) {
    const requestType = ((req.body.type === "friend-request") ? FriendRequest : GardenRequest);

    console.log(req.user)
    
    if (!req.user) {
        console.log('failed at login')
        return res.status(400).send({err: "Must be logged in."})
    }
    // don't add yourself
    if (req.user.name === req.body.to) {
        console.log('self add')
        return res.status(400).send({err: "You cannot add yourself!"})
    };

    const from_id = req.user._id;
    const to_name = req.body.to;
    const recipient = await User.findOne({name : to_name});

    if (recipient) {

        if (await requestType.findOne({userIdFrom: from_id, userIdTo: recipient._id})){
            console.log('req sent')
            return res.status(400).send({ err: `Already sent request!`})
        }

        if (req.body.type === "friend-request" &&  await User.findOne({_id : from_id, "friends.username": req.body.to})) {
            console.log('alr friends')
            return res.status(400).send({ err: 'Already friends with this user.' })
        }
        if (req.body.type === "garden-request" && !(await User.findOne({_id : from_id, "friends.username": req.body.to}))){
            console.log('not friends')
            return res.status(400).send({err : "Not friends with this user."})
        }
    
        const id_type = ((req.body.type === 'friend-request') ? 'friendReqId' : 'gardenReqId');

        const request_template = {
            userIdFrom: from_id,
            usernameFrom: req.session.user.name,
            userIdTo: String(recipient._id),
            usernameTo: recipient.name,
            status: '1',
            [id_type] : uuid.v4()
        };
        const newRequest = new requestType(request_template);   

        newRequest.save();

        const notifContent = `${req.session.user.name} has sent you a ${req.body.type.split('-')[0]} request!`;
        await sendNotification(recipient._id, req.body.type, request_template[id_type], notifContent);
        return res.status(200).send({msg: 'Request successfully sent!'});
    }

    return res.send({err: 'Username does not exist.'});
}

// call when deciding a friend request: status, Notification type_id
async function handleRequest (req, res) {
    const status = req.body.status;
    const requestType = ((req.body.type === "friend-request") ? FriendRequest : GardenRequest);
    // try {
    const requestId = req.body.type_id;
    const requestIdField = ((req.body.type === "friend-request") ? "friendReqId" : "gardenReqId");
    const request = await requestType.findOne({[requestIdField]: requestId});
    console.log(request);
    const userFrom = await User.getUser(request.userIdFrom);
    const userTo = await User.getUser(request.userIdTo);
    const addToField = ((req.body.type === "friend-request") ? "friends" : "gardenIds");

    if (status === '2') {
        if (req.body.type === "friend-request") {
            await User.findByIdAndUpdate(userFrom._id, { $addToSet: { [addToField]: {username: userTo.name, id: userTo._id}}});
            await User.findByIdAndUpdate(userTo._id, { $addToSet: { [addToField] : {username: userFrom.name, id: userFrom._id}}});
        }
        if (req.body.type === "garden-request") {
            const newGarden = Garden({
                name: null,
                userIds: [userFrom._id, userTo._id],
                dateCreated: new Date(),
                isVerified: false,
                lastVisited: null,
                items: []
            });
            newGarden.save();
            await User.findByIdAndUpdate(userFrom._id, { $addToSet: { [addToField]: newGarden._id}});
            await User.findByIdAndUpdate(userTo._id, { $addToSet: { [addToField] : newGarden._id}});              
        }
        await requestType.deleteOne({[requestIdField]: requestId});
        await requestType.deleteOne({ userIdTo: userFrom._id, userIdFrom: userTo._id});
        await sendNotification(request.userIdFrom, 'message', 'NaN', `${req.session.user.name} accepted your ${req.body.type.split('-')[0]} request!`);
        return res.status(200).send({msg: `Accepted ${req.body.type.split('-')[0]} request from ${request.usernameFrom}!`});
    };

    if (status === '3') {
        FriendRequest.deleteOne({[requestIdField]: requestId});
        return res.status(200).send({msg: `Removed ${req.body.type.split('-')[0]} request.`})
    }

}

// body: friend id, username
async function deleteFriend (req, res) {
    try {
        const toDelete = req.body.username;
        await User.findByIdAndUpdate(req.session.user._id, {$pull: { friends: {username: toDelete}}});
        await User.findByIdAndUpdate(req.body.id, {$pull: { friends: {username: req.session.user.name}}});
        res.status(200).send({msg: `Friend ${req.body.username} deleted!`})
          
    } catch(err) {
        console.log(err);
        res.status(500).send({ err: err });
    }
}

async function deleteGarden (req, res) {
    try {
        const toDelete = req.body.id;
        const garden = await Garden.findById(toDelete);
        const gardenNameStore = garden.name
        for (const user of garden.userIds) {
            User.findByIdAndUpdate(user, {$pull: { gardenIds: toDelete}});
        }
        res.status(200).send({msg: `Garden ${gardenNameStore} deleted!`});
          
    } catch(err) {
        console.log(err);
        res.status(500).send({ err: err });
    }
}


// returns array of the garden names, date created, verification status, and last visited shared with a friend id
async function gardensWith (req, res) {
    let gardensWithFriend = [];
    const friend = req.body.id;
    if (req.user) {
        if (req.user.gardenIds.length){
            for (const gardenId of req.user.gardenIds) {
                const gardenObj = await Garden.findById(gardenId);
                const friend_id  = gardenObj.userIds.filter(function (el) {return el !== String(req.user._id);})
                if (friend_id === friend) {
                  gardensWithFriend.push([gardenObj.name, gardenObj.dateCreated, gardenObj.isVerified, gardenObj.lastVisited]);
                }
            }
        }
    return res.status(200).send(gardensWithFriend);
      }
    return res.status(400).send({ err: "Not logged in."});
  };

module.exports = {
    makeRequest,
    handleRequest,
    deleteFriend,
    deleteGarden,
    gardensWith
  };
  