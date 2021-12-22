import { createContext, useContext, useState } from "react";

const ReduxContent = createContext();

const Provider = ReduxContent.Provider;

const connect = (mapStateToProps = () => {}, mapDispatchProps = () => {}) => WrappedComponent => prop => {
    const [, forceUpdate] = useState([]);

    const {subscribe, getState, dispatch} = useContext(ReduxContent);

    subscribe(() => forceUpdate([])); // 强制更新组件

    const props = {
        ...mapStateToProps(getState()),
        ...mapDispatchProps(dispatch),
        ...prop,
        dispatch: dispatch
    };
    return <WrappedComponent {...props} ></WrappedComponent>
}

export {Provider, connect}