'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageTransition } from '@/components/page-transition';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Mail, UserPlus, Copy, Check, Trash2, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/context/toast-context';
import { usePlan } from '@/context/plan-context';

interface Member {
  id: string;
  email: string;
  status: 'Invited' | 'Active';
  invitedAt: string;
}

function getInitials(email: string) {
  return email.slice(0, 2).toUpperCase();
}

function colorForEmail(email: string) {
  const colors = [
    'bg-violet-500', 'bg-blue-500', 'bg-emerald-500',
    'bg-orange-500', 'bg-pink-500', 'bg-cyan-500',
  ];
  const idx = email.charCodeAt(0) % colors.length;
  return colors[idx];
}

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [email, setEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const { addToast } = useToast();
  const { isPro } = usePlan();

  useEffect(() => {
    const saved = localStorage.getItem('team_members');
    if (saved) setMembers(JSON.parse(saved));
  }, []);

  const saveMembers = (list: Member[]) => {
    setMembers(list);
    localStorage.setItem('team_members', JSON.stringify(list));
  };

  const handleInvite = useCallback(() => {
    if (!isPro) {
      addToast('⭐ Team Collaboration requires the Pro plan. Upgrade at /pricing', 'warning');
      return;
    }
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      addToast('Please enter a valid email address.', 'error');
      return;
    }
    if (members.some((m) => m.email === trimmed)) {
      addToast('This member has already been invited.', 'warning');
      return;
    }
    const newMember: Member = {
      id: `${Date.now()}`,
      email: trimmed,
      status: 'Invited',
      invitedAt: new Date().toLocaleDateString(),
    };
    saveMembers([...members, newMember]);
    setEmail('');
    addToast(`📧 Invitation sent to ${trimmed}!`, 'success');
  }, [email, members, addToast, isPro]);

  const handleRemove = useCallback((id: string) => {
    saveMembers(members.filter((m) => m.id !== id));
    addToast('Member removed.', 'info');
  }, [members, addToast]);

  const handleCopyLink = () => {
    const link = `${window.location.origin}/join?ref=team-${Date.now()}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    addToast('🔗 Invite link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PageTransition className="p-6 md:p-12 max-w-4xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col gap-2 pt-4">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold tracking-tight text-slate-900 flex items-center gap-3"
        >
          <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center">
            <Users className="w-6 h-6 text-violet-600" />
          </div>
          Team Collaboration
        </motion.h2>
        <p className="text-lg text-slate-600 font-medium">
          Invite collaborators to share and study notes together.
        </p>
        {!isPro && (
          <a href="/pricing" className="inline-flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 w-fit font-semibold hover:bg-amber-100 transition-colors">
            <Crown className="w-4 h-4" />
            Pro plan required for Team Collaboration — Upgrade now
          </a>
        )}
      </div>

      {/* Invite Form */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-8 space-y-5"
      >
        <h3 className="font-bold text-slate-900 text-lg">Invite a Member</h3>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
              placeholder="colleague@example.com"
              className="w-full h-12 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
            />
          </div>
          <Button
            onClick={handleInvite}
            className="h-12 px-6 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold gap-2 shadow-lg shadow-violet-500/20"
          >
            <UserPlus className="w-4 h-4" />
            Invite
          </Button>
          <Button
            onClick={handleCopyLink}
            variant="outline"
            className="h-12 px-5 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 gap-2"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Link'}
          </Button>
        </div>
      </motion.div>

      {/* Members List */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-8"
      >
        <h3 className="font-bold text-slate-900 text-lg mb-6 flex items-center justify-between">
          Team Members
          <span className="text-sm font-normal text-slate-400">{members.length} invited</span>
        </h3>

        <AnimatePresence mode="popLayout">
          {members.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <Users className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-400 font-medium">No members yet. Invite your first collaborator!</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <motion.div
                  key={member.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10, scale: 0.95 }}
                  className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-white/50 hover:bg-white transition-all group"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${colorForEmail(member.email)}`}>
                    {getInitials(member.email)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{member.email}</p>
                    <p className="text-xs text-slate-400">Invited on {member.invitedAt}</p>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    member.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      : 'bg-amber-50 text-amber-600 border border-amber-100'
                  }`}>
                    {member.status}
                  </span>
                  <button
                    onClick={() => handleRemove(member.id)}
                    className="p-2 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                    aria-label="Remove member"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </PageTransition>
  );
}
