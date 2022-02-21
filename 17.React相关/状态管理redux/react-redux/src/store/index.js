import { createStore } from "redux";


// function createStore(reducer) {
//     let state;

//     const listeners = [];

//     const getState = () => {
//         return state;
//     }


//     const dispatch = (action) => {
//         state = reducer(state, action);

//         listeners.forEach(cb => cb())
//     }

//     const subscribe = (listener) => {
//         if(!listeners.includes(listener)) {
//             listeners.push(listener);
//         }

//         return function unSubscribe() {
//             listeners = listeners.filter(l => l != listener);
//         }
//     }
//     dispatch({type: '@@redux-init@@'});
//     return {
//         getState, dispatch, subscribe
//     }

// }

const initState = {
    count: 0
};

const reducer = function(state = initState, action) {
    switch (action.type) {
        case 'ADD':
            return {count: state.count + 1}
    
        default:
            return state
    }
}

const store = createStore(reducer)
export default store;