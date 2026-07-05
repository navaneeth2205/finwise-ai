# FinWise AI 🏦
### Intelligent Loan Eligibility, Credit Analysis & Financial Advisory Platform

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Groq AI](https://img.shields.io/badge/Groq_AI-Free-brightgreen?style=flat)
![Google Sheets](https://img.shields.io/badge/Google_Sheets-34A853?style=flat&logo=google-sheets&logoColor=white)

---

## 📌 Project Overview

**FinWise AI** is a smart, AI-powered BFSI (Banking, Financial Services & Insurance) web platform built to simplify financial decision-making. It provides users with intelligent loan eligibility analysis, credit score evaluation, EMI calculation, and AI-generated financial guidance — all within a single, responsive web interface.

This project was developed as part of the **SmartBridge Vibe Coding Internship (SIP 2026)** at **SRM University AP**.

---

## 👨‍💻 Developed By

| Name | Role |
|------|------|
| Jainesh Bharti | Frontend + AI Integration |
| Navneeth Biyyapu| Frontend + Google Sheets Integration |
| Vishnu Vardhana Reddy Paluvai | Frontend + UI Development |

---

## 🚀 Features

- ✅ **Loan Eligibility Checker** — Rule-based validation to check loan approval status
- ✅ **Credit Score Analyzer** — Classifies credit profile into Excellent / Good / Poor
- ✅ **EMI Calculator** — Uses standard reducing-balance EMI formula
- ✅ **Groq AI Integration** — Personalized financial advice using Groq API (free)
- ✅ **Google Sheets Integration** — Serverless data storage via Google Apps Script
- ✅ **Glassmorphism UI** — Modern fintech-inspired responsive design
- ✅ **Mobile Responsive** — Works across desktop, tablet, and mobile devices

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| HTML5 | Page structure |
| CSS3 | Glassmorphism styling, animations, responsive layout |
| Vanilla JavaScript | Form validation, calculations, DOM manipulation, API calls |
| Groq AI | AI-powered financial recommendations (free API) |
| Google Apps Script | Serverless backend & data storage |
| Google Sheets | Database for storing user eligibility results |
| GitHub Pages | Deployment & hosting |

---

## 📁 Project Structure

```
finwise-ai/
│
├── index.html          # Landing page
├── eligibility.html    # Loan Eligibility Checker
├── credit-score.html   # Credit Score Analyzer
├── emi.html            # EMI Calculator
├── tips.html           # AI Financial Tips
│
├── css/
│   └── style.css       # Main stylesheet
│
├── js/
│   └── script.js       # JavaScript logic
│
└── google-apps-script.gs  # Google Sheets backend
```

---

## 💡 How It Works

1. User enters financial details (name, salary, credit score, EMI, age)
2. JavaScript validates and processes the data using business rules
3. Groq AI generates personalized financial recommendations
4. Results are displayed dynamically without page reload
5. Data is stored in Google Sheets via Apps Script POST request

---

## 📊 Loan Eligibility Rules

| Condition | Threshold |
|-----------|-----------|
| Monthly Salary | > ₹30,000 |
| Credit Score | > 700 |
| Existing EMI | < ₹20,000 |
| Applicant Age | ≥ 21 years |

**Eligible Loan Amount = Monthly Salary × 20**

---

## 🌐 Deployment

The application is deployed using **GitHub Pages** (static hosting — no backend server required).

🔗 **Live Link:** [https://jaineshbharti5.github.io/finwise-ai](https://jaineshbharti5.github.io/finwise-ai)

---

## 📚 Internship Details

- **Program:** SmartBridge Vibe Coding Internship — SIP 2026
- **University:** SRM University AP
- **Project:** FinWise AI — Intelligent Loan Eligibility, Credit Analysis & Financial Advisory Platform
