// ===== APP.JS — Shared Utilities =====

// ========================
// NAVIGATION
// ========================
function initNav() {
  const sidebar = document.getElementById('sidebar');
  const hamburger = document.getElementById('hamburger');
  const overlay = document.getElementById('overlay');

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      sidebar.classList.add('open');
      overlay.classList.add('show');
    });
  }

  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('show');
    });
  }

  // Mark active nav link
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-item a');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  updateApiStatus();
}

// ========================
// SETTINGS MODAL
// ========================
function openSettings() {
  const modal = document.getElementById('settingsModal');
  if (modal) {
    modal.classList.add('active');
    document.getElementById('groqKeyInput').value = localStorage.getItem('fw_groq_key') || '';
    document.getElementById('sheetsUrlInput').value = localStorage.getItem('fw_sheets_url') || '';
  }
}

function closeSettings() {
  const modal = document.getElementById('settingsModal');
  if (modal) modal.classList.remove('active');
}

function saveSettings() {
  const key = document.getElementById('groqKeyInput').value.trim();
  const sheetsUrl = document.getElementById('sheetsUrlInput').value.trim();

  if (key) localStorage.setItem('fw_groq_key', key);
  if (sheetsUrl) localStorage.setItem('fw_sheets_url', sheetsUrl);

  closeSettings();
  updateApiStatus();
  showToast('Settings saved successfully!', 'success');
}

function updateApiStatus() {
  const dot = document.getElementById('apiStatusDot');
  const text = document.getElementById('apiStatusText');
  if (!dot || !text) return;

  const hasKey = !!localStorage.getItem('fw_groq_key');
  if (hasKey) {
    dot.className = 'status-dot active';
    text.textContent = 'AI Connected';
  } else {
    dot.className = 'status-dot inactive';
    text.textContent = 'Configure API Key';
  }
}

// ========================
// TOAST NOTIFICATIONS
// ========================
function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle', warning: 'fa-exclamation-triangle' };

  toast.className = `toast ${type}-toast`;
  toast.innerHTML = `
    <i class="fas ${icons[type] || icons.info} toast-icon"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 350);
  }, duration);
}

// ========================
// GROQ AI INTEGRATION
// ========================
async function getGroqAnalysis(systemPrompt, userMessage) {
  const apiKey = localStorage.getItem('fw_groq_key');

  if (!apiKey) {
    showToast('Please configure your Groq API key in Settings.', 'error');
    openSettings();
    return null;
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 900,
        temperature: 0.7,
        stream: false
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || `API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'No response generated.';
  } catch (err) {
    showToast(`AI Error: ${err.message}`, 'error', 5000);
    return null;
  }
}

// ========================
// GOOGLE SHEETS INTEGRATION
// ========================
async function saveToGoogleSheets(rowData) {
  const sheetsUrl = localStorage.getItem('fw_sheets_url');
  if (!sheetsUrl) return;

  try {
    await fetch(sheetsUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...rowData, timestamp: new Date().toISOString() })
    });
    showToast('Data saved to Google Sheets', 'success', 2500);
  } catch (err) {
    console.warn('Google Sheets save failed:', err.message);
  }
}

// ========================
// FORMAT CURRENCY
// ========================
function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

function formatNumber(n) {
  return new Intl.NumberFormat('en-IN').format(Math.round(n));
}

// ========================
// ANIMATED COUNTER
// ========================
function animateCounter(element, target, duration = 1200, prefix = '', suffix = '') {
  const start = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(start + (target - start) * eased);
    element.textContent = prefix + formatNumber(current) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

// ========================
// INIT ON DOM READY
// ========================
document.addEventListener('DOMContentLoaded', () => {
  initNav();

  // Close modal on overlay click
  const settingsModal = document.getElementById('settingsModal');
  if (settingsModal) {
    settingsModal.addEventListener('click', (e) => {
      if (e.target === settingsModal) closeSettings();
    });
  }

  // Keyboard shortcut: Escape closes modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSettings();
  });
});
