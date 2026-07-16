import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Coins, Gift, Star, Crown, Trophy } from "lucide-react";

export default function Rewards() {
  const rewardCoins = useSelector((state) => state.reward.coins || 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-50 via-orange-50 to-amber-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-4 bg-surface border border-accent-200 px-7 py-5 rounded-2xl shadow-card">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-400 to-accent-500 flex items-center justify-center shadow-md">
              <Coins size={28} className="text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                {rewardCoins.toLocaleString()}
              </h1>
              <p className="text-sm text-accent-700 font-semibold uppercase tracking-wider">
                Reward Coins
              </p>
            </div>
          </div>
          <p className="text-slate-600 mt-4 max-w-md mx-auto">
            Earn coins on every order. Scratch to reveal instant rewards!
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Link to="/home" className="group bg-surface p-6 rounded-2xl shadow-card hover:shadow-card-hover transition-all border border-slate-200 hover:border-brand-200 hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-accent-50 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition">
              <Gift className="w-6 h-6 text-accent-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 text-center">Shop & Earn</h3>
            <p className="text-sm text-slate-500 text-center">Earn 5% coins on every purchase</p>
          </Link>

          <div className="bg-surface p-6 rounded-2xl shadow-card border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Daily Scratch</h3>
            <p className="text-sm text-slate-500">Coming Soon</p>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-6 rounded-2xl shadow-card text-white">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center mx-auto mb-4">
              <Star className="w-6 h-6 text-accent-300" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-center">VIP Status</h3>
            <p className="text-sm text-center text-white/70">Reach 5,000 coins for Premium</p>
            <div className="w-full bg-white/15 rounded-full h-2.5 mt-4 overflow-hidden">
              <div 
                className="bg-white h-2.5 rounded-full transition-all" 
                style={{ width: `${Math.min((rewardCoins / 5000) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="bg-gradient-to-br from-brand-600 to-teal-600 p-6 rounded-2xl shadow-card text-white">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center mx-auto mb-4">
              <Crown className="w-6 h-6 text-accent-300" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-center">Redeem</h3>
            <p className="text-sm text-center text-white/70">Coming Soon</p>
          </div>
        </div>

        <div className="bg-surface rounded-2xl shadow-card border border-slate-200 p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent-50 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-accent-500" />
            </div>
            Recent Rewards
          </h2>
          <div className="text-center py-12 text-slate-400">
            <p className="text-base">Your rewards history will appear here</p>
            <p className="text-sm mt-1.5">Earn more by shopping!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
