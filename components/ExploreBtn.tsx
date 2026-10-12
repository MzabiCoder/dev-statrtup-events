'use client'

import Image from'next/image'

const ExploreBtn=()=>{
    return (
<button onClick={()=>{}} className="mt-7 mx-auto" type={'button'} id={"explore-btn"}>
    <a href="#events">
        <Image src='/icons/arroe-down.svg' width={24} height={24} alt=""/>
    </a>
    </button>
    )
}

export default ExploreBtn