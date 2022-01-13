import React from "react";
import Context from "./Context";
import { pathToRegexp, match } from "path-to-regexp";

export default class Route extends React.Component {
    static contextType = Context;

    constructor(props) {
        super(props);
    }

    render() {
        const currentRoutePath = this.context.location.pathname;
        const { path, component: Component, exact = false} = this.props;

        const paramsRegexp = match(path, {end: exact}); // 生成获取params的表达式

        const matchResult = paramsRegexp(currentRoutePath);

        console.log('路由匹配结果', matchResult);

        this.context.match.params = matchResult.params;

        const props = {
            ...this.context
        }

        const pathRegexp = pathToRegexp(path, [], {end: exact});

        if(pathRegexp.test(currentRoutePath)) {
            return <Component {...props}></Component>
        }

        return null;
    }
}