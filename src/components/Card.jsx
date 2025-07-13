import React from 'react'

function Card({
    className='',
    children,
    ...props

}) {
  return (
   <div className={`rounded-xl shadow-md p-4 ${className}`}{...props}>
    {children}
   </div>
  )
}

export default Card