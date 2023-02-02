import React, { useState, useEffect} from 'react';
import { get, post } from '../../../utilities';
import { useNavigate } from 'react-router-dom';
import one from '../../../public/garden-icon-1.png';
import two from '../../../public/garden-icon-2.png';
import three from '../../../public/garden-icon-3.png';
import ModalComponent from './Modal';


// TO DO: fix image imports

export default function GardensModule({gardens}) {
    const [greyedOut, setGreyedOut] = useState({grey: false, message:''});
    const [friends, setFriends] = useState([]);
    const [send, setSend] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [filteredResults, setFilteredResults] = useState([]);
    const navigate = useNavigate();

    function handleAccess(e, gardenId, friend) {
        e.preventDefault();
        get('/api/garden-status', {gardenId : gardenId}).then((res) => {
            if (res.msg === "Garden already initialized"){
                navigate('/garden', {gardenId: gardenId})
            } 
            if (res.msg === "Wait for your partner to select a plant") {
                setGreyedOut({grey: true, message: res.msg})
            }
            if (res.msg === "Select a plant") {
                navigate('/create-garden', {state: {garden: gardenId, friend: friend}})
            }
        })
    }

    useEffect(() => {
        get('/api/friends')
        .then((res) => {setFriends(res); setFilteredResults(res)})
    }, [])


    function searchItems (searchValue) {
        setSearchInput(searchValue)
        const filtered = friends.filter((item) => {
            return item.username.toLowerCase().includes(searchInput.toLowerCase())
        })

        setFilteredResults(filtered);
    }

    function handleRequest (e) {
        if (send !== ''){
        post('/api/make-request', {to: send, type: "garden-request"})
        .then((res) => alert(res.msg))
        } 
    }


    setTimeout(()=> setGreyedOut({grey: false, message:''}), 5000);

    return(
       <div id = 'gardensModule'>
            <h2>Gardens</h2>
            <div className="gardens-list">
                { (gardens.length) ? 
                    gardens.map((req, index) => {
                        const mapping = {1: "1", 2: two, 3:three}; 
                        if (req[1] === ''){
                            req[1] = "Choose your garden name here!";
                        };
                        console.log(req)
                        return(
                            <div key={index} className='garden' onClick={(e) => handleAccess(e, req[2], req[4])}>
                                <div className='img-wrapper'>
                                <img src={three} alt="garden icon"></img>
                                </div>
                                <h3>{req[1]}</h3>
                                <p>Garden with {req[4]}</p>
                                {(greyedOut.grey ? <div className="grey">
                                    {greyedOut.message}
                                    </div>:<></>)}
                            </div>
                            )
                    }) 
                    :
                    <div className="empty">
                        <h3>Start a new garden!</h3>
                        <div className="modal-buttonWrapper">
                        <ModalComponent buttonText={"click here to send a garden request"}>
                            <input className='search' type="search" placeholder='search...' onChange={(e) => searchItems(e.target.value)}/>
                                <div className='list'>
                                    {(filteredResults.length) ? filteredResults.map((req, index) => {
                                    return(
                                        ((send === req.username) ?
                                        <div className="name chosen" onClick={(e) => {
                                            if (send === req.username) {
                                                setSend('');
                                            } else {
                                            setSend(req.username)
                                            }}} key={index}>
                                            {req.username}
                                        </div>
                                        : 
                                        <div className="name" onClick={(e) => setSend(req.username)} key={index}>
                                        {req.username}
                                        </div>)
                                    )
                                }) : <></>}
                                </div>
                            <button className="submit" onClick={handleRequest}>send request</button>
                        </ModalComponent>
                        </div>
                    </div>
                }
            </div>
        </div>
    )
}