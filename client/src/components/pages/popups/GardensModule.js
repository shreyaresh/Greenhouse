import React, { useState, useEffect} from 'react';
import { get, post } from '../../../utilities';
import { useNavigate } from 'react-router-dom';
import one from '../../../public/garden-icon-1.png';
import two from '../../../public/garden-icon-2.png';
import three from '../../../public/garden-icon-3.png';


// TO DO: fix image imports

export default function GardensModule({gardens}) {
    const [greyedOut, setGreyedOut] = useState({grey: false, message:''});
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
                    <>
                    <h3>Start a new garden!</h3>
                    </>
                }
            </div>
        </div>
    )
            }