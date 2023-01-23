const User = require("./models/user");
const FriendRequest = require('./models/friend-request');
const Garden = require('./models/garden');
const uuidv4 = require("uuid/v4");

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
    const from_id = req.session.user._id;
    const recipient = await User.getUser(req.body.to)
    if (recipient.friends.includes(from_id)) {
        return res.status(400).send({err: 'Already friends with this user.'})
    }
    if (recipient) {
        const newFriendRequest = new FriendRequest({
            friendReqId: uuidv4(),
            userIdFrom: from_id,
            usernameFrom: req.session.user.name,
            userIdTo: recipient._id,
            usernameTo: recipient.name,
            status: '1'
        })     
        newFriendRequest.save();

        const notifContent = `${req.session.user.name} has sent you a friend request!`
        await sendNotification(recipient._id, 'friend-request', newFriendRequest.friendReqId, notifContent);

        return res.status(200).send({msg: 'Request successfully sent!'});
    }

    return res.send({err: 'Username does not exist.'});
}

// call when deciding a friend request: status, Notification type_id
async function handleFriendRequest (req, res) {
    const status = req.body.status;
    const friendRequestId = req.body.type_id;
    const request = await FriendRequest.getRequest(friendRequestId);

    if (status === '2') {
        await User.updateOne(
                { _id: request.userIdFrom }, 
                { $addToSet: { friends: request.userIdTo } }
              );
        await User.updateOne(
                { _id: request.userIdTo }, 
                { $addToSet: { friends: request.userIdFrom } }
              );
        FriendRequest.remove(request);
        FriendRequest.remove(await FriendRequest.alreadyExists(request.userIdFrom, request.userIdTo));
        await sendNotification(request.userIdFrom, 'message', 'NaN', `${req.session.user.name} accepted your friend request!`);
        return res.status(200).send({msg: `Added friend request from ${request.usernameFrom}!`});
        };

    if (status === '3') {
        FriendRequest.remove(request);
        return res.status(200).send({msg: `Removed friend request.`})
    } 

    return res.status(500).send({err: "Internal Server Error."});
}

// body: friend id, username
async function deleteFriend (req, res) {
    try {
        const toDelete = req.body.id;
        await User.updateOne(
            {_id: req.session.user._id}, 
            {$pull: { friends: toDelete}});
        await User.updateOne(
            {id: toDelete}, 
            {$pull: { friends: req.session.user._id}});
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
      for (let gardenId of req.user.gardenIds) {
        let gardenObj = await Garden.findOne({_id: gardenId});
        if (gardenObj.userOneId === friend || gardenObj.userTwoId === friend) {
          gardensWithFriend.push([gardenObj.name, gardenObj.dateCreated, gardenObj.lastVisited]);
        }
    return res.status(200).send(gardensWithFriend);
      }
    }
  }

module.exports = {
    makeFriendRequest,
    handleFriendRequest,
    deleteFriend,
    gardensWith
  };
  