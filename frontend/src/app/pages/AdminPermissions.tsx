import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { toast } from 'sonner';
import { userApi } from '../services/api';
import { User } from '../types';

export const AdminPermissions: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);

  // 获取用户列表
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await userApi.getUsers();
        setUsers(response);
      } catch (error) {
        toast.error('获取用户列表失败');
      }
    };

    fetchUsers();
  }, []);

  const handleToggleAdmin = async (userId: number, currentAdmin: boolean) => {
    try {
      // 找到对应的用户
      const user = users.find(u => u.id === userId);
      if (!user) return;
      
      // 调用API更新用户权限
      await userApi.updateUser(userId, {
        ...user,
        admin: !currentAdmin
      });
      // 更新本地状态
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, admin: !currentAdmin } 
          : user
      ));
      toast.success('权限更新成功');
    } catch (error) {
      toast.error('更新权限失败');
    }
  };

  return (
    <div className="space-y-6 w-full">
      
      <Card className="h-full">
        <div className="p-6 h-full flex flex-col">
          <h3 className="text-lg font-semibold mb-4">用户权限列表</h3>
          
          <div className="flex-1 overflow-auto" style={{ maxHeight: '500px' }}>
            <Table>
              <TableHeader>
              <TableRow>
                <TableHead>用户名</TableHead>
                <TableHead>邮箱</TableHead>
                <TableHead>管理员权限</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>创建时间</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(user => (
                <TableRow key={user.id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={user.admin} 
                        onCheckedChange={() => handleToggleAdmin(user.id, user.admin)}
                      />
                      <span>{user.admin ? '是' : '否'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === 1 ? 'default' : 'outline'}>
                      {user.status === 1 ? '活跃' : '禁用'}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.createTime}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            </Table>
          </div>
        </div>
      </Card>
    </div>
  );
};
