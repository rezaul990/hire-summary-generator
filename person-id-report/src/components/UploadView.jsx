import { useState } from 'react'
import * as XLSX from 'xlsx'
import { parseExcelData } from '../utils/dataParser'
import './UploadView.css'

function UploadView({ onDataParsed }) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState(null)

  const handleFile = async (file) => {
    if (!file) return

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setError('Please upload an Excel file (.xlsx or .xls)')
      return
    }

    try {
      setError(null)
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

      const parsedData = parseExcelData(rows)
      onDataParsed(parsedData)
    } catch (err) {
      setError(err.message || 'Error parsing Excel file')
      console.error('Error:', err)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleFileInput = (e) => {
    const file = e.target.files[0]
    handleFile(file)
  }

  return (
    <div className="upload-container">
      <div className="upload-header">
        <h1>Assign Person ID Report</h1>
        <p>Upload your Excel file to generate the report</p>
      </div>

      <div
        className={`drop-zone ${isDragging ? 'dragging' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="drop-zone-content">
          <svg
            className="upload-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="drop-text">Drag and drop your Excel file here</p>
          <p className="drop-text-or">or</p>
          <label className="file-input-label">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileInput}
              className="file-input"
            />
            Browse Files
          </label>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <svg
            className="error-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {error}
        </div>
      )}
    </div>
  )
}

export default UploadView
