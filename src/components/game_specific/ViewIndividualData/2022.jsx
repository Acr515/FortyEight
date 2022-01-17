import React from "react";
import imageImports from "../../../util/imageImports";
import XImage from '../../../assets/images/x.png';
import { EndgameResult } from "../../../data/game_specific/performanceObject/2022";
import './style.scss';

// Displays a breakdown of all given data in form
export default function ViewIndividualData({data}) {
    let p = data.performance;
    return (
        <div className="_ViewIndividualData">
            <div className="data-row cell-related">
                <div className="row-label">
                    Auto
                </div>
                <div className="row-contents">
                    <div className="content-cell">
                        <div className="cell-data">{p.auto.cargoLow}</div>
                        <div className="cell-label">Low</div>
                    </div>
                    <div className="content-cell">
                        <div className="cell-data">{p.auto.cargoHigh}</div>
                        <div className="cell-label">High</div>
                    </div>
                    <div className="content-cell">
                        <div className="cell-data">{p.auto.taxi ? "Yes" : "No"}</div>
                        <div className="cell-label">Taxi</div>
                    </div>
                </div>
            </div>
            <div className="data-row cell-related">
                <div className="row-label">
                    Teleop
                </div>
                <div className="row-contents">
                    <div className="content-cell">
                        <div className="cell-data">{p.teleop.cargoLow}</div>
                        <div className="cell-label">Low</div>
                    </div>
                    <div className="content-cell">
                        <div className="cell-data">{p.teleop.cargoHigh}</div>
                        <div className="cell-label">High</div>
                    </div>
                </div>
            </div>
            <div className="data-row cell-related">
                <div className="row-label">
                    Endgame
                </div>
                <div className="row-contents">
                    <div className="content-cell">
                        <div className="cell-data">{p.endgame.state}</div>
                        <div className="cell-label">Result</div>
                    </div>
                    { p.endgame.state == EndgameResult.NONE && (
                        <div className="content-cell">
                            <div className="cell-data">{p.endgame.failedAttempt ? "Yes" : "No"}</div>
                            <div className="cell-label">Climb attempted</div>
                        </div>
                    )}
                </div>
            </div>
            <div className="data-row" style={{ marginBottom: 26, marginTop: 22 }}>
                <div className="row-label">
                    Defense
                </div>
                <div className="row-contents">
                    { p.defense.played ? (<>
                        <div>Played <span className="bold">{p.defense.rating.toUpperCase()}</span> defense</div>
                        <div className="italic commentary">"{p.defense.explain}"</div>
                    </>) : (
                        <span className="italic commentary">Did not play defense</span>
                    )}
                </div>
            </div>
            <div className="data-row">
                <div className="row-label">
                    Notes
                </div>
                <div className="row-contents">
                    { (p.notes.broken || p.notes.fouls || p.notes.misses) && (
                        <div className="flag-area">
                            {p.notes.broken && (
                                <span className="individual-flag"><XIcon />{" Broke down"}</span>
                            )}
                            {p.notes.fouls && (
                                <span className="individual-flag"><XIcon />{" Heavily penalized"}</span>
                            )}
                            {p.notes.misses && (
                                <span className="individual-flag"><XIcon />{" Missed many shots"}</span>
                            )}
                        </div>
                    )}
                    <div className="italic commentary">{p.notes.comments || "No additional comments provided"}</div>
                </div>
            </div>
        </div>
    )
}

function XIcon() {
    return (
        <div 
            className="icon"
            style={{ backgroundImage: 'url(' + XImage + ')' }}
        ></div>
    )
}