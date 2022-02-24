import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './screens/Home';
import Form from './screens/Form';
import Test from './screens/Test';
import Teams from './screens/Teams';
import ViewTeam from './screens/ViewTeam';
import ManageData from './screens/ManageData';
import SimulatorConfig from './screens/SimulatorConfig';
import FRAME from './screens/FRAME';
import './GlobalStyle.css';
import TeamData from './data/TeamData';
import { loadData } from './data/saveLoadData';
import SimulatorViewer from './screens/SimulatorViewer';


export default function App() {
    TeamData;
    useEffect(loadData, []);

    return (
        <Routes>
            <Route path="/" element={<FRAME />}>
                <Route index element={<Home />} />
                <Route path="form" element={<Form />} />
                <Route path="test" element={<Test />} />
                <Route path="manage" element={<ManageData />}/>
                <Route path="teams">
                    <Route path="" element={<Teams />} />
                    <Route path="edit/:edit" element={<Form />} />
                </Route>
                <Route path="teams/:number" element={<ViewTeam />} />
                <Route path="analysis">
                    <Route path="simulator" element={<SimulatorConfig />}/>
                    <Route path="viewer" element={ <SimulatorViewer />}/>
                </Route>
            </Route>
        </Routes>
    );
}