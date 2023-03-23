import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from 'components/Input';
import ImageButton from 'components/ImageButton';
import PageHeader from 'components/PageHeader';
import calculateRPI from 'data/game_specific/calculateRPI/GAME_YEAR';
import TeamData from 'data/TeamData';
import { saveData } from 'data/saveLoadData';
import DialogBoxContext from 'context/DialogBoxContext';
import FeedbackModalContext from 'context/FeedbackModalContext';
import addLeadingZero from 'util/addLeadingZero';
import { Method, sortTeams } from 'util/sortData';
import XImage from 'assets/images/x.png';
import Plus from 'assets/images/plus.png';
import NoDataImage from 'assets/images/no-data-graphic.png';
import './style.scss';


function useForceUpdate() {
    const [value, setValue] = useState(0); // integer state
    return () => setValue(value => value + 1); // update the state to force render
}

export default function Teams() {
    const [sortMethod, setSortMethod] = useState(Method.TeamNoAscending);
    const forceUpdate = useForceUpdate();
    const sortedTeams = sortTeams(TeamData, sortMethod);

    return (
        <div className="SCREEN _Teams">
            <div className="header-section">
                <PageHeader text="Teams" />
                <div className="team-sort-options">
                    <Input
                        optionList={[
                            { label: "Sort by Team #", value: Method.TeamNoAscending }, 
                            { label: "Sort by RPI", value: Method.StrengthDescending },
                            { label: "Sort by Avg. Endgame", value: Method.AverageEndgameDescending }
                        ]}
                        prefill={Method.TeamNoAscending}
                        onInput={e => { setSortMethod(e.target.value); }}
                        id="team-sort-options"
                    />
                </div>
            </div>
            <div className="team-list">
                {
                    sortedTeams.length > 0 ? sortedTeams.map(team => {
                        return (<Team team={team} updateHook={forceUpdate} key={team.number} />)
                    }) : (
                        <div className="full-screen">
                            <img src={NoDataImage} className="image"/>
                            <p className="text">
                                You have no team data. Use the Create tab to fill out a match form!
                            </p>
                        </div>
                    )
                }
            </div>
        </div>
    );
}

function Team({team, updateHook}) {
    const navigate = useNavigate();

    const [openTab, setOpenTab] = useState(false);

    const toggleTab = () => {
        setOpenTab(!openTab);
    }

    const tabMouseEnter = e => {
        e.target.parentElement.style.backgroundColor = "#6A64C1";
    }
    const tabMouseLeave = e => {
        e.target.parentElement.style.backgroundColor = "#4941B1";
    }

    const dialogFunctions = useContext(DialogBoxContext);
    const modalFunctions = useContext(FeedbackModalContext);

    return (
        <div className="team-component">
            <div 
                className="team-tab"
                style={openTab ? {width: 120} : {}}
            >
                <div 
                    className="team-tab-clickable"
                    onMouseEnter={tabMouseEnter}
                    onMouseLeave={tabMouseLeave}
                    onClick={toggleTab}
                ></div>
                <div className="tab-button-group">
                    <ImageButton 
                        color="white"
                        imageData={XImage}
                        style={{
                            width: 16,
                            height: 16,
                            position: "relative",
                            top: -4
                        }}
                        onClick={() => { dialogFunctions.setDialog({
                            body: "This will delete ALL DATA in memory for this team and cannot be undone. Are you sure you would like to continue?",
                            useConfirmation: true,
                            confirmFunction: () => { deleteTeam(team.number, updateHook); modalFunctions.setModal("Team " + team.number + " was successfully deleted.", false) },
                            confirmLabel: "Yes",
                            cancelLabel: "No"
                        })}}
                    />
                    <ImageButton 
                        color="white"
                        imageData={Plus}
                        style={{
                            width: 20,
                            height: 20,
                            position: "relative",
                            top: -4,
                            marginLeft: 24
                        }}
                        onClick={() => { navigate("/form", { state: { teamNumberPrefill: team.number } }) }}
                    />
                </div>
            </div>
            <div className="module-container">
                <Link className="item-module link" to={"/teams/" + team.number}>
                    <span className="number team">{team.number}</span>
                    <span className="label">{team.name}</span>
                </Link>
                <div className="item-module short">
                    <span className="number">{addLeadingZero(calculateRPI(team).RPI)}</span>
                    <span className="label">RPI ({calculateRPI(team).rating})</span>
                </div>
                <div className="item-module short">
                    <span className="number">{team.data.length}</span>
                    <span className="label">Forms</span>
                </div>
            </div>
        </div>
    )
}

function deleteTeam(num, updateHook) {
    for (let index = 0; index < TeamData.length; index ++) {
        if (TeamData[index].number == num) {
            TeamData.splice(index, 1);
            updateHook();
            saveData();
            return true;
        }
    }
    return false;
}