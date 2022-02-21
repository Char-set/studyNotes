import React, {Component, forwardRef, useRef, useEffect} from 'react';

export function hoc(WrapedComponent, api) {
    class Log extends Component {
        state = {
            pageNo: 1,
            pageSize: 10
        }
        render() {
            const {myRef} = this.props;
            return <WrapedComponent 
                    {...this.props}
                    {...this.state}
                    ref={myRef}
                />
        }
    }

    return forwardRef((props, ref) => <Log {...props} myRef={ref} />)
}


export const insertErrorWrap = WrappedComponent =>  class extends Component {
    state = {
        error: false
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: true,
        }, () => {
            // 发送错误信息
        })
    }

    render() {
        if(this.state.error) {
            return <div>页面不可用，请检查组件 {WrappedComponent.displayName || WrappedComponent.name}的逻辑</div>
        } else {
            return <WrappedComponent {...this.props} />
        }
    }
}

export function loadAndUpdate() {
    const isUpdate = useRef(false)

    useEffect(() => {
        if(isUpdate.current) {
            console.log(' 更新')
        } else {
            console.log('初次加载')
            isUpdate.current = true;
        }
    })
}