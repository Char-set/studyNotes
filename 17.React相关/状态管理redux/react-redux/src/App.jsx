import { useState, useEffect } from 'react'
import logo from './logo.svg'
import './App.css'
import { connect } from "./store/react-redux";
import { BrowserRouter, Switch, Route,  } from "react-router-dom";

// import { BrowserRouter, Route } from "../../../路由/react-router-dom";

import Page1 from './pages/page1';
import Page2 from './pages/page2';
import Page3 from './pages/page3';

function App({count, dispatch}) {

    const changeCount = () => {
        dispatch({type: "ADD"})
    }

    return (
        // <div></div>
        <BrowserRouter>
            <div className="App">
                {/* <Switch> */}
                    <Route exact path="/" component={(Page1)}></Route>
                    <Route exact path="/page2" component={Page2}></Route>
                    <Route exact path="/page3" component={Page3}></Route>
                {/* </Switch> */}
            </div>
        </BrowserRouter>
    )
}

const mapStateToProps = state => {
    return {
        count: state.count
    }
}

export default connect(mapStateToProps)(App)
