import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Signup from './components/Signup'
import Signin from './components/Signin'
import ListedCourses from './components/ListedCourses'
import CreateCourse from './components/CreateCourse'
import UpdateCourse from './components/UpdateCourse'
import Navbar from './components/Navbar'
import OwnedCourses from './components/OwnedCourses'
import Razorpay from './components/razorpay'

function App() {
  return (
    <Router>
      <div>
        <Navbar />
        <Routes>

          <Route path="/" element={<Signin />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />

          {/* course related routes */}
          <Route path="/courses" element={<ListedCourses />} />
          <Route path="/createcourse" element={<CreateCourse />} />
          <Route path="/courses-by-user" element={<OwnedCourses />} />
          <Route path="/update-course/:courseId" element={<UpdateCourse />} />

          {/* Payment route */}
          <Route path="/payment" element={<Razorpay />} />

          {/* 404 for all routes */}
          <Route path="*" element={
            <div className="p-4">
              <h1 className="text-2xl font-bold">404: Page Not Found</h1>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  )
}

export default App