import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { DEVELOP_MODE, VERSION_NAME } from '../../config';
import FeedbackModal from 'components/FeedbackModal';
import DialogBox from 'components/DialogBox';
import FeedbackModalContext from 'context/FeedbackModalContext';
import DialogBoxContext from 'context/DialogBoxContext';
import gameData from 'util/gameData';
import PlayoffHelperContext from 'context/PlayoffHelperContext';
import PlayoffHelperFunctions, { clonePlayoffHelper, PlayoffHelperData } from 'data/PlayoffHelperData';
import './style.scss';

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
    };
    const dialogContextObject = {
        setDialog: options => {
            setDialogOptions(options); 
            setDialogRevealed(true);
        },
        hideDialog: hideDialog
    };

    // Sets up context for the playoff helper - not the best way of doing this, but only way for a complex object
    const [playoffHelper, setPlayoffHelper] = useState(clonePlayoffHelper(PlayoffHelperData));
    const playoffHelperContextObject = {
        data: playoffHelper,
        setter: setPlayoffHelper,
        flush: () => PlayoffHelperFunctions.flush(playoffHelper, setPlayoffHelper),
        reset: () => PlayoffHelperFunctions.reset(playoffHelper, setPlayoffHelper),
        getTeam: (teamNumber) => PlayoffHelperFunctions.getTeam(playoffHelper, teamNumber),
        pickTeam: (teamNumber) => PlayoffHelperFunctions.pickTeam(playoffHelper, setPlayoffHelper, teamNumber),
        declineTeam: (teamNumber) => PlayoffHelperFunctions.declineTeam(playoffHelper, setPlayoffHelper, teamNumber),
        setup: (mode, backupSelections) => PlayoffHelperFunctions.setup(playoffHelper, setPlayoffHelper, mode, backupSelections),
        getTBARankings: (eventKey, failureCallback) => PlayoffHelperFunctions.getTBARankings(playoffHelper, setPlayoffHelper, eventKey, failureCallback),
        convertNumberToLetter: (number) => PlayoffHelperFunctions.convertNumberToLetter(number),
        generatePicklist: () => PlayoffHelperFunctions.generatePicklist(playoffHelper),
        getAllianceRPI: (seed) => PlayoffHelperFunctions.getAllianceRPI(playoffHelper, seed),
        simulateDraft: async () => PlayoffHelperFunctions.simulateDraft(playoffHelper, setPlayoffHelper),
        loadDraftResults: () => PlayoffHelperFunctions.loadDraftResults(playoffHelper, setPlayoffHelper),
        finishDraft: () => PlayoffHelperFunctions.finishDraft(playoffHelper, setPlayoffHelper),
        addBackupTeam: (teamNumber, allianceSeed) => PlayoffHelperFunctions.addBackupTeam(playoffHelper, setPlayoffHelper, teamNumber, allianceSeed),
    };
    

    return (
        <div id="app-container">
            <PlayoffHelperContext.Provider value={playoffHelperContextObject}>
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
                            <div className="links">
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
                                <NavigationGroup
                                    text="Analysis"
                                    links={[
                                            <NavigationLink
                                                link="/analysis/simulator"
                                                text="Simulator"
                                                location={location}
                                                sublink={true}
                                                key={1}
                                            />,
                                            <NavigationLink
                                                link="/analysis/playoffs"
                                                text="Playoff Helper"
                                                location={location}
                                                sublink={true}
                                                key={2}
                                            />
                                    ].concat(DEVELOP_MODE ? [<NavigationLink
                                            link="/analysis/sim-accuracy"
                                            text="Sim. Accuracy"
                                            location={location}
                                            sublink={true}
                                            key={3}
                                        />] : [])
                                    }
                                />
                            </div>
                            <div className="footer-content">
                                <p>{`${gameData.name}`}</p>
                                <p>v{VERSION_NAME}</p>
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
            </PlayoffHelperContext.Provider>
        </div>
    );
}

function NavigationLink({link, text, location, sublink = false}) {
    return (
        <Link to={link} className={"navigation-link" + (location.pathname.includes(link) ? " active" : "") + (sublink ? " sublink" : "")}>
            {text}
        </Link>
    )
}

function NavigationGroup({links, text}) {

    const [opened, setOpened] = useState(false);

    return (
        <>
            <div 
                className="navigation-link"
                onClick={() => setOpened(!opened)}
            >
                {text}
            </div>
            <div 
                className={"link-group" + (opened ? "" : " hidden")}
                style={{ height: opened ? 57 * links.length : 0 }}
            >
                {links}
            </div>
        </>
    )
}