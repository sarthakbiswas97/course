import React from 'react'
import axios from 'axios';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

axios.defaults.baseURL = '/api/v1'

function UpdateCourse() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    price: ""
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [token, setToken] = useState(localStorage.getItem("token"))

  useEffect(() => {
    if (!token) {
      navigate("/signin");
      return;
    }

    const fetchCourseDetails = async () => {
      try {
        const response = await axios.get(`/course/${courseId}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        setCourseData({
          title: response.data.title,
          description: response.data.description,
          price: response.data.price
        });
      } catch (error) {
        setError("Failed to fetch course details");
        if (error.response?.status === 401) {
          navigate('/signin');
        }
      }
    };

    fetchCourseDetails();
  }, [courseId, token, navigate]);

  const handleChange = (e) => {
    setCourseData({
      ...courseData,
      [e.target.id]: e.target.value.trim()
    })
    setError(null)
    setSuccessMessage(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await axios.put(`update-course/${courseId}`, courseData, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })
      setSuccessMessage(response.data.message)
      setTimeout(() => {
        navigate('/courses')
      }, 1000)

    } catch (error) {
      if (error.response) {
        switch (error.response.status) {
          case 400:
            setError(error.response.data.message)
            break
          case 401:
            setError("Please sign in again")
            localStorage.removeItem("token")
            navigate('/signin')
            break
          case 403:
            setError(error.response.data.message)
            break
          case 404:
            setError(error.response.data.message)
            break
          case 500:
            setError("Failed to update course")
            break
          default:
            setError("Something went wrong")
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
        <h2 className='text-2xl text-center mb-4'>Update Course</h2>

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
              value={courseData.title}
              type="text"
              placeholder='Title'
              className='w-full p-2 border rounded'
            />
          </div>

          <div>
            <label htmlFor="description">Description</label>
            <textarea
              id='description'
              onChange={handleChange}
              value={courseData.description}
              placeholder='Description'
              rows={4}
              className='w-full p-2 border rounded resize-y min-h-[100px] max-h-[300px]'
            />
          </div>
          <div>
            <label htmlFor="price">Price</label>
            <input
              id='price'
              onChange={handleChange}
              value={courseData.price}
              type="number"
              placeholder='Price'
              className='w-full p-2 border rounded'
              required
            />
          </div>

          <button
            type='submit'
            disabled={loading}
            className='w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300'
          >
            {loading ? 'Updating...' : 'Update Course'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default UpdateCourse