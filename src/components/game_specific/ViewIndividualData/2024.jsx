import React from "react";
import { EndgameResult } from "data/game_specific/performanceObject/2024";
import XImage from 'assets/images/x.png';
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
                        <div className="cell-data">{p.auto.amp}</div>
                        <div className="cell-label">Amp</div>
                    </div>
                    <div className="content-cell">
                        <div className="cell-data">{p.auto.speaker}</div>
                        <div className="cell-label">Speaker</div>
                    </div>
                    <div className="content-cell">
                        <div className="cell-data">{p.auto.leave ? "Yes" : "No"}</div>
                        <div className="cell-label">Leave</div>
                    </div>
                </div>
            </div>
            <div className="data-row cell-related">
                <div className="row-label">
                    Teleop
                </div>
                <div className="row-contents">
                    <div className="content-cell">
                        <div className="cell-data">{p.teleop.amp}</div>
                        <div className="cell-label">Amp</div>
                    </div>
                    <div className="content-cell">
                        <div className="cell-data">{p.teleop.speaker}</div>
                        <div className="cell-label">Speaker</div>
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
                    { (p.endgame.state != EndgameResult.NONE && p.endgame.state != EndgameResult.PARKED) && (
                        <div className="content-cell">
                            <div className="cell-data">{p.endgame.trap ? "Yes" : "No"}</div>
                            <div className="cell-label">Trap score</div>
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
                        <div className="italic commentary">&quot;{p.defense.explain}&quot;</div>
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
                    <div className="italic commentary">{p.notes.comments ? `"${p.notes.comments}"` : "No additional comments provided"}</div>
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