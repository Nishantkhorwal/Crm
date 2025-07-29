"use client"

import { useState } from "react"
import { UploadCloud, FileSpreadsheet, CheckCircle, AlertCircle, X } from "lucide-react"

const ExcelUpload = () => {
  const [file, setFile] = useState(null)
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
        setFile(droppedFile)
        setMessage("")
      } else {
        setMessage("Please select a valid Excel file (.xlsx)")
      }
    }
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      if (selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
        setFile(selectedFile)
        setMessage("")
      } else {
        setMessage("Please select a valid Excel file (.xlsx)")
        setFile(null)
      }
    }
  }

  const removeFile = () => {
    setFile(null)
    setMessage("")
  }

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file first.")
      return
    }

    setIsLoading(true)
    setMessage("")

    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch(`${API_BASE_URL}/api/client/upload-excel`, {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (res.ok) {
        setMessage(data.message || "Upload successful! Clients have been imported.")
        setFile(null)
      } else {
        setMessage(data.error || "Upload failed. Please try again.")
      }
    } catch (err) {
      console.error(err)
      setMessage("Something went wrong. Please check your connection and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200">
      <div className="px-6 py-4 border-b border-slate-200">
        <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-green-600" />
          Bulk Import
        </h2>
        <p className="text-sm text-slate-600 mt-1">Upload an Excel file to import multiple clients</p>
      </div>

      <div className="p-6">
        {/* Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? "border-blue-400 bg-blue-50"
              : file
                ? "border-green-300 bg-green-50"
                : "border-slate-300 hover:border-slate-400"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".xlsx"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          {!file ? (
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                <UploadCloud className="w-6 h-6 text-slate-600" />
              </div>
              <div>
                <p className="text-lg font-medium text-slate-900">
                  {dragActive ? "Drop your file here" : "Upload Excel File"}
                </p>
                <p className="text-sm text-slate-600 mt-1">Drag and drop your .xlsx file here, or click to browse</p>
              </div>
              <div className="text-xs text-slate-500">Supported format: .xlsx (Excel 2007+)</div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-lg font-medium text-slate-900">File Selected</p>
                <div className="mt-2 p-3 bg-white rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-green-600" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-slate-900">{file.name}</p>
                        <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button onClick={removeFile} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
                      <X className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Upload Button */}
        <div className="mt-6">
          <button
            onClick={handleUpload}
            disabled={!file || isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Uploading...
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                Import Clients
              </>
            )}
          </button>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mt-4 p-3 rounded-lg flex items-center gap-2 text-sm ${
              message.includes("successful") || message.includes("imported")
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message.includes("successful") || message.includes("imported") ? (
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            {message}
          </div>
        )}

        {/* Instructions */}
        {/* Download Sample Button */}
        <div className="mt-4 text-center">
          <a
            href="/Sample1.xlsx"
            download
            className="inline-block px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Download Sample Excel File
          </a>
          <p className="text-xs text-slate-500 mt-1">Use this file as a template for bulk client upload</p>
        </div>

        <div className="mt-6 p-4 bg-slate-50 rounded-lg">
          <h3 className="text-sm font-medium text-slate-900 mb-2">Excel Format Requirements:</h3>
          <ul className="text-xs text-slate-600 space-y-1">
            <li>• Date format: 25 July, 2025</li>
            <li>• WA Sent: Yes or No</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ExcelUpload
