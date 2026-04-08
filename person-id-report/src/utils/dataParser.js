export function parseExcelData(rows) {
  const HEADER_ROW_INDEX = 5
  const collectionCol = 20 // Column U (0-based index)

  if (!rows[HEADER_ROW_INDEX] || rows[HEADER_ROW_INDEX].length === 0) {
    throw new Error('Header row (row 6) not found.')
  }

  const headerRow = rows[HEADER_ROW_INDEX]
  const headers = []
  for (let i = 0; i < headerRow.length; i++) {
    const cell = headerRow[i]
    headers.push(cell != null ? String(cell).toLowerCase().trim() : '')
  }

  const plazaCol = headers.findIndex(h => h && h.includes('plaza'))

  if (plazaCol === -1) {
    throw new Error('Plaza column not found.')
  }

  const allAccountDetails = []

  for (let i = HEADER_ROW_INDEX + 1; i < rows.length; i++) {
    const row = rows[i]
    if (!row) continue

    const plaza = row[plazaCol]
    const rawCollection = row[collectionCol]

    let collection = 0
    if (rawCollection != null && rawCollection !== '') {
      const cleaned = String(rawCollection).replace(/[,\s]/g, '').trim()
      collection = parseFloat(cleaned) || 0
    }

    if (!plaza || String(plaza).toLowerCase().trim() === 'plaza') continue

    // Capture ALL account details
    const accountDetail = {
      division: row[2] || '',         // Column C - Division
      area: row[3] || '',              // Column D - Area
      plaza: plaza,                    // Column E - Plaza
      accountNo: row[6] || '',         // Column G - Account No.
      customerName: row[7] || '',      // Column H - Customer Name
      productCategory: row[9] || '',   // Column J - Product Category
      assignPersonId: row[11] || '',   // Column L - Assign Person ID
      invoiceNo: row[13] || '',        // Column N - Invoice No.
      invoiceDate: row[14] || '',      // Column O - Invoice Date
      maturedDate: row[15] || '',      // Column P - Matured Date
      perMonthSchedule: row[16] || '', // Column Q - Per Month Ins. Schedule Amt.
      collectionTarget: row[18] || '', // Column S - Collection Target
      collectionAchieve: collection,   // Column U - Collection Achieve
    }
    allAccountDetails.push(accountDetail)
  }

  return { allAccountDetails }
}
