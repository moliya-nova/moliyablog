# 图库管理功能接口文档

## 1. 功能概述

图库管理功能用于管理腾讯云COS（对象存储）中的图片资源，支持以下操作：
- 浏览文件夹结构和文件列表
- 上传图片文件
- 删除单个或多个文件
- 移动文件到指定文件夹
- 重命名文件
- 创建新文件夹

## 2. 技术架构

### 后端技术栈
- **框架**：Spring Boot
- **语言**：Java
- **云存储**：腾讯云COS SDK
- **安全**：JWT认证

### 前端技术栈
- **框架**：React + TypeScript
- **UI库**：Tailwind CSS + Radix UI
- **状态管理**：React Hooks (useState, useEffect, useCallback)
- **图标**：Lucide React

## 3. 后端接口文档

### 3.1 获取文件列表

**接口路径**：`/api/gallery/list`
**请求方法**：`GET`
**认证方式**：Bearer Token (JWT)
**功能描述**：获取指定路径下的文件夹和文件列表

**请求参数**：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| prefix | string | 否 | 文件夹路径前缀，为空时获取根目录内容 |

**请求示例**：
```
GET /api/gallery/list?prefix=images/
Authorization: Bearer <token>
```

**响应数据**：
```json
[
  {
    "type": "folder",
    "key": "images/albums/",
    "name": "albums"
  },
  {
    "type": "file",
    "key": "images/example.jpg",
    "name": "example.jpg",
    "size": 102400,
    "lastModified": "2024-01-01T00:00:00Z",
    "cosUrl": "https://moliya-bloger-1423725546.cos.ap-beijing.myqcloud.com/images/example.jpg"
  }
]
```

**响应字段说明**：
| 字段名 | 类型 | 说明 |
|--------|------|------|
| type | string | 类型：folder（文件夹）或 file（文件） |
| key | string | 文件/文件夹的完整路径 |
| name | string | 文件/文件夹名称 |
| size | number | 文件大小（字节），仅文件有此字段 |
| lastModified | string | 最后修改时间（ISO 8601格式），仅文件有此字段 |
| cosUrl | string | 腾讯云COS的访问URL，仅文件有此字段 |

---

### 3.2 获取文件上传签名

**接口路径**：`/api/gallery/upload/sign`
**请求方法**：`POST`
**认证方式**：Bearer Token (JWT)
**功能描述**：获取预签名URL用于直接上传文件到COS

**请求参数**：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| filename | string | 是 | 要上传的文件名 |
| folder | string | 是 | 目标文件夹路径 |

**请求示例**：
```
POST /api/gallery/upload/sign?filename=photo.jpg&folder=images/
Authorization: Bearer <token>
```

**响应数据**：
```json
{
  "url": "https://moliya-bloger-1423725546.cos.ap-beijing.myqcloud.com/images/550e8400-e29b-41d4-a716-446655440000.jpg?sign=...",
  "key": "images/550e8400-e29b-41d4-a716-446655440000.jpg",
  "cosUrl": "https://moliya-bloger-1423725546.cos.ap-beijing.myqcloud.com/images/550e8400-e29b-41d4-a716-446655440000.jpg"
}
```

**响应字段说明**：
| 字段名 | 类型 | 说明 |
|--------|------|------|
| url | string | 预签名上传URL，用于PUT请求上传文件 |
| key | string | 文件在COS中的存储路径 |
| cosUrl | string | 文件的最终访问URL |

---

### 3.3 删除单个文件

**接口路径**：`/api/gallery/delete`
**请求方法**：`DELETE`
**认证方式**：Bearer Token (JWT)
**功能描述**：删除COS中的单个文件

**请求参数**：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| key | string | 是 | 要删除的文件完整路径 |

**请求示例**：
```
DELETE /api/gallery/delete?key=images/example.jpg
Authorization: Bearer <token>
```

**响应数据**：无（成功返回204 No Content）

---

### 3.4 批量删除文件

