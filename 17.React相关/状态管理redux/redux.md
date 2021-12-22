## `redux`基础知识

## 主要方法


- createStore 创建一个 `Store`，接受 `reducer` 参数，返回一个对象，包含下面几个主要方法
  - getState 获取 `Store` 的状态 `state`
  - dispatch 接受一个 `action`，传递给 `reducer` 方法，获得一个新的 `state`，并通知所有的订阅者更新
  - subscribe 接受一个函数参数，用于 `state` 更新之后回调

**完整代码**

```js
    function createStore(reducer) {
        let state;

        const listeners = [];

        const getState = () => {
            return state;
        }


        const dispatch = (action) => {
            state = reducer(state, action);

            listeners.forEach(cb => cb())
        }

        const subscribe = (listener) => {
            if(!listeners.includes(listener)) {
                listeners.push(listener);
            }

            return function unSubscribe() {
                listeners = listeners.filter(l => l != listener);
            }
        }
        dispatch({type: '@@redux-init@@'}); // 初始化 state
        return {
            getState, dispatch, subscribe
        }

    }
```

## `react-redux` 主要实现了什么？

导出了一个 `Provider` 组件，接受一个 `store` 属性，同时导出了一个 `connect` 方法，用于包裹组件，给组件注入 `store` 里面相应的 `state`


**完整代码**

```js
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
```