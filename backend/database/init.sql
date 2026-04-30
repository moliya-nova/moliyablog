/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.5.27-MariaDB, for Linux (x86_64)
--
-- Host: 127.0.0.1    Database: bloger
-- ------------------------------------------------------
-- Server version	8.0.36

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `about_page`
--

DROP TABLE IF EXISTS `about_page`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `about_page` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `profile` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `stats` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `skills` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `experience` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC COMMENT='关于页面表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `about_page`
--

LOCK TABLES `about_page` WRITE;
/*!40000 ALTER TABLE `about_page` DISABLE KEYS */;
INSERT INTO `about_page` VALUES (1,'{\"name\": \"moliyaa\", \"title\": \"全栈开发工程师\", \"avatar\": \"/avatar/image_1775552235687.png\", \"description\": \"我是一名热爱技术的开发者，专注于Web开发和用户体验设计。擅长使用现代化的技术栈构建高质量的应用程序。喜欢探索新技术，致力于创造简洁优雅的解决方案。\", \"socialLinks\": {\"github\": \"https://github.com/moliya-nova\", \"twitter\": \"#\", \"linkedin\": \"#\"}}','{\"experience\":\"5+\",\"projects\":\"50+\",\"contributions\":\"12\"}','{\"frontend\":[\"React\",\"Vue3\",\"TypeScript\"],\"backend\":[\"Node.js\",\"Python\",\"MongoDB\",\"Java\"],\"design\":[\"Figma\",\"Sketch\",\"Adobe XD\"],\"other\":[\"Git\",\"Docker\",\"AWS\",\"linux\"]}','{\"email\":\"3298755711@qq.com\",\"github\":\"https://github.com/moliya-nova\"}','[{\"position\":\"高级前端工程师\",\"company\":\"某科技公司\",\"period\":\"2022 - 至今\",\"description\":\"负责公司核心产品的前端架构设计和开发，带领团队完成多个重要项目，优化应用性能，提升用户体验。\",\"color\":\"#6a9a90\"},{\"position\":\"前端工程师\",\"company\":\"初创公司\",\"period\":\"2020 - 2022\",\"description\":\"参与产品从0到1的开发过程，独立完成多个功能模块，与设计师紧密合作实现像素级还原。\",\"color\":\"#8a7a9a\"}]','2026-04-13 00:00:00','2026-04-22 07:49:18');
/*!40000 ALTER TABLE `about_page` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `article`
--

DROP TABLE IF EXISTS `article`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `article` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `excerpt` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `author_id` bigint NOT NULL,
  `category_id` bigint NOT NULL,
  `image_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `read_time` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `view_count` int DEFAULT '0',
  `status` int DEFAULT '1',
  `create_time` datetime NOT NULL,
  `update_time` datetime NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `author_id` (`author_id`) USING BTREE,
  KEY `category_id` (`category_id`) USING BTREE,
  CONSTRAINT `article_ibfk_1` FOREIGN KEY (`author_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `article_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `article`
--

LOCK TABLES `article` WRITE;
/*!40000 ALTER TABLE `article` DISABLE KEYS */;
INSERT INTO `article` VALUES (1,'开始我的编程之旅','记录我从零开始学习编程的经历，分享一些初学者的心得体会和遇到的挑战。','## 开始我的编程之旅\n\n当我第一次打开代码编辑器时，面对着黑色的屏幕和闪烁的光标，我既兴奋又紧张。编程对我来说是一个全新的世界，充满了无限的可能性。\n\n## 初学者的挑战\n\n学习编程并不是一帆风顺的。最大的挑战来自于：\n\n1. 理解抽象概念\n2. 调试错误\n3. 保持动力',1,1,'https://images.unsplash.com/photo-1654375408516-5521e065c5ef','5 分钟',7,1,'2026-04-05 04:23:30','2026-04-05 04:23:30'),(2,'Web 开发的现代工具链','探索当前最流行的 Web 开发工具和框架，了解如何搭建高效的开发环境。','## 现代 Web 开发\n\n现代前端开发使用 React、Vue、Vite、TypeScript 等工具。\n\n示例代码：\n\nimport React from \"react\";\n\nfunction Button() { return <button>按钮</button>; }',1,2,'https://images.unsplash.com/photo-1604591259403-81d6c9cf87d7','8 分钟',4,1,'2026-04-05 04:23:30','2026-04-05 04:23:30'),(3,'设计思维在产品开发中的应用','如何将设计思维融入产品开发流程，创造以用户为中心的优秀产品。','设计思维是一种以人为本的创新方法论，包括共情、定义、构思、原型、测试。',1,3,'https://images.unsplash.com/photo-1632937145991-91620be68319','6 分钟',0,1,'2026-04-05 04:23:30','2026-04-05 04:23:30'),(4,'ClaudeCode cli','新手如何使用ClaudeCode cli配置其他模型进行开发','# ClaudeCode cli\n\n\n\n------\n\n#### 安装ClaudeCode cli\n\n```powershell\nnpm install -g @anthropic-ai/claude-code\n```\n\n\n\n#### 使用claude-code-router来进行配置国内大模型的使用\n\n\n\n#### 先下载claude-code-router\n\n```powershell\nnpm install -g @musistudio/claude-code-router(需要nodejs18以上)\n```\n\n\n\n#### 在windows下配置文件\n\n打开C:\\Users\\32987\\.claude-code-router没有就创建\n\n- 然后创建config.json\n- 从clude-code-routerGitHub官网上复制配置文件\n\n```\n{\n  \"Providers\": [\n    {\n      \"name\": \"modelscope\",\n      \"api_base_url\": \"https://api-inference.modelscope.cn/v1/chat/completions\",\n      \"api_key\": \"\",\n      \"models\": [\"Qwen/Qwen3-Coder-480B-A35B-Instruct\", \"Qwen/Qwen3-235B-A22B-Thinking-2507\"],\n      \"transformer\": {\n        \"use\": [\n          [\n            \"maxtoken\",\n            {\n              \"max_tokens\": 65536\n            }\n          ],\n          \"enhancetool\"\n        ],\n        \"Qwen/Qwen3-235B-A22B-Thinking-2507\": {\n          \"use\": [\"reasoning\"]\n        }\n      }\n    }\n  ],\n  \"Router\": {\n    \"default\": \"modelscope,Qwen/Qwen3-Coder-480B-A35B-Instruct\"\n  }\n}\n```\n\n\n\n#### 去魔塔社区申请令牌api就可以,这是Qwen3的配置\n\n\n\n#### 申请流程\n\n- 登录modelscop社区\n- 注册账号\n- 绑定阿里云百炼平台\n- 点击右上角头像进入主页\n- 点击左面的访问控制\n- 新建访问令牌复制api就可以了\n\n\n\n#### 在命令行输入\n\n```\nccr code\n```\n\n就启动了\n\n\n\n#### 第一次输入\n\n```\nccr start\n```\n\n',1,1,'/images/image_1775563619378.jpg','5 分钟',92,1,'2026-04-07 12:07:25','2026-04-08 08:14:42'),(5,'Fork 提交 PR ','Fork 仓库后，解决 Issue 并提交 PR 完整流程','# Fork 仓库后，解决 Issue 并提交 PR 完整流程\n\n\n\n## 一、提交前准备（本地代码同步 + 提交修改）\n\n### 1. 进入你的项目目录\n\n运行\n\n```\ncd 你的项目文件夹\n```\n\n### 2. 检查当前分支（确保在正确分支）\n\n运行\n\n```bash\ngit branch\n```\n\n> 一般默认在 `main` / `master` 分支。\n\n### 3. 提交你已经修改好的代码\n\n运行\n\n```bash\ngit add .\ngit commit -m \"fix: 解决 #xxx 问题（这里写你修复的 Issue 编号）\"\n```\n\n运行\n\n```\ngit commit -m \"fix: 修复输入为空报错，close #123\"\n```\n\n> 写 `close #123` 可以让合并 PR 后**自动关闭对应 Issue**，非常规范。\n\n### 4. 推送到你自己的 GitHub 仓库\n\n运行\n\n```bash\ngit push origin 你的分支名\n```\n\n运行\n\n```bash\ngit push origin main\n```\n\n------\n\n## 二、在 GitHub 上提交 Pull Request（PR）\n\n### 1. 打开你 Fork 后的仓库页面\n\nhttps://github.com/你的用户名 / 项目名\n\n### 2. 点击上方的 **Compare & pull request**\n\nGitHub 会自动检测你有新提交，会显示一个黄色按钮，点它。\n\n### 3. 确认分支正确\n\n- **base repository**: 原作者的仓库（不能改）\n- **base**: main/master（原作者的主分支）\n- **head repository**: 你的仓库\n- **compare**: 你提交代码的分支\n\n### 4. 填写 PR 信息（非常重要）\n\n标题格式推荐：\n\nplaintext\n\n```bash\nfix: 解决 xxx 问题 (#Issue编号)\n```\n\n\n\n### 5. 点击 **Create pull request**\n\n 提交完成！\n\n------\n\n## 三、超重要规范（让作者快速合并你的 PR）\n\n1. **PR 里必须关联 Issue**\n\n   标题 / 内容写 `#123`，作者一眼知道你解决了哪个问题。\n\n   \n\n2. **一个 PR 只解决一个问题**\n\n   不要一次改一堆功能。\n\n   \n\n3. **不要直接改 main 分支**\n\n   更规范的做法（可选，新手也可以不用）：\n\n   运行\n\n   ```bash\ngit checkout -b fix-issue-123\n# 修改代码\ngit push origin fix-issue-123\n```\n\n   \n\n------\n\n## 四、如果你本地代码落后原仓库了（必看）\n\n如果原作者更新了代码，你需要先同步：\n\n	在GitHub上进入的Fork的仓库,然后点击\n\n```\nsync fork\n```\n\n同步完再提交、推送，不会产生冲突。\n\n------\n\n# 最简极速版流程（老手版）\n\n运行\n\n```bash\ngit add .\ngit commit -m \"fix: close #xxx\"\ngit push origin main\n```\n\n去 GitHub 点 **Compare & pull request** → 提交。\n\n------\n\n### 总结\n\n1. 本地提交修复代码\n2. 推送到你自己的 GitHub 仓库\n3. 在 GitHub 点 **Compare & pull request**\n4. 填写 PR 说明并关联 Issue\n5. 提交完成，等待作者审核合并',1,4,'/images/image_1775635351060.png','5 分钟',42,1,'2026-04-08 08:02:45','2026-04-08 08:14:55'),(6,'Python - Ruff + uv','python新一代虚拟环境的配置以及代码检查与格式化工具的使用','# Python - Ruff + uv\n\n## 1. 工具介绍\n\n- uv：Python 生态新一代包管理工具，比 pip 更快、更高效，支持虚拟环境管理、依赖安装/卸载，可与 Ruff 配合使用，简化开发流程。\n- Ruff：轻量、快速的代码检查（Lint）和格式化工具，集成 Pylint、Flake8、Black 等核心功能，支持自动修复常见问题，与 uv 协同可实现“包管理+代码规范”一体化。\n\n## 2. uv 安装步骤（三种方式，推荐官方脚本）\n\n### 方式1：官方脚本安装（跨平台，推荐）\n\n```bash\n# Linux / Mac / WSL\ncurl -LsSf https://astral.sh/uv/install.sh | sh\n\n# Windows（PowerShell）\nirm https://astral.sh/uv/install.ps1 | iex\n```\n\n### 方式2：pip 安装（备用，需已安装pip）\n\n```bash\npip install uv --upgrade\n```\n\n### 方式3：conda 安装（conda环境用户）\n\n```bash\nconda install -c conda-forge uv\n```\n\n### 安装验证\n\n```bash\nuv --version  # 显示版本号即安装成功\n```\n\n## 3. uv 核心使用步骤（包管理+虚拟环境）\n\n### 3.1 虚拟环境管理\n\n```bash\n# 1. 创建虚拟环境（默认在 .venv 目录，推荐）\nuv venv\n\n# 2. 激活虚拟环境\n# Linux/Mac/WSL\nsource .venv/bin/activate\n# Windows（PowerShell）\n.venv\\Scripts\\Activate.ps1\n\n# 3. 退出虚拟环境\ndeactivate\n\n# 4. 删除虚拟环境（直接删除目录即可）\nrm -rf .venv  # Linux/Mac/WSL\nRemove-Item .venv -Recurse -Force  # Windows\n```\n\n### 3.2 依赖管理（替代pip）\n\n```bash\n# 1. 安装依赖（支持单个/多个包，自动解析依赖）\nuv pip install ruff  # 安装ruff（与uv配合使用）\nuv pip install requests flask  # 安装多个包\n\n# 2. 安装指定版本的依赖\nuv pip install ruff==0.4.0\n\n# 3. 卸载依赖\nuv pip uninstall ruff\n\n# 4. 生成依赖清单（替代pip freeze）\nuv pip freeze > requirements.txt\n\n# 5. 从依赖清单安装所有依赖\nuv pip install -r requirements.txt\n\n# 6. 升级依赖\nuv pip upgrade ruff  # 升级单个包\nuv pip upgrade --all  # 升级所有依赖\n```\n\n## 4. Ruff 安装与使用步骤（配合uv）\n\n### 4. 安装Ruff（使用uv安装，推荐）\n\n```bash\n# 激活虚拟环境后安装\nuv pip install ruff\n```\n\n### 4.2 配置步骤\n\n```bash\n# 1. 进入项目根目录（配置文件需放在此处）\ncd 你的Python项目目录\n\n# 2. 自动生成默认配置文件（.ruff.toml，推荐）\nruff init\n```\n\n### 常用配置修改（.ruff.toml）\n\n```toml\n# 代码检查规则（默认启用大部分常用规则）\nselect = [\n  \"E\",  # 语法错误\n  \"F\",  # 逻辑错误\n  \"W\",  # 警告\n  \"I\",  # 导入相关问题\n  \"B\",  # 安全相关问题\n]\n\n# 禁用特定规则（示例：禁用未使用变量的警告）\nignore = [\"F841\"]\n\n# 格式化配置（对应Black的风格）\nline-length = 120  # 每行最大长度\nindent-width = 4   # 缩进4个空格\nquote-style = \"double\"  # 字符串用双引号\ntrailing-comma = \"always\"  # 列表/字典末尾自动加逗号\n```\n\n### 4.3 Ruff 核心使用命令\n\n```bash\n# 1. 检查项目所有Python文件（只检查，不修改）\nruff check .\n\n# 2. 自动修复可修复的问题（重点，节省时间）\nruff check --fix .\n\n# 3. 格式化所有Python文件\nruff format .\n\n# 4. 检查格式化是否符合规范（不修改，仅校验）\nruff format --check .\n\n# 5. 检查指定文件/目录\nruff check 文件名.py\nruff format 目录名/\n```\n\n## 5. 注意事项\n\n- uv 安装后需重启终端，确保命令可正常调用；\n- 优先使用 uv 管理虚拟环境和依赖，避免与 pip 混用，防止依赖冲突；\n- Ruff 配置文件必须放在项目根目录，否则无法识别规则；\n- 部分代码问题（如逻辑错误）无法自动修复，需手动修改；\n- 可配合VS Code插件（Ruff、uv），实现保存自动检查+格式化。',1,2,'/images/image_1776148460477.png','5 分钟',3,1,'2026-04-14 06:34:39','2026-04-14 06:34:39'),(7,'Docker启动若依微服务项目','若依微服务项目第一次启动,怎么利用docker进行项目启动与开发的具体步骤','',1,2,'/images/image_1776148646335.png','5 分钟',7,1,'2026-04-14 06:37:33','2026-04-14 06:37:33'),(8,'AOP公共字段注入','利用AOP在项目中实现公共字段注入的步骤以及核心代码解析','',1,2,'/images/image_1776152352274.png','5 分钟',20,1,'2026-04-14 07:39:19','2026-04-14 07:39:19'),(10,'Mybatis Plus','mybatis的升级版','# Mybatis Plus\n\n------\n\n\n\n# lombok\n\n一个快速开发实体类的jar包\n\n```xml\n<dependency>\n    <groupId>org.projectlombok</groupId>\n    <artifactId>lombok</artifactId>\n    <version>\"1.18.12\"</version>\n</dependency>\n```\n\n在实体类上面，写注解，需要什么就写什么注解\n\n```java\n@Setter\n@Getter\n@Data\npublic void User(){\n    private String name;\n    private String age;\n    private String address;\n}\n```\n\n这样lombok就可以帮我们完成实体类中的get和setter等方法的构造\n\n\n\n\n\n# 标准的CRUD\n\nmybatisplus中有一个类，继承这个类就可以实现简单的操作\n\n这个类中已经写好了一部分的CRUD的代码，可以直接使用对应的方法\n\n### BaseMapper\n\n在泛型中添加你的实体类的类型\n\n```java\n@Mapper\npublic interface UserDao extends BaseMapper<User> {\n}\n```\n\n然后直接写对应的操作就可以了\n\n```java\n@SpringBootTest\nclass Mybatisplus01QuickstartApplicationTests {\n\n    @Autowired\n    private UserDao userDao;\n\n    @Test\n    void testSave(){\n        User user = new User();\n        user.setName(\"黑马程序员\");\n        user.setPassword(\"itheima\");\n        user.setAge(12);\n        user.setTel(\"4006184000\");\n        userDao.insert(user);\n    }\n\n    @Test\n    void testDelete(){\n        userDao.deleteById(1401856123725713409L);\n    }\n\n    @Test\n    void testUpdate(){\n        User user = new User();\n        user.setId(1L);\n        user.setName(\"Tom888\");\n        user.setPassword(\"tom888\");\n        user.setAge(12);\n        user.setTel(\"4006184000\");\n        userDao.updateById(user);\n    }\n\n    @Test\n    void testGetById(){\n        User user = userDao.selectById(2L);\n        System.out.println(user);\n    }\n\n\n    @Test\n    void testGetAll() {\n        List<User> userList = userDao.selectList(null);\n        System.out.println(userList);\n    }\n\n}\n```\n\n\n\n\n\n# 标准的分页功能\n\n分页查询也是标准开发的一部分，\n\n\n\n```java\n@Test\n    void testGetByPage(){\n        //IPage对象封装了分页操作相关的数据\n        IPage page  = new Page(2,3);\n        //2就是第2页，3代表这一页多少条\n        userDao.selectPage(page,null);\n        System.out.println(\"当前页码值：\"+page.getCurrent());\n        System.out.println(\"每页显示数：\"+page.getSize());\n        System.out.println(\"一共多少页：\"+page.getPages());\n        System.out.println(\"一共多少条数据：\"+page.getTotal());\n        System.out.println(\"数据：\"+page.getRecords());\n    }\n```\n\n\n\n# MP拦截器\n\n在 MyBatis-Plus（简称 MP）中，**MP拦截器**是指通过实现 MyBatis 的 `Interceptor` 接口，对 SQL 执行过程进行拦截和增强的机制。MyBatis-Plus 提供了一些内置的拦截器，同时也支持自定义拦截器，用于在 SQL 执行前后插入自定义逻辑。\n\n###  MP拦截器的主要作用\n1. **SQL 性能分析**\n   - 可以设置阈值，当 SQL 执行时间超过设定值时，输出警告日志。\n\n2. **分页功能**\n   - 内置了 `PaginationInnerInterceptor`（分页拦截器），用于自动处理分页逻辑。\n   - 开发者只需传入分页参数（如当前页、每页大小），拦截器会自动生成分页 SQL。\n\n3. **SQL 注入阻断**\n   - 通过拦截器，可以检查 SQL 语句，防止恶意 SQL 注入攻击。\n\n4. **动态表名**\n   - 可以通过拦截器动态替换 SQL 中的表名，适用于多租户等场景。\n\n5. **自定义逻辑**\n   - 开发者可以自定义拦截器，在 SQL 执行前后添加逻辑，如日志记录、权限校验、数据脱敏等。\n\n### 内置拦截器示例\n1. **性能分析拦截器**\n```java\n@Bean\npublic PerformanceInterceptor performanceInterceptor() {\n    PerformanceInterceptor interceptor = new PerformanceInterceptor();\n    interceptor.setMaxTime(1000); // SQL 执行最大时长，超过则抛出异常\n    interceptor.setFormat(true);   // 是否格式化 SQL\n    return interceptor;\n}\n```\n\n2. **分页拦截器**\n```java\n@Bean\npublic PaginationInnerInterceptor paginationInterceptor() {\n    return new PaginationInnerInterceptor();\n}\n```\n\n### 自定义拦截器示例\n以下是一个简单的自定义拦截器，用于在 SQL 执行前后打印日志：\n```java\n@Intercepts({\n    @Signature(type = StatementHandler.class, method = \"prepare\", args = {Connection.class, Integer.class})\n})\npublic class MyInterceptor implements Interceptor {\n    @Override\n    public Object intercept(Invocation invocation) throws Throwable {\n        System.out.println(\"Before SQL execution\");\n        Object result = invocation.proceed(); // 执行 SQL\n        System.out.println(\"After SQL execution\");\n        return result;\n    }\n\n    @Override\n    public Object plugin(Object target) {\n        return Plugin.wrap(target, this);\n    }\n\n    @Override\n    public void setProperties(Properties properties) {\n    }\n}\n```\n\n### 总结\nMyBatis-Plus 中的 MP拦截器主要用于增强 SQL 执行过程，提供性能分析、分页、SQL 注入阻断等功能，同时也支持开发者自定义拦截器来实现特定需求。通过拦截器，可以灵活地扩展 MyBatis 的功能，提升开发效率和系统安全性。\n\n\n',1,2,'/images/image_1776255474039.png','5 分钟',5,1,'2026-04-15 20:19:18','2026-04-15 20:19:18'),(11,'Redis的主从关系','如何搭建一个redis的主从关系集群','\n# Redis搭建主从关系\n\n\n\n## Docker-compose文件\n\n```yaml\nservices:\n  r1:\n    image: redis:7\n    container_name: r1\n    network_mode: \"host\"\n    entrypoint: [\"redis-server\", \"--port\", \"7001\"]\n  r2:\n    image: redis:7\n    container_name: r2\n    network_mode: \"host\"\n    entrypoint: [\"redis-server\", \"--port\", \"7002\"]\n  r3:\n    image: redis:7\n    container_name: r3\n    network_mode: \"host\"\n    entrypoint: [\"redis-server\", \"--port\", \"7003\"]\n```\n\n\n\n# Redis 临时主从配置笔记（命令行临时生效，重启失效）\n\n\n\n## 一、适用场景\n\n- 不修改任何配置文件\n- 仅通过命令临时搭建主从关系\n- 容器 / 服务重启后主从自动失效，恢复独立节点\n- \n\n## 二、节点规划\n\n- Master（主节点）：`127.0.0.1:7001`\n- Slave（从节点）：`127.0.0.1:7002`\n- Slave（从节点）：`127.0.0.1:7003`\n\n\n\n## 三、配置临时主从命令\n\n### 1. 设置 7002 为 7001 的从节点\n\n```dockerfile\ndocker exec -it r2 redis-cli -p 7002\nredis-cli -p 7002 REPLICAOF 127.0.0.1 7001\n```\n\n\n\n### 2. 设置 7003 为 7001 的从节点\n\n```dockerfile\ndocker exec -it r3 redis-cli -p 7003\nredis-cli -p 7003 REPLICAOF 127.0.0.1 7001\n```\n\n。\n\n## 四、查看主从状态\n\n### 1. 查看主节点（7001）信息\n\n```\nredis-cli -p 7001 INFO replication\n```\n\n关键字段：\n\n- `role:master`\n- `connected_slaves:2`\n\n\n\n### 2. 查看从节点（7002/7003）信息\n\n```\nredis-cli -p 7002 INFO replication\n```\n\n关键字段：\n\n- `role:slave`\n- `master_host:127.0.0.1`\n- `master_port:7001`\n\n\n\n## 五、取消临时主从关系\n\n让从节点变回独立主节点：\n\n```\nredis-cli -p 7002 REPLICAOF NO ONE\nredis-cli -p 7003 REPLICAOF NO ONE\n```\n\n',1,2,'/images/image_1776256718431.png','5 分钟',11,1,'2026-04-15 20:38:49','2026-04-15 20:38:49'),(12,'我帅的要命','真的','# 我帅的要命',1,6,'/images/3db5b038-3137-417d-878d-4c06927f9d1b.png','5 分钟',7,1,'2026-04-20 09:39:20','2026-04-20 09:39:20'),(13,'私有COS Markdown图片渲染','React+SpringBoot 私有COS Markdown图片渲染方案','# React+SpringBoot 私有COS Markdown图片渲染方案\n## 方案核心\n将COS对象存储设置为**私有读**，保障图片资源安全，不对外直接公开访问；通过**后端生成临时签名URL + 前端自定义Markdown图片渲染**，实现私有图片正常展示，全程不泄露COS密钥。\n\n---\n\n## 一、Markdown图片写法（唯一规范）\n只写COS文件的`key`（文件路径），不写域名、不写HTTP/HTTPS，直接使用标准Markdown图片语法：\n\n```markdown\n# 博客笔记标题\n笔记正文内容......\n![图片描述文字](article/2026/04/blog/demo.png)\n后续笔记内容......\n```\n\n- `article/2026/04/blog/demo.png`：对应COS存储中图片的**文件唯一key**\n- **禁止写法**：`![](https://xxx.cos.xxx.com/xxx.png)`、`![](cos://xxx.png)`\n\n---\n\n## 二、前端React实现（react-markdown渲染）\n基于`react-markdown`库，**自定义img渲染组件**，将图片路径转发至后端接口获取签名地址，无需改动原有Markdown渲染逻辑。\n\n### 1. 核心渲染组件代码\n```jsx\nimport ReactMarkdown from \'react-markdown\';\n\n// Markdown内容渲染组件，content为后端返回的Markdown纯文本\nconst MarkdownRender = ({ content }) => {\n  return (\n    <ReactMarkdown\n      // 自定义渲染标签，重写img标签逻辑\n      components={{\n        img: ({ src, alt }) => {\n          // src：Markdown中写的COS文件key\n          // 拼接后端签名接口地址，对路径进行URL编码\n          const privateImgUrl = `/api/cos/private/img?key=${encodeURIComponent(src)}`;\n          // 渲染图片，设置响应式样式\n          return (\n            <img\n              src={privateImgUrl}\n              alt={alt}\n              style={{\n                maxWidth: \'100%\',\n                height: \'auto\',\n                margin: \'10px 0\',\n                borderRadius: \'4px\'\n              }}\n            />\n          );\n        }\n      }}\n    >\n      {content}\n    </ReactMarkdown>\n  );\n};\n\nexport default MarkdownRender;\n```\n\n### 2. 前端渲染原理\nMarkdown中的图片路径，会被转换为**后端签名接口请求地址**，浏览器请求该接口，由后端返回有权限的图片地址。\n\n---\n\n## 三、后端SpringBoot实现\n基于已有的COS配置类、工具类，**新增图片签名接口**，生成临时签名URL并重定向，无需重构原有COS相关代码。\n\n### 1. 接口代码（直接新增至现有COS Controller）\n```java\nimport org.springframework.beans.factory.annotation.Autowired;\nimport org.springframework.web.bind.annotation.GetMapping;\nimport org.springframework.web.bind.annotation.RequestMapping;\nimport org.springframework.web.bind.annotation.RequestParam;\nimport org.springframework.web.bind.annotation.RestController;\nimport javax.servlet.http.HttpServletResponse;\n\n@RestController\n@RequestMapping(\"/api/cos\")\npublic class CosImageController {\n\n    // 注入你已有的COS工具类\n    @Autowired\n    private CosUtils cosUtils;\n\n    /**\n     * 私有COS图片获取接口\n     * @param key Markdown中传递的COS文件路径\n     * @param response 响应对象\n     * @throws Exception 异常抛出\n     */\n    @GetMapping(\"/private/img\")\n    public void getPrivateCosImage(@RequestParam String key, HttpServletResponse response) throws Exception {\n        // 1. 调用现有工具类，生成30分钟有效临时签名URL\n        String signedUrl = cosUtils.generatePresignedUrl(key);\n        // 2. 直接重定向至COS私有图片签名地址\n        response.sendRedirect(signedUrl);\n    }\n}\n```\n\n### 2. 必备COS工具类方法（已有则直接复用）\n工具类中生成临时签名URL的核心方法（腾讯云COS示例，其他云厂商逻辑一致）：\n```java\nimport com.qcloud.cos.COSClient;\nimport com.qcloud.cos.model.GeneratePresignedUrlRequest;\nimport org.springframework.beans.factory.annotation.Value;\nimport org.springframework.stereotype.Component;\nimport java.net.URL;\nimport java.util.Date;\n\n@Component\npublic class CosUtils {\n\n    @Autowired\n    private COSClient cosClient;\n\n    @Value(\"${tencent.cos.bucketName}\")\n    private String cosBucket;\n\n    /**\n     * 生成COS私有文件临时签名URL\n     * @param key 文件key\n     * @return 签名URL\n     */\n    public String generatePresignedUrl(String key) {\n        // 设置签名过期时间：30分钟\n        long expireTime = System.currentTimeMillis() + 30 * 60 * 1000;\n        Date expiration = new Date(expireTime);\n        // 调用COS SDK生成签名地址\n        URL url = cosClient.generatePresignedUrl(cosBucket, key, expiration);\n        return url.toString();\n    }\n}\n```\n\n---\n\n## 四、完整渲染流程\n1. 博客数据库存储**纯Markdown文本**（包含图片路径）；\n2. 前端请求获取Markdown内容，通过**自定义组件**渲染；\n3. 图片标签请求后端`/api/cos/private/img`接口，携带COS文件key；\n4. 后端接收key，生成**临时有权限的签名URL**；\n5. 后端**重定向**至签名URL，浏览器正常渲染私有图片；\n6. COS始终保持私有读，外部直接访问图片地址返回403，**保障资源安全**。\n\n---\n\n## 五、注意事项\n1. COS桶权限务必设置为**私有读**，关闭公有访问；\n2. 临时签名URL建议设置过期时间（**10-30分钟**），避免长期有效；\n3. Markdown中图片路径必须与COS存储的**key完全一致**；\n4. 前端请求接口时，务必对key进行`encodeURIComponent`编码，避免特殊字符报错。\n\n',1,2,'/images/36002692-21a3-47db-84d6-20d6230c9988.png','5 分钟',8,1,'2026-04-21 08:12:51','2026-04-21 13:37:44'),(14,'SpringBoot+Vue3 对接云存储（COS/OSS）','在个人博客、Web 项目开发中，图片/文件存储是必备功能。相比本地存储，腾讯云 COS、阿里云 OSS 这类对象存储更适合：不占用服务器带宽、存储稳定、访问便捷。','# SpringBoot+Vue3 对接云存储（COS/OSS）\n## 前言\n在个人博客、Web 项目开发中，图片/文件存储是必备功能。相比本地存储，腾讯云 COS、阿里云 OSS 这类对象存储更适合：不占用服务器带宽、存储稳定、访问便捷。\n\n本文记录 SpringBoot 后端 + Vue3 前端，对接腾讯云 COS（阿里云 OSS 逻辑完全一致）的完整流程，包含公有桶、私有桶两种方案，覆盖文件增删改查、前端直传、私有签名访问全场景。\n\n---\n\n## 一、核心概念梳理\n### 1. 对象存储核心名词\n- 存储桶（Bucket）：云存储的根目录，一个桶对应一个独立存储空间\n- 对象键（Key）：文件在存储桶内的唯一路径+文件名，是操作文件的唯一标识\n- 临时签名 URL：私有桶专属，通过密钥生成带时效的访问链接，防止匿名访问\n- 前端直传：文件不经过后端服务器，直接上传到云存储，节省服务器带宽\n\n### 2. 公有桶 vs 私有桶\n| 权限类型 | 访问方式 | 优缺点 | 适用场景 |\n|--------|----------|--------|----------|\n| 公有读 | 直接通过文件 URL 访问，无需签名 | 简单便捷，安全性低 | 博客封面、公共图片 |\n| 私有读 | 必须通过临时签名 URL 访问 | 安全性高，URL 过期失效 | 个人头像、隐私文件 |\n\n### 3. COS 与 OSS 通用对比\n| 云厂商 | 核心客户端 | 依赖坐标 | 核心 API |\n|--------|------------|----------|----------|\n| 腾讯云 COS | COSClient | com.qcloud:cos_api | putObject/deleteObject/generatePresignedUrl |\n| 阿里云 OSS | OSS | com.aliyun.oss:aliyun-sdk-oss | putObject/deleteObject/generatePresignedUrl |\n\n> 注意：两者开发流程、代码逻辑几乎完全一致，仅依赖、配置、类名不同，学会 COS 即可无缝切换 OSS。\n\n---\n\n## 二、前期准备\n1. 开通腾讯云 COS/阿里云 OSS，创建存储桶\n2. 获取密钥：SecretId/AccessKeyId、SecretKey/AccessKeySecret\n3. 配置存储桶跨域（前端直传必备）：允许来源 `*`、允许方法 POST/GET/DELETE、允许头部 `*`\n4. 新建 SpringBoot 项目、Vue3 项目，配置基础环境\n\n---\n\n## 三、SpringBoot 后端对接腾讯云 COS\n### 1. 引入 Maven 依赖\n```xml\n<dependency>\n    <groupId>com.qcloud</groupId>\n    <artifactId>cos_api</artifactId>\n    <version>5.6.0</version>\n</dependency>\n```\n\n### 2. 配置文件（application.yml）\n```yaml\ntencent:\n  cos:\n    secretId: 你的 SecretId\n    secretKey: 你的 SecretKey\n    region: 存储桶地域（如 ap-beijing）\n    bucketName: 存储桶名称\n    prefix: 存储桶默认访问域名\n```\n\n### 3. COS 客户端配置类\n创建 COS 客户端单例，交由 Spring 管理，避免重复创建。\n```java\nimport com.qcloud.cos.COSClient;\nimport com.qcloud.cos.ClientConfig;\nimport com.qcloud.cos.auth.BasicCOSCredentials;\nimport com.qcloud.cos.region.Region;\nimport org.springframework.beans.factory.annotation.Value;\nimport org.springframework.context.annotation.Bean;\nimport org.springframework.context.annotation.Configuration;\n\n/**\n * COS 客户端配置类\n * 作用：初始化 COS 客户端，注入密钥、地域信息\n */\n@Configuration\npublic class CosConfig {\n\n    @Value(\"${tencent.cos.secretId}\")\n    private String secretId;\n\n    @Value(\"${tencent.cos.secretKey}\")\n    private String secretKey;\n\n    @Value(\"${tencent.cos.region}\")\n    private String region;\n\n    /**\n     * 注入 COS 客户端 Bean，单例模式\n     */\n    @Bean\n    public COSClient cosClient() {\n        // 初始化认证信息\n        BasicCOSCredentials credentials = new BasicCOSCredentials(secretId, secretKey);\n        // 初始化地域配置\n        ClientConfig clientConfig = new ClientConfig(new Region(region));\n        // 创建并返回 COS 客户端\n        return new COSClient(credentials, clientConfig);\n    }\n}\n```\n\n### 4. COS 工具类（增删改查 + 私有桶签名）\n封装所有文件操作方法，包含公有桶、私有桶通用逻辑。\n```java\nimport com.qcloud.cos.COSClient;\nimport com.qcloud.cos.model.COSObject;\nimport com.qcloud.cos.model.ObjectMetadata;\nimport org.springframework.beans.factory.annotation.Autowired;\nimport org.springframework.beans.factory.annotation.Value;\nimport org.springframework.stereotype.Component;\nimport org.springframework.web.multipart.MultipartFile;\n\nimport java.io.IOException;\nimport java.io.InputStream;\nimport java.net.URL;\nimport java.util.Date;\nimport java.util.UUID;\n\n/**\n * 腾讯云 COS 工具类\n * 功能：文件上传、删除、查询、私有桶签名 URL 生成\n */\n@Component\npublic class CosUtil {\n\n    // 注入 COS 客户端\n    @Autowired\n    private COSClient cosClient;\n\n    // 存储桶名称\n    @Value(\"${tencent.cos.bucketName}\")\n    private String bucketName;\n\n    // 存储桶访问前缀\n    @Value(\"${tencent.cos.prefix}\")\n    private String prefix;\n\n    /**\n     * 文件上传（增）\n     * @param file 前端上传的文件\n     * @return 文件唯一 Key（私有桶存 Key，公有桶存完整 URL）\n     */\n    public String upload(MultipartFile file) throws IOException {\n        // 获取文件后缀名\n        String originalFilename = file.getOriginalFilename();\n        String suffix = originalFilename.substring(originalFilename.lastIndexOf(\".\"));\n        // 生成唯一 Key，避免文件名重复覆盖\n        String key = \"blog/\" + UUID.randomUUID() + suffix;\n\n        // 获取文件输入流\n        InputStream inputStream = file.getInputStream();\n        // 设置文件元数据（文件大小）\n        ObjectMetadata metadata = new ObjectMetadata();\n        metadata.setContentLength(file.getSize());\n\n        // 上传文件到 COS\n        cosClient.putObject(bucketName, key, inputStream, metadata);\n        return key;\n    }\n\n    /**\n     * 文件删除（删）\n     * @param key 文件唯一标识\n     */\n    public void delete(String key) {\n        cosClient.deleteObject(bucketName, key);\n    }\n\n    /**\n     * 判断文件是否存在（查）\n     * @param key 文件唯一标识\n     * @return 存在 true，不存在 false\n     */\n    public boolean exists(String key) {\n        return cosClient.doesObjectExist(bucketName, key);\n    }\n\n    /**\n     * 文件下载（查）\n     * @param key 文件唯一标识\n     * @return COS 文件对象（含文件流）\n     */\n    public COSObject download(String key) {\n        return cosClient.getObject(bucketName, key);\n    }\n\n    /**\n     * 私有桶核心：生成临时签名 URL\n     * @param key 文件唯一标识\n     * @return 带签名的临时访问 URL\n     */\n    public String getPrivateUrl(String key) {\n        // 设置过期时间：30 分钟（可自定义，如 7 天）\n        Date expiration = new Date(System.currentTimeMillis() + 30 * 60 * 1000);\n        // 生成签名 URL\n        URL url = cosClient.generatePresignedUrl(bucketName, key, expiration);\n        return url.toString();\n    }\n\n    /**\n     * 文件修改（改）：COS 无修改 API，覆盖上传即修改\n     * @param key 需修改的文件 Key\n     * @param file 新文件\n     * @return 新文件 Key\n     */\n    public String update(String key, MultipartFile file) throws IOException {\n        InputStream inputStream = file.getInputStream();\n        ObjectMetadata metadata = new ObjectMetadata();\n        metadata.setContentLength(file.getSize());\n        cosClient.putObject(bucketName, key, inputStream, metadata);\n        return key;\n    }\n\n    /**\n     * 公有桶：通过 Key 获取完整访问 URL\n     */\n    public String getPublicUrl(String key) {\n        return prefix + key;\n    }\n}\n```\n\n### 5. 后端 Controller 接口\n提供前端调用接口，包含直传签名、文件删除、签名 URL 获取。\n```java\nimport com.qcloud.cos.http.HttpMethodName;\nimport com.qcloud.cos.model.PolicyConditions;\nimport com.qcloud.cos.utils.SignUtils;\nimport org.springframework.beans.factory.annotation.Autowired;\nimport org.springframework.beans.factory.annotation.Value;\nimport org.springframework.web.bind.annotation.*;\n\nimport java.util.Date;\nimport java.util.HashMap;\nimport java.util.Map;\nimport java.util.UUID;\n\n/**\n * COS 接口控制器\n */\n@RestController\n@RequestMapping(\"/cos\")\npublic class CosController {\n\n    @Autowired\n    private CosUtil cosUtil;\n\n    @Value(\"${tencent.cos.secretId}\")\n    private String secretId;\n\n    @Value(\"${tencent.cos.secretKey}\")\n    private String secretKey;\n\n    @Value(\"${tencent.cos.bucketName}\")\n    private String bucketName;\n\n    @Value(\"${tencent.cos.region}\")\n    private String region;\n\n    /**\n     * 前端直传 COS：获取上传签名（防止密钥暴露）\n     * @return 直传所需签名、Key 等参数\n     */\n    @GetMapping(\"/auth\")\n    public Map<String, String> getUploadAuth() {\n        // 生成文件唯一 Key\n        String key = \"blog/\" + UUID.randomUUID() + \".jpg\";\n        // 签名过期时间：10 分钟\n        Date expiration = new Date(System.currentTimeMillis() + 600 * 1000);\n\n        // 配置上传策略（文件大小、存储桶限制）\n        PolicyConditions policy = new PolicyConditions();\n        policy.addConditionItem(PolicyConditions.COND_CONTENT_LENGTH_RANGE, 0, 10 * 1024 * 1024);\n        policy.addConditionItem(PolicyConditions.COND_BUCKET, bucketName);\n        policy.addConditionItem(PolicyConditions.COND_KEY, key);\n\n        // 生成签名和策略\n        String policyStr = SignUtils.generatePostPolicy(expiration, policy);\n        String signature = SignUtils.calculatePostSignature(secretKey, policyStr);\n\n        // 返回前端直传参数\n        Map<String, String> result = new HashMap<>();\n        result.put(\"key\", key);\n        result.put(\"policy\", policyStr);\n        result.put(\"signature\", signature);\n        result.put(\"secretId\", secretId);\n        result.put(\"bucket\", bucketName);\n        result.put(\"region\", region);\n        return result;\n    }\n\n    /**\n     * 私有桶：获取临时签名 URL\n     */\n    @GetMapping(\"/getPrivateImgUrl\")\n    public String getPrivateImgUrl(@RequestParam String key) {\n        return cosUtil.getPrivateUrl(key);\n    }\n\n    /**\n     * 文件删除\n     */\n    @PostMapping(\"/delete\")\n    public String delete(@RequestBody Map<String, String> param) {\n        String key = param.get(\"key\");\n        cosUtil.delete(key);\n        return \"删除成功\";\n    }\n}\n```\n\n---\n\n## 四、Vue3 前端完整代码\n实现文件上传、图片渲染、删除功能，适配公有桶 + 私有桶。\n\n```vue\n<template>\n  <div class=\"upload-container\">\n    <h3>文件上传</h3>\n    <!-- 文件上传按钮 -->\n    <input type=\"file\" accept=\"image/*\" @change=\"uploadFile\" />\n\n    <!-- 图片列表渲染 -->\n    <div class=\"img-list\">\n      <div v-for=\"key in keyList\" :key=\"key\" class=\"img-item\">\n        <!-- 私有桶：用临时签名 URL 渲染；公有桶直接用 publicUrl -->\n        <img \n          :src=\"signUrlMap[key]\" \n          alt=\"博客图片\"\n          @error=\"handleImgError(key)\"\n        />\n        <!-- 图片加载失败（过期）重新获取签名 -->\n        <button @click=\"deleteFile(key)\">删除</button>\n      </div>\n    </div>\n  </div>\n</template>\n\n<script setup>\nimport { ref } from \'vue\'\nimport axios from \'axios\'\n\n// 存储文件 Key 列表\nconst keyList = ref([])\n// 存储每个 Key 对应的临时签名 URL\nconst signUrlMap = ref({})\n\n/**\n * 前端直传文件到 COS\n */\nconst uploadFile = async (e) => {\n  const file = e.target.files[0]\n  if (!file) return\n\n  // 1. 请求后端获取上传签名\n  const { data: authData } = await axios.get(\'/cos/auth\')\n  const { key, policy, signature, secretId, bucket, region } = authData\n\n  // 2. 拼接 COS 直传地址\n  const cosUrl = `https://${bucket}.cos.${region}.myqcloud.com`\n\n  // 3. 构建 FormData 表单\n  const formData = new FormData()\n  formData.append(\'key\', key)\n  formData.append(\'policy\', policy)\n  formData.append(\'signature\', signature)\n  formData.append(\'qcloud-signing-secretid\', secretId)\n  formData.append(\'file\', file)\n\n  // 4. 直传文件到 COS\n  await axios.post(cosUrl, formData, {\n    headers: { \'Content-Type\': \'multipart/form-data\' }\n  })\n\n  // 5. 保存 Key 并获取临时签名 URL\n  keyList.value.push(key)\n  await getPrivateImgUrl(key)\n}\n\n/**\n * 获取私有桶临时签名 URL\n */\nconst getPrivateImgUrl = async (key) => {\n  const { data } = await axios.get(\'/cos/getPrivateImgUrl\', { params: { key } })\n  signUrlMap.value[key] = data\n}\n\n/**\n * 图片加载失败（签名过期）重新获取签名\n */\nconst handleImgError = async (key) => {\n  await getPrivateImgUrl(key)\n}\n\n/**\n * 删除文件\n */\nconst deleteFile = async (key) => {\n  await axios.post(\'/cos/delete\', { key })\n  // 更新前端列表\n  keyList.value = keyList.value.filter(item => item !== key)\n  delete signUrlMap.value[key]\n}\n</script>\n\n<style scoped>\n.upload-container {\n  max-width: 1000px;\n  margin: 30px auto;\n}\n.img-list {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 15px;\n  margin-top: 20px;\n}\n.img-item {\n  text-align: center;\n}\n.img-item img {\n  width: 200px;\n  height: 150px;\n  object-fit: cover;\n}\n</style>\n```\n\n---\n\n## 五、核心流程解析\n### 1. 前端直传流程（最优方案）\n1. 前端选择文件，请求后端获取上传签名\n2. 后端生成临时签名、文件 Key，返回给前端\n3. 前端通过 FormData 直接将文件上传到 COS，不经过后端服务器\n4. 上传成功后，前端保存文件 Key，请求后端生成临时签名 URL 渲染图片\n5. 删除文件时，前端传递 Key 给后端，后端调用 SDK 删除 COS 文件\n\n### 2. 私有桶签名 URL 原理\n- 私有桶禁止匿名访问，直接访问文件 URL 会返回 403\n- 后端通过密钥 + 文件 Key + 过期时间，生成带签名参数的 URL\n- 签名拼接在 URL 查询参数中，COS 验证签名合法且未过期，才允许访问\n- 签名过期后，图片加载失败，前端可通过 @error 事件重新获取签名\n\n### 3. 增删改查对应实现\n- 增：前端直传 COS，后端生成签名\n- 删：通过文件 Key 调用 SDK 删除\n- 改：相同 Key 覆盖上传文件\n- 查：私有桶生成签名 URL，公有桶直接访问 URL\n\n---\n\n## 六、阿里云 OSS 适配修改\n### 1. 替换 Maven 依赖\n```xml\n<dependency>\n    <groupId>com.aliyun.oss</groupId>\n    <artifactId>aliyun-sdk-oss</artifactId>\n    <version>3.15.0</version>\n</dependency>\n```\n\n### 2. 替换 OSS 客户端配置\n```java\n@Bean\npublic OSS ossClient() {\n    return new OSSClientBuilder().build(endpoint, accessKeyId, accessKeySecret);\n}\n```\n\n### 3. 工具类修改\n方法名、参数与 COS 完全一致，仅替换客户端对象即可。\n\n---\n\n## 七、注意事项\n1. 存储桶必须配置跨域，否则前端直传报错\n2. 私有桶数据库只存文件 Key，不存固定 URL\n3. 临时签名 URL 过期时间按需设置，安全性要求高设短，普通场景设长\n4. 无需额外配置 CDN，CDN 仅用于加速，不影响基础访问功能\n5. 密钥严禁暴露在前端代码中，必须通过后端生成签名\n\n---\n\n## 八、总结\n本文实现了 SpringBoot+Vue3 对接云对象存储的完整方案，前端直传 + 私有桶签名是企业级/个人博客最优方案，既节省服务器带宽，又保证文件访问安全。\n\nCOS 与 OSS 用法高度一致，掌握一套即可通用，后续可根据业务需求扩展分片上传、图片水印、缩略图等功能。\n\n',1,2,'/images/263693c3-4f3f-4d9b-a524-7290befad786.png','5 分钟',8,1,'2026-04-21 13:37:05','2026-04-21 13:37:05'),(15,'图片加载速度优化','腾讯云 COS 私有桶图片加载速度优化笔记','# 腾讯云 COS 私有桶图片加载速度优化笔记\n\n## 一、优化核心背景\n\n适用场景：**React 前端 + SpringBoot 后端 + COS 私有桶 + 临时签名访问**\n\n当前加载慢核心原因：\n\n1. 单张图片需单独请求后端获取预签名 URL，请求串行 / 并发过多，网络耗时翻倍\n2. 图片未做处理，原图体积过大，加载耗时久\n3. 页面一次性加载所有图片，浏览器请求阻塞、资源浪费\n\n## 二、前端加载优化方案\n\n### （一）图片懒加载（零成本、见效快）\n\n#### 1. 原生懒加载\n\n**原理**：浏览器内置机制，图片未进入可视区域时，不发起资源加载请求，减少页面初始并发请求数，避免网络阻塞。\n\n**实现代码**：\n\n```react\n// 直接在img标签添加loading<img \n  src={cos预签名URL} \n  loading=\"lazy\"\n  alt=\"图片\"\n  style={{ width: \'100%\', height: \'auto\' }}\n/>\n```\n\n**适用**：简单列表、常规图片展示，无需引入第三方库，改动极小。\n\n#### 2. 精准可视区懒加载（进阶）\n\n**原理**：通过监听元素与可视区交叉状态，仅当图片即将进入屏幕时才加载，支持提前加载配置，优化用户体验。\n\n**实现步骤**：\n\n1. 安装依赖：`npm install react-intersection-observer`\n2. 封装懒加载组件：\n\n```react\nimport { useInView } from \'react-intersection-observer\';\n\n// 通用懒加载图片组件\nconst LazyImage = ({ src, alt, ...rest }) => {\n  const { ref, inView } = useInView({\n    triggerOnce: true, // 仅触发一次加载\n    rootMargin: \'200px 0px\', // 提前200px加载，避免滚动留白\n    threshold: 0.1\n  });\n\n  return (\n   <img\n      ref={ref}\n      src={inView ? src : \'\'} // 进入视口才赋值真实链接\n      alt={alt}\n      {...rest}\n    />\n  );\n};\n\n//<LazyImage src={cos预签名URL} alt=\"商品图片\" />\n```\n\n### （二）减少签名请求优化\n\n#### 1. 后端批量生成预签名 URL（推荐，改动小）\n\n**原理**：前端一次性传递所有图片路径，后端批量生成预签名 URL 并返回，将 N 次签名请求转为 1 次，大幅减少网络交互。\n\n**前端实现**：\n\n```react\n// 批量获取签名URL\nconst getBatchSignUrl = async (imgKeys) => {\n  const res = await fetch(\'/api/cos/batch-sign\', {\n    method: \'POST\',\n    headers: { \'Content-Type\': \'application/json\' },\n    body: JSON.stringify({ imgKeys })\n  });\n  return await res.json();\n};\n\n// 页面调用\nconst imgKeys = [\'img/1.jpg\', \'img/2.jpg\', \'img/3.jpg\'];\nconst signUrlMap = await getBatchSignUrl(imgKeys);\n```\n\n#### 2. STS 临时密钥（无签名请求，最优）\n\n**原理**：前端仅请求 1 次 STS 临时密钥，后续所有图片签名在浏览器本地生成，完全消除后端签名请求耗时，且密钥可控、安全。\n\n**核心改动**：\n\n- 后端新增 STS 接口（无需修改原有上传逻辑）\n\n- 前端初始化 COS SDK，本地生成签名 URL，无额外请求\n\n  优势：代码改动小，仅修改图片展示逻辑，上传代码完全不动。\n\n## 三、COS 图片本身优化（体积瘦身，加载更快）\n\n### （一）实时图片压缩（无损清晰度，体积骤减）\n\n**原理**：腾讯云 COS 自带图片处理能力，通过 URL 参数实时压缩、转格式、缩放，无需提前处理图片，不占用额外存储。\n\n**优化参数（直接拼接在预签名 URL 后）**：\n\n```java\n// 通用压缩参数，兼顾清晰度与体积\n?imageMogr2/format/webp/quality/85/thumbnail/1080x\n```\n\n**参数解析**：\n\n- `format/webp`：转为 WebP 格式，比 JPG/PNG 体积小 50%+\n\n- `quality/85`：图片质量 85%，肉眼无模糊感\n\n- ```java\n  thumbnail/1080x   ：最大宽度 1080px，适配移动端 / PC 端\n  ```\n\n  注意：压缩后清晰度无明显损耗，图片体积可减少 60%-80%，加载速度大幅提升。\n\n### （二）图片缓存优化\n\n1. 前端本地缓存：对已加载的签名 URL 进行缓存，避免重复生成、重复请求\n2. COS 缓存配置：在 COS 控制台配置缓存规则，延长图片缓存时间，减少回源请求\n\n## 四、SpringBoot 后端优化\n\n### 1. 批量生成预签名工具类\n\n封装 COS 批量签名方法，查询图片列表时，直接生成签名 URL 返回前端，避免前端多次请求。\n\n### 2. STS 接口封装\n\n提供临时密钥接口，设置合理有效期（建议 2 小时），配置精细化权限，仅开放图片读取权限，保证私有桶安全。\n\n### 3. 接口响应优化\n\n签名接口做异步处理，减少接口响应时间，避免阻塞前端请求。\n\n## 五、终极优化组合（企业级落地）\n\n**STS 临时密钥 + 本地生成签名 + 懒加载 + COS 实时压缩**\n\n1. 前端初始化时请求 1 次 STS 密钥，本地生成所有图片签名 URL\n\n2. 所有图片使用懒加载，仅可视区加载\n\n3. 签名 URL 拼接压缩参数，图片体积最小化\n\n   效果：图片加载速度提升 5-20 倍，体验与公有桶一致，且保证私有桶数据安全。\n\n## 六、避坑小贴士\n\n1. COS 压缩参数需放在签名之后，避免签名失效\n2. 预签名 URL 有有效期，避免设置过短导致图片加载失败\n3. 懒加载需给图片设置固定宽高，避免页面布局偏移\n4. STS 密钥权限最小化，仅开放必要的读取权限，提升安全性',1,4,'/images/aed9901d-8652-40e7-90d0-f2ea922fee19.png','5 分钟',6,1,'2026-04-23 13:51:10','2026-04-23 13:51:10');
/*!40000 ALTER TABLE `article` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `article_tag`
--

DROP TABLE IF EXISTS `article_tag`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `article_tag` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `article_id` bigint NOT NULL,
  `tag_id` bigint NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `article_id` (`article_id`,`tag_id`) USING BTREE,
  KEY `tag_id` (`tag_id`) USING BTREE,
  CONSTRAINT `article_tag_ibfk_1` FOREIGN KEY (`article_id`) REFERENCES `article` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `article_tag_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `tag` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `article_tag`
--

LOCK TABLES `article_tag` WRITE;
/*!40000 ALTER TABLE `article_tag` DISABLE KEYS */;
INSERT INTO `article_tag` VALUES (1,1,1),(2,1,2),(3,2,3),(4,2,4),(5,3,5),(8,4,5),(9,6,5),(11,7,1),(10,7,2),(12,8,1),(13,8,2),(14,10,1),(15,10,2),(16,11,1),(17,11,2),(18,11,5),(19,12,6),(24,13,1),(21,14,2),(23,14,3),(22,14,4),(25,15,2),(26,15,4);
/*!40000 ALTER TABLE `article_tag` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carousel_slide`
--

DROP TABLE IF EXISTS `carousel_slide`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `carousel_slide` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `image_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort` int NOT NULL DEFAULT '0',
  `status` int NOT NULL DEFAULT '1',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `sort` (`sort`) USING BTREE,
  KEY `status` (`status`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=85 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC COMMENT='轮播图表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carousel_slide`
--

LOCK TABLES `carousel_slide` WRITE;
/*!40000 ALTER TABLE `carousel_slide` DISABLE KEYS */;
INSERT INTO `carousel_slide` VALUES (78,'/images/image_1776079089360.png','','你就是不敢',1,1,'2026-04-24 22:13:21','2026-04-24 22:13:21'),(79,'/images/image_1776079149959.png','','AI不会淘汰你这样的人',2,1,'2026-04-24 22:13:21','2026-04-24 22:13:21'),(80,'/images/image_1776079167533.png','','创造力是温柔的谎言',3,1,'2026-04-24 22:13:21','2026-04-24 22:13:21'),(81,'/images/image_1776079188313.png','','见山是山,见水是水',4,1,'2026-04-24 22:13:21','2026-04-24 22:13:21'),(82,'/images/image_1776170220119.png','','剑来牛逼',5,1,'2026-04-24 22:13:21','2026-04-24 22:13:21'),(83,'/images/f81a4a5b-a6d7-4d4e-8a67-9fb9c6462d01.png','','',6,1,'2026-04-24 22:13:21','2026-04-24 22:13:21'),(84,'/article/98adaac4-3d88-4990-81e6-e4deaa55bfa3.png','自由','自由',7,1,'2026-04-24 22:13:21','2026-04-24 22:13:21');
/*!40000 ALTER TABLE `carousel_slide` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `category` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort` int DEFAULT '0',
  `create_time` datetime NOT NULL,
  `update_time` datetime NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `name` (`name`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category`
--

LOCK TABLES `category` WRITE;
/*!40000 ALTER TABLE `category` DISABLE KEYS */;
INSERT INTO `category` VALUES (1,'编程学习','编程相关的学习内容',1,'2026-04-05 04:23:30','2026-04-05 04:23:30'),(2,'Web 开发','Web开发相关的内容',2,'2026-04-05 04:23:30','2026-04-05 04:23:30'),(3,'设计','设计相关的内容',3,'2026-04-05 04:23:30','2026-04-05 04:23:30'),(4,'生产力','提高生产力的方法和工具',4,'2026-04-05 04:23:30','2026-04-05 04:23:30'),(5,'工作方式','工作相关的内容',5,'2026-04-05 04:23:30','2026-04-05 04:23:30'),(6,'创意','创意相关的内容',6,'2026-04-05 04:23:30','2026-04-05 04:23:30');
/*!40000 ALTER TABLE `category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comment`
--

DROP TABLE IF EXISTS `comment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `comment` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `article_id` bigint NOT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `author_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `author_email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `author_website` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `parent_id` bigint DEFAULT NULL,
  `status` int DEFAULT '1',
  `create_time` datetime NOT NULL,
  `update_time` datetime NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `article_id` (`article_id`) USING BTREE,
  KEY `parent_id` (`parent_id`) USING BTREE,
  CONSTRAINT `comment_ibfk_1` FOREIGN KEY (`article_id`) REFERENCES `article` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `comment_ibfk_2` FOREIGN KEY (`parent_id`) REFERENCES `comment` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comment`
--

LOCK TABLES `comment` WRITE;
/*!40000 ALTER TABLE `comment` DISABLE KEYS */;
INSERT INTO `comment` VALUES (1,1,'这篇文章写得很棒，对我很有帮助！','张三','zhangsan@example.com',NULL,NULL,1,'2026-04-05 04:23:30','2026-04-05 04:23:30'),(2,1,'谢谢你的分享，我也是一名编程初学者。','李四','lisi@example.com',NULL,1,1,'2026-04-05 04:23:30','2026-04-05 04:23:30'),(3,2,'现代前端工具真的很强大，感谢分享！','王五','wangwu@example.com',NULL,NULL,1,'2026-04-05 04:23:30','2026-04-05 04:23:30');
/*!40000 ALTER TABLE `comment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `guestbook`
--

DROP TABLE IF EXISTS `guestbook`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `guestbook` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `content` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `author_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `author_email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `author_avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reply` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `reply_time` datetime DEFAULT NULL,
  `status` int DEFAULT '1',
  `sort` int DEFAULT '0',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `status` (`status`) USING BTREE,
  KEY `sort` (`sort`) USING BTREE,
  KEY `create_time` (`create_time`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC COMMENT='留言板表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guestbook`
--

LOCK TABLES `guestbook` WRITE;
/*!40000 ALTER TABLE `guestbook` DISABLE KEYS */;
INSERT INTO `guestbook` VALUES (1,'博客内容很丰富，学到了很多知识！','技术爱好者','tech@example.com',NULL,'感谢您的支持，欢迎常来交流！','2026-04-10 12:00:00',1,1,'2026-04-10 10:00:00','2026-04-10 10:00:00'),(2,'期待更多关于前端开发的文章！','前端小白','frontend@example.com',NULL,'好的','2026-04-14 07:36:52',1,2,'2026-04-11 14:30:00','2026-04-14 07:36:52'),(3,'作者写得真好，已经关注了！','忠实读者','reader@example.com',NULL,'谢谢您的关注，我会继续努力创作更多优质内容！','2026-04-12 15:00:00',1,3,'2026-04-12 09:15:00','2026-04-12 09:15:00'),(4,'希望能出一套完整的学习教程','学习者','learner@example.com',NULL,NULL,NULL,1,4,'2026-04-13 08:00:00','2026-04-13 08:00:00'),(6,'普通用户可以不登陆吗','njs','11@a','','',NULL,1,0,'2026-04-14 23:21:09','2026-04-14 23:21:09'),(7,'hello','moliya','3298755711@qq.com','','',NULL,1,0,'2026-04-15 14:57:49','2026-04-15 14:57:49'),(9,'我是高源','黄佳磊','','','',NULL,1,0,'2026-04-24 21:42:33','2026-04-24 21:42:33');
/*!40000 ALTER TABLE `guestbook` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `page`
--

DROP TABLE IF EXISTS `page`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `page` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `slug` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` int DEFAULT '1',
  `create_time` datetime NOT NULL,
  `update_time` datetime NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `slug` (`slug`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `page`
--

LOCK TABLES `page` WRITE;
/*!40000 ALTER TABLE `page` DISABLE KEYS */;
INSERT INTO `page` VALUES (1,'about','关于我们','# 关于我们\n\n这是一个博客系统，用于分享技术文章和个人心得。\n\n## 我们的使命\n\n通过技术分享，帮助更多人成长。\n\n## 联系我们\n\n如有任何问题，欢迎联系我们。',1,'2026-04-05 04:23:30','2026-04-05 04:23:30');
/*!40000 ALTER TABLE `page` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `site_settings`
--

DROP TABLE IF EXISTS `site_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `site_settings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `key` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `key` (`key`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC COMMENT='网站设置表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `site_settings`
--

LOCK TABLES `site_settings` WRITE;
/*!40000 ALTER TABLE `site_settings` DISABLE KEYS */;
INSERT INTO `site_settings` VALUES (1,'background','{\"blur\":0,\"imageUrl\":\"/images/59ebe680-2aa2-4575-ab4e-5d852313f8e4.png\",\"overlayOpacity\":0}','2026-04-13 00:00:00','2026-04-25 23:02:09'),(2,'showTitles','false','2026-04-13 11:52:54','2026-04-13 12:04:25');
/*!40000 ALTER TABLE `site_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tag`
--

DROP TABLE IF EXISTS `tag`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tag` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort` int DEFAULT '0',
  `create_time` datetime NOT NULL,
  `update_time` datetime NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `name` (`name`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tag`
--

LOCK TABLES `tag` WRITE;
/*!40000 ALTER TABLE `tag` DISABLE KEYS */;
INSERT INTO `tag` VALUES (1,'Java','Java编程语言',1,'2026-04-05 04:23:30','2026-04-05 04:23:30'),(2,'Spring Boot','Spring Boot框架',2,'2026-04-05 04:23:30','2026-04-05 04:23:30'),(3,'前端','前端开发',3,'2026-04-05 04:23:30','2026-04-05 04:23:30'),(4,'React','React框架',4,'2026-04-05 04:23:30','2026-04-05 04:23:30'),(5,'设计思维','设计思维方法',5,'2026-04-05 04:23:30','2026-04-05 04:23:30'),(6,'时间管理','时间管理技巧',6,'2026-04-05 04:23:30','2026-04-05 04:23:30'),(7,'远程工作','远程工作相关',7,'2026-04-05 04:23:30','2026-04-05 04:23:30'),(8,'创意写作','创意写作技巧',8,'2026-04-05 04:23:30','2026-04-05 04:23:30');
/*!40000 ALTER TABLE `tag` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` int DEFAULT '1',
  `email_verified` tinyint(1) DEFAULT '0',
  `admin` tinyint(1) DEFAULT '0',
  `last_login_time` datetime DEFAULT NULL,
  `create_time` datetime NOT NULL,
  `update_time` datetime NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `username` (`username`) USING BTREE,
  UNIQUE KEY `email` (`email`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'admin','$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW','admin@example.com','/images/default.jpg',1,1,0,'2026-04-05 04:23:30','2026-04-05 04:23:30','2026-04-15 19:51:00'),(7,'xjcng','$2a$10$4ZglV7mSo2NPLJcWCwDTtOv2Lxm1/.TfE8Cc0eoyAEZNFFkGtCbq2','2970077285@qq.com','/avatar/462075c7-5ce5-43a1-b03d-41f750247540_微信图片_20260415145945_74142_2.jpg',1,0,1,'2026-04-24 04:51:48','2026-04-15 15:00:26','2026-04-24 12:51:48'),(9,'moliya','$2a$10$xvwqb6FZCHPe7uTsxyCJKu1tA7F3eFA.GfglPlU1217ea8oBTtZYG','3298755711@qq.com','/avatar/bda65cf1-8fd5-4334-94ef-f59b44813d91_Ave2.png',1,0,1,'2026-04-26 05:25:29','2026-04-15 19:50:38','2026-04-26 13:25:28'),(10,'小甜心儿','$2a$10$ULc3c98S6H1BaG5YQouojeRJk0/h2jqeoVaVy8rMHQT5qSSByGYHG','1827191969@qq.com','/avatar/e463cb65-10b4-43a0-aebc-b885b37ea224.png',1,0,NULL,'2026-04-22 14:19:47','2026-04-22 22:19:07','2026-04-22 22:19:46');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'bloger'
--

--
-- Dumping routines for database 'bloger'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-26 13:44:50
