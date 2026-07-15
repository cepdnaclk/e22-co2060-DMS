import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Github, Linkedin, Instagram, Mail, Send } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) { setSubscribed(true); setEmail(''); }
  };

  return (
    <footer className="border-t border-slate-300 bg-white/85 backdrop-blur-sm mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <img src="/logo.png" alt="VIVAATHI" className="w-9 h-9 border border-[#06192b]/20" />
              <span className="font-display font-bold text-xl text-[#06192b]">VIVAATHI</span>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">
              The premier platform for managing debate tournaments, tracking scores, and building the next generation of great debaters.
            </p>
            <div className="flex items-center gap-3">
              {[Twitter, Github, Linkedin, Instagram].map((Icon, i) => (
                <button key={i}
                  className="w-9 h-9 border border-slate-300 flex items-center justify-center text-slate-500 hover:text-[#06192b] hover:bg-[#eef5ff] transition-all duration-200">
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="eyebrow text-[#06192b] mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Home', to: '/' },
                { label: 'Forum', to: '/forum' },
                { label: 'Scoring', to: '/scoring' },
                { label: 'News', to: '/news' },
                { label: 'About Us', to: '/about' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to}
                    className="text-slate-600 hover:text-[#06192b] text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Support */}
          <div>
            <h4 className="eyebrow text-[#06192b] mb-4">Support</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Contact Us', to: '/about#contact' },
                { label: 'FAQ', to: '/about#faq' },
                { label: 'Privacy Policy', to: '/about#privacy' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to}
                    className="text-slate-600 hover:text-[#06192b] text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <a href="mailto:support@vivaathi.com"
                  className="flex items-center gap-2 text-slate-600 hover:text-[#06192b] text-sm transition-colors">
                  <Mail className="w-3.5 h-3.5" /> support@vivaathi.com
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h4 className="eyebrow text-[#06192b] mb-4">Stay Updated</h4>
            <p className="text-slate-600 text-sm mb-4">
              Get the latest tournament news and debate tips delivered to your inbox.
            </p>
            {subscribed ? (
              <div className="glass px-4 py-3 text-emerald-700 text-sm">
                You are subscribed. Thanks.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="input-field text-sm"
                />
                <button type="submit"
                  className="w-full btn-primary text-sm flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" /> Subscribe
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="border-t border-slate-300 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            © 2024 VIVAATHI. All rights reserved.
          </p>
          <p className="text-slate-500 text-xs">
            Built for the debate community, by debaters.
          </p>
        </div>
      </div>
    </footer>
  );
}
