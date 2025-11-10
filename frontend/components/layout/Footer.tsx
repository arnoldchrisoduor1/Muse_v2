// components/layout/Footer.tsx
"use client";
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Twitter, 
  Github, 
  MessageCircle, 
  Mail,
  ExternalLink,
  BookOpen,
  Users,
  Gem
} from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Platform',
      links: [
        { label: 'Collective Consciousness', href: '/collective' },
        { label: 'Collaborative Writing', href: '/collaborate' },
        { label: 'Anonymous Publishing', href: '/anonymous' },
        { label: 'NFT Marketplace', href: '/marketplace' },
        { label: 'DAO Governance', href: '/dao' },
      ]
    },
    {
      title: 'Resources',
      links: [
        { label: 'Documentation', href: '/docs', icon: ExternalLink },
        { label: 'Tutorials', href: '/tutorials' },
        { label: 'Blog', href: '/blog' },
        { label: 'Community Guidelines', href: '/guidelines' },
        { label: 'Help Center', href: '/help' },
      ]
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: '/about' },
        { label: 'Roadmap', href: '/roadmap' },
        { label: 'Careers', href: '/careers' },
        { label: 'Press Kit', href: '/press' },
        { label: 'Contact', href: '/contact' },
      ]
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Cookie Policy', href: '/cookies' },
        { label: 'Licensing', href: '/licensing' },
        { label: 'Security', href: '/security' },
      ]
    }
  ];

  const socialLinks = [
    {
      icon: Twitter,
      label: 'Twitter',
      href: 'https://twitter.com/collectivepoetry',
      color: 'hover:text-blue-400'
    },
    {
      icon: Github,
      label: 'GitHub',
      href: 'https://github.com/collectivepoetry',
      color: 'hover:text-gray-400'
    },
    {
      icon: MessageCircle,
      label: 'Discord',
      href: 'https://discord.gg/collectivepoetry',
      color: 'hover:text-purple-400'
    },
    {
      icon: Mail,
      label: 'Email',
      href: 'mailto:hello@collectivepoetry.xyz',
      color: 'hover:text-red-400'
    }
  ];

  const stats = [
    { value: '2,847+', label: 'Poems Created' },
    { value: '892+', label: 'Active Poets' },
    { value: '34.2 ETH', label: 'DAO Treasury' },
    { value: '1,567+', label: 'Collective Queries' }
  ];

  return (
    <footer className="bg-bg-primary/80 backdrop-blur-xl border-t border-white/10">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Top Section - Brand & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-90 from-secondary to-primary rounded-lg flex items-center justify-center">
                <Sparkles className="text-white" size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold gradient-text">Collective Poetry</h3>
                <p className="text-text-secondary text-sm">
                  Where AI, blockchain, and poetry converge
                </p>
              </div>
            </div>
            
            <p className="text-text-secondary max-w-md text-sm leading-relaxed">
              A revolutionary platform combining collective AI consciousness, 
              fractional NFT ownership, and anonymous publishing for poets worldwide. 
              Join us in reimagining the future of creative expression.
            </p>

            {/* Social Links */}
            <div className="flex gap-4 pt-2">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-2 rounded-lg bg-white/5 border border-white/10 text-text-muted transition-all ${social.color}`}
                    aria-label={social.label}
                  >
                    <Icon size={18} />
                  </motion.a>
                );
              })}
            </div>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="text-center p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="text-xl font-bold text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-text-secondary text-sm">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Links Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {footerSections.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: sectionIndex * 0.1 }}
            >
              <h4 className="font-semibold text-text-primary mb-4 text-sm uppercase tracking-wider">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => {
                  const Icon = link.icon;
                  return (
                    <motion.li
                      key={link.label}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: (sectionIndex * 0.1) + (linkIndex * 0.05) }}
                    >
                      <a
                        href={link.href}
                        className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors text-sm group"
                      >
                        {link.label}
                        {Icon && (
                          <Icon 
                            size={12} 
                            className="opacity-0 group-hover:opacity-100 transition-opacity" 
                          />
                        )}
                      </a>
                    </motion.li>
                  );
                })}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          {/* Copyright */}
          <div className="text-text-muted text-sm">
            © {currentYear} Collective Poetry. All rights reserved.
          </div>

          {/* Additional Links */}
          <div className="flex items-center gap-6 text-sm">
            <span className="text-text-muted">
              Built with ❤️ for the poetry community
            </span>
            <div className="flex items-center gap-4 text-text-secondary">
              <span className="flex items-center gap-1">
                <BookOpen size={14} />
                v1.0.0
              </span>
              <span className="flex items-center gap-1">
                <Users size={14} />
                Decentralized
              </span>
              <span className="flex items-center gap-1">
                <Gem size={14} />
                Web3 Native
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}