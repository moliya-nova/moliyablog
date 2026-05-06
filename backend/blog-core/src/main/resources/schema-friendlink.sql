-- 友链表
CREATE TABLE IF NOT EXISTS friend_link (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '博主/网站名称',
    avatar VARCHAR(500) COMMENT '头像/Logo URL',
    description VARCHAR(500) COMMENT '简介/描述',
    url VARCHAR(500) NOT NULL COMMENT '网站链接',
    category VARCHAR(50) DEFAULT '默认' COMMENT '分类',
    sort INT DEFAULT 0 COMMENT '排序',
    status INT DEFAULT 1 COMMENT '状态: 0-隐藏, 1-显示',
    is_alive TINYINT DEFAULT 1 COMMENT '站点状态: 0-不可达, 1-正常',
    last_check_time DATETIME COMMENT '最后检测时间',
    card_style VARCHAR(50) DEFAULT 'default' COMMENT '卡片样式: default/gradient/minimal',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='友情链接表';

-- 友链申请表
CREATE TABLE IF NOT EXISTS friend_link_apply (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '网站名称',
    avatar VARCHAR(500) COMMENT '头像/Logo URL',
    description VARCHAR(500) COMMENT '简介/描述',
    url VARCHAR(500) NOT NULL COMMENT '网站链接',
    email VARCHAR(100) COMMENT '联系邮箱',
    reason VARCHAR(500) COMMENT '申请理由',
    status INT DEFAULT 0 COMMENT '状态: 0-待审核, 1-已通过, 2-已拒绝',
    admin_reply VARCHAR(500) COMMENT '管理员回复',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='友链申请表';
