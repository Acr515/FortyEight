import React from "react";
import { EndgameResult } from "../../../data/game_specific/performanceObject/2022";
import './style.scss';

// Displays a breakdown of all given data in form
export default function ViewIndividualData({data}) {
    return (
        <div className="_ViewIndividualData">
            <div className="data-row">
                <div className="row-label">
                    Auto
                </div>
                <div className="row-contents">
                    <div className="content-cell">
                        <div className="cell-data">{data.performance.auto.cargoLow}</div>
                        <div className="cell-label">Low</div>
                    </div>
                    <div className="content-cell">
                        <div className="cell-data">{data.performance.auto.cargoHigh}</div>
                        <div className="cell-label">High</div>
                    </div>
                    <div className="content-cell">
                        <div className="cell-data">{data.performance.auto.taxi ? "Yes" : "No"}</div>
                        <div className="cell-label">Taxi</div>
                    </div>
                </div>
            </div>
            <div className="data-row">
                <div className="row-label">
                    Teleop
                </div>
                <div className="row-contents">
                    <div className="content-cell">
                        <div className="cell-data">{data.performance.teleop.cargoLow}</div>
                        <div className="cell-label">Low</div>
                    </div>
                    <div className="content-cell">
                        <div className="cell-data">{data.performance.teleop.cargoHigh}</div>
                        <div className="cell-label">High</div>
                    </div>
                </div>
            </div>
            <div className="data-row">
                <div className="row-label">
                    Endgame
                </div>
                <div className="row-contents">
                    <div className="content-cell">
                        <div className="cell-data">{data.performance.endgame.state}</div>
                        <div className="cell-label">Result</div>
                    </div>
                    { data.performance.endgame.state == EndgameResult.NONE && (
                        <div className="content-cell">
                            <div className="cell-data">{data.performance.endgame.failedAttempt}</div>
                            <div className="cell-label">Climb attempted</div>
                        </div>
                    )}
                </div>
            </div>
            <div className="data-row">
                <div className="row-label">
                    Defense
                </div>
                <div className="row-contents">
                </div>
            </div>
        </div>
    )
}