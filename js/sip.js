// ==========================================
// SIP CALCULATOR LOGIC
// ==========================================

let sipResults = null;
let sipChartInstance = null;

function calculateSIP() {
  const monthlyStr = document.getElementById('sMonthly').value.replace(/,/g, '');
  const monthly = parseFloat(monthlyStr);
  const annualRate = parseFloat(document.getElementById('sRate').value);
  const years = parseInt(document.getElementById('sYears').value);

  if (isNaN(monthly) || isNaN(annualRate) || isNaN(years) || monthly <= 0 || annualRate <= 0 || years <= 0) {
    showToast('Please enter valid positive values.', 'warning');
    return;
  }

  const months = years * 12;
  const monthlyRate = annualRate / 12 / 100;
  
  // SIP Formula: M = P × ({[1 + i]n – 1} / i) × (1 + i).
  const futureValue = monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
  const investedAmount = monthly * months;
  const estReturns = futureValue - investedAmount;

  sipResults = { monthly, annualRate, years, investedAmount, estReturns, futureValue };

  // UI Updates
  document.getElementById('sipEmpty').style.display = 'none';
  document.getElementById('sipResult').style.display = 'block';

  const wealthEl = document.getElementById('totalWealth');
  animateCounter(wealthEl, futureValue, 1200, '₹');

  document.getElementById('investedAmt').textContent = formatINR(investedAmount);
  document.getElementById('wealthGained').textContent = formatINR(estReturns);

  // Render Chart.js
  const ctx = document.getElementById('sipChart');
  if (ctx) {
    if (sipChartInstance) {
      sipChartInstance.destroy();
    }
    sipChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Invested Amount', 'Estimated Returns'],
        datasets: [{
          data: [investedAmount, estReturns],
          backgroundColor: ['#60a5fa', '#22c55e'],
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        cutout: '75%'
      }
    });
  }

  // Reset AI card
  document.getElementById('sipAI').style.display = 'none';
  document.getElementById('aiBtn').disabled = false;
  document.getElementById('aiBtn').innerHTML = '<i class="fas fa-brain"></i> Get AI Advisory';

  // Push to Sheets (optional, using generic type)
  saveToGoogleSheets({
    type: 'sip',
    monthly,
    rate: annualRate,
    years,
    investedAmount,
    estReturns,
    futureValue
  });

  showToast('SIP calculated successfully!', 'success');
}

async function getSipAI() {
  if (!sipResults) return;

  const btn = document.getElementById('aiBtn');
  const aiCard = document.getElementById('sipAI');
  const aiText = document.getElementById('aiText');

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Consulting FinWise AI...';
  aiCard.style.display = 'block';
  aiText.textContent = 'Generating investment strategy...';

  const sysPrompt = 'You are FinWise AI, an expert mutual fund and investment advisor in India. Provide concise, structured advice on SIP investments. Format with bullet points.';
  
  const userMsg = `
    Investment Profile:
    - Monthly SIP: ₹${sipResults.monthly}
    - Expected Rate: ${sipResults.annualRate}%
    - Duration: ${sipResults.years} years
    - Projected Wealth: ₹${sipResults.futureValue.toFixed(2)}
    
    Please provide:
    1. A brief assessment of this investment strategy.
    2. Recommendations on what type of mutual funds (e.g., Large Cap, Mid Cap, Index) usually align with this return rate in the Indian market.
    3. Actionable tips to maximize compounding and handle market volatility.
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

function resetSip() {
  document.getElementById('sipForm').reset();
  document.getElementById('sipEmpty').style.display = 'flex';
  document.getElementById('sipResult').style.display = 'none';
  sipResults = null;
}
