# 📋 Flying Wonders — Pending Items & Future Roadmap Tracker

This document tracks all completed features, open tasks, and planned items for the **Flying Wonders Web App & B2B Attractions Gateway**.

---

## 🟢 1. Recently Completed Items

- [x] **Supplier Catalog & Multi-SKU Grouping**:
  - Grouped child and adult ticket variants under unified parent attraction cards.
  - Parsed date-specific net rates (`price`) and retail price (`retail_price`).
- [x] **Cebu Portal Options Layout**:
  - Built 2-column detailed attraction modal matching `mobile.attractionsg.com`.
  - Left panel: High-res cover image, attraction title, SKU, HTML Overview & Details, and Terms & Conditions.
  - Right panel: Dynamic Date Picker (hidden for open-date tickets), stacked `[ADULT]` / `[CHILD]` option cards, `- 0 +` counter controls, total price calculation, `Add to Cart`, and `Buy Now` buttons.
- [x] **Live Availability & Date Stock Mapping**:
  - Direct integration with `/ticket/availabilities` endpoint.
  - Displays dynamic **`Remaining: XX`** (green badge) or **`Sold out`** (red badge) placed directly below counter controls.
  - Stepper `+` button automatically caps quantity selection to exact remaining stock.
- [x] **Open Date & Validity Handling**:
  - Automatically hides Date selector for open-date tickets (e.g., *Madame Tussauds Singapore*).
  - Displays formatted validity text (`Valid From 01 Aug 2025 To 31 Oct 2026`) and `MSP $36.00` lines.
- [x] **UI Polish & HTML Reset**:
  - Compacting header hero banner with right-aligned B2B Token Profile box.
  - Added CSS reset to strip dark inline background colors from raw supplier HTML descriptions.
  - Upgraded modal close buttons (`✕` circle icon and bottom `Close Window ✕` button) with high contrast styling.
- [x] **B2B Security & Authentication**:
  - 2-Factor OTP Email Authentication for agent login (`attractionsUser` dataset in Sanity).
  - Restricted live rates and booking controls to verified B2B agent sessions.

---

## ⏳ 2. Outstanding & Pending Technical Tasks

### 📌 A. B2B Flow 2 — Pay-As-You-Go UPI Payment Gateway Integration
- [ ] **Cashfree / UPI Gateway Webhook Setup**:
  - Create `/api/cashfree/verify-order` webhook listener to confirm payment completion in real time.
- [ ] **Automated Booking Trigger**:
  - Upon receiving `PAYMENT_SUCCESS` from Cashfree UPI, automatically invoke Cebu `/order/create` (`use_credits=1`) and `/order/update` (`action=pay`) to generate the PDF voucher instantly.
- [ ] **Admin Markup Rate Configuration**:
  - Build Admin Dashboard setting to configure custom markup percentage (e.g. +3%, +5%) or flat amount per ticket to earn profit directly into your Flying Wonders bank account.

---

### 📌 B. Multi-Item Shopping Cart & Multi-Ticket Checkout
- [ ] **Cart Persistence**:
  - Store multiple attraction items in local state / session cart.
- [ ] **Batch Booking Payload**:
  - Extend `/api/attractions-live/book/route.ts` to submit multi-item payloads (`item_sku_id_1`, `item_sku_id_2`, etc.) to Cebu `/order/create` in a single transaction.

---

### 📌 C. Admin Dashboard & Agent Approval Management
- [ ] **Pending Agent Approval Notification**:
  - Add email/dashboard alert when a new agent registers and is pending manual approval.
- [ ] **Attractions Order History & E-Voucher Ledger**:
  - Create a dedicated "Attractions Orders" tab in `app/admin-dashboard/page.tsx` displaying order reference IDs, customer details, B2B net cost paid, and downloadable PDF links.

---

## 🎯 3. Deployment Checklist
- [ ] Final confirmation from user before executing `git push` to production repository.
- [ ] Verify environment variables on production server (`CEBU_API_KEY`, `CEBU_SECRET_KEY`, `SANITY_WRITE_TOKEN`).
