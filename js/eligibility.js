// ==========================================
// ELIGIBILITY CALCULATOR LOGIC
// ==========================================

let calculatedResults = null;

function checkEligibility() {
  const name = document.getElementById('eName').value.trim();
  const salary = parseFloat(document.getElementById('eSalary').value);
  const score = parseInt(document.getElementById('eScore').value);
  const emi = parseFloat(document.getElementById('eEmi').value);
  const age = parseInt(document.getElementById('eAge').value);

  if (!name || isNaN(salary) || isNaN(score) || isNaN(emi) || isNaN(age)) {
    showToast('Please fill out all fields correctly.', 'warning');
    return;
  }

  // Evaluate individual rules
  const isSalaryValid = salary >= 30000;
  const isScoreValid = score >= 700;
  const isEmiValid = emi < 20000;
  const isAgeValid = age >= 21;

  updateRuleUI('ruleIncome', isSalaryValid);
  updateRuleUI('ruleScore', isScoreValid);
  updateRuleUI('ruleEmi', isEmiValid);
  updateRuleUI('ruleAge', isAgeValid);

  const isEligible = isSalaryValid && isScoreValid && isEmiValid && isAgeValid;
  const eligibleAmount = isEligible ? salary * 20 : 0;

  // Determine Risk Level
  let riskLevel = 'HIGH RISK';
  let riskClass = 'danger-color';
  if (isEligible) {
    if (score >= 750 && salary >= 50000) {
      riskLevel = 'LOW RISK';
      riskClass = 'success-color';
    } else {
      riskLevel = 'MEDIUM RISK';
      riskClass = 'blue-color';
    }
  }

  calculatedResults = {
    name, salary, creditScore: score, existingEmi: emi, age,
    isEligible, eligibleAmount, riskLevel
  };

  // Show Results Panel
  document.getElementById('emptyState').style.display = 'none';
  const panel = document.getElementById('resultPanel');
  panel.className = 'result-panel show ' + (isEligible ? 'approved' : 'rejected');

  document.getElementById('resultIcon').textContent = isEligible ? '🎉' : '❌';
  document.getElementById('resultTitle').textContent = isEligible ? 'Loan Approved' : 'Loan Rejected';
  document.getElementById('resultSubtitle').textContent = isEligible 
    ? 'Congratulations! You meet all rule-based criteria for a loan.' 
    : 'Sorry, you do not meet the minimum criteria required for a loan.';

  // Metrics
  const loanAmountEl = document.getElementById('loanAmount');
  if (isEligible) {
    loanAmountEl.className = 'metric-value success-color';
    animateCounter(loanAmountEl, eligibleAmount, 1000, '₹');
  } else {
    loanAmountEl.className = 'metric-value danger-color';
    loanAmountEl.textContent = '₹0';
  }

  const riskEl = document.getElementById('riskLevel');
  riskEl.textContent = riskLevel;
  riskEl.className = `metric-value ${riskClass}`;

  document.getElementById('displaySalary').textContent = formatINR(salary);
  document.getElementById('displayScore').textContent = score;

  // Reset AI card
  document.getElementById('aiAnalysis').style.display = 'none';
  document.getElementById('aiBtn').disabled = false;

  // Save to Google Sheets if webhook set up
  saveToGoogleSheets({
    type: 'eligibility',
    name,
    salary,
    creditScore: score,
    existingEmi: emi,
    age,
    result: isEligible ? 'Approved' : 'Rejected',
    eligibleAmount,
    riskLevel
  });

  showToast(isEligible ? 'Eligibility check successful!' : 'Application rejected based on rules.', isEligible ? 'success' : 'error');
}

function updateRuleUI(elementId, isValid) {
  const el = document.getElementById(elementId);
  if (!el) return;

  if (isValid) {
    el.className = 'rule-item pass';
    el.innerHTML = '<i class="fas fa-check-circle rule-icon"></i> ' + el.textContent.replace(/^[✗✓●]|\(failed\)|\(passed\)/g, '').trim();
  } else {
    el.className = 'rule-item fail';
    el.innerHTML = '<i class="fas fa-times-circle rule-icon"></i> ' + el.textContent.replace(/^[✗✓●]|\(failed\)|\(passed\)/g, '').trim();
  }
}

async function getEligibilityAI() {
  if (!calculatedResults) return;

  const btn = document.getElementById('aiBtn');
  const aiCard = document.getElementById('aiAnalysis');
  const aiText = document.getElementById('aiText');

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Consulting FinWise AI...';
  aiCard.style.display = 'block';
  aiText.textContent = 'Contacting AI server for custom advice...';

  const sysPrompt = 'You are FinWise AI, an expert financial advisory system. Provide structured, detailed feedback on this applicant eligibility profile. Format using bullet points and short paragraphs. Be precise and suggest exact next steps.';
  
  const userMsg = `
    Applicant Profile:
    - Name: ${calculatedResults.name}
    - Monthly Income: ₹${calculatedResults.salary}
    - Credit Score: ${calculatedResults.creditScore}
    - Existing Monthly EMI: ₹${calculatedResults.existingEmi}
    - Age: ${calculatedResults.age}
    - Rule-based Eligibility: ${calculatedResults.isEligible ? 'APPROVED' : 'REJECTED'}
    - Eligible Loan Amount: ₹${calculatedResults.eligibleAmount}
    - Risk Level: ${calculatedResults.riskLevel}
    
    Please provide:
    1. A brief summary of their financial health.
    2. Recommendations to lower their risk or improve eligibility (if rejected, how can they improve? If approved, how can they leverage this for best terms?).
    3. Suggested next steps for securing a loan with the best possible interest rates in the Indian market.
  `;

  const response = await getGroqAnalysis(sysPrompt, userMsg);
  
  btn.innerHTML = '<i class="fas fa-brain"></i> Get AI Advisory';
  btn.disabled = false;

  if (response) {
    aiText.textContent = response;
  } else {
    aiText.textContent = 'Could not fetch advisory. Check your API settings.';
  }
}

function resetForm() {
  document.getElementById('eligibilityForm').reset();
  
  // Reset rules checklist
  const rules = ['ruleIncome', 'ruleScore', 'ruleEmi', 'ruleAge'];
  const ruleTexts = [
    'Monthly Income exceeds ₹30,000',
    'Credit Score exceeds 700',
    'Existing EMI below ₹20,000',
    'Applicant Age is 21 or older'
  ];
  
  rules.forEach((id, idx) => {
    const el = document.getElementById(id);
    if (el) {
      el.className = 'rule-item';
      el.innerHTML = `<i class="fas fa-circle-notch rule-icon"></i> ${ruleTexts[idx]}`;
    }
  });

  document.getElementById('emptyState').style.display = 'flex';
  document.getElementById('resultPanel').style.display = 'none';
  document.getElementById('resultPanel').classList.remove('show');
  calculatedResults = null;
}
