import React from "react";
import Context from "./Context";

export default class BrowserRouter extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            location: {
                pathname: location.pathname || '/',
                search: undefined
            },
            match: {

            }
        }
    }

    handlePopState = () => {
        this.setState({
            location: {
                pathname: location.pathname
            }
        })
    }

    componentWillUnmount() {
        window.addEventListener('popstate', this.handlePopState)
    }

    componentWillUnmount() {
        window.removeEventListener('popstate', this.handlePopState)
    }

    render() {
        const currentRoute = {
            location: this.state.location,
            match: this.state.match,
            history: {
                push: (to) => {
                    if(typeof to === 'object') {
                        let { pathname, query} = to;
                        this.state.location.pathname = pathname;
                        this.state.location.query = query;
                        window.history.pushState({}, {}, pathname);
                    } else {
                        this.state.location.pathname = to;
                        window.history.pushState({}, {}, to);
                    }

                    this.forceUpdate();
                }
            }
        }

        return <Context.Provider value={currentRoute}>{this.props.children}</Context.Provider>
    }
}