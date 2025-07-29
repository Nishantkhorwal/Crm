"use client"

import { useState } from "react"
import { Plus, User, Phone, Mail, Calendar, MessageSquare, FileText, CheckCircle, AlertCircle } from "lucide-react"

const CreateClientForm = () => {
  const [form, setForm] = useState({
    name: "",
    source: "",
    leadDated: "",
    phone: "",
    email: "",
    status: "New",
    lastRemark: "",
    nextTaskDate: "",
    waSent: false,
  })

  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const validateForm = () => {
    const newErrors = {}

    if (!form.name.trim()) newErrors.name = "Name is required"
    if (!form.phone.trim()) newErrors.phone = "Phone is required"
    if (!form.email.trim()) newErrors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Email is invalid"
    if (!form.leadDated) newErrors.leadDated = "Lead date is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setMessage("")

    try {
      const res = await fetch(`${API_BASE_URL}/api/client/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage("Client created successfully!")
        setForm({
          name: "",
          source: "",
          leadDated: "",
          phone: "",
          email: "",
          status: "New",
          lastRemark: "",
          nextTaskDate: "",
          waSent: false,
        })
      } else {
        setMessage(data.error || "Creation failed.")
      }
    } catch (err) {
      console.error(err)
      setMessage("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const inputFields = [
    { name: "name", label: "Client Name", type: "text", icon: User, placeholder: "Enter client name" },
    {
      name: "source",
      label: "Lead Source",
      type: "text",
      icon: FileText,
      placeholder: "e.g., Website, Referral, Social Media",
    },
    { name: "leadDated", label: "Lead Date", type: "date", icon: Calendar },
    { name: "phone", label: "Phone Number", type: "tel", icon: Phone, placeholder: "+1 (555) 123-4567" },
    { name: "email", label: "Email Address", type: "email", icon: Mail, placeholder: "client@example.com" },
    {
      name: "lastRemark",
      label: "Last Remark",
      type: "text",
      icon: MessageSquare,
      placeholder: "Add any notes or comments",
    },
    { name: "nextTaskDate", label: "Next Task Date", type: "date", icon: Calendar },
  ]

  const statusOptions = [
  { value: "New", color: "bg-blue-50 text-blue-700" },
  { value: "Unassigned", color: "bg-gray-50 text-gray-700" },
  { value: "Closed", color: "bg-red-100 text-red-800" },
  { value: "Follow Up", color: "bg-yellow-50 text-yellow-700" },
  { value: "Time Given", color: "bg-indigo-50 text-indigo-700" },
  { value: "Not Interested", color: "bg-rose-50 text-rose-700" },
  { value: "Details shared on WA", color: "bg-teal-50 text-teal-700" },
  { value: "Call Again", color: "bg-orange-50 text-orange-700" },
  { value: "Call not Picked", color: "bg-gray-50 text-gray-600" },
  { value: "Broker", color: "bg-fuchsia-50 text-fuchsia-700" },
  { value: "Already Talking to someone", color: "bg-purple-50 text-purple-700" },
  { value: "Phone Off", color: "bg-neutral-50 text-neutral-600" },
  { value: "Phone not reachable", color: "bg-slate-50 text-slate-700" },
  { value: "Filled by Mistake", color: "bg-zinc-50 text-zinc-700" },
  { value: "SV Scheduled", color: "bg-cyan-50 text-cyan-700" },
  { value: "SV Did not happen", color: "bg-pink-50 text-pink-700" },
  { value: "SV Done", color: "bg-lime-50 text-lime-700" },
  { value: "Low Budget", color: "bg-amber-50 text-amber-700" },
  { value: "Duplicate Lead", color: "bg-stone-50 text-stone-700" },
  { value: "Other Lead", color: "bg-violet-50 text-violet-700" },
  { value: "Pravasa Lead", color: "bg-sky-50 text-sky-700" }
];


  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200">
      <div className="px-6 py-4 border-b border-slate-200">
        <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" />
          Create New Client
        </h2>
        <p className="text-sm text-slate-600 mt-1">Add a new client to your CRM database</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Input Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {inputFields.map((field) => {
            const Icon = field.icon
            return (
              <div key={field.name} className={field.name === "lastRemark" ? "md:col-span-2" : ""}>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {field.label}
                  {["name", "phone", "email", "leadDated"].includes(field.name) && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icon className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type={field.type}
                    name={field.name}
                    value={form[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors[field.name] ? "border-red-300 bg-red-50" : "border-slate-300 hover:border-slate-400"
                    }`}
                  />
                </div>
                {errors[field.name] && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors[field.name]}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        {/* Status Dropdown */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            {statusOptions.map((status) => (
              <option key={status.value} value={status.value}>
                {status.value}
              </option>
            ))}
          </select>
        </div>

        {/* WhatsApp Checkbox */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="waSent"
            checked={form.waSent}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
          />
          <label className="ml-2 block text-sm text-slate-700">WhatsApp message sent</label>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <div className="flex-1">
            {message && (
              <div
                className={`flex items-center gap-2 text-sm ${
                  message.includes("successfully") ? "text-green-600" : "text-red-600"
                }`}
              >
                {message.includes("successfully") ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                {message}
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Create Client
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateClientForm
