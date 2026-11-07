import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileText,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Download,
  Brain,
  Sparkles,
  Info,
  Loader2,
} from 'lucide-react';
import { contractAPI } from '../services/api';

export default function UploadContractPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState(null);

  const [metadata, setMetadata] = useState({
    title: '',
    contractType: 'Vendor Agreement',
    counterparty: '',
    jurisdiction: 'Delaware, USA',
    value: '',
    tags: 'Vendor, Cloud Services',
  });

  const steps = [
    'Document Ingestion & File Integrity Validation',
    'PyMuPDF & python-docx Deep Text & Heading Extraction',
    'Scanned Document & OCR Requirement Assessment',
    'Autonomous Clause Identification & Categorization',
    'AI Contract Risk Analysis (Groq Llama 3.3)',
    'Hindsight Persistent Precedent Memory Query',
    'Smart Lifecycle Approval Routing & Obligation Mapping',
  ];

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      selectFile(e.dataTransfer.files[0]);
    }
  };

  const selectFile = (selected) => {
    const ext = selected.name.split('.').pop().toLowerCase();
    if (ext !== 'pdf' && ext !== 'docx' && ext !== 'doc') {
      setError('Unsupported file type. Please upload a .pdf or .docx contract document.');
      return;
    }
    setError(null);
    setFile(selected);
    if (!metadata.title) {
      setMetadata(prev => ({
        ...prev,
        title: selected.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
      }));
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select or drag a contract file to upload.');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      // Simulate visible progress stages for visual feedback
      const stepInterval = setInterval(() => {
        setCurrentStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
      }, 700);

      const formData = new FormData();
      formData.append('document', file);
      formData.append('title', metadata.title);
      formData.append('contractType', metadata.contractType);
      formData.append('counterparty', metadata.counterparty);
      formData.append('jurisdiction', metadata.jurisdiction);
      formData.append('value', metadata.value);
      formData.append('tags', metadata.tags);

      const res = await contractAPI.uploadContract(formData);
      clearInterval(stepInterval);

      if (res.data?.success) {
        const contractId = res.data.data?.contract?._id || res.data.data?._id;
        navigate(`/contracts/${contractId}`);
      }
    } catch (err) {
      setUploading(false);
      setError(err.response?.data?.message || err.message || 'Upload and processing failed.');
    }
  };

  const demoContracts = [
    {
      name: 'Sample Contract 1: Vendor Agreement (Unlimited Liability)',
      file: 'Sample_Contract_1_Vendor_Agreement_Unlimited_Liability.pdf',
      type: 'Vendor Agreement',
      highlight: 'Critical Unlimited Liability Clause — Test Step 1 to 8 of required scenario.',
      badge: 'Scenario Step 1',
    },
    {
      name: 'Sample Contract 2: Followup Vendor Agreement',
      file: 'Sample_Contract_2_Vendor_Agreement_Followup.pdf',
      type: 'Vendor Agreement',
      highlight: 'Test Step 9 to 13: Recalls Precedent from Contract 1!',
      badge: 'Scenario Step 9',
    },
    {
      name: 'Sample Contract 3: Mutual NDA (DOCX)',
      file: 'Sample_Contract_3_Mutual_NDA.docx',
      type: 'NDA',
      highlight: 'Verifies DOCX paragraph and heading structure extraction.',
      badge: 'DOCX Engine',
    },
    {
      name: 'Sample Contract 4: Scanned Document Example',
      file: 'Sample_Contract_4_Scanned_Document_Example.pdf',
      type: 'Other',
      highlight: 'Verifies detection of scanned PDF and OCR requirement alert.',
      badge: 'OCR Detection',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
          <span>Intelligent Contract Intake & Extraction</span>
          <span className="px-2 py-0.5 text-[10px] font-semibold bg-brand-100 text-brand-700 rounded-md">Agent 1 & 2</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Upload commercial agreements in PDF or DOCX. The Multi-Agent Engine extracts structured terms, flags risks, and searches Hindsight persistent precedent memory.
        </p>
      </div>

      {/* Evaluator Demo Contracts Box */}
      <div className="bg-gradient-to-r from-brand-900 to-navy-900 text-white rounded-xl p-5 shadow-card">
        <div className="flex items-center space-x-2 mb-2">
          <Brain className="w-5 h-5 text-accent-400" />
          <h2 className="text-sm font-bold tracking-wide">
            Pre-Generated Demonstration Test Contracts
          </h2>
        </div>
        <p className="text-xs text-slate-300 mb-4 max-w-3xl">
          Use these ready-to-test documents to reproduce the exact required end-to-end demo scenario (Vendor Contract 1 → Human Approval → Precedent Memory → Vendor Contract 2 Recall).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {demoContracts.map((demo, idx) => (
            <div key={idx} className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/15 flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold text-white">{demo.name}</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 bg-accent-500/20 text-accent-300 rounded border border-accent-500/30">
                    {demo.badge}
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 mt-1">{demo.highlight}</div>
              </div>
              <a
                href={`/uploads/${demo.file}`}
                download={demo.file}
                className="p-1.5 bg-white/20 hover:bg-white/30 text-white rounded-md transition-colors ml-2 flex-shrink-0"
                title="Download this sample contract for testing"
              >
                <Download className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Main Upload Form */}
      <form onSubmit={handleUploadSubmit} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Drag and Drop Box */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleFileDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            dragOver
              ? 'border-brand-500 bg-brand-50/50'
              : file
              ? 'border-emerald-400 bg-emerald-50/30'
              : 'border-slate-300 hover:border-brand-400 hover:bg-slate-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc"
            onChange={(e) => e.target.files?.[0] && selectFile(e.target.files[0])}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center space-y-2">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${file ? 'bg-emerald-100 text-emerald-600' : 'bg-brand-50 text-brand-600'}`}>
              {file ? <CheckCircle className="w-6 h-6" /> : <UploadCloud className="w-6 h-6" />}
            </div>

            {file ? (
              <div>
                <p className="text-sm font-semibold text-slate-800">{file.name}</p>
                <p className="text-xs text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB • Ready for AI extraction</p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  Click to select or drag and drop contract document
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Accepts PDF (text & scanned) and DOCX (up to 25 MB)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Form Metadata Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Contract Title (Optional Auto-Detect)</label>
            <input
              type="text"
              placeholder="e.g. Master Services Agreement"
              value={metadata.title}
              onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Contract Type</label>
            <select
              value={metadata.contractType}
              onChange={(e) => setMetadata({ ...metadata, contractType: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-slate-700"
            >
              <option value="Vendor Agreement">Vendor Agreement</option>
              <option value="NDA">NDA</option>
              <option value="Software Licensing Agreement">Software Licensing Agreement</option>
              <option value="Service Agreement">Service Agreement</option>
              <option value="Employment Agreement">Employment Agreement</option>
              <option value="Consulting Agreement">Consulting Agreement</option>
              <option value="Lease Agreement">Lease Agreement</option>
              <option value="Partnership Agreement">Partnership Agreement</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Counterparty Entity Name</label>
            <input
              type="text"
              placeholder="e.g. CloudFlow Systems Inc."
              value={metadata.counterparty}
              onChange={(e) => setMetadata({ ...metadata, counterparty: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Jurisdiction / Governing Law</label>
            <input
              type="text"
              placeholder="e.g. Delaware, USA"
              value={metadata.jurisdiction}
              onChange={(e) => setMetadata({ ...metadata, jurisdiction: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Contract Value (USD)</label>
            <input
              type="number"
              placeholder="e.g. 150000"
              value={metadata.value}
              onChange={(e) => setMetadata({ ...metadata, value: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tags / Labels</label>
            <input
              type="text"
              placeholder="e.g. Critical, Infrastructure, Q1-2026"
              value={metadata.tags}
              onChange={(e) => setMetadata({ ...metadata, tags: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Live Processing Indicator */}
        {uploading && (
          <div className="p-4 bg-brand-50/70 border border-brand-200 rounded-xl space-y-3">
            <div className="flex items-center space-x-2 text-brand-800 text-xs font-semibold">
              <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
              <span>Multi-Agent Legal Processing Pipeline in Progress...</span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-600">
              {steps.map((st, i) => (
                <div key={i} className="flex items-center space-x-2 text-[11px]">
                  {i < currentStep ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  ) : i === currentStep ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-600 flex-shrink-0" />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 flex-shrink-0"></span>
                  )}
                  <span className={i === currentStep ? 'font-semibold text-brand-900' : i < currentStep ? 'text-slate-700' : 'text-slate-400'}>
                    {st}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            type="submit"
            disabled={!file || uploading}
            className="flex items-center space-x-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Running Multi-Agent Intelligence...</span>
              </>
            ) : (
              <>
                <span>Analyze Contract with Precedent Engine</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
