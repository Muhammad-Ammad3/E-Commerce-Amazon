<div align="center">
  <h1><img src="https://gocart-gs.vercel.app/favicon.ico" width="25" height="25" alt="GoCart Favicon">
    GoCart</h1>
  <p>
    An open-source, full-stack multi-vendor e-commerce platform built with Next.js (App Router), Prisma, and Tailwind CSS.
  </p>
  <p>
    <a href="https://github.com/GreatStackDev/goCart/blob/main/LICENSE.md"><img src="https://img.shields.io/github/license/GreatStackDev/goCart?style=for-the-badge" alt="License"></a>
    <a href="https://github.com/GreatStackDev/goCart/pulls"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge" alt="PRs Welcome"></a>
    <a href="https://github.com/GreatStackDev/goCart/issues"><img src="https://img.shields.io/github/issues/GreatStackDev/goCart?style=for-the-badge" alt="GitHub issues"></a>
  </p>
</div>

---

## 📖 Table of Contents

- [✨ Features](#-features)
- [🛠️ Tech Stack](#-tech-stack)
- [🌐 Admin Access Activation](#-admin-access-activation)
- [🚀 Getting Started](#-getting-started)
- [🤝 Contributing](#-contributing)
- [📜 License](#-license)

---

## ✨ Features <a name="-features"></a>

### 🏢 Multi-Vendor & Role-Based Architecture
- **Super Admin Panel:** A comprehensive control center for platform administrators to oversee global orders, approve/reject products, analyze analytics, and manage vendor metrics.
- **Vendor Dashboards:** Dedicated panels for sellers to create custom stores, manage product inventory, track earnings, and view sales analytics.
- **Customer Storefront:** A beautiful, responsive, and intuitive interface for browsing items, managing a persistent cart, and seamless tracking.

### ⭐ GoCart Plus Membership
- Premium subscription layer integrated via **Clerk Billing** & **Stripe**.
- Features a **1-Month Free Trial** that automatically transitions users into regular billing cycles to incentivize customer onboarding.

### 🤖 AI-Powered Product Creation
- Effortless product management using an built-in **AI Content Generator**.
- Vendors just upload a product image, and the AI instantly writes optimized, high-converting Product Names, detailed Descriptions, and suggests the ideal Pricing!

### 🎟️ Marketing & Core E-Commerce Logic
- **Dynamic Coupons:** Administrators can generate and manage custom promotion codes with real-time checkout validation.
- **Secure Gateways:** Native **Stripe API** integration for smooth checkout flows and secure transaction processing.
- **Real-Time Consistency:** Instant inventory deductions and continuous updates upon successful order placement.

---

## 🛠️ Tech Stack <a name="-tech-stack"></a>

- **Framework:** Next.js (App Router) & React 19
- **Database & ORM:** Prisma ORM with Neon PostgreSQL
- **Authentication & Billing:** Clerk Auth & Clerk Billing
- **Payment Processing:** Stripe API
- **State Management:** Redux Toolkit (for optimized UI caching and local cart syncing)
- **Styling & UI:** Tailwind CSS & ShadCN UI

---

## 🌐 Admin Access Activation <a name="-admin-access-activation"></a>

If you would like to explore the **Super Admin Panel** or testing features:
1. Sign up/Sign in to the live deployment link of **GoCart**.
2. Open an issue on this repository or reach out with your registered name/email.
3. I will manually grant your profile **Admin Privileges** so you can interact with live analytics, product approvals, and subscription logs.

---

## 🚀 Getting Started <a name="-getting-started"></a>

First, install the dependencies. We recommend using `npm` for this project.

```bash
npm install