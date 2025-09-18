import { useState, useContext } from "react"
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom'; 



export default function Profile() {

    const [showModel, setShowModel] = useState(false);
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login'); 
    };

    return(
        <div onClick={() => setShowModel(!showModel)}
        className="relative w-10 h-10 bg-gray-300 rounded-full">
            {showModel && (
                <div onClick={() => setShowModel(false)}
                className="absolute flex flex-col items-center top-12 right-1 bg-[#1E1E1E] w-40 h-auto border border-[#4d4c4c] shadow-sm rounded-md p-2">
                    <button onClick={handleLogout}
                        className='w-full py-1.5 px-4 border border-[#fff] hover:border-[#F46BF9] text-[#fff] hover:text-[#F46BF9] text-sm rounded-md duration-300'>
                        Logout
                    </button>
                </div>
            )}
        </div>
    )
}