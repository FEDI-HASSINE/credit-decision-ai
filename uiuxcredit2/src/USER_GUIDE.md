# Credit Decision AI - User Guide

## Quick Start

### Login
1. Open the application
2. Select your role: **Client** or **Banker**
3. Enter credentials (demo credentials provided on login screen)
4. Click **Sign In**

---

## For Clients

### Submitting a Credit Application

1. **Login as Client**
   - Email: client@example.com
   - Password: password

2. **Navigate to Application Form**
   - Click "New Application" button
   - You'll enter a 4-step wizard

3. **Step 1: Personal Information**
   - Full name, email, phone
   - Marital status
   - Number of children
   - Housing status
   - Click "Next"

4. **Step 2: Financial Details**
   - Loan amount requested
   - Loan duration (months)
   - Monthly income
   - Other income sources
   - Monthly charges
   - Employment type
   - Contract type
   - Seniority years
   - Click "Next"

5. **Step 3: Upload Documents**
   - Salary slip (last 3 months)
   - Bank statement (last 6 months)
   - Employment contract
   - Click on each section to upload files
   - Accepted formats: PDF, JPG, PNG
   - Click "Next"

6. **Step 4: Review**
   - Review all entered information
   - Click "Submit Application"

### Tracking Your Application

1. After submission, you'll see the **Application Status** page
2. View your application timeline:
   - ✅ Application Submitted
   - ✅ Document Verification
   - 🔵 AI Risk Analysis (current)
   - ⏳ Banker Review
   - ⏳ Final Decision

3. Check the **Loan Summary** card for key details
4. Monitor the **Expected Timeline** sidebar
5. You'll receive notifications when status changes

---

## For Bankers

### Reviewing Applications

1. **Login as Banker**
   - Email: banker@bank.com
   - Password: password

2. **Dashboard Overview**
   - View metrics: Pending Review, Average Risk Score, Fraud Alerts, Total Volume
   - Use filters to find specific applications:
     - Search by name or case ID
     - Filter by status (Pending, Under Review, Approved, Rejected)
     - Filter by risk level (Low, Medium, High)

3. **Review a Case**
   - Click "Review" button on any application
   - You'll be taken to the detailed Case Detail page

### Understanding AI Analysis

The Case Detail page shows analysis from 6 AI agents:

#### 1. Risk Analysis Agent
- **Overall Risk Score**: 0-100% scale
- **Risk Level**: Low, Medium, or High
- **Confidence**: How confident the AI is
- **Category Breakdown**: Bar chart showing risk across:
  - Income Stability
  - Debt Ratio
  - Employment
  - Credit History
  - Behavioral Factors

#### 2. Fraud Detection Agent
- **Fraud Flag**: Yes/No indicator
- **Fraud Score**: 0-100% likelihood
- **Verification Checks**:
  - Document consistency
  - Income verification
  - Identity verification
  - Address verification
- Each check shows: Pass/Fail/Suspicious + Confidence %

#### 3. Similar Cases Agent
- **Similarity Score**: How similar this is to historical cases
- **Top Similar Cases**: Cards showing:
  - Case ID and similarity %
  - Loan details
  - Outcome (Approved/Rejected)
  - Payment status (Repaid/Defaulted)
  - Final outcome description
- Click "Explore All Similar Cases" for deep dive

#### 4. Behavior Agent
- **Assessment**: Positive/Neutral/Negative
- **Confidence Level**
- **Factors Analyzed**:
  - Payment history pattern
  - Credit utilization
  - Account age
  - Recent inquiries

#### 5. Document Verification Agent
- **Status**: Verified/Issues Found/Pending
- **Individual Document Status**:
  - Salary slip
  - Bank statement
  - Employment contract
- Shows confidence % and any issues found

#### 6. Explanation Agent (Most Important!)
- **AI Recommendation**: Approve or Reject
- **Confidence %**
- **Strengths**: Positive factors ✓
- **Weaknesses**: Areas of concern ⚠
- **Red Flags**: Critical issues ✕
- **Suggested Mitigations**: Actions to reduce risk →

### Exploring Similar Cases

1. Click "Explore All Similar Cases" from Case Detail
2. View statistics:
   - Average Similarity
   - Total Cases Found
   - Approval Rate
   - Default Rate

3. Use advanced filters:
   - Loan amount range (min/max)
   - Outcome (approved/rejected)
   - Defaulted status (yes/no)

