import React from "react";
import Layout from "../Layout.js";

export default function Landing(){
        return(
            <Layout loggedIn={false}>
            <div id="landing">

                <a href="/register">
                    <div className="start-button">
                        <h1>start your own garden</h1>
                    </div>
                </a>
                <div className="login-text">
                    <a href="/login">Log in</a>
                </div>

                {/* <img src={Greenhouse} alt="greenhouse" className="front-img"/> */}
            
                {/* <a href="https://docs.google.com/document/d/110JdHAn3Wnp3_AyQLkqH2W8h5oby7OVsYIeHYSiUzRs/edit?usp=sharing">
                    Check out this getting started guide
                </a> */}
            </div>
            </Layout>
        )
};
