import { useState } from 'react';
import { CheckCircle, Globe, Lightbulb, Mail, MapPin, Phone, Send, Target } from 'lucide-react';
import { useToast } from '../../components/common/Toast';

export default function AboutUsPage() {
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    await new Promise(r => setTimeout(r, 1000));
    showToast('Message sent! We will get back to you soon.', 'success');
    setForm({ name: '', email: '', subject: '', message: '' });
    setSending(false);
  };

  return (
    <div className="min-h-screen py-16">
      <div className="editorial-shell">
        <header className="max-w-3xl mb-14">
          <p className="eyebrow text-slate-500 mb-4">About VIVAATHI</p>
          <h1 className="font-display text-5xl sm:text-6xl font-bold text-[#06192b] leading-tight">
            Infrastructure for the next generation of competitive debate.
          </h1>
          <p className="text-slate-600 text-lg leading-8 mt-6">
            VIVAATHI brings tournament setup, live scoring, participant records, and debate community features into one clean operating system.
          </p>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-14">
          {[
            {
              icon: Target,
              title: 'Our Mission',
              content: 'Remove the friction of tournament management so organizers and speakers can focus on sharper argumentation.',
            },
            {
              icon: Lightbulb,
              title: 'Why We Started',
              content: 'Manual score sheets, scattered messages, and spreadsheet chaos made strong competitions harder to run than they needed to be.',
            },
            {
              icon: Globe,
              title: 'What We Do',
              content: 'From registration to final verdicts, VIVAATHI gives every role a focused workspace and a shared record of the tournament.',
            },
          ].map((item, index) => (
            <article key={item.title} className={`paper-panel p-8 ${index === 1 ? 'bg-[#06192b] text-white border-[#06192b]' : ''}`}>
              <div className={`w-12 h-12 border flex items-center justify-center mb-8 ${
                index === 1 ? 'bg-[#102a43] border-white/15 text-[#fff0bd]' : 'bg-[#eef5ff] border-slate-300 text-[#06192b]'
              }`}>
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className={`font-display text-2xl font-bold ${index === 1 ? 'text-white' : 'text-[#06192b]'}`}>{item.title}</h3>
              <p className={`text-sm leading-7 mt-4 ${index === 1 ? 'text-slate-300' : 'text-slate-600'}`}>{item.content}</p>
            </article>
          ))}
        </section>

        <section className="paper-panel p-8 mb-14">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {[
              { value: '500+', label: 'Tournaments Managed' },
              { value: '10K+', label: 'Debates Recorded' },
              { value: '50+', label: 'Institutions' },
              { value: '98%', label: 'Satisfaction Rate' },
            ].map(s => (
              <div key={s.label} className="border-r border-slate-300 last:border-0">
                <p className="font-display text-4xl font-bold text-[#8a6a00]">{s.value}</p>
                <p className="eyebrow text-slate-500 mt-2">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-14">
          <h2 className="font-display text-3xl font-bold text-[#06192b] mb-6">What We Stand For</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              'Transparent and fair scoring for every debater',
              'Equal access to quality debate infrastructure',
              'Recognition and rewards for debater excellence',
              'Streamlined workflows for tournament organizers',
              'Real-time data and analytics for performance improvement',
              'Community-driven growth and knowledge sharing',
            ].map(v => (
              <div key={v} className="paper-panel bg-[#eef5ff] flex items-start gap-3 p-4">
                <CheckCircle className="w-5 h-5 text-[#8a6a00] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-slate-700">{v}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-[0.8fr_1fr] gap-8" id="contact">
          <div>
            <p className="eyebrow text-slate-500 mb-3">Contact</p>
            <h2 className="font-display text-3xl font-bold text-[#06192b] mb-6">Get In Touch</h2>
            <div className="space-y-4">
              {[
                { icon: Mail, label: 'Email', value: 'support@vivaathi.com' },
                { icon: MapPin, label: 'Location', value: 'Colombo, Sri Lanka' },
                { icon: Phone, label: 'Phone', value: '+94 11 234 5678' },
              ].map(c => (
                <div key={c.label} className="paper-panel flex items-center gap-3 p-4">
                  <div className="w-10 h-10 bg-[#eef5ff] border border-slate-300 flex items-center justify-center">
                    <c.icon className="w-5 h-5 text-[#06192b]" />
                  </div>
                  <div>
                    <p className="eyebrow text-slate-500">{c.label}</p>
                    <p className="text-sm font-bold text-[#06192b]">{c.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="paper-panel p-7">
            <h3 className="font-display text-2xl font-bold text-[#06192b] mb-5">Send a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="eyebrow text-slate-500 mb-1 block">Name</label>
                  <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    required placeholder="Your name" className="input-field text-sm" />
                </div>
                <div>
                  <label className="eyebrow text-slate-500 mb-1 block">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    required placeholder="your@email.com" className="input-field text-sm" />
                </div>
              </div>
              <div>
                <label className="eyebrow text-slate-500 mb-1 block">Subject</label>
                <input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                  required placeholder="How can we help?" className="input-field text-sm" />
              </div>
              <div>
                <label className="eyebrow text-slate-500 mb-1 block">Message</label>
                <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  required rows={5} placeholder="Tell us more..." className="input-field text-sm resize-none" />
              </div>
              <button type="submit" disabled={sending} className="btn-primary w-full">
                <Send className="w-4 h-4" />
                {sending ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
