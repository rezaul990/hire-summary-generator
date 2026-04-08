import * as XLSX from 'xlsx'
import html2canvas from 'html2canvas'

export async function exportAsImage(containerRef) {
  if (!containerRef.current) return

  const btnContainer = containerRef.current.querySelector('.btn-container')
  const header = containerRef.current.querySelector('.header')
  const dateTime = containerRef.current.querySelector('.date-time')
  const devCredits = document.querySelectorAll('.developer-credit-top, .developer-credit-bottom')
  const originalContainer = containerRef.current
  
  // Hide buttons and timestamp
  if (btnContainer) btnContainer.style.display = 'none'
  if (dateTime) dateTime.style.display = 'none'
  
  // Store original header styles
  let originalHeaderStyles = {}
  if (header) {
    originalHeaderStyles = {
      fontSize: header.style.fontSize,
      padding: header.style.padding,
      marginBottom: header.style.marginBottom,
    }
    // Make header VERY small to maximize table visibility
    header.style.fontSize = '9px'
    header.style.padding = '3px 6px'
    header.style.marginBottom = '2px'
  }

  // Store original styles
  const originalStyles = {
    fontSize: originalContainer.style.fontSize,
    padding: originalContainer.style.padding,
    width: originalContainer.style.width,
    maxWidth: originalContainer.style.maxWidth,
  }

  try {
    // Apply optimized styles for better readability
    originalContainer.style.fontSize = '10px'
    originalContainer.style.padding = '10px'
    originalContainer.style.width = '1400px'
    originalContainer.style.maxWidth = '1400px'
    
    // Make table more compact
    const tables = originalContainer.querySelectorAll('.report-table')
    const headers = originalContainer.querySelectorAll('.report-table th')
    const cells = originalContainer.querySelectorAll('.report-table td')
    const plazaCells = originalContainer.querySelectorAll('.report-table td:first-child')
    
    const originalTableStyles = []
    tables.forEach(table => {
      originalTableStyles.push({
        fontSize: table.style.fontSize,
        marginBottom: table.style.marginBottom,
      })
      table.style.fontSize = '10px'
      table.style.marginBottom = '0'
    })
    
    const originalHeaderStyles = []
    headers.forEach(header => {
      originalHeaderStyles.push({
        fontSize: header.style.fontSize,
        padding: header.style.padding,
        whiteSpace: header.style.whiteSpace,
      })
      header.style.fontSize = '12px'
      header.style.padding = '7px 5px'
      header.style.lineHeight = '1.2'
      header.style.whiteSpace = 'nowrap'
    })
    
    const originalCellStyles = []
    cells.forEach(cell => {
      originalCellStyles.push({
        fontSize: cell.style.fontSize,
        padding: cell.style.padding,
      })
      cell.style.fontSize = '11px'
      cell.style.padding = '6px 5px'
      cell.style.lineHeight = '1.2'
    })
    
    // Make plaza names more compact
    const originalPlazaStyles = []
    plazaCells.forEach(cell => {
      originalPlazaStyles.push({
        fontSize: cell.style.fontSize,
        maxWidth: cell.style.maxWidth,
        overflow: cell.style.overflow,
        textOverflow: cell.style.textOverflow,
        whiteSpace: cell.style.whiteSpace,
      })
      cell.style.fontSize = '10px'
      cell.style.maxWidth = '150px'
      cell.style.overflow = 'hidden'
      cell.style.textOverflow = 'ellipsis'
      cell.style.whiteSpace = 'nowrap'
    })
    
    // Style subtotal rows with darker background and white text
    const subtotalRows = originalContainer.querySelectorAll('.subtotal-row')
    const originalSubtotalStyles = []
    subtotalRows.forEach(row => {
      const cells = row.querySelectorAll('td')
      const cellStyles = []
      cells.forEach(cell => {
        cellStyles.push({
          backgroundColor: cell.style.backgroundColor,
          color: cell.style.color,
          fontWeight: cell.style.fontWeight,
        })
        cell.style.backgroundColor = '#1e40af'
        cell.style.color = '#ffffff'
        cell.style.fontWeight = '800'
      })
      originalSubtotalStyles.push(cellStyles)
    })
    
    // Style developer credits for image
    const originalDevCreditStyles = []
    devCredits.forEach(credit => {
      if (credit) {
        originalDevCreditStyles.push({
          fontSize: credit.style.fontSize,
          padding: credit.style.padding,
          marginTop: credit.style.marginTop,
        })
        credit.style.fontSize = '10px'
        credit.style.padding = '4px 0'
        credit.style.marginTop = '8px'
      }
    })

    const canvas = await html2canvas(originalContainer, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      logging: false,
      width: 1400,
      scrollY: -window.scrollY,
      scrollX: -window.scrollX,
      windowWidth: 1400,
    })

    // Restore original styles
    originalContainer.style.fontSize = originalStyles.fontSize
    originalContainer.style.padding = originalStyles.padding
    originalContainer.style.width = originalStyles.width
    originalContainer.style.maxWidth = originalStyles.maxWidth
    
    if (header) {
      header.style.fontSize = originalHeaderStyles.fontSize
      header.style.padding = originalHeaderStyles.padding
      header.style.marginBottom = originalHeaderStyles.marginBottom
    }
    
    if (dateTime) dateTime.style.display = ''
    
    tables.forEach((table, i) => {
      table.style.fontSize = originalTableStyles[i].fontSize
      table.style.marginBottom = originalTableStyles[i].marginBottom
    })
    
    headers.forEach((header, i) => {
      header.style.fontSize = originalHeaderStyles[i].fontSize
      header.style.padding = originalHeaderStyles[i].padding
      header.style.lineHeight = ''
      header.style.whiteSpace = originalHeaderStyles[i].whiteSpace
    })
    
    cells.forEach((cell, i) => {
      cell.style.fontSize = originalCellStyles[i].fontSize
      cell.style.padding = originalCellStyles[i].padding
      cell.style.lineHeight = ''
    })
    
    plazaCells.forEach((cell, i) => {
      cell.style.fontSize = originalPlazaStyles[i].fontSize
      cell.style.maxWidth = originalPlazaStyles[i].maxWidth
      cell.style.overflow = originalPlazaStyles[i].overflow
      cell.style.textOverflow = originalPlazaStyles[i].textOverflow
      cell.style.whiteSpace = originalPlazaStyles[i].whiteSpace
    })
    
    // Restore subtotal row styles
    subtotalRows.forEach((row, i) => {
      const cells = row.querySelectorAll('td')
      cells.forEach((cell, j) => {
        if (originalSubtotalStyles[i] && originalSubtotalStyles[i][j]) {
          cell.style.backgroundColor = originalSubtotalStyles[i][j].backgroundColor
          cell.style.color = originalSubtotalStyles[i][j].color
          cell.style.fontWeight = originalSubtotalStyles[i][j].fontWeight
        }
      })
    })
    
    // Restore developer credit styles
    devCredits.forEach((credit, i) => {
      if (credit && originalDevCreditStyles[i]) {
        credit.style.fontSize = originalDevCreditStyles[i].fontSize
        credit.style.padding = originalDevCreditStyles[i].padding
        credit.style.marginTop = originalDevCreditStyles[i].marginTop
      }
    })

    const link = document.createElement('a')
    link.download = `Person_ID_Report_${new Date().toISOString().slice(0, 10)}.png`
    link.href = canvas.toDataURL('image/png', 1.0)
    link.click()
  } finally {
    if (btnContainer) btnContainer.style.display = 'flex'
  }
}

