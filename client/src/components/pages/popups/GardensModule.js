import React, { useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import one from '../../../public/garden-icon-1.png';
import two from '../../../public/garden-icon-2.png';
import three from '../../../public/garden-icon-3.png';


export default function GardensModule({gardens}) {

    const [greyedOut, setGreyedOut] = useState({grey: false, message:''})

    function handleAccess(gardenId) {
        router.post('/api/garden-access', {id : gardenId}).then((res) => {
            if (res.status === 200){
                navigate(`/garden?${gardenId}`, {replace: true})
            } else {
                setGreyedOut({grey: true, message: res.err})
            }
        })
    }

    useEffect(()=>{
        setTimeout(()=> setGreyedOut({grey: false, message:''}), 3000);
    }, [handleAccess])

    return(
       <div id = 'gardensModule'>
            <h2>Gardens</h2>
            <div className="gardens-list">
                    { (gardens.length) ? gardens.map((req, index) => {
                        const mapping = {"1": one, "2": two, "3":three}
                        chosen = mapping.req[0]
                        return(
                            <div key={index} className='garden' onClick={handleAccess(req[2])}>
                                <img src={chosen} alt="garden icon"></img>
                                <h5>{req[1]}</h5>
                                <p>Garden with {req[4]}</p>
                            </div>
                        )
                    }) : <p>Start a new garden!</p>}
            </div>
       </div>
    )

    }