"use client"

import { useState, useEffect } from "react"
import {
  PencilIcon,
  SearchIcon,
  FilterIcon,
  XIcon,
  CheckIcon,
  AlertTriangleIcon,
  UserIcon,
  MailIcon,
  ShieldIcon,
  UsersIcon,
} from "lucide-react"

const EditUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    managerId: null,
  })
  const [formErrors, setFormErrors] = useState({})

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

  // Auto-clear notifications
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null)
        setSuccess(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, success])

  // Fetch users
  const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch(`${API_BASE_URL}/api/auth/getusers`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) throw new Error("Failed to fetch users")

        const data = await response.json()
        if (data.success) {
          setUsers(data.data)
        } else {
          throw new Error(data.message || "Failed to fetch users")
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
  useEffect(() => {
    

    fetchUsers()
  }, [API_BASE_URL])

  // Filter users based on search and role
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  // Validate form field
  const validateField = (name, value) => {
    const errors = { ...formErrors }

    switch (name) {
      case "name":
        if (!value.trim()) {
          errors.name = "Name is required"
        } else if (value.trim().length < 2) {
          errors.name = "Name must be at least 2 characters"
        } else {
          delete errors.name
        }
        break
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!value.trim()) {
          errors.email = "Email is required"
        } else if (!emailRegex.test(value)) {
          errors.email = "Please enter a valid email"
        } else {
          delete errors.email
        }
        break
      case "password":
        if (value && value.length < 6) {
          errors.password = "Password must be at least 6 characters"
        } else {
          delete errors.password
        }
        break
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Open edit modal
  const handleEditClick = (user) => {
    setCurrentUser(user)
    setEditForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      managerId: user.manager?._id || null,
    })
    setFormErrors({})
    setIsModalOpen(true)
  }

  // Handle form changes with validation
  const handleFormChange = (e) => {
    const { name, value } = e.target
    setEditForm((prev) => ({ ...prev, [name]: value }))
    validateField(name, value)
  }

  // Handle role change
  const handleRoleChange = (e) => {
    const role = e.target.value
    setEditForm((prev) => ({
      ...prev,
      role,
      managerId: role === "manager" ? null : prev.managerId,
    }))
  }

  // Get available managers
  const getAvailableManagers = () => {
    return users.filter((user) => user.role === "manager" && user._id !== currentUser?._id && user.role !== "admin")
  }

  // Handle form submission with optimistic update
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate all fields
    const nameValid = validateField("name", editForm.name)
    const emailValid = validateField("email", editForm.email)
    const passwordValid = validateField("password", editForm.password)

    if (!nameValid || !emailValid || !passwordValid) {
      setError("Please fix the form errors")
      return
    }

    setIsSubmitting(true)

    // Optimistic update - update UI immediately
    const updatedUser = {
      ...currentUser,
      name: editForm.name,
      email: editForm.email,
      role: editForm.role,
      manager: editForm.managerId ? users.find((u) => u._id === editForm.managerId) : null,
    }

    // Update users list immediately
    setUsers((prevUsers) => prevUsers.map((user) => (user._id === currentUser._id ? updatedUser : user)))

    // Close modal immediately for instant feel
    setIsModalOpen(false)
    setSuccess("User updated successfully!")

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/api/auth/${currentUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      })

      if (!response.ok) {
        throw new Error("Failed to update user")
      }

      const data = await response.json()
      // Update with actual server response
      setUsers((prevUsers) => prevUsers.map((user) => (user._id === currentUser._id ? data.user : user)))
      fetchUsers();
    } catch (err) {
      // Revert optimistic update on error
      setUsers((prevUsers) => prevUsers.map((user) => (user._id === currentUser._id ? currentUser : user)))
      setError(err.message)
      setSuccess(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false)
    setFormErrors({})
  }

  // Notification component
  const Notification = ({ type, message, onClose }) => (
    <div
      className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-3 transition-all duration-300 ${
        type === "error" ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"
      }`}
    >
      {type === "error" ? (
        <AlertTriangleIcon className="h-5 w-5 text-red-500" />
      ) : (
        <CheckIcon className="h-5 w-5 text-green-500" />
      )}
      <span className={`text-sm font-medium ${type === "error" ? "text-red-800" : "text-green-800"}`}>{message}</span>
      <button onClick={onClose} className="ml-2">
        <XIcon className={`h-4 w-4 ${type === "error" ? "text-red-500" : "text-green-500"}`} />
      </button>
    </div>
  )

  // Role badge component
  const RoleBadge = ({ role }) => {
    const styles = {
      admin: "bg-purple-100 text-purple-800 border-purple-200",
      manager: "bg-blue-100 text-blue-800 border-blue-200",
      user: "bg-green-100 text-green-800 border-green-200",
    }

    return (
      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${styles[role]}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    )
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="bg-white rounded-lg p-6 mb-6">
              <div className="h-10 bg-gray-200 rounded mb-4"></div>
            </div>
            <div className="bg-white rounded-lg overflow-hidden">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="border-b border-gray-200 p-6">
                  <div className="flex space-x-4">
                    <div className="h-4 bg-gray-200 rounded flex-1"></div>
                    <div className="h-4 bg-gray-200 rounded flex-1"></div>
                    <div className="h-4 bg-gray-200 rounded flex-1"></div>
                    <div className="h-4 bg-gray-200 rounded flex-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <UsersIcon className="h-8 w-8 mr-3 text-indigo-600" />
                User Management
              </h1>
              <p className="mt-2 text-gray-600">Manage and edit user accounts in your organization</p>
            </div>
            <div className="text-sm text-gray-500">
              Total Users: <span className="font-semibold text-gray-900">{users.length}</span>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Role Filter */}
            <div className="flex items-center space-x-2">
              <FilterIcon className="h-5 w-5 text-gray-400" />
              <div className="flex space-x-1">
                {["all", "admin", "manager", "user"].map((role) => (
                  <button
                    key={role}
                    onClick={() => setRoleFilter(role)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      roleFilter === role
                        ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                    }`}
                  >
                    {role === "all" ? "All Roles" : role.charAt(0).toUpperCase() + role.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <UserIcon className="h-4 w-4 mr-2" />
                      User
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <MailIcon className="h-4 w-4 mr-2" />
                      Email
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <ShieldIcon className="h-4 w-4 mr-2" />
                      Role
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Manager
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      <UsersIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">No users found</p>
                      <p className="text-sm">Try adjusting your search or filter criteria</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-indigo-600 font-medium text-sm">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {user.manager?.name || <span className="text-gray-400 italic">No manager assigned</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.role !== "admin" && (
                          <button
                            onClick={() => handleEditClick(user)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                          >
                            <PencilIcon className="h-4 w-4 mr-1" />
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit User Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Edit User</h2>
                  <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <XIcon className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={editForm.name}
                      onChange={handleFormChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                        formErrors.name ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="Enter full name"
                    />
                    {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
                  </div>

                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={editForm.email}
                      onChange={handleFormChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                        formErrors.email ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="Enter email address"
                    />
                    {formErrors.email && <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>}
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <input
                      type="password"
                      name="password"
                      value={editForm.password}
                      onChange={handleFormChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                        formErrors.password ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="Leave blank to keep current password"
                    />
                    {formErrors.password && <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>}
                    <p className="mt-1 text-xs text-gray-500">Leave empty to keep the current password</p>
                  </div>

                  {/* Role Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                    <select
                      name="role"
                      value={editForm.role}
                      onChange={handleRoleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    >
                      <option value="user">User</option>
                      <option value="manager">Manager</option>
                    </select>
                  </div>

                  {/* Manager Selection */}
                  {editForm.role === "user" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Assign Manager *</label>
                      <select
                        name="managerId"
                        value={editForm.managerId || ""}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        required={editForm.role === "user"}
                      >
                        <option value="">Select a manager</option>
                        {getAvailableManagers().map((manager) => (
                          <option key={manager._id} value={manager._id}>
                            {manager.name} ({manager.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Update User
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Notifications */}
        {error && <Notification type="error" message={error} onClose={() => setError(null)} />}
        {success && <Notification type="success" message={success} onClose={() => setSuccess(null)} />}
      </div>
    </div>
  )
}

export default EditUsers
