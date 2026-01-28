import React, { useState } from 'react';
import Header from '../shared/Header';
import StatusBadge from '../shared/StatusBadge';
import RiskChart from '../shared/RiskChart';
import MetricCard from '../shared/MetricCard';
import DecisionForm from './DecisionForm';
import { 
  ArrowLeft, User, DollarSign, Calendar, Briefcase, Home, 
  Shield, AlertTriangle, CheckCircle, XCircle, ChevronDown, 
  ChevronUp, TrendingUp, FileText, Search
} from 'lucide-react';
import { mockCases, getAIAnalysis } from '../../data/mockData';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

type User = {
  role: 'client' | 'banker';
  email: string;
  name: string;
};

type CaseDetailProps = {
  user: User;
  caseId: string;
  onLogout: () => void;
  onNavigate: (route: any, caseId?: string) => void;
};

export default function CaseDetail({ user, caseId, onLogout, onNavigate }: CaseDetailProps) {
  const [showDecisionForm, setShowDecisionForm] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    risk: true,
    fraud: true,
    similarity: true,
    behavior: true,
    documents: true,
    explanation: true
  });

  const case_ = mockCases.find(c => c.case_id === caseId);
  const aiAnalysis = getAIAnalysis(caseId);

  if (!case_) {
    return <div>Case not found</div>;
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const debtToIncome = (case_.monthly_charges / case_.monthly_income) * 100;

  // Prepare radar chart data
  const radarData = [
    { subject: 'Income', value: Math.min((case_.monthly_income / 10000) * 100, 100) },
    { subject: 'Credit', value: (case_.credit_score / 850) * 100 },
    { subject: 'Employment', value: Math.min((case_.seniority_years / 10) * 100, 100) },
    { subject: 'Debt Ratio', value: Math.max(100 - debtToIncome, 0) },
    { subject: 'Stability', value: case_.housing_status === 'owned' ? 90 : case_.housing_status === 'rented' ? 60 : 40 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => onNavigate('banker-dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>

        {/* Case Header */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl text-gray-900">{case_.case_id}</h1>
                <StatusBadge status={case_.status} />
                {case_.fraud_flag && (
                  <div className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Fraud Alert</span>
                  </div>
                )}
              </div>
              <p className="text-gray-600">
                Submitted on {new Date(case_.submitted_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            
            {(case_.status === 'pending' || case_.status === 'under_review') && !showDecisionForm && (
              <button
                onClick={() => setShowDecisionForm(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <FileText className="w-5 h-5" />
                <span>Make Decision</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Applicant Profile */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Applicant Profile
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Full Name</label>
                  <p className="text-gray-900">{case_.client_name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Email</label>
                  <p className="text-gray-900">{case_.client_email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Marital Status</label>
                  <p className="text-gray-900 capitalize">{case_.marital_status}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Number of Children</label>
                  <p className="text-gray-900">{case_.number_of_children}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Housing Status</label>
                  <p className="text-gray-900 capitalize">{case_.housing_status.replace('_', ' ')}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Credit Score</label>
                  <p className="text-gray-900">{case_.credit_score}</p>
                </div>
              </div>
            </div>

            {/* Financial Metrics */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                Financial Overview
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Loan Amount</p>
                  <p className="text-2xl text-gray-900">${case_.loan_amount.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Duration</p>
                  <p className="text-2xl text-gray-900">{case_.loan_duration} mo</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Monthly Income</p>
                  <p className="text-2xl text-gray-900">${case_.monthly_income.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Monthly Charges</p>
                  <p className="text-2xl text-gray-900">${case_.monthly_charges.toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-gray-600">Other Income</label>
                  <p className="text-gray-900">${case_.other_income}</p>
                </div>
                <div>
                  <label className="text-gray-600">Debt-to-Income Ratio</label>
                  <p className={`${debtToIncome > 40 ? 'text-red-600' : debtToIncome > 30 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {debtToIncome.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <label className="text-gray-600">Employment Type</label>
                  <p className="text-gray-900 capitalize">{case_.employment_type.replace('_', ' ')}</p>
                </div>
                <div>
                  <label className="text-gray-600">Contract Type</label>
                  <p className="text-gray-900 capitalize">{case_.contract_type}</p>
                </div>
                <div>
                  <label className="text-gray-600">Seniority</label>
                  <p className="text-gray-900">{case_.seniority_years} years</p>
                </div>
              </div>

              {/* Profile Radar Chart */}
              <div className="mt-6">
                <h3 className="text-sm text-gray-700 mb-3">Financial Profile Strength</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#E5E7EB" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#6B7280', fontSize: 12 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                    <Radar name="Score" dataKey="value" stroke="#2563EB" fill="#2563EB" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Agent Outputs */}
            {/* Risk Agent */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <button
                onClick={() => toggleSection('risk')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <h2 className="text-xl text-gray-900">Risk Analysis Agent</h2>
                </div>
                {expandedSections.risk ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </button>
              {expandedSections.risk && (
                <div className="px-6 pb-6">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <MetricCard
                      title="Risk Score"
                      value={`${(aiAnalysis.risk_agent.risk_score * 100).toFixed(1)}%`}
                      icon={TrendingUp}
                      color={aiAnalysis.risk_agent.risk_score < 0.3 ? 'green' : aiAnalysis.risk_agent.risk_score < 0.6 ? 'yellow' : 'red'}
                    />
                    <MetricCard
                      title="Risk Level"
                      value={aiAnalysis.risk_agent.risk_level.toUpperCase()}
                      icon={Shield}
                      color={aiAnalysis.risk_agent.risk_level === 'low' ? 'green' : aiAnalysis.risk_agent.risk_level === 'medium' ? 'yellow' : 'red'}
                    />
                    <MetricCard
                      title="Confidence"
                      value={`${(aiAnalysis.risk_agent.confidence * 100).toFixed(0)}%`}
                      icon={CheckCircle}
                      color="blue"
                    />
                  </div>
                  <RiskChart 
                    riskScore={aiAnalysis.risk_agent.risk_score}
                    breakdown={aiAnalysis.risk_agent.breakdown}
                  />
                </div>
              )}
            </div>

            {/* Fraud Agent */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <button
                onClick={() => toggleSection('fraud')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <h2 className="text-xl text-gray-900">Fraud Detection Agent</h2>
                </div>
                {expandedSections.fraud ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </button>
              {expandedSections.fraud && (
                <div className="px-6 pb-6">
                  <div className="mb-6 p-4 rounded-lg border-2" style={{
                    backgroundColor: aiAnalysis.fraud_agent.fraud_flag ? '#FEF2F2' : '#F0FDF4',
                    borderColor: aiAnalysis.fraud_agent.fraud_flag ? '#FCA5A5' : '#86EFAC'
                  }}>
                    <div className="flex items-center gap-3">
                      {aiAnalysis.fraud_agent.fraud_flag ? (
                        <XCircle className="w-6 h-6 text-red-600" />
                      ) : (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      )}
                      <div>
                        <p className={aiAnalysis.fraud_agent.fraud_flag ? 'text-red-900' : 'text-green-900'}>
                          {aiAnalysis.fraud_agent.fraud_flag ? 'Fraud Indicators Detected' : 'No Fraud Detected'}
                        </p>
                        <p className={`text-sm ${aiAnalysis.fraud_agent.fraud_flag ? 'text-red-700' : 'text-green-700'}`}>
                          Fraud Score: {(aiAnalysis.fraud_agent.fraud_score * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-sm text-gray-700 mb-3">Verification Checks</h3>
                  <div className="space-y-3">
                    {aiAnalysis.fraud_agent.indicators.map((indicator: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {indicator.status === 'pass' ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : indicator.status === 'fail' ? (
                            <XCircle className="w-5 h-5 text-red-600" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-yellow-600" />
                          )}
                          <span className="text-gray-900">{indicator.indicator}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            indicator.status === 'pass' ? 'bg-green-100 text-green-800' :
                            indicator.status === 'fail' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {indicator.status.toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-600">
                            {(indicator.confidence * 100).toFixed(0)}% confidence
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Similarity Agent */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <button
                onClick={() => toggleSection('similarity')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Search className="w-5 h-5 text-purple-600" />
                  <h2 className="text-xl text-gray-900">Similar Cases Agent</h2>
                </div>
                {expandedSections.similarity ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </button>
              {expandedSections.similarity && (
                <div className="px-6 pb-6">
                  <p className="text-sm text-gray-600 mb-4">
                    Similarity Score: {(aiAnalysis.similarity_agent.similarity_score * 100).toFixed(0)}%
                  </p>
                  
                  <div className="space-y-3">
                    {aiAnalysis.similarity_agent.top_cases.map((similarCase: any, idx: number) => (
                      <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <span className="text-blue-600">{similarCase.case_id}</span>
                            <div className="text-sm text-gray-600 mt-1">
                              ${similarCase.loan_amount.toLocaleString()} • {similarCase.loan_duration} months
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600">Similarity</div>
                            <div className="text-purple-600">{(similarCase.similarity_score * 100).toFixed(0)}%</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className={`px-2 py-1 rounded ${
                            similarCase.outcome === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {similarCase.outcome.toUpperCase()}
                          </span>
                          <span className={`px-2 py-1 rounded ${
                            similarCase.defaulted ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {similarCase.defaulted ? 'DEFAULTED' : 'REPAID'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mt-2">{similarCase.final_outcome}</p>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => onNavigate('similar-cases', caseId)}
                    className="mt-4 w-full px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 text-sm"
                  >
                    Explore All Similar Cases
                  </button>
                </div>
              )}
            </div>

            {/* Document Agent */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <button
                onClick={() => toggleSection('documents')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-xl text-gray-900">Document Verification Agent</h2>
                </div>
                {expandedSections.documents ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </button>
              {expandedSections.documents && (
                <div className="px-6 pb-6">
                  <div className={`mb-4 p-3 rounded-lg ${
                    aiAnalysis.document_agent.status === 'verified' ? 'bg-green-50 text-green-800' :
                    aiAnalysis.document_agent.status === 'issues_found' ? 'bg-red-50 text-red-800' :
                    'bg-yellow-50 text-yellow-800'
                  }`}>
                    Status: {aiAnalysis.document_agent.status.replace('_', ' ').toUpperCase()}
                  </div>

                  <div className="space-y-3">
                    {aiAnalysis.document_agent.documents.map((doc: any, idx: number) => (
                      <div key={idx} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-900 capitalize">{doc.type.replace('_', ' ')}</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            doc.status === 'verified' ? 'bg-green-100 text-green-800' :
                            doc.status === 'suspicious' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {doc.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          Confidence: {(doc.confidence * 100).toFixed(0)}%
                        </div>
                        {doc.issues.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm text-red-700">Issues:</p>
                            <ul className="list-disc list-inside text-sm text-red-600">
                              {doc.issues.map((issue: string, i: number) => (
                                <li key={i}>{issue}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Explanation Agent */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <button
                onClick={() => toggleSection('explanation')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-teal-600" />
                  <h2 className="text-xl text-gray-900">AI Recommendation & Explanation</h2>
                </div>
                {expandedSections.explanation ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </button>
              {expandedSections.explanation && (
                <div className="px-6 pb-6">
                  {/* Recommendation */}
                  <div className={`mb-6 p-4 rounded-lg border-2 ${
                    aiAnalysis.explanation_agent.recommendation === 'approve' 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-lg ${
                        aiAnalysis.explanation_agent.recommendation === 'approve' 
                          ? 'text-green-900' 
                          : 'text-red-900'
                      }`}>
                        AI Recommends: {aiAnalysis.explanation_agent.recommendation.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-700">
                        Confidence: {(aiAnalysis.explanation_agent.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  {/* Strengths */}
                  <div className="mb-6">
                    <h3 className="text-sm text-gray-700 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Strengths
                    </h3>
                    <ul className="space-y-2">
                      {aiAnalysis.explanation_agent.strengths.map((strength: string, idx: number) => (
                        <li key={idx} className="flex gap-2 text-sm text-gray-700">
                          <span className="text-green-600">✓</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div className="mb-6">
                    <h3 className="text-sm text-gray-700 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      Weaknesses
                    </h3>
                    <ul className="space-y-2">
                      {aiAnalysis.explanation_agent.weaknesses.map((weakness: string, idx: number) => (
                        <li key={idx} className="flex gap-2 text-sm text-gray-700">
                          <span className="text-yellow-600">⚠</span>
                          <span>{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Red Flags */}
                  <div className="mb-6">
                    <h3 className="text-sm text-gray-700 mb-3 flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-600" />
                      Red Flags
                    </h3>
                    <ul className="space-y-2">
                      {aiAnalysis.explanation_agent.red_flags.map((flag: string, idx: number) => (
                        <li key={idx} className="flex gap-2 text-sm text-gray-700">
                          <span className="text-red-600">✕</span>
                          <span>{flag}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Mitigations */}
                  <div>
                    <h3 className="text-sm text-gray-700 mb-3 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-600" />
                      Suggested Mitigations
                    </h3>
                    <ul className="space-y-2">
                      {aiAnalysis.explanation_agent.mitigations.map((mitigation: string, idx: number) => (
                        <li key={idx} className="flex gap-2 text-sm text-gray-700">
                          <span className="text-blue-600">→</span>
                          <span>{mitigation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Risk Level</span>
                    <span className={`${
                      case_.risk_score < 0.3 ? 'text-green-600' :
                      case_.risk_score < 0.6 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {case_.risk_level.toUpperCase()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        case_.risk_score < 0.3 ? 'bg-green-500' :
                        case_.risk_score < 0.6 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${case_.risk_score * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Fraud Risk</span>
                    <span className={case_.fraud_flag ? 'text-red-600' : 'text-green-600'}>
                      {case_.fraud_flag ? 'DETECTED' : 'CLEAR'}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Credit Score</span>
                    <span className="text-gray-900">{case_.credit_score}</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">DTI Ratio</span>
                    <span className={`${
                      debtToIncome > 40 ? 'text-red-600' :
                      debtToIncome > 30 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {debtToIncome.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Recommendation Summary */}
            <div className={`rounded-xl p-6 ${
              aiAnalysis.explanation_agent.recommendation === 'approve'
                ? 'bg-gradient-to-br from-green-50 to-green-100'
                : 'bg-gradient-to-br from-red-50 to-red-100'
            }`}>
              <h3 className="text-lg text-gray-900 mb-2">AI Recommendation</h3>
              <p className={`text-2xl mb-2 ${
                aiAnalysis.explanation_agent.recommendation === 'approve'
                  ? 'text-green-700'
                  : 'text-red-700'
              }`}>
                {aiAnalysis.explanation_agent.recommendation.toUpperCase()}
              </p>
              <p className="text-sm text-gray-700">
                Confidence: {(aiAnalysis.explanation_agent.confidence * 100).toFixed(0)}%
              </p>
            </div>

            {/* Similar Cases Summary */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg text-gray-900 mb-4">Historical Performance</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Similar Cases Found</span>
                  <span className="text-gray-900">{aiAnalysis.similarity_agent.top_cases.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Approved</span>
                  <span className="text-green-600">
                    {aiAnalysis.similarity_agent.top_cases.filter((c: any) => c.outcome === 'approved').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Defaulted</span>
                  <span className="text-red-600">
                    {aiAnalysis.similarity_agent.top_cases.filter((c: any) => c.defaulted).length}
                  </span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-200">
                  <span className="text-gray-900">Success Rate</span>
                  <span className="text-blue-600">
                    {((aiAnalysis.similarity_agent.top_cases.filter((c: any) => c.outcome === 'approved' && !c.defaulted).length / aiAnalysis.similarity_agent.top_cases.length) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decision Form Modal */}
        {showDecisionForm && (
          <DecisionForm
            caseId={caseId}
            clientName={case_.client_name}
            aiRecommendation={aiAnalysis.explanation_agent.recommendation}
            onClose={() => setShowDecisionForm(false)}
            onSubmit={(decision) => {
              alert(`Decision submitted: ${decision.decision}\nReason: ${decision.decision_reason}`);
              onNavigate('banker-dashboard');
            }}
          />
        )}
      </div>
    </div>
  );
}