export function exportAsExcel(data) {
  const wb = XLSX.utils.book_new()

  // Person ID Top Sheet
  addPersonIdTopSheet(wb, data.allAccountDetails)

  XLSX.writeFile(wb, `Person_ID_Report_${new Date().toISOString().slice(0, 10)}.xlsx`)
}

function addPersonIdTopSheet(wb, accountDetails) {
  if (!accountDetails || accountDetails.length === 0) {
    return
  }

  // Group by Plaza and Assign Person ID
  const personGroups = {}
  accountDetails.forEach(account => {
    const plaza = account.plaza || 'Unknown'
    const personId = account.assignPersonId || 'Unknown'
    const key = `${plaza}|||${personId}`
    
    if (!personGroups[key]) {
      personGroups[key] = {
        plaza,
        personId,
        totalQty: 0,
        collectedQty: 0,
        targetAmount: 0,
        achieveAmount: 0,
      }
    }
    
    personGroups[key].totalQty++
    
    // Clean and parse Collection Target
    let target = 0
    if (account.collectionTarget != null && account.collectionTarget !== '') {
      const cleanedTarget = String(account.collectionTarget).replace(/[,\s]/g, '').trim()
      target = parseFloat(cleanedTarget) || 0
    }
    
    // Clean and parse Collection Achieve
    let achieve = 0
    if (account.collectionAchieve != null && account.collectionAchieve !== '') {
      const cleanedAchieve = String(account.collectionAchieve).replace(/[,\s]/g, '').trim()
      achieve = parseFloat(cleanedAchieve) || 0
    }
    
    personGroups[key].targetAmount += target
    personGroups[key].achieveAmount += achieve
    
    if (achieve > 0) {
      personGroups[key].collectedQty++
    }
  })

  // Convert to array and sort
  const sortedPersons = Object.values(personGroups)
    .map(values => ({
      plaza: values.plaza,
      personId: values.personId,
      totalQty: values.totalQty,
      collectedQty: values.collectedQty,
      notCollectedQty: values.totalQty - values.collectedQty,
      percentage: ((values.collectedQty / values.totalQty) * 100).toFixed(2),
      targetAmount: values.targetAmount,
      achieveAmount: values.achieveAmount,
      amountPercentage: values.targetAmount > 0 
        ? ((values.achieveAmount / values.targetAmount) * 100).toFixed(2)
        : '0.00',
    }))
    .sort((a, b) => {
      if (a.plaza !== b.plaza) {
        return a.plaza.localeCompare(b.plaza)
      }
      return a.personId.localeCompare(b.personId)
    })

  // Group by plaza for subtotals
  const plazaGroups = {}
  sortedPersons.forEach(person => {
    if (!plazaGroups[person.plaza]) {
      plazaGroups[person.plaza] = []
    }
    plazaGroups[person.plaza].push(person)
  })

  const wsData = []

  // Add data with plaza subtotals
  Object.entries(plazaGroups).forEach(([plaza, persons]) => {
    persons.forEach(person => {
      wsData.push({
        'Plaza Name': person.plaza,
        'Assign Person ID': person.personId,
        'AC Qty': person.totalQty,
        'Coll Achieve Qty': person.collectedQty,
        'Not Coll Qty': person.notCollectedQty,
        'Coll %': `${person.percentage}%`,
        'Target Amount': parseFloat(person.targetAmount.toFixed(2)),
        'Achieve Amount': parseFloat(person.achieveAmount.toFixed(2)),
        'Amount %': `${person.amountPercentage}%`,
      })
    })

    // Plaza subtotal
    const plazaSubtotal = persons.reduce(
      (acc, person) => ({
        totalQty: acc.totalQty + person.totalQty,
        collectedQty: acc.collectedQty + person.collectedQty,
        notCollectedQty: acc.notCollectedQty + person.notCollectedQty,
        targetAmount: acc.targetAmount + person.targetAmount,
        achieveAmount: acc.achieveAmount + person.achieveAmount,
      }),
      { totalQty: 0, collectedQty: 0, notCollectedQty: 0, targetAmount: 0, achieveAmount: 0 }
    )

    const plazaPercentage = plazaSubtotal.totalQty > 0
      ? ((plazaSubtotal.collectedQty / plazaSubtotal.totalQty) * 100).toFixed(2)
      : '0.00'

    const plazaAmountPercentage = plazaSubtotal.targetAmount > 0
      ? ((plazaSubtotal.achieveAmount / plazaSubtotal.targetAmount) * 100).toFixed(2)
      : '0.00'

    wsData.push({
      'Plaza Name': `${plaza} Subtotal`,
      'Assign Person ID': '',
      'AC Qty': plazaSubtotal.totalQty,
      'Coll Achieve Qty': plazaSubtotal.collectedQty,
      'Not Coll Qty': plazaSubtotal.notCollectedQty,
      'Coll %': `${plazaPercentage}%`,
      'Target Amount': parseFloat(plazaSubtotal.targetAmount.toFixed(2)),
      'Achieve Amount': parseFloat(plazaSubtotal.achieveAmount.toFixed(2)),
      'Amount %': `${plazaAmountPercentage}%`,
    })
  })

  // Grand Total
  const grandTotals = sortedPersons.reduce(
    (acc, person) => ({
      totalQty: acc.totalQty + person.totalQty,
      collectedQty: acc.collectedQty + person.collectedQty,
      notCollectedQty: acc.notCollectedQty + person.notCollectedQty,
      targetAmount: acc.targetAmount + person.targetAmount,
      achieveAmount: acc.achieveAmount + person.achieveAmount,
    }),
    { totalQty: 0, collectedQty: 0, notCollectedQty: 0, targetAmount: 0, achieveAmount: 0 }
  )

  const grandTotalPercentage = grandTotals.totalQty > 0 
    ? ((grandTotals.collectedQty / grandTotals.totalQty) * 100).toFixed(2) 
    : '0.00'

  const grandTotalAmountPercentage = grandTotals.targetAmount > 0
    ? ((grandTotals.achieveAmount / grandTotals.targetAmount) * 100).toFixed(2)
    : '0.00'

  wsData.push({
    'Plaza Name': 'Grand Total',
    'Assign Person ID': '',
    'AC Qty': grandTotals.totalQty,
    'Coll Achieve Qty': grandTotals.collectedQty,
    'Not Coll Qty': grandTotals.notCollectedQty,
    'Coll %': `${grandTotalPercentage}%`,
    'Target Amount': parseFloat(grandTotals.targetAmount.toFixed(2)),
    'Achieve Amount': parseFloat(grandTotals.achieveAmount.toFixed(2)),
    'Amount %': `${grandTotalAmountPercentage}%`,
  })

  const ws = XLSX.utils.json_to_sheet(wsData)
  XLSX.utils.book_append_sheet(wb, ws, 'Person ID Top Sheet')
}
