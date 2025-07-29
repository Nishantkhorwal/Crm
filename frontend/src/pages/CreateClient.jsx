import React from 'react'
import ExcelUpload from '../components/ExcelUpload'
import CreateClientForm from '../components/CreateClientForm'

function CreateClient() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-slate-900">Client Management</h1>
          <p className="mt-2 text-slate-600">Create and manage your client database</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="order-2 lg:order-1">
            <CreateClientForm />
          </div>
          <div className="order-1 lg:order-2">
            <ExcelUpload />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateClient