import React, { Component, useState, useEffect, memo, useCallback, useContext, createContext } from 'react'

import { insertErrorWrap, loadAndUpdate } from '../hoc/index'

const context = createContext();

const data = {a: 1}

context.Provider

const UsbBackSub = memo(({value, onChange}) => {
    const ctx = useContext(context)
    console.log(ctx)
    debugger
    console.log('Sub 组件 渲染：', value);
    return <input type="text" value={value} onChange={onChange} />
}, (prev, next) => prev.value === next.value)

class ErrorComponent extends Component {
    render() {
        a = 1;
        return (
            <div>1111</div>
        )
    }
}

const WrappedErrorComponent = insertErrorWrap(ErrorComponent);

function page1(props) {
    console.log(props);
    loadAndUpdate();

    const [value, setValue] = useState('');
    const [count, setCount] = useState(0);

    const onChange = useCallback((e) => {
        setValue(e.target.value);
    }, [count])
    return (
        <context.Provider value={data}>
            <div className='page'>1</div>
            <div onClick={() => props.history.push('/page2')}>goPage 1</div>
            <div>count is : {count}</div>
            <button onClick={() => setCount(c => c + 1)}>count + 1</button>
            <UsbBackSub onChange={onChange} value={value} />
            <WrappedErrorComponent />
        </context.Provider>
    )
}

export default insertErrorWrap(page1)