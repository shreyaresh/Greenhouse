import React, { useState, useEffect} from 'react';
import { useLocation } from 'react-router-dom';
import { get, post } from '../../utilities';
import Layout from '../Layout.js';
import hyacinth from '../../public/hyacinth.png';
import lilies from '../../public/lilies.png';
import hydrangeas from '../../public/hydrangeas.png';
import sunflower from '../../public/sunflowers.png';
import { observe, MiniGarden } from '../modules/MiniGarden';

export default function CreateGarden () {

    const [position, setPosition] = useState([4,4])
    const [plant, setPlant] = useState('68e272d4-caa1-416d-85b6-dbfd01c97f16')
    const [name, setName] = useState('');
    const friendName = useLocation().state.friend
    const gardenId = useLocation().state.garden
    
    function changePlant(e) {
        e.preventDefault();
        const plant = e.target.value;
        if (plant === 'hyacinth') {
            setPlant('8b494f1f-aa63-4134-a2fa-f6f07216a448');
        } else if (plant === 'sunflower') {
            setPlant('e0fd2b8a-3585-4380-ba79-d5ca524fdebe');
        } else if (plant === 'lilies') { 
            setPlant('68e272d4-caa1-416d-85b6-dbfd01c97f16');
        } else if (plant === 'hydrangeas') { 
            setPlant('5540a077-31bd-41de-8ef1-da91b7dbb289');
        }
    }

    useEffect(() => {
        observe((position) => setPosition(position))
        }, [])

    function handleSubmit(e) {
        e.preventDefault()
        post('/api/create-garden', {id: gardenId, name: name, x_pos: position[0], y_pos: position[1], item_id : plant})
        .then((res) => console.log(res.msg || res.err))
    }


    
    return (
    <Layout loggedIn={true}>
        <div id="create-garden-page-container">
            <form name="info" onSubmit={handleSubmit} method="POST">
            <div className="naming-container">
                <div className="header-text">
                    <h1>excited to grow together with {friendName}?</h1>
                    <h2>your new garden is named</h2>
                </div>
                <div className='name-form'>
                    <input type="text" 
                        placeholder={"cheerio"}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <div className="line"></div>
                </div>
            </div>
            <div className='columns-wrap'>
                <div className='column'>
                    <div className='choose-wrapper'>
                        <h2>choose a starter plant to grow!</h2>
                        <div className='items'>
                            <div className='item'>
                                <input id="hyacinth" className="radioButton" type="radio" name="plant" value="hyacinth" onChange={(e) => changePlant(e)}></input>
                                <label htmlFor="hyacinth">
                                    <img src={hyacinth} alt='hyacinth'></img> 
                                </label>
                                <h3>hyacinth</h3>
                            </div>
                            <div className='item'>
                                <input id="sunflower" type="radio" className="radioButton" name="plant" onChange={(e) => changePlant(e)} value="sunflower"></input>
                                <label htmlFor="sunflower">
                                <img src={sunflower} alt='sunflower'></img> 
                                </label>
                                <h3>sunflower</h3>
                            </div>
                            <div className='item'>
                                <input id="lilies" type="radio" className="radioButton" name="plant" onChange={(e) => changePlant(e)} value="lilies"></input>
                                <label htmlFor="lilies">
                                    <img src={lilies} alt='lilies'></img> 
                                </label>
                                <h3>lilies</h3>
                            </div>
                            <div className='item'>
                                <input id="hydrangeas" type="radio" className="radioButton" name="plant" onChange={(e) => changePlant(e)} value="hydrangeas"></input>
                                <label htmlFor="hydrangeas">
                                    <img src={hydrangeas} alt='hydrangeas'></img> 
                                </label>
                                <h3>hydrangeas</h3>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='column'>
                    <div className='plant-display-wrapper'>
                        <h3>move your plant to where you want it to grow</h3>
                    <div className='garden'>
                        <MiniGarden position={position} plant={plant}/>
                    </div>
                    <div className='submit-form'>
                        <input type="submit" className='submit' value="Submit"/>
                    </div>
                </div>
                </div>
            </div>
            </form>
        </div>
        </Layout>
        );
}