import auth from "@/plugins/auth";
import router, {
  constantRoutes,
  dynamicRoutes,
  staticMenuRoutes,
} from "@/router";
import Layout from "@/layout/index";
import ParentView from "@/components/ParentView";
import InnerLink from "@/layout/components/InnerLink";
import { getRouters } from "@/api/menu";

// 源码项目（后端 sys_menu 菜单表）中原来的主菜单栏
const ORIGIN_MENU_TITLES = [
  "运营管理",
  "系统管理",
  "系统监控",
  "系统工具",
  "Demo模块",
  "定时任务",
];

function deepClone(obj, hash = new WeakMap()) {
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof RegExp) return new RegExp(obj);
  if (typeof obj === "function") return obj;
  if (hash.has(obj)) return hash.get(obj);
  const clone = Array.isArray(obj) ? [] : {};
  hash.set(obj, clone);
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      clone[key] = deepClone(obj[key], hash);
    }
  }
  return clone;
}

const permission = {
  state: {
    routes: [],
    addRoutes: [],
    defaultRoutes: [],
    topbarRouters: [],
    sidebarRouters: [],
    originRouters: [],
  },
  mutations: {
    SET_ROUTES: (state, routes) => {
      state.addRoutes = routes;
      state.routes = constantRoutes.concat(routes);
    },
    SET_DEFAULT_ROUTES: (state, routes) => {
      state.defaultRoutes = constantRoutes.concat(routes);
    },
    SET_TOPBAR_ROUTES: (state, routes) => {
      state.topbarRouters = routes;
    },
    SET_SIDEBAR_ROUTERS: (state, routes) => {
      state.sidebarRouters = routes;
    },
    SET_ORIGIN_ROUTERS: (state, routes) => {
      state.originRouters = routes;
    },
  },
  actions: {
    // 生成路由（使用前端静态定义的菜单）
    GenerateRoutes({ commit }) {
      return new Promise((resolve) => {
        const sdata = deepClone(staticMenuRoutes);
        const rdata = deepClone(staticMenuRoutes);
        const sidebarRoutes = filterAsyncRouter(sdata);
        const rewriteRoutes = filterAsyncRouter(rdata, false, true);
        const asyncRoutes = filterDynamicRoutes(dynamicRoutes);

        const topStandalone = constantRoutes.filter(
          (r) => r.path === "/workbench/dashboard"
        );
        if (topStandalone.length) router.addRoutes(topStandalone);

        router.addRoutes(rewriteRoutes);
        router.addRoutes(asyncRoutes);
        router.addRoutes([{ path: "*", redirect: "/404", hidden: true }]);

        const topbarRoutes = sidebarRoutes;
        commit("SET_ROUTES", rewriteRoutes);
        commit("SET_SIDEBAR_ROUTERS", constantRoutes.concat(sidebarRoutes));
        commit("SET_DEFAULT_ROUTES", sidebarRoutes);
        commit("SET_TOPBAR_ROUTES", topbarRoutes);
        // 源码项目中的原始菜单（来自后端 sys_menu），单独注册并保存，供顶部“原始菜单”下拉使用
        loadOriginRoutes()
          .then((originRoutes) => {
            commit("SET_ORIGIN_ROUTERS", originRoutes);
          })
          .finally(() => {
            resolve(rewriteRoutes);
          });
      });
    },
  },
};

// 读取后端菜单表（sys_menu）中原来的主菜单栏，并注册其路由
async function loadOriginRoutes() {
  try {
    const res = await getRouters();
    const menus = (res && res.data) || [];
    // 只保留源码项目原来的主菜单栏（含 visible='1' 被标记为 hidden 的菜单，下拉需完整展示）
    const originMenus = menus.filter(
      (menu) => menu.meta && ORIGIN_MENU_TITLES.indexOf(menu.meta.title) !== -1
    );
    if (originMenus.length === 0) {
      return [];
    }
    // 保留层级的菜单，用于顶部下拉与侧边栏展示
    const nestedRoutes = filterAsyncRouter(deepClone(originMenus), false, false);
    // 扁平化后的路由，用于注册到 router，保证子菜单可正常跳转
    const registeredRoutes = filterAsyncRouter(
      deepClone(originMenus),
      false,
      true
    );
    removeNoRedirect(registeredRoutes);
    // 注意：原始菜单路由与现有静态路由可能冲突（如 /system），
    // 这里不再 addRoutes，只保存到 store 供“原始菜单”下拉展示，避免登录后跳 404
    return nestedRoutes;
  } catch (e) {
    return [];
  }
}

// 后端父级菜单 redirect 为 noRedirect，注册前移除，避免路由解析异常
function removeNoRedirect(routes) {
  routes.forEach((route) => {
    if (route.redirect === "noRedirect") {
      delete route.redirect;
    }
    if (route.children && route.children.length) {
      removeNoRedirect(route.children);
    }
  });
}

// 遍历后台传来的路由字符串，转换为组件对象
function filterAsyncRouter(asyncRouterMap, lastRouter = false, type = false) {
  return asyncRouterMap.filter((route) => {
    if (route.redirect && !route.children && !route.component) {
      return true;
    }
    if (type && route.children) {
      route.children = filterChildren(route.children);
    }
    if (route.component) {
      // Layout ParentView 组件特殊处理
      if (route.component === "Layout") {
        route.component = Layout;
      } else if (route.component === "ParentView") {
        route.component = ParentView;
      } else if (route.component === "InnerLink") {
        route.component = InnerLink;
      } else if (typeof route.component === "string") {
        route.component = loadView(route.component);
      }
    }
    if (route.children != null && route.children && route.children.length) {
      route.children = filterAsyncRouter(route.children, route, type);
    } else {
      delete route["children"];
      if (!route.redirect) {
        delete route["redirect"];
      }
    }
    return true;
  });
}

function filterChildren(childrenMap, lastRouter = false) {
  var children = [];
  childrenMap.forEach((el, index) => {
    if (el.children && el.children.length) {
      if (el.component === ParentView && !lastRouter) {
        el.children.forEach((c) => {
          c.path = el.path + "/" + c.path;
          if (c.children && c.children.length) {
            children = children.concat(filterChildren(c.children, c));
            return;
          }
          children.push(c);
        });
        return;
      }
    }
    if (lastRouter) {
      el.path = lastRouter.path + "/" + el.path;
      if (el.children && el.children.length) {
        children = children.concat(filterChildren(el.children, el));
        return;
      }
    }
    children = children.concat(el);
  });
  return children;
}

// 动态路由遍历，验证是否具备权限
export function filterDynamicRoutes(routes) {
  const res = [];
  routes.forEach((route) => {
    if (route.permissions) {
      if (auth.hasPermiOr(route.permissions)) {
        res.push(route);
      }
    } else if (route.roles) {
      if (auth.hasRoleOr(route.roles)) {
        res.push(route);
      }
    }
  });
  return res;
}

export const loadView = (view) => {
  if (process.env.NODE_ENV === "development") {
    return (resolve) => require([`@/views/${view}`], resolve);
  } else {
    // 使用 import 实现生产环境的路由懒加载
    return () => import(`@/views/${view}`);
  }
};

export default permission;
