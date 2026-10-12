'use client';

import Link from "next/link";
import Image     from "next/image";
import { captureEvent } from "@/lib/analytics";

const captureNavigation = (destination: string) => {
    captureEvent("navigation_selected", { destination });
};

const Navbar=()=>{
    return (
        <header>
            <nav>
<Link href="/" className="logo" onClick={() => captureNavigation("home_logo")}>
<Image src='/icons/logo.png' alt='logo' width={24} height={24}/>
    <p>DevEvents</p>

</Link>
                <ul>
                    <Link href="/about" className="home" onClick={() => captureNavigation("about")}>Home</Link>
                    <Link href="/events" className="events" onClick={() => captureNavigation("events")}>Events</Link>
                    <Link href="/create" className="newevent" onClick={() => captureNavigation("create_event")}>Create Event</Link>
                </ul>
            </nav>
        </header>

    )
}
export default Navbar;