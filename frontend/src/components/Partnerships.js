import React from "react";
import "./Partnerships.css";

const Partnerships = () => {
  const tiers = [
    {
      name: "Associate Partner",
      price: "₹5,00,000",
      features: [
        "Quarterly Business Review",
        "2 Priority Support Tickets",
        "Basic Analytics",
        "Co-marketing Opportunities",
      ],
      buttonText: "Get Started",
      highlighted: false,
    },
    {
      name: "Strategic Partner",
      price: "₹12,00,000",
      features: [
        "Everything in Associate",
        "Dedicated Account Manager",
        "API Access & Sandbox",
        "Joint GTM Initiatives",
      ],
      buttonText: "Become a Partner",
      highlighted: true,
    },
    {
      name: "Technology Partner",
      price: "Custom",
      features: [
        "Deep Integration Support",
        "Technical Co-engineering",
        "Solution Architecture",
        "Marketplace Inclusion",
      ],
      buttonText: "Learn More",
      highlighted: false,
    },
  ];

  const benefits = [
    { icon: "📈", title: "Revenue Share", description: "Earn recurring commissions on every referral." },
    { icon: "🤝", title: "Co-Marketing", description: "Run campaigns together and amplify reach." },
    { icon: "⚙️", title: "Priority Access", description: "Early access to new features and beta programs." },
    { icon: "🎓", title: "Certification", description: "Exclusive training and certification for your team." },
  ];

  return (
    <div className="partnership-page">
      <div className="partnership-container">
        
        {/* Header */}
        <div className="partnership-header">
          <h1>
            Partner with <span>Us</span>
          </h1>
          <p>
            Join our ecosystem and build transformative solutions together.
            Select a partnership model that fits your goals.
          </p>
        </div>

        {/* Tiers */}
        <div className="tiers-wrapper">
          {tiers.map((tier, index) => (
            <div
              key={index}
              className={`tier-card ${tier.highlighted ? "highlighted" : ""}`}
            >
              <h3>{tier.name}</h3>

              <div className="tier-price">
                {tier.price}
                {tier.price !== "Custom" && <span>/year</span>}
              </div>

              <ul className="tier-features">
                {tier.features.map((feature, i) => (
                  <li key={i}>
                    <span className="check">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button className="tier-button">
                {tier.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* Benefits */}
        <div className="benefits-strip">
          {benefits.map((benefit, idx) => (
            <div key={idx} className="benefit-item">
              <span className="benefit-icon">{benefit.icon}</span>
              <div>
                <h4>{benefit.title}</h4>
                <p>{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="cta-section">
          <p>
            Ready to accelerate?{" "}
            <a href="#">Contact partnerships</a> or call +1 (800) 555-0199.
          </p>
        </div>

      </div>
    </div>
  );
};

export default Partnerships;