4. Click "View Details" on any case to see:
   - Full application details
   - Risk score
   - Payment history
   - Final outcome

### Making a Decision

1. From Case Detail page, click **"Make Decision"**

2. Choose your decision:
   - ✅ **Approve**: Grant the loan
   - ❌ **Reject**: Deny the loan
   - ⚠️ **More Info**: Request additional information

3. Provide **Decision Reason** (minimum 50 characters)
   - This will be shared with the applicant
   - Be clear and professional

4. Set **Confidence Level** (1-10 scale)
   - How confident are you in this decision?

5. Add **Conditions/Notes** (optional)
   - "Higher interest rate recommended"
   - "Co-signer required"
   - "Additional documentation needed"

6. **Override Warning**
   - If your decision differs from AI recommendation, you'll see a warning
   - Ensure your reasoning is well-documented

7. Click **Submit Decision**

8. **Confirmation Dialog**
   - Review all details
   - Click "Confirm & Submit" to finalize
   - This action is **final and cannot be undone**

### Dashboard Filters

**Search**: Enter case ID or client name
**Status Filter**: 
- All Statuses
- Pending
- Under Review
- Approved
- Rejected

**Risk Filter**:
- All Risk Levels
- Low Risk (< 30%)
- Medium Risk (30-60%)
- High Risk (> 60%)

### Understanding Risk Levels

- 🟢 **Low Risk (0-29%)**: Strong candidate, likely approval
- 🟡 **Medium Risk (30-59%)**: Requires careful review
- 🔴 **High Risk (60-100%)**: Significant concerns, likely rejection

### Fraud Indicators

- 🚨 **Red Triangle Icon**: Fraud detected
- Review the Fraud Agent section carefully
- Check which verification checks failed
- Consider rejecting immediately if fraud is confirmed

### Best Practices

1. **Always review all AI agent outputs** before making a decision
2. **Check similar cases** to understand historical patterns
3. **Document your reasoning** clearly and professionally
4. **Pay attention to red flags** especially fraud indicators
5. **Use the confidence score** to indicate decision certainty
6. **Override AI carefully** - ensure strong justification
7. **Add conditions** when approving marginal cases
8. **Review debt-to-income ratio** - should be < 40% ideally

### Interpreting Metrics

**Debt-to-Income Ratio**:
- < 30%: 🟢 Excellent
- 30-40%: 🟡 Acceptable
- > 40%: 🔴 Concerning

**Credit Score**:
- 750+: Excellent
- 700-749: Good
- 650-699: Fair
- < 650: Poor

**Employment**:
- Full-time + Permanent = Best
- Part-time or Temporary = Higher risk
- Self-employed = Requires extra verification

---

## Tips for Success

### For Clients
- ✅ Provide accurate information
- ✅ Upload clear, legible documents
- ✅ Check your application status regularly
- ✅ Respond quickly if more information is requested

### For Bankers
- ✅ Review all AI analysis sections
- ✅ Compare with similar historical cases
- ✅ Document decisions thoroughly
- ✅ Override AI only with strong justification
- ✅ Use filters to prioritize high-risk or fraud-flagged cases
- ✅ Set appropriate confidence levels

---

## Common Scenarios

### Scenario 1: Strong Applicant
- Low risk score (< 30%)
- No fraud flags
- Good credit score (700+)
- Stable employment
- Similar cases show positive outcomes
→ **Likely APPROVE**

### Scenario 2: Marginal Applicant
- Medium risk score (30-60%)
- No fraud flags
- Fair credit score (650-699)
- Some weaknesses noted
- Mixed similar case outcomes
→ **Consider APPROVE with conditions** or **REQUEST MORE INFO**

### Scenario 3: High Risk Applicant
- High risk score (> 60%)
- Possible fraud flags
- Poor credit score (< 650)
- Multiple red flags
- Similar cases show defaults
→ **Likely REJECT**

### Scenario 4: Fraud Detected
- Fraud flag raised
- Document inconsistencies
- Failed verification checks
→ **REJECT immediately** and escalate to compliance

---

## Support

For questions or issues:
- Review the AI Explanation Agent's summary
- Check similar historical cases for guidance
- Consult your supervisor for complex cases
- Use the confidence score to indicate uncertainty

## Security Notes

- All decisions are logged and auditable
- Document verification is automated but should be manually reviewed
- Fraud alerts require immediate attention
- Personal data is handled according to banking regulations
