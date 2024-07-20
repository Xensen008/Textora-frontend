import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'

function MessPage() {
  const Param = useParams();


  useEffect(() => {
    console.log(Param)
  }, [Param])
  return (
    <div>MessPage</div>
  )
}

export default MessPage