import React, {useState, useEffect} from 'react';
import { get, post } from '../../../utilities';
import ReactModal from 'react-modal';

export default function FriendModal({ friend, friendId }) {

    const [gardens, setGardens] = useState([])
    const [open, setOpen] = useState(false);

    useEffect(() => {
        get('/api/gardens-with', { id : friendId })
        .then((res) => {console.log(res);setGardens(res);})
    },[])

    function handleAccess(e, gardenId, friend) {
        e.preventDefault();
        get('/api/garden-status', {gardenId : gardenId}).then((res) => {
            if (res.msg === "Garden already initialized"){
                navigate('/garden', {gardenId: gardenId})
            } 
            if (res.msg === "Wait for your partner to select a plant") {
                alert(res.msg);
            }
            if (res.msg === "Select a plant") {
                navigate('/create-garden', {state: {garden: gardenId, friend: friend}})
            }
        })
    }

    function dateParser(dateString) {
        const date = new Date(dateString)
        const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
        ];
        return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    }

    return (
        <>
        <div style={{width:'100%', height: '90%', position: 'absolute', display:'inline-block', zIndex:'0'}}onClick={() => setOpen(true)}></div>
        <ReactModal className='modal' onRequestClose={() => setOpen(false)} isOpen={open} style={{ overlay: {backgroundColor : 'rgba(0,0,0,0.5)'} , content: {
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: '#c1e2c2',
            borderRadius: '25px',
            border: 'solid 5px #8da350',
            height: 'fit-content',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
            }}} onClose={() => setOpen(false)} shouldCloseOnOverlayClick={true}>
                <div className='header' style={{display:'flex', justifyContent: 'flex-end', padding: '10px', position: 'relative', borderBottom: 'solid 2px #8da350'}}>
                    <button className="close" onMouseLeave={(e) => e.target.style.opacity="1"} onMouseOver={(e) => e.target.style.opacity = "0.6"} onClick={() => setOpen(false)} style={{display: 'flex', width: '20px', height: '20px', border: "solid 2px #8da350", borderRadius: '25px', background: 'none', cursor:"pointer", color:"#8da350", alignItems: 'center', justifyContent: 'center'}}>
                        X
                    </button>
                </div>
                <div className='content' style={{padding: '10px', display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'center'}}>
                    <h2 style={{margin:'2px', color:'#6f8531'}}>{friend}</h2>
                    <h3 style={{margin:0, color:'#8da350'}}> gardens that you share </h3>
                    <div className="modal-list">
                        {gardens.map((el, key) => {
                            const [id, name, created, verified, lastVisited] = el
                            return(
                            <div className="modal-garden" key={key} onClick={(e) => handleAccess(e,id)}>
                                {((name) ? <h3>{name}</h3> : <h3>"name your garden!"</h3>)}
                                <p> created on {dateParser(created)}</p>
                                <p>status: {((verified) ? "active" : "not active")}</p>
                                {((verified) ? <p> last visited on {dateParser(lastVisited)}</p> : <p>verify this garden!</p>)}
                            </div>
                            )
                        })}
                    </div>
                    <button className='modal-submit'>send a garden request</button>
                    <button className='modal-submit'>delete {friend}</button>
                </div>
            </ReactModal>
        </>
    );
}