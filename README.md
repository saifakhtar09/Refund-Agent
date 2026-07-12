# Refund Agent 🤖

An AI-powered customer support agent for e-commerce refunds, built with **Next.js 15**, **TypeScript**, and the **Gemini API**. The agent doesn't just chat — it looks up the customer, retrieves the order, validates it against a real refund policy, and makes an approve/deny decision with full, auditable reasoning.

![Tech Stack](https://img.shields.io/badge/Next.js-15-black) ![TypeScript](https://img.shields.io/badge/TypeScript-blue) ![Gemini API](https://img.shields.io/badge/AI-Gemini%20API-4285F4) ![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC)

---

## 📖 Overview

Refund Agent simulates a real-world SaaS support tool. A customer describes their refund request in natural language on the left-hand chat panel; on the right, an **admin reasoning dashboard** shows every step the AI takes in real time — searching the customer record, pulling the order, checking it against the refund policy, and explaining its final decision.

The AI never guesses. Every claim it makes is backed by a tool call against the mock CRM data and the written refund policy, so decisions are consistent, explainable, and traceable.

---

## ✨ Features

- **Conversational refund chat** — a ChatGPT/Intercom-style interface for customers to ask about orders and request refunds
- **Live AI reasoning log** — real-time view of tool calls (`searching customer...`, `checking order...`, `checking refund policy...`, `decision: approved/denied`)
- **Policy-grounded decisions** — every approval/denial is checked against a written refund policy (14-day window, product condition, category-specific rules, manager approval thresholds, etc.)
- **Mock CRM** — 15 realistic customer/order profiles used as the agent's source of truth
- **Admin dashboard** — decision history, policy checks, success/error states, and retry logs
- **Robust error handling** — friendly messages for missing customers, invalid orders, API timeouts, and tool failures
- **Modern UI** — responsive layout, dark mode, loading states, typing indicators, and toast notifications

---

## 🖼️ 



| Chat | Reasoning Log |
|---|---|
| `docs/screenshot-chat.png` | `docs/screenshot-log.png` |

---

## 🚀 Installation

**Prerequisites:** Node.js 18+ and npm

```bash
# Clone the repo
git clone https://github.com/saifakhtar09/Refund-Agent.git
cd Refund-Agent

# Install dependencies
npm install

# Set up environment variables (see below)
cp .env.example .env.local

# Run the dev server
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Environment Variables

Create a `.env.local` file in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | API key used by the agent backend to call the Gemini API for reasoning and decision-making |

> ⚠️ Never commit `.env.local` — it's already excluded via `.gitignore`.

---

## 🏗️ Architecture

```
┌─────────────┐        ┌──────────────────┐        ┌───────────────┐
│  Customer   │ ─────▶ │   Chat Interface   │ ─────▶ │  API Route     │
│   (Chat)    │        │  (React / Next.js) │        │ /api/agent     │
└─────────────┘        └──────────────────┘        └───────┬───────┘
                                                             │
                                                             ▼
                                                    ┌────────────────┐
                                                    │   AI Agent      │
                                                    │  (Gemini API)   │
                                                    └───────┬────────┘
                                                             │
                             ┌───────────────────────────────┼───────────────────────────────┐
                             ▼                                ▼                               ▼
                     ┌───────────────┐              ┌──────────────────┐            ┌──────────────────┐
                     │ findCustomer() │              │ checkRefundPolicy()│          │ calculateEligibility()│
                     │  getOrder()    │              │  (Markdown rules)  │          │ approveRefund()/     │
                     └───────────────┘              └──────────────────┘            │ denyRefund()          │
                                                                                      └──────────┬─────────┘
                                                                                                  ▼
                                                                                          ┌────────────────┐
                                                                                          │  logDecision()  │
                                                                                          │  → Admin Log    │
                                                                                          └────────────────┘
```

Each tool call is streamed to the admin dashboard in real time, so the reasoning chain is fully visible — not a black box.

---

## 🔮 Future Improvements

- [ ] Voice input/output using the OpenAI Realtime API, ElevenLabs, or LiveKit
- [ ] Persistent database (e.g. PostgreSQL/Supabase) in place of mock JSON data
- [ ] Multi-agent handoff for escalations requiring manager approval
- [ ] Analytics dashboard for refund trends and approval rates
- [ ] Authentication for the admin dashboard
- [ ] Automated test suite (unit + integration)

---

## 🛠️ Built With

- [Next.js 15](https://nextjs.org/) — App Router
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Gemini API](https://ai.google.dev/) — agent reasoning & decision-making
- [Framer Motion](https://www.framer.com/motion/) — animations
- [Lucide React](https://lucide.dev/) — icons

---

## 📄 License

This project is available for educational and demonstration purposes.
