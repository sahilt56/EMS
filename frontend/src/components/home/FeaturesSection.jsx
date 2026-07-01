import React, { memo } from 'react';

const FeaturesSection = () => {
  const features = [
    {
      title: 'Custom QR Check-ins',
      description: 'Streamline entry with secure, scannable QR codes for every ticket. Say goodbye to long lines.',
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
      )
    },
    {
      title: 'Affiliate Tracking',
      description: 'Empower attendees to sell tickets for you. Track referrals seamlessly with unique tracking links.',
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      )
    },
    {
      title: 'Real-time Analytics',
      description: 'Monitor sales, revenue, and attendee demographics in real-time through an intuitive dashboard.',
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    }
  ];

  return (
    <div id="features" className="bg-slate-950 border-t border-brand-500/10 py-24 w-full mt-10 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">Why Host With Us?</h2>
        <p className="max-w-2xl mx-auto text-sm sm:text-base lg:text-lg text-slate-400 mb-16 font-medium leading-relaxed">
          Our platform provides organizers with cutting-edge tools to maximize attendance and deliver seamless event experiences.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="bg-slate-900 border border-brand-500/20 rounded-[2.5rem] p-8 sm:p-10 text-left hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand-500/10 hover:border-brand-500/40 transition-all duration-300 group">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-brand-600 to-brand-500 flex items-center justify-center mb-8 group-hover:from-brand-500 group-hover:to-secondary-500 group-hover:rotate-6 transition-all duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-black text-white mb-4 tracking-wide">{feature.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default memo(FeaturesSection);
