import { useState, useEffect } from 'react'

export default function page1(props) {
    console.log(props)
    return (
        <div>
            <div className='page'>1</div>
            <div onClick={() => props.history.push('/page2')}>goPage 1</div>
        </div>
    )
}