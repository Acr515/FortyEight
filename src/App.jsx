import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './screens/Home'
import Form from './screens/Form'
import './style.css';

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/form" element={<Form />} />
        </Routes>
    );
}