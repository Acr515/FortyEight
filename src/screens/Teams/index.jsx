import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import ImageButton from '../../components/ImageButton';
import PageHeader from '../../components/PageHeader';
import calculateRPI from '../../data/game_specific/calculateRPI/202X';
import TeamData from '../../data/TeamData';
import XImage from '../../assets/images/x.png';
import Plus from '../../assets/images/plus.png';
import './style.scss';
import { saveData } from '../../data/saveLoadData';
import DialogBoxContext from '../../context/DialogBoxContext';


function useForceUpdate(){
    const [value, setValue] = useState(0); // integer state
    return () => setValue(value => value + 1); // update the state to force render
}


export default function Teams() {
    const forceUpdate = useForceUpdate();
    const sortedTeams = TeamData.sort((a, b) => { return a.number - b.number })
    return (
        <div className="SCREEN _Teams">
            <PageHeader text="Teams" />
            <div className="team-list">
                {
                    sortedTeams.map(team => {
                        return (<Team team={team} updateHook={forceUpdate} key={team.number} />)
                    })
                }
            </div>
        </div>
    );
}

function Team({team, updateHook}) {
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
                            confirmFunction: () => { deleteTeam(team.number, updateHook) },
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
                    />
                </div>
            </div>
            <div className="module-container">
                <Link className="item-module link" to={"/teams/" + team.number}>
                    <span className="number team">{team.number}</span>
                    <span className="label">{team.name}</span>
                </Link>
                <div className="item-module short">
                    <span className="number">{calculateRPI(team)}</span>
                    <span className="label">RPI</span>
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