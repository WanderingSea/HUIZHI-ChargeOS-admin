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
import { listMenu } from "@/api/system/menu";
import { handleTree } from "@/utils/hcp";

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
    GenerateRoutes({ commit }) {
      return new Promise((resolve) => {
        const sdata = deepClone(staticMenuRoutes);
        const rdata = deepClone(staticMenuRoutes);
        const sidebarRoutes = filterAsyncRouter(sdata);
        const rewriteRoutes = filterAsyncRouter(rdata, false, true);
        const asyncRoutes = filterDynamicRoutes(dynamicRoutes);
        const topbarRoutes = sidebarRoutes;

        commit("SET_ROUTES", rewriteRoutes);
        commit("SET_SIDEBAR_ROUTERS", constantRoutes.concat(sidebarRoutes));
        commit("SET_DEFAULT_ROUTES", sidebarRoutes);
        commit("SET_TOPBAR_ROUTES", topbarRoutes);

        loadOriginRoutes()
          .then((originRoutes) => {
            commit("SET_ORIGIN_ROUTERS", originRoutes);
          })
          .finally(() => {
            resolve(rewriteRoutes.concat(asyncRoutes));
          });
      });
    },
  },
};

function transformMenusToRoutes(menus) {
  if (!menus || !Array.isArray(menus)) return [];

  const validMenus = menus.filter((m) => {
    const menuType = String(m.menuType ?? "");
    const status = String(m.status ?? "");
    return menuType !== "F" && status === "0";
  });

  const tree = handleTree(validMenus, "menuId", "parentId");
  return tree.map((menu) => convertMenuToRoute(menu, true));
}

function convertMenuToRoute(menu, isRoot = false) {
  let comp = menu.component;

  if (!comp || comp === "" || comp === "null") {
    if (isRoot) {
      comp = "Layout";
    } else if (menu.children && menu.children.length > 0) {
      comp = "ParentView";
    }
  }

  const route = {
    path: menu.path ? menu.path.trim() : "",
    component: comp,
    meta: {
      title: menu.menuName || menu.title || "",
      icon: menu.icon || "",
    },
    hidden: String(menu.visible ?? "") === "1" || menu.hidden === true,
  };

  if (menu.query) {
    route.query = menu.query;
  }
  if (menu.isFrame === "0" || menu.isFrame === 0) {
    route.meta.isFrame = true;
  }

  const children = (menu.children || [])
    .filter((c) => {
      const menuType = String(c.menuType ?? "");
      const status = String(c.status ?? "");
      return menuType !== "F" && status === "0";
    })
    .map((c) => convertMenuToRoute(c, false));

  if (children.length) {
    route.children = children;
    route.redirect = "noRedirect";
  }

  return route;
}

// 读取后端菜单表并注册
async function loadOriginRoutes() {
  try {
    let menus = [];
    try {
      const res = await listMenu();
      const rawMenus = (res && res.data) || [];
      menus = transformMenusToRoutes(rawMenus);
    } catch (e) {
      const res = await getRouters();
      menus = (res && res.data) || [];
    }

    // 匹配原始菜单
    const originMenus = menus.filter(
      (menu) =>
        menu.meta &&
        menu.meta.title &&
        ORIGIN_MENU_TITLES.includes(menu.meta.title.trim())
    );

    if (originMenus.length === 0) {
      console.warn("【Warning】未匹配到任何原始菜单！");
      return [];
    }

    // 【关键修改】：我们不再将其扁平化，而是保留树形结构注册
    const nestedRoutes = filterAsyncRouter(
      deepClone(originMenus),
      false,
      false
    );

    // 加上 /origin 前缀
    prefixOriginRoutes(nestedRoutes, "/origin");

    cleanupStringComponents(nestedRoutes);

    console.log("【Debug】注入的带层级结构的原始路由:", nestedRoutes);
    router.addRoutes(nestedRoutes);

    return nestedRoutes;
  } catch (e) {
    console.error("加载原始菜单异常：", e);
    return [];
  }
}

function prefixOriginRoutes(routes, prefix, isChild = false) {
  routes.forEach((route) => {
    if (!isChild) {
      // 顶级路由加前缀
      if (route.path && route.path.charAt(0) === "/") {
        route.path = prefix + route.path;
      } else if (route.path) {
        route.path = prefix + "/" + route.path;
      }
    } else {
      if (route.path) {
        route.path = route.path.replace(/^\//, "");
      }
    }

    // 重定向路径处理
    if (route.redirect && route.redirect !== "noRedirect") {
      route.redirect = route.redirect.startsWith("/")
        ? prefix + route.redirect
        : prefix + "/" + route.redirect;
    }

    if (route.children && route.children.length) {
      prefixOriginRoutes(route.children, prefix, true);
    }
  });
}

function cleanupStringComponents(routes) {
  if (!routes || !routes.length) return;
  routes.forEach((route) => {
    if (typeof route.component === "string") {
      const compStr = route.component.trim();
      if (compStr === "Layout") {
        route.component = Layout;
      } else if (compStr === "ParentView") {
        route.component = ParentView;
      } else if (compStr === "InnerLink") {
        route.component = InnerLink;
      } else if (compStr) {
        route.component = loadView(compStr);
      } else {
        delete route.component;
      }
    }
    if (route.children && route.children.length) {
      cleanupStringComponents(route.children);
    }
  });
}

function filterAsyncRouter(asyncRouterMap, lastRouter = false, type = false) {
  return asyncRouterMap.filter((route) => {
    if (route.redirect && !route.children && !route.component) {
      return true;
    }
    if (type && route.children) {
      route.children = filterChildren(route.children);
    }

    if (route.component) {
      if (route.component === "Layout") {
        route.component = Layout;
      } else if (route.component === "ParentView") {
        route.component = ParentView;
      } else if (route.component === "InnerLink") {
        route.component = InnerLink;
      } else if (typeof route.component === "string") {
        const compStr = route.component.trim();
        if (compStr) {
          try {
            route.component = loadView(compStr);
          } catch (error) {
            console.warn(
              `[路由拦截] 加载组件异常: ${compStr}，已跳过:`,
              route.path
            );
            return false;
          }
        } else {
          delete route.component;
        }
      }
    }

    if (route.children != null && route.children && route.children.length) {
      route.children = filterAsyncRouter(route.children, route, type);
      if (route.children.length === 0 && route.component === ParentView) {
        return false;
      }
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
  childrenMap.forEach((el) => {
    if (el.children && el.children.length) {
      if (
        (el.component === "ParentView" || el.component === ParentView) &&
        !lastRouter
      ) {
        el.children.forEach((c) => {
          c.path = el.path + "/" + c.path.replace(/^\//, "");
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
      el.path = lastRouter.path + "/" + el.path.replace(/^\//, "");
      if (el.children && el.children.length) {
        children = children.concat(filterChildren(el.children, el));
        return;
      }
    }
    children = children.concat(el);
  });
  return children;
}

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

// 恢复项目原始加载逻辑
export const loadView = (view) => {
  if (process.env.NODE_ENV === "development") {
    return (resolve) => require([`@/views/${view}`], resolve);
  } else {
    return () => import(`@/views/${view}`);
  }
};

export default permission;
