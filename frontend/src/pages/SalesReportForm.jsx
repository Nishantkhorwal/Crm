
import { useState } from "react"

const SalesReportForm = () => {
  const [date, setDate] = useState("")
  const [visitingCard, setVisitingCard] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [meeting, setMeeting] = useState({
    firmName: "",
    ownerName: "",
    phoneNumber: "",
    email: "",
    teamSize: "",
    rera: false,
    remark: "",
    status: "Interested", // default
    followUps: [
      { date: "", remark: "" } // start with one
    ],
  })

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  const updateFollowUp = (index, field, value) => {
    const updatedFollowUps = [...meeting.followUps];
    updatedFollowUps[index][field] = value;
    setMeeting((prev) => ({ ...prev, followUps: updatedFollowUps }));
  };

  const addFollowUp = () => {
    setMeeting((prev) => ({
      ...prev,
      followUps: [...prev.followUps, { date: "", remark: "" }],
    }));
  };


  const handleMeetingChange = (field, value) => {
    setMeeting((prev) => ({
      ...prev,
      [field]: field === "rera" ? value === "true" : value,
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    setVisitingCard(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    const token = localStorage.getItem("token")
    if (!token) {
      alert("Unauthorized")
      setIsSubmitting(false)
      return
    }

    const formData = new FormData()
    formData.append("date", date)
    formData.append("meetings", JSON.stringify([meeting]))
    if (visitingCard) {
      formData.append("visitingCard", visitingCard)
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/report/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      alert("Sales report created successfully")

      // Reset form
      setDate("")
      setVisitingCard(null)
      setMeeting({
        firmName: "",
        ownerName: "",
        phoneNumber: "",
        email: "",
        teamSize: "",
        rera: false,
        remark: "",
        status: "Interested",
        followUps: [{ date: "", remark: "" }],
      })
    } catch (err) {
      alert(`Error: ${err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6">
            <h2 className="text-2xl font-semibold text-white flex items-center">
              <span className="mr-3">📊</span>
              Report Details
            </h2>
          </div>

          <div className="p-8 space-y-8">
            {/* Date Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">📅</span>
                Report Information
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Report Date *</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Visiting Card</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      id="visitingCard"
                    />
                    <label
                      htmlFor="visitingCard"
                      className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors duration-200 flex items-center justify-center text-gray-600 hover:text-blue-600"
                    >
                      <span className="mr-2">📎</span>
                      {visitingCard ? visitingCard.name : "Choose file or drag here"}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Meeting Details Section */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                <span className="mr-2">🤝</span>
                Meeting Details
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Firm Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Firm Name *</label>
                  <input
                    type="text"
                    value={meeting.firmName}
                    onChange={(e) => handleMeetingChange("firmName", e.target.value)}
                    required
                    placeholder="Enter firm name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                  />
                </div>

                {/* Owner Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Owner Name *</label>
                  <input
                    type="text"
                    value={meeting.ownerName}
                    onChange={(e) => handleMeetingChange("ownerName", e.target.value)}
                    required
                    placeholder="Enter owner name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    value={meeting.phoneNumber}
                    onChange={(e) => handleMeetingChange("phoneNumber", e.target.value)}
                    required
                    placeholder="Enter phone number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={meeting.email}
                    onChange={(e) => handleMeetingChange("email", e.target.value)}
                    placeholder="Enter email address"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                  />
                </div>
                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                  <select
                    value={meeting.status}
                    onChange={(e) => handleMeetingChange("status", e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                  >
                    <option value="Interested">Interested</option>
                    <option value="Not Interested">Not Interested</option>
                  </select>
                </div>


                {/* Team Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Team Size</label>
                  <input
                    type="number"
                    value={meeting.teamSize}
                    onChange={(e) => handleMeetingChange("teamSize", e.target.value)}
                    placeholder="Enter team size"
                    min="1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                  />
                </div>

                {/* RERA Registration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">RERA Registered</label>
                  <select
                    value={meeting.rera}
                    onChange={(e) => handleMeetingChange("rera", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                  >
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </div>
              </div>

              {/* Remarks */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
                <textarea
                  value={meeting.remark}
                  onChange={(e) => handleMeetingChange("remark", e.target.value)}
                  placeholder="Enter any additional remarks or notes..."
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white resize-none"
                />
              </div>
            </div>
            {/* Follow-Ups */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-4">Follow Ups</label>
              {meeting.followUps.map((fup, idx) => (
                <div key={idx} className="grid md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="date"
                    value={fup.date}
                    onChange={(e) => updateFollowUp(idx, "date", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                  <input
                    type="text"
                    value={fup.remark}
                    onChange={(e) => updateFollowUp(idx, "remark", e.target.value)}
                    placeholder="Remark"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addFollowUp}
                className="mt-2 text-sm text-blue-600 hover:underline"
              >
                ➕ Add another follow-up
              </button>
            </div>


            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-8 py-4 rounded-xl font-semibold text-white text-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-lg hover:shadow-xl"
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <span className="mr-2">📤</span>
                    Submit Report
                  </span>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>All fields marked with * are required</p>
        </div>
      </div>
    </div>
  )
}

export default SalesReportForm
