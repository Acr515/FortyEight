import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import FeedbackModalContext from '../../context/FeedbackModalContext';
import FeedbackModal from '../../components/FeedbackModal';
import './style.scss';

export default function FRAME() {
    const location = useLocation();

    // Controls the FeedbackModal
    const [modalText, setModalText] = useState("");
    const [modalRevealed, setModalRevealed] = useState(false);
    const [modalError, setModalError] = useState(false);
    const modalContextObject = {
        setModal: (text, isError) => {
            setModalText(text);
            setModalError(isError);
            setModalRevealed(true);
        },
        hideModal: () => {
            setModalRevealed(false);
        }
    };

    return (
        <div id="app-container">
            <div id="navigation-bar">
                <NavigationLink
                    link="/teams"
                    text="Teams"
                    location={location}
                />
                <NavigationLink
                    link="/form"
                    text="Create"
                    location={location}
                />
            </div>
            <div id="content-container">
                <FeedbackModal 
                    text={modalText}
                    revealed={modalRevealed}
                    isError={modalError}
                    revealFunction={setModalRevealed}
                />
                <FeedbackModalContext.Provider value={modalContextObject}>
                    <Outlet/>
                </FeedbackModalContext.Provider>
            </div>
        </div>
    );
}

function NavigationLink({link, text, location}) {
    return (
        <Link to={link} className={location.pathname.includes(link) ? "navigation-link active" : "navigation-link"}>
            {text}
        </Link>
    )
}