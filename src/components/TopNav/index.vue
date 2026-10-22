<template>
  <el-menu
    :default-active="activeMenu"
    mode="horizontal"
    @select="handleSelect"
  >
    <template v-for="(item, index) in topMenus">
      <el-menu-item
        :style="{ '--theme': theme }"
        :index="item.path"
        :key="index"
        v-if="index < visibleNumber"
        ><svg-icon
          v-if="item.meta && item.meta.icon && item.meta.icon !== '#'"
          :icon-class="item.meta.icon"
        />
        {{ item.meta.title }}</el-menu-item
      >
    </template>

    <!-- 顶部菜单超出数量折叠 -->
    <el-submenu
      :style="{ '--theme': theme }"
      index="more"
      v-if="topMenus.length > visibleNumber"
    >
      <template slot="title">更多菜单</template>
      <template v-for="(item, index) in topMenus">
        <el-menu-item
          :index="item.path"
          :key="index"
          v-if="index >= visibleNumber"
          ><svg-icon
            v-if="item.meta && item.meta.icon && item.meta.icon !== '#'"
            :icon-class="item.meta.icon"
          />
          {{ item.meta.title }}</el-menu-item
        >
      </template>
    </el-submenu>

    <!-- 原始菜单（源码项目 sys_menu 中的主菜单栏） -->
    <el-submenu
      :style="{ '--theme': theme }"
      index="origin"
      v-if="originMenus.length > 0"
    >
      <template slot="title">原始菜单</template>
      <origin-item
        v-for="(menu, index) in originMenus"
        :key="(menu.path || '') + index"
        :item="menu"
        base-path=""
      />
    </el-submenu>
  </el-menu>
</template>

<script>
import { constantRoutes } from "@/router";
import OriginItem from "./OriginItem";

