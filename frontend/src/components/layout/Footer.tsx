import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Swords, Twitter, Github, Linkedin, Instagram, Mail, Send } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) { setSubscribed(true); setEmail(''); }
  };

  return (
    <footer className="border-t border-white/10 bg-gray-950/80 backdrop-blur-sm mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <img src="/src/assets/logo.png" alt="VIVAATHI" className="w-9 h-9 rounded-xl" />
              <span className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">VIVAATHI</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              The premier platform for managing debate tournaments, tracking scores, and building the next generation of great debaters.
            </p>
            <div className="flex items-center gap-3">
              {[Twitter, Github, Linkedin, Instagram].map((Icon, i) => (
                <button key={i}
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200">
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
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
                    className="text-gray-400 hover:text-white text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Support */}
          <div>
            <h4 className="font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Contact Us', to: '/about#contact' },
                { label: 'FAQ', to: '/about#faq' },
                { label: 'Privacy Policy', to: '/about#privacy' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to}
                    className="text-gray-400 hover:text-white text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <a href="mailto:support@vivaathi.com"
                  className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
                  <Mail className="w-3.5 h-3.5" /> support@vivaathi.com
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h4 className="font-semibold text-white mb-4">Stay Updated</h4>
            <p className="text-gray-400 text-sm mb-4">
              Get the latest tournament news and debate tips delivered to your inbox.
            </p>
            {subscribed ? (
              <div className="glass rounded-xl px-4 py-3 text-green-400 text-sm">
                ✓ You're subscribed! Thanks.
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

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © 2024 VIVAATHI. All rights reserved.
          </p>
          <p className="text-gray-600 text-xs">
            Built for the debate community, by debaters.
          </p>
        </div>
      </div>
    </footer>
  );
}
