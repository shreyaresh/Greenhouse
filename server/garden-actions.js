const User = require("./models/user");
const Garden = require("./models/garden");

// // TO-DO: Write these functions

async function createGarden (req, res) {
    const gardenId = req.body.id;
    const gardenName = req.body.name;
    const gardenObj = await Garden.findById(gardenId);
    // change to garden object in later iterations, hardcode for now
    const gardenRadius = 4;
    
    if (gardenObj.isVerified){
        return res.status(400).send({err : "The garden is already initialized!"})
    };

    if (Math.abs(parseInt(req.body.x_pos)) > gardenRadius || Math.abs(parseInt(req.body.y_pos)) > gardenRadius ) {
        return res.status(400).send({err : "The selected location is outside garden area."})
    }

    if (gardenObj.items.length && gardenObj.items[0].userId === req.user._id) {
        return res.status(400).send({ err: `You've already chosen your plant!` })
    };

    // if not verified AND the item is not yours, add yours
    await Garden.findByIdAndUpdate(gardenId, {$push : {items: {
        userId: req.user._id,
        position_x: req.body.x_pos,
        position_y: req.body.y_pos,
        item_id: req.body.item_id,
        growthStage: 1
        }
    }});

    console.log(`Garden object: ${gardenObj}`);

    if (gardenObj.items.length + 1 === 2){
        await Garden.findByIdAndUpdate(gardenId, {isVerified : true, dateVerified: new Date()});
        return res.status(200).send({ msg: `Garden ${gardenName} initialized!`});
    };

    return res.status(200).send({ msg: "Successfully chose your own plant! Hang tight until your partner chooses theirs."});
};


async function gardenAccess (req, res) {
    try {
        const garden = await Garden.findById(req.body.id);
        if (!garden.isVerified){
            return res.status(403).send({err : "Both you and your partner must choose a plant in order to start a garden!"})
        }
        if (!(garden.userIds.indexOf(req.user._id) >= 0)) {
            return res.status(403).send({err : "Unfortunately, you're not a caretaker of this garden."})
        }
        const rightNow = Date();
        
        for (item of garden.items){
            item.growthStage += Math.floor((rightNow.getTime() - lastVisited.getTime()), item.growthTime);
        }

        garden.lastVisited = rightNow;
        garden.save();

        return res.status(200).send({ msg : "Successfully updated your garden! Redirecting..."});

    } catch(err){
        return res.send(err);
    }
}


// sockets for in-game play
// TO DO: add socket for adding and removing items