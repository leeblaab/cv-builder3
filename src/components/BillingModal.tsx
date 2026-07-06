import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  CheckCircle, 
  CreditCard, 
  ShieldCheck, 
  HelpCircle, 
  TrendingUp, 
  Sparkles, 
  Loader2, 
  Check, 
  Star 
} from "lucide-react";

interface BillingModalProps {
  currentPlan: "free" | "pro" | "unlimited";
  usage: number;
  onClose: () => void;
  onUpgrade: (plan: "free" | "pro" | "unlimited") => Promise<void>;
}

export default function BillingModal({ currentPlan, usage, onClose, onUpgrade }: BillingModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<"free" | "pro" | "unlimited" | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Card details state
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("4111 2222 3333 4444");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("123");

  const getLimit = (plan: string) => {
    if (plan === "free") return 5;
    if (plan === "pro") return 30;
    return 100;
  };

  const limit = getLimit(currentPlan);
  const percentUsed = Math.min(100, Math.round((usage / limit) * 100));

  const planOptions = [
    {
      id: "free" as const,
      name: "Free Plan",
      price: "$0",
      limitText: "5 CVs / month",
      desc: "For occasional updates and testing.",
      features: ["AI Resume Import", "Classic & Modern templates", "ATS keyword checker"],
      badge: "Active Starter"
    },
    {
      id: "pro" as const,
      name: "Pro Career",
      price: "$12",
      limitText: "30 CVs / month",
      desc: "Perfect for active job hunts and multiple applications.",
      features: ["Unlimited PDF downloads", "30 AI tailors / month", "All premium layouts", "Priority processing queue"],
      badge: "Best Value",
      popular: true
    },
    {
      id: "unlimited" as const,
      name: "Unlimited VIP",
      price: "$29",
      limitText: "100 CVs / month",
      desc: "For power users, agencies, or recruiters.",
      features: ["Up to 100 AI tailors / month", "Direct multi-profile sync", "Advanced detailed diagnostics", "Dedicated career help"],
      badge: "Enterprise Power"
    }
  ];

  const handleStartCheckout = (planId: "free" | "pro" | "unlimited") => {
    if (planId === currentPlan) return;
    setSelectedPlan(planId);
    setIsCheckingOut(true);
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;
    setLoading(true);

    try {
      // Simulate real purchase latency
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await onUpgrade(selectedPlan);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      alert("Billing simulation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            <div>
              <h2 className="text-md font-bold text-slate-900">Subscription & Usage Limits</h2>
              <p className="text-[10px] text-slate-400 font-medium">Manage your resume metrics and pricing plans securely</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer transition"
            id="close-billing-modal-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 md:p-8 space-y-8 flex-1">
          {success ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-10 space-y-6 max-w-md mx-auto"
            >
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-900">Upgrade Complete!</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Your profile has been upgraded to the <strong className="font-bold text-emerald-600 capitalize">{selectedPlan}</strong> plan. Your monthly usage quota is successfully active.
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full py-3 bg-slate-950 hover:bg-slate-850 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Return to Workspace
              </button>
            </motion.div>
          ) : isCheckingOut ? (
            /* Mock Secure Payment form */
            <div className="grid md:grid-cols-12 gap-8 items-start">
              <div className="md:col-span-7 space-y-6">
                <div>
                  <button 
                    onClick={() => setIsCheckingOut(false)}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                  >
                    ← Back to plan overview
                  </button>
                  <h3 className="text-md font-black text-slate-900 mt-3">Secure Simulation Payment</h3>
                  <p className="text-xs text-slate-400">Complete your mock upgrade. Your credit card will not be charged.</p>
                </div>

                <form onSubmit={handlePay} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Cardholder Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Jane Doe" 
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Card Number</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        required
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition font-mono"
                      />
                      <CreditCard className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Expiry Date</label>
                      <input 
                        type="text" 
                        required
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">CVC / CVV</label>
                      <input 
                        type="password" 
                        required
                        maxLength={4}
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Real-time test billing is verified by Cloud Sync standards.</span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-400 text-white font-bold rounded-xl text-xs shadow-sm cursor-pointer flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Simulate checkout & activate {selectedPlan}</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Purchase summary */}
              <div className="md:col-span-5 bg-slate-50 rounded-2xl border border-slate-100 p-5 space-y-4">
                <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider">Purchase Summary</h4>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="capitalize">{selectedPlan} Subscription Upgrade</span>
                  <span className="font-bold text-slate-900">
                    {selectedPlan === "pro" ? "$12" : selectedPlan === "unlimited" ? "$29" : "$0"} / mo
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <span>Quota limit</span>
                  <span className="font-semibold text-emerald-600">{getLimit(selectedPlan)} CVs / mo</span>
                </div>
                <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-sm font-black text-slate-900">
                  <span>Total Due</span>
                  <span>{selectedPlan === "pro" ? "$12.00" : selectedPlan === "unlimited" ? "$29.00" : "$0.00"}</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* CURRENT USAGE STATISTICS CARD */}
              <div className="p-5 md:p-6 bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl" />
                <div className="space-y-2 relative">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 font-black uppercase tracking-wider px-2.5 py-1 rounded-full">
                      Current: {currentPlan} Plan
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-white">Your Quota Usage</h3>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                    You have utilized <strong className="text-white">{usage}</strong> out of your <strong className="text-white">{limit}</strong> monthly CV downloads or tailorings.
                  </p>
                </div>

                <div className="w-full md:w-64 space-y-1.5 shrink-0 relative">
                  <div className="flex justify-between text-xs font-semibold text-slate-300">
                    <span>Usage percentage</span>
                    <span>{percentUsed}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${percentUsed > 85 ? "bg-rose-500" : "bg-emerald-500"}`}
                      style={{ width: `${percentUsed}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 text-right font-medium">Resets on the 1st of every month</p>
                </div>
              </div>

              {/* THREE PLANS COMPARISON GRID */}
              <div className="grid md:grid-cols-3 gap-6">
                {planOptions.map((plan) => (
                  <div 
                    key={plan.id}
                    className={`border rounded-2xl p-5 flex flex-col justify-between transition relative ${
                      plan.id === currentPlan 
                        ? "border-emerald-600 bg-emerald-50/10 ring-1 ring-emerald-500/20" 
                        : "border-slate-100 hover:border-slate-300"
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-3 left-4 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-white" />
                        {plan.badge}
                      </span>
                    )}
                    {!plan.popular && (
                      <span className="absolute -top-3 left-4 bg-slate-100 text-slate-600 text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-slate-200">
                        {plan.badge}
                      </span>
                    )}

                    <div className="space-y-4">
                      <div className="pt-2">
                        <h4 className="font-bold text-sm text-slate-900">{plan.name}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">{plan.desc}</p>
                      </div>

                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-slate-900">{plan.price}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">/ month</span>
                      </div>

                      <div className="py-1 px-2.5 bg-slate-50 rounded-lg text-[11px] font-bold text-slate-600 inline-block">
                        Limit: {plan.limitText}
                      </div>

                      <hr className="border-slate-100" />

                      <ul className="space-y-2 text-xs text-slate-500">
                        {plan.features.map((feat, fIdx) => (
                          <li key={fIdx} className="flex items-start gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-6">
                      <button
                        onClick={() => handleStartCheckout(plan.id)}
                        disabled={plan.id === currentPlan}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-bold text-center transition cursor-pointer disabled:cursor-not-allowed ${
                          plan.id === currentPlan
                            ? "bg-emerald-50 text-emerald-700 font-extrabold cursor-default border border-transparent"
                            : "bg-slate-900 hover:bg-slate-800 text-white shadow-xs"
                        }`}
                      >
                        {plan.id === currentPlan ? "Your Active Plan" : "Upgrade"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
