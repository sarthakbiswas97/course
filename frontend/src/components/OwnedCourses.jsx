import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

axios.defaults.baseURL = '/api/v1'

function OwnedCourses() {
    const navigate = useNavigate();
    const [coursesData, setCoursesData] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [contentBox, setContentBox] = useState(null);
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            navigate('/signin');
            return;
        }

        const fetchData = async () => {
            try {
                const [coursesResponse, userResponse] = await Promise.all([
                    axios.get('courses-by-user', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }),
                    axios.get('/verify-jwt', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    })
                ]);

                setCoursesData(coursesResponse.data);
                setCurrentUser({
                    id: userResponse.data.userId,
                    role: userResponse.data.userRole
                });
            } catch (error) {
                if (error.response?.status === 401) {
                    navigate('/signin');
                }
                setErrorMessage(error.response?.data?.error || "Failed to fetch courses");
            }
        }
        fetchData();
    }, [navigate, token]);

    const handleUpdate = (courseId) => {
        navigate(`/update-course/${courseId}`);
    }

    const handleDelete = async (courseId) => {
        try {
            const response = await axios.delete(`/delete-course/${courseId}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            setSuccessMessage(response.data.message);
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            setErrorMessage(error.response?.data?.error || error.response?.data?.message || "Failed to delete course");
        }
    };

    const handleShowMore = (course) => {
        setContentBox(course);
    };

    const closeModal = () => {
        setContentBox(null);
    };

    if (!coursesData || !currentUser) return <div>Loading...</div>

    return (
        <div className="p-4">
            <h2 className="text-2xl text-center mb-8">My Courses</h2>
            
            {errorMessage && (
                <div className="text-red-500 text-center mb-4 p-3 bg-red-100 border border-red-400 rounded">
                    {errorMessage}
                </div>
            )}

            {successMessage && (
                <div className="text-green-500 text-center mb-4 p-3 bg-green-100 border border-green-400 rounded">
                    {successMessage}
                </div>
            )}

            {contentBox && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">
                                {contentBox.title}
                            </h3>
                            <button
                                onClick={closeModal}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ×
                            </button>
                        </div>
                        {contentBox.thumbnail && (
                            <img 
                                src={contentBox.thumbnail} 
                                alt={contentBox.title}
                                className="w-full h-48 object-cover mb-4 rounded"
                            />
                        )}
                        <p className="text-gray-600 mb-4">
                            {contentBox.description}
                        </p>
                        <p className="text-gray-700">
                            Author: {contentBox.author?.username}
                        </p>
                    </div>
                </div>
            )}

            {currentUser.role === 'ADMIN' && coursesData.createdCourses.length > 0 && (
                <div className="mb-12">
                    <h3 className="text-xl font-semibold mb-4">Created Courses</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {coursesData.createdCourses.map(course => (
                            <div key={course.id} className="flex flex-col h-full border p-4 rounded shadow">
                                {course.thumbnail && (
                                    <img 
                                        src={course.thumbnail} 
                                        alt={course.title}
                                        className="w-full h-48 object-cover mb-4 rounded"
                                    />
                                )}
                                <h3 className="font-bold text-lg mb-2">{course.title}</h3>
                                <div className="mb-4">
                                    <p className="text-gray-600 mb-2 line-clamp-4">
                                        {course.description}
                                    </p>
                                    <button
                                        type="button"
                                        className="border border-gray-400 rounded bg-slate-100 text-sm text-gray-600 hover:text-gray-800 px-2 py-1 hover:bg-slate-200 transition-colors duration-200"
                                        onClick={() => handleShowMore(course)}
                                    >
                                        Show more
                                    </button>
                                </div>
                                <div className="mt-auto">
                                    <div>
                                        <button
                                            onClick={() => handleUpdate(course.id)}
                                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors duration-200"
                                        >
                                            Update
                                        </button>
                                        <button
                                            onClick={() => handleDelete(course.id)}
                                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors duration-200"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div>
                <h3 className="text-xl font-semibold mb-4">Purchased Courses</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {coursesData.purchasedCourses.length > 0 ? (
                        coursesData.purchasedCourses.map(course => (
                            <div key={course.id} className="flex flex-col h-full border p-4 rounded shadow">
                                {course.thumbnail && (
                                    <img 
                                        src={course.thumbnail} 
                                        alt={course.title}
                                        className="w-full h-48 object-cover mb-4 rounded"
                                    />
                                )}
                                <h3 className="font-bold text-lg mb-2">{course.title}</h3>
                                <div className="mb-4">
                                    <p className="text-gray-600 mb-2 line-clamp-4">
                                        {course.description}
                                    </p>
                                    <button
                                        type="button"
                                        className="border border-gray-400 rounded bg-slate-100 text-sm text-gray-600 hover:text-gray-800 px-2 py-1 hover:bg-slate-200 transition-colors duration-200"
                                        onClick={() => handleShowMore(course)}
                                    >
                                        Show more
                                    </button>
                                </div>
                                <p className="text-sm text-gray-500 mt-auto">
                                    Author: {course.author.username}
                                </p>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500">No purchased courses yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default OwnedCourses;