**接口路径**：`/api/gallery/delete/batch`
**请求方法**：`DELETE`
**认证方式**：Bearer Token (JWT)
**功能描述**：批量删除COS中的多个文件

**请求参数**：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| keys | string[] | 是 | 要删除的文件完整路径数组（JSON格式） |

**请求示例**：
```
DELETE /api/gallery/delete/batch
Authorization: Bearer <token>
Content-Type: application/json

["images/example1.jpg", "images/example2.jpg"]
```

**响应数据**：无（成功返回204 No Content）

---

### 3.5 移动文件

**接口路径**：`/api/gallery/move`
**请求方法**：`POST`
**认证方式**：Bearer Token (JWT)
**功能描述**：将文件移动到指定位置（实际通过复制+删除实现）

**请求参数**：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| sourceKey | string | 是 | 源文件完整路径 |
| destinationKey | string | 是 | 目标文件完整路径 |

**请求示例**：
```
POST /api/gallery/move?sourceKey=images/example.jpg&destinationKey=images/albums/example.jpg
Authorization: Bearer <token>
```

**响应数据**：无（成功返回200 OK）

---

### 3.6 重命名文件

**接口路径**：`/api/gallery/rename`
**请求方法**：`POST`
**认证方式**：Bearer Token (JWT)
**功能描述**：重命名文件（实际通过复制+删除实现）

**请求参数**：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| oldKey | string | 是 | 原文件完整路径 |
| newKey | string | 是 | 新文件完整路径 |

**请求示例**：
```
POST /api/gallery/rename?oldKey=images/example.jpg&newKey=images/new-name.jpg
Authorization: Bearer <token>
```

**响应数据**：无（成功返回200 OK）

---

### 3.7 创建文件夹

**接口路径**：`/api/gallery/folder/create`
**请求方法**：`POST`
**认证方式**：Bearer Token (JWT)
**功能描述**：在COS中创建新文件夹

**请求参数**：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| folderKey | string | 是 | 文件夹路径，需以 `/` 结尾 |

**请求示例**：
```
POST /api/gallery/folder/create?folderKey=images/new-folder/
Authorization: Bearer <token>
```

**响应数据**：无（成功返回200 OK）

---

## 4. 前端API集成

### 4.1 API调用方式

前端通过Fetch API调用后端接口，需在请求头中携带JWT令牌：

```typescript
const token = localStorage.getItem('token');
const response = await fetch(apiUrl, {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
```

### 4.2 前端接口封装

```typescript
// 获取文件列表
const fetchItems = async (path: string) => {
  const token = localStorage.getItem('token');
  const response = await fetch(
    `http://localhost:8080/api/gallery/list?prefix=${encodeURIComponent(path)}`,
    {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    }
  );
  return response.json();
};

// 上传文件
const uploadFile = async (file: File, folder: string) => {
  // 1. 获取上传签名
  const signResponse = await fetch(
    `http://localhost:8080/api/gallery/upload/sign?filename=${file.name}&folder=${folder}`,
    {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    }
  );
  const signData = await signResponse.json();

  // 2. 使用签名URL上传文件
  await fetch(signData.url, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  });

  return signData;
};

// 删除文件
const deleteFile = async (key: string) => {
  await fetch(
    `http://localhost:8080/api/gallery/delete?key=${encodeURIComponent(key)}`,
    {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    }
  );
};

// 批量删除文件
const deleteFiles = async (keys: string[]) => {
  await fetch('http://localhost:8080/api/gallery/delete/batch', {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(keys),
  });
};

// 移动文件
const moveFile = async (sourceKey: string, destinationKey: string) => {
  await fetch(
    `http://localhost:8080/api/gallery/move?sourceKey=${encodeURIComponent(sourceKey)}&destinationKey=${encodeURIComponent(destinationKey)}`,
    {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    }
  );
};

// 重命名文件
const renameFile = async (oldKey: string, newKey: string) => {
  await fetch(
    `http://localhost:8080/api/gallery/rename?oldKey=${encodeURIComponent(oldKey)}&newKey=${encodeURIComponent(newKey)}`,
    {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    }
  );
};

