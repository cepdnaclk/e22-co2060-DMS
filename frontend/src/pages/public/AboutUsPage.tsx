import { useState } from 'react';
import { Target, Lightbulb, Globe, Mail, CheckCircle, Send, MapPin, Phone } from 'lucide-react';
import { useToast } from '../../components/common/Toast';

export default function AboutUsPage() {
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    await new Promise(r => setTimeout(r, 1000));
    showToast('Message sent! We\'ll get back to you soon.', 'success');
    setForm({ name: '', email: '', subject: '', message: '' });
    setSending(false);
  };

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">About DebateMS</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Building the infrastructure for the next generation of competitive debate.
          </p>
        </div>

        {/* Mission */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
          {[
            {
              icon: Target,
              title: 'Our Mission',
              color: 'from-blue-500 to-cyan-500',
              content: 'To democratize access to structured debate competitions by providing an all-in-one digital platform that removes the friction of tournament management, scoring, and tracking — so organizers can focus on what matters: great debates.',
            },
            {
              icon: Lightbulb,
              title: 'Why We Started',
              color: 'from-violet-500 to-purple-500',
              content: 'Managing debate tournaments manually was chaotic — spreadsheets, paper score sheets, WhatsApp chains. We believed debaters deserved better. DebateMS was born to bring the same digital sophistication to debate that exists in other competitive sports.',
            },
            {
              icon: Globe,
              title: 'What We Do',
              color: 'from-emerald-500 to-teal-500',
              content: 'From tournament creation to final results, DebateMS handles everything. Organizers create tournaments, judges submit digital score sheets, and debaters track their progress — all in real time, all in one place.',
            },
          ].map(item => (
            <div key={item.title} className="card">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 shadow-lg`}>
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">{item.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.content}</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="card border-blue-500/20 bg-gradient-to-br from-blue-600/5 to-violet-600/5 mb-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {[
              { value: '500+', label: 'Tournaments Managed' },
              { value: '10K+', label: 'Debates Recorded' },
              { value: '50+', label: 'Institutions' },
              { value: '98%', label: 'Satisfaction Rate' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-3xl font-black gradient-text">{s.value}</p>
                <p className="text-gray-400 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">What We Stand For</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              'Transparent and fair scoring for every debater',
              'Equal access to quality debate infrastructure',
              'Recognition and rewards for debater excellence',
              'Streamlined workflows for tournament organizers',
              'Real-time data and analytics for performance improvement',
              'Community-driven growth and knowledge sharing',
            ].map(v => (
              <div key={v} className="flex items-start gap-3 glass rounded-xl p-4">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-300">{v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" id="contact">
          {/* Contact Info */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Get In Touch</h2>
            <div className="space-y-4 mb-8">
              {[
                { icon: Mail, label: 'Email', value: 'support@debatems.com' },
                { icon: MapPin, label: 'Location', value: 'Colombo, Sri Lanka' },
                { icon: Phone, label: 'Phone', value: '+94 11 234 5678' },
              ].map(c => (
                <div key={c.label} className="flex items-center gap-3 glass rounded-xl p-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                    <c.icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{c.label}</p>
                    <p className="text-sm font-medium text-white">{c.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="card">
            <h3 className="font-bold text-white mb-4">Send a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Name</label>
                  <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    required placeholder="Your name" className="input-field text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    required placeholder="your@email.com" className="input-field text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Subject</label>
                <input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                  required placeholder="How can we help?" className="input-field text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Message</label>
                <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  required rows={5} placeholder="Tell us more..." className="input-field text-sm resize-none" />
              </div>
              <button type="submit" disabled={sending}
                className="btn-primary w-full flex items-center justify-center gap-2">
                <Send className="w-4 h-4" />
                {sending ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
