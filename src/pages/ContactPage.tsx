import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Phone, Mail, MapPin, Send, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await addDoc(collection(db, 'contacts'), {
        name, email, message, createdAt: Date.now(), read: false
      });
      toast.success('Message sent! We\'ll get back to you soon. 💌');
      setName(''); setEmail(''); setMessage('');
    } catch (err) {
      toast.error('Failed to send. Try WhatsApp instead!');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-dubai-cream to-gold-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl font-bold text-chocolate-900 mb-3">📞 Contact Us</h1>
          <p className="text-chocolate-500 text-lg">We'd love to hear from you! Get in touch with MRM Shopping</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gold-100">
              <h2 className="font-display text-2xl font-bold text-chocolate-900 mb-6">Get in Touch</h2>
              <div className="space-y-5">
                <a href="tel:0707070872" className="flex items-center gap-4 p-4 rounded-xl bg-gold-50 hover:bg-gold-100 transition group">
                  <div className="w-12 h-12 rounded-xl bg-gold-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition">
                    <Phone size={22} className="text-chocolate-900" />
                  </div>
                  <div>
                    <p className="font-semibold text-chocolate-800">Phone</p>
                    <p className="text-chocolate-500">070 707 0872</p>
                  </div>
                </a>

                <a href="mailto:mrmshopping2025@gmail.com" className="flex items-center gap-4 p-4 rounded-xl bg-gold-50 hover:bg-gold-100 transition group">
                  <div className="w-12 h-12 rounded-xl bg-gold-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition">
                    <Mail size={22} className="text-chocolate-900" />
                  </div>
                  <div>
                    <p className="font-semibold text-chocolate-800">Email</p>
                    <p className="text-chocolate-500">mrmshopping2025@gmail.com</p>
                  </div>
                </a>

                <div className="flex items-center gap-4 p-4 rounded-xl bg-gold-50">
                  <div className="w-12 h-12 rounded-xl bg-gold-500 flex items-center justify-center shrink-0">
                    <MapPin size={22} className="text-chocolate-900" />
                  </div>
                  <div>
                    <p className="font-semibold text-chocolate-800">Address</p>
                    <p className="text-chocolate-500">Anuradhapura, Sri Lanka</p>
                  </div>
                </div>

                <a
                  href="https://wa.me/94707070872"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl bg-green-50 hover:bg-green-100 transition group"
                >
                  <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition">
                    <MessageCircle size={22} className="text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-chocolate-800">WhatsApp</p>
                    <p className="text-green-600">Chat with us on WhatsApp</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gold-100">
              <h3 className="font-display text-xl font-bold text-chocolate-900 mb-4">🕐 Business Hours</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-gold-50">
                  <span className="text-chocolate-600">Monday - Friday</span>
                  <span className="font-semibold text-chocolate-800">9:00 AM - 8:00 PM</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gold-50">
                  <span className="text-chocolate-600">Saturday</span>
                  <span className="font-semibold text-chocolate-800">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-chocolate-600">Sunday</span>
                  <span className="font-semibold text-chocolate-800">10:00 AM - 4:00 PM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gold-100">
            <h2 className="font-display text-2xl font-bold text-chocolate-900 mb-6 flex items-center gap-2">
              <Send className="text-gold-500" /> Send a Message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-chocolate-700 mb-1 block">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Full name"
                  required
                  className="w-full px-4 py-3 bg-gold-50 rounded-xl border border-gold-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 outline-none text-chocolate-800"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-chocolate-700 mb-1 block">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full px-4 py-3 bg-gold-50 rounded-xl border border-gold-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 outline-none text-chocolate-800"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-chocolate-700 mb-1 block">Message</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="How can we help you?"
                  rows={6}
                  required
                  className="w-full px-4 py-3 bg-gold-50 rounded-xl border border-gold-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 outline-none text-chocolate-800 resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="w-full py-3 bg-gradient-to-r from-gold-500 to-gold-400 text-chocolate-900 rounded-xl font-bold text-lg hover:from-gold-400 hover:to-gold-300 transition shadow-lg disabled:opacity-50"
              >
                {sending ? 'Sending...' : 'Send Message 📨'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
