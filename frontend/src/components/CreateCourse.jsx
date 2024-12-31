import React from 'react'
import axios from 'axios';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

axios.defaults.baseURL = '/api/v1'

function CreateCourse() {
    const navigate = useNavigate();
    const [file, setFile] = useState()
    const [courseData, setCourseData] = useState({
        title: '',
        description: '',
        price: '',
        thumbnail: ''

    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [successMessage, setSuccessMessage] = useState(null)
    const [userDetails, setUserDetails] = useState({
        userId: '',
        username: '',
        userRole: ''
    })
    const [token, setToken] = useState(localStorage.getItem("token"))

    useEffect(() => {
        if (!token) {
            navigate("/signin");
            return;
        }
        const fetchDetails = async () => {
            try {
                const response = await axios.get("/verify-jwt", {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                })

                setUserDetails({
                    userId: response.data.userId,
                    username: response.data.username,
                    userRole: response.data.userRole
                })

            } catch (error) {
                console.error(`Error Token verification`, error)
                navigate('/signin')
            }
        }
        fetchDetails();

    }, [ token])

    function handleFileChange(event) {
        const file = event.target.files[0];
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            setError('File not allowed');
            return;
        }
        setFile(file);
        setError(null);
    }

    const handleChange = (e) => {
        setCourseData({
            ...courseData,
            [e.target.id]: e.target.value.trim()
        })
        setError(null)
        setSuccessMessage(null)
    }

    const handleThumbnailUpload = async (putObjectParams) => {
        try {
            const signedUrlResponse = await axios.post("/put-signed-url", putObjectParams, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const { url } = signedUrlResponse.data;
            const uploadResponse = await axios.put(url, file, {
                headers: {
                    'Content-Type': file.type,
                }
            });
            console.log('Upload response:', uploadResponse);

            const thumbnailUrl = `https://${putObjectParams.bucket}.s3.amazonaws.com/${putObjectParams.key}`;
            if (!thumbnailUrl.startsWith('https://') || !thumbnailUrl.includes(putObjectParams.bucket)) {
                throw new Error('Invalid thumbnail URL generated');
            }
            return thumbnailUrl;

        } catch (error) {
            console.error('Thumbnail upload failed:', error);
            throw new Error('Failed to upload thumbnail');
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!courseData.title || !courseData.description) {
            setError("Title and description are required")
            return
        }

        setLoading(true)
        try {

            if (file) {
                const putObjectParams = {
                    bucket: "course-selling-app-storage",
                    key: `thumbnails/${userDetails.username}/${Date.now()}-${file.name}`,
                    contentType: file.type
                };

                const thumbnailUrl = await handleThumbnailUpload(putObjectParams)
                if (!thumbnailUrl) {
                    setError("Thumbnail upload failed");
                    return;
                }
                const courseDataWithThumbnail = { ...courseData, thumbnail: thumbnailUrl }
                const response = await axios.post(`createcourse`, courseDataWithThumbnail, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                })
            } else {
                const response = await axios.post(`createcourse`, courseData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                })
            }

            setSuccessMessage("Course created successfully!")

            setTimeout(() => {
                navigate('/courses')
            }, 1000)

        } catch (error) {

            if (error.response) {
                switch (error.response.status) {
                    case 401:
                        setError("Please sign in again")
                        localStorage.removeItem("token")
                        setTimeout(() => navigate('/signin'), 1000)
                        break
                    case 403:
                        setError("Access denied. Admin required")
                        break
                    case 500:
                        setError("Server error. Please try again later")
                        break
                    default:
                        setError("Something went wrong. Please try again")
                }
            } else {
                setError("Network error. Please check your connection")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='flex items-center justify-center min-h-screen'>
            <div className='w-full max-w-md'>
                <h2 className='text-2xl text-center mb-4'>Create Course</h2>

                {error && (
                    <div className="p-3 mb-4 text-sm text-red-500 bg-red-100 border border-red-400 rounded">
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div className="p-3 mb-4 text-sm text-green-500 bg-green-100 border border-green-400 rounded">
                        {successMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className='space-y-4'>
                    <div>
                        <label htmlFor="title">Title</label>
                        <input
                            id='title'
                            onChange={handleChange}
                            type="text"
                            placeholder='Title'
                            className='w-full p-2 border rounded'
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="description">Description</label>
                        <textarea
                            id='description'
                            onChange={handleChange}
                            type="text"
                            placeholder='Description'
                            rows={4}
                            className='w-full p-2 border rounded resize-y min-h-[100px] max-h-[300px]'
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="price">Price</label>
                        <input
                            id='price'
                            onChange={handleChange}
                            type="number"
                            placeholder='Price'
                            className='w-full p-2 border rounded'
                            required
                        />
                    </div>

                    <input type="file" onChange={handleFileChange} />
                    <button
                        type='submit'
                        disabled={loading}
                        className='w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300'
                    >
                        {loading ? 'Creating...' : 'Create Course'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default CreateCourse