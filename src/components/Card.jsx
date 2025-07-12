import React from 'react'

function Card({
    classname='',
    children,
    ...props

}) {
  return (
   <div className={`rounded-xl shadow-md p-4 ${classname}`}{...props}>
    {children}
   </div>
  )
}

export default Card