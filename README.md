# FinBot - Agentic AI Banking Assistant 🏦

> **Hackathon Submission:** [GenAI Frontiers: App Development using the Gemini API](https://unstop.com/hackathons/genai-frontiers-app-development-using-the-gemini-api-university-institute-of-engineering-chandigarh-universit-1603804)  
> **Team Name:** Envision

## 📖 Project Overview
**LoanMate** is an Agentic AI solution designed to automate the personal loan sales process for NBFCs. Built using the **Google Gemini API**, it acts as a **Master Agent** that intelligently orchestrates multiple specialized **Worker Agents** to handle the end-to-end customer journey—from the initial sales pitch to generating the final sanction letter.

This solution addresses the problem of scaling personalized sales interactions by simulating a human-like executive who can verify identities, assess credit risk, and close deals 24/7.

---

## 🏗️ Agentic AI Architecture
We have implemented the **Master-Worker Agent** pattern as required by the challenge.

### 1. Master Agent (The Orchestrator)
* **Role:** `FinancialAgent` (in `backend/app/agent.py`)
* **Responsibility:** Manages the conversation flow, maintains context, and decides which Worker Agent to trigger based on user intent.
* **Implementation:** Powered by `gemini-flash-latest` with system instructions to switch between personas.

### 2. Worker Agents (The Specialists)
The Master Agent delegates tasks to the following tools:

| Hackathon Role | Our Implementation | Description |
| :--- | :--- | :--- |
| **Sales Agent** | **Market Analyst Persona** | Negotiates terms, discusses needs, and queries the "Offer Mart" (internal database) for best rates. |
| **Verification Agent** | **KYC Officer Persona** | Validates customer identity (Name, PAN, Aadhaar) against a simulated CRM/KYC server. |
| **Underwriting Agent** | **Loan & Approval Persona** | Fetches mock credit scores (out of 900), calculates EMI vs. Salary ratios (max 50%), and determines eligibility. |
| **Sanction Letter Gen** | **Approval Workflow** | Upon successful underwriting, generates the loan terms and issues the approval decision. |
| **(Bonus) Legal Auditor** | **Gemini Vision Agent** | Analyzes uploaded documents (e.g., existing loan agreements) for hidden fees and risks using Gemini's multimodal capabilities. |

---

## 🚀 Key Features
* **Conversational Sales:** Natural, persuasive dialogue driven by Gemini Pro.
* **Real-time Eligibility Check:** Instant calculation of "Pre-approved Limit" vs. "Requested Amount".
* **Document Understanding:** Users can upload salary slips or bank statements; the agent reads and extracts data using **Gemini Vision**.
* **Hybrid Interface:** * **Customer View:** A sleek Next.js Chatbot for the end-user.
    * **Admin/Debug View:** A Streamlit dashboard to visualize the "Agent State" and backend logic.

---

## 🛠️ Tech Stack
* **AI Model:** Google Gemini 2.5 Flash (via `google-generativeai` SDK)
* **Backend:** FastAPI (Python)
* **Frontend:** Next.js 16 (React), Tailwind CSS, Lucide Icons
* **Database/Auth:** Firebase
* **Tools:** Pandas (Data Processing), PyPDF (Document Handling)

---

## ⚙️ Installation & Setup

### Prerequisites
* Node.js (v18+)
* Python (v3.10+)
* Google Gemini API Key

### 1. Backend Setup (FastAPI)
Navigate to the backend folder:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```
The backend runs on ```http://localhost:8000```

### 2. Frontend Setup (Next.js)
Navigate to the backend folder:
```bash
cd frontend/loan-mate
npm install
npm run dev
```
The frontend runs on ```http://localhost:3000```

---
## 📂 Project Structure

```text
GenAI-main
├── backend/
│   ├── app/
│   │   ├── agent.py        # Master Financial Agent Logic
│   │   ├── main.py         # FastAPI Entry Point
│   │   ├── tools/          # Worker Agent Tools (KYC, Loan Math, etc.)
│   │   └── data/           # Mock Bank Data
│   ├── streamlit_app.py    # Admin Dashboard
│   └── requirements.txt
│
└── frontend/loan-mate/
    ├── app/
    │   ├── page.tsx        # Main Chat Interface
    │   ├── dashboard/      # User Dashboard
    │   └── components/     # UI Components
    ├── lib/                # Firebase Config
    └── package.json
```
---
## 👥 Contributors

| Name | GitHub Profile |
| :--- | :--- |
| **Nihal Basaniwal** | [Click Here](https://github.com/nb2912) |
| **Archita Bansal** | [Click Here](https://github.com/archeeetah) |
| **Krish D Shah** | [Click Here](https://github.com/Krishdshah) |
| **Pranjal Garg** | [Click Here](https://github.com/pranjal-garg) |

---

## 📄 Acknowledgement
This project is submitted for the **GenAI Frontiers: App Development using the Gemini API**.
