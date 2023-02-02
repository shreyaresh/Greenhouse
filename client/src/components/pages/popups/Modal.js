import React, { useState } from 'react';
import ReactModal from 'react-modal';

ReactModal.setAppElement("#root");

export default function ModalComponent ({buttonText, children}) {
    const [open, setOpen] = useState(false);

    return (
    <div id='m'>
    <button className="modal-button" onClick={() => setOpen(true)}>{buttonText}</button>
    <ReactModal className='modal' isOpen={open} style={{ overlay: {backgroundColor : 'rgba(0,0,0,0.5)'} , content: {
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
            {children}
        </div>
    </ReactModal>
    </div>);
}