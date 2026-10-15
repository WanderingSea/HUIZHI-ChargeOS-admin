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

    <!-- 源码项目中的原始菜单 -->
    <el-submenu
      :style="{ '--theme': theme }"
      index="origin"
      v-if="originMenus.length > 0"
    >
      <template slot="title">原始菜单</template>
      <origin-item
        v-for="(item, index) in originMenus"
        :key="index"
        :item="item"
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
    // 所有的路由信息
    routers() {
      return this.$store.state.permission.topbarRouters;
    },
    // 原始菜单（源码项目后端菜单表）
    originRouters() {
      return this.$store.state.permission.originRouters;
    },
    // “原始菜单”下拉显示的菜单（完整展示，不过滤后端标记为 hidden 的菜单）
    originMenus() {
      return this.originRouters;
    },
    // 设置子路由
    childrenMenus() {
      var childrenMenus = [];
      var allRouters = this.routers.concat(this.originRouters);
      allRouters.map((router) => {
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
      // 预留右侧区域：搜索图标外扩（展开约 220px）、头像区，以及“原始菜单”一项的宽度，
      // 避免顶部菜单过长而侵入搜索图标展开的区域
      const reservedWidth = 420;
      const bodyWidth = document.body.getBoundingClientRect().width;
      const width = (bodyWidth - reservedWidth) / 3;
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
      } else {
        // 原始菜单点击子项时，用其所属的一级菜单来刷新侧边栏
        this.activeRoutes(this.originTopPath(key));
        const menu = this.topMenus.find((m) => m.path === key); //优先使用路由配置的redirect，不要自己读children（children会被filterAsyncRouter删除）
        if (menu && menu.redirect) {
          this.$router.push({ path: menu.redirect });
        } else {
          this.$router.push({ path: key });
        }
      }
    },
    // 若为原始菜单，返回其所属的一级菜单 path，否则原样返回
    originTopPath(key) {
      const top = this.originRouters.find(
        (router) => key === router.path || key.indexOf(router.path + "/") === 0
      );
      return top ? top.path : key;
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
