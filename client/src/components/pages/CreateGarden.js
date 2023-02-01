import React, { useState, useEffect} from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { get, post } from '../../utilities';
import Layout from '../Layout.js';
import hyacinth from '../../public/hyacinth.png';
import lilies from '../../public/lilies.png';
import hydrangeas from '../../public/hydrangeas.png';
import sunflower from '../../public/sunflowers.png';
import { observe, MiniGarden } from '../modules/MiniGarden';

export default function CreateGarden () {

    // function changeImage(e) {
    //     e.preventDefault();
    //     if (document.getElementById("hyacinth").checked) {
    //     document.getElementById("picture").src = "https://pbs.twimg.com/profile_images/447374371917922304/P4BzupWu.jpeg";
    //     } else if (document.getElementById("sunflower").checked) { 
    //     document.getElementById("picture").src = "http://cutewallpaperss.com/wp-content/uploads/2015/01/cute_cats__cats_picture_cute_wallpaperss_hd_for_mobile.jpg";
    //     } else if (document.getElementById("lilies").checked) { 
    //     document.getElementById("picture").src = "http://cutewallpaperss.com/wp-content/uploads/2015/01/cute_cats__cats_picture_cute_wallpaperss_hd_for_mobile.jpg";
    //     } else if (document.getElementById("hydrangeas").checked) { 
    //     document.getElementById("picture").src = "http://cutewallpaperss.com/wp-content/uploads/2015/01/cute_cats__cats_picture_cute_wallpaperss_hd_for_mobile.jpg";
    //     }
    // }

    const [position, setPosition] = useState([4,4])
    const friendName = useLocation().state.friend
    const gardenId = useLocation().state.garden

    // observe((position) => setPosition(position));

    // function changePlant(e) {
    //     e.preventDefault();
    //     console.log(e);
    // }

    function handleSubmit(e) {
        e.preventDefault()
        post('/api/create-garden', {id: gardenId, name: name, })
    }

    const [name, setName] = useState('');

    
    return (
    <Layout loggedIn={true}>
        <div id="create-garden-page-container">
            <form name="info" onSubmit={handleSubmit} method="POST">
            <div className="naming-container">
                <div className="header-text">
                    <h1>excited to grow together with ${friendName}?</h1>
                    <h3>your new garden is named</h3>
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
                                <input id="hyacinth" className="radioButton" type="radio" name="plant" value="hyacinth"></input>
                                <label htmlFor="hyacinth">
                                    <img src={hyacinth} alt='hyacinth'></img> 
                                </label>
                                <h3>hyacinth</h3>
                            </div>
                            <div className='item'>
                                <input id="sunflower" type="radio" className="radioButton" name="plant" value="sunflower"></input>
                                <label htmlFor="sunflower">
                                <img src={sunflower} alt='sunflower'></img> 
                                </label>
                                <h3>sunflower</h3>
                            </div>
                            <div className='item'>
                                <input id="lilies" type="radio" className="radioButton" name="plant" value="lilies"></input>
                                <label htmlFor="lilies">
                                    <img src={lilies} alt='lilies'></img> 
                                </label>
                                <h3>lilies</h3>
                            </div>
                            <div className='item'>
                                <input id="hydrangeas" type="radio" className="radioButton" name="plant" value="hydrangeas"></input>
                                <label htmlFor="hydrangeas">
                                    <img src={hydrangeas} alt='hydrangeas'></img> 
                                </label>
                                <h3>hydrangras</h3>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='column'>
                    <div className='plant-display-wrapper'>
                        <h3>move your plant to where you want it to grow</h3>
                    <div className='garden'>
                        {/* <MiniGarden position={position}/> */}
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