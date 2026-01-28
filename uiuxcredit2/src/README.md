# Credit Decision AI - Multi-Agent Credit Decision Support System

A modern, professional UI/UX for a multi-agent credit decision support system with human-in-the-loop workflow for banking and financial services.

## Features

### Client Portal
- **Multi-step Application Form**: Guided wizard for submitting credit applications
  - Personal information
  - Financial details
  - Document upload
  - Application review
- **Application Status Tracking**: Real-time tracking with timeline visualization
- **Decision Notifications**: View final decisions with detailed reasoning

### Banker Dashboard
- **Application Management**: Filterable table of all credit applications
- **AI-Powered Analysis**: Multi-agent system providing:
  - Risk assessment with category breakdown
  - Fraud detection with verification checks
  - Similar case analysis with historical outcomes
  - Behavioral assessment
  - Document verification
  - Explainable AI recommendations
- **Similar Cases Explorer**: Deep dive into historically similar cases
- **Decision Workflow**: Human-in-the-loop decision making with:
  - Approve/Reject/Request More Info options
  - Confidence level tracking
  - Override capability with audit trail
  - Conditions and notes

## Multi-Agent System

The AI analysis is powered by multiple specialized agents:

1. **Risk Agent**: Analyzes financial risk across multiple categories
2. **Fraud Agent**: Detects potential fraud indicators
3. **Similarity Agent**: Finds and analyzes similar historical cases
4. **Behavior Agent**: Assesses payment behavior patterns
5. **Document Agent**: Verifies uploaded documents
6. **Explanation Agent**: Provides human-readable explanations and recommendations

## User Roles

### Client
- Submit credit applications
- Upload required documents
- Track application status
- View decisions and reasons

### Banker
- Review pending applications
- Analyze AI agent outputs
- Explore historical similar cases
- Make final decisions with reasoning

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts
- **Icons**: Lucide React
- **Architecture**: Multi-agent AI system (simulated)

## Demo Credentials

**Client:**
- Email: client@example.com
- Password: password

**Banker:**
- Email: banker@bank.com
- Password: password

## Design Principles

- **Professional Banking UI**: Clean, trustworthy design
- **Explainability First**: Clear AI reasoning and recommendations
- **Human-in-the-Loop**: Bankers can override AI decisions
- **Accessibility**: WCAG AA compliant, high contrast, 16px+ text
- **Responsive**: Desktop and tablet optimized

## Color Palette

- Primary Blue: #2563EB
- Gray: #64748B
- Success: #10B981
- Warning: #F59E0B
- Error: #EF4444
- White Background: #FFFFFF

## Project Structure

```
/
├── App.tsx                          # Main app with routing
├── components/
│   ├── Login.tsx                    # Login page
│   ├── client/
│   │   ├── ApplicationForm.tsx      # Multi-step application form
│   │   └── ApplicationStatus.tsx    # Status tracking page
│   ├── banker/
│   │   ├── Dashboard.tsx            # Main banker dashboard
│   │   ├── CaseDetail.tsx           # Detailed case analysis
│   │   ├── SimilarCases.tsx         # Similar cases explorer
│   │   └── DecisionForm.tsx         # Decision making form
│   └── shared/
│       ├── Header.tsx               # App header
│       ├── StatusBadge.tsx          # Status indicators
│       ├── MetricCard.tsx           # Metric display cards
│       ├── RiskChart.tsx            # Risk visualization
│       └── Timeline.tsx             # Timeline component
├── data/
│   └── mockData.ts                  # Mock application and AI data
└── styles/
    └── globals.css                  # Global styles and theme
```

## Application Data Fields

### Application Fields
- loan_amount
- loan_duration
- monthly_income
- other_income
- monthly_charges
- employment_type
- contract_type
- seniority_years
- marital_status
- number_of_children
- housing_status
- credit_score

### AI Analysis Fields
- risk_score
- risk_level
- confidence
- fraud_flag
- fraud_indicators
- similarity_score
- behavioral_assessment
- document_verification

### Decision Fields
- decision (approve/reject/more_info)
- decision_reason
- decided_by
- decided_at
- conditions

## Key Features

✅ Role-based authentication
✅ Multi-step form with validation
✅ Real-time application tracking
✅ AI risk analysis with visual charts
✅ Fraud detection system
✅ Similar case matching
✅ Explainable AI recommendations
✅ Human decision override
✅ Audit trail
✅ Responsive design
✅ Accessible UI (WCAG AA)

## Future Enhancements

- Real backend API integration
- Database persistence
- Real-time notifications
- Advanced analytics dashboard
- Bulk decision processing
- Export/reporting features
- Multi-language support
- Dark mode
