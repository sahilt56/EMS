import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Globe, Users } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const About = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col w-full text-slate-200 font-sans">
      <Navbar />

      <main className="flex-grow pt-28 pb-20 w-full overflow-hidden relative">
        {/* Decorative Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-500/15 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[10%] right-[-10%] w-[30rem] h-[30rem] bg-secondary-500/10 rounded-full blur-[150px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight mb-6">
              Empowering the Next Generation of <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-violet-500">Events</span>
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed font-medium">
              EventFlow is a modern event management platform designed to bridge the gap between event organizers and attendees with cutting-edge technology, real-time lounges, and seamless check-ins.
            </p>
          </motion.div>

          {/* Core Values Section */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24"
          >
            {[
              {
                icon: <Shield className="w-8 h-8 text-brand-400" />,
                title: "Secure & Reliable",
                desc: "Enterprise-grade security ensuring your data and transactions are always safe."
              },
              {
                icon: <Zap className="w-8 h-8 text-yellow-400" />,
                title: "Lightning Fast",
                desc: "Optimized architecture for instant ticketing, real-time chat, and QR scanning."
              },
              {
                icon: <Users className="w-8 h-8 text-emerald-400" />,
                title: "Community Driven",
                desc: "Interactive live lounges to connect attendees before the event even begins."
              },
              {
                icon: <Globe className="w-8 h-8 text-blue-400" />,
                title: "Global Reach",
                desc: "Host virtual or physical events with attendees from anywhere in the world."
              }
            ].map((val, idx) => (
              <motion.div 
                key={idx}
                variants={itemVariants}
                className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm hover:bg-white/10 hover:-translate-y-2 transition-all duration-300"
              >
                <div className="bg-slate-900 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg border border-white/5">
                  {val.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{val.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{val.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Story Section */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-slate-900 rounded-[3rem] p-8 md:p-16 border border-white/10 relative overflow-hidden flex flex-col md:flex-row items-center gap-12"
          >
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand-500/10 to-transparent pointer-events-none"></div>
            
            <div className="md:w-1/2 relative z-10">
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-6">Our Mission</h2>
              <p className="text-slate-400 leading-relaxed mb-6">
                We believe that events are more than just gatherings; they are experiences that shape our lives. Our mission is to provide creators with the ultimate toolkit to host seamless events while giving attendees an unforgettable digital and physical journey.
              </p>
              <p className="text-slate-400 leading-relaxed">
                From built-in AI assistants to real-time communication lounges and instant QR check-ins, we are reimagining the event industry from the ground up.
              </p>
            </div>
            
            <div className="md:w-1/2 relative z-10 w-full aspect-video rounded-2xl overflow-hidden bg-slate-800 border border-white/10 shadow-2xl">
              {/* Decorative graphic instead of image to keep it clean */}
              <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/40 to-brand-400/40 mix-blend-overlay"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border-4 border-white/20 animate-[spin_10s_linear_infinite] flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full border-4 border-brand-400/50 animate-[spin_5s_linear_infinite_reverse]"></div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
