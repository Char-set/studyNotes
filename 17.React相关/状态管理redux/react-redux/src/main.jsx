import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import store from './store'
import { Provider } from "./store/react-redux";

ReactDOM.render(
    <React.StrictMode>
        <Provider value={store}>
            <App />
        </Provider>
    </React.StrictMode>,
    document.getElementById('root')
)
