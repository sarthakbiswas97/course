import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

axios.defaults.baseURL = '/api/v1'

function Signin() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [errorMessage, setErrorMessage] = useState(null)
    const [token, setToken] = useState(localStorage.getItem("token"))

    // useEffect(() => {
    //     if (token) {
    //         const fetchDetails = async () => {
    //             try {
    //                 const response = await axios.get("/verify-jwt", {
    //                     headers: {
    //                         "Authorization": `Bearer ${token}`
    //                     }
    //                 })
    //                 navigate("/courses")
    //             } catch (error) {
    //                 navigate('/signup')
    //             }
    //         }
    //         fetchDetails();
    //     }
    // }, [])

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        })
        setError(null)
        setErrorMessage(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            const response = await axios.post('/signin', formData)
            localStorage.setItem('token', response.data.token);
            navigate('/courses')
        } catch (error) {
            setErrorMessage(error.response?.data?.message)
            setTimeout(() => {
                setErrorMessage(null)
            }, 1000)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className='flex items-center justify-center min-h-screen'>
            <div className='w-full max-w-md'>
                <h2 className='text-2xl text-center mb-4'>Sign In</h2>
                {errorMessage && (
                    <div className="p-3 mb-4 text-sm text-red-500 bg-red-100 border border-red-400 rounded">
                        {errorMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className='space-y-4'>
                    <div>
                        <label htmlFor="email">Email</label>
                        <input
                            id='email'
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded ${error?.includes('email') ? 'border-red-500' : ''
                                }`}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password">Password</label>
                        <input
                            id='password'
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded ${error?.includes('password') ? 'border-red-500' : ''
                                }`}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className='w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600'
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>

                <p className='mt-4 text-center'>
                    Don't have an account?{' '}
                    <Link to="/signup" className='text-blue-500'>Sign up</Link>
                </p>
            </div>
        </div>
    )
}

export default Signin