import React, { useState, useEffect } from 'react';
import { Home, User, Mail, Github, Linkedin, Twitter, Code2, Briefcase, ExternalLink, Coffee } from 'lucide-react';
import { AboutPageData } from '../types';
import { aboutPageApi } from '../services/api';
import { LazyImage } from '../components/LazyImage';
import { motion } from 'motion/react';

function AsyncAvatarImg({ src, alt, className }: { src?: string | null; alt?: string; className?: string }) {
  return <LazyImage src={src} alt={alt} className={className} />;
}

export function About() {
  const [aboutData, setAboutData] = useState<AboutPageData>({
    profile: {
      name: '张三',
      title: '全栈开发工程师',
      description: '我是一名热爱技术的开发者，专注于Web开发和用户体验设计。拥有5年以上的开发经验，擅长使用现代化的技术栈构建高质量的应用程序。喜欢探索新技术，致力于创造简洁优雅的解决方案。',
      avatar: '/images/image_1775552235687.png',
      socialLinks: {
        github: '#',
        linkedin: '#',
        twitter: '#'
      }
    },
    stats: {
      experience: '5+',
      projects: '50+',
      contributions: '12'
    },
    skills: {
      frontend: ['React', 'Vue', 'TypeScript', 'TailwindCSS', 'Next.js'],
      backend: ['Node.js', 'Python', 'MongoDB', 'PostgreSQL', 'Redis'],
      design: ['Figma', 'Sketch', 'Adobe XD', 'Photoshop'],
      other: ['Git', 'Docker', 'AWS', 'CI/CD', 'Linux']
    },
    contact: {
      email: 'contact@example.com',
      github: 'github.com/username'
    },
    experience: [
      {
        position: '高级前端工程师',
        company: '某科技公司',
        period: '2022 - 至今',
        description: '负责公司核心产品的前端架构设计和开发，带领团队完成多个重要项目，优化应用性能，提升用户体验。',
        color: '#3b82f6'
      },
      {
        position: '前端工程师',
        company: '初创公司',
        period: '2020 - 2022',
        description: '参与产品从0到1的开发过程，独立完成多个功能模块，与设计师紧密合作实现像素级还原。',
        color: '#8b5cf6'
      }
    ]
  });

  useEffect(() => {
    const loadAboutData = async () => {
      try {
        const response = await aboutPageApi.getAboutPage();
        if (response) {
          setAboutData({
            profile: JSON.parse(response.profile),
            stats: JSON.parse(response.stats),
            skills: JSON.parse(response.skills),
            contact: JSON.parse(response.contact),
            experience: JSON.parse(response.experience)
          });
        }
      } catch (error) {
        console.error('Failed to load about page data:', error);
      }
    };

    loadAboutData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    }
  };

  return (
    <div className="relative z-10 min-h-screen py-6">
      <motion.main
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <motion.div variants={itemVariants} className="lg:col-span-3 relative group rounded-2xl p-[1px] bg-gradient-to-br from-blue-500/30 via-purple-500/30 to-pink-500/30 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="h-full bg-white/10 rounded-2xl p-4 sm:p-6 relative z-10 border border-white/10" style={{ backdropFilter: 'blur(12px)' }}>
              <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start">
                <div className="flex-shrink-0 relative">
                  <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 overflow-hidden border border-white/20 shadow-xl">
                    <AsyncAvatarImg
                      src={aboutData.profile.avatar}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="flex-1">
                  <motion.h2
                    className="text-white text-2xl sm:text-3xl font-bold mb-1 tracking-tight font-buding"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.05 }}
                  >
                    {aboutData.profile.name}
                  </motion.h2>
                  <motion.div
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-sm sm:text-base font-medium mb-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Code2 size={12} />
                    {aboutData.profile.title}
                  </motion.div>
                  <motion.p
                    className="text-white/80 leading-relaxed mb-4 text-sm sm:text-base"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                  >
                    {aboutData.profile.description}
                  </motion.p>

                  <motion.div
                    className="flex gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <a href={aboutData.profile.socialLinks.github} className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 hover:scale-110 transition-all duration-300 shadow-lg backdrop-blur-sm">
                      <Github size={15} />
                    </a>
                    <a href={aboutData.profile.socialLinks.linkedin} className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 hover:scale-110 transition-all duration-300 shadow-lg backdrop-blur-sm">
                      <Linkedin size={15} />
                    </a>
                    <a href={aboutData.profile.socialLinks.twitter} className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 hover:scale-110 transition-all duration-300 shadow-lg backdrop-blur-sm">
                      <Twitter size={15} />
                    </a>
                  </motion.div>
                </div>

                <div className="flex-shrink-0 w-full lg:w-56">
                  <div className="grid grid-cols-3 lg:grid-cols-1 gap-2 sm:gap-3">
                    <div className="bg-white/5 rounded-lg sm:rounded-xl p-2 sm:p-3 border border-white/5 hover:border-white/10 transition-all duration-300 text-center lg:text-left">
                      <div className="text-lg sm:text-xl font-bold text-white mb-0.5">{aboutData.stats.experience}</div>
                      <div className="text-white/60 text-[10px] sm:text-xs font-medium">年工作经验</div>
                    </div>
                    <div className="bg-white/5 rounded-lg sm:rounded-xl p-2 sm:p-3 border border-white/5 hover:border-white/10 transition-all duration-300 text-center lg:text-left">
                      <div className="text-lg sm:text-xl font-bold text-white mb-0.5">{aboutData.stats.projects}</div>
                      <div className="text-white/60 text-[10px] sm:text-xs font-medium">完成项目</div>
                    </div>
                    <div className="bg-white/5 rounded-lg sm:rounded-xl p-2 sm:p-3 border border-white/5 hover:border-white/10 transition-all duration-300 text-center lg:text-left">
                      <div className="text-lg sm:text-xl font-bold text-white mb-0.5">{aboutData.stats.contributions}</div>
                      <div className="text-white/60 text-[10px] sm:text-xs font-medium">开源贡献</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="lg:col-span-2 relative rounded-2xl p-[1px] bg-white/10 overflow-hidden">
            <div className="h-full bg-white/10 rounded-2xl p-4 sm:p-6 relative z-10 border border-white/10" style={{ backdropFilter: 'blur(12px)' }}>
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-white text-base sm:text-lg font-medium flex items-center gap-2 font-buding">
                  <Coffee size={16} className="text-orange-400" />
                  技能专长
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { title: '前端开发', skills: aboutData.skills.frontend, color: 'from-blue-500 to-cyan-500', iconColor: 'text-cyan-400', bg: 'bg-blue-500/10' },
                  { title: '后端开发', skills: aboutData.skills.backend, color: 'from-purple-500 to-pink-500', iconColor: 'text-pink-400', bg: 'bg-purple-500/10' },
                  { title: '设计工具', skills: aboutData.skills.design, color: 'from-orange-500 to-red-500', iconColor: 'text-orange-400', bg: 'bg-orange-500/10' },
                  { title: '其他技能', skills: aboutData.skills.other, color: 'from-emerald-500 to-teal-500', iconColor: 'text-emerald-400', bg: 'bg-emerald-500/10' }
                ].map((category, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ y: -2 }}
                    className="bg-white/5 rounded-xl p-4 border border-white/5 hover:border-white/20 transition-all duration-300"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center shadow-lg`}>
                        <Code2 size={15} className="text-white" />
                      </div>
                      <span className="text-white text-sm font-medium">{category.title}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {category.skills.map((skill, index) => (
                        <span key={index} className={`px-2 py-1 rounded-md ${category.bg} ${category.iconColor} text-[10px] sm:text-xs font-medium border border-white/5 backdrop-blur-sm`}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="relative rounded-2xl p-[1px] bg-white/10 overflow-hidden">
            <div className="h-full bg-white/10 rounded-2xl p-4 sm:p-5 relative z-10 border border-white/10" style={{ backdropFilter: 'blur(12px)' }}>
              <h3 className="text-white text-base sm:text-lg font-medium mb-4 sm:mb-5 flex items-center gap-2 font-buding">
                <Mail size={16} className="text-blue-500" />
                联系方式
              </h3>
              <div className="space-y-2.5 sm:space-y-3">
                <a href={`mailto:${aboutData.contact.email}`} className="group flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/5 hover:border-white/20 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-500/20 flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform">
                    <Mail size={16} className="text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0 relative z-10">
                    <div className="text-white/60 text-[10px] sm:text-xs mb-0.5 font-medium">电子邮箱</div>
                    <div className="text-white text-xs sm:text-sm truncate font-medium">{aboutData.contact.email}</div>
                  </div>
                  <ExternalLink size={14} className="text-white/30 group-hover:text-white/80 transition-colors relative z-10 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0" />
                </a>

                <a href={`https://${aboutData.contact.github}`} className="group flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/5 hover:border-white/20 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-purple-500/20 flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform">
                    <Github size={16} className="text-purple-500" />
                  </div>
                  <div className="flex-1 min-w-0 relative z-10">
                    <div className="text-white/60 text-[10px] sm:text-xs mb-0.5 font-medium">GitHub</div>
                    <div className="text-white text-xs sm:text-sm truncate font-medium">{aboutData.contact.github}</div>
                  </div>
                  <ExternalLink size={14} className="text-white/30 group-hover:text-white/80 transition-colors relative z-10 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0" />
                </a>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="lg:col-span-3 relative rounded-2xl p-[1px] bg-white/10 overflow-hidden">
            <div className="h-full bg-white/10 rounded-2xl p-4 sm:p-6 relative z-10 border border-white/10" style={{ backdropFilter: 'blur(12px)' }}>
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-white text-base sm:text-lg font-medium flex items-center gap-2 font-buding">
                  <Briefcase size={16} className="text-pink-400" />
                  工作经历
                </h3>
              </div>

              <div className="space-y-4 sm:space-y-6">
                {aboutData.experience.map((exp, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="relative pl-6 sm:pl-0"
                  >
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
                      <div className="hidden sm:flex flex-shrink-0 w-28 pt-1.5 justify-end">
                        <span className="text-white/60 text-xs font-medium tracking-wider">{exp.period}</span>
                      </div>

                      <div className="relative flex-shrink-0 sm:hidden mb-1.5">
                         <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-white/10 text-white/80">
                           {exp.period}
                         </span>
                      </div>

                      <div className="hidden sm:block absolute left-[7.5rem] top-2.5 bottom-[-2.5rem] w-px bg-white/10 last:hidden"></div>
                      <div className="hidden sm:flex absolute left-[7rem] top-2 w-3 h-3 rounded-full border-4 border-[#1f1f1f] shadow-[0_0_0_2px_rgba(255,255,255,0.2)] z-10" style={{ backgroundColor: exp.color }}></div>

                      <div className="flex-1 bg-white/5 rounded-xl p-4 sm:p-5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all duration-300">
                        <div className="flex items-center justify-between mb-1.5">
                          <h4 className="text-white text-sm sm:text-base font-bold font-buding">{exp.position}</h4>
                          <div
                            className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center opacity-80"
                            style={{ backgroundColor: `${exp.color}20`, color: exp.color }}
                          >
                            <Briefcase size={14} />
                          </div>
                        </div>
                        <p style={{ color: exp.color }} className="text-xs sm:text-sm font-medium mb-2 sm:mb-3 flex items-center gap-1.5">
                          {exp.company}
                        </p>
                        <p className="text-white/70 text-xs sm:text-sm leading-relaxed">
                          {exp.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
}