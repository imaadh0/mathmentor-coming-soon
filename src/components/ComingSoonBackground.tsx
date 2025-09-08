import React, { useState } from "react";
import emailjs from '@emailjs/browser';
import "./ComingSoonBackground.css";
import MathQuiz from "./MathQuiz";
import GlobalMusicToggle from "./GlobalMusicToggle";

const ComingSoonBackground: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isMessageFading, setIsMessageFading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim() || !formData.email.trim()) {
      setSubmitStatus('error');
      return;
    }

    if (!formData.email.includes('@')) {
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // EmailJS configuration using environment variables
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          from_name: formData.name,
          from_email: formData.email,
          to_name: 'MathMentor Team',
          message: `New early access request from ${formData.name} (${formData.email})`,
          reply_to: formData.email
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      setSubmitStatus('success');
      setFormData({ name: '', email: '' }); // Reset form
      setIsMessageFading(false);
      
      // Auto-dismiss success message after 3.5 seconds
      setTimeout(() => {
        setIsMessageFading(true);
        // Actually remove the message after animation completes
        setTimeout(() => {
          setSubmitStatus('idle');
          setIsMessageFading(false);
        }, 500); // Match fadeOut animation duration
      }, 3500);
    } catch (error) {
      console.error('Failed to send email:', error);
      setSubmitStatus('error');
      setIsMessageFading(false);
      
      // Auto-dismiss error message after 2.5 seconds
      setTimeout(() => {
        setIsMessageFading(true);
        // Actually remove the message after animation completes
        setTimeout(() => {
          setSubmitStatus('idle');
          setIsMessageFading(false);
        }, 500); // Match fadeOut animation duration
      }, 2500);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="coming-soon-background">
      {/* Global Music Toggle */}
      <GlobalMusicToggle />
      
      {/* Base Color Fill */}
      <div className="base-color-fill" />

      {/* Grouped Background Image */}
      <div className="bg-image grouped-bg" />

      {/* Dark Overlay with Center Fade */}
      <div className="dark-overlay" />

      {/* Section 1: Coming Soon Header */}
      <section className="hero-section">
        <div className="torch-left">
          <img src="/gifs/torch.gif" alt="Left torch" />
        </div>
        <div className="hero-content">
          <h1 className="coming-soon-title">COMING SOON !!</h1>
          <p className="hero-subtitle">
            Heroes will rise... Guides will lead... Alliances
            <br />
            will be formed... The MathMentor
            <br />
            awaits
          </p>
          <div className="yellow-border-decoration">
            <img src="/images/yellow-border.png" alt="Decorative border" />
          </div>
        </div>
        <div className="torch-right">
          <img src="/gifs/torch.gif" alt="Right torch" />
        </div>
      </section>

      {/* Section 2: Game Content Area */}
      <section className="game-content-section">
        <div className="game-content-container">
          <MathQuiz />
        </div>
      </section>

      {/* Section 3: Contact Us */}
      <section className="contact-us-section">
        <div className="bg-element-1">
          <img src="/images/bg-element-1.png" alt="Background element" />
        </div>
        <div className="contact-us-container">
          <div className="contact-us-background">
            <img src="/images/contactus-bg.png" alt="Contact us background" />
          </div>

          {/* NEW: Headline + Subtitle on the parchment */}
          <div className="contact-copy">
            <h2 className="contact-title">Join the Quest Early !</h2>
            <p className="contact-subtitle">
              Add your name to the adventure scroll!
              <br />
              And be the first to know about{" "}
              <span className="brand">MathMentor</span>
            </p>
          </div>

          <form className="contact-form" onSubmit={handleSubmit}>
            <input 
              type="text" 
              name="name"
              placeholder="Name" 
              className="form-input"
              value={formData.name}
              onChange={handleInputChange}
              disabled={isSubmitting}
            />
            <input 
              type="email" 
              name="email"
              placeholder="Email" 
              className="form-input"
              value={formData.email}
              onChange={handleInputChange}
              disabled={isSubmitting}
            />
            <button 
              type="submit" 
              className="contact-button"
              disabled={isSubmitting}
            >
              <img
                src="/images/Contact-us-btn-bg.png"
                alt={isSubmitting ? "Sending..." : "Contact us button"}
              />
            </button>
            
            {/* Status Messages */}
            {submitStatus === 'success' && (
              <div className={`form-status success ${isMessageFading ? 'fade-out' : ''}`}>
                🎉 Welcome to the quest! You'll be the first to know about MathMentor!
              </div>
            )}
            {submitStatus === 'error' && (
              <div className={`form-status error ${isMessageFading ? 'fade-out' : ''}`}>
                ⚠️ Oops! Please check your information and try again.
              </div>
            )}
          </form>
        </div>
      </section>
    </div>
  );
};

export default ComingSoonBackground;
