import React from 'react';
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
import { loadData } from './data/saveLoadData';
import SimulatorViewer from './screens/SimulatorViewer';
import SimulatorAccuracy from './screens/SimulatorAccuracy';
import ImportConflicts from 'screens/ImportConflicts';
import PlayoffHelper from 'screens/PlayoffHelper';


export default function App() {
    loadData();

    return (
        <Routes>
            <Route path="/" element={<FRAME />}>
                <Route index element={<Home />} />
                <Route path="form" element={<Form />} />
                <Route path="test" element={<Test />} />
                <Route path="manage" element={<ManageData />}/>
                <Route path="conflicts" element={<ImportConflicts />}/>
                <Route path="teams">
                    <Route path="" element={<Teams />} />
                    <Route path="edit/:edit" element={<Form />} />
                </Route>
                <Route path="teams/:number" element={<ViewTeam />} />
                <Route path="teams/:number/:referral/:backtext" element={<ViewTeam />} />
                <Route path="analysis">
                    <Route path="simulator" element={<SimulatorConfig />}/>
                    <Route path="sim-accuracy" element={<SimulatorAccuracy />}/>
                    <Route path="viewer" element={ <SimulatorViewer />}/>
                    <Route path="playoffs" element={ <PlayoffHelper />}/>
                </Route>
            </Route>
        </Routes>
    );
}