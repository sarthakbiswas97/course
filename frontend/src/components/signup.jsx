import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

axios.defaults.baseURL = '/api/v1'

function Signup() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        role: ''
    })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const token = localStorage.getItem("token")

    // useEffect(() => {

    //     if(token){
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
    //     }
    //     fetchDetails();
    // }, [])

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        })
        setError(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            await axios.post('/signup', formData)
            navigate('/signin')
        } catch (error) {
            setError(error.response?.data?.error)

        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className='flex items-center justify-center min-h-screen'>
            <div className='w-full max-w-md'>
                <h2 className='text-2xl text-center mb-4'>Sign Up</h2>
                {error && (
                    <div className="p-3 mb-4 text-sm text-red-500 bg-red-100 border border-red-400 rounded">
                        {error}
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
                        <label htmlFor="username">Username</label>
                        <input
                            id='username'
                            type="text"
                            value={formData.username}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded ${error?.includes('username') ? 'border-red-500' : ''
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
                            className='w-full p-2 border rounded'
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="role">Role</label>
                        <select
                            id='role'
                            value={formData.role}
                            onChange={handleChange}
                            className='w-full p-2 border rounded'
                            required
                        >
                            <option value="">Select Role</option>
                            <option value="USER">USER</option>
                            <option value="ADMIN">ADMIN</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className='w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600'
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing up...' : 'Sign up'}
                    </button>
                </form>

                <p className='mt-4 text-center'>
                    Already have an account?
                    <Link to="/signin" className='text-blue-500'>Sign in</Link>
                </p>
            </div>
        </div>
    )
}

export default Signup