export default {
  name: "TopNav",
  components: { OriginItem },
  data() {
    return {
      // 顶部栏初始数
      visibleNumber: 7,
      // 是否为首次加载
      isFrist: false,
      // 当前激活菜单的 index
      currentIndex: undefined,
    };
  },
  computed: {
    theme() {
      return this.$store.state.settings.theme;
    },
    // 顶部显示菜单
    topMenus() {
      let topMenus = [];
      this.routers.map((menu) => {
        if (menu.hidden !== true) {
          // 兼容顶部栏一级菜单内部跳转
          if (menu.path === "/") {
            topMenus.push(menu.children[0]);
          } else {
            topMenus.push(menu);
          }
        }
      });
      return topMenus;
    },
    // "原始菜单"下拉显示的菜单（按后端 visible 字段过滤隐藏菜单）
    originMenus() {
      return (this.$store.state.permission.originRouters || []).filter(
        (menu) => menu.hidden !== true
      );
    },
    // 所有的路由信息
    routers() {
      return this.$store.state.permission.topbarRouters;
    },
    // 设置子路由
    childrenMenus() {
      var childrenMenus = [];
      this.routers.map((router) => {
        for (var item in router.children) {
          if (router.children[item].parentPath === undefined) {
            if (router.path === "/") {
              router.children[item].path =
                "/redirect/" + router.children[item].path;
            } else {
              if (!this.ishttp(router.children[item].path)) {
                router.children[item].path =
                  router.path + "/" + router.children[item].path;
              }
            }
            router.children[item].parentPath = router.path;
          }
          childrenMenus.push(router.children[item]);
        }
      });
      return constantRoutes.concat(childrenMenus);
    },
    // 默认激活的菜单
    activeMenu() {
      const path = this.$route.path;
      // 原始菜单路由直接返回完整路径，确保菜单项正确高亮
      if (path.indexOf("/origin") === 0) {
        return path;
      }
      let activePath = this.defaultRouter();
      if (path.lastIndexOf("/") > 0) {
        const tmpPath = path.substring(1, path.length);
        activePath = "/" + tmpPath.substring(0, tmpPath.indexOf("/"));
      } else if ("/index" == path || "" == path) {
        if (!this.isFrist) {
          this.isFrist = true;
        } else {
          //activePath = "index";
        }
      }
      var routes = this.activeRoutes(activePath);
      if (routes.length === 0) {
        activePath = this.currentIndex || this.defaultRouter();
        this.activeRoutes(activePath);
      }
      return activePath;
    },
  },
  beforeMount() {
    window.addEventListener("resize", this.setVisibleNumber);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.setVisibleNumber);
  },
  mounted() {
    this.setVisibleNumber();
  },
  methods: {
    setVisibleNumber() {
      const width = document.body.getBoundingClientRect().width / 3;
      this.visibleNumber = Math.max(parseInt(width / 85), 7);
    },
    // 默认激活的路由
    defaultRouter() {
      let router;
      Object.keys(this.routers).some((key) => {
        if (!this.routers[key].hidden) {
          router = this.routers[key].path;
          return true;
        }
      });
      return router;
    },
    // 菜单选择事件
    handleSelect(key, keyPath) {
      this.currentIndex = key;
      if (this.ishttp(key)) {
        window.open(key, "_blank");
      } else if (key.indexOf("/redirect") !== -1) {
        this.$router.push({ path: key.replace("/redirect", "") });
      } else if (key.indexOf("/origin") === 0) {
        // 原始菜单导航
        this.handleOriginSelect(key);
      } else {
        this.activeRoutes(key);
        const menu = this.topMenus.find((m) => m.path === key); //优先使用路由配置的redirect，不要自己读children（children会被filterAsyncRouter删除）
        if (menu && menu.redirect) {
          this.$router.push({ path: menu.redirect });
        } else {
          this.$router.push({ path: key });
        }
      }
    },
    // 原始菜单导航处理
    handleOriginSelect(key) {
      const originMenus = this.originMenus;
      let targetMenu = null;
      let parentMenu = null;

      // 遍历查找匹配的菜单及其父级菜单
      for (const topMenu of originMenus) {
        const topPath = topMenu.path || "";
        if (topPath === key) {
          targetMenu = topMenu;
          parentMenu = topMenu;
          break;
        }
        if (topMenu.children && topMenu.children.length) {
          for (const child of topMenu.children) {
            const childFullPath = this.resolveOriginPath(topPath, child.path);
            if (childFullPath === key) {
              targetMenu = child;
              parentMenu = topMenu;
              break;
            }
            // 处理三级菜单
            if (child.children && child.children.length) {
              for (const grandchild of child.children) {
                const grandchildPath = this.resolveOriginPath(
                  childFullPath,
                  grandchild.path
                );
                if (grandchildPath === key) {
                  targetMenu = grandchild;
                  parentMenu = child;
                  break;
                }
              }
            }
            if (targetMenu) break;
          }
        }
        if (targetMenu) break;
      }

      // 设置侧边栏为父级菜单的子菜单（转换为绝对路径）
      if (parentMenu && parentMenu.children) {
        const sidebarRoutes = this.convertToAbsolutePaths(
          parentMenu.children,
          parentMenu.path
        );
        this.$store.commit("SET_SIDEBAR_ROUTERS", sidebarRoutes);
      }

      // 导航到目标菜单
      if (targetMenu) {
        if (targetMenu.children && targetMenu.children.length > 0) {
          const firstChild = targetMenu.children[0];
          const firstChildPath = this.resolveOriginPath(
            targetMenu.path,
            firstChild.path
          );
          this.$router.push({ path: firstChildPath });
        } else {
          this.$router.push({ path: key });
        }
      } else {
        this.$router.push({ path: key });
      }
    },
    // 将子菜单路径转换为绝对路径，供侧边栏使用
    convertToAbsolutePaths(children, parentPath) {
      return children.map((child) => {
        const childCopy = { ...child };
        const childFullPath = this.resolveOriginPath(parentPath, child.path);
        childCopy.path = childFullPath;
        if (child.children && child.children.length) {
          childCopy.children = this.convertToAbsolutePaths(
            child.children,
            childFullPath
          );
        }
        return childCopy;
      });
    },
    // 解析原始菜单路径
    resolveOriginPath(parentPath, childPath) {
      if (!childPath) return parentPath || "";
      if (/^https?:\/\//.test(childPath)) return childPath;
      if (childPath.charAt(0) === "/") return childPath;
      const base = (parentPath || "").replace(/\/+$/, "");
      return base ? base + "/" + childPath : "/" + childPath;
    },

    // 当前激活的路由
    activeRoutes(key) {
      var routes = [];
      if (this.childrenMenus && this.childrenMenus.length > 0) {
        this.childrenMenus.map((item) => {
          if (key == item.parentPath || (key == "index" && "" == item.path)) {
            routes.push(item);
          }
        });
      }
      if (routes.length > 0) {
        this.$store.commit("SET_SIDEBAR_ROUTERS", routes);
      }
      return routes;
    },
    ishttp(url) {
      return url.indexOf("http://") !== -1 || url.indexOf("https://") !== -1;
    },
  },
};
</script>

<style lang="scss">
.topmenu-container.el-menu--horizontal > .el-menu-item {
  float: left;
  height: 50px !important;
  line-height: 50px !important;
  color: #999093 !important;
  padding: 0 3px !important;
  margin: 0 10px !important;
}

.topmenu-container.el-menu--horizontal > .el-menu-item.is-active,
.el-menu--horizontal > .el-submenu.is-active .el-submenu__title {
  border-bottom: 2px solid #{"var(--theme)"} !important;
  color: #303133;
}

/* submenu item */
.topmenu-container.el-menu--horizontal > .el-submenu .el-submenu__title {
  float: left;
  height: 50px !important;
  line-height: 50px !important;
  color: #999093 !important;
  padding: 0 5px !important;
  margin: 0 10px !important;
}
</style>
