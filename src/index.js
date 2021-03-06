import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from "react-router-dom";
import { CelebrationStation } from "./components/CelebrationStation";
import 'semantic-ui-css/semantic.min.css';
import './index.css';

ReactDOM.render(
    
        <Router>
            <CelebrationStation />
        </Router>
    ,
    document.getElementById('root')
);