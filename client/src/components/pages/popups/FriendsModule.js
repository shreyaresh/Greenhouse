import React, { useState, useEffect} from 'react';


export default function FriendsModule({friends}) {
    if (!friends) {
        friends = [];
    }
    const [long, setLong] = useState(false);

    function loadAll (e) {
        if (long) {
            setLong(false);
        } else {
            setLong(true);
        }
        e.preventDefault()
        }

    return(
       <div id = 'friendsModule'>
            <h2>Friends</h2>
            <div className="friends-list">
                    { (friends.length) ? friends.map((req, index) => {
                        return(
                            <div key={index} className='friend'>
                                <p className="text">{req.username}</p>
                            </div>
                        )
                    }) : <p>Make a new friend!</p>}
            </div>
            {long ? <p className="show-text" onClick={loadAll}>show more...</p> : <p className="show-text" onClick={loadAll}>show less</p>}

       </div>
    )

    }