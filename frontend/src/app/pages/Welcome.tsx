import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { BookOpen } from 'lucide-react';
import welcomeVideo from '/wealcome.mp4';

export function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={welcomeVideo} type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-black/30" />

      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-16 h-12 bg-white/30 rounded-full blur-xl"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-10%`,
          }}
          animate={{
            y: ["0vh", "110vh"],
            x: [0, Math.sin(i) * 50],
          }}
          transition={{
            duration: 8 + Math.random() * 10,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "linear",
          }}
        />
      ))}

      <div className="relative z-10 text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
            className="text-6xl md:text-8xl mb-8 text-white drop-shadow-2xl"
            style={{
              fontFamily: "'字魂布丁体', cursive",
              textShadow: "0 4px 20px rgba(0,0,0,0.5), 0 0 40px rgba(255,255,255,0.3)",
            }}
          >
            欢迎来到我的博客
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-2xl text-white mb-16 drop-shadow-lg"
            style={{ textShadow: "0 2px 10px rgba(0,0,0,0.7)" }}
          >
            分享技术见解，记录成长历程，探索无限可能
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex gap-6 justify-center items-center flex-wrap"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/home")}
              className="group relative px-12 py-5 rounded-full overflow-hidden"
              style={{ fontFamily: "'字魂布丁体', cursive" }}
            >
              {/* 渐变边框 */}
              <div className="absolute inset-0 rounded-full p-[1px] bg-gradient-to-r from-white/30 via-white/60 to-white/30" />
              {/* 强毛玻璃背景 */}
              <div className="absolute inset-[1px] rounded-full bg-white/5 backdrop-blur-2xl" />
              {/* 内容 */}
              <div className="relative flex items-center gap-5">
                <BookOpen className="w-7 h-7 text-white/80 group-hover:text-white transition-colors" />
                <span className="text-3xl text-white/80 group-hover:text-white tracking-wider transition-colors" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.3)" }}>
                  进入博客
                </span>
              </div>
              {/* 流光 */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}