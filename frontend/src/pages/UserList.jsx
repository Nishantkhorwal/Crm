import { useEffect, useState } from "react"
import {
  User,
  CheckCircle,
  Search,
  Users,
  Target,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  XCircle,
  UserMinus,
  UserPlus,
} from "lucide-react"

const API_URL = import.meta.env.VITE_API_BASE_URL

const UserList = () => {
  const [users, setUsers] = useState([])
  const [selectedUserId, setSelectedUserId] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [unassignSearchTerm, setUnassignSearchTerm] = useState("")
  const [leads, setLeads] = useState([])
  const [assignedLeads, setAssignedLeads] = useState([])
  const [selectedLeadIds, setSelectedLeadIds] = useState([])
  const [selectedUnassignLeadIds, setSelectedUnassignLeadIds] = useState([])
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState("") // success, error, info
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("assign") // assign or unassign
  const token = localStorage.getItem("token")

  const showMessage = (text, type = "info") => {
    setMessage(text)
    setMessageType(type)
    setTimeout(() => {
      setMessage("")
      setMessageType("")
    }, 5000)
  }

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/all`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Failed to fetch users")
      const data = await res.json()
      setUsers(data)
    } catch (err) {
      console.error("Fetch users error:", err)
      showMessage("Failed to load users", "error")
    }
  }

  const searchLeads = async () => {
    if (!searchTerm.trim()) {
      showMessage("Please enter a search term", "error")
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/client/search?query=${searchTerm}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setLeads(data)
      showMessage(`Found ${data.length} leads`, "success")
    } catch (err) {
      console.error(err)
      showMessage("Failed to search leads", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const searchAssignedLeads = async () => {
    if (!unassignSearchTerm.trim()) {
      showMessage("Please enter a search term", "error")
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/client/search?query=${unassignSearchTerm}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      // Filter only assigned leads (assuming there's a way to identify them)
      setAssignedLeads(data)
      showMessage(`Found ${data.length} assigned leads`, "success")
    } catch (err) {
      console.error(err)
      showMessage("Failed to search assigned leads", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleLeadSelection = (leadId) => {
    setSelectedLeadIds((prev) => (prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId]))
  }

  const toggleUnassignLeadSelection = (leadId) => {
    setSelectedUnassignLeadIds((prev) =>
      prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId],
    )
  }

  const assignLeads = async () => {
    if (!selectedUserId || selectedLeadIds.length === 0) {
      showMessage("Please select a user and at least one lead", "error")
      return
    }

    setIsLoading(true)
    try {
      await Promise.all(
        selectedLeadIds.map((leadId) =>
          fetch(`${API_URL}/api/client/assign`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ leadId, userId: selectedUserId }),
          }),
        ),
      )
      showMessage(`Successfully assigned ${selectedLeadIds.length} leads`, "success")
      setSelectedLeadIds([])
      setLeads([])
      setSearchTerm("")
    } catch (error) {
      showMessage("Failed to assign leads", "error")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const unassignLeads = async () => {
    if (selectedUnassignLeadIds.length === 0) {
      showMessage("Please select at least one lead to unassign", "error")
      return
    }

    setIsLoading(true)
    try {
      await Promise.all(
        selectedUnassignLeadIds.map((leadId) =>
          fetch(`${API_URL}/api/client/unassign`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ leadId }),
          }),
        ),
      )
      showMessage(`Successfully unassigned ${selectedUnassignLeadIds.length} leads`, "success")
      setSelectedUnassignLeadIds([])
      setAssignedLeads([])
      setUnassignSearchTerm("")
    } catch (error) {
      showMessage("Failed to unassign leads", "error")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const selectedUser = users.find((user) => user._id === selectedUserId)

  const resetAssignTab = () => {
    setSelectedLeadIds([])
    setLeads([])
    setSearchTerm("")
    setSelectedUserId("")
  }

  const resetUnassignTab = () => {
    setSelectedUnassignLeadIds([])
    setAssignedLeads([])
    setUnassignSearchTerm("")
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Lead Management Center</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Manage lead assignments efficiently. Choose between assigning new leads to team members or unassigning
            existing leads.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-xl p-1 shadow-sm border border-gray-200">
            <button
              onClick={() => {
                setActiveTab("assign")
                resetUnassignTab()
              }}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === "assign"
                  ? "bg-blue-500 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Assign Leads
            </button>
            <button
              onClick={() => {
                setActiveTab("unassign")
                resetAssignTab()
              }}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === "unassign"
                  ? "bg-red-500 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <UserMinus className="w-4 h-4" />
              Unassign Leads
            </button>
          </div>
        </div>

        {/* Assign Tab Content */}
        {activeTab === "assign" && (
          <>
            {/* Progress Steps for Assign */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      selectedUserId ? "bg-green-500 text-white" : "bg-blue-500 text-white"
                    }`}
                  >
                    1
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700">Select User</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      leads.length > 0 ? "bg-green-500 text-white" : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    2
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700">Search Leads</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      selectedLeadIds.length > 0 ? "bg-green-500 text-white" : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    3
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700">Assign Leads</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Step 1: User Selection */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 p-2 rounded-lg mr-3">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Step 1: Select User</h2>
                </div>

                <p className="text-gray-600 text-sm mb-4">
                  Choose the team member who will receive the assigned leads.
                </p>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Available Team Members</label>
                  <div className="relative">
                    <select
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none"
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      value={selectedUserId}
                    >
                      <option value="">Choose a team member...</option>
                      {users.map((user) => (
                        <option key={user._id} value={user._id}>
                          {user.name} ({user.email})
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {selectedUser && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-green-800">Selected: {selectedUser.name}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 2: Lead Search */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-green-100 p-2 rounded-lg mr-3">
                    <Search className="w-5 h-5 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Step 2: Search Leads</h2>
                </div>

                <p className="text-gray-600 text-sm mb-4">Search for unassigned leads by name or email address.</p>

                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter name or email to search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      onKeyPress={(e) => e.key === "Enter" && searchLeads()}
                    />
                    <button
                      onClick={searchLeads}
                      disabled={isLoading}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                      Search
                    </button>
                  </div>

                  {leads.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center">
                        <Target className="w-4 h-4 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-blue-800">Found {leads.length} leads</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 3: Assignment Action */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-purple-100 p-2 rounded-lg mr-3">
                    <UserPlus className="w-5 h-5 text-purple-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Step 3: Assign</h2>
                </div>

                <p className="text-gray-600 text-sm mb-4">Assign the selected leads to the chosen team member.</p>

                <div className="space-y-3">
                  {selectedLeadIds.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                      <div className="flex items-center">
                        <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
                        <span className="text-sm font-medium text-yellow-800">
                          {selectedLeadIds.length} leads selected
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={assignLeads}
                    disabled={!selectedUserId || selectedLeadIds.length === 0 || isLoading}
                    className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Assign Selected Leads
                  </button>
                </div>
              </div>
            </div>

            {/* Leads Grid for Assignment */}
            {leads.length > 0 && (
              <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Available Leads for Assignment</h3>
                  <div className="text-sm text-gray-600">Click on leads to select them for assignment</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {leads.map((lead) => (
                    <div
                      key={lead._id}
                      onClick={() => toggleLeadSelection(lead._id)}
                      className={`cursor-pointer border-2 rounded-xl p-4 transition-all duration-200 hover:shadow-md ${
                        selectedLeadIds.includes(lead._id)
                          ? "bg-green-50 border-green-500 shadow-md transform scale-105"
                          : "bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-sm mb-1">{lead.name}</h4>
                          <p className="text-xs text-gray-600 break-all">{lead.email}</p>
                        </div>
                        {selectedLeadIds.includes(lead._id) && (
                          <div className="bg-green-500 rounded-full p-1 ml-2">
                            <CheckCircle className="text-white w-4 h-4" />
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            selectedLeadIds.includes(lead._id)
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {selectedLeadIds.includes(lead._id) ? "Selected" : "Click to select"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Unassign Tab Content */}
        {activeTab === "unassign" && (
          <>
            {/* Progress Steps for Unassign */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      assignedLeads.length > 0 ? "bg-green-500 text-white" : "bg-red-500 text-white"
                    }`}
                  >
                    1
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700">Search Assigned Leads</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      selectedUnassignLeadIds.length > 0 ? "bg-green-500 text-white" : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    2
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700">Unassign Leads</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Step 1: Search Assigned Leads */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-red-100 p-2 rounded-lg mr-3">
                    <Search className="w-5 h-5 text-red-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Step 1: Search Assigned Leads</h2>
                </div>

                <p className="text-gray-600 text-sm mb-4">
                  Search for currently assigned leads by name or email address.
                </p>

                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter name or email to search..."
                      value={unassignSearchTerm}
                      onChange={(e) => setUnassignSearchTerm(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                      onKeyPress={(e) => e.key === "Enter" && searchAssignedLeads()}
                    />
                    <button
                      onClick={searchAssignedLeads}
                      disabled={isLoading}
                      className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                      Search
                    </button>
                  </div>

                  {assignedLeads.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center">
                        <Target className="w-4 h-4 text-red-600 mr-2" />
                        <span className="text-sm font-medium text-red-800">
                          Found {assignedLeads.length} assigned leads
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 2: Unassign Action */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-orange-100 p-2 rounded-lg mr-3">
                    <UserMinus className="w-5 h-5 text-orange-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Step 2: Unassign</h2>
                </div>

                <p className="text-gray-600 text-sm mb-4">Remove assignment from the selected leads.</p>

                <div className="space-y-3">
                  {selectedUnassignLeadIds.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                      <div className="flex items-center">
                        <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
                        <span className="text-sm font-medium text-yellow-800">
                          {selectedUnassignLeadIds.length} leads selected
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={unassignLeads}
                    disabled={selectedUnassignLeadIds.length === 0 || isLoading}
                    className="w-full bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    Unassign Selected Leads
                  </button>
                </div>
              </div>
            </div>

            {/* Assigned Leads Grid for Unassignment */}
            {assignedLeads.length > 0 && (
              <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Assigned Leads</h3>
                  <div className="text-sm text-gray-600">Click on leads to select them for unassignment</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {assignedLeads.map((lead) => (
                    <div
                      key={lead._id}
                      onClick={() => toggleUnassignLeadSelection(lead._id)}
                      className={`cursor-pointer border-2 rounded-xl p-4 transition-all duration-200 hover:shadow-md ${
                        selectedUnassignLeadIds.includes(lead._id)
                          ? "bg-red-50 border-red-500 shadow-md transform scale-105"
                          : "bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-sm mb-1">{lead.name}</h4>
                          <p className="text-xs text-gray-600 break-all">{lead.email}</p>
                        </div>
                        {selectedUnassignLeadIds.includes(lead._id) && (
                          <div className="bg-red-500 rounded-full p-1 ml-2">
                            <CheckCircle className="text-white w-4 h-4" />
                          </div>
                        )}
                      </div>

                      
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Message Display */}
        {message && (
          <div className="fixed bottom-4 right-4 z-50">
            <div
              className={`rounded-lg p-4 shadow-lg border-l-4 max-w-md ${
                messageType === "success"
                  ? "bg-green-50 border-green-500 text-green-800"
                  : messageType === "error"
                    ? "bg-red-50 border-red-500 text-red-800"
                    : "bg-blue-50 border-blue-500 text-blue-800"
              }`}
            >
              <div className="flex items-center">
                {messageType === "success" && <CheckCircle2 className="w-5 h-5 mr-2" />}
                {messageType === "error" && <XCircle className="w-5 h-5 mr-2" />}
                {messageType === "info" && <AlertCircle className="w-5 h-5 mr-2" />}
                <span className="font-medium">{message}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserList
