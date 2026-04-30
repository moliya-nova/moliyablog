import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { Edit3, Trash2, User, Award, Code2, Mail, Briefcase, Save, Image, Sliders, Play } from 'lucide-react';
import { AboutPageData } from '../types';
import { carouselApi, siteSettingsApi, aboutPageApi } from '../services/api';
import { CoverImageUploader } from '../components/CoverImageUploader';
import { ImageSelectorDialog } from '../components/ImageSelectorDialog';
import { useImageUrl } from '../hooks/useImageUrl';

function AsyncAdminImage({ src, alt, className }: { src?: string; alt?: string; className?: string }) {
  const { url } = useImageUrl(src);
  return <img src={url} alt={alt} className={className} />;
}

function BgPreview({ imageUrl, blur }: { imageUrl: string; blur: number }) {
  const { url } = useImageUrl(imageUrl);
  return (
    <div
      className="absolute inset-0 bg-cover bg-center"
      style={{
        backgroundImage: url ? `url(${url})` : undefined,
        filter: `blur(${blur}px)`,
        transform: "scale(1.05)",
      }}
    />
  );
}

export const AdminPages: React.FC = () => {
  // 背景设置
  const [backgroundSettings, setBackgroundSettings] = useState({
    imageUrl: '/images/image_1776179331073.jpg',
    blur: 0,
    overlayOpacity: 0.3
  });

  // 轮播图设置
  const [carouselSettings, setCarouselSettings] = useState({
    slides: [
      {
        imageUrl: '/images/image_1776079089360.png',
        title: 'ClaudeCode cli',
        category: '编程学习'
      },
      {
        imageUrl: '/images/image_1775563619378.jpg',
        title: 'Web 开发的现代工具链',
        category: 'Web 开发'
      }
    ],
    showTitles: false
  });
  
  const [backgroundEditOpen, setBackgroundEditOpen] = useState(false);
  const [carouselEditOpen, setCarouselEditOpen] = useState(false);

  // 轮播图图片选择器
  const [carouselImageSelectorOpen, setCarouselImageSelectorOpen] = useState(false);
  const [selectedCarouselSlideIndex, setSelectedCarouselSlideIndex] = useState<number | null>(null);

  // About页面数据
  const [aboutData, setAboutData] = useState<AboutPageData>({
    profile: {
      name: 'moliya',
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
      frontend: ['React', 'Vue', 'TypeScript'],
      backend: ['Node.js', 'Python', 'MongoDB'],
      design: ['Figma', 'Sketch', 'Adobe XD'],
      other: ['Git', 'Docker', 'AWS']
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
        color: '#6a9a90'
      },
      {
        position: '前端工程师',
        company: '初创公司',
        period: '2020 - 2022',
        description: '参与产品从0到1的开发过程，独立完成多个功能模块，与设计师紧密合作实现像素级还原。',
        color: '#8a7a9a'
      }
    ]
  });
  
  const [aboutEditOpen, setAboutEditOpen] = useState(false);

  // 从API读取数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 读取About页面数据
        const aboutResponse = await aboutPageApi.getAboutPage();
        if (aboutResponse) {
          setAboutData({
            profile: JSON.parse(aboutResponse.profile),
            stats: JSON.parse(aboutResponse.stats),
            skills: JSON.parse(aboutResponse.skills),
            contact: JSON.parse(aboutResponse.contact),
            experience: JSON.parse(aboutResponse.experience)
          });
        }
        
        // 读取背景设置
        const backgroundResponse = await siteSettingsApi.getBackgroundSettings();
        if (backgroundResponse) {
          setBackgroundSettings(JSON.parse(backgroundResponse));
        }
        
        // 读取轮播图设置
        const carouselResponse = await carouselApi.getCarouselSlides();
        if (carouselResponse && carouselResponse.length > 0) {
          setCarouselSettings({
            slides: carouselResponse.map((slide: any) => ({
              imageUrl: slide.imageUrl,
              title: slide.title,
              category: slide.category
            }))
          });
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };
    
    fetchData();
  }, []);

  // 保存背景设置
  const handleSaveBackgroundSettings = async () => {
    try {
      await siteSettingsApi.saveBackgroundSettings(JSON.stringify(backgroundSettings));
      window.dispatchEvent(new Event('background-updated'));
      setBackgroundEditOpen(false);
      toast.success('背景设置更新成功');
    } catch (error) {
      console.error('保存背景设置失败:', error);
      toast.error('更新背景设置失败');
    }
  };
  
  // 保存轮播图设置
  const handleSaveCarouselSettings = async () => {
    try {
      // 清空现有轮播图
      const existingSlides = await carouselApi.getCarouselSlides();
      for (const slide of existingSlides) {
        await carouselApi.deleteCarouselSlide(slide.id);
      }
      
      // 添加新轮播图
      for (let i = 0; i < carouselSettings.slides.length; i++) {
        const slide = carouselSettings.slides[i];
        await carouselApi.createCarouselSlide({
          imageUrl: slide.imageUrl,
          title: slide.title,
          category: slide.category,
          sort: i + 1,
          status: 1
        });
      }
      
      // 保存showTitles设置到siteSettings
      try {
        await siteSettingsApi.saveSiteSettings('showTitles', JSON.stringify(carouselSettings.showTitles));
      } catch (e) {
        console.error('保存轮播图标题显示设置失败:', e);
      }
      
      window.dispatchEvent(new Event('carousel-updated'));
      setCarouselEditOpen(false);
      toast.success('轮播图设置更新成功');
    } catch (error) {
      console.error('保存轮播图设置失败:', error);
      toast.error('更新轮播图设置失败');
    }
  };
  
  // 保存About页面数据
  const handleSaveAboutData = async () => {
    try {
      await aboutPageApi.updateAboutPage({
        profile: JSON.stringify(aboutData.profile),
        stats: JSON.stringify(aboutData.stats),
        skills: JSON.stringify(aboutData.skills),
        contact: JSON.stringify(aboutData.contact),
        experience: JSON.stringify(aboutData.experience)
      });
      window.dispatchEvent(new Event('profile-updated'));
      setAboutEditOpen(false);
      toast.success('About页面数据更新成功');
    } catch (error) {
      console.error('保存About页面数据失败:', error);
      toast.error('更新About页面数据失败');
    }
  };

  // 处理技能标签变化
  const handleSkillChange = (category: keyof typeof aboutData.skills, index: number, value: string) => {
    setAboutData(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [category]: prev.skills[category].map((skill, i) => i === index ? value : skill)
      }
    }));
  };

  // 添加技能标签
  const handleAddSkill = (category: keyof typeof aboutData.skills) => {
    setAboutData(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [category]: [...prev.skills[category], '']
      }
    }));
  };

  // 删除技能标签
  const handleRemoveSkill = (category: keyof typeof aboutData.skills, index: number) => {
    setAboutData(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [category]: prev.skills[category].filter((_, i) => i !== index)
      }
    }));
  };

  // 添加工作经历
  const handleAddExperience = () => {
    setAboutData(prev => ({
      ...prev,
      experience: [...prev.experience, {
        position: '',
        company: '',
        period: '',
        description: '',
        color: '#6a9a90'
      }]
    }));
  };

  // 删除工作经历
  const handleRemoveExperience = (index: number) => {
    setAboutData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-6 w-full">
      
      {/* About页面编辑卡片 */}
      <Card className="h-full">
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">About页面管理</h3>
            <Button onClick={() => setAboutEditOpen(true)}>
              <Edit3 className="h-4 w-4 mr-2" />
              编辑About页面
            </Button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6a9a90] to-[#4a7a70] flex items-center justify-center">
                <User size={24} className="text-white" />
              </div>
              <div>
                <h4 className="text-md font-medium">个人信息</h4>
                <p className="text-sm text-gray-500">{aboutData.profile.name} - {aboutData.profile.title}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#3a5a55] to-[#2a4a45] flex items-center justify-center">
                <Award size={24} className="text-white" />
              </div>
              <div>
                <h4 className="text-md font-medium">统计信息</h4>
                <p className="text-sm text-gray-500">{aboutData.stats.experience} 年经验, {aboutData.stats.projects} 项目, {aboutData.stats.contributions} 贡献</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8a7a9a] to-[#6a5a7a] flex items-center justify-center">
                <Code2 size={24} className="text-white" />
              </div>
              <div>
                <h4 className="text-md font-medium">技能专长</h4>
                <p className="text-sm text-gray-500">前端、后端、设计工具等多种技能</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6a8a9a] to-[#4a6a7a] flex items-center justify-center">
                <Mail size={24} className="text-white" />
              </div>
              <div>
                <h4 className="text-md font-medium">联系方式</h4>
                <p className="text-sm text-gray-500">{aboutData.contact.email} - {aboutData.contact.github}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#9a8a6a] to-[#7a6a4a] flex items-center justify-center">
                <Briefcase size={24} className="text-white" />
              </div>
              <div>
                <h4 className="text-md font-medium">工作经历</h4>
                <p className="text-sm text-gray-500">{aboutData.experience.length} 条工作经历</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 背景设置卡片 */}
      <Card className="h-full">
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Image className="h-5 w-5" />
              背景设置
            </h3>
            <Button onClick={() => setBackgroundEditOpen(true)}>
              <Edit3 className="h-4 w-4 mr-2" />
              编辑背景
            </Button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6a9a90] to-[#4a7a70] flex items-center justify-center">
                <Sliders size={24} className="text-white" />
              </div>
              <div>
                <h4 className="text-md font-medium">背景图片</h4>
                <p className="text-sm text-gray-500">当前背景图片: {backgroundSettings.imageUrl.split('/').pop()}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8a7a9a] to-[#6a5a7a] flex items-center justify-center">
                <Sliders size={24} className="text-white" />
              </div>
              <div>
                <h4 className="text-md font-medium">模糊度</h4>
                <p className="text-sm text-gray-500">当前模糊度: {backgroundSettings.blur}px</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#9a8a6a] to-[#7a6a4a] flex items-center justify-center">
                <Sliders size={24} className="text-white" />
              </div>
              <div>
                <h4 className="text-md font-medium">覆盖层透明度</h4>
                <p className="text-sm text-gray-500">当前透明度: {backgroundSettings.overlayOpacity}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 轮播图设置卡片 */}
      <Card className="h-full">
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Play className="h-5 w-5" />
              轮播图设置
            </h3>
            <Button onClick={() => setCarouselEditOpen(true)}>
              <Edit3 className="h-4 w-4 mr-2" />
              编辑轮播图
            </Button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6a9a90] to-[#4a7a70] flex items-center justify-center">
                <Image size={24} className="text-white" />
              </div>
              <div>
                <h4 className="text-md font-medium">轮播图图片</h4>
                <p className="text-sm text-gray-500">当前图片数量: {carouselSettings.slides.length}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {carouselSettings.slides.map((slide, index) => (
                <div key={index} className="aspect-video rounded-lg overflow-hidden relative">
                  <AsyncAdminImage src={slide.imageUrl} alt={slide.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-2">
                    <h4 className="text-white text-sm font-semibold truncate">{slide.title}</h4>
                    <p className="text-white/80 text-xs truncate">{slide.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* 背景设置对话框 */}
      <Dialog open={backgroundEditOpen} onOpenChange={setBackgroundEditOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>编辑背景设置</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto space-y-6 py-4 scrollbar-hide" style={{ overscrollBehavior: 'contain' }}>
            <div className="space-y-2">
              <Label>背景图片</Label>
              <CoverImageUploader
                value={backgroundSettings.imageUrl}
                onChange={(url) => setBackgroundSettings(prev => ({ ...prev, imageUrl: url }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="blur">模糊度 (px)</Label>
              <Input 
                id="blur" 
                type="number" 
                min="0" 
                max="20" 
                value={backgroundSettings.blur} 
                onChange={(e) => setBackgroundSettings(prev => ({ ...prev, blur: Number(e.target.value) }))} 
                placeholder="请输入模糊度"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="overlayOpacity">覆盖层透明度</Label>
              <Input 
                id="overlayOpacity" 
                type="number" 
                step="0.1" 
                min="0" 
                max="1" 
                value={backgroundSettings.overlayOpacity} 
                onChange={(e) => setBackgroundSettings(prev => ({ ...prev, overlayOpacity: Number(e.target.value) }))} 
                placeholder="请输入透明度"
              />
            </div>
            <div className="mt-4">
              <Label>预览</Label>
              <div className="mt-2 relative h-40 rounded-lg overflow-hidden">
                <BgPreview imageUrl={backgroundSettings.imageUrl} blur={backgroundSettings.blur} />
                <div
                  className="absolute inset-0 bg-black/60"
                  style={{ opacity: backgroundSettings.overlayOpacity }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-white font-semibold">
                  背景预览
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setBackgroundEditOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveBackgroundSettings}>
              <Save className="h-4 w-4 mr-2" />
              保存设置
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 轮播图设置对话框 */}
      <Dialog open={carouselEditOpen} onOpenChange={setCarouselEditOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>编辑轮播图设置</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto space-y-6 py-4 scrollbar-hide" style={{ overscrollBehavior: 'contain' }}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>轮播图图片</Label>
                <div className="flex items-center gap-2">
                  <Label htmlFor="showTitles">显示标题</Label>
                  <input
                    id="showTitles"
                    type="checkbox"
                    checked={carouselSettings.showTitles}
                    onChange={(e) => setCarouselSettings(prev => ({ ...prev, showTitles: e.target.checked }))}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                </div>
              </div>
              {carouselSettings.slides.map((slide, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <AsyncAdminImage src={slide.imageUrl} alt={slide.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Input 
                      value={slide.imageUrl} 
                      onChange={(e) => setCarouselSettings(prev => ({
                        ...prev,
                        slides: prev.slides.map((s, i) => i === index ? { ...s, imageUrl: e.target.value } : s)
                      }))} 
                      placeholder="请输入图片URL"
                    />
                    <Input 
                      value={slide.title} 
                      onChange={(e) => setCarouselSettings(prev => ({
                        ...prev,
                        slides: prev.slides.map((s, i) => i === index ? { ...s, title: e.target.value } : s)
                      }))} 
                      placeholder="请输入标题"
                    />
                    <Input 
                      value={slide.category} 
                      onChange={(e) => setCarouselSettings(prev => ({
                        ...prev,
                        slides: prev.slides.map((s, i) => i === index ? { ...s, category: e.target.value } : s)
                      }))} 
                      placeholder="请输入分类"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedCarouselSlideIndex(index);
                          setCarouselImageSelectorOpen(true);
                        }}
                        type="button"
                      >
                        <Image className="h-4 w-4 mr-2" />
                        选择图片
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500"
                        onClick={() => setCarouselSettings(prev => ({
                          ...prev,
                          slides: prev.slides.filter((_, i) => i !== index)
                        }))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setCarouselSettings(prev => ({
                  ...prev,
                  slides: [...prev.slides, { imageUrl: '', title: '', category: '' }]
                }))}
              >
                添加图片
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCarouselEditOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveCarouselSettings}>
              <Save className="h-4 w-4 mr-2" />
              保存设置
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 轮播图图片选择对话框 */}
      <ImageSelectorDialog
        open={carouselImageSelectorOpen}
        onOpenChange={setCarouselImageSelectorOpen}
        onSelect={(imagePath) => {
          if (selectedCarouselSlideIndex !== null) {
            setCarouselSettings(prev => ({
              ...prev,
              slides: prev.slides.map((slide, i) =>
                i === selectedCarouselSlideIndex ? { ...slide, imageUrl: imagePath } : slide
              )
            }));
          }
        }}
        title="选择轮播图图片"
      />

      {/* About页面编辑对话框 */}
      <Dialog open={aboutEditOpen} onOpenChange={setAboutEditOpen}>
        <DialogContent className="sm:max-w-4xl overflow-hidden">
          <DialogHeader>
            <DialogTitle>编辑About页面</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto space-y-6 py-4 scrollbar-hide" style={{ overscrollBehavior: 'contain' }}>
            {/* 个人信息 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User size={20} />
                个人信息
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">姓名</Label>
                  <Input 
                    id="name" 
                    value={aboutData.profile.name} 
                    onChange={(e) => setAboutData(prev => ({ ...prev, profile: { ...prev.profile, name: e.target.value } }))} 
                    placeholder="请输入姓名"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">职位</Label>
                  <Input 
                    id="title" 
                    value={aboutData.profile.title} 
                    onChange={(e) => setAboutData(prev => ({ ...prev, profile: { ...prev.profile, title: e.target.value } }))} 
                    placeholder="请输入职位"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">个人描述</Label>
                <Textarea 
                  id="description" 
                  value={aboutData.profile.description} 
                  onChange={(e) => setAboutData(prev => ({ ...prev, profile: { ...prev.profile, description: e.target.value } }))} 
                  placeholder="请输入个人描述"
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="avatar">头像URL</Label>
                <Input 
                  id="avatar" 
                  value={aboutData.profile.avatar} 
                  onChange={(e) => setAboutData(prev => ({ ...prev, profile: { ...prev.profile, avatar: e.target.value } }))} 
                  placeholder="请输入头像URL"
                />
              </div>
              <div className="space-y-3">
                <Label>社交链接</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="github">GitHub</Label>
                    <Input 
                      id="github" 
                      value={aboutData.profile.socialLinks.github} 
                      onChange={(e) => {
                        setAboutData(prev => ({
                          ...prev,
                          profile: {
                            ...prev.profile,
                            socialLinks: {
                              ...prev.profile.socialLinks,
                              github: e.target.value
                            }
                          }
                        }));
                      }} 
                      placeholder="请输入GitHub链接"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input 
                      id="linkedin" 
                      value={aboutData.profile.socialLinks.linkedin} 
                      onChange={(e) => {
                        setAboutData(prev => ({
                          ...prev,
                          profile: {
                            ...prev.profile,
                            socialLinks: {
                              ...prev.profile.socialLinks,
                              linkedin: e.target.value
                            }
                          }
                        }));
                      }} 
                      placeholder="请输入LinkedIn链接"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter</Label>
                    <Input 
                      id="twitter" 
                      value={aboutData.profile.socialLinks.twitter} 
                      onChange={(e) => {
                        setAboutData(prev => ({
                          ...prev,
                          profile: {
                            ...prev.profile,
                            socialLinks: {
                              ...prev.profile.socialLinks,
                              twitter: e.target.value
                            }
                          }
                        }));
                      }} 
                      placeholder="请输入Twitter链接"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 统计信息 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Award size={20} />
                统计信息
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="experience">工作经验</Label>
                  <Input 
                    id="experience" 
                    value={aboutData.stats.experience} 
                    onChange={(e) => setAboutData(prev => ({ ...prev, stats: { ...prev.stats, experience: e.target.value } }))} 
                    placeholder="如：5+"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projects">完成项目</Label>
                  <Input 
                    id="projects" 
                    value={aboutData.stats.projects} 
                    onChange={(e) => setAboutData(prev => ({ ...prev, stats: { ...prev.stats, projects: e.target.value } }))} 
                    placeholder="如：50+"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contributions">开源贡献</Label>
                  <Input 
                    id="contributions" 
                    value={aboutData.stats.contributions} 
                    onChange={(e) => setAboutData(prev => ({ ...prev, stats: { ...prev.stats, contributions: e.target.value } }))} 
                    placeholder="如：12"
                  />
                </div>
              </div>
            </div>

            {/* 技能专长 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Code2 size={20} />
                技能专长
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label>前端开发</Label>
                  <div className="space-y-2">
                    {aboutData.skills.frontend.map((skill, index) => (
                      <div key={index} className="flex gap-2">
                        <Input 
                          value={skill} 
                          onChange={(e) => handleSkillChange('frontend', index, e.target.value)} 
                          placeholder="技能名称"
                          className="flex-1"
                        />
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-500"
                          onClick={() => handleRemoveSkill('frontend', index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleAddSkill('frontend')}
                    >
                      添加技能
                    </Button>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label>后端开发</Label>
                  <div className="space-y-2">
                    {aboutData.skills.backend.map((skill, index) => (
                      <div key={index} className="flex gap-2">
                        <Input 
                          value={skill} 
                          onChange={(e) => handleSkillChange('backend', index, e.target.value)} 
                          placeholder="技能名称"
                          className="flex-1"
                        />
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-500"
                          onClick={() => handleRemoveSkill('backend', index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleAddSkill('backend')}
                    >
                      添加技能
                    </Button>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label>设计工具</Label>
                  <div className="space-y-2">
                    {aboutData.skills.design.map((skill, index) => (
                      <div key={index} className="flex gap-2">
                        <Input 
                          value={skill} 
                          onChange={(e) => handleSkillChange('design', index, e.target.value)} 
                          placeholder="技能名称"
                          className="flex-1"
                        />
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-500"
                          onClick={() => handleRemoveSkill('design', index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleAddSkill('design')}
                    >
                      添加技能
                    </Button>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label>其他技能</Label>
                  <div className="space-y-2">
                    {aboutData.skills.other.map((skill, index) => (
                      <div key={index} className="flex gap-2">
                        <Input 
                          value={skill} 
                          onChange={(e) => handleSkillChange('other', index, e.target.value)} 
                          placeholder="技能名称"
                          className="flex-1"
                        />
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-500"
                          onClick={() => handleRemoveSkill('other', index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleAddSkill('other')}
                    >
                      添加技能
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* 联系方式 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Mail size={20} />
                联系方式
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">邮箱</Label>
                  <Input 
                    id="email" 
                    value={aboutData.contact.email} 
                    onChange={(e) => setAboutData(prev => ({ ...prev, contact: { ...prev.contact, email: e.target.value } }))} 
                    placeholder="请输入邮箱"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="githubContact">GitHub</Label>
                  <Input 
                    id="githubContact" 
                    value={aboutData.contact.github} 
                    onChange={(e) => setAboutData(prev => ({ ...prev, contact: { ...prev.contact, github: e.target.value } }))} 
                    placeholder="请输入GitHub地址"
                  />
                </div>
              </div>
            </div>

            {/* 工作经历 */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Briefcase size={20} />
                  工作经历
                </h3>
                <Button variant="ghost" size="sm" onClick={handleAddExperience}>
                  添加工作经历
                </Button>
              </div>
              <div className="space-y-4">
                {aboutData.experience.map((exp, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex justify-end mb-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500"
                        onClick={() => handleRemoveExperience(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`position-${index}`}>职位</Label>
                        <Input 
                          id={`position-${index}`} 
                          value={exp.position} 
                          onChange={(e) => setAboutData(prev => ({
                            ...prev,
                            experience: prev.experience.map((item, i) => i === index ? { ...item, position: e.target.value } : item)
                          }))} 
                          placeholder="请输入职位"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`company-${index}`}>公司</Label>
                        <Input 
                          id={`company-${index}`} 
                          value={exp.company} 
                          onChange={(e) => setAboutData(prev => ({
                            ...prev,
                            experience: prev.experience.map((item, i) => i === index ? { ...item, company: e.target.value } : item)
                          }))} 
                          placeholder="请输入公司名称"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`period-${index}`}>工作时间</Label>
                        <Input 
                          id={`period-${index}`} 
                          value={exp.period} 
                          onChange={(e) => setAboutData(prev => ({
                            ...prev,
                            experience: prev.experience.map((item, i) => i === index ? { ...item, period: e.target.value } : item)
                          }))} 
                          placeholder="如：2022 - 至今"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`color-${index}`}>颜色代码</Label>
                        <Input 
                          id={`color-${index}`} 
                          value={exp.color} 
                          onChange={(e) => setAboutData(prev => ({
                            ...prev,
                            experience: prev.experience.map((item, i) => i === index ? { ...item, color: e.target.value } : item)
                          }))} 
                          placeholder="如：#6a9a90"
                        />
                      </div>
                    </div>
                    <div className="space-y-2 mt-4">
                      <Label htmlFor={`description-${index}`}>工作描述</Label>
                      <Textarea 
                        id={`description-${index}`} 
                        value={exp.description} 
                        onChange={(e) => setAboutData(prev => ({
                          ...prev,
                          experience: prev.experience.map((item, i) => i === index ? { ...item, description: e.target.value } : item)
                        }))} 
                        placeholder="请输入工作描述"
                        rows={3}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAboutEditOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveAboutData}>
              <Save className="h-4 w-4 mr-2" />
              保存并发布
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
