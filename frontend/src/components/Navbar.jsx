import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios';

axios.defaults.baseURL = '/api/v1'

function Navbar() {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (token) {
            const fetchUserDetails = async () => {
                try {
                    const response = await axios.get('/verify-jwt', {
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    });
                    setCurrentUser({
                        id: response.data.userId,
                        userRole: response.data.userRole,
                        username: response.data.username
                    });
                } catch (error) {
                    console.error('Error fetching user details:', error);
                    navigate('/signin');
                }
            };
            fetchUserDetails();
        }
        else{
            navigate('/signin');
        }
    }, [token]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate('/signin');
    };

    return (
        <nav className="bg-gray-800 p-4">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/courses" className="text-white text-xl font-bold">
                    Course App
                </Link>

                <div className="flex gap-4">
                    {token ? (
                        <>
                            <Link to="/courses" className="text-white hover:text-gray-300">
                                Courses
                            </Link>
                            <Link to="/courses-by-user" className="text-white hover:text-gray-300">
                                My Courses
                            </Link>
                            {currentUser?.userRole === "ADMIN" && (
                                <Link to="/createcourse" className="text-white hover:text-gray-300">
                                    Add Course
                                </Link>
                            )}
                            <div className="text-white hover:text-gray-300">{currentUser?.username}</div>
                            <button
                                onClick={handleLogout}
                                className="text-white hover:text-gray-300"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/signin" className="text-white hover:text-gray-300">
                                Sign In
                            </Link>
                            <Link to="/signup" className="text-white hover:text-gray-300">
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}

export default Navbar