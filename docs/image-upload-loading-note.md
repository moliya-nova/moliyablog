# 图片上传与加载实现笔记（优化后）

## 1. 整体架构

```
┌──────────────────────────────────────────────────────────────┐
│  前端 (React 18 + TypeScript + Vite)                          │
│  ├── 组件: LazyImage / ImageGalleryPanel / ImageUploader      │
│  │         CoverImageUploader / ImageSelectorDialog            │
│  ├── 工具: imageUtils.ts (URL解析 + 校验 + 内存缓存)            │
│  └── 服务: api.ts — fileApi (227-440行)                       │
├──────────────────────────────────────────────────────────────┤
│  后端 (Spring Boot 3.2 + Java 17 + MyBatis)                   │
│  ├── FileController  /  GalleryController  (REST API)         │
│  ├── CosUtil (腾讯云COS SDK封装)                               │
│  ├── ImageStorageService (MySQL元数据 CRUD)                    │
│  └── CosSyncService (COS → DB 同步)                           │
├──────────────────────────────────────────────────────────────┤
│  存储层                                                       │
│  ├── 腾讯云 COS: moliya-bloger-1423725546 (ap-beijing)        │
│  ├── CDN: https://cdn.moliya.love                             │
│  └── MySQL: image_directory + image_path 表                   │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. 组件关系（优化后）

```
CoverImageUploader ──→ ImageGalleryPanel ──→ LazyImage
ImageSelectorDialog ──→ ImageGalleryPanel ──→ LazyImage
ImageUploader (独立，无人使用)
MarkdownContent ──→ LazyImage (替代原来的 LazyMarkdownImage)
```

- `ImageGalleryPanel` 是图库选择/上传的共用组件（200 行），`CoverImageUploader`（64 行）和 `ImageSelectorDialog`（33 行）都是它的外壳。
- `LazyMarkdownImage` 已删除，博客正文图片直接复用 `LazyImage`。
- 文件校验统一为 `validateImageFile()`（`imageUtils.ts:18-25`）。

---

## 3. 五大图片流程

### 3.1 封面图选择（CoverImageUploader）

```
有封面图时 → LazyImage 显示预览 → 悬停显示删除按钮 → onChange('')

无封面图时 → 点击触发按钮 → Dialog 打开
  ↓
  ImageGalleryPanel (directory="images")
    ├── [图库] GET /api/files/directories → GET /api/files/directories/{id}/images（分页50）
    │        → 选中 → onSelect("/" + cosKey)
    └── [上传] 选择文件 → validateImageFile（20MB, jpg/png/webp）
             → POST /api/files/upload (multipart)
             → 后端: CosUtil.uploadFile → ImageStorageService.saveImage
             → onSelect("/" + result.key)
  ↓
  onChange(imagePath) → 对话框关闭
```

**组件**：`CoverImageUploader.tsx`（64行）
**上传方式**：后端转发（POST /api/files/upload）
**校验**：validateImageFile() 统一函数

### 3.2 独立图片选择（ImageSelectorDialog）

由外部控制开关（`open`/`onOpenChange` props），内部使用 `ImageGalleryPanel`，选择后调用 `onSelect(path)` 并关闭。

**组件**：`ImageSelectorDialog.tsx`（33行）
**使用场景**：AdminPages 轮播图设置
**流程**：与 CoverImageUploader 的图库/上传逻辑完全相同

### 3.3 博客写作内嵌图片（AdminBlogWriter）

AdminBlogWriter 中有独立的图片插入对话框（未使用 ImageGalleryPanel，因为目的不同：插入 Markdown 语法而非选择路径）。

- **图库模式**：找到 `article/` 目录 → 翻页浏览 → 插入 `![image](/article/xxx.png)`
- **上传模式**：POST /api/files/upload (directory="article") → 插入 markdown 语法
- **预览模式**：解析 markdown 中的 `/article/` 图片 → `GET /api/files/cos/read` → 替换为签名 URL

### 3.4 图库管理上传（AdminGallery）

```
选择文件 → GET /api/files/cos/sign?type=images&folder=当前路径&filename=文件名
  → 返回 {url (预签名PUT), key}
  → PUT <预签名URL> (直传 COS，不经过后端)
  → POST /api/files/save (保存元数据: key, filename, size, directory)
  → 返回 {key, cdnUrl}
```

**上传方式**：前端直传（预签名 URL）
**校验**：AdminGallery 自有逻辑（未使用 validateImageFile，因为图库管理场景可能放宽限制）

### 3.5 注册头像上传（Register）

```
选择头像 → validateImageFile(file)（20MB, jpg/png/webp）
  → GET /api/files/cos/sign?type=avatar&filename=xxx.jpg
  → 返回 {url (预签名PUT), key}
  → PUT <预签名URL> (直传 COS)
  → avatarPath = "/" + key
  → 随注册表单提交，存入 users.avatar 字段
