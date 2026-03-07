'use client';

import { PageTransition } from '@/components/page-transition';
import { motion } from 'framer-motion';
import { Check, Zap, Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlan, Plan } from '@/context/plan-context';
import { useToast } from '@/context/toast-context';
import { cn } from '@/lib/utils';

const plans = [
  {
    id: 'free' as Plan,
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for getting started with AI-powered studying.',
    icon: Sparkles,
    color: 'text-slate-600',
    bg: 'bg-slate-100',
    border: 'border-slate-200',
    gradient: '',
    cta: 'Current Plan',
    features: [
      '5 AI questions per day',
      'Limited quiz generation (3/day)',
      'Basic flashcard generation',
      'Document upload (2 files/day)',
      'Community support',
    ],
    disabled: ['Team Collaboration', 'Unlimited questions', 'Priority AI responses'],
  },
  {
    id: 'pro' as Plan,
    name: 'Pro',
    price: '$12',
    period: '/month',
    description: 'Unlock the full power of your AI Study Companion.',
    icon: Crown,
    color: 'text-violet-600',
    bg: 'bg-violet-100',
    border: 'border-violet-300',
    gradient: 'bg-gradient-to-b from-violet-50/80 to-white/80',
    cta: 'Upgrade to Pro',
    features: [
      'Unlimited AI questions',
      'Unlimited quiz generation',
      'Unlimited flashcard creation',
      'Unlimited document uploads',
      'Team Collaboration access',
      'Priority AI responses',
      'Advanced analytics',
      'Priority support',
    ],
    disabled: [],
  },
  {
    id: 'enterprise' as Plan,
    name: 'Enterprise',
    price: '$49',
    period: '/month',
    description: 'For institutions and large study groups.',
    icon: Zap,
    color: 'text-amber-600',
    bg: 'bg-amber-100',
    border: 'border-amber-200',
    gradient: '',
    cta: 'Contact Sales',
    features: [
      'Everything in Pro',
      'Unlimited team members',
      'Custom AI knowledge base',
      'SSO & admin dashboard',
      'SLA uptime guarantee',
      'Dedicated account manager',
    ],
    disabled: [],
  },
];

export default function PricingPage() {
  const { currentPlan, upgradePlan } = usePlan();
  const { addToast } = useToast();

  const handleUpgrade = (plan: Plan) => {
    if (plan === currentPlan) return;
    if (plan === 'enterprise') {
      addToast('📧 Please contact sales@aistudycompanion.com for Enterprise pricing!', 'info');
      return;
    }
    upgradePlan(plan);
    addToast(`🎉 You're now on the ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan!`, 'success');
  };

  return (
    <PageTransition className="p-6 md:p-12 max-w-6xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto pt-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 text-xs font-bold px-4 py-2 rounded-full mb-4 uppercase tracking-widest"
        >
          <Crown className="w-3.5 h-3.5" />
          Pricing Plans
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-4xl font-black tracking-tight text-slate-900 mb-4"
        >
          Choose the right plan for you
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-lg text-slate-600 font-medium"
        >
          Start for free, upgrade whenever you&rsquo;re ready. No credit card required for the Free plan.
        </motion.p>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {plans.map((plan, idx) => {
          const Icon = plan.icon;
          const isActive = currentPlan === plan.id;
          const isPro = plan.id === 'pro';

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 + 0.15 }}
              whileHover={{ y: -6, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
              className={cn(
                'relative rounded-2xl border p-8 flex flex-col backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all',
                plan.gradient || 'bg-white/80',
                plan.border,
                isPro && 'ring-2 ring-violet-400 shadow-[0_16px_50px_rgba(139,92,246,0.15)]'
              )}
            >
              {isPro && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-black px-5 py-1.5 rounded-full shadow-lg tracking-wider uppercase">
                  ⭐ Most Popular
                </div>
              )}

              {/* Plan Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${plan.bg}`}>
                  <Icon className={`w-5 h-5 ${plan.color}`} />
                </div>
                {isActive && (
                  <span className="text-xs font-black bg-emerald-50 text-emerald-600 border border-emerald-100 px-2.5 py-1 rounded-full">
                    Current Plan
                  </span>
                )}
              </div>

              <h3 className="text-xl font-black text-slate-900 mb-1">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-black text-slate-900">{plan.price}</span>
                <span className="text-slate-400 font-medium">{plan.period}</span>
              </div>
              <p className="text-sm text-slate-500 font-medium mb-8 border-b border-slate-100 pb-6">
                {plan.description}
              </p>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-slate-700 font-medium">
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
                {plan.disabled.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-slate-300 line-through">
                    <Check className="w-4 h-4 text-slate-200 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                onClick={() => handleUpgrade(plan.id)}
                disabled={isActive}
                className={cn(
                  'w-full h-12 rounded-xl font-bold text-sm transition-all',
                  isPro && !isActive
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-violet-500/25'
                    : isActive
                    ? 'bg-slate-50 text-slate-400 border border-slate-200 cursor-default'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                )}
              >
                {isActive ? '✓ Current Plan' : plan.cta}
              </Button>
            </motion.div>
          );
        })}
      </div>

      {/* Footer Note */}
      <p className="text-center text-sm text-slate-400 font-medium">
        Demo mode — plan activation is instant and simulated without payment processing.
      </p>
    </PageTransition>
  );
}
