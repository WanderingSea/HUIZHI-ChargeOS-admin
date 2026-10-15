<template>
  <!-- 有子菜单：渲染为级联子菜单 -->
  <el-submenu v-if="hasChildren" :index="item.path || basePath">
    <template slot="title">
      <svg-icon v-if="icon" :icon-class="icon" />
      <span>{{ title }}</span>
    </template>
    <origin-item
      v-for="(child, index) in children"
      :key="(child.path || '') + index"
      :item="child"
      :base-path="fullPath"
    />
  </el-submenu>

  <!-- 无子菜单：渲染为可点击项 -->
  <el-menu-item v-else :index="fullPath">
    <svg-icon v-if="icon" :icon-class="icon" />
    <span slot="title">{{ title }}</span>
  </el-menu-item>
</template>

<script>
export default {
  name: "OriginItem",
  props: {
    item: {
      type: Object,
      required: true,
    },
    // 上级菜单的完整路径
    basePath: {
      type: String,
      default: "",
    },
  },
  computed: {
    children() {
      // 原始菜单完整展示，不过滤后端标记为 hidden 的子菜单
      return this.item.children || [];
    },
    hasChildren() {
      return this.children.length > 0;
    },
    title() {
      const ownTitle = this.item.meta && this.item.meta.title;
      if (ownTitle) {
        return ownTitle;
      }
      // 后端单页菜单（menu frame）会把 meta 挂到子级，这里做兼容
      const firstChild = this.children[0];
      return (
        (firstChild && firstChild.meta && firstChild.meta.title) ||
        this.item.name ||
        ""
      );
    },
    icon() {
      const icon = this.item.meta && this.item.meta.icon;
      return icon && icon !== "#" ? icon : "";
    },
    fullPath() {
      return this.resolvePath(this.item.path);
    },
  },
  methods: {
    resolvePath(childPath) {
      if (!childPath) {
        return this.basePath;
      }
      if (/^https?:\/\//.test(childPath)) {
        return childPath;
      }
      if (childPath.charAt(0) === "/") {
        return childPath;
      }
      const base = (this.basePath || "").replace(/\/+$/, "");
      return base ? base + "/" + childPath : "/" + childPath;
    },
  },
};
</script>
