import React from "react";
import { EndgameResult } from "data/game_specific/performanceObject/2025";
import ScoreCalculator from "data/game_specific/ScoreCalculator/2025";
import XImage from 'assets/images/x.png';
import './style.scss';

// Displays a breakdown of all given data in form
export default function ViewIndividualData({data}) {
    const p = data.performance;
    const autoCoral = [p.auto.coralL1, p.auto.coralL2, p.auto.coralL3, p.auto.coralL4];
    const teleopCoral = [p.teleop.coralL1, p.teleop.coralL2, p.teleop.coralL3, p.teleop.coralL4];

    return (
        <div className="_ViewIndividualData">
            <div className="data-row cell-related">
                <div className="row-label">
                    Auto
                </div>
                <div className="row-contents">
                    <div className="content-cell">
                        <div className="cell-data">{p.auto.leave ? "Yes" : "No"}</div>
                        <div className="cell-label">Leave</div>
                    </div>
                    <div className="content-cell">
                        <div className="cell-data">{ScoreCalculator.Auto.getAlgae(data)}</div>
                        <div className="cell-label">Algae</div>
                    </div>
                    <div className="content-cell">
                        <div className="cell-data">{ScoreCalculator.Auto.getCoral(data)}</div>
                        <div className="cell-label">Coral</div>
                    </div>
                </div>
            </div>
            <div className="data-row cell-related">
                <div className="row-label">
                    Teleop
                </div>
                <div className="row-contents">
                    <div className="content-cell">
                        <div className="cell-data">{ScoreCalculator.Teleop.getAlgae(data)}</div>
                        <div className="cell-label">Algae</div>
                    </div>
                    <div className="content-cell">
                        <div className="cell-data">{ScoreCalculator.Teleop.getCoral(data)}</div>
                        <div className="cell-label">Coral</div>
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
                    { (p.endgame.state == EndgameResult.NONE || p.endgame.state == EndgameResult.PARKED) && (
                        <div className="content-cell">
                            <div className="cell-data">{p.endgame.failedAttempt ? "Yes" : "No"}</div>
                            <div className="cell-label">Climb attempted</div>
                        </div>
                    )}
                    { (p.endgame.state != EndgameResult.NONE && p.endgame.state != EndgameResult.PARKED) && (
                        <div className="content-cell">
                            <div className="cell-data">{p.endgame.trap ? `Yes (${p.endgame.trap === true ? 1 : p.endgame.trap})` : "No"}</div>
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
                                <span className="individual-flag"><XIcon />{" Missed/dropped frequently"}</span>
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