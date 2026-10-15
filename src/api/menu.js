import request from '@/utils/request'

// 获取路由
export const getRouters = () => {
  return request({
    url: '/system/menu/getRouters',
    method: 'get'
  })
}

// 获取菜单列表（开发级管理员返回全部菜单，不受角色关联(sys_role_menu)限制）
export const listMenu = (query) => {
  return request({
    url: '/system/menu/list',
    method: 'get',
    params: query
  })
}
