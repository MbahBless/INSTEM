import React, { useState } from "react";
import { 
  Check, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  Smartphone, 
  Loader2, 
  ArrowRight, 
  Coins, 
  Crown,
  HelpCircle
} from "lucide-react";
import { User } from "../types";

interface PremiumSubscriptionProps {
  currentUser: User;
  onSubscribed: (user: User) => void;
  onAddNotification: (title: string, message: string) => void;
}

export default function PremiumSubscription({
  currentUser,
  onSubscribed,
  onAddNotification,
}: PremiumSubscriptionProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual">("annual");
  const [paymentProvider, setPaymentProvider] = useState<"momo" | "om">("momo");
  const [phoneNumber, setPhoneNumber] = useState("+237 ");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"form" | "ussd" | "success">("form");
  const [simulationStatus, setSimulationStatus] = useState<string>("Initializing secure channel...");

  const handleOpenCheckout = (plan: "monthly" | "annual") => {
    setSelectedPlan(plan);
    setShowCheckout(true);
    setPaymentStep("form");
    setPhoneNumber(currentUser.phoneNumber || "+237 ");
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phoneNumber.trim();
    if (!cleanPhone || cleanPhone === "+237") {
      alert("Please enter a valid Mobile Money phone number.");
      return;
    }

    setIsProcessing(true);
    setPaymentStep("ussd");
    setSimulationStatus("1. Establishing secure pipeline with local telecom aggregator...");

    // Step 1: Connecting
    setTimeout(() => {
      setSimulationStatus("2. Sending USSD Push request (PIN prompt) to current device...");
      
      // Step 2: USSD Push sent
      setTimeout(() => {
        setSimulationStatus("3. Awaiting user PIN authorization on hand-set...");

        // Step 3: Authorization loop success
        setTimeout(async () => {
          try {
            const response = await fetch(`/api/users/${currentUser.id}/subscribe`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                plan: selectedPlan,
                paymentMethod: paymentProvider,
                phoneNumber: cleanPhone,
              }),
            });

            if (response.ok) {
              const data = await response.json();
              onAddNotification(
                "PRESI VIP Scholar Unlocked 👑",
                `Premium status activated. Thank you for subscribing to the ${selectedPlan} plan using ${
                  paymentProvider === "momo" ? "MTN MoMo" : "Orange Money"
                } (${cleanPhone}).`
              );
              setPaymentStep("success");
              setTimeout(() => {
                onSubscribed(data.user);
                setShowCheckout(false);
              }, 1800);
            } else {
              alert("Payment verification has failed. Please verify your Mobile Money balance.");
              setPaymentStep("form");
            }
          } catch (err) {
            console.error(err);
            alert("Connection error in checkout system. Restoring state.");
            setPaymentStep("form");
          } finally {
            setIsProcessing(false);
          }
        }, 1500);
      }, 1200);
    }, 1000);
  };

  return (
    <div id="premium-subscription-section" className="py-2 animate-fadeIn text-left">
      {/* Dynamic Gold-Themed Visual Hero Board */}
      <div className="relative rounded-2xl p-8 bg-gradient-to-br from-neutral-950 via-neutral-900 to-amber-950/40 border border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.08)] overflow-hidden mb-10">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 leading-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-blue-500/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-bold uppercase tracking-widest">
              <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
              PRESI VIP Academic Accel
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-amber-400 tracking-tight">
              Go Scholar VIP. Supercharge Placements.
            </h2>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Unlock the cutting-edge PRESI AI Copilot. Get custom, region-targeted CVs/Resumes in beautiful markdown format, draft elaborate, supervisor-grade logbook internship summaries, and query complex tech requirements on demand. No limits, infinite possibilities.
            </p>
          </div>

          <div className="flex flex-col items-start gap-1 pb-1 px-4 py-3 bg-neutral-950/80 border border-neutral-850 rounded-xl shrink-0">
            <span className="text-[10px] text-neutral-400 font-mono">Academic Rate:</span>
            <span className="text-lg font-mono font-black text-amber-500">From 833 FCFA / mo</span>
            <span className="text-[9px] text-neutral-500 max-w-[150px] leading-tight">Pay securely from Cameroon via MoMo or Orange Money.</span>
          </div>
        </div>

        {/* Plan Toggles */}
        <div className="flex items-center justify-start gap-4 mt-8 pt-4 border-t border-neutral-900/60 font-sans">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-4 py-2 text-xs rounded-lg border font-semibold tracking-wider uppercase transition-all duration-250 cursor-pointer ${
              billingCycle === "monthly"
                ? "bg-amber-500 text-neutral-950 border-amber-500 font-bold shadow-md shadow-amber-500/10"
                : "bg-neutral-950 text-neutral-400 border-neutral-900 hover:border-neutral-800 hover:text-white"
            }`}
          >
            Monthly Tier
          </button>
          <button
            onClick={() => setBillingCycle("annual")}
            className={`px-4 py-2 text-xs rounded-lg border font-semibold tracking-wider uppercase transition-all duration-250 cursor-pointer flex items-center gap-2 ${
              billingCycle === "annual"
                ? "bg-amber-500 text-neutral-950 border-amber-500 font-bold shadow-md shadow-amber-500/10"
                : "bg-neutral-950 text-neutral-400 border-neutral-900 hover:border-neutral-800 hover:text-white"
            }`}
          >
            Annual VIP Plan
            <span className={`px-1.5 py-0.5 text-[8px] rounded uppercase ${billingCycle === "annual" ? "bg-neutral-950 text-amber-400" : "bg-amber-500 text-neutral-950"}`}>
              Save 16%
            </span>
          </button>
        </div>
      </div>

      {/* Gold Themed Pricing Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
        
        {/* MONTHLY TIER CARD */}
        <div className={`p-8 rounded-2xl flex flex-col justify-between transition-all duration-300 relative border ${
          billingCycle === "monthly" 
            ? "bg-gradient-to-b from-neutral-950 to-amber-950/20 border-amber-500/60 shadow-[0_4px_25px_rgba(245,158,11,0.06)]"
            : "bg-neutral-950 border-neutral-900 text-neutral-300 hover:border-neutral-800"
        }`}>
          <div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className={`text-base font-bold font-display ${billingCycle === "monthly" ? "text-amber-400" : "text-white"}`}>
                  Starter Monthly Support
                </h3>
                <p className="text-[11px] text-neutral-500 mt-1">Flexible study assistance</p>
              </div>
              <span className={`p-2 rounded ${billingCycle === "monthly" ? "bg-amber-500/10 text-amber-400" : "bg-neutral-900 text-neutral-400"}`}>
                <Zap className="w-4 h-4" />
              </span>
            </div>

            <div className="mb-6 flex items-baseline gap-1">
              <span className="text-3xl font-black font-display text-white">1,000</span>
              <span className="text-xs font-mono text-neutral-400">FCFA / month</span>
            </div>

            <ul className="space-y-4 mb-8 text-xs text-neutral-400">
              <li className="flex items-start gap-2.5">
                <Check className={`w-4 h-4 shrink-0 mt-0.5 ${billingCycle === "monthly" ? "text-amber-400" : "text-emerald-500"}`} />
                <span>Interact with PRESI Educational AI model</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className={`w-4 h-4 shrink-0 mt-0.5 ${billingCycle === "monthly" ? "text-amber-400" : "text-emerald-500"}`} />
                <span>Unlimited questions & homework problem calculations</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className={`w-4 h-4 shrink-0 mt-0.5 ${billingCycle === "monthly" ? "text-amber-400" : "text-emerald-500"}`} />
                <span>Interim report drafts & logbook templates builder</span>
              </li>
              <li className="flex items-start gap-2.5 text-neutral-600">
                <Check className="w-4 h-4 shrink-0 mt-0.5 text-neutral-750" />
                <span>Advanced African regional CV builder (Requires Annual VIP)</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleOpenCheckout("monthly")}
            className={`w-full py-3.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer text-center ${
              billingCycle === "monthly"
                ? "bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold shadow"
                : "bg-neutral-900 hover:bg-neutral-850 hover:text-white text-neutral-400 border border-neutral-800"
            }`}
          >
            Select Monthly Tier
          </button>
        </div>

        {/* ANNUAL ELITE SCHOLAR VIP CARD */}
        <div className={`p-8 rounded-2xl flex flex-col justify-between transition-all duration-300 relative border-2 ${
          billingCycle === "annual"
            ? "bg-gradient-to-b from-neutral-950 via-neutral-950 to-amber-950/30 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.12)] md:scale-105"
            : "bg-neutral-950 border-neutral-900 text-neutral-300 hover:border-neutral-800"
        }`}>
          {/* Decorative Crown Floating */}
          <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 border border-amber-500/30 text-neutral-950 text-[9px] font-black font-mono tracking-widest uppercase px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
            <Crown className="w-3 h-3 text-neutral-950 fill-neutral-950" /> Suggested VIP Choice
          </span>

          <div className="mt-2">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-base font-bold text-amber-400 font-display flex items-center gap-1.5">
                  Scholar VIP Annual
                  <span className="px-1.5 py-0.5 rounded text-[8px] bg-amber-500/10 text-amber-500 border border-amber-500/20 font-black">PRO</span>
                </h3>
                <p className="text-[11px] text-neutral-400 mt-1">Complete undergraduate accelerator</p>
              </div>
              <span className="p-2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Sparkles className="w-4 h-4 fill-amber-500/20" />
              </span>
            </div>

            <div className="mb-6 flex items-baseline gap-1">
              <span className="text-4xl font-black font-display text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-250 to-amber-400">10,000</span>
              <span className="text-xs font-mono text-neutral-300">FCFA / year</span>
            </div>

            <div className="text-[10px] text-amber-400 font-mono mb-6 bg-amber-500/10 px-3 py-2 rounded border border-amber-500/20 inline-block w-full">
              💰 Save 2,000 FCFA yearly compared to Starter Monthly plan.
            </div>

            <ul className="space-y-4 mb-8 text-xs text-neutral-200">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <span>Unlimited conversational AI Academic calculations</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <span className="font-semibold text-white">Premium Markdown CV and Resume compiling</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <span>Academic weekly logbook writer and compliance checker</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <span className="text-amber-400">Priority application endorsement to gold partners</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleOpenCheckout("annual")}
            className="w-full py-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-neutral-950 font-black text-xs uppercase tracking-wider rounded-lg transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 hover:brightness-110"
          >
            Upgrade to Scholar VIP
            <ArrowRight className="w-4 h-4 text-neutral-950 stroke-[3]" />
          </button>
        </div>
      </div>

      {/* MOBILE COMMERCE ROUTING BRIDGE DIALOG */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-neutral-950 border border-neutral-850 rounded-2xl max-w-md w-full p-6 text-left shadow-2xl relative overflow-hidden">
            
            {/* Visual Gold Frame Backdrop Accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />

            {/* Header toolbar */}
            <div className="flex justify-between items-center pb-4 border-b border-neutral-900 mt-2 mb-6">
              <div className="flex items-center gap-2 text-white font-semibold">
                <Smartphone className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-display font-bold">Secure Local checkout</span>
              </div>
              <button
                onClick={() => !isProcessing && setShowCheckout(false)}
                className="text-neutral-500 hover:text-white text-xs bg-neutral-900 border border-neutral-850 px-2.5 py-1 rounded cursor-pointer transition-colors"
                disabled={isProcessing}
              >
                Cancel
              </button>
            </div>

            {paymentStep === "form" && (
              <form onSubmit={handleProcessPayment} className="space-y-6">
                
                {/* Visual Invoice info */}
                <div className="bg-neutral-900/60 p-4 border border-neutral-850 rounded-xl">
                  <span className="text-[9px] text-neutral-500 font-mono uppercase">VIP SCHOLAR BILL:</span>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs font-bold text-white">
                      PRESI {selectedPlan === "annual" ? "Annual Scholar VIP" : "Starter Monthly"} Package
                    </p>
                    <span className="text-amber-500 font-mono font-bold text-xs bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {selectedPlan === "annual" ? "10,000" : "1,000"} FCFA
                    </span>
                  </div>
                </div>

                {/* Mobile Money Provider grids */}
                <div className="space-y-2">
                  <label className="text-[10px] text-neutral-400 font-mono uppercase block">
                    Choose Carrier payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setPaymentProvider("momo")}
                      className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                        paymentProvider === "momo"
                          ? "bg-yellow-500/10 border-yellow-500 text-yellow-500"
                          : "bg-neutral-900/40 border-neutral-900 text-neutral-500 hover:border-neutral-850 hover:text-neutral-300"
                      }`}
                    >
                      <div className="text-xs font-extrabold font-sans">MTN MoMo</div>
                      <div className="text-[8px] font-mono text-neutral-500 mt-1">Cameroon Gateway</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentProvider("om")}
                      className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                        paymentProvider === "om"
                          ? "bg-orange-500/10 border-orange-500 text-orange-500"
                          : "bg-neutral-900/40 border-neutral-900 text-neutral-500 hover:border-neutral-850 hover:text-neutral-300"
                      }`}
                    >
                      <div className="text-xs font-extrabold font-sans">Orange Money</div>
                      <div className="text-[8px] font-mono text-neutral-500 mt-1">Direct Push APIs</div>
                    </button>
                  </div>
                </div>

                {/* Phone number input block */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-neutral-400 font-mono uppercase block">
                    Enter Carrier Registered phone number
                  </label>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-black border border-neutral-850 rounded px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                    placeholder="+237 677 88 99 00"
                  />
                  <span className="text-[9px] text-neutral-500 block leading-normal">
                    Format: +237 followed by 9 digits. Instantly sends USSD checkout PIN prompt.
                  </span>
                </div>

                {/* MTN/Orange safety disclaimer */}
                <div className="p-3 bg-amber-500/5 rounded border border-amber-500/20 text-[10px] text-neutral-400 leading-relaxed">
                  📢 **Merchant Authorization Notice:** Submitting will trigger a localized payment trigger on your mobile phone asking for authentication. Select 'Confirm' to authorize.
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 font-black text-xs uppercase tracking-wider rounded-lg transition-all hover:brightness-110 cursor-pointer flex items-center justify-center gap-2 shadow"
                >
                  Send Checkout Request
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-950 stroke-[3]" />
                </button>
              </form>
            )}

            {/* USSD LOADER FLOW SCREEN WITH DETAILED METRICS */}
            {paymentStep === "ussd" && (
              <div className="py-12 text-center space-y-6 animate-pulse">
                <div className="relative inline-flex">
                  <div className="absolute inset-0 rounded-full bg-amber-500/10 blur-md" />
                  <Loader2 className="w-12 h-12 text-amber-500 animate-spin relative" />
                </div>
                
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white font-display uppercase tracking-wider">
                    Connecting Payment Gateway...
                  </h4>
                  <p className="text-[10px] text-amber-400 font-mono">
                    USSD ID: {`TX_REF_${Date.now().toString().slice(-6)}`}
                  </p>
                </div>

                <div className="bg-black border border-neutral-900 p-4 rounded text-left font-mono text-[10px] text-neutral-400 space-y-2 max-w-xs mx-auto leading-relaxed">
                  <div className="text-neutral-500 text-[8px] uppercase tracking-wider border-b border-neutral-900 pb-1.5 mb-1.5">
                    Live Channel Operations log:
                  </div>
                  <p className="text-amber-500">{simulationStatus}</p>
                  <p className="text-[9px] text-neutral-500 select-none">
                    • Phone: {phoneNumber}
                  </p>
                  <p className="text-[9px] text-neutral-500 select-none">
                    • Value: {selectedPlan === "annual" ? "10,000" : "1,000"} FCFA
                  </p>
                </div>
              </div>
            )}

            {/* SUCCESS LAYOUT STATE */}
            {paymentStep === "success" && (
              <div className="py-12 text-center space-y-5 animate-scaleUp">
                <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-550/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white font-display">Subscription Authorized!</h4>
                  <p className="text-xs text-neutral-400 max-w-xs mx-auto px-2 leading-relaxed">
                    VIP academic modules unlocked. Thank you for utilizing PRESI to level up your study pathways.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