```

> 头像**不**调用 POST /api/files/save，不写入 image_path 表。头像路径存在 `users.avatar` 字段，属用户信息范畴，不在图库管理范围。

**校验**：validateImageFile() 统一函数

---

## 4. 图片加载管线

### 4.1 URL 解析 (imagePath.ts)

```
输入路径
  ├─ 外部URL（非CDN的http/https）→ 原样返回
  └─ normalizePath()
       ├─ CDN URL → 提取 key 部分
       ├─ /api/files/image/xxx → /images/xxx（兼容旧版API）
       ├─ /api/files/avatar/xxx → /avatar/xxx
       ├─ /api/files/article/xxx → /article/xxx
       └─ 已是标准格式 → 保持不变
            ↓
        内存缓存检查 (Map, TTL=3500秒)
            ├─ 命中 → 返回缓存URL
            └─ 未命中 → 拼接 CDN_BASE_URL + "/" + cosKey → 缓存并返回
```

**关键常量**：
- `CDN_BASE_URL = 'https://cdn.moliya.love'`
- `CACHE_DURATION = 3500 * 1000`（58分钟）

**标准路径类型**：`/images/*`, `/avatar/*`, `/article/*`

### 4.2 懒加载 (LazyImage)

IntersectionObserver 监听容器进入视口（threshold=0.1, rootMargin=100px）：

```
容器进入视口 → setIsInView(true) → getImageUrl(src) → <img src={cdnUrl}>
  ├── 加载中：灰色脉冲骨架屏 (bg-gray-200 animate-pulse)
  ├── 成功：显示图片
  └── 失败：显示"图片加载失败"
```

支持 `preloaded=true` 跳过 Observer 立即加载（用于首屏）。

### 4.3 Markdown 图片

博客正文中的 `<img>` 由 `ReactMarkdown` 渲染，直接复用 `LazyImage`（之前有独立的 LazyMarkdownImage，已删除）。

### 4.4 ImageWithFallback

轻量组件（41行），异步调用 `getImageUrl()` 解析 CDN URL，加载失败时显示 SVG 破损图标兜底。

### 4.5 useImageUrl Hook

```typescript
function useImageUrl(src) {
  // useEffect 中调用 getImageUrl(src)
  return { url, loading };
}
```

用于 `Background.tsx`、`About.tsx` 等需要编程式获取图片 URL 的场景。

---

## 5. 上传方式对比

| 方式 | 数据流 | 使用场景 |
|------|--------|---------|
| **后端转发** `POST /api/files/upload` | 前端 → 后端 → COS | CoverImageUploader 文件、ImageSelectorDialog 文件、BlogWriter 内嵌图片 |
| **前端直传** 预签名 URL | 前端 → COS，然后 POST /api/files/save | AdminGallery、ImageUploader |
| **仅直传不入库** | 前端 → COS，路径存入业务表 | Register 头像 |

---

## 6. API 端点

### FileController (`/api/files`)

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/cos/sign?type=&filename=&folder=` | 获取上传预签名URL（PUT） |
| GET | `/cos/read?key=` | 获取读取预签名URL（GET，3600s） |
| GET | `/cos/list?prefix=` | 列出COS对象 |
| GET | `/directories` | 获取顶层目录（DB） |
| GET | `/directories/{id}/children` | 获取子目录 |
| GET | `/directories/{id}/images?page=&size=` | 分页获取目录图片 |
| POST | `/upload` | 上传图片（后端转发到COS + 入库） |
| DELETE | `/images/{id}` | 删除图片（COS + DB） |
| POST | `/save` | 保存元数据（前端直传后入库） |
| POST | `/sync` | 触发 COS → DB 同步 |
| GET | `/sync/progress` | 同步进度 |

### GalleryController (`/api/gallery`)

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/list?prefix=&page=&size=` | 列出子目录和图片（分页） |
| POST | `/upload/sign?filename=&folder=` | 获取真实COS上传签名 |
| DELETE | `/delete?key=` | 删除文件 |
| DELETE | `/delete/batch` | 批量删除 |
| POST | `/move?sourceKey=&destinationKey=` | 移动文件 |
| POST | `/rename?oldKey=&newKey=` | 重命名 |
| POST | `/folder/create?folderKey=` | 创建文件夹 |
| GET | `/tree` | 获取完整目录树 |

---

## 7. 前台文件校验规则（统一）

`imageUtils.ts` — `validateImageFile(file)`

```typescript
MAX_FILE_SIZE = 20MB
ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
```

所有前台组件统一调用此函数。后端 `multipart.max-file-size: 50MB`。

---

## 8. 数据库表

### image_directory

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| name | VARCHAR | 目录名 |
| path | VARCHAR | 路径（如 `images/2024/`） |
| parent_id | BIGINT | 父目录ID（顶层为NULL） |
| image_count | INT | 图片计数 |
| sort | INT | 排序 |
| create_time | DATETIME | 创建时间 |
| update_time | DATETIME | 更新时间 |

### image_path

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| directory_id | BIGINT | 所属目录ID |
| cos_key | VARCHAR | COS对象key |
| filename | VARCHAR | 原始文件名 |
| size | BIGINT | 文件大小（字节） |
| cdn_url | VARCHAR | CDN完整URL（自动生成） |
| uploader_id | BIGINT | 上传者ID |
| create_time | DATETIME | 创建时间 |

---

## 9. 关键文件索引

### 前端（核心）

| 文件 | 说明 |
|------|------|
| `utils/imagePath.ts` | URL解析、路径标准化、CDN拼接、内存缓存 |
| `utils/imageUtils.ts` | 统一导出 + `validateImageFile()` |
| `hooks/useImageUrl.ts` | 异步获取图片URL的React Hook |
| `components/LazyImage.tsx` | IntersectionObserver懒加载组件 |
| `components/ImageGalleryPanel.tsx` | 图库/上传共用面板（200行） |
| `components/CoverImageUploader.tsx` | 封面图选择器（64行） |
| `components/ImageSelectorDialog.tsx` | 独立图片选择对话框（33行） |
| `components/ui/ImageUploader.tsx` | 简化上传按钮（直传+入库） |
| `components/figma/ImageWithFallback.tsx` | 带兜底的`<img>`组件 |
| `components/MarkdownContent.tsx` | Markdown渲染，img用LazyImage |
| `services/api.ts` | `fileApi`（227-440行） |

### 前端（页面中使用图片的）

| 文件 | 图片用途 |
|------|---------|
| `pages/AdminBlogWriter.tsx` | 封面图、正文内嵌图片 |
| `pages/AdminGallery.tsx` | 图库管理 |
| `pages/AdminPages.tsx` | 轮播图、背景图 |
| `pages/AdminContent.tsx` | 文章图片URL |
| `pages/Register.tsx` | 头像上传 |
| `pages/About.tsx` | 头像展示 |
| `pages/BlogDetail.tsx` | 封面图、相关推荐 |
| `components/BlogCard.tsx` | 卡片封面图 |
| `components/Background.tsx` | 全站背景图 |

### 后端

| 文件 | 说明 |
|------|------|
| `controller/FileController.java` | `/api/files/*` REST接口 |
| `controller/GalleryController.java` | `/api/gallery/*` REST接口 |
| `util/CosUtil.java` | COS SDK封装（预签名、上传、删除、列表） |
| `util/ImagePathValidator.java` | 路径格式正则验证 |
| `config/CosConfig.java` | COS配置属性 |
| `config/WebConfig.java` | 本地静态资源映射 |
| `service/ImageStorageService.java` | 图片元数据服务接口 |
| `service/impl/ImageStorageServiceImpl.java` | 图片元数据实现（含moveImage计数修复） |
| `service/impl/CosSyncServiceImpl.java` | COS→DB同步（AtomicBoolean） |
| `entity/ImageDirectory.java` | 目录实体 |
| `entity/ImagePath.java` | 图片实体 |
| `mapper/ImageDirectoryMapper.java` + `.xml` | 目录表映射 |
| `mapper/ImagePathMapper.java` + `.xml` | 图片表映射 |

---

## 10. 存量特点与优化记录

### 已修复（本次优化）

| 问题 | 状态 |
|------|------|
| `moveImage` 目录计数 Bug（旧目录计数永不减少） | 已修复 |
| `GalleryController.getUploadSign` 返回假签名 | 已修复 |
| `ImageUploader` 上传后不入库（幽灵文件） | 已修复 |
| CoverImageUploader / ImageSelectorDialog 重复 ~350行 | 已提取 ImageGalleryPanel |
| LazyMarkdownImage 与 LazyImage 功能重复 | 已删除，复用 LazyImage |
| 文件校验规则不一致（4处各自实现） | 已统一为 validateImageFile() |
| GalleryController.listObjects 分页写死1000 | 已加 page/size 参数 |
| CosSyncService volatile 竞态 | 已改用 AtomicBoolean |
| saveImage 无 cosKey 空值校验 | 已加校验并抛异常 |
| ImageSelectorDialog 未使用的 articleApi import | 已清理 |

### 仍存在的特点

| 事项 | 说明 |
|------|------|
| 双上传路径 | 后端转发 + 前端直传，两种方式并存但各有明确的使用场景 |
| 无服务端图片处理 | 无压缩/裁剪/水印/缩略图，原图直传直出 |
| CDN 公开读取 | 常规图片直接通过 CDN URL 公开加载，博客预览模式中的 /article/ 图片通过签名 URL |
| 前端内存缓存 | Map 缓存 CDN URL 解析结果，TTL 58分钟，页面刷新消失 |
| DB-COS 同步 | CosSyncService 手动触发，无定期自动同步 |
| 图片删除 | 只删 COS + image_path 记录，不清理业务表（Article、User等）中的引用字段 |
