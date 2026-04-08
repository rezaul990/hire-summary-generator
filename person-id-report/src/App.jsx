import { useState } from 'react'
import './App.css'
import UploadView from './components/UploadView'
import ReportView from './components/ReportView'
import { parseExcelData } from './utils/dataParser'

function App() {
  const [data, setData] = useState(null)

  const handleDataParsed = (parsedData) => {
    setData(parsedData)
  }

  const handleReset = () => {
    setData(null)
  }

  return (
    <div className="app">
      <div className="developer-credit-top">
        <span>Developed by: Md. Rezaul Karim RCM</span>
      </div>

      {!data ? (
        <UploadView onDataParsed={handleDataParsed} />
      ) : (
        <ReportView data={data} onReset={handleReset} />
      )}

      <div className="developer-credit-bottom">
        <span>© Developed by: Md. Rezaul Karim RCM</span>
      </div>
    </div>
  )
}

export default App
