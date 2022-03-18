import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import FeedbackModalContext from '../../context/FeedbackModalContext';
import DialogBoxContext from '../../context/DialogBoxContext';
import FeedbackModal from '../../components/FeedbackModal';
import './style.scss';
import DialogBox from '../../components/DialogBox';
import { VERSION_NAME } from '../../config';

var modalHideTimer = null;

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
            if (modalHideTimer != null) clearTimeout(modalHideTimer);
            modalHideTimer = setTimeout(() => { setModalRevealed(false) }, 10000);
        },
        hideModal: () => {
            setModalRevealed(false);
        }
    };

    // Controls the DialogBox
    const [dialogOptions, setDialogOptions] = useState({});
    const [dialogRevealed, setDialogRevealed] = useState(false);
    const hideDialog = () => {
        setDialogRevealed(false);
    }
    const dialogContextObject = {
        setDialog: options => {
            setDialogOptions(options); 
            setDialogRevealed(true);
        },
        hideDialog: hideDialog
    }

    return (
        <div id="app-container">
            <FeedbackModalContext.Provider value={modalContextObject}>
                <DialogBox
                    options={dialogOptions}
                    revealed={dialogRevealed}
                    revealFunction={hideDialog}
                />
                <DialogBoxContext.Provider value={dialogContextObject}>
                    <div id="navigation-bar">
                        <Link to={"/"} className="title-section">
                            <span className="number">48</span>
                            <span className="title">FortyEight</span>
                        </Link>
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
                        <NavigationLink
                            link="/manage"
                            text="Manage"
                            location={location}
                        />
                        <NavigationLink
                            link="/analysis/simulator"
                            text="Simulator"
                            location={location}
                        />
                        <div className="footer-content">
                            v{VERSION_NAME}
                        </div>
                    </div>
                    <div id="content-container">
                        <FeedbackModal 
                            text={modalText}
                            revealed={modalRevealed}
                            isError={modalError}
                            revealFunction={setModalRevealed}
                        />
                        <Outlet/>
                    </div>
                </DialogBoxContext.Provider>
            </FeedbackModalContext.Provider>
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