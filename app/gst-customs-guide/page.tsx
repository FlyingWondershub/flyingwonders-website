"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Calculator,
  Globe,
  Plane,
  FileText,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Printer,
  Share2,
  MessageCircle,
  X,
  Phone,
  Link as LinkIcon,
  Clock,
  Smartphone,
  Info
} from "lucide-react";

export default function GSTCustomsGuide() {
  // Theme State
  const [isDark, setIsDark] = useState(false);
  
  useEffect(() => {
    // Check initial dark mode
    if (typeof window !== "undefined") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      setIsDark(media.matches);
      const listener = (e: MediaQueryListEvent) => setIsDark(e.matches);
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    }
  }, []);

  const theme = {
    bg: isDark ? "#0F172A" : "#F8FAFC",
    cardBg: isDark ? "#1E293B" : "#FFFFFF",
    text: isDark ? "#F1F5F9" : "#0F172A",
    textMuted: isDark ? "#94A3B8" : "#475569",
    border: isDark ? "#334155" : "#E2E8F0",
    brand: "#0F4C3A",
    accent: "#059669",
    accentLight: isDark ? "rgba(5, 150, 105, 0.2)" : "#D1FAE5",
    red: isDark ? "#F87171" : "#EF4444",
    redLight: isDark ? "rgba(239, 68, 68, 0.2)" : "#FEE2E2",
    amber: isDark ? "#FBBF24" : "#F59E0B",
    amberLight: isDark ? "rgba(245, 158, 11, 0.2)" : "#FEF3C7",
    inputBg: isDark ? "#0F172A" : "#FFFFFF",
  };

  // Rates State
  const [rates, setRates] = useState({ sgd: 62.5, aed: 22.5 });

  useEffect(() => {
    async function fetchRates() {
      try {
        const res = await fetch("/api/exchange-rate");
        if (res.ok) {
          const data = await res.json();
          if (data.rate) {
            setRates((prev) => ({ ...prev, sgd: data.rate }));
          }
        }
      } catch (err) {
        console.error("Failed to fetch exchange rates", err);
      }
    }
    fetchRates();
  }, []);

  // Floating Bar State
  const [showFloatingBar, setShowFloatingBar] = useState(false);
  const [floatingDismissed, setFloatingDismissed] = useState(false);
  const calculatorsRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (floatingDismissed) return;
    
    const handleScroll = () => {
      if (calculatorsRef.current) {
        const rect = calculatorsRef.current.getBoundingClientRect();
        // Show if scrolled past calculators
        if (rect.bottom < 0) {
          setShowFloatingBar(true);
        } else {
          setShowFloatingBar(false);
        }
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [floatingDismissed]);

  // Tabbed Calculators State
  const [activeTab, setActiveTab] = useState(1);

  // Tab 1: GST/VAT Refund
  const [refundCountry, setRefundCountry] = useState<"SG" | "AE">("SG");
  const [shoppingAmount, setShoppingAmount] = useState<number | "">("");
  const [handlingFeePct, setHandlingFeePct] = useState(2);
  const [refundMethod, setRefundMethod] = useState<"card" | "cash" | "alipay">("card");

  const calcRefund = () => {
    const amt = typeof shoppingAmount === "number" ? shoppingAmount : 0;
    const rate = refundCountry === "SG" ? 0.09 : 0.05; // 9% SG, 5% AE
    // In SG, 9% is inclusive in the displayed price, so GST = Price - (Price / 1.09)
    // Wait, typical simplified refund calc: GST is 9%. Price = 109%. GST = Price * 9/109
    const gstAmt = amt * (rate / (1 + rate)); 
    const handlingFee = gstAmt * (handlingFeePct / 100);
    let extraFee = 0;
    if (refundCountry === "SG" && refundMethod === "cash") extraFee = 100; // Mock flat fee if cash? Actually usually it's just a %. Let's ignore flat fee for simplicity.
    const netRefund = Math.max(0, gstAmt - handlingFee - extraFee);
    const inrEq = netRefund * (refundCountry === "SG" ? rates.sgd : rates.aed);
    const effDiscount = amt > 0 ? (netRefund / amt) * 100 : 0;
    
    return {
      gstAmt,
      handlingFee,
      netRefund,
      inrEq,
      effDiscount
    };
  };
  const refundData = calcRefund();

  // Tab 2: Customs Duty
  const [arrivingFrom, setArrivingFrom] = useState<"SG" | "AE" | "Other">("SG");
  const [customsValue, setCustomsValue] = useState<number | "">("");
  const [customsGoldGrams, setCustomsGoldGrams] = useState<number | "">("");
  const [customsGender, setCustomsGender] = useState<"M" | "F">("M");
  
  const calcCustoms = () => {
    const val = typeof customsValue === "number" ? customsValue : 0;
    const gold = typeof customsGoldGrams === "number" ? customsGoldGrams : 0;
    
    const limit = arrivingFrom === "AE" ? 15000 : 50000;
    const excess = Math.max(0, val - limit);
    
    const dutyRate = 0.385; // 38.5%
    const dutyPayable = excess * dutyRate;
    
    // Gold
    const goldLimit = customsGender === "M" ? 20 : 40;
    const goldLimitVal = customsGender === "M" ? 50000 : 100000;
    // Simplified gold duty
    let goldDuty = 0;
    if (gold > goldLimit) {
        // Flat 15% on total value of gold assuming ~7500 INR/g
        const goldVal = gold * 7500;
        const excessGoldVal = Math.max(0, goldVal - goldLimitVal);
        goldDuty = excessGoldVal * 0.15;
    }

    const recommendChannel = (excess > 0 || gold > goldLimit) ? "Red" : "Green";

    return {
      limit,
      excess,
      dutyPayable,
      goldDuty,
      recommendChannel
    };
  };
  const customsData = calcCustoms();

  // Tab 3: Buy Where
  type ProductKey = "iPhone 16 Pro Max" | "MacBook Air M4" | "Apple Watch Ultra 2" | "PS5" | "Samsung Galaxy S25 Ultra" | "Dyson Airwrap" | "10g Gold Chain 24K" | "Custom";
  const [buyProduct, setBuyProduct] = useState<ProductKey>("iPhone 16 Pro Max");
  
  const presets: Record<string, { sgd: number, aed: number, inr: number }> = {
    "iPhone 16 Pro Max": { sgd: 1999, aed: 5399, inr: 144900 },
    "MacBook Air M4": { sgd: 1799, aed: 4799, inr: 124900 },
    "Apple Watch Ultra 2": { sgd: 1199, aed: 3199, inr: 89900 },
    "PS5": { sgd: 729, aed: 1999, inr: 54990 },
    "Samsung Galaxy S25 Ultra": { sgd: 1898, aed: 5099, inr: 134999 },
    "Dyson Airwrap": { sgd: 799, aed: 2199, inr: 45900 },
    "10g Gold Chain 24K": { sgd: 1050, aed: 2800, inr: 75000 },
    "Custom": { sgd: 0, aed: 0, inr: 0 },
  };

  const [customPrices, setCustomPrices] = useState({ sgd: 0, aed: 0, inr: 0 });
  const p = buyProduct === "Custom" ? customPrices : presets[buyProduct];

  const calcBuyWhere = () => {
    const sgdRefundRate = 0.09 / 1.09;
    const aedRefundRate = 0.05 / 1.05;
    
    // SG Net cost
    const sgdGst = p.sgd * sgdRefundRate;
    const sgdNetCostSgd = p.sgd - (sgdGst * 0.8); // Assuming 20% handling fee
    const sgdCostInr = sgdNetCostSgd * rates.sgd;
    
    // AE Net cost
    const aedVat = p.aed * aedRefundRate;
    const aedNetCostAed = p.aed - (aedVat * 0.85); // Assuming 15% handling fee
    const aedCostInr = aedNetCostAed * rates.aed;
    
    const costs = [
      { country: "India", cost: p.inr },
      { country: "Singapore", cost: sgdCostInr },
      { country: "Dubai", cost: aedCostInr },
    ];
    
    costs.sort((a, b) => a.cost - b.cost);
    const winner = costs[0].country;
    const savings = costs[2].cost - costs[0].cost;

    return { sgdCostInr, aedCostInr, winner, savings };
  };
  const buyData = calcBuyWhere();

  // Tab 4: Currency
  const [currInr, setCurrInr] = useState<number | "">("");
  const [currUsdCash, setCurrUsdCash] = useState<number | "">("");
  const [currUsdTc, setCurrUsdTc] = useState<number | "">("");

  const calcCurrency = () => {
    const inr = typeof currInr === "number" ? currInr : 0;
    const cash = typeof currUsdCash === "number" ? currUsdCash : 0;
    const tc = typeof currUsdTc === "number" ? currUsdTc : 0;
    const totalUsd = cash + tc;
    
    const inrOk = inr <= 25000;
    const cashOk = cash <= 5000;
    const totalOk = totalUsd <= 10000;
    
    const declare = !inrOk || !cashOk || !totalOk;
    
    return { inrOk, cashOk, totalOk, declare };
  };
  const currData = calcCurrency();

  // Scenarios and FAQs State
  const [openScenario, setOpenScenario] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const formatInr = (num: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);

  const formatCurr = (num: number, curr: string) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: curr, maximumFractionDigits: 2 }).format(num);


  return (
    <div style={{ fontFamily: "var(--font-inter), sans-serif", backgroundColor: theme.bg, color: theme.text, minHeight: "100vh" }}>
      {/* 1. Compact Title Bar */}
      <div style={{ 
        height: "60px", 
        backgroundColor: theme.brand, 
        color: "#FFF",
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        position: "sticky",
        top: 0,
        zIndex: 50,
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        justifyContent: "space-between",
        gap: "10px",
        overflowX: "auto",
        whiteSpace: "nowrap"
      }}>
        <h1 style={{ fontFamily: "var(--font-playfair), serif", fontSize: "clamp(16px, 4vw, 20px)", margin: 0, fontWeight: 600 }}>
          GST Refund & India Customs Duty Guide
        </h1>
        <div style={{ display: "flex", gap: "10px" }}>
          {["Calculators", "GST Refund", "Customs Duty", "Checklist"].map((item) => (
            <a key={item} href={`#${item.toLowerCase().replace(" ", "-")}`} style={{
              backgroundColor: "rgba(255,255,255,0.15)",
              padding: "4px 12px",
              borderRadius: "20px",
              fontSize: "12px",
              color: "#FFF",
              textDecoration: "none",
              fontWeight: 500,
              transition: "background 0.2s"
            }}>
              {item}
            </a>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
        
        {/* 2. FOUR TABBED CALCULATORS */}
        <section id="calculators" ref={calculatorsRef} style={{
          backgroundColor: theme.cardBg,
          borderRadius: "16px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
          marginBottom: "30px",
          overflow: "hidden",
          border: `1px solid ${theme.border}`
        }}>
          {/* Tabs Header */}
          <div style={{ display: "flex", borderBottom: `1px solid ${theme.border}`, overflowX: "auto" }}>
            {[
              { id: 1, label: "GST/VAT Refund", icon: Calculator },
              { id: 2, label: "Customs Duty", icon: Plane },
              { id: 3, label: "Buy Where?", icon: Globe },
              { id: 4, label: "Currency Checker", icon: FileText },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                flex: 1,
                minWidth: "150px",
                padding: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                backgroundColor: activeTab === tab.id ? theme.bg : "transparent",
                border: "none",
                borderBottom: activeTab === tab.id ? `3px solid ${theme.accent}` : "3px solid transparent",
                color: activeTab === tab.id ? theme.accent : theme.textMuted,
                fontWeight: activeTab === tab.id ? 600 : 500,
                cursor: "pointer",
                fontSize: "14px"
              }}>
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tabs Content */}
          <div style={{ padding: "24px" }}>
            
            {/* Tab 1: GST/VAT */}
            {activeTab === 1 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
                <div>
                  <h3 style={{ marginTop: 0, marginBottom: "16px", color: theme.text }}>Calculate Your Refund</h3>
                  
                  <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
                    <button onClick={() => setRefundCountry("SG")} style={{
                      flex: 1, padding: "10px", borderRadius: "8px", border: `1px solid ${refundCountry === "SG" ? theme.accent : theme.border}`,
                      backgroundColor: refundCountry === "SG" ? theme.accentLight : "transparent", color: theme.text, cursor: "pointer", fontWeight: 500
                    }}>
                      🇸🇬 Singapore (9% GST)
                    </button>
                    <button onClick={() => setRefundCountry("AE")} style={{
                      flex: 1, padding: "10px", borderRadius: "8px", border: `1px solid ${refundCountry === "AE" ? theme.accent : theme.border}`,
                      backgroundColor: refundCountry === "AE" ? theme.accentLight : "transparent", color: theme.text, cursor: "pointer", fontWeight: 500
                    }}>
                      🇦🇪 Dubai (5% VAT)
                    </button>
                  </div>

                  <label style={{ display: "block", marginBottom: "16px", fontSize: "14px", color: theme.text }}>
                    Shopping Amount ({refundCountry === "SG" ? "SGD" : "AED"})
                    <input type="number" value={shoppingAmount} onChange={(e) => setShoppingAmount(parseFloat(e.target.value) || "")} 
                      style={{ width: "100%", padding: "10px", marginTop: "4px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "16px" }} />
                  </label>

                  <label style={{ display: "block", marginBottom: "16px", fontSize: "14px", color: theme.text }}>
                    Handling Fee % (Average is ~2%)
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "4px" }}>
                      <input type="range" min="0" max="5" step="0.5" value={handlingFeePct} onChange={(e) => setHandlingFeePct(parseFloat(e.target.value))} style={{ flex: 1 }} />
                      <span style={{ width: "40px", fontWeight: 600 }}>{handlingFeePct}%</span>
                    </div>
                  </label>

                  <label style={{ display: "block", marginBottom: "16px", fontSize: "14px", color: theme.text }}>
                    Refund Method
                    <select value={refundMethod} onChange={(e: any) => setRefundMethod(e.target.value)} 
                      style={{ width: "100%", padding: "10px", marginTop: "4px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "16px" }}>
                      <option value="card" style={{ backgroundColor: theme.inputBg, color: theme.text }}>Credit Card (Recommended)</option>
                      <option value="cash" style={{ backgroundColor: theme.inputBg, color: theme.text }}>Cash (Higher Fees)</option>
                      <option value="alipay" style={{ backgroundColor: theme.inputBg, color: theme.text }}>Alipay</option>
                    </select>
                  </label>
                </div>

                <div style={{ backgroundColor: theme.bg, padding: "24px", borderRadius: "12px", border: `1px solid ${theme.border}` }}>
                  <h3 style={{ marginTop: 0, marginBottom: "20px", color: theme.text }}>Refund Breakdown</h3>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", color: theme.textMuted }}>
                    <span>Gross {refundCountry === "SG" ? "GST" : "VAT"} Amount:</span>
                    <span>{formatCurr(refundData.gstAmt, refundCountry === "SG" ? "SGD" : "AED")}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", color: theme.red }}>
                    <span>Handling Fees:</span>
                    <span>- {formatCurr(refundData.handlingFee, refundCountry === "SG" ? "SGD" : "AED")}</span>
                  </div>
                  
                  <div style={{ height: "1px", backgroundColor: theme.border, margin: "16px 0" }}></div>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px" }}>
                    <span style={{ fontSize: "16px", fontWeight: 600, color: theme.text }}>Net Refund:</span>
                    <span style={{ fontSize: "24px", fontWeight: 700, color: theme.accent }}>
                      {formatCurr(refundData.netRefund, refundCountry === "SG" ? "SGD" : "AED")}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px" }}>
                    <span style={{ fontSize: "14px", color: theme.textMuted }}>In Indian Rupees:</span>
                    <span style={{ fontSize: "16px", fontWeight: 600, color: theme.text }}>
                      ~ {formatInr(refundData.inrEq)}
                    </span>
                  </div>
                  
                  <div style={{ backgroundColor: theme.accentLight, padding: "12px", borderRadius: "8px", textAlign: "center", color: theme.brand, fontWeight: 500, fontSize: "14px" }}>
                    Effective Discount: {refundData.effDiscount.toFixed(1)}% off your purchase
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Customs Duty */}
            {activeTab === 2 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
                <div>
                  <h3 style={{ marginTop: 0, marginBottom: "16px", color: theme.text }}>Customs Duty Estimator</h3>
                  
                  <label style={{ display: "block", marginBottom: "16px", fontSize: "14px", color: theme.text }}>
                    Arriving From
                    <select value={arrivingFrom} onChange={(e: any) => setArrivingFrom(e.target.value)} 
                      style={{ width: "100%", padding: "10px", marginTop: "4px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "16px" }}>
                      <option value="SG" style={{ backgroundColor: theme.inputBg, color: theme.text }}>Singapore (₹50k Allowance)</option>
                      <option value="AE" style={{ backgroundColor: theme.inputBg, color: theme.text }}>Dubai/UAE (₹15k Allowance)</option>
                      <option value="Other" style={{ backgroundColor: theme.inputBg, color: theme.text }}>Other Country</option>
                    </select>
                  </label>

                  <label style={{ display: "block", marginBottom: "16px", fontSize: "14px", color: theme.text }}>
                    Total Goods Value (INR)
                    <input type="number" placeholder="e.g. 80000" value={customsValue} onChange={(e) => setCustomsValue(parseFloat(e.target.value) || "")} 
                      style={{ width: "100%", padding: "10px", marginTop: "4px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "16px" }} />
                  </label>
                  
                  <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
                    <label style={{ flex: 1, fontSize: "14px", color: theme.text }}>
                      Gold Weight (Grams)
                      <input type="number" placeholder="0" value={customsGoldGrams} onChange={(e) => setCustomsGoldGrams(parseFloat(e.target.value) || "")} 
                        style={{ width: "100%", padding: "10px", marginTop: "4px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "16px" }} />
                    </label>
                    <label style={{ flex: 1, fontSize: "14px", color: theme.text }}>
                      Passenger Gender
                      <select value={customsGender} onChange={(e: any) => setCustomsGender(e.target.value)} 
                        style={{ width: "100%", padding: "10px", marginTop: "4px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "16px" }}>
                        <option value="M" style={{ backgroundColor: theme.inputBg, color: theme.text }}>Male</option>
                        <option value="F" style={{ backgroundColor: theme.inputBg, color: theme.text }}>Female</option>
                      </select>
                    </label>
                  </div>
                </div>

                <div style={{ backgroundColor: theme.bg, padding: "24px", borderRadius: "12px", border: `1px solid ${theme.border}` }}>
                  <h3 style={{ marginTop: 0, marginBottom: "20px", color: theme.text }}>Duty Breakdown</h3>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px", color: theme.text }}>
                    <span>Duty-Free Allowance:</span>
                    <span>{formatInr(customsData.limit)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px", color: theme.text }}>
                    <span>Value Exceeding Limit:</span>
                    <span>{formatInr(customsData.excess)}</span>
                  </div>
                  
                  <div style={{ height: "1px", backgroundColor: theme.border, margin: "16px 0" }}></div>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <span style={{ fontSize: "16px", fontWeight: 600, color: theme.text }}>General Duty (38.5%):</span>
                    <span style={{ fontSize: "20px", fontWeight: 700, color: theme.red }}>
                      {formatInr(customsData.dutyPayable)}
                    </span>
                  </div>
                  {customsData.goldDuty > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <span style={{ fontSize: "16px", fontWeight: 600, color: theme.text }}>Gold Duty (15%):</span>
                      <span style={{ fontSize: "20px", fontWeight: 700, color: theme.red }}>
                        {formatInr(customsData.goldDuty)}
                      </span>
                    </div>
                  )}

                  <div style={{ marginTop: "24px", padding: "16px", borderRadius: "8px", 
                    backgroundColor: customsData.recommendChannel === "Red" ? theme.redLight : theme.accentLight,
                    border: `1px solid ${customsData.recommendChannel === "Red" ? theme.red : theme.accent}`
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600, color: customsData.recommendChannel === "Red" ? theme.red : theme.accent, marginBottom: "4px" }}>
                      {customsData.recommendChannel === "Red" ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
                      Walk through the {customsData.recommendChannel} Channel
                    </div>
                    <p style={{ margin: 0, fontSize: "13px", color: theme.text }}>
                      {customsData.recommendChannel === "Red" 
                        ? "You have exceeded your duty-free allowance. You must declare your goods." 
                        : "You are within your duty-free allowance limits."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Buy Where? */}
            {activeTab === 3 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <div>
                  <h3 style={{ marginTop: 0, marginBottom: "16px", color: theme.text }}>Compare Prices</h3>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: theme.text }}>Select Product</label>
                  <select value={buyProduct} onChange={(e: any) => setBuyProduct(e.target.value)} 
                    style={{ width: "100%", maxWidth: "400px", padding: "10px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "16px", marginBottom: "8px" }}>
                    {Object.keys(presets).map(k => (
                      <option key={k} value={k} style={{ backgroundColor: theme.inputBg, color: theme.text }}>{k}</option>
                    ))}
                  </select>
                  <p style={{ margin: 0, fontSize: "12px", color: theme.textMuted }}>Prices as of Sep 2025. Includes estimated tax refunds.</p>
                </div>

                {buyProduct === "Custom" && (
                  <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                    <label style={{ flex: 1, minWidth: "120px", fontSize: "14px", color: theme.text }}>Price in SGD <input type="number" value={customPrices.sgd} onChange={e => setCustomPrices({...customPrices, sgd: parseFloat(e.target.value)||0})} style={{ width: "100%", padding: "8px", marginTop: "4px", backgroundColor: theme.inputBg, color: theme.text, border: `1px solid ${theme.border}` }} /></label>
                    <label style={{ flex: 1, minWidth: "120px", fontSize: "14px", color: theme.text }}>Price in AED <input type="number" value={customPrices.aed} onChange={e => setCustomPrices({...customPrices, aed: parseFloat(e.target.value)||0})} style={{ width: "100%", padding: "8px", marginTop: "4px", backgroundColor: theme.inputBg, color: theme.text, border: `1px solid ${theme.border}` }} /></label>
                    <label style={{ flex: 1, minWidth: "120px", fontSize: "14px", color: theme.text }}>Price in INR <input type="number" value={customPrices.inr} onChange={e => setCustomPrices({...customPrices, inr: parseFloat(e.target.value)||0})} style={{ width: "100%", padding: "8px", marginTop: "4px", backgroundColor: theme.inputBg, color: theme.text, border: `1px solid ${theme.border}` }} /></label>
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                  {[
                    { country: "India (MRP)", price: p.inr, flag: "🇮🇳" },
                    { country: "Singapore (Net)", price: buyData.sgdCostInr, flag: "🇸🇬" },
                    { country: "Dubai (Net)", price: buyData.aedCostInr, flag: "🇦🇪" },
                  ].map(c => {
                    const isWinner = c.country.includes(buyData.winner);
                    return (
                      <div key={c.country} style={{
                        padding: "20px", borderRadius: "12px", 
                        backgroundColor: isWinner ? theme.accentLight : theme.bg,
                        border: `2px solid ${isWinner ? theme.accent : theme.border}`,
                        position: "relative"
                      }}>
                        {isWinner && <div style={{ position: "absolute", top: "-12px", right: "16px", backgroundColor: theme.accent, color: "#fff", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold" }}>WINNER</div>}
                        <div style={{ fontSize: "24px", marginBottom: "8px" }}>{c.flag}</div>
                        <div style={{ fontSize: "14px", color: theme.textMuted, marginBottom: "4px" }}>{c.country}</div>
                        <div style={{ fontSize: "24px", fontWeight: 700, color: theme.text }}>{formatInr(c.price)}</div>
                      </div>
                    )
                  })}
                </div>
                
                <div style={{ textAlign: "center", padding: "16px", backgroundColor: theme.bg, borderRadius: "8px", fontSize: "16px", fontWeight: 600, color: theme.text }}>
                  Max Savings: <span style={{ color: theme.accent }}>{formatInr(buyData.savings)}</span>
                </div>
              </div>
            )}

            {/* Tab 4: Currency */}
            {activeTab === 4 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
                <div>
                  <h3 style={{ marginTop: 0, marginBottom: "16px", color: theme.text }}>Currency Declaration</h3>
                  <label style={{ display: "block", marginBottom: "16px", fontSize: "14px", color: theme.text }}>
                    Indian Currency Carried (INR)
                    <input type="number" placeholder="₹" value={currInr} onChange={e => setCurrInr(parseFloat(e.target.value)|| "")} 
                      style={{ width: "100%", padding: "10px", marginTop: "4px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "16px" }} />
                  </label>
                  <label style={{ display: "block", marginBottom: "16px", fontSize: "14px", color: theme.text }}>
                    Foreign Currency Cash (USD Equivalent)
                    <input type="number" placeholder="$" value={currUsdCash} onChange={e => setCurrUsdCash(parseFloat(e.target.value)|| "")} 
                      style={{ width: "100%", padding: "10px", marginTop: "4px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "16px" }} />
                  </label>
                  <label style={{ display: "block", marginBottom: "16px", fontSize: "14px", color: theme.text }}>
                    Traveler's Cheques (USD Equivalent)
                    <input type="number" placeholder="$" value={currUsdTc} onChange={e => setCurrUsdTc(parseFloat(e.target.value)|| "")} 
                      style={{ width: "100%", padding: "10px", marginTop: "4px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: "16px" }} />
                  </label>
                </div>

                <div style={{ backgroundColor: theme.bg, padding: "24px", borderRadius: "12px", border: `1px solid ${theme.border}` }}>
                  <h3 style={{ marginTop: 0, marginBottom: "20px", color: theme.text }}>Status</h3>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: theme.text }}>INR Limit: ₹25,000</div>
                    </div>
                    {currData.inrOk ? <span style={{ color: theme.accent, display: "flex", alignItems:"center", gap:"4px" }}><CheckCircle2 size={16}/> Within</span> : <span style={{ color: theme.red, display: "flex", alignItems:"center", gap:"4px" }}><XCircle size={16}/> Over</span>}
                  </div>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: theme.text }}>Foreign Cash Limit: US$5,000</div>
                    </div>
                    {currData.cashOk ? <span style={{ color: theme.accent, display: "flex", alignItems:"center", gap:"4px" }}><CheckCircle2 size={16}/> Within</span> : <span style={{ color: theme.red, display: "flex", alignItems:"center", gap:"4px" }}><XCircle size={16}/> Over</span>}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: theme.text }}>Total Forex Limit: US$10,000</div>
                    </div>
                    {currData.totalOk ? <span style={{ color: theme.accent, display: "flex", alignItems:"center", gap:"4px" }}><CheckCircle2 size={16}/> Within</span> : <span style={{ color: theme.red, display: "flex", alignItems:"center", gap:"4px" }}><XCircle size={16}/> Over</span>}
                  </div>

                  <div style={{ padding: "16px", borderRadius: "8px", 
                    backgroundColor: currData.declare ? theme.redLight : theme.accentLight,
                    border: `1px solid ${currData.declare ? theme.red : theme.accent}`,
                    textAlign: "center"
                  }}>
                    <div style={{ fontWeight: 600, color: currData.declare ? theme.red : theme.accent, marginBottom: "4px" }}>
                      Declaration Required: {currData.declare ? "YES" : "NO"}
                    </div>
                    {currData.declare && (
                      <div style={{ fontSize: "13px", color: theme.text }}>
                        You must fill out the Currency Declaration Form (CDF) upon arrival.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 3. CTA 1 */}
        <div style={{ 
          backgroundColor: theme.cardBg, 
          borderRadius: "12px", 
          padding: "20px", 
          marginBottom: "40px", 
          borderLeft: `6px solid ${theme.accent}`,
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px"
        }}>
          <p style={{ margin: 0, fontSize: "16px", color: theme.text, flex: "1 1 300px", fontWeight: 500 }}>
            💡 Planning a Singapore or Dubai trip? Our travel consultants handle everything — flights, hotels, visa, and customs advice included.
          </p>
          <Link href="/travel-consulting" style={{
            backgroundColor: theme.brand,
            color: "#FFF",
            padding: "12px 24px",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: 600,
            whiteSpace: "nowrap"
          }}>
            🗓️ Book Free Consultation
          </Link>
        </div>

        {/* 4. Singapore GST Refund Guide */}
        <section id="gst-refund" style={{ marginBottom: "50px" }}>
          <h2 style={{ fontFamily: "var(--font-playfair), serif", fontSize: "28px", color: theme.text, marginBottom: "24px", borderBottom: `2px solid ${theme.accent}`, paddingBottom: "8px", display: "inline-block" }}>
            🇸🇬 Singapore GST Refund Guide (9%)
          </h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", marginBottom: "24px" }}>
            <div style={{ backgroundColor: theme.cardBg, padding: "24px", borderRadius: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <h3 style={{ marginTop: 0, color: theme.text, display: "flex", alignItems: "center", gap: "8px" }}><CheckCircle2 color={theme.accent} /> Eligibility Checklist</h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, color: theme.text, fontSize: "15px" }}>
                <li style={{ marginBottom: "12px", display: "flex", gap: "8px" }}>✅ <span>Min SGD 100 spent (max 3 same-day receipts per store)</span></li>
                <li style={{ marginBottom: "12px", display: "flex", gap: "8px" }}>✅ <span>Shop participates in eTRS (look for logo)</span></li>
                <li style={{ marginBottom: "12px", display: "flex", gap: "8px" }}>✅ <span>Departing within 2 months of purchase</span></li>
                <li style={{ marginBottom: "12px", display: "flex", gap: "8px" }}>✅ <span>Physical goods only (no meals/services)</span></li>
                <li style={{ display: "flex", gap: "8px" }}>✅ <span>Non-resident of Singapore (tourist)</span></li>
              </ul>
            </div>
            
            <div style={{ backgroundColor: theme.cardBg, padding: "24px", borderRadius: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <h3 style={{ marginTop: 0, color: theme.text, display: "flex", alignItems: "center", gap: "8px" }}><Clock color={theme.accent} /> Refund Methods</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ padding: "12px", backgroundColor: theme.bg, borderRadius: "8px", border: `1px solid ${theme.border}` }}>
                  <strong>💳 Credit Card (Best)</strong>
                  <div style={{ fontSize: "13px", color: theme.textMuted }}>Takes 10 days, lowest fees, safest.</div>
                </div>
                <div style={{ padding: "12px", backgroundColor: theme.bg, borderRadius: "8px", border: `1px solid ${theme.border}` }}>
                  <strong>💵 Cash</strong>
                  <div style={{ fontSize: "13px", color: theme.textMuted }}>Instant, but highest processing fees.</div>
                </div>
                <div style={{ padding: "12px", backgroundColor: theme.bg, borderRadius: "8px", border: `1px solid ${theme.border}` }}>
                  <strong>📱 Alipay / WeChat</strong>
                  <div style={{ fontSize: "13px", color: theme.textMuted }}>Instant, good exchange rates for INR via apps.</div>
                </div>
              </div>
            </div>
          </div>

          <h3 style={{ color: theme.text, marginBottom: "16px" }}>Step-by-Step Process</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            {[
              { num: 1, title: "At the Shop", desc: "Present your passport. Ask for eTRS transaction. They will issue a digital eTRS token to your passport." },
              { num: 2, title: "At the Airport", desc: "Go to eTRS kiosks in T1-T4 BEFORE check-in if items are oversized/liquids. Scan passport." },
              { num: 3, title: "Customs Inspection", desc: "If kiosk says 'Approved', proceed. If it says 'To Customs', show goods to the officer nearby." },
              { num: 4, title: "Get Refund", desc: "Choose refund method on kiosk. If cash, collect it past immigration at Central Refund Counter." },
            ].map(step => (
              <div key={step.num} style={{ backgroundColor: theme.cardBg, padding: "20px", borderRadius: "12px", borderTop: `4px solid ${theme.brand}`, boxShadow: "0 2px 6px rgba(0,0,0,0.04)" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: theme.accentLight, color: theme.brand, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", marginBottom: "12px" }}>{step.num}</div>
                <h4 style={{ margin: "0 0 8px 0", color: theme.text }}>{step.title}</h4>
                <p style={{ margin: 0, fontSize: "14px", color: theme.textMuted, lineHeight: 1.5 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Dubai VAT Refund Guide */}
        <section style={{ marginBottom: "50px" }}>
          <h2 style={{ fontFamily: "var(--font-playfair), serif", fontSize: "28px", color: theme.text, marginBottom: "24px", borderBottom: `2px solid ${theme.accent}`, paddingBottom: "8px", display: "inline-block" }}>
            🇦🇪 Dubai VAT Refund Guide (5%)
          </h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", marginBottom: "24px" }}>
            <div style={{ backgroundColor: theme.cardBg, padding: "24px", borderRadius: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <h3 style={{ marginTop: 0, color: theme.text, display: "flex", alignItems: "center", gap: "8px" }}><CheckCircle2 color={theme.accent} /> Eligibility Checklist</h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, color: theme.text, fontSize: "15px" }}>
                <li style={{ marginBottom: "12px", display: "flex", gap: "8px" }}>✅ <span>Min AED 250 spent</span></li>
                <li style={{ marginBottom: "12px", display: "flex", gap: "8px" }}>✅ <span>Shop has 'Tax Free' Planet logo</span></li>
                <li style={{ marginBottom: "12px", display: "flex", gap: "8px" }}>✅ <span>Departing within 90 days</span></li>
                <li style={{ marginBottom: "12px", display: "flex", gap: "8px" }}>✅ <span>Tag attached to receipt</span></li>
                <li style={{ display: "flex", gap: "8px" }}>✅ <span>Over 18 years old</span></li>
              </ul>
            </div>
            
            <div style={{ backgroundColor: theme.cardBg, padding: "24px", borderRadius: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <h3 style={{ marginTop: 0, color: theme.text, display: "flex", alignItems: "center", gap: "8px" }}><Info color={theme.accent} /> Pro Tips</h3>
              <ul style={{ listStyle: "disc", paddingLeft: "20px", margin: 0, color: theme.text, fontSize: "14px", lineHeight: 1.6 }}>
                <li>Dubai limits cash refunds to <strong>AED 10,000</strong> per tourist. Rest must be to card.</li>
                <li>Planet Payment charges a <strong>4.8 AED</strong> flat fee per tag + 13% of the VAT amount as admin fee.</li>
                <li>Keep tags attached to the goods! Do not rip them off until you clear customs.</li>
              </ul>
            </div>
          </div>

          <h3 style={{ color: theme.text, marginBottom: "16px" }}>Step-by-Step Process</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            {[
              { num: 1, title: "At the Shop", desc: "Request Tax Free purchase. Retailer captures passport info and sticks a Tax Free tag on the receipt." },
              { num: 2, title: "At DXB Airport", desc: "Find Planet Validation kiosks in T1, T2, T3 before check-in or past security." },
              { num: 3, title: "Validation", desc: "Scan passport and receipt tag. Follow on-screen instructions. May require physical inspection." },
              { num: 4, title: "Get Refund", desc: "Select credit card or cash. Cash is disbursed instantly, cards take a few days." },
            ].map(step => (
              <div key={step.num} style={{ backgroundColor: theme.cardBg, padding: "20px", borderRadius: "12px", borderTop: `4px solid ${theme.brand}`, boxShadow: "0 2px 6px rgba(0,0,0,0.04)" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: theme.accentLight, color: theme.brand, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", marginBottom: "12px" }}>{step.num}</div>
                <h4 style={{ margin: "0 0 8px 0", color: theme.text }}>{step.title}</h4>
                <p style={{ margin: 0, fontSize: "14px", color: theme.textMuted, lineHeight: 1.5 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 6. India Customs Duty Guide */}
        <section id="customs-duty" style={{ marginBottom: "50px" }}>
          <h2 style={{ fontFamily: "var(--font-playfair), serif", fontSize: "28px", color: theme.text, marginBottom: "24px", borderBottom: `2px solid ${theme.accent}`, paddingBottom: "8px", display: "inline-block" }}>
            🇮🇳 India Customs Duty Guide
          </h2>
          
          {/* 6A: Allowances Table */}
          <div style={{ backgroundColor: theme.cardBg, borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", marginBottom: "30px", border: `1px solid ${theme.border}` }}>
            <h3 style={{ padding: "20px", margin: 0, backgroundColor: theme.bg, color: theme.text, borderBottom: `1px solid ${theme.border}` }}>Duty-Free Allowances</h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px", color: theme.text }}>
                <thead>
                  <tr style={{ backgroundColor: theme.brand, color: "#fff", textAlign: "left" }}>
                    <th style={{ padding: "16px" }}>Category</th>
                    <th style={{ padding: "16px" }}>Singapore (Annex-I)</th>
                    <th style={{ padding: "16px" }}>Dubai (Annex-II)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: `1px solid ${theme.border}` }}>
                    <td style={{ padding: "16px", fontWeight: 600 }}>General Goods</td>
                    <td style={{ padding: "16px" }}>Up to ₹50,000</td>
                    <td style={{ padding: "16px" }}>Up to ₹15,000</td>
                  </tr>
                  <tr style={{ borderBottom: `1px solid ${theme.border}` }}>
                    <td style={{ padding: "16px", fontWeight: 600 }}>Gold Jewellery (Male)</td>
                    <td style={{ padding: "16px" }} colSpan={2}>20 grams (Cap: ₹50,000)</td>
                  </tr>
                  <tr style={{ borderBottom: `1px solid ${theme.border}` }}>
                    <td style={{ padding: "16px", fontWeight: 600 }}>Gold Jewellery (Female)</td>
                    <td style={{ padding: "16px" }} colSpan={2}>40 grams (Cap: ₹100,000)</td>
                  </tr>
                  <tr style={{ borderBottom: `1px solid ${theme.border}` }}>
                    <td style={{ padding: "16px", fontWeight: 600 }}>Alcohol/Liquor</td>
                    <td style={{ padding: "16px" }} colSpan={2}>2 Litres</td>
                  </tr>
                  <tr style={{ borderBottom: `1px solid ${theme.border}` }}>
                    <td style={{ padding: "16px", fontWeight: 600 }}>Cigarettes</td>
                    <td style={{ padding: "16px" }} colSpan={2}>100 sticks</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "16px", fontWeight: 600 }}>Laptops</td>
                    <td style={{ padding: "16px" }} colSpan={2}>1 Laptop per person (over 18) - Fully Exempt</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* CTA 2 */}
          <div style={{ backgroundColor: theme.amberLight, padding: "20px", borderRadius: "12px", border: `1px solid ${theme.amber}`, display: "flex", flexDirection: "column", gap: "16px", marginBottom: "30px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <AlertCircle color={theme.amber} size={24} />
              <p style={{ margin: 0, fontWeight: 500, color: isDark ? "#fff" : "#92400e" }}>
                Confused about what you can carry? Our Singapore & Dubai tour packages include a pre-departure customs briefing.
              </p>
            </div>
            <Link href="/travel-consulting" style={{ alignSelf: "flex-start", backgroundColor: theme.amber, color: "#fff", padding: "10px 20px", borderRadius: "8px", textDecoration: "none", fontWeight: 600 }}>
              View Packages & Consulting
            </Link>
          </div>

          {/* 6B & 6C */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", marginBottom: "30px" }}>
            <div style={{ backgroundColor: theme.cardBg, padding: "24px", borderRadius: "16px", border: `1px solid ${theme.border}` }}>
              <h3 style={{ marginTop: 0, color: theme.red, display: "flex", alignItems: "center", gap: "8px" }}><XCircle /> Prohibited Items</h3>
              <ul style={{ paddingLeft: "20px", margin: 0, color: theme.text, fontSize: "14px", lineHeight: 1.8 }}>
                <li><strong>E-Cigarettes & Vapes:</strong> BANNED in India. Can lead to confiscation and fines.</li>
                <li><strong>Drones:</strong> Require prior DGCA approval.</li>
                <li><strong>Satellite Phones:</strong> Require DoT license.</li>
                <li><strong>Pornographic Material</strong></li>
                <li><strong>Narcotics & Counterfeit Goods</strong></li>
              </ul>
            </div>
            <div style={{ backgroundColor: theme.cardBg, padding: "24px", borderRadius: "16px", border: `1px solid ${theme.border}` }}>
              <h3 style={{ marginTop: 0, color: theme.brand, display: "flex", alignItems: "center", gap: "8px" }}><Smartphone /> ATITHI App Guide</h3>
              <p style={{ fontSize: "14px", color: theme.textMuted, marginBottom: "16px" }}>Declare customs and pay duty online before you land.</p>
              <ol style={{ paddingLeft: "20px", margin: 0, color: theme.text, fontSize: "14px", lineHeight: 1.8 }}>
                <li>Download ATITHI from Play Store / App Store</li>
                <li>Fill out baggage declaration up to 24h before landing</li>
                <li>Pay duty online via UPI/Card if applicable</li>
                <li>Show generated QR code at Green Channel</li>
              </ol>
            </div>
          </div>

          {/* 6D: Green vs Red */}
          <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", marginBottom: "30px" }}>
            <div style={{ flex: 1, minWidth: "280px", backgroundColor: theme.accentLight, padding: "24px", borderRadius: "12px", border: `1px solid ${theme.accent}` }}>
              <h3 style={{ margin: "0 0 12px 0", color: theme.accent, display: "flex", alignItems: "center", gap: "8px" }}>🟢 Green Channel</h3>
              <p style={{ margin: 0, fontSize: "14px", color: theme.text }}>For passengers with NO dutiable goods to declare. Only walk here if you are 100% sure you are within all allowances.</p>
            </div>
            <div style={{ flex: 1, minWidth: "280px", backgroundColor: theme.redLight, padding: "24px", borderRadius: "12px", border: `1px solid ${theme.red}` }}>
              <h3 style={{ margin: "0 0 12px 0", color: theme.red, display: "flex", alignItems: "center", gap: "8px" }}>🔴 Red Channel</h3>
              <p style={{ margin: 0, fontSize: "14px", color: theme.text }}>For passengers carrying dutiable goods exceeding the limit, commercial goods, or restricted items. When in doubt, go Red.</p>
            </div>
          </div>

          {/* 6F: Caught? */}
          <div style={{ backgroundColor: theme.cardBg, padding: "24px", borderRadius: "16px", border: `1px solid ${theme.border}` }}>
            <h3 style={{ marginTop: 0, color: theme.text }}>What Happens If Caught Undeclared?</h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "500px", color: theme.text, fontSize: "14px" }}>
                <thead>
                  <tr style={{ backgroundColor: theme.bg, textAlign: "left" }}>
                    <th style={{ padding: "12px", borderBottom: `1px solid ${theme.border}` }}>Offense</th>
                    <th style={{ padding: "12px", borderBottom: `1px solid ${theme.border}` }}>Consequence</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: "12px", borderBottom: `1px solid ${theme.border}` }}>Goods &lt; ₹5L Undeclared</td>
                    <td style={{ padding: "12px", borderBottom: `1px solid ${theme.border}` }}>Confiscation + Duty + Fine (usually 10-20% of value)</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "12px", borderBottom: `1px solid ${theme.border}` }}>Goods &gt; ₹50L Undeclared</td>
                    <td style={{ padding: "12px", borderBottom: `1px solid ${theme.border}` }}>Arrest and Prosecution</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "12px", borderBottom: `1px solid ${theme.border}` }}>Smuggling Gold (Concealed)</td>
                    <td style={{ padding: "12px", borderBottom: `1px solid ${theme.border}` }}>Absolute confiscation, massive fines, probable arrest</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 7. Interactive Scenarios */}
        <section style={{ marginBottom: "50px" }}>
          <h2 style={{ fontFamily: "var(--font-playfair), serif", fontSize: "28px", color: theme.text, marginBottom: "24px", borderBottom: `2px solid ${theme.accent}`, paddingBottom: "8px", display: "inline-block" }}>
            Real-Life Scenarios
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { 
                q: "1. Bringing iPhone 16 Pro from Singapore (SGD 1,799)", 
                a: "Convert SGD 1,799 to INR ≈ ₹1,12,000. \n\nAllowance: ₹50,000. \nDutiable value: ₹62,000. \nDuty payable: ~38.5% of 62,000 = ₹23,870. \n\nNote: If you open the box and use it as your personal phone, customs often ignores one personal phone, but strictly speaking, new high-value electronics attract duty if boxed." 
              },
              { 
                q: "2. 30g gold chain from Dubai for wife", 
                a: "If the wife is traveling: She has a 40g (up to ₹1L) allowance. 30g is within weight, but value must be checked. At ₹7,500/g, 30g = ₹2.25L. She exceeds the value cap by ₹1.25L. Duty applies on ₹1.25L @ ~15% = ₹18,750.\n\nIf only husband is traveling: He has 20g (up to ₹50k) allowance. 30g exceeds both weight and value. Duty applies on the excess." 
              },
              { 
                q: "3. 3 bottles whisky + 200 cigarettes from Dubai DFS", 
                a: "Limit is 2 Litres and 100 sticks. \n\nExcess: 1 bottle + 100 sticks. You must declare and pay 100% duty on the excess alcohol and cigarettes. Do not risk the Green Channel with excess liquor." 
              },
              { 
                q: "4. MacBook + iPad + iPhone from Singapore", 
                a: "1 Laptop is EXEMPT (₹0 duty). \nValue of iPad + iPhone = e.g., ₹1.5L. \nAllowance = ₹50k. \nDutiable value = ₹1L. \nDuty @ 38.5% = ₹38,500." 
              },
              { 
                q: "5. Family of 4 with ₹2.5L shopping from Singapore", 
                a: "Total allowance = 4 × ₹50,000 = ₹2,00,000. \n\nImportant: You cannot pool allowances for a SINGLE item (e.g., a ₹1.5L TV cannot be split). But if goods are distinct (clothes, electronics), distribute them physically among family members' bags before landing." 
              },
              { 
                q: "6. ₹30,000 cash + US$6,000 from Dubai", 
                a: "INR Limit: ₹25,000 (Exceeded by ₹5k). \nForex Cash Limit: US$5,000 (Exceeded by $1k). \n\nYou MUST fill the Currency Declaration Form (CDF) upon arrival." 
              },
            ].map((scen, i) => (
              <div key={i} style={{ backgroundColor: theme.cardBg, borderRadius: "8px", border: `1px solid ${theme.border}`, overflow: "hidden" }}>
                <button 
                  onClick={() => setOpenScenario(openScenario === i ? null : i)}
                  style={{ width: "100%", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "transparent", border: "none", color: theme.text, fontWeight: 600, fontSize: "16px", cursor: "pointer", textAlign: "left" }}>
                  {scen.q}
                  {openScenario === i ? <ChevronUp size={20} color={theme.accent} /> : <ChevronDown size={20} color={theme.textMuted} />}
                </button>
                {openScenario === i && (
                  <div style={{ padding: "16px", borderTop: `1px solid ${theme.border}`, backgroundColor: theme.bg, color: theme.text, whiteSpace: "pre-wrap", fontSize: "14px", lineHeight: 1.6 }}>
                    {scen.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 8. CTA 3 */}
        <div style={{ 
          backgroundColor: theme.brand, 
          borderRadius: "16px", 
          padding: "40px 20px", 
          textAlign: "center",
          marginBottom: "50px",
          color: "#fff",
          boxShadow: "0 10px 25px rgba(15, 76, 58, 0.2)"
        }}>
          <h2 style={{ fontFamily: "var(--font-playfair), serif", margin: "0 0 16px 0", fontSize: "32px" }}>Let Us Handle the Complexity</h2>
          <p style={{ margin: "0 auto 32px auto", fontSize: "18px", maxWidth: "600px", opacity: 0.9 }}>
            Book a 1-on-1 travel consultation. We'll plan your itinerary, handle visas, and optimize your shopping duty strategy.
          </p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/travel-consulting" style={{
              backgroundColor: theme.accent, color: "#fff", padding: "16px 32px", borderRadius: "8px", textDecoration: "none", fontWeight: 600, fontSize: "16px", display: "flex", alignItems: "center", gap: "8px"
            }}>
              <Phone size={20} /> Talk to a Travel Expert
            </Link>
            <Link href="/packages" style={{
              backgroundColor: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)", padding: "16px 32px", borderRadius: "8px", textDecoration: "none", fontWeight: 600, fontSize: "16px", display: "flex", alignItems: "center", gap: "8px"
            }}>
              📦 View Tour Packages
            </Link>
          </div>
        </div>

        {/* 9. Printable Airport Checklist */}
        <section id="checklist" style={{ marginBottom: "50px" }}>
          <div style={{ backgroundColor: theme.cardBg, borderRadius: "16px", padding: "32px", border: `2px dashed ${theme.border}`, position: "relative" }}>
            <button onClick={() => window.print()} style={{ position: "absolute", top: "24px", right: "24px", display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", backgroundColor: theme.bg, border: `1px solid ${theme.border}`, borderRadius: "8px", color: theme.text, cursor: "pointer", fontWeight: 600 }}>
              <Printer size={18} /> Print
            </button>
            <h2 style={{ fontFamily: "var(--font-playfair), serif", fontSize: "24px", color: theme.text, marginTop: 0, marginBottom: "24px" }}>
              📋 Airport Duty & Tax Checklist
            </h2>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "24px" }}>
              <div>
                <h4 style={{ color: theme.brand, borderBottom: `1px solid ${theme.border}`, paddingBottom: "8px", marginBottom: "12px" }}>1. Before You Fly (At Shop)</h4>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", color: theme.text }}><input type="checkbox" style={{width:"16px", height:"16px"}} /> Ask for Tax Free / eTRS</div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", color: theme.text }}><input type="checkbox" style={{width:"16px", height:"16px"}} /> Show Passport</div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", color: theme.text }}><input type="checkbox" style={{width:"16px", height:"16px"}} /> Keep receipt & tag safe</div>
              </div>
              <div>
                <h4 style={{ color: theme.brand, borderBottom: `1px solid ${theme.border}`, paddingBottom: "8px", marginBottom: "12px" }}>2. At Airport (Before Check-in)</h4>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", color: theme.text }}><input type="checkbox" style={{width:"16px", height:"16px"}} /> Don't pack tax-free goods deep</div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", color: theme.text }}><input type="checkbox" style={{width:"16px", height:"16px"}} /> Scan at Validation Kiosk</div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", color: theme.text }}><input type="checkbox" style={{width:"16px", height:"16px"}} /> Inspect goods at Customs (if asked)</div>
              </div>
              <div>
                <h4 style={{ color: theme.brand, borderBottom: `1px solid ${theme.border}`, paddingBottom: "8px", marginBottom: "12px" }}>3. After Immigration (Refund)</h4>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", color: theme.text }}><input type="checkbox" style={{width:"16px", height:"16px"}} /> Tap card on kiosk to receive funds</div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", color: theme.text }}><input type="checkbox" style={{width:"16px", height:"16px"}} /> Or visit Global Blue/Planet counter for cash</div>
              </div>
              <div>
                <h4 style={{ color: theme.brand, borderBottom: `1px solid ${theme.border}`, paddingBottom: "8px", marginBottom: "12px" }}>4. Landing in India</h4>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", color: theme.text }}><input type="checkbox" style={{width:"16px", height:"16px"}} /> Fill ATITHI app declaration</div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", color: theme.text }}><input type="checkbox" style={{width:"16px", height:"16px"}} /> Choose Green or Red channel</div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", color: theme.text }}><input type="checkbox" style={{width:"16px", height:"16px"}} /> Pay duty online or at counter</div>
              </div>
            </div>
          </div>
        </section>

        {/* 10. Quick Reference & 11. FAQs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "40px", marginBottom: "50px" }}>
          
          {/* Quick Ref */}
          <div>
            <h2 style={{ fontFamily: "var(--font-playfair), serif", fontSize: "24px", color: theme.text, marginBottom: "20px" }}>Quick Reference</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div style={{ backgroundColor: theme.cardBg, padding: "16px", borderRadius: "12px", border: `1px solid ${theme.border}` }}>
                <Phone size={24} color={theme.accent} style={{ marginBottom: "8px" }} />
                <h4 style={{ margin: "0 0 8px 0", color: theme.text }}>Helplines</h4>
                <div style={{ fontSize: "13px", color: theme.textMuted }}>India Customs:<br/>1800-266-0000</div>
                <div style={{ fontSize: "13px", color: theme.textMuted, marginTop: "4px" }}>Changi:<br/>+65-6595-6868</div>
              </div>
              <div style={{ backgroundColor: theme.cardBg, padding: "16px", borderRadius: "12px", border: `1px solid ${theme.border}` }}>
                <Clock size={24} color={theme.accent} style={{ marginBottom: "8px" }} />
                <h4 style={{ margin: "0 0 8px 0", color: theme.text }}>Time Needed</h4>
                <div style={{ fontSize: "13px", color: theme.textMuted }}>Changi Airport:<br/>30-45 mins extra</div>
                <div style={{ fontSize: "13px", color: theme.textMuted, marginTop: "4px" }}>Dubai DXB:<br/>20-30 mins extra</div>
              </div>
              <div style={{ backgroundColor: theme.cardBg, padding: "16px", borderRadius: "12px", border: `1px solid ${theme.border}`, gridColumn: "span 2" }}>
                <LinkIcon size={24} color={theme.accent} style={{ marginBottom: "8px" }} />
                <h4 style={{ margin: "0 0 8px 0", color: theme.text }}>Apps & Links</h4>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "13px", color: theme.brand, backgroundColor: theme.accentLight, padding: "4px 8px", borderRadius: "4px" }}>ATITHI App</span>
                  <span style={{ fontSize: "13px", color: theme.brand, backgroundColor: theme.accentLight, padding: "4px 8px", borderRadius: "4px" }}>IRAS eTRS</span>
                  <span style={{ fontSize: "13px", color: theme.brand, backgroundColor: theme.accentLight, padding: "4px 8px", borderRadius: "4px" }}>Planet Tax Free</span>
                </div>
              </div>
            </div>
          </div>

          {/* FAQs */}
          <div>
            <h2 style={{ fontFamily: "var(--font-playfair), serif", fontSize: "24px", color: theme.text, marginBottom: "20px" }}>Smart FAQs</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { q: "Can I claim GST refund on hotel stay?", a: "No. GST refunds are only for physical goods exported out of the country. Services like hotels, meals, and Grab rides do not qualify." },
                { q: "Can I buy gold in Dubai DFS and avoid Indian customs?", a: "No. Dubai Duty Free (DFS) exempts you from Dubai taxes, but once you land in India, Indian Customs rules apply based on the total value." },
                { q: "My friend is carrying my stuff — whose allowance is used?", a: "Customs strictly looks at who is physically carrying the item. The person holding the bag uses their allowance." },
                { q: "Transiting via Singapore from Bali — can I claim GST?", a: "You can only claim GST on items purchased IN Singapore. Transit goods from Bali are not eligible." },
                { q: "Customs duty on used personal items I took from India?", a: "Used personal effects (clothes, used laptop, used camera) taken from India and brought back are exempt from duty." },
                { q: "Do kids/infants get their own duty-free allowance?", a: "Yes, children generally get the same allowance for general goods, but they cannot bring alcohol or tobacco." },
              ].map((faq, i) => (
                <div key={i} style={{ borderBottom: `1px solid ${theme.border}` }}>
                  <button 
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{ width: "100%", padding: "12px 0", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "transparent", border: "none", color: theme.text, fontWeight: 500, fontSize: "15px", cursor: "pointer", textAlign: "left" }}>
                    {faq.q}
                    {openFaq === i ? <ChevronUp size={18} color={theme.accent} /> : <ChevronDown size={18} color={theme.textMuted} />}
                  </button>
                  {openFaq === i && (
                    <div style={{ paddingBottom: "12px", color: theme.textMuted, fontSize: "14px", lineHeight: 1.5 }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* 12. Floating Bottom Bar */}
      {showFloatingBar && !floatingDismissed && (
        <div style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: "48px",
          backgroundColor: theme.brand,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 100,
          boxShadow: "0 -2px 10px rgba(0,0,0,0.1)",
          padding: "0 20px"
        }}>
          <Link href="/travel-consulting" style={{ color: "#fff", textDecoration: "none", fontWeight: 500, fontSize: "14px" }}>
            ✈️ Need help planning? Book a free consultation →
          </Link>
          <button onClick={() => setFloatingDismissed(true)} style={{ position: "absolute", right: "20px", background: "none", border: "none", color: "#fff", cursor: "pointer" }}>
            <X size={20} />
          </button>
        </div>
      )}

      {/* 13. Community Footer */}
      <footer style={{ backgroundColor: theme.cardBg, borderTop: `1px solid ${theme.border}`, padding: "40px 20px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginBottom: "20px" }}>
          <button onClick={() => { navigator.clipboard.writeText(window.location.href); alert("Link copied!"); }} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", backgroundColor: theme.bg, border: `1px solid ${theme.border}`, borderRadius: "20px", color: theme.text, cursor: "pointer", fontSize: "14px" }}>
            <Share2 size={16} /> Copy Link
          </button>
          <a href={`https://wa.me/?text=Check out this GST and Customs Guide: ${typeof window !== 'undefined' ? window.location.href : ''}`} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", backgroundColor: "#25D366", border: "none", borderRadius: "20px", color: "#fff", textDecoration: "none", fontSize: "14px" }}>
            <MessageCircle size={16} /> WhatsApp
          </a>
        </div>
        <div style={{ marginBottom: "12px" }}>
          <Link href="/" style={{ color: theme.accent, textDecoration: "none", fontWeight: 500 }}>
            ← Back to Travel Tools
          </Link>
        </div>
        <div style={{ color: theme.textMuted, fontSize: "13px" }}>
          Last updated: September 2025
        </div>
      </footer>
    </div>
  );
}
