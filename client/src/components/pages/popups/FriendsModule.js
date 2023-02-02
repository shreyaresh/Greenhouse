import React, { useState, useEffect} from 'react';
import { get, post } from '../../../utilities';
import ModalComponent from './Modal';
import FriendModal from './FriendModal';


export default function FriendsModule({friends}) {
    if (!friends) {
        friends = [];
    }
    const [long, setLong] = useState(false);
    const [results, setResults] = useState([]);
    const [send, setSend] = useState('');
    const [filteredResults, setFilteredResults] = useState([]);
    const [open, setOpen] = useState({open:false, friend:'', friendId:''})

    function loadAll (e) {
        if (long) {
            setLong(false);
        } else {
            setLong(true);
        }
        e.preventDefault()
        }

    
    useEffect(() => {
        get('/api/all')
        .then((res) => {
            setResults(res); 
            setFilteredResults(res);
        })
    }, [])

    function searchItems (searchValue) {
        const filtered = results.filter((item) => {
            return item.name.toLowerCase().includes(searchValue.toLowerCase())
        })

        setFilteredResults(filtered);
    }

    function handleRequest (e) {
        if (send !== ''){
        post('/api/make-request', {to: send, type: "friend-request"})
        .then((res) => {console.log(res); alert(res.msg || res.err)})
        } 
    }

    return(
       <div id = 'friendsModule'>
            <h2>Friends</h2>
            <div className="friends-list">
                    { (friends.length) ? friends.map((req, index) => {
                        return(
                            <div key={index} className='friend'>
                                <p className="text">{req.username}</p>
                                <FriendModal friend={req.username} friendId={req.id}/>
                            </div>
                        )
                    }) : <h3>Make a new friend!</h3>}
            </div>
            {long ? <p className="show-text" onClick={loadAll}>show more...</p> : <p className="show-text" onClick={loadAll}>show less</p>}
            <div className="empty">
                <div className="modal-buttonWrapper">
                <ModalComponent buttonText={"click here to send a friend request"}>
                    <input className='modal-search' type="search" placeholder='search...' onChange={(e) => searchItems(e.target.value)}/>
                        <div className='modal-list'>
                            {(filteredResults.length) ? filteredResults.map((req, index) => {
                            return(
                                ((send === req.name) ?
                                <div className="modal-name modal-chosen" onClick={(e) => {
                                    if (send === req.name) {
                                        setSend('');
                                    } else {
                                    setSend(req.name)
                                    }}} key={index}>
                                    {req.name}
                                </div>
                                : 
                                <div className="modal-name" onClick={(e) => setSend(req.name)} key={index}>
                                {req.name}
                                </div>)
                            )
                        }) : <></>}
                        </div>
                    <button className="modal-submit" onClick={handleRequest}>send request</button>
                </ModalComponent>
                </div>
            </div>
       </div>
    )

    }