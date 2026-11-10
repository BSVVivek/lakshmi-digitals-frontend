import React from 'react';
import visitingCardLogo from '../assets/visitingcardlogo.png';
import photographerPhoto from '../assets/nagababuphoto.jpeg';

const profile = {
  name: 'Rayagiri Naga Babu',
  age: '46',
  experience: '30 years',
  locations: 'Vijayawada to Machilipatnam · Available across Andhra Pradesh',
  phone: '9885789793',
  email: 'lakshmistudio6677@gmail.com',
};

const socialLinks = [
  { label: 'Instagram', icon: 'ig', href: 'https://www.instagram.com/rayigiri?xtok=cGVmNTh0dHpqYTlr' },
  { label: 'Facebook', icon: 'f', href: 'https://www.facebook.com/share/19kdYgG9JZ/' },
  { label: 'Gmail', icon: '✉', href: `mailto:${profile.email}` },
  { label: 'WhatsApp', icon: 'whatsapp', href: `https://wa.me/91${profile.phone}` },
];

export default function Home() {
  return (
    <section className="home-page popup-container" aria-labelledby="home-title">
      <div className="eyebrow"><span className="eyebrow-line" /> PHOTOGRAPHY & VIDEOGRAPHY</div>

      <div className="profile-card glass-card">
        <div className="portrait-column">
          <div className="portrait-frame">
            <img className="profile-portrait" src={photographerPhoto} alt={profile.name} />
            <span className="portrait-caption">PHOTOGRAPHER · VIDEOGRAPHER</span>
          </div>
          <div className="social-links" aria-label="Social and contact links">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                className="social-link"
                href={link.href}
                target={link.label === 'Instagram' || link.label === 'Facebook' || link.label === 'WhatsApp' ? '_blank' : undefined}
                rel="noreferrer"
                aria-label={link.label}
                title={link.label}
              >
                <span aria-hidden="true">
                  {link.icon === 'whatsapp' ? (
                    <svg className="whatsapp-icon" viewBox="0 0 24 24" focusable="false">
                      <path d="M20.52 3.48A11.83 11.83 0 0 0 12.1 0C5.55 0 .22 5.32.22 11.87c0 2.1.55 4.15 1.6 5.96L.12 24l6.34-1.66a11.9 11.9 0 0 0 5.64 1.43h.01c6.54 0 11.87-5.32 11.87-11.87 0-3.17-1.23-6.15-3.46-8.42ZM12.1 21.76h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.76.99 1-3.67-.24-.38a9.85 9.85 0 0 1-1.52-5.24C2.17 6.42 6.65 1.94 12.1 1.94c2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.9 6.99c0 5.45-4.44 9.93-9.89 9.93Zm5.43-7.43c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.47-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.08-.8.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.08 4.48.71.31 1.26.5 1.69.64.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35Z" />
                    </svg>
                  ) : link.icon}
                </span>
              </a>
            ))}
          </div>
          <p className="social-caption">FOLLOW ALONG</p>
        </div>

        <div className="profile-copy">
          <p className="profile-kicker">WELCOME TO LAKSHMI DIGITALS</p>
          <h1 id="home-title">Stories, beautifully <em>in focus.</em></h1>
          <p className="profile-intro">
            Photography and videography for the people, places, and once-in-a-lifetime moments that make your story yours.
          </p>
          <div className="profile-divider" />
          <div className="profile-details">
            <div className="detail-item">
              <span className="detail-icon" aria-hidden="true">✦</span>
              <div><small>PHOTOGRAPHER & VIDEOGRAPHER</small><strong>{profile.name}</strong></div>
            </div>
            <div className="detail-item">
              <span className="detail-icon" aria-hidden="true">◷</span>
              <div><small>BEHIND THE LENS</small><strong>{profile.experience} of experience</strong></div>
            </div>
            <div className="detail-item">
              <span className="detail-icon" aria-hidden="true">✧</span>
              <div><small>PHOTOGRAPHER&apos;S AGE</small><strong>{profile.age}</strong></div>
            </div>
            <div className="detail-item">
              <span className="detail-icon" aria-hidden="true">⌖</span>
              <div><small>STUDIO & SERVICE AREAS</small><strong>{profile.locations}</strong></div>
            </div>
            <div className="detail-item">
              <span className="detail-icon" aria-hidden="true">↗</span>
              <div>
                <small>LET&apos;S CONNECT</small>
                <strong><a href={`tel:+91${profile.phone}`}>+91 {profile.phone}</a></strong>
                <a className="detail-email" href={`mailto:${profile.email}`}>{profile.email}</a>
              </div>
            </div>
          </div>
          <a className="contact-cta" href={`mailto:${profile.email}`}>
            Enquire about a shoot <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>

      <img
        className="studio-visiting-card"
        src={visitingCardLogo}
        alt="Lakshmi Digitals photography and videography visiting card"
      />

      <div className="home-note">
        <span>01</span>
        <p>Every frame holds a feeling. Let&apos;s make yours unforgettable.</p>
        <span className="note-rule" />
      </div>
    </section>
  );
}
