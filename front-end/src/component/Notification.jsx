import { useState } from "react";
import { GoBell } from "react-icons/go";

export default function Notification() {

    const [show, setShow] = useState(false);

    return(
        <div className="relative flex justify-center items-center w-10 h-10 ">
            <GoBell onClick={() => setShow(!show)}
            className="text-xl text-white hover:text-[#F46BF9] duration-300 cursor-pointer" />

            {show && (
                <div onClick={() => setShow(false)}
                className="absolute flex flex-col items-center top-12 right-[-63px] sm:right-1 bg-white w-74 sm:w-80 h-60 border border-[#dddddd] shadow-sm rounded-md p-2">
                    <p className="text-[#6b6b6b] mb-4">Notifications</p>
                </div>
            )}
        </div>
    )
}