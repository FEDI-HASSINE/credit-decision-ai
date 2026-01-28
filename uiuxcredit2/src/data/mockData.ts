// Mock data for the Credit Decision AI application

export const mockCases = [
  {
    case_id: 'CR-2025-00156',
    client_name: 'Michael Chen',
    client_email: 'michael.chen@email.com',
    loan_amount: 75000,
    loan_duration: 36,
    product_type: 'personal_loan',
    status: 'pending' as const,
    risk_score: 0.34,
    risk_level: 'medium',
    fraud_flag: false,
    submitted_date: '2025-01-26',
    monthly_income: 6200,
    other_income: 800,
    monthly_charges: 1850,
    employment_type: 'full_time',
    contract_type: 'permanent',
    seniority_years: 7,
    marital_status: 'married',
    number_of_children: 2,
    housing_status: 'owned',
    credit_score: 720,
    spouse_employed: true,
    is_primary_holder: true,
    similarity_score: 0.82
  },
  {
    case_id: 'CR-2025-00155',
    client_name: 'Sarah Williams',
    client_email: 'sarah.w@email.com',
    loan_amount: 35000,
    loan_duration: 24,
    product_type: 'auto_loan',
    status: 'under_review' as const,
    risk_score: 0.21,
    risk_level: 'low',
    fraud_flag: false,
    submitted_date: '2025-01-25',
    monthly_income: 5500,
    other_income: 300,
    monthly_charges: 1200,
    employment_type: 'full_time',
    contract_type: 'permanent',
    seniority_years: 5,
    marital_status: 'single',
    number_of_children: 0,
    housing_status: 'rented',
    credit_score: 780,
    spouse_employed: false,
    is_primary_holder: true,
    similarity_score: 0.91
  },
  {
    case_id: 'CR-2025-00154',
    client_name: 'James Rodriguez',
    client_email: 'j.rodriguez@email.com',
    loan_amount: 120000,
    loan_duration: 60,
    product_type: 'home_loan',
    status: 'pending' as const,
    risk_score: 0.68,
    risk_level: 'high',
    fraud_flag: true,
    submitted_date: '2025-01-24',
    monthly_income: 4200,
    other_income: 0,
    monthly_charges: 2800,
    employment_type: 'contract',
    contract_type: 'temporary',
    seniority_years: 1,
    marital_status: 'divorced',
    number_of_children: 1,
    housing_status: 'rented',
    credit_score: 580,
    spouse_employed: false,
    is_primary_holder: true,
    similarity_score: 0.71
  },
  {
    case_id: 'CR-2025-00153',
    client_name: 'Emma Thompson',
    client_email: 'emma.t@email.com',
    loan_amount: 45000,
    loan_duration: 30,
    product_type: 'personal_loan',
    status: 'approved' as const,
    risk_score: 0.18,
    risk_level: 'low',
    fraud_flag: false,
    submitted_date: '2025-01-23',
    monthly_income: 7200,
    other_income: 1200,
    monthly_charges: 1600,
    employment_type: 'full_time',
    contract_type: 'permanent',
    seniority_years: 10,
    marital_status: 'married',
    number_of_children: 1,
    housing_status: 'owned',
    credit_score: 810,
    spouse_employed: true,
    is_primary_holder: true,
    similarity_score: 0.88,
    decision: 'approved',
    decision_reason: 'Strong financial profile with excellent credit history and stable employment. Debt-to-income ratio well within acceptable range.',
    decided_by: 'Sarah Johnson',
    decided_at: '2025-01-25 14:30',
    conditions: 'Standard terms apply'
  },
  {
    case_id: 'CR-2025-00152',
    client_name: 'David Park',
    client_email: 'd.park@email.com',
    loan_amount: 95000,
    loan_duration: 48,
    product_type: 'business_loan',
    status: 'rejected' as const,
    risk_score: 0.81,
    risk_level: 'high',
    fraud_flag: false,
    submitted_date: '2025-01-22',
    monthly_income: 3800,
    other_income: 200,
    monthly_charges: 2900,
    employment_type: 'part_time',
    contract_type: 'contract',
    seniority_years: 2,
    marital_status: 'single',
    number_of_children: 0,
    housing_status: 'rented',
    credit_score: 520,
    spouse_employed: false,
    is_primary_holder: true,
    similarity_score: 0.76,
    decision: 'rejected',
    decision_reason: 'High debt-to-income ratio (76%) and insufficient stable income to support requested loan amount. Credit score below minimum threshold. Part-time employment adds additional risk.',
    decided_by: 'Sarah Johnson',
    decided_at: '2025-01-24 11:15',
    conditions: null
  },
  {
    case_id: 'CR-2025-00151',
    client_name: 'Lisa Anderson',
    client_email: 'lisa.a@email.com',
    loan_amount: 52000,
    loan_duration: 36,
    product_type: 'auto_loan',
    status: 'pending' as const,
    risk_score: 0.42,
    risk_level: 'medium',
    fraud_flag: false,
    submitted_date: '2025-01-21',
    monthly_income: 5800,
    other_income: 600,
    monthly_charges: 1950,
    employment_type: 'full_time',
    contract_type: 'permanent',
    seniority_years: 4,
    marital_status: 'married',
    number_of_children: 3,
    housing_status: 'rented',
    credit_score: 680,
    spouse_employed: true,
    is_primary_holder: false,
    similarity_score: 0.79
  }
];

