import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './screens/Home';
import Form from './screens/Form';
import Test from './screens/Test';
import Teams from './screens/Teams';
import ViewTeam from './screens/ViewTeam';
import FRAME from './screens/FRAME';
import './GlobalStyle.css';
import TeamData from './data/TeamData';
import { loadData } from './data/saveLoadData';
import ManageData from './screens/ManageData';



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
                <Route path="teams" element={<Teams />}/>
                <Route path="teams/:number" element={<ViewTeam />} />
            </Route>
        </Routes>
    );
}