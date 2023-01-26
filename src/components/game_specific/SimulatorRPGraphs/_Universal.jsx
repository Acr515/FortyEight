import React from "react";
import { Doughnut } from "react-chartjs-2";
import './style.scss';

export default function SimulatorRPGraphs_Universal({sim, graphOptions, winner, loser}) {

    // Chart configuration
    const smallDoughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "80%",
        plugins: { tooltip: {
            enabled: false
        }}
    };

    return <div className="_SimulatorRPGraphs">
        <div className="doughnut-set">
            <div className="single-doughnut-container">
                <div className="small-doughnut">
                    <Doughnut data={graphOptions.winner1.chartData} options={smallDoughnutOptions} style={{
                        width: 86,
                        height: 86
                    }} />
                    <span className="percentage" style={{color: winner.color}}>
                        {graphOptions.winner1.value}%
                    </span>
                </div>
                <p className="label">{graphOptions.winner1.label}</p>
            </div>
            <div className="single-doughnut-container">
                <div className="small-doughnut">
                    <Doughnut data={graphOptions.loser1.chartData} options={smallDoughnutOptions} style={{
                        width: 86,
                        height: 86
                    }} />
                    <span className="percentage" style={{color: loser.color}}>
                        {Math.round(sim[loser.colorName].cargoRPRate * 1000) / 10}%
                    </span>
                </div>
                <p className="label">{graphOptions.loser1.label}</p>
            </div>
        </div>
        <div className="doughnut-set">
            <div className="single-doughnut-container">
                <div className="small-doughnut">
                    <Doughnut data={graphOptions.winner2.chartData} options={smallDoughnutOptions} style={{
                        width: 86,
                        height: 86
                    }} />
                    <span className="percentage" style={{color: winner.color}}>
                        {Math.round(sim[winner.colorName].climbRPRate * 1000) / 10}%
                    </span>
                </div>
                <p className="label">{graphOptions.winner2.label}</p>
            </div>
            <div className="single-doughnut-container">
                <div className="small-doughnut">
                    <Doughnut data={graphOptions.loser2.chartData} options={smallDoughnutOptions} style={{
                        width: 86,
                        height: 86
                    }} />
                    <span className="percentage" style={{color: loser.color}}>
                        {Math.round(sim[loser.colorName].climbRPRate * 1000) / 10}%
                    </span>
                </div>
                <p className="label">{graphOptions.loser2.label}</p>
            </div>
        </div>
    </div>
}