export const getAIAnalysis = (caseId: string) => {
  const analyses: Record<string, any> = {
    'CR-2025-00156': {
      risk_agent: {
        risk_score: 0.34,
        risk_level: 'medium',
        confidence: 0.87,
        breakdown: [
          { category: 'Income Stability', score: 0.25 },
          { category: 'Debt Ratio', score: 0.38 },
          { category: 'Employment', score: 0.22 },
          { category: 'Credit History', score: 0.31 },
          { category: 'Behavioral', score: 0.45 }
        ]
      },
      fraud_agent: {
        fraud_flag: false,
        fraud_score: 0.12,
        indicators: [
          { indicator: 'Document consistency', status: 'pass', confidence: 0.94 },
          { indicator: 'Income verification', status: 'pass', confidence: 0.91 },
          { indicator: 'Identity verification', status: 'pass', confidence: 0.96 },
          { indicator: 'Address verification', status: 'pass', confidence: 0.89 }
        ]
      },
      similarity_agent: {
        similarity_score: 0.82,
        top_cases: [
          {
            case_id: 'CR-2024-12890',
            similarity_score: 0.91,
            outcome: 'approved',
            defaulted: false,
            loan_amount: 72000,
            loan_duration: 36,
            employment_type: 'full_time',
            monthly_income: 6100,
            final_outcome: 'Fully repaid on time'
          },
          {
            case_id: 'CR-2024-11234',
            similarity_score: 0.85,
            outcome: 'approved',
            defaulted: false,
            loan_amount: 78000,
            loan_duration: 36,
            employment_type: 'full_time',
            monthly_income: 6400,
            final_outcome: 'Fully repaid with 1 late payment'
          },
          {
            case_id: 'CR-2024-09876',
            similarity_score: 0.79,
            outcome: 'approved',
            defaulted: true,
            loan_amount: 75000,
            loan_duration: 36,
            employment_type: 'full_time',
            monthly_income: 6000,
            final_outcome: 'Defaulted after 18 months'
          }
        ]
      },
      behavior_agent: {
        assessment: 'positive',
        confidence: 0.76,
        factors: [
          { factor: 'Payment history pattern', score: 0.82, impact: 'positive' },
          { factor: 'Credit utilization', score: 0.68, impact: 'neutral' },
          { factor: 'Account age', score: 0.91, impact: 'positive' },
          { factor: 'Recent inquiries', score: 0.55, impact: 'negative' }
        ]
      },
      document_agent: {
        status: 'verified',
        documents: [
          { type: 'salary_slip', status: 'verified', confidence: 0.96, issues: [] },
          { type: 'bank_statement', status: 'verified', confidence: 0.93, issues: ['One irregular deposit noted'] },
          { type: 'employment_contract', status: 'verified', confidence: 0.98, issues: [] }
        ]
      },
      explanation_agent: {
        recommendation: 'approve',
        confidence: 0.78,
        strengths: [
          'Stable full-time employment with 7 years seniority',
          'Good credit score (720) indicating responsible credit behavior',
          'Married with owned housing, suggesting financial stability',
          'Debt-to-income ratio within acceptable range (30%)',
          'Similar cases show 75% success rate with comparable profiles'
        ],
        weaknesses: [
          'Loan amount is relatively high (75k) requiring 36-month commitment',
          'Monthly charges at $1,850 reduce available discretionary income',
          'Recent credit inquiries detected, suggesting potential financial stress'
        ],
        red_flags: [
          'One similar case with matching profile defaulted after 18 months',
          'Irregular deposit in bank statement requires explanation'
        ],
        mitigations: [
          'Request explanation for irregular deposit',
          'Consider slightly higher interest rate to offset medium risk',
          'Recommend insurance product to protect against employment loss'
        ]
      }
    },
    'CR-2025-00154': {
      risk_agent: {
        risk_score: 0.68,
        risk_level: 'high',
        confidence: 0.91,
        breakdown: [
          { category: 'Income Stability', score: 0.72 },
          { category: 'Debt Ratio', score: 0.85 },
          { category: 'Employment', score: 0.78 },
          { category: 'Credit History', score: 0.71 },
          { category: 'Behavioral', score: 0.55 }
        ]
      },
      fraud_agent: {
        fraud_flag: true,
        fraud_score: 0.73,
        indicators: [
          { indicator: 'Document consistency', status: 'fail', confidence: 0.82 },
          { indicator: 'Income verification', status: 'suspicious', confidence: 0.76 },
          { indicator: 'Identity verification', status: 'pass', confidence: 0.94 },
          { indicator: 'Address verification', status: 'suspicious', confidence: 0.68 }
        ]
      },
      similarity_agent: {
        similarity_score: 0.71,
        top_cases: [
          {
            case_id: 'CR-2024-10567',
            similarity_score: 0.88,
            outcome: 'rejected',
            defaulted: null,
            loan_amount: 115000,
            loan_duration: 60,
            employment_type: 'contract',
            monthly_income: 4100,
            final_outcome: 'Application rejected - high risk'
          },
          {
            case_id: 'CR-2024-08234',
            similarity_score: 0.79,
            outcome: 'approved',
            defaulted: true,
            loan_amount: 125000,
            loan_duration: 60,
            employment_type: 'contract',
            monthly_income: 4500,
            final_outcome: 'Defaulted after 8 months'
          }
        ]
      },
      behavior_agent: {
        assessment: 'negative',
        confidence: 0.84,
        factors: [
          { factor: 'Payment history pattern', score: 0.45, impact: 'negative' },
          { factor: 'Credit utilization', score: 0.88, impact: 'negative' },
          { factor: 'Account age', score: 0.32, impact: 'negative' },
          { factor: 'Recent inquiries', score: 0.92, impact: 'negative' }
        ]
      },
      document_agent: {
        status: 'issues_found',
        documents: [
          { type: 'salary_slip', status: 'suspicious', confidence: 0.61, issues: ['Inconsistent formatting', 'Employer details mismatch'] },
          { type: 'bank_statement', status: 'verified', confidence: 0.88, issues: [] },
          { type: 'employment_contract', status: 'suspicious', confidence: 0.58, issues: ['Signature verification failed'] }
        ]
      },
      explanation_agent: {
        recommendation: 'reject',
        confidence: 0.92,
        strengths: [
          'Identity verification passed'
        ],
        weaknesses: [
          'Very high debt-to-income ratio (67%) - monthly charges exceed safe limits',
          'Low credit score (580) indicating past credit difficulties',
          'Temporary contract employment with only 1 year seniority',
          'Requesting very large loan amount ($120k) over extended period (60 months)',
          'Divorced status with child support obligations'
        ],
        red_flags: [
          'FRAUD ALERT: Document inconsistencies detected in salary slip and employment contract',
          'Multiple suspicious indicators flagged by fraud detection system',
          'Similar cases show 100% default or rejection rate',
          'Excessive recent credit inquiries suggesting financial distress',
          'Income verification shows discrepancies'
        ],
        mitigations: [
          'Immediate rejection recommended due to fraud indicators',
          'Report suspicious documents to compliance team',
          'Consider blacklisting for 12 months pending investigation'
        ]
      }
    }
  };

  return analyses[caseId] || analyses['CR-2025-00156'];
};

