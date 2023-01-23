const User = require("./models/user");
const FriendRequest = require('./models/friend-request');
const Garden = require('./models/garden');
const uuid = require("uuid");

async function sendNotification (id, type, type_id, content) {
    // const recipient = await User.getUser(id);
    
    // recipient.notifications.push({
    //     type: type,
    //     typeId: type_id,
    //     date: new Date(),
    //     content: content
    // })
    // recipient.save();

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
async function makeFriendRequest (req, res) {
    if (!req.user) {
        return res.status(400).send({msg: "Must be logged in."})
    }
    // don't add yourself
    if (req.user.name === req.body.to) {
        return res.status(400).send({msg: "You cannot add yourself!"})
    };

    const from_id = req.user._id;
    const to_name = req.body.to;
    const recipient = await User.findOne({name : to_name});

    if (recipient) {

        if (await FriendRequest.findOne({userIdFrom: from_id, userIdTo: recipient._id})){
            return res.status(400).send({ err: `Already sent friend request! ${existing}`})
        }

        if (await User.findOne({_id : from_id, "friends.username": req.body.to})) {
            return res.status(400).send({ err: 'Already friends with this user.' })
        }
    
        const newFriendRequest = new FriendRequest({
            friendReqId: uuid.v4(),
            userIdFrom: from_id,
            usernameFrom: req.session.user.name,
            userIdTo: recipient._id,
            usernameTo: recipient.name,
            status: '1'
        })     

        newFriendRequest.save();

        const notifContent = `${req.session.user.name} has sent you a friend request!`
        await sendNotification(recipient._id, 'friend-request', newFriendRequest.friendReqId, notifContent);
        console.log(recipient);
        return res.status(200).send({msg: 'Request successfully sent!'});
    }

    return res.send({err: 'Username does not exist.'});
}

// call when deciding a friend request: status, Notification type_id
async function handleFriendRequest (req, res) {
    const status = req.body.status;
    try {
        const friendRequestId = req.body.type_id;
        const request = await FriendRequest.getRequest(friendRequestId);
        const userFrom = await User.getUser(request.userIdFrom);
        const userTo = await User.getUser(request.userIdTo);

    if (status === '2') {
        await User.findByIdAndUpdate(request.userIdFrom, { $addToSet: { friends: {username: userTo.name, id: request.userIdTo}}});
        await User.findByIdAndUpdate(request.userIdTo, { $addToSet: { friends: {username: userFrom.name, id: request.userIdFrom}}});
        await FriendRequest.deleteOne({friendReqId: friendRequestId});
        await FriendRequest.deleteOne({ userIdTo: userFrom, userIdFrom: userTo });
        await sendNotification(request.userIdFrom, 'message', 'NaN', `${req.session.user.name} accepted your friend request!`);
        return res.status(200).send({msg: `Added friend request from ${request.usernameFrom}!`});
        };

    if (status === '3') {
        FriendRequest.deleteOne({friendReqId: friendRequestId});
        return res.status(200).send({msg: `Removed friend request.`})
    }

    } catch (err) {
        return res.status(500).send(err);
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

// returns array of the garden names, date created, and last visited shared with a friend id
async function gardensWith (req, res) {
    let gardensWithFriend = [];
    const friend = req.body.id;
    if (req.user) {
        let gardenObj;
        if (req.user.gardenIds.length){
            for (let gardenId of req.user.gardenIds) {
                let gardenObj = await Garden.findOne({_id: gardenId});
                if (gardenObj.userOneId === friend || gardenObj.userTwoId === friend) {
                  gardensWithFriend.push([gardenObj.name, gardenObj.dateCreated, gardenObj.lastVisited]);
                }
            }
        }
    return res.status(200).send(gardensWithFriend);
      }
    return res.status(400).send({ err: "Not logged in."});
  };

module.exports = {
    makeFriendRequest,
    handleFriendRequest,
    deleteFriend,
    gardensWith
  };
  