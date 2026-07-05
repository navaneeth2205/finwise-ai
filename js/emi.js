// ==========================================
// EMI CALCULATOR LOGIC
// ==========================================

let emiResults = null;

function setTenure(months) {
  const input = document.getElementById('eTenure');
  if (input) input.value = months;
}

function calculateEMI() {
  const principal = parseFloat(document.getElementById('ePrincipal').value);
  const annualRate = parseFloat(document.getElementById('eRate').value);
  const tenure = parseInt(document.getElementById('eTenure').value);

  if (isNaN(principal) || isNaN(annualRate) || isNaN(tenure) || principal <= 0 || annualRate <= 0 || tenure <= 0) {
    showToast('Please enter valid positive values for all parameters.', 'warning');
    return;
  }

  // Monthly interest rate
  const monthlyRate = (annualRate / 12) / 100;

  // EMI calculation using standard formula
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1);
  const totalPayment = emi * tenure;
  const totalInterest = totalPayment - principal;

  // Save for AI usage
  emiResults = { principal, annualRate, tenure, emi, totalPayment, totalInterest };

  // UI Updates
  document.getElementById('emiEmpty').style.display = 'none';
  document.getElementById('emiResult').style.display = 'block';

  const emiEl = document.getElementById('monthlyEmi');
  animateCounter(emiEl, emi, 1000, '₹');

  // Breakdown values
  document.getElementById('breakPrincipal').textContent = formatINR(principal);
  document.getElementById('breakInterest').textContent = formatINR(totalInterest);
  document.getElementById('breakTotal').textContent = formatINR(totalPayment);

  // Interest Percentage split
  const interestPct = (totalInterest / totalPayment) * 100;
  const principalPct = 100 - interestPct;

  document.getElementById('interestPct').textContent = `${interestPct.toFixed(1)}% Interest Split`;
  
  const bar = document.getElementById('principalBar');
  bar.style.width = `${principalPct}%`;

  // Hide AI card & reset schedule
  document.getElementById('emiAI').style.display = 'none';
  document.getElementById('scheduleContainer').style.display = 'none';
  document.getElementById('aiBtn').disabled = false;
  document.getElementById('aiBtn').innerHTML = '<i class="fas fa-brain"></i> Optimize with AI';

  // Push to Sheets
  saveToGoogleSheets({
    type: 'emi',
    principal,
    rate: annualRate,
    tenure,
    emi,
    totalPayment,
    totalInterest
  });

  showToast('EMI calculated successfully!', 'success');
}

function toggleSchedule() {
  const container = document.getElementById('scheduleContainer');
  if (!container || !emiResults) return;

  if (container.style.display === 'block') {
    container.style.display = 'none';
    return;
  }

  // Generate schedule rows
  const body = document.getElementById('scheduleBody');
  body.innerHTML = '';

  let balance = emiResults.principal;
  const monthlyRate = (emiResults.annualRate / 12) / 100;
  const emi = emiResults.emi;

  // Render first 12 months (or tenure if smaller) for layout consistency
  const monthsToRender = Math.min(emiResults.tenure, 60); 

  for (let m = 1; m <= monthsToRender; m++) {
    const interestPaid = balance * monthlyRate;
    const principalPaid = emi - interestPaid;
    balance -= principalPaid;

    const row = document.createElement('tr');
    row.style.borderBottom = '1px solid rgba(255,255,255,0.03)';
    row.innerHTML = `
      <td style="padding:8px;">${m}</td>
      <td style="padding:8px;">${formatINR(principalPaid)}</td>
      <td style="padding:8px; color:var(--danger);">${formatINR(interestPaid)}</td>
      <td style="padding:8px;">${formatINR(Math.max(0, balance))}</td>
    `;
    body.appendChild(row);
  }

  container.style.display = 'block';
  showToast('Showing amortization schedule details', 'info');
}

async function getEmiAI() {
  if (!emiResults) return;

  const btn = document.getElementById('aiBtn');
  const aiCard = document.getElementById('emiAI');
  const aiText = document.getElementById('aiText');

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Analyzing EMI savings...';
  aiCard.style.display = 'block';
  aiText.textContent = 'Generating optimization advisory...';

  const sysPrompt = 'You are FinWise AI, an expert loan auditor. Suggest strategies for prepayment, tenure adjustments and interest savings in India. Format with bullet points.';
  
  const userMsg = `
    Loan Profile:
    - Principal: ₹${emiResults.principal}
    - Annual Rate: ${emiResults.annualRate}%
    - Tenure: ${emiResults.tenure} months
    - Calculated EMI: ₹${emiResults.emi.toFixed(2)}
    - Total Interest Outgo: ₹${emiResults.totalInterest.toFixed(2)}
    
    Please provide:
    1. A loan assessment (is the interest load reasonable relative to the principal?).
    2. An optimization scenario: If the applicant makes an annual prepayment equal to one monthly EMI, how much interest and tenure could they save?
    3. Actionable repayment tips to minimize financial burden.
  `;

  const response = await getGroqAnalysis(sysPrompt, userMsg);
  
  btn.innerHTML = '<i class="fas fa-brain"></i> Optimize with AI';
  btn.disabled = false;

  if (response) {
    aiText.textContent = response;
  } else {
    aiText.textContent = 'Could not generate optimization insights. Check Settings.';
  }
}

function resetEmi() {
  document.getElementById('emiForm').reset();
  document.getElementById('emiEmpty').style.display = 'flex';
  document.getElementById('emiResult').style.display = 'none';
  emiResults = null;
}
