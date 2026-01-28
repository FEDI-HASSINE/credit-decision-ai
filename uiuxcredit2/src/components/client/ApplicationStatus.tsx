import React from 'react';
import Header from '../shared/Header';
import StatusBadge from '../shared/StatusBadge';
import Timeline from '../shared/Timeline';
import { DollarSign, Calendar, TrendingUp, FileText, Plus } from 'lucide-react';

type User = {
  role: 'client' | 'banker';
  email: string;
  name: string;
};

type ApplicationStatusProps = {
  user: User;
  onLogout: () => void;
  onNavigate: (route: any) => void;
};

// Mock application data
const mockApplication = {
  case_id: 'CR-2025-00123',
  status: 'under_review' as const,
  submitted_date: '2025-01-20',
  loan_amount: 50000,
  loan_duration: 24,
  product_type: 'personal_loan',
  monthly_income: 4500,
  risk_score: 0.34,
  decision: null,
  decision_reason: null,
  estimated_completion: '2025-01-28'
};

export default function ApplicationStatus({ user, onLogout, onNavigate }: ApplicationStatusProps) {
  const timelineSteps = [
    {
      label: 'Application Submitted',
      status: 'completed' as const,
      timestamp: '2025-01-20 10:30 AM',
      description: 'Your application has been received and is in the queue.'
    },
    {
      label: 'Document Verification',
      status: 'completed' as const,
      timestamp: '2025-01-21 02:15 PM',
      description: 'All documents have been verified successfully.'
    },
    {
      label: 'AI Risk Analysis',
      status: 'current' as const,
      timestamp: '2025-01-22 09:00 AM',
      description: 'Multi-agent AI system is analyzing your application.'
    },
    {
      label: 'Banker Review',
      status: 'pending' as const,
      description: 'Awaiting final review by credit analyst.'
    },
    {
      label: 'Final Decision',
      status: 'pending' as const,
      description: 'You will be notified once a decision is made.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl text-gray-900 mb-2">My Applications</h1>
              <p className="text-gray-600">Track the status of your credit applications</p>
            </div>
            <button
              onClick={() => onNavigate('client-apply')}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              <span>New Application</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Application Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Application Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl text-gray-900">{mockApplication.case_id}</h2>
                    <StatusBadge status={mockApplication.status} />
                  </div>
                  <p className="text-sm text-gray-600">
                    Submitted on {new Date(mockApplication.submitted_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* Loan Summary */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Loan Amount</span>
                  </div>
                  <p className="text-xl text-gray-900">${mockApplication.loan_amount.toLocaleString()}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Duration</span>
                  </div>
                  <p className="text-xl text-gray-900">{mockApplication.loan_duration} months</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Monthly Income</span>
                  </div>
                  <p className="text-xl text-gray-900">${mockApplication.monthly_income.toLocaleString()}</p>
                </div>
              </div>

              {/* Status Message */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-blue-900 mb-1">Application Under Review</p>
                    <p className="text-sm text-blue-700">
                      Your application is currently being analyzed by our AI-powered risk assessment system. 
                      A banker will review the results shortly. Estimated completion: {mockApplication.estimated_completion}
                    </p>
                  </div>
                </div>
              </div>

              {/* Risk Score (if available) */}
              {mockApplication.risk_score !== null && mockApplication.risk_score !== undefined && (
                <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-700">AI Risk Assessment</span>
                    <span className={`text-lg ${
                      mockApplication.risk_score < 0.3 ? 'text-green-600' :
                      mockApplication.risk_score < 0.6 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {(mockApplication.risk_score * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        mockApplication.risk_score < 0.3 ? 'bg-green-500' :
                        mockApplication.risk_score < 0.6 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${mockApplication.risk_score * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    {mockApplication.risk_score < 0.3 ? 'Low risk profile' :
                     mockApplication.risk_score < 0.6 ? 'Medium risk profile' :
                     'High risk profile'}
                  </p>
                </div>
              )}

              {/* Decision (if available) */}
              {mockApplication.decision && (
                <div className={`mt-4 p-4 border-2 rounded-lg ${
                  mockApplication.decision === 'approved' ? 'bg-green-50 border-green-200' :
                  mockApplication.decision === 'rejected' ? 'bg-red-50 border-red-200' :
                  'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className="mb-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                      mockApplication.decision === 'approved' ? 'bg-green-100 text-green-800' :
                      mockApplication.decision === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {mockApplication.decision === 'approved' ? '✓ Approved' :
                       mockApplication.decision === 'rejected' ? '✕ Rejected' :
                       '⚠ More Information Required'}
                    </span>
                  </div>
                  {mockApplication.decision_reason && (
                    <div>
                      <p className="text-sm text-gray-700 mb-1">Decision Reason:</p>
                      <p className={`text-sm ${
                        mockApplication.decision === 'approved' ? 'text-green-800' :
                        mockApplication.decision === 'rejected' ? 'text-red-800' :
                        'text-yellow-800'
                      }`}>
                        {mockApplication.decision_reason}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-xl text-gray-900 mb-6">Application Progress</h3>
              <Timeline steps={timelineSteps} />
            </div>
          </div>

          {/* Sidebar - Quick Info */}
          <div className="space-y-6">
            {/* Expected Timeline */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg text-gray-900 mb-4">Expected Timeline</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Document Verification</span>
                  <span className="text-gray-900">1-2 days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">AI Analysis</span>
                  <span className="text-gray-900">1 day</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Banker Review</span>
                  <span className="text-gray-900">2-3 days</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-200">
                  <span className="text-gray-900">Total</span>
                  <span className="text-blue-600">4-6 days</span>
                </div>
              </div>
            </div>

            {/* Need Help? */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
              <h3 className="text-lg text-gray-900 mb-2">Need Help?</h3>
              <p className="text-sm text-gray-700 mb-4">
                Our customer support team is here to assist you with any questions about your application.
              </p>
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                Contact Support
              </button>
            </div>

            {/* What Happens Next */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg text-gray-900 mb-4">What Happens Next?</h3>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex gap-2">
                  <span className="text-blue-600">•</span>
                  <span>AI agents analyze your financial profile and risk factors</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-600">•</span>
                  <span>A banker reviews AI recommendations and similar cases</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Final decision is made with detailed reasoning</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-600">•</span>
                  <span>You'll receive an email notification with the outcome</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}