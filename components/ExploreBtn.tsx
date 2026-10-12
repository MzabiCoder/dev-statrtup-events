'use client'

import Image from'next/image'
import { captureEvent } from "@/lib/analytics"

const ExploreBtn=()=>{
    return (
<button onClick={() => captureEvent("events_explored", { source: "homepage" })} className="mt-7 mx-auto" type={'button'} id={"explore-btn"}>
    <a href="#events">
        <Image src='/icons/arroe-down.svg' width={24} height={24} alt=""/>
    </a>
    </button>
    )
}

export default ExploreBtn