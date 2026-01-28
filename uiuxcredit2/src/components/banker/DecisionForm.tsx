import React, { useState } from 'react';
import { X, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

type DecisionFormProps = {
  caseId: string;
  clientName: string;
  aiRecommendation: string;
  onClose: () => void;
  onSubmit: (decision: {
    decision: string;
    decision_reason: string;
    confidence: number;
    conditions: string;
  }) => void;
};

export default function DecisionForm({ 
  caseId, 
  clientName, 
  aiRecommendation, 
  onClose, 
  onSubmit 
}: DecisionFormProps) {
  const [decision, setDecision] = useState('');
  const [decisionReason, setDecisionReason] = useState('');
  const [confidence, setConfidence] = useState(5);
  const [conditions, setConditions] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  const confirmSubmit = () => {
    onSubmit({
      decision,
      decision_reason: decisionReason,
      confidence,
      conditions
    });
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl text-gray-900">Make Decision</h2>
              <p className="text-sm text-gray-600">{caseId} - {clientName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* AI Recommendation Banner */}
          <div className={`mx-6 mt-6 p-4 rounded-lg border-2 ${
            aiRecommendation === 'approve' 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              {aiRecommendation === 'approve' ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              <span className={`${
                aiRecommendation === 'approve' ? 'text-green-900' : 'text-red-900'
              }`}>
                AI Recommendation: {aiRecommendation.toUpperCase()}
              </span>
            </div>
            <p className={`text-sm ml-7 ${
              aiRecommendation === 'approve' ? 'text-green-700' : 'text-red-700'
            }`}>
              You can override this recommendation based on your analysis.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Decision Radio Buttons */}
            <div>
              <label className="block text-sm text-gray-700 mb-3">Your Decision *</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setDecision('approve')}
                  className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                    decision === 'approve'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <CheckCircle className={`w-6 h-6 ${decision === 'approve' ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className={decision === 'approve' ? 'text-green-900' : 'text-gray-700'}>
                    Approve
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setDecision('reject')}
                  className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                    decision === 'reject'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <XCircle className={`w-6 h-6 ${decision === 'reject' ? 'text-red-600' : 'text-gray-400'}`} />
                  <span className={decision === 'reject' ? 'text-red-900' : 'text-gray-700'}>
                    Reject
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setDecision('more_info')}
                  className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                    decision === 'more_info'
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <AlertCircle className={`w-6 h-6 ${decision === 'more_info' ? 'text-yellow-600' : 'text-gray-400'}`} />
                  <span className={decision === 'more_info' ? 'text-yellow-900' : 'text-gray-700'}>
                    More Info
                  </span>
                </button>
              </div>
            </div>

            {/* Decision Reason */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Decision Reason {decision === 'reject' && <span className="text-red-600">*</span>}
              </label>
              <textarea
                value={decisionReason}
                onChange={(e) => setDecisionReason(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                rows={4}
                placeholder={decision === 'reject' ? 
                  "Explain why the application is being rejected. This will be shared with the applicant." :
                  "Optional: Provide reasoning for your decision."
                }
                required={decision === 'reject'}
              />
              <p className="text-xs text-gray-500 mt-1">
                {decision === 'reject' ? 
                  'Required for rejections. Minimum 50 characters. Be clear and professional.' :
                  'Optional for approvals. Recommended to document your reasoning.'
                }
              </p>
            </div>

            {/* Confidence Level */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Confidence Level: {confidence}/10
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={confidence}
                onChange={(e) => setConfidence(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Low (1)</span>
                <span>Medium (5)</span>
                <span>High (10)</span>
              </div>
            </div>

            {/* Conditions / Notes */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Conditions / Additional Notes
              </label>
              <textarea
                value={conditions}
                onChange={(e) => setConditions(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                rows={3}
                placeholder="E.g., Higher interest rate, co-signer required, additional documentation needed..."
              />
            </div>

            {/* Override Warning */}
            {decision && decision !== aiRecommendation && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-yellow-900 text-sm">
                      You are overriding the AI recommendation
                    </p>
                    <p className="text-yellow-700 text-xs mt-1">
                      Please ensure your decision is well-justified and documented.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  !decision || 
                  (decision === 'reject' && (!decisionReason || decisionReason.length < 50))
                }
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Decision
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl text-gray-900 mb-4">Confirm Your Decision</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Case ID:</span>
                <span className="text-gray-900">{caseId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Client:</span>
                <span className="text-gray-900">{clientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Your Decision:</span>
                <span className={`capitalize ${
                  decision === 'approve' ? 'text-green-600' :
                  decision === 'reject' ? 'text-red-600' :
                  'text-yellow-600'
                }`}>
                  {decision.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Confidence:</span>
                <span className="text-gray-900">{confidence}/10</span>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg mb-6">
              <p className="text-xs text-gray-600 mb-1">Decision Reason:</p>
              <p className="text-sm text-gray-900">{decisionReason}</p>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              This decision will be final and cannot be undone. The applicant will be notified immediately.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Go Back
              </button>
              <button
                onClick={confirmSubmit}
                className={`flex-1 px-6 py-3 text-white rounded-lg ${
                  decision === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                  decision === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                  'bg-yellow-600 hover:bg-yellow-700'
                }`}
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}