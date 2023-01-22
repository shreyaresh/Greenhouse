const User = require("./models/user");
const FriendRequest = require('./models/friend-request');
const socketManager = require("./server-socket");
const uuidv4 = require("uuid/v4");

async function sendNotification (id, type, type_id, content) {
    const recipient = await User.getUser(id);
    
    recipient.notifications.push({
        type: type,
        typeId: type_id,
        content: content
    })
    recipient.save();
}

// body: to: person you're friending
// status: 1 (sent, unread), 2(recieved, denied), 3(receieved, accepted)

// TO DO: not execute makeFriendRequest if they are already friends

async function makeFriendRequest (req, res) {
    const from_id = req.session.user.id;
    const recipient = await User.getUser(req.body.to)
    if (recipient.friends.)
    if (recipient) {
        const newFriendRequest = new FriendRequest({
            friendReqId: uuidv4(),
            Date: new Date(),
            userIdFrom: from_id,
            userIdTo: recipient.id,
            status: 1
        })     
        newFriendRequest.save();

        const notifContent = `${req.session.user.name} has sent you a friend request!`
        await sendNotification(recipient.id, 'friend-request', newFriendRequest.friendReqId, notifContent);

        return res.status(200).send({msg: 'Request successfully sent!'});
    }

    return res.send({err: 'Username does not exist.'});
}

// call when deciding a friend request
async function handleFriendRequest (req, res) {
    const status = req.body.status;
    const friendRequestId = req.body.type_id;
    const request = await FriendRequest.getRequest(friendRequestId);
    const userIdFrom = await User.getUser(request.userIdFrom);
    const userIdTo = await User.getUser(request.userIdTo);
    if (status === '2') {
        User.updateOne(
                { _id: person._id }, 
                { $addToSet: { friends: friend } }
              );
              
        );
        


        userIdFrom.friends.push(request.userIdTo);
        userIdTo.friends.push()
    }
    


    // if accepted, delete extra request


}

