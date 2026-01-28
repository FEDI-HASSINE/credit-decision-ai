import React, { useState } from 'react';
import Header from '../shared/Header';
import { ChevronRight, ChevronLeft, Upload, CheckCircle, FileText } from 'lucide-react';

type User = {
  role: 'client' | 'banker';
  email: string;
  name: string;
};

type ApplicationFormProps = {
  user: User;
  onLogout: () => void;
  onNavigate: (route: any) => void;
};

export default function ApplicationForm({ user, onLogout, onNavigate }: ApplicationFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Info
    full_name: user.name,
    email: user.email,
    phone: '',
    
    // Financial Data
    loan_amount: '',
    loan_duration: '',
    product_type: '',
    monthly_income: '',
    other_income: '',
    monthly_charges: '',
    employment_type: '',
    contract_type: '',
    seniority_years: '',
    marital_status: '',
    number_of_children: '',
    housing_status: '',
    credit_score: '',
    spouse_employed: false,
    is_primary_holder: true,
    
    // Documents
    documents: {
      salary_slip: null as File | null,
      bank_statement: null as File | null,
      employment_contract: null as File | null
    }
  });

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateDocument = (type: string, file: File | null) => {
    setFormData(prev => ({
      ...prev,
      documents: { ...prev.documents, [type]: file }
    }));
  };

  const handleSubmit = () => {
    // Mock submission
    alert('Application submitted successfully!');
    onNavigate('client-status');
  };

  const steps = [
    { number: 1, title: 'Personal Info', icon: FileText },
    { number: 2, title: 'Financial Details', icon: FileText },
    { number: 3, title: 'Documents', icon: Upload },
    { number: 4, title: 'Review', icon: CheckCircle }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={onLogout} />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((s, idx) => (
              <React.Fragment key={s.number}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      step >= s.number
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    <s.icon className="w-6 h-6" />
                  </div>
                  <span className="text-sm text-gray-600 mt-2">{s.title}</span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-4 ${
                      step > s.number ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {step === 1 && (
            <div>
              <h2 className="text-2xl text-gray-900 mb-6">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => updateField('full_name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Marital Status</label>
                  <select
                    value={formData.marital_status}
                    onChange={(e) => updateField('marital_status', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  >
                    <option value="">Select...</option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Number of Children</label>
                  <input
                    type="number"
                    value={formData.number_of_children}
                    onChange={(e) => updateField('number_of_children', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Housing Status</label>
                  <select
                    value={formData.housing_status}
                    onChange={(e) => updateField('housing_status', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  >
                    <option value="">Select...</option>
                    <option value="owned">Owned</option>
                    <option value="rented">Rented</option>
                    <option value="with_family">Living with Family</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl text-gray-900 mb-6">Financial Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Loan Amount Requested</label>
                  <input
                    type="number"
                    value={formData.loan_amount}
                    onChange={(e) => updateField('loan_amount', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="50000"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Loan Duration (months)</label>
                  <input
                    type="number"
                    value={formData.loan_duration}
                    onChange={(e) => updateField('loan_duration', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="24"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Number of months (e.g., 12, 24, 36, 48, 60)</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Product Type</label>
                  <select
                    value={formData.product_type}
                    onChange={(e) => updateField('product_type', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  >
                    <option value="">Select...</option>
                    <option value="personal_loan">Personal Loan</option>
                    <option value="home_loan">Home Loan</option>
                    <option value="auto_loan">Auto Loan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Monthly Income</label>
                  <input
                    type="number"
                    value={formData.monthly_income}
                    onChange={(e) => updateField('monthly_income', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="4500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Other Income</label>
                  <input
                    type="number"
                    value={formData.other_income}
                    onChange={(e) => updateField('other_income', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Monthly Charges</label>
                  <input
                    type="number"
                    value={formData.monthly_charges}
                    onChange={(e) => updateField('monthly_charges', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="1200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Employment Type</label>
                  <select
                    value={formData.employment_type}
                    onChange={(e) => updateField('employment_type', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  >
                    <option value="">Select...</option>
                    <option value="full_time">Full Time</option>
                    <option value="part_time">Part Time</option>
                    <option value="self_employed">Self Employed</option>
                    <option value="unemployed">Unemployed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Contract Type</label>
                  <select
                    value={formData.contract_type}
                    onChange={(e) => updateField('contract_type', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  >
                    <option value="">Select...</option>
                    <option value="permanent">Permanent</option>
                    <option value="temporary">Temporary</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Seniority (years)</label>
                  <input
                    type="number"
                    value={formData.seniority_years}
                    onChange={(e) => updateField('seniority_years', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="5"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Credit Score</label>
                  <input
                    type="number"
                    value={formData.credit_score}
                    onChange={(e) => updateField('credit_score', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="700"
                    min="300"
                    max="850"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Range: 300-850 (Higher is better)</p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="spouse_employed"
                    checked={formData.spouse_employed}
                    onChange={(e) => updateField('spouse_employed', e.target.checked)}
                    className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <label htmlFor="spouse_employed" className="text-sm text-gray-700">Spouse Employed</label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_primary_holder"
                    checked={formData.is_primary_holder}
                    onChange={(e) => updateField('is_primary_holder', e.target.checked)}
                    className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <label htmlFor="is_primary_holder" className="text-sm text-gray-700">Primary Account Holder</label>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-2xl text-gray-900 mb-6">Upload Documents</h2>
              <div className="space-y-6">
                {[
                  { key: 'salary_slip', label: 'Salary Slip (Last 3 months)' },
                  { key: 'bank_statement', label: 'Bank Statement (Last 6 months)' },
                  { key: 'employment_contract', label: 'Employment Contract' }
                ].map(doc => (
                  <div key={doc.key} className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-colors">
                    <label className="cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 bg-blue-50 rounded-lg">
                          <Upload className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-900">{doc.label}</p>
                          <p className="text-sm text-gray-500">
                            {formData.documents[doc.key as keyof typeof formData.documents]
                              ? formData.documents[doc.key as keyof typeof formData.documents]!.name
                              : 'Click to upload or drag and drop'}
                          </p>
                        </div>
                        <input
                          type="file"
                          onChange={(e) => updateDocument(doc.key, e.target.files?.[0] || null)}
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                      </div>
                    </label>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Accepted formats: PDF, JPG, PNG (Max 10MB per file)
              </p>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-2xl text-gray-900 mb-6">Review Your Application</h2>
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-lg text-gray-900 mb-3">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <span className="ml-2 text-gray-900">{formData.full_name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <span className="ml-2 text-gray-900">{formData.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <span className="ml-2 text-gray-900">{formData.phone}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Marital Status:</span>
                      <span className="ml-2 text-gray-900">{formData.marital_status}</span>
                    </div>
                  </div>
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-lg text-gray-900 mb-3">Financial Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Loan Amount:</span>
                      <span className="ml-2 text-gray-900">${formData.loan_amount}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Duration:</span>
                      <span className="ml-2 text-gray-900">{formData.loan_duration} months</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Monthly Income:</span>
                      <span className="ml-2 text-gray-900">${formData.monthly_income}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Employment:</span>
                      <span className="ml-2 text-gray-900">{formData.employment_type}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg text-gray-900 mb-3">Documents</h3>
                  <div className="space-y-2 text-sm">
                    {Object.entries(formData.documents).map(([key, file]) => (
                      <div key={key} className="flex items-center gap-2">
                        {file ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                        )}
                        <span className="text-gray-700">
                          {key.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
              className="flex items-center gap-2 px-6 py-3 text-gray-700 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Previous</span>
            </button>

            {step < 4 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <span>Next</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Submit Application</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}