// ==========================================
// CREDIT SCORE ANALYZER LOGIC
// ==========================================

let currentScore = 700;

document.addEventListener('DOMContentLoaded', () => {
  const slider = document.getElementById('scoreSlider');
  const manualInput = document.getElementById('scoreInput');
  const display = document.getElementById('scoreDisplay');

  if (slider && manualInput && display) {
    // Sync slider -> input & display
    slider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      currentScore = val;
      display.textContent = val;
      manualInput.value = val;
      updateScoreColor(val);
    });

    // Sync input -> slider & display
    manualInput.addEventListener('input', (e) => {
      let val = parseInt(e.target.value);
      if (isNaN(val)) return;
      if (val < 300) val = 300;
      if (val > 900) val = 900;
      
      currentScore = val;
      display.textContent = val;
      slider.value = val;
      updateScoreColor(val);
    });
    
    // Set initial value colors
    updateScoreColor(700);
    manualInput.value = 700;
  }
});

function updateScoreColor(score) {
  const display = document.getElementById('scoreDisplay');
  if (!display) return;

  if (score >= 750) {
    display.style.color = 'var(--success)';
  } else if (score >= 650) {
    display.style.color = 'var(--warning)';
  } else {
    display.style.color = 'var(--danger)';
  }
}

function analyzeScore() {
  const score = currentScore;

  let category = 'POOR';
  let badgeClass = 'badge-danger';
  let progressClass = 'danger';
  let gradientColor = 'var(--danger)';
  let desc = 'Poor credit history. Loan approval is highly unlikely without secure collateral.';
  let recs = [];

  if (score >= 750) {
    category = 'EXCELLENT';
    badgeClass = 'badge-success';
    progressClass = 'success';
    gradientColor = 'var(--success)';
    desc = 'Superb credit worthiness! You qualify for premier interest rates and fast approvals.';
    recs = [
      { icon: 'fa-shield-halved', title: 'Maintain your score', desc: 'Keep credit utilization under 30% and monitor your monthly reports.' },
      { icon: 'fa-percentage', title: 'Negotiate interest rates', desc: 'Use your excellent score to demand lower processing fees and interest rates.' },
      { icon: 'fa-credit-card', title: 'Premium credit cards', desc: 'You are eligible for rewards-heavy metal cards with high limits.' }
    ];
  } else if (score >= 650) {
    category = 'GOOD';
    badgeClass = 'badge-warning';
    progressClass = 'warning';
    gradientColor = 'var(--warning)';
    desc = 'Decent credit score. Standard loan rates apply, but you have room to improve.';
    recs = [
      { icon: 'fa-clock', title: 'Pay bills on time', desc: 'Ensure all credit card bills and EMI payments are made before the due date.' },
      { icon: 'fa-chart-pie', title: 'Reduce utilization ratio', desc: 'Try to pay off card balances early to lower your revolving credit ratio.' },
      { icon: 'fa-ban', title: 'Avoid new inquiries', desc: 'Minimize hard inquiries by not applying for multiple cards or loans simultaneously.' }
    ];
  } else {
    category = 'POOR';
    badgeClass = 'badge-danger';
    progressClass = 'danger';
    gradientColor = 'var(--danger)';
    desc = 'Suboptimal credit score. High risk category. You must rebuild your repayment records.';
    recs = [
      { icon: 'fa-exclamation-triangle', title: 'Critical repayments', desc: 'Clear outstanding defaults immediately and setup automated auto-debits.' },
      { icon: 'fa-wallet', title: 'Secured credit cards', desc: 'Get a credit card against a fixed deposit (FD) and make small timely payments.' },
      { icon: 'fa-file-invoice', title: 'Review credit report', desc: 'Check for reporting errors or duplicate records and raise disputes on CIBIL.' }
    ];
  }

  // Display Panel Setup
  document.getElementById('emptyState').style.display = 'none';
  const panel = document.getElementById('scoreResult');
  panel.style.display = 'block';

  // Badge & Title
  const badge = document.getElementById('scoreBadge');
  badge.textContent = category;
  badge.className = `badge ${badgeClass}`;

  document.getElementById('scoreCategory').textContent = `${category} Score Category`;
  document.getElementById('ringValue').textContent = score;

  // Conic-gradient mapping: CIBIL is 300 to 900.
  // Percentage = (score - 300) / 600 * 100
  const percentage = ((score - 300) / 600) * 100;
  const scoreRing = document.getElementById('scoreRing');
  scoreRing.style.background = `conic-gradient(${gradientColor} 0% ${percentage}%, rgba(255, 255, 255, 0.05) ${percentage}% 100%)`;

  // Progress Bar
  const pBar = document.getElementById('scoreProgressBar');
  pBar.className = `progress-fill ${progressClass}`;
  pBar.style.width = `${percentage}%`;

  // Recommendations
  const container = document.getElementById('recsContainer');
  container.innerHTML = '';
  recs.forEach(rec => {
    const card = document.createElement('div');
    card.className = 'rec-card';
    card.innerHTML = `
      <div class="rec-icon" style="background: rgba(255,255,255,0.04); color: ${gradientColor};">
        <i class="fas ${rec.icon}"></i>
      </div>
      <div class="rec-content">
        <h4>${rec.title}</h4>
        <p>${rec.desc}</p>
      </div>
    `;
    container.appendChild(card);
  });

  // Reset AI response card
  document.getElementById('creditAI').style.display = 'none';
  const aiBtn = document.getElementById('aiBtn');
  aiBtn.disabled = false;
  aiBtn.innerHTML = '<i class="fas fa-brain"></i> Ask AI for Tips';

  // Push to Sheets
  saveToGoogleSheets({
    type: 'credit',
    creditScore: score,
    category
  });

  showToast(`Credit score analysis completed: ${category}`, 'info');
}

async function getCreditAI() {
  const btn = document.getElementById('aiBtn');
  const aiCard = document.getElementById('creditAI');
  const aiText = document.getElementById('aiText');

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> FinWise AI generating plan...';
  aiCard.style.display = 'block';
  aiText.textContent = 'Analyzing credit parameters...';

  const sysPrompt = 'You are FinWise AI, an expert CIBIL consultant. Suggest specific, credit-improvement actions tailored to Indian citizens. Format with bullet points.';
  const userMsg = `
    Analyze this credit score:
    - Score: ${currentScore}
    - Category: ${currentScore >= 750 ? 'EXCELLENT' : currentScore >= 650 ? 'GOOD' : 'POOR'}
    
    Please provide:
    1. A detailed explanation of why this score is categorized as such.
    2. A monthly milestone timeline (Month 1-3, Month 4-6) to improve/maintain this score.
    3. Critical warnings about activities that could lower their CIBIL score.
  `;

  const response = await getGroqAnalysis(sysPrompt, userMsg);
  
  btn.innerHTML = '<i class="fas fa-brain"></i> Ask AI for Tips';
  btn.disabled = false;

  if (response) {
    aiText.textContent = response;
  } else {
    aiText.textContent = 'Could not generate AI strategy. Check Settings.';
  }
}
