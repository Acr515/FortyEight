import React from "react";
import ScoreCalculator from "data/game_specific/ScoreCalculator/2023";
import { EndgameResult } from "data/game_specific/performanceObject/2023";
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
                    { ScoreCalculator.Auto.getPieces(data) == 0 ?
                        <div className="content-cell">
                            <div className="cell-data">0</div>
                            <div className="cell-label">Pieces</div>
                        </div>
                    : <>
                        { ScoreCalculator.Auto.getLow(data) > 0 &&
                            <div className="content-cell">
                                <div className="cell-data">{ScoreCalculator.Auto.getLow(data)}</div>
                                <div className="cell-label">Bottom</div>
                            </div>
                        }
                        { ScoreCalculator.Auto.getMid(data) > 0 &&
                            <div className="content-cell">
                                <div className="cell-data">{ScoreCalculator.Auto.getMid(data)}</div>
                                <div className="cell-label">Middle</div>
                            </div>
                        }
                        { ScoreCalculator.Auto.getHigh(data) > 0 &&
                            <div className="content-cell">
                                <div className="cell-data">{ScoreCalculator.Auto.getHigh(data)}</div>
                                <div className="cell-label">Top</div>
                            </div>
                        }
                        { /* ScoreCalculator.Auto.getCones(data) &&
                            <div className="content-cell">
                                <div className="cell-data">{ScoreCalculator.Auto.getCones(data)}</div>
                                <div className="cell-label"># Cones</div>
                            </div> */
                        }
                    </>}
                    <div className="content-cell">
                        <div className="cell-data">{p.auto.mobility ? "Yes" : "No"}</div>
                        <div className="cell-label">Mobility</div>
                    </div>
                    <div className="content-cell">
                        <div className="cell-data">{p.auto.docked ? "Yes" : "No"}</div>
                        <div className="cell-label">Docked</div>
                    </div>
                    { p.auto.docked &&
                        <div className="content-cell">
                            <div className="cell-data">{p.auto.engaged ? "Yes" : "No"}</div>
                            <div className="cell-label">Engaged</div>
                        </div>
                    }
                </div>
            </div>
            <div className="data-row cell-related">
                <div className="row-label">
                    Teleop
                </div>
                <div className="row-contents">
                    <div className="content-cell">
                        <div className="cell-data">{ScoreCalculator.Teleop.getLow(data)}</div>
                        <div className="cell-label">Bottom</div>
                    </div>
                    <div className="content-cell">
                        <div className="cell-data">{ScoreCalculator.Teleop.getMid(data)}</div>
                        <div className="cell-label">Middle</div>
                    </div>
                    <div className="content-cell">
                        <div className="cell-data">{ScoreCalculator.Teleop.getHigh(data)}</div>
                        <div className="cell-label">Top</div>
                    </div>
                    <div className="content-cell">
                        <div className="cell-data">{ScoreCalculator.Teleop.getCones(data)}</div>
                        <div className="cell-label"># Cones</div>
                    </div>
                    <div className="content-cell">
                        <div className="cell-data">{ScoreCalculator.Teleop.getCubes(data)}</div>
                        <div className="cell-label"># Cubes</div>
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
                            <div className="cell-label">Docked attempted</div>
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
                                <span className="individual-flag"><XIcon />{" Dropped many pieces"}</span>
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