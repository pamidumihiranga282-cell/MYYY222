import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, MessageCircle, Send } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import toast from 'react-hot-toast';

const ContactPage: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return toast.error('Please fill required fields');
    setSending(true);
    try {
      await addDoc(collection(db, 'contacts'), { ...form, createdAt: serverTimestamp(), read: false });
      toast.success('Message sent! We\'ll get back to you soon. 🙏');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (e) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-[#0d0500] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
            Contact <span className="text-amber-400">Us</span>
          </h1>
          <p className="text-amber-200/50">We'd love to hear from you. Send us a message!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-[#1a0800] border border-amber-900/30 rounded-2xl p-6">
              <h3 className="text-white font-semibold text-lg mb-6">Get in Touch</h3>
              <div className="space-y-5">
                {[
                  { icon: <Phone size={18} />, label: 'Phone', value: '0707070872', href: 'tel:0707070872' },
                  { icon: <Mail size={18} />, label: 'Email', value: 'mrmshopping2025@gmail.com', href: 'mailto:mrmshopping2025@gmail.com' },
                  { icon: <MapPin size={18} />, label: 'Address', value: 'Anuradhapura, Sri Lanka', href: '#' },
                  { icon: <Clock size={18} />, label: 'Hours', value: 'Mon-Sat: 9AM–8PM\nSun: 10AM–6PM', href: '#' },
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-amber-500/20 border border-amber-500/30 rounded-xl flex items-center justify-center text-amber-400 flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-amber-400 text-xs font-medium mb-0.5">{item.label}</div>
                      <a href={item.href} className="text-amber-200/70 text-sm hover:text-amber-300 transition-colors whitespace-pre-line">{item.value}</a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* WhatsApp */}
            <a
              href="https://wa.me/94707070872"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-green-900/30 border border-green-700/30 rounded-2xl p-5 hover:bg-green-900/50 transition-colors group"
            >
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center text-white group-hover:bg-green-500 transition-colors">
                <MessageCircle size={22} />
              </div>
              <div>
                <div className="text-white font-semibold">Chat on WhatsApp</div>
                <div className="text-green-400 text-sm">Quick response guaranteed!</div>
              </div>
            </a>

            {/* Map placeholder */}
            <div className="bg-[#1a0800] border border-amber-900/30 rounded-2xl p-6">
              <h3 className="text-amber-400 font-semibold mb-3 text-sm">Our Location</h3>
              <div className="bg-amber-900/20 rounded-xl h-40 flex items-center justify-center">
                <div className="text-center">
                  <MapPin size={32} className="text-amber-500 mx-auto mb-2" />
                  <p className="text-amber-200/50 text-sm">Anuradhapura</p>
                  <p className="text-amber-200/30 text-xs">Sri Lanka</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            <div className="bg-[#1a0800] border border-amber-900/30 rounded-2xl p-8">
              <h3 className="text-white font-semibold text-lg mb-6">Send a Message</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-amber-300 text-xs font-medium block mb-1">Full Name *</label>
                    <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full bg-amber-950/30 border border-amber-800/30 text-white placeholder-amber-200/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                      placeholder="John Silva" required />
                  </div>
                  <div>
                    <label className="text-amber-300 text-xs font-medium block mb-1">Phone</label>
                    <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      className="w-full bg-amber-950/30 border border-amber-800/30 text-white placeholder-amber-200/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                      placeholder="0707070872" />
                  </div>
                </div>
                <div>
                  <label className="text-amber-300 text-xs font-medium block mb-1">Email *</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full bg-amber-950/30 border border-amber-800/30 text-white placeholder-amber-200/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                    placeholder="you@example.com" required />
                </div>
                <div>
                  <label className="text-amber-300 text-xs font-medium block mb-1">Subject</label>
                  <input type="text" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    className="w-full bg-amber-950/30 border border-amber-800/30 text-white placeholder-amber-200/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                    placeholder="How can we help?" />
                </div>
                <div>
                  <label className="text-amber-300 text-xs font-medium block mb-1">Message *</label>
                  <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    className="w-full bg-amber-950/30 border border-amber-800/30 text-white placeholder-amber-200/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors h-36 resize-none"
                    placeholder="Tell us how we can help you..." required />
                </div>
                <button type="submit" disabled={sending}
                  className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white py-4 rounded-xl font-semibold transition-all hover:scale-[1.02] disabled:opacity-60">
                  {sending ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send size={18} />}
                  {sending ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
