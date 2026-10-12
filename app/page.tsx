import ExploreBtn from "@/components/ExploreBtn";
import EventCard from "@/components/EventCard";
import events from '@/lib/constants'

const Page=()=>{
    return (
        <section>
        <h1 className="text-center">
            The Hub fro every Dev<br/> Event You Can't miss
        </h1>
            <p className="text-center mt-5">
                HackToen Meetup conferences, All in once places
            </p>
            <ExploreBtn/>
            <div className="mt-20 space-y-2">
                <h3>feature Events</h3>
                <ul className="events">
                    {events.map(event=>(
                     <li> <EventCard {...event}/></li>
                    ))}
                </ul>
            </div>
        </section>
    )
}
export default Page;