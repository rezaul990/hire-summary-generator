import { useRef } from 'react'
import PersonIdTopSheetTable from './PersonIdTopSheetTable'
import ActionButtons from './ActionButtons'
import './ReportView.css'

function ReportView({ data, onReset }) {
  const containerRef = useRef(null)

  return (
    <div className="container">
      <div ref={containerRef}>
        <div className="header">
          <h1>Assign Person ID Report</h1>
        </div>
        <div className="date-time">
          Generated on: {new Date().toLocaleString()}
        </div>
        <ActionButtons 
          data={data} 
          onReset={onReset} 
          containerRef={containerRef}
        />
        <PersonIdTopSheetTable data={{ accountDetails: data.allAccountDetails }} />
      </div>
    </div>
  )
}

export default ReportView
