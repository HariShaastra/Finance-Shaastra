import React, { useState } from 'react';
import { useAuth } from '../lib/AuthProvider';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Bell, ShieldCheck, MessageSquare, Save, Settings as SettingsIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { requestNotificationPermission } from '../lib/notificationService';

export const Settings = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [settings, setSettings] = useState({
    notificationsEnabled: profile?.notificationsEnabled ?? false,
    smsParsingEnabled: profile?.smsParsingEnabled ?? false,
    recoveryMode: profile?.recoveryMode ?? 'standard',
    familyBudgetGoal: profile?.familyBudgetGoal ?? 0,
    familyMembersCount: profile?.familyMembersCount ?? 1,
  });

  React.useEffect(() => {
    if (profile) {
      setSettings({
        notificationsEnabled: profile.notificationsEnabled ?? false,
        smsParsingEnabled: profile.smsParsingEnabled ?? false,
        recoveryMode: profile.recoveryMode ?? 'standard',
        familyBudgetGoal: profile.familyBudgetGoal ?? 0,
        familyMembersCount: profile.familyMembersCount ?? 1,
      });
    }
  }, [profile]);

  const handleToggle = async (key: 'notificationsEnabled' | 'smsParsingEnabled') => {
    if (key === 'notificationsEnabled' && !settings.notificationsEnabled) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        alert("Please enable notification permissions in your browser settings.");
        return;
      }
    }
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto space-y-8 pb-20"
    >
      <header className="flex items-center space-x-6">
        <div className="p-4 bg-stone-900 text-white rounded-[1.5rem] shadow-xl">
          <SettingsIcon className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-4xl font-black text-stone-900 tracking-tight">App Settings</h2>
          <p className="text-stone-500 font-medium italic mt-1">Customize your Finance Shaastra experience.</p>
        </div>
      </header>

      <div className="bg-white rounded-[2.5rem] border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-10 space-y-12">
          {/* Notifications */}
          <div className="flex items-start justify-between group">
            <div className="space-y-2 max-w-md">
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5 text-amber-600" />
                <h3 className="text-xl font-black text-stone-900">Mindfulness Notifications</h3>
              </div>
              <p className="text-stone-500 text-sm font-medium leading-relaxed">
                Receive nudges only when your financial discipline slips. We'll remind you to log your story if you haven't been active for 3+ days.
              </p>
            </div>
            <button
              onClick={() => handleToggle('notificationsEnabled')}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${settings.notificationsEnabled ? 'bg-amber-500' : 'bg-stone-200'}`}
            >
              <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${settings.notificationsEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="h-px bg-stone-100" />

          {/* SMS Parsing */}
          <div className="flex items-start justify-between group">
            <div className="space-y-2 max-w-md">
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-5 h-5 text-amber-600" />
                <h3 className="text-xl font-black text-stone-900">SMS Transaction Parsing</h3>
              </div>
              <p className="text-stone-500 text-sm font-medium leading-relaxed">
                Enable deterministic parsing for banking SMS. On mobile, this activates the suggestion logic when you paste transaction texts. No data leaves your device.
              </p>
            </div>
            <button
              onClick={() => handleToggle('smsParsingEnabled')}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${settings.smsParsingEnabled ? 'bg-amber-500' : 'bg-stone-200'}`}
            >
              <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${settings.smsParsingEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="h-px bg-stone-100" />

          {/* Recovery Modes */}
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                <h3 className="text-xl font-black text-stone-900">App Focus Mode (Recovery)</h3>
              </div>
              <p className="text-stone-500 text-sm font-medium leading-relaxed">
                Choose a mode to shift the app's emotional tone, indicators, and score metrics to match your specific financial life stage.
              </p>
            </div>

            <select
              value={settings.recoveryMode}
              onChange={(e) => setSettings(prev => ({ ...prev, recoveryMode: e.target.value as any }))}
              className="w-full px-6 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-amber-500 font-bold text-stone-900 text-sm transition-all shadow-sm"
            >
              <option value="standard">Standard (Balanced indicators and goals)</option>
              <option value="debt">Debt Recovery Mode (Gentle reassurance, focus on obligations)</option>
              <option value="student">Student Mode (Focused on skilling & habit consistency over raw income)</option>
              <option value="emergency">Emergency Mode (Survival focused, flags non-essential leaks)</option>
              <option value="rebuilding">Rebuilding Phase (Celebrates incremental, visual micro-wins)</option>
              <option value="family">Family Responsibility (Indian household budgets, medical, shared care)</option>
            </select>

            {settings.recoveryMode === 'family' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 bg-amber-50 border border-amber-100 rounded-3xl space-y-6"
              >
                <h4 className="text-sm font-black text-amber-950 uppercase tracking-widest">👪 Indian Household Allocation Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-amber-800 uppercase tracking-wider">Shared Household Target Goal ($)</label>
                    <input
                      type="number"
                      value={settings.familyBudgetGoal}
                      onChange={(e) => setSettings(prev => ({ ...prev, familyBudgetGoal: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-5 py-3 bg-white border border-amber-200 rounded-xl font-bold focus:ring-2 focus:ring-amber-500 text-stone-900 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-amber-800 uppercase tracking-wider">Number of Dependents / Parents Supported</label>
                    <input
                      type="number"
                      value={settings.familyMembersCount}
                      onChange={(e) => setSettings(prev => ({ ...prev, familyMembersCount: parseInt(e.target.value) || 1 }))}
                      className="w-full px-5 py-3 bg-white border border-amber-200 rounded-xl font-bold focus:ring-2 focus:ring-amber-500 text-stone-900 text-sm"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-amber-800/80 font-medium italic select-none">
                  *This helps us prioritize parent medical bills, education funds, and emergency provisions.
                </p>
              </motion.div>
            )}
          </div>

          <div className="h-px bg-stone-100" />

          {/* Privacy */}
          <div className="p-6 bg-stone-50 rounded-3xl flex items-center space-x-4 border border-stone-100">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <p className="text-xs text-stone-600 font-medium leading-relaxed">
              <strong>Deterministic Processing:</strong> Finance Shaastra uses rule-based logic to parse your data. We do not use AI/cloud models for your transaction parsing. Your privacy is absolute.
            </p>
          </div>
        </div>

        <div className="p-8 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading}
            className={`flex items-center space-x-3 px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${success ? 'bg-emerald-500 text-white' : 'bg-stone-900 text-white hover:bg-stone-800'}`}
          >
            {success ? (
              <>
                <ShieldCheck className="w-5 h-5" />
                <span>Settings Saved</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Save Preferences</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
