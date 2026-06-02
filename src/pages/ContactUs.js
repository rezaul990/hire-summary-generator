import React, { useState } from 'react';
import './ContactUs.css';

function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create WhatsApp message
    const whatsappMessage = `*New Contact Form Submission*\n\n*Name:* ${formData.name}\n*Email:* ${formData.email}\n*Subject:* ${formData.subject}\n*Message:* ${formData.message}`;
    const whatsappUrl = `https://wa.me/8801712394851?text=${encodeURIComponent(whatsappMessage)}`;
    
    window.open(whatsappUrl, '_blank');
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };

  return (
    <div className="contact-page">
      <section className="contact-hero">
        <div className="container">
          <h1>Get In Touch</h1>
          <p className="lead">Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
        </div>
      </section>

      <section className="contact-content">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-form-section">
              <h2>Send Us a Message</h2>
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your.email@example.com"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject *</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="What is this about?"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    placeholder="Tell us more about your inquiry..."
                  ></textarea>
                </div>

                <button type="submit" className="submit-btn">
                  <span>📱</span> Send via WhatsApp
                </button>
              </form>
            </div>

            <div className="contact-info-section">
              <h2>Contact Information</h2>
              
              <div className="contact-info-card">
                <div className="info-icon">📱</div>
                <h3>WhatsApp</h3>
                <p>For quick responses and support</p>
                <a href="https://wa.me/8801712394851" target="_blank" rel="noopener noreferrer" className="info-link">
                  +880 1712-394851
                </a>
              </div>

              <div className="contact-info-card">
                <div className="info-icon">👤</div>
                <h3>Facebook</h3>
                <p>Connect with us on social media</p>
                <a href="https://www.facebook.com/rezaul2000" target="_blank" rel="noopener noreferrer" className="info-link">
                  Visit Profile
                </a>
              </div>

              <div className="contact-info-card">
                <div className="info-icon">💬</div>
                <h3>Support Hours</h3>
                <p>We typically respond within 24 hours</p>
                <p className="hours">Monday - Saturday: 9 AM - 6 PM</p>
              </div>

              <div className="contact-info-card">
                <div className="info-icon">🌐</div>
                <h3>Website</h3>
                <p>Access the platform anytime</p>
                <a href="https://rezaulkarim.shop" target="_blank" rel="noopener noreferrer" className="info-link">
                  rezaulkarim.shop
                </a>
              </div>
            </div>
          </div>

          <div className="faq-section">
            <h2>Frequently Asked Questions</h2>
            <div className="faq-grid">
              <div className="faq-item">
                <h3>How do I get started?</h3>
                <p>Simply sign in with your Google account and select your area during signup. You'll have immediate access to upload data and generate reports.</p>
              </div>
              <div className="faq-item">
                <h3>Is my data secure?</h3>
                <p>Yes, we use Google OAuth for authentication and industry-standard encryption. Your data is stored securely and only accessible to authorized users.</p>
              </div>
              <div className="faq-item">
                <h3>Can I use this on mobile?</h3>
                <p>Absolutely! The platform is fully responsive and works great on mobile devices. You can even share reports as images directly to WhatsApp or Telegram.</p>
              </div>
              <div className="faq-item">
                <h3>What file formats are supported?</h3>
                <p>We support Excel files (.xls and .xlsx) up to 10MB in size. Simply upload your collection report and we'll handle the rest.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ContactUs;
