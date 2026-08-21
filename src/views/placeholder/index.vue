<template>
  <div class="placeholder-container">
    <el-card class="box-card" shadow="never">
      <div slot="header" class="clearfix">
        <span>{{ pageTitle }}</span>
      </div>
      <div class="placeholder-content">
        <i class="el-icon-notebook-2"></i>
        <p class="text">该页面正在建设中...</p>
        <p class="sub-text">{{ currentPath }}</p>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "Placeholder",
  computed: {
    pageTitle() {
      return this.$route.meta.title || "页面";
    },
    currentPath() {
      return this.$route.path;
    },
  },
};
</script>

<style scoped>
.placeholder-container {
  padding: 20px;
}
.placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: #909399;
}
.placeholder-content i {
  font-size: 80px;
  margin-bottom: 20px;
  color: #c0c4cc;
}
.placeholder-content .text {
  font-size: 18px;
  margin-bottom: 8px;
}
.placeholder-content .sub-text {
  font-size: 14px;
  color: #c0c4cc;
}
</style>
