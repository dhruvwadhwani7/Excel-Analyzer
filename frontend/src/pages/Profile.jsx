import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

const Profile = () => {
  const { user, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [newName, setNewName] = useState(user?.name)

  const handleSubmit = async () => {
    try {
      const token = sessionStorage.getItem('userToken')
      const response = await fetch('http://localhost:5000/api/user/update-name', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newName })
      })
      const data = await response.json()
      if (data.success) {
        updateUser({ ...user, name: newName })
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Error updating name:', error)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-blue-600 rounded-full p-4">
              <span className="text-3xl text-white">{user?.name[0].toUpperCase()}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Profile Information</h1>
          </div>
          <div className="space-y-4">
            <div className="border-b pb-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">Full Name</p>
                {!isEditing && (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="text-blue-600 text-sm hover:text-blue-700"
                  >
                    Edit
                  </button>
                )}
              </div>
              {isEditing ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="text-lg font-medium border rounded px-2 py-1"
                  />
                  <button 
                    onClick={handleSubmit}
                    className="text-green-600 hover:text-green-700"
                  >
                    Save
                  </button>
                  <button 
                    onClick={() => {
                      setIsEditing(false)
                      setNewName(user?.name)
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <p className="text-lg font-medium">{user?.name}</p>
              )}
            </div>
            <div className="border-b pb-4">
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-lg font-medium">{user?.email}</p>
            </div>
            <div className="border-b pb-4">
              <p className="text-sm text-gray-500">Phone Number</p>
              <p className="text-lg font-medium">+91 {user?.phoneNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Account Type</p>
              <p className="text-lg font-medium capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
