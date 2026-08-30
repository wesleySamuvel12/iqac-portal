import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Upload, FileText, Info, Download, Loader2, XCircle, 
  CheckCircle, Lock, AlertTriangle, ShieldCheck, UserPlus, FileSpreadsheet, Table, Check, AlertCircle, RefreshCw
} from 'lucide-react'

interface CSVImportModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  departmentId: string
  departmentName: string
  importType: 'STUDENT' | 'FACULTY'
  sampleCSVColumns: string
  onImportSuccess?: () => void
}

export function CSVImportModal({
  isOpen,
  onClose,
  title,
  subtitle,
  departmentId,
  departmentName,
  importType,
  sampleCSVColumns,
  onImportSuccess,
}: CSVImportModalProps) {
  const [step, setStep] = useState<'upload' | 'validation' | 'results'>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [validating, setValidating] = useState(false)
  const [importing, setImporting] = useState(false)

  // Validation state with preview grid rows
  const [validationData, setValidationData] = useState<{
    totalRecords: number
    validCount: number
    invalidCount: number
    invalidRecords: any[]
    duplicateCount: number
    validRecords: any[]
  } | null>(null)

  // Login Access choice - DEFAULT IS TRUE (YES)
  const [createLoginAccess, setCreateLoginAccess] = useState<boolean>(true)

  // Final Results state
  const [resultsData, setResultsData] = useState<{
    recordsImported: number
    recordsFailed: number
    loginAccess: 'YES' | 'NO'
    loginAccountsCreated: number
    failedLoginAccounts: number
    invalidRecords: any[]
    importErrors: string[]
  } | null>(null)

  if (!isOpen) return null

  const handleReset = () => {
    setStep('upload')
    setFile(null)
    setValidationData(null)
    setCreateLoginAccess(true)
    setResultsData(null)
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  // Step 1: Pre-Validate CSV & Load Excel Data Grid Preview
  const handleValidate = async () => {
    if (!file) return
    setValidating(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('departmentId', departmentId)
      formData.append('action', 'validate')

      const endpoint = importType === 'STUDENT' ? '/api/students/bulk-import' : '/api/faculty/bulk-import'
      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (data.success) {
        setValidationData({
          totalRecords: data.totalRecords || 0,
          validCount: data.validCount || 0,
          invalidCount: data.invalidCount || 0,
          invalidRecords: data.invalidRecords || [],
          duplicateCount: data.duplicateCount || 0,
          validRecords: data.validRecords || [],
        })
        setStep('validation')
      } else {
        alert(data.error || 'Failed to validate file')
      }
    } catch (err: any) {
      alert('Error validating file: ' + err.message)
    } finally {
      setValidating(false)
    }
  }

  // Step 2: Final Import Execution
  const handleExecuteImport = async () => {
    if (!file) return
    setImporting(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('departmentId', departmentId)
      formData.append('action', 'import')
      formData.append('createLoginAccess', createLoginAccess ? 'true' : 'false')

      const endpoint = importType === 'STUDENT' ? '/api/students/bulk-import' : '/api/faculty/bulk-import'
      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (data.success) {
        setResultsData({
          recordsImported: data.recordsImported || 0,
          recordsFailed: data.recordsFailed || 0,
          loginAccess: data.loginAccess || (createLoginAccess ? 'YES' : 'NO'),
          loginAccountsCreated: data.loginAccountsCreated || 0,
          failedLoginAccounts: data.failedLoginAccounts || 0,
          invalidRecords: data.invalidRecords || [],
          importErrors: data.importErrors || [],
        })
        setStep('results')
        if (onImportSuccess) onImportSuccess()
      } else {
        alert(data.error || 'Failed to import CSV records')
      }
    } catch (err: any) {
      alert('Error importing file: ' + err.message)
    } finally {
      setImporting(false)
    }
  }

  // Sample CSV Download
  const downloadSampleCSV = () => {
    let content = ''
    if (importType === 'STUDENT') {
      content = `registerNumber,name,email,phone,semester,section,cgpa\n2024CSE001,John Doe,john.doe@niet.ac.in,9876543210,1,A,8.5\n2024CSE002,Mary Smith,mary.smith@niet.ac.in,9876543211,1,A,9.0`
    } else {
      content = `employeeId,name,email,phone,designation,qualification,specialization\nSTFCSE01,Dr. Robert Paul,robert.paul@niet.ac.in,9876543220,Associate Professor,Ph.D.,Artificial Intelligence\nSTFCSE02,Prof. Sarah Jenkins,sarah.jenkins@niet.ac.in,9876543221,Assistant Professor,M.Tech.,Data Science`
    }

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sample_${importType.toLowerCase()}_import.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Download Import Report
  const downloadReport = () => {
    if (!resultsData) return
    let content = `IMPORT REPORT - ${title}\nDate: ${new Date().toLocaleString()}\nDepartment: ${departmentName}\n\nSummary:\nRecords Imported: ${resultsData.recordsImported}\nRecords Failed: ${resultsData.recordsFailed}\nLogin Access: ${resultsData.loginAccess}\nLogin Accounts Created: ${resultsData.loginAccountsCreated}\nFailed Login Accounts: ${resultsData.failedLoginAccounts}\n`
    
    if (resultsData.invalidRecords && resultsData.invalidRecords.length > 0) {
      content += `\nInvalid Rows:\n`
      resultsData.invalidRecords.forEach((err: any) => {
        content += `Row ${err.row || 'N/A'}: ${err.error || 'Invalid format'}\n`
      })
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `import_report_${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-100 animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2.5">
              <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
              {title}
            </h3>
            <p className="text-xs text-blue-200 mt-1">{subtitle || `${departmentName} Department`}</p>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <XCircle className="w-6 h-6 text-gray-300 hover:text-white" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[85vh] overflow-y-auto">
          
          {/* STEP 1: UPLOAD FILE */}
          {step === 'upload' && (
            <div className="space-y-6">
              <div
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                  dragOver ? 'border-indigo-500 bg-indigo-50/70 shadow-sm' : 'border-gray-300 hover:border-indigo-400 bg-gray-50/40'
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setDragOver(false)
                  if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0])
                }}
              >
                <Upload className={`w-12 h-12 mx-auto mb-3 transition-colors ${dragOver ? 'text-indigo-600' : 'text-indigo-500'}`} />
                <p className="text-base font-bold text-gray-800 mb-1">
                  {dragOver ? 'Drop your CSV/Excel file here' : 'Drag & drop your CSV or Excel file here'}
                </p>
                <p className="text-xs text-gray-500 mb-4">Select a valid .csv spreadsheet file</p>
                
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
                  className="hidden"
                  id="csv-file-input"
                />
                <label htmlFor="csv-file-input" className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-xs cursor-pointer hover:bg-indigo-700 transition-all shadow-md">
                  <FileSpreadsheet className="w-4 h-4" />
                  Browse CSV / Excel File
                </label>

                {file && (
                  <div className="mt-4 p-3 bg-indigo-50/90 border border-indigo-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-indigo-600" />
                      <span className="text-xs font-bold text-indigo-900">{file.name}</span>
                      <span className="text-[11px] text-indigo-600 font-mono">({(file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <button onClick={() => setFile(null)} className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg">
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* CSV Requirements */}
              <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-blue-900 mb-1">CSV Column Header Requirements</p>
                    <code className="block text-xs bg-white px-3 py-2 rounded-lg border border-blue-200/80 text-blue-800 font-mono">
                      {sampleCSVColumns}
                    </code>
                    <button onClick={downloadSampleCSV} className="mt-3 inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-bold hover:underline">
                      <Download className="w-3.5 h-3.5" />
                      Download Sample CSV Template
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <Button variant="outline" onClick={handleClose} className="px-5 py-2.5 rounded-xl font-semibold text-gray-700 text-xs">
                  Cancel
                </Button>
                <Button 
                  onClick={handleValidate}
                  disabled={!file || validating}
                  className="px-6 py-2.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md text-xs flex items-center gap-2"
                >
                  {validating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Parsing & Previewing...
                    </>
                  ) : (
                    <>
                      <Table className="w-4 h-4" />
                      Preview & Validate Data Grid
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: EXCEL DATA GRID PREVIEW & LOGIN ACCESS SELECTION */}
          {step === 'validation' && validationData && (
            <div className="space-y-6">
              
              {/* Validation Summary Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 text-white p-4 rounded-2xl shadow-md">
                <div className="flex items-center gap-2">
                  <Table className="w-5 h-5 text-cyan-400" />
                  <span className="font-extrabold text-sm uppercase tracking-wider text-white">EXCEL DATA GRID PREVIEW</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="bg-white/10 px-3 py-1 rounded-lg font-mono font-bold">Total: {validationData.totalRecords}</span>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-lg font-mono font-bold">Valid: {validationData.validCount}</span>
                  {validationData.invalidCount > 0 && (
                    <span className="bg-red-500/20 text-red-300 border border-red-500/40 px-3 py-1 rounded-lg font-mono font-bold">Invalid: {validationData.invalidCount}</span>
                  )}
                </div>
              </div>

              {/* EXCEL SPREADSHEET PREVIEW GRID */}
              <div className="border border-slate-300 rounded-2xl overflow-hidden bg-white shadow-inner">
                <div className="bg-slate-100 border-b border-slate-300 px-4 py-2 flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    Spreadsheet Data Rows ({validationData.validRecords.length + validationData.invalidRecords.length} rows loaded)
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">Live Validation Grid</span>
                </div>

                <div className="max-h-60 overflow-auto">
                  <table className="w-full text-left border-collapse font-mono text-xs">
                    <thead>
                      <tr className="bg-slate-800 text-slate-200 text-[11px] font-extrabold uppercase sticky top-0 border-b border-slate-700">
                        <th className="py-2.5 px-3 border-r border-slate-700 w-12 text-center">Row</th>
                        <th className="py-2.5 px-3 border-r border-slate-700">ID / Reg No</th>
                        <th className="py-2.5 px-3 border-r border-slate-700">Name</th>
                        <th className="py-2.5 px-3 border-r border-slate-700">Email</th>
                        <th className="py-2.5 px-3 border-r border-slate-700 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {/* Render Valid Rows */}
                      {validationData.validRecords.map((row: any) => (
                        <tr key={`valid-${row.row}`} className="hover:bg-indigo-50/50 bg-white">
                          <td className="py-2 px-3 border-r border-slate-200 text-slate-500 text-center font-bold">{row.row}</td>
                          <td className="py-2 px-3 border-r border-slate-200 font-bold text-indigo-700">{row.regNo || row.employeeId}</td>
                          <td className="py-2 px-3 border-r border-slate-200 font-semibold text-slate-800">{row.name}</td>
                          <td className="py-2 px-3 border-r border-slate-200 text-slate-600">{row.email}</td>
                          <td className="py-2 px-3 border-r border-slate-200 text-center">
                            {row.isDuplicate ? (
                              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 border border-blue-300 text-[10px] px-2 py-0.5 rounded-full font-bold" title="Already exists in database — will update profile & department on import">
                                <RefreshCw className="w-3 h-3 text-blue-600" /> Existing (Will Update)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                <Check className="w-3 h-3 text-emerald-600" /> New Record
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}

                      {/* Render Invalid Rows */}
                      {validationData.invalidRecords.map((err: any, idx: number) => (
                        <tr key={`invalid-${idx}`} className="bg-red-50/70 hover:bg-red-100/70">
                          <td className="py-2 px-3 border-r border-slate-200 text-red-600 text-center font-bold">{err.row || idx + 1}</td>
                          <td className="py-2 px-3 border-r border-slate-200 font-bold text-red-700">{err.regNo || err.employeeId || 'N/A'}</td>
                          <td className="py-2 px-3 border-r border-slate-200 font-semibold text-red-800">{err.name || 'Invalid Row'}</td>
                          <td className="py-2 px-3 border-r border-slate-200 text-red-600">{err.email || '-'}</td>
                          <td className="py-2 px-3 border-r border-slate-200 text-center">
                            <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 border border-red-300 text-[10px] px-2 py-0.5 rounded-full font-bold" title={err.error}>
                              <AlertTriangle className="w-3 h-3 text-red-600" /> {err.error}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* LOGIN ACCESS SELECTION STEP (REQUIREMENT #2 & #15) */}
              <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-blue-950 p-5 rounded-2xl text-white shadow-xl border border-indigo-700/50">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-5 h-5 text-cyan-400" />
                  <h4 className="font-bold text-sm text-white">LOGIN ACCESS CONFIRMATION</h4>
                </div>
                <p className="text-xs text-blue-200 mb-4">
                  Do you want to provide central login access to all {validationData.validCount} successfully imported users?
                </p>

                <div className="space-y-3 bg-white/10 p-4 rounded-xl border border-white/10">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="loginAccessChoice"
                      checked={createLoginAccess === true}
                      onChange={() => setCreateLoginAccess(true)}
                      className="mt-1 w-4 h-4 text-indigo-500 accent-indigo-500 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-sm text-cyan-300 block">Yes, create login access (Recommended)</span>
                      <span className="text-[11px] text-indigo-200 block">
                        Creates user accounts in central database with login passwords. Users can immediately log in and will appear in user management.
                      </span>
                    </div>
                  </label>

                  <div className="border-t border-white/10 my-2" />

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="loginAccessChoice"
                      checked={createLoginAccess === false}
                      onChange={() => setCreateLoginAccess(false)}
                      className="mt-1 w-4 h-4 text-indigo-500 accent-indigo-500 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-sm text-white block">No, import records without login access</span>
                      <span className="text-[11px] text-gray-300 block">
                        Imports student/staff database profiles only. No login accounts are created now. Login access can be allocated later.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <Button variant="ghost" onClick={() => setStep('upload')} className="text-xs font-bold text-gray-500">
                  ← Back to File Upload
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleClose} className="px-4 py-2 rounded-xl text-xs font-semibold">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleExecuteImport}
                    disabled={importing || validationData.validCount === 0}
                    className="px-6 py-2.5 rounded-xl font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md text-xs flex items-center gap-2"
                  >
                    {importing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Importing Records...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Continue Import ({validationData.validCount} Records Ready)
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: IMPORT COMPLETED RESULTS */}
          {step === 'results' && resultsData && (
            <div className="space-y-6">
              
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-black text-emerald-900">IMPORT COMPLETED</h4>
                <p className="text-xs text-emerald-700 mt-1 font-medium">CSV processing completed successfully</p>
              </div>

              {/* Results Details Grid */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
                <div className="flex justify-between items-center text-xs py-1 border-b border-slate-200">
                  <span className="font-semibold text-slate-600">Records Imported:</span>
                  <span className="font-bold text-slate-900 font-mono text-sm">{resultsData.recordsImported}</span>
                </div>
                <div className="flex justify-between items-center text-xs py-1 border-b border-slate-200">
                  <span className="font-semibold text-slate-600">Records Failed:</span>
                  <span className="font-bold text-red-600 font-mono text-sm">{resultsData.recordsFailed}</span>
                </div>
                <div className="flex justify-between items-center text-xs py-1 border-b border-slate-200">
                  <span className="font-semibold text-slate-600">Login Access:</span>
                  <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${resultsData.loginAccess === 'YES' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-200 text-gray-700'}`}>
                    {resultsData.loginAccess}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs py-1 border-b border-slate-200">
                  <span className="font-semibold text-slate-600">Login Accounts Created:</span>
                  <span className="font-bold text-emerald-600 font-mono text-sm">{resultsData.loginAccountsCreated}</span>
                </div>
                <div className="flex justify-between items-center text-xs py-1">
                  <span className="font-semibold text-slate-600">Failed Login Accounts:</span>
                  <span className="font-bold text-slate-800 font-mono text-sm">{resultsData.failedLoginAccounts}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <Button onClick={downloadReport} variant="outline" className="px-4 py-2 rounded-xl text-xs font-bold gap-1.5">
                  <Download className="w-3.5 h-3.5" />
                  Download Import Report
                </Button>

                <div className="flex gap-2">
                  <Button onClick={handleClose} className="px-6 py-2.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white text-xs">
                    Done
                  </Button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
