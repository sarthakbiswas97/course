import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

axios.defaults.baseURL = '/api/v1';

function ListedCourses() {
    const navigate = useNavigate();
    const [coursesData, setCoursesData] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [contentBox, setContentBox] = useState(null);
    const token = localStorage.getItem("token");
    const KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

    useEffect(() => {
        if (!token) {
            navigate('/signin');
            return;
        }

        const fetchCourses = async () => {
            try {
                const response = await axios.get('/courses', {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
                setCoursesData(response.data.courses);
                setCurrentUser(response.data.currentUser);
            } catch (error) {
                if (error.response?.status === 401) {
                    navigate('/signin');
                }
                setErrorMessage(error.response?.data?.error || "Failed to fetch courses");
            }
        };

        if (errorMessage) {
            const timer = setTimeout(() => {
                setErrorMessage(null)

            }, 2000)
            return () => clearTimeout(timer)
        }

        fetchCourses();
    }, [token,errorMessage]);

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

    const handleUpdate = (courseId) => {
        navigate(`/update-course/${courseId}`);
    };

    const handleBuy = async (courseId, coursePrice) => {
        try {
            const orderResponse = await axios.post('/payment/create-order',
                { amount: coursePrice * 100 },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const { amount, id } = orderResponse.data;

            const options = {
                key: KEY_ID,
                amount: Number(amount),
                currency: "INR",
                name: "course-selling-app",
                order_id: id,
                handler: async function (response) {
                    try {
                        
                        const purchaseResponse = await axios.post(`/buy-course/${courseId}`, {
                            orderId: id
                        }, {
                            headers: {
                                "Authorization": `Bearer ${token}`
                            }
                        });

                        setSuccessMessage(purchaseResponse.data.message);
                        setTimeout(() => {
                            window.location.reload();
                        }, 1000);
                    } catch (error) {
                        setErrorMessage(error.response?.data?.message || "Payment verification failed");
                    }
                },
                modal: {
                    ondismiss: function () {
                        setErrorMessage("Payment cancelled");
                    }
                }
            };

            const razorpayWindow = new window.Razorpay(options);
            razorpayWindow.open();

        } catch (error) {
            setErrorMessage(error.response?.data?.message || "Failed to initiate payment");
        }
    };

    const handleShowMore = (course) => {
        setContentBox(course);
    };

    const closeModal = () => {
        setContentBox(null);
    };

    if (!coursesData || !currentUser) {
        return <div>Loading...</div>;
    }

    return (
        <div className="p-16">
            <h2 className="text-2xl text-center mb-4">Listed Courses</h2>

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
                            <h3 className="text-xl font-bold">{contentBox.title}</h3>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
                        </div>
                        {contentBox.thumbnail && (
                            <img src={contentBox.thumbnail} alt={contentBox.title} className="w-full h-48 object-cover mb-4 rounded" />
                        )}
                        <p className="text-gray-600 mb-4">{contentBox.description}</p>
                        <p className="text-gray-700">Author: {contentBox.author.username}</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {coursesData.map((course) => {
                    const isOwner = course.author.id === currentUser.id;
                    const isAdmin = currentUser.role === "ADMIN";
                    const hasPurchased = course.purchasedBy?.some(user => user.id === currentUser.id);

                    return (
                        <div key={course.id} className="flex flex-col h-full border p-4 rounded shadow hover:shadow-lg transition-shadow duration-200">
                            {course.thumbnail && (
                                <img src={course.thumbnail} alt={course.title} className="w-full h-48 object-cover mb-4 rounded" />
                            )}
                            <h3 className="font-bold text-lg mb-2">{course.title}</h3>

                            <div className="mb-4">
                                <p className="text-gray-600 mb-2 line-clamp-4">{course.description}</p>
                                <button
                                    type="button"
                                    className="border border-gray-400 rounded bg-slate-100 text-sm text-gray-600 hover:text-gray-800 px-2 py-1 hover:bg-slate-200 transition-colors duration-200"
                                    onClick={() => handleShowMore(course)}
                                >
                                    Show more
                                </button>
                            </div>

                            <p className="text-gray-700 mb-4 mt-auto">Author: {course.author.username}</p>

                            <div className="flex gap-2 mt-auto">
                                {!isOwner && !hasPurchased && (
                                    <div className='display'>
                                        <div className="text-lg font-medium mb-2">Rs {course.price}/-</div>
                                        <button
                                            onClick={() => handleBuy(course.id, course.price)}
                                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-200"
                                        >
                                            Buy Now
                                        </button>
                                    </div>
                                )}

                                {hasPurchased && (
                                    <span className="text-green-500 px-4 py-2 flex items-center">
                                        Purchased ✓
                                    </span>
                                )}

                                {isAdmin && isOwner && (
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
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default ListedCourses;