export const getSimilarCases = (caseId: string) => {
  return [
    {
      case_id: 'CR-2024-12890',
      similarity_score: 0.91,
      loan_amount: 72000,
      loan_duration: 36,
      monthly_income: 6100,
      employment_type: 'full_time',
      contract_type: 'permanent',
      seniority_years: 6,
      credit_score: 730,
      risk_score: 0.32,
      outcome: 'approved',
      defaulted: false,
      late_count: 1,
      payment_history: 'Fully repaid on time',
      decided_date: '2024-12-15'
    },
    {
      case_id: 'CR-2024-11234',
      similarity_score: 0.85,
      loan_amount: 78000,
      loan_duration: 36,
      monthly_income: 6400,
      employment_type: 'full_time',
      contract_type: 'permanent',
      seniority_years: 8,
      credit_score: 715,
      risk_score: 0.29,
      outcome: 'approved',
      defaulted: false,
      late_count: 2,
      payment_history: 'Fully repaid with 1 late payment',
      decided_date: '2024-11-08'
    },
    {
      case_id: 'CR-2024-09876',
      similarity_score: 0.79,
      loan_amount: 75000,
      loan_duration: 36,
      monthly_income: 6000,
      employment_type: 'full_time',
      contract_type: 'permanent',
      seniority_years: 5,
      credit_score: 690,
      risk_score: 0.45,
      outcome: 'approved',
      defaulted: true,
      late_count: 8,
      payment_history: 'Defaulted after 18 months',
      decided_date: '2024-09-20'
    },
    {
      case_id: 'CR-2024-08456',
      similarity_score: 0.76,
      loan_amount: 68000,
      loan_duration: 30,
      monthly_income: 6500,
      employment_type: 'full_time',
      contract_type: 'permanent',
      seniority_years: 9,
      credit_score: 745,
      risk_score: 0.26,
      outcome: 'approved',
      defaulted: false,
      late_count: 0,
      payment_history: 'Perfect payment record',
      decided_date: '2024-08-12'
    },
    {
      case_id: 'CR-2024-07123',
      similarity_score: 0.73,
      loan_amount: 80000,
      loan_duration: 42,
      monthly_income: 5900,
      employment_type: 'full_time',
      contract_type: 'permanent',
      seniority_years: 7,
      credit_score: 705,
      risk_score: 0.38,
      outcome: 'approved',
      defaulted: false,
      late_count: 3,
      payment_history: 'Ongoing - no late payments yet',
      decided_date: '2024-07-05'
    },
    {
      case_id: 'CR-2024-05678',
      similarity_score: 0.71,
      loan_amount: 71000,
      loan_duration: 36,
      monthly_income: 6200,
      employment_type: 'full_time',
      contract_type: 'permanent',
      seniority_years: 6,
      credit_score: 720,
      risk_score: 0.34,
      outcome: 'approved',
      defaulted: false,
      late_count: 1,
      payment_history: 'Early repayment after 28 months',
      decided_date: '2024-05-18'
    },
    {
      case_id: 'CR-2024-04234',
      similarity_score: 0.68,
      loan_amount: 77000,
      loan_duration: 36,
      monthly_income: 5800,
      employment_type: 'full_time',
      contract_type: 'permanent',
      seniority_years: 5,
      credit_score: 695,
      risk_score: 0.41,
      outcome: 'rejected',
      defaulted: null,
      late_count: 0,
      payment_history: 'Application rejected',
      decided_date: '2024-04-22'
    },
    {
      case_id: 'CR-2024-02890',
      similarity_score: 0.65,
      loan_amount: 73000,
      loan_duration: 36,
      monthly_income: 6100,
      employment_type: 'full_time',
      contract_type: 'temporary',
      seniority_years: 4,
      credit_score: 710,
      risk_score: 0.47,
      outcome: 'approved',
      defaulted: false,
      late_count: 4,
      payment_history: 'Ongoing - 2 late payments',
      decided_date: '2024-02-14'
    }
  ];
};