import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { User, Mail, Lock, Upload, ArrowLeft, UserPlus, Image } from "lucide-react";
import { userApi, fileApi } from "../services/api";
import { validateImageFile } from "../utils/imageUtils";

export function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordValid, setPasswordValid] = useState<boolean>(false);

  const validatePassword = (pwd: string) => {
    const regex = /^[a-zA-Z0-9]{6,18}$/;
    setPasswordValid(regex.test(pwd));
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setError(validation.error);
        return;
      }
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    validatePassword(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      let avatarPath = '';
      if (avatar) {
        const signResponse = await fileApi.getCosSign('avatar', avatar.name);
        const uploadResponse = await fetch(signResponse.url, {
          method: 'PUT',
          body: avatar,
          headers: {
            'Content-Type': avatar.type,
          },
        });
        if (!uploadResponse.ok) {
          throw new Error('头像上传失败');
        }
        avatarPath = '/' + signResponse.key;
      }
      await userApi.register(username, email, password, avatarPath);
      navigate("/login");
    } catch (err) {
      setError("注册失败，请检查输入信息");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-pink-500 to-rose-500 relative overflow-hidden">
        <div className="absolute inset-0">
          <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1" fill="white" opacity="0.1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                x: [0, Math.random() * 100 - 50],
                y: [0, Math.random() * 100 - 50],
                rotate: [0, 360],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 10 + Math.random() * 10,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <div className="w-4 h-4 bg-white/20 rounded-lg backdrop-blur-sm" />
            </motion.div>
          ))}
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
          <motion.div
            initial={{ scale: 0, rotate: 180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 150, delay: 0.2 }}
            className="mb-8"
          >
            <div className="w-32 h-32 bg-white/10 backdrop-blur-lg rounded-full flex items-center justify-center border-4 border-white/30">
              <UserPlus className="w-16 h-16" />
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-5xl mb-4 text-center"
          >
            开启创作之旅
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-xl text-white/80 text-center max-w-md"
          >
            加入我们的社区，分享你的知识与灵感
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-12 space-y-4 w-full max-w-sm"
          >
            {[
              { icon: "✍️", text: "创作自由" },
              { icon: "🌟", text: "展示才华" },
              { icon: "💬", text: "交流互动" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + i * 0.1 }}
                className="flex items-center gap-4 bg-white/10 backdrop-blur-lg rounded-2xl p-4"
              >
                <div className="text-3xl">{item.icon}</div>
                <span className="text-lg">{item.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-600 hover:text-purple-600 mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>返回首页</span>
          </button>

          <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8">
            <h1 className="text-2xl mb-1 text-gray-800">创建账号</h1>
            <p className="text-gray-500 mb-6 text-sm">填写信息开始你的博客之旅</p>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6">
                <strong className="font-bold">错误：</strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center cursor-pointer overflow-hidden border-4 border-purple-200"
                  >
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <Image className="w-8 h-8 text-purple-400" />
                    )}
                  </motion.div>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 w-7 h-7 bg-purple-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-700 transition-colors shadow-lg"
                  >
                    <Upload className="w-3.5 h-3.5 text-white" />
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1.5">
                  用户名
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="请输入用户名"
                    className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1.5">
                  邮箱
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="请输入邮箱地址"
                    className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1.5">
                  密码
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="请输入密码（6-18位，仅包含英文字母和数字）"
                    className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors text-sm"
                    required
                  />
                </div>
                <div className={`mt-1 text-xs ${passwordValid ? "text-green-500" : "text-red-500"}`}>
                  {passwordValid ? "密码格式正确" : "密码必须为6-18位，仅包含英文字母和数字"}
                </div>
              </div>

              <div className="text-xs text-gray-600">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" className="w-3.5 h-3.5 mt-0.5 accent-purple-600" required />
                  <span>我同意服务条款和隐私政策</span>
                </label>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl hover:shadow-xl transition-shadow flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    <span>注册账号</span>
                  </>
                )}
              </motion.button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                已有账号？
                <button
                  onClick={() => navigate("/login")}
                  className="text-purple-600 hover:text-purple-700 ml-2"
                >
                  立即登录
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}