// 创建文件夹
const createFolder = async (folderKey: string) => {
  await fetch(
    `http://localhost:8080/api/gallery/folder/create?folderKey=${encodeURIComponent(folderKey)}`,
    {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    }
  );
};
```

### 4.3 数据类型定义

```typescript
// 文件夹类型
interface Folder {
  type: 'folder';
  key: string;
  name: string;
}

// 文件类型
interface File {
  type: 'file';
  key: string;
  name: string;
  size: number;
  lastModified: string;
  cosUrl: string;
}

// 联合类型
type GalleryItem = Folder | File;

// 文件夹树节点
interface FolderTreeItem extends Folder {
  expanded: boolean;
  children: FolderTreeItem[];
}
```

---

## 5. 错误处理

### 5.1 HTTP状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 204 | 请求成功，无返回内容（如删除操作） |
| 400 | 请求参数错误 |
| 401 | 未授权（未提供或无效的令牌） |
| 403 | 禁止访问（无权限） |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

### 5.2 错误响应格式

```json
{
  "error": "错误描述",
  "message": "详细错误信息"
}
```

### 5.3 前端错误处理示例

```typescript
try {
  const response = await fetch(apiUrl, options);

  if (!response.ok) {
    if (response.status === 401) {
      toast.error('登录已过期，请重新登录');
      // 跳转到登录页
    } else if (response.status === 403) {
      toast.error('没有权限执行此操作');
    } else {
      toast.error('操作失败，请稍后重试');
    }
    return;
  }

  // 处理成功响应
  const data = await response.json();
  toast.success('操作成功');
} catch (error) {
  toast.error('网络错误，请检查网络连接');
}
```

---

## 6. 腾讯云COS配置

### 6.1 配置参数

| 参数名 | 说明 | 示例值 |
|--------|------|--------|
| secretId | 腾讯云访问密钥ID | YOUR_SECRET_ID |
| secretKey | 腾讯云访问密钥Key | YOUR_SECRET_KEY |
| bucketName | COS存储桶名称 | moliya-bloger-1423725546 |
| region | COS地域区域 | ap-beijing |
| baseUrl | COS基础访问URL | https://moliya-bloger-1423725546.cos.ap-beijing.myqcloud.com |

### 6.2 存储桶权限配置

确保存储桶具有以下权限配置：
- 读取权限：允许通过签名URL或公开访问读取文件
- 写入权限：允许通过预签名URL上传文件
- 删除权限：允许删除文件

---

## 7. 使用流程示例

### 7.1 浏览文件列表

```typescript
// 获取根目录文件列表
const items = await fetchItems('');

// 获取指定文件夹内容
const items = await fetchItems('images/');
```

### 7.2 上传文件

```typescript
// 选择文件并上传
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];

// 上传到 images/ 文件夹
const result = await uploadFile(file, 'images/');
console.log('文件上传成功，访问地址：', result.cosUrl);
```

### 7.3 删除文件

```typescript
// 删除单个文件
await deleteFile('images/example.jpg');

// 批量删除
await deleteFiles(['images/photo1.jpg', 'images/photo2.jpg']);
```

### 7.4 移动文件

```typescript
// 将文件移动到新文件夹
await moveFile('images/example.jpg', 'images/albums/example.jpg');
```

### 7.5 重命名文件

```typescript
// 重命名文件
await renameFile('images/old-name.jpg', 'images/new-name.jpg');
```

### 7.6 创建文件夹

```typescript
// 创建新文件夹
await createFolder('images/new-folder/');
```

---

## 8. 安全注意事项

1. **令牌管理**：JWT令牌存储在localStorage中，前端每次请求需在Header携带
2. **签名URL有效期**：上传签名URL默认有效期为1小时（3600秒）
3. **权限验证**：所有接口需通过Spring Security权限验证
4. **CORS配置**：后端需正确配置CORS允许前端域名访问
5. **敏感信息**：secretId和secretKey仅存储在后端配置中，不暴露给前端
