import { exportAsExcel, exportAsImage } from '../services/exportService'
import './ActionButtons.css'

function ActionButtons({ data, onReset, containerRef }) {
  const handleExport = () => {
    exportAsExcel(data)
  }

  const handleImageExport = () => {
    exportAsImage(containerRef)
  }

  return (
    <div className="btn-container">
      <button onClick={handleImageExport} className="btn btn-image">
        Share as Image
      </button>
      <button onClick={handleExport} className="btn btn-excel">
        Download Excel
      </button>
      <button onClick={onReset} className="btn btn-reset">
        Upload New File
      </button>
    </div>
  )
}

export default ActionButtons
