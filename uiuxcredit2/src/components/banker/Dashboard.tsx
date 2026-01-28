import React, { useState } from 'react';
import Header from '../shared/Header';
import StatusBadge from '../shared/StatusBadge';
import { Search, Filter, Eye, AlertTriangle, TrendingDown, TrendingUp, Users, DollarSign } from 'lucide-react';
import MetricCard from '../shared/MetricCard';
import { mockCases } from '../../data/mockData';

type User = {
  role: 'client' | 'banker';
  email: string;
  name: string;
};

type BankerDashboardProps = {
  user: User;
  onLogout: () => void;
  onNavigate: (route: any, caseId?: string) => void;
};

export default function BankerDashboard({ user, onLogout, onNavigate }: BankerDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');

  // Filter cases
  const filteredCases = mockCases.filter(c => {
    const matchesSearch = c.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.case_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesRisk = riskFilter === 'all' || c.risk_level === riskFilter;
    return matchesSearch && matchesStatus && matchesRisk;
  });

  // Calculate metrics
  const pendingCount = mockCases.filter(c => c.status === 'pending').length;
  const avgRiskScore = mockCases.reduce((sum, c) => sum + c.risk_score, 0) / mockCases.length;
  const fraudCases = mockCases.filter(c => c.fraud_flag).length;
  const totalVolume = mockCases.reduce((sum, c) => sum + c.loan_amount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl text-gray-900 mb-2">Credit Applications Dashboard</h1>
          <p className="text-gray-600">Review and make decisions on pending credit applications</p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Pending Review"
            value={pendingCount}
            subtitle="Awaiting decision"
            icon={Users}
            color="blue"
          />
          <MetricCard
            title="Average Risk Score"
            value={`${(avgRiskScore * 100).toFixed(1)}%`}
            subtitle="Across all applications"
            icon={TrendingUp}
            color="yellow"
          />
          <MetricCard
            title="Fraud Alerts"
            value={fraudCases}
            subtitle="Require attention"
            icon={AlertTriangle}
            color="red"
          />
          <MetricCard
            title="Total Volume"
            value={`$${(totalVolume / 1000).toFixed(0)}K`}
            subtitle="Loan requests"
            icon={DollarSign}
            color="green"
          />
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or case ID..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Risk Filter */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">Risk Level</label>
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="all">All Risk Levels</option>
                <option value="low">Low Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="high">High Risk</option>
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
                    Client Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                    Loan Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                    Risk Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                    Similarity
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                    Fraud
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                    Submitted
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
                      <div>
                        <div className="text-sm text-gray-900">{case_.client_name}</div>
                        <div className="text-xs text-gray-500">{case_.client_email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded capitalize">
                        {case_.product_type?.replace('_', ' ') || 'N/A'}
                      </span>
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
                      <StatusBadge status={case_.status} size="sm" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${
                          case_.risk_score < 0.3
                            ? 'text-green-600'
                            : case_.risk_score < 0.6
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}>
                          {(case_.risk_score * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-purple-600">
                        {case_.similarity_score ? `${(case_.similarity_score * 100).toFixed(0)}%` : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {case_.fraud_flag ? (
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                          <span className="text-xs text-red-600">Yes</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">
                        {new Date(case_.submitted_date).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => onNavigate('case-detail', case_.case_id)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Review</span>
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

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600 text-center">
          Showing {filteredCases.length} of {mockCases.length} applications
        </div>
      </div>
    </div>
  );
}