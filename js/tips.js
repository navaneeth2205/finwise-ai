// ==========================================
// AI ADVISORY TIPS LOGIC
// ==========================================

let lastAdviceResponse = '';
let lastAdviceQuery = '';

document.addEventListener('DOMContentLoaded', () => {
  loadHistory();
});

function setQuickPrompt(text) {
  const area = document.getElementById('tQuestion');
  if (area) {
    area.value = text;
    showToast('Prompt filled! Scroll and generate report.', 'info', 2000);
  }
}

async function getAITips() {
  const income = parseFloat(document.getElementById('tIncome').value);
  const score = parseInt(document.getElementById('tScore').value);
  const emi = parseFloat(document.getElementById('tEmi').value);
  const savings = parseFloat(document.getElementById('tSavings').value);
  const age = parseInt(document.getElementById('tAge').value);
  const goal = document.getElementById('tGoal').value;
  const question = document.getElementById('tQuestion').value.trim();

  if (isNaN(income) || isNaN(score) || isNaN(emi) || isNaN(savings) || isNaN(age) || !question) {
    showToast('Please fill out all fields correctly.', 'warning');
    return;
  }

  const btn = document.getElementById('tipsBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Running Llama 3.3 Financial Planner...';

  document.getElementById('tipsEmpty').style.display = 'none';
  const panel = document.getElementById('tipsResponse');
  panel.style.display = 'block';

  const outputText = document.getElementById('aiOutputText');
  outputText.textContent = 'Analyzing financial profile and planning portfolio...';

  const systemPrompt = `You are FinWise AI, an expert financial advisory system. Provide structured, detailed feedback on this applicant financial goals. Format using bullet points and short paragraphs. Be precise and suggest exact next steps. Always use ₹ for currency.`;

  const userMessage = `
    User Financial Profile:
    - Monthly Income: ₹${income}
    - Credit Score: ${score}
    - Monthly EMI Burden: ₹${emi}
    - Monthly Savings Capacity: ₹${savings}
    - Age: ${age}
    - Primary Financial Goal: ${goal}
    
    Question/Situation:
    "${question}"
    
    Please output a comprehensive, structured financial advice report covering:
    1. Financial health summary (Debt-to-Income, Savings Rate evaluations).
    2. Strategic optimization tailored for the specified Goal (${goal}).
    3. Actionable investment channels (FD, ELSS, Mutual Funds, SIP, PPF) based on monthly savings.
    4. Exact timeline milestones.
  `;

  const response = await getGroqAnalysis(systemPrompt, userMessage);

  btn.disabled = false;
  btn.innerHTML = '<i class="fas fa-magic"></i> Generate AI Advisor Report';

  if (response) {
    lastAdviceResponse = response;
    lastAdviceQuery = question;
    
    document.getElementById('adviceTime').textContent = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    typewriterEffect(outputText, response, 4);

    saveToHistory(question, response);
  } else {
    outputText.textContent = 'Could not generate advice. Verify your API configuration in settings.';
  }
}

function typewriterEffect(element, text, speed = 8) {
  element.textContent = '';
  let i = 0;
  
  function type() {
    if (i < text.length) {
      // Type a chunk of characters if text is very long to prevent it from taking too much time
      const chunkSize = text.length > 500 ? 4 : 1; 
      element.textContent += text.substr(i, chunkSize);
      i += chunkSize;
      setTimeout(type, speed);
    }
  }
  
  type();
}

// ========================
// HISTORY SYSTEM
// ========================
function saveToHistory(query, answer) {
  let history = JSON.parse(localStorage.getItem('fw_tips_history') || '[]');
  
  // Prevent duplicate consecutive entries
  if (history.length > 0 && history[0].query === query) return;

  history.unshift({
    timestamp: new Date().toLocaleString('en-IN'),
    query,
    answer
  });

  // Limit to last 5 entries
  if (history.length > 5) history.pop();

  localStorage.setItem('fw_tips_history', JSON.stringify(history));
  loadHistory();
}

function loadHistory() {
  const container = document.getElementById('historyList');
  if (!container) return;

  const history = JSON.parse(localStorage.getItem('fw_tips_history') || '[]');
  container.innerHTML = '';

  if (history.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted); font-size:12px; text-align:center;">No recent advisory sessions found.</p>';
    return;
  }

  history.forEach((item, idx) => {
    const itemEl = document.createElement('div');
    itemEl.className = 'rec-card';
    itemEl.style.padding = '12px 14px';
    itemEl.innerHTML = `
      <div style="flex:1;">
        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
          <span style="font-size:11px; font-weight:600; color:var(--accent-blue-light);">${item.timestamp}</span>
        </div>
        <p style="font-size:12.5px; color:var(--text-primary); font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:240px;">${item.query}</p>
      </div>
      <button class="btn btn-ghost btn-sm" onclick="viewHistoryItem(${idx})" style="padding:4px 10px; font-size:11px;"><i class="fas fa-eye"></i> View</button>
    `;
    container.appendChild(itemEl);
  });
}

function viewHistoryItem(index) {
  const history = JSON.parse(localStorage.getItem('fw_tips_history') || '[]');
  const item = history[index];
  if (!item) return;

  document.getElementById('tipsEmpty').style.display = 'none';
  const panel = document.getElementById('tipsResponse');
  panel.style.display = 'block';

  document.getElementById('adviceTime').textContent = item.timestamp.split(', ')[1] || '';
  const outputText = document.getElementById('aiOutputText');
  outputText.textContent = item.answer;

  lastAdviceResponse = item.answer;
  lastAdviceQuery = item.query;

  showToast('Loaded query from history', 'info');
}

function clearHistory() {
  localStorage.removeItem('fw_tips_history');
  loadHistory();
  showToast('Advisory history cleared', 'info');
}

function copyAdvice() {
  if (!lastAdviceResponse) return;
  navigator.clipboard.writeText(lastAdviceResponse);
  showToast('Advisory report copied to clipboard!', 'success');
}

function saveAdvice() {
  if (!lastAdviceResponse) return;
  
  const blob = new Blob([`FINWISE AI FINANCIAL ADVISORY REPORT\nGenerated: ${new Date().toLocaleString()}\nQuery: ${lastAdviceQuery}\n\n${lastAdviceResponse}`], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `FinWise-AI-Advisory-${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showToast('Downloading report file...', 'success');
}
