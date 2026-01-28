import React, { useState } from 'react';
import Header from '../shared/Header';
import { ArrowLeft, Search, Filter, CheckCircle, XCircle, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { getSimilarCases } from '../../data/mockData';

type User = {
  role: 'client' | 'banker';
  email: string;
  name: string;
};

type SimilarCasesProps = {
  user: User;
  caseId: string;
  onLogout: () => void;
  onNavigate: (route: any, caseId?: string) => void;
};

export default function SimilarCases({ user, caseId, onLogout, onNavigate }: SimilarCasesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [loanAmountMin, setLoanAmountMin] = useState('');
  const [loanAmountMax, setLoanAmountMax] = useState('');
  const [durationFilter, setDurationFilter] = useState('all');
  const [outcomeFilter, setOutcomeFilter] = useState('all');
  const [defaultedFilter, setDefaultedFilter] = useState('all');
  const [selectedCase, setSelectedCase] = useState<any>(null);

  const similarCases = getSimilarCases(caseId);

  // Apply filters
  const filteredCases = similarCases.filter(c => {
    const matchesSearch = c.case_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLoanMin = !loanAmountMin || c.loan_amount >= Number(loanAmountMin);
    const matchesLoanMax = !loanAmountMax || c.loan_amount <= Number(loanAmountMax);
    const matchesDuration = durationFilter === 'all' || 
      (durationFilter === '<36' && c.loan_duration < 36) ||
      (durationFilter === '36' && c.loan_duration === 36) ||
      (durationFilter === '>36' && c.loan_duration > 36);
    const matchesOutcome = outcomeFilter === 'all' || c.outcome === outcomeFilter;
    const matchesDefaulted = defaultedFilter === 'all' || 
      (defaultedFilter === 'yes' && c.defaulted) ||
      (defaultedFilter === 'no' && !c.defaulted);
    
    return matchesSearch && matchesLoanMin && matchesLoanMax && matchesDuration && matchesOutcome && matchesDefaulted;
  });

  // Statistics
  const totalCases = filteredCases.length;
  const approvedCases = filteredCases.filter(c => c.outcome === 'approved').length;
  const defaultedCases = filteredCases.filter(c => c.defaulted).length;
  const avgSimilarity = filteredCases.reduce((sum, c) => sum + c.similarity_score, 0) / totalCases;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => onNavigate('case-detail', caseId)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Case Detail</span>
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl text-gray-900 mb-2">Similar Cases Explorer</h1>
          <p className="text-gray-600">
            Analyzing {totalCases} historically similar cases for {caseId}
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm text-gray-600">Avg Similarity</span>
            </div>
            <p className="text-2xl text-gray-900">{(avgSimilarity * 100).toFixed(0)}%</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Search className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm text-gray-600">Cases Found</span>
            </div>
            <p className="text-2xl text-gray-900">{totalCases}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm text-gray-600">Approved</span>
            </div>
            <p className="text-2xl text-gray-900">{approvedCases}</p>
            <p className="text-sm text-gray-600">{((approvedCases / totalCases) * 100).toFixed(0)}%</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-50 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <span className="text-sm text-gray-600">Defaulted</span>
            </div>
            <p className="text-2xl text-gray-900">{defaultedCases}</p>
            <p className="text-sm text-gray-600">{((defaultedCases / totalCases) * 100).toFixed(0)}%</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-700 mb-2">Search Case ID</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="CR-2024-..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Min Amount</label>
              <input
                type="number"
                value={loanAmountMin}
                onChange={(e) => setLoanAmountMin(e.target.value)}
                placeholder="50000"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Max Amount</label>
              <input
                type="number"
                value={loanAmountMax}
                onChange={(e) => setLoanAmountMax(e.target.value)}
                placeholder="100000"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Outcome</label>
              <select
                value={outcomeFilter}
                onChange={(e) => setOutcomeFilter(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="all">All</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Defaulted</label>
              <select
                value={defaultedFilter}
                onChange={(e) => setDefaultedFilter(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="all">All</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cases Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                    Case ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                    Similarity
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                    Loan Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                    Income
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                    Risk Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                    Outcome
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCases.map((case_) => (
                  <tr key={case_.case_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-blue-600">{case_.case_id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-purple-200 rounded-full">
                          <div
                            className="h-2 bg-purple-600 rounded-full"
                            style={{ width: `${case_.similarity_score * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-900">
                          {(case_.similarity_score * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        ${case_.loan_amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{case_.loan_duration} mo</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        ${case_.monthly_income.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm ${
                        case_.risk_score < 0.3 ? 'text-green-600' :
                        case_.risk_score < 0.6 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {(case_.risk_score * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs ${
                        case_.outcome === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {case_.outcome.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs ${
                        case_.defaulted ? 'bg-red-100 text-red-800' : 
                        case_.outcome === 'rejected' ? 'bg-gray-100 text-gray-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {case_.defaulted ? 'DEFAULTED' : case_.outcome === 'rejected' ? 'N/A' : 'REPAID'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedCase(case_)}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCases.length === 0 && (
            <div className="text-center py-12">
              <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No cases match your filters</p>
            </div>
          )}
        </div>

        <div className="mt-4 text-sm text-gray-600 text-center">
          Showing {filteredCases.length} of {similarCases.length} similar cases
        </div>
      </div>

      {/* Case Comparison Modal */}
      {selectedCase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl text-gray-900">Case Details</h2>
                <p className="text-sm text-gray-600">{selectedCase.case_id}</p>
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Similarity Score */}
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-purple-900">Similarity to Current Case</span>
                  <span className="text-2xl text-purple-600">
                    {(selectedCase.similarity_score * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-purple-200 rounded-full h-2">
                  <div
                    className="h-2 bg-purple-600 rounded-full"
                    style={{ width: `${selectedCase.similarity_score * 100}%` }}
                  />
                </div>
              </div>

              {/* Application Details */}
              <div>
                <h3 className="text-lg text-gray-900 mb-3">Application Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <label className="text-sm text-gray-600">Loan Amount</label>
                    <p className="text-gray-900">${selectedCase.loan_amount.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <label className="text-sm text-gray-600">Duration</label>
                    <p className="text-gray-900">{selectedCase.loan_duration} months</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <label className="text-sm text-gray-600">Monthly Income</label>
                    <p className="text-gray-900">${selectedCase.monthly_income.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <label className="text-sm text-gray-600">Credit Score</label>
                    <p className="text-gray-900">{selectedCase.credit_score}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <label className="text-sm text-gray-600">Employment Type</label>
                    <p className="text-gray-900 capitalize">{selectedCase.employment_type.replace('_', ' ')}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <label className="text-sm text-gray-600">Seniority</label>
                    <p className="text-gray-900">{selectedCase.seniority_years} years</p>
                  </div>
                </div>
              </div>

              {/* Risk & Outcome */}
              <div>
                <h3 className="text-lg text-gray-900 mb-3">Risk & Outcome</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <label className="text-sm text-gray-600">Risk Score</label>
                    <p className={`text-xl ${
                      selectedCase.risk_score < 0.3 ? 'text-green-600' :
                      selectedCase.risk_score < 0.6 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {(selectedCase.risk_score * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <label className="text-sm text-gray-600">Decision</label>
                    <p className={`text-xl capitalize ${
                      selectedCase.outcome === 'approved' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {selectedCase.outcome}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <label className="text-sm text-gray-600">Late Payments</label>
                    <p className="text-gray-900">{selectedCase.late_count}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <label className="text-sm text-gray-600">Defaulted</label>
                    <p className={selectedCase.defaulted ? 'text-red-600' : 'text-green-600'}>
                      {selectedCase.defaulted ? 'Yes' : 'No'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment History */}
              <div>
                <h3 className="text-lg text-gray-900 mb-3">Payment History</h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-900">{selectedCase.payment_history}</p>
                  <p className="text-sm text-gray-600 mt-2">
                    Decided on {new Date(selectedCase.decided_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Key Insights */}
              <div className={`p-4 rounded-lg ${
                selectedCase.defaulted ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
              }`}>
                <h3 className={`mb-2 ${selectedCase.defaulted ? 'text-red-900' : 'text-green-900'}`}>
                  Key Insight
                </h3>
                <p className={`text-sm ${selectedCase.defaulted ? 'text-red-700' : 'text-green-700'}`}>
                  {selectedCase.defaulted 
                    ? `This similar case defaulted after ${selectedCase.late_count} late payments. Consider this risk when making your decision.`
                    : `This similar case was successfully repaid with ${selectedCase.late_count} late payment${selectedCase.late_count === 1 ? '' : 's'}. The client maintained their obligations.`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
