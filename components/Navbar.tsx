import Link from "next/link";
import Image     from "next/image";
const Navbar=()=>{
    return (
        <header>
            <nav>
<Link href="/" className="logo">
<Image src='/icons/logo.png' alt='logo' width={24} height={24}/>
    <p>DevEvents</p>

</Link>
                <ul>
                    <Link href="/about" className="home">Home</Link>
                    <Link href="/events" className="events">Events</Link>
                    <Link href="/create" className="newevent">Create Event</Link>
                </ul>
            </nav>
        </header>

    )
}
export default Navbar;