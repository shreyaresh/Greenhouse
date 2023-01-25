import React from "react";
import Layout from "../Layout.js";
import Greenhouse from '../../public/greenhouse-frontpage.gif';


export default function Landing(){

    return(
            <Layout loggedIn={false}>
            <div id="landing">
                <div className="front-wrap">
                    <img src={Greenhouse} className="img-container obj" alt="flowerbox"></img>
                    <a href="/register">
                        <div className="start-button obj">
                            <h1>start your own garden</h1>
                        </div>
                    </a>
                    <div className="login-text obj">
                        <a className = "login-text" href="/login">log in</a>
                    </div>
                </div>
            </div>
            </Layout>
        )
};
