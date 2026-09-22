<template>
  <div class="container">
    <!-- 面包屑 -->
    <div class="breadcrumb">
      <a href="#">返回</a>
      <span>/</span>
      <span>场站监控/电站设备监控</span>
    </div>

    <!-- 站点头部 -->
    <div class="station-top-wrap">
      <div class="station-head">
        <div class="station-title">
          同星旭智充站 <span class="arrow">▼</span>
        </div>
        <button class="full-screen-btn" @click="toggleFullScreen">
          {{ fullScreenText }}
        </button>
      </div>
      <div class="status-card-row">
        <div
          class="status-card"
          :class="{ active: currentFilter === item.filterKey }"
          v-for="item in statusList"
          :key="item.filterKey"
          @click="handleTabChange(item.filterKey)"
        >
          <div class="num">{{ item.count }}</div>
          <div class="name">{{ item.name }}</div>
        </div>
      </div>
    </div>

    <!-- 筛选工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">设备列表 &nbsp; | &nbsp; 实时总功率：——</div>
      <div class="toolbar-right">
        <select id="deviceFilter">
          <option value="all">全部设备</option>
        </select>
        <input
          id="searchDevice"
          placeholder="请输入设备名称"
          v-model="searchKeyword"
          @input="handleSearch"
        />
      </div>
    </div>

    <!-- 主区域：左右分栏 -->
    <div class="main-content">
      <!-- 左侧设备卡片 -->
      <div class="device-grid-box">
        <div class="device-grid" id="deviceGrid">
          <!-- 空状态 -->
          <div v-if="filterDeviceList.length === 0" class="empty-box">
            未查询到对应的充电桩
          </div>
          <div
            v-else
            class="device-card"
            :class="{ selected: currentSelectId === item.id }"
            v-for="item in filterDeviceList"
            :key="item.id"
            @click="selectDevice(item)"
          >
            <span class="tag-status">{{ item.status }}</span>
            <div class="device-title">{{ item.name }}</div>
            <div class="device-item">编号：{{ item.code }}</div>
            <div class="device-item">上次充电结束：{{ item.lastEnd }}</div>
            <div class="device-item">停充原因：{{ item.stopReason }}</div>
            <div class="device-item">充电电量：{{ item.power }}</div>
            <div class="device-item">司机来源：{{ item.source }}</div>
            <div class="device-item">车牌号码：{{ item.plate }}</div>
          </div>
        </div>
        <!-- 分页 -->
        <div class="pagination">
          <span>共{{ filterDeviceList.length }}条</span>
          <select>
            <option>50条/页</option>
          </select>
          <button class="page-btn">&lt;</button>
          <button class="page-btn active">1</button>
          <button class="page-btn">&gt;</button>
          <span>前往</span>
          <input class="page-input" value="1" />
          <span>页</span>
        </div>
      </div>

      <!-- 右侧详情面板 -->
      <div class="detail-panel">
        <div class="detail-title">设备详情</div>
        <div id="detailContent">
          <div v-if="!selectedDevice" class="empty-tip">
            请点击左侧设备卡片查看详情
          </div>
          <div v-else>
            <div class="detail-row">
              <span class="detail-label">设备名称</span>
              <span class="detail-value">{{ selectedDevice.name }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">设备编号</span>
              <span class="detail-value">{{ selectedDevice.code }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">设备状态</span>
              <span class="detail-value">{{ selectedDevice.status }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">上次充电结束</span>
              <span class="detail-value">{{ selectedDevice.lastEnd }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">停充原因</span>
              <span class="detail-value">{{ selectedDevice.stopReason }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">充电电量</span>
              <span class="detail-value">{{ selectedDevice.power }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">司机来源</span>
              <span class="detail-value">{{ selectedDevice.source }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">车牌号码</span>
              <span class="detail-value">{{ selectedDevice.plate }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "StationMonitor",
  data() {
    return {
      currentFilter: "all",
      currentSelectId: null,
      selectedDevice: null,
      searchKeyword: "",
      fullScreenText: "全屏模式",
      // 顶部状态tab
      statusList: [
        { filterKey: "all", name: "全部", count: 4 },
        { filterKey: "charge", name: "充电", count: 0 },
        { filterKey: "idle", name: "空闲", count: 4 },
        { filterKey: "fault", name: "故障", count: 0 },
        { filterKey: "offline", name: "离线", count: 0 },
        { filterKey: "stop", name: "停用", count: 0 },
        { filterKey: "soon", name: "即将充满", count: 0 },
        { filterKey: "plug", name: "插枪未充", count: 0 },
        { filterKey: "after", name: "充后占用", count: 0 },
      ],
      // 设备原始数据
      deviceData: [
        {
          id: 1,
          name: "TXXHL05-A",
          code: "3201060083224801",
          lastEnd: "2026-09-16 09:57:54",
          stopReason: "结束充电，充电电量满足设定条件",
          power: "30.869",
          source: "云快充充电用户",
          plate: "豫ABY2345",
          status: "空闲",
          filterKey: "idle",
        },
        {
          id: 2,
          name: "TXXHL06-A",
          code: "3201060083224901",
          lastEnd: "2026-09-16 09:57:29",
          stopReason: "结束充电，APP远程停止",
          power: "25.683",
          source: "云快充充电用户",
          plate: "——",
          status: "空闲",
          filterKey: "idle",
        },
        {
          id: 3,
          name: "TXXHL06-B",
          code: "3201060083224902",
          lastEnd: "2026-09-16 09:03:21",
          stopReason: "结束充电，充电电量满足设定条件",
          power: "33.574",
          source: "云快充充电用户",
          plate: "豫GFA6606",
          status: "空闲",
          filterKey: "idle",
        },
        {
          id: 4,
          name: "TXXHL05-B",
          code: "32010600832244802",
          lastEnd: "2026-09-16 05:55:12",
          stopReason: "结束充电，充电电量满足设定条件",
          power: "11.728",
          source: "云快充充电用户",
          plate: "豫GDG6917",
          status: "空闲",
          filterKey: "idle",
        },
      ],
    };
  },
  computed: {
    // 筛选后的设备列表：状态筛选 + 搜索关键词
    filterDeviceList() {
      let list = [...this.deviceData];
      // 状态tab过滤
      if (this.currentFilter !== "all") {
        list = list.filter((item) => item.filterKey === this.currentFilter);
      }
      // 搜索过滤
      if (this.searchKeyword.trim()) {
        const kw = this.searchKeyword.toLowerCase();
        list = list.filter((item) => item.name.toLowerCase().includes(kw));
      }
      return list;
    },
  },
  mounted() {
    // 监听全屏变化，同步按钮文字
    document.addEventListener("fullscreenchange", this.onFullScreenChange);
    document.addEventListener(
      "webkitfullscreenchange",
      this.onFullScreenChange
    );
  },
  beforeDestroy() {
    document.removeEventListener("fullscreenchange", this.onFullScreenChange);
    document.removeEventListener(
      "webkitfullscreenchange",
      this.onFullScreenChange
    );
  },
  methods: {
    // Tab切换筛选
    handleTabChange(filterKey) {
      this.currentFilter = filterKey;
      this.selectedDevice = null;
      this.currentSelectId = null;
    },
    // 选中设备
    selectDevice(dev) {
      this.currentSelectId = dev.id;
      this.selectedDevice = dev;
    },
    // 搜索输入
    handleSearch() {
      // 计算属性已经自动处理过滤，无需额外逻辑
    },
    // 全屏切换
    async toggleFullScreen() {
      try {
        if (!document.fullscreenElement && !document.webkitFullscreenElement) {
          (await document.documentElement.requestFullscreen?.()) ||
            document.documentElement.webkitRequestFullscreen?.();
        } else {
          (await document.exitFullscreen?.()) ||
            document.webkitExitFullscreen?.();
        }
      } catch (e) {
        alert("全屏模式开启失败，请使用浏览器F11快捷键");
      }
    },
    onFullScreenChange() {
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        this.fullScreenText = "退出全屏";
      } else {
        this.fullScreenText = "全屏模式";
      }
    },
  },
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
}
body:fullscreen {
  padding: 16px;
  background-color: #f5f7fa;
}
body:-webkit-full-screen {
  padding: 16px;
  background-color: #f5f7fa;
}
.container {
  max-width: 1700px;
  margin: 0 auto;
  padding: 24px;
  background-color: #f5f7fa;
  color: #303133;
}
/* 面包屑导航 */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #606266;
  margin-bottom: 20px;
}
.breadcrumb a {
  color: #606266;
  text-decoration: none;
}
/* 顶部站点信息栏 */
.station-top-wrap {
  background: #ffffff;
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}
.station-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 26px;
}
.station-title {
  font-size: 24px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
}
.station-title .arrow {
  font-size: 18px;
  color: #909399;
}
.full-screen-btn {
  padding: 7px 14px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
  transition: 0.2s;
}
.full-screen-btn:hover {
  background: #f5f7fa;
}
/* 状态统计卡片【横向一行小卡片】 */
.status-card-row {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 8px;
}
.status-card {
  min-width: 130px;
  padding: 18px 12px;
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  border: 1px solid #e4e7ed;
  transition: all 0.25s ease;
}
.status-card.active {
  background: #2563eb;
  color: #fff;
  border-color: #2563eb;
}
.status-card:hover:not(.active) {
  border-color: #b4c4f0;
  background: #f0f5ff;
}
.status-card .num {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 6px;
}
.status-card .name {
  font-size: 14px;
}
/* 筛选工具栏 */
.toolbar {
  background: #fff;
  border-radius: 16px;
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}
.toolbar-left {
  font-size: 16px;
}
.toolbar-right {
  display: flex;
  gap: 14px;
  align-items: center;
}
.toolbar select,
.toolbar input {
  height: 38px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  padding: 0 14px;
  font-size: 14px;
  outline: none;
}
.toolbar input:focus,
.toolbar select:focus {
  border-color: #2563eb;
}
/* 主区域：左右两栏布局 */
.main-content {
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: 20px;
}
/* 左侧设备卡片网格 */
.device-grid-box {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}
.device-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 24px;
  min-height: 240px;
}
.device-card {
  border: 1px solid #e4e7ed;
  border-radius: 14px;
  padding: 22px;
  cursor: pointer;
  transition: 0.3s;
  position: relative;
}
.device-card:hover {
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.12);
  border-color: #b4c4f0;
}
.device-card.selected {
  border: 2px solid #2563eb;
  background: #f8fbff;
}
.tag-status {
  position: absolute;
  top: 16px;
  right: 16px;
  background-color: #52c41a;
  color: #fff;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 13px;
}
.device-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
}
.device-item {
  font-size: 14px;
  color: #555;
  line-height: 1.7;
}
/* 空状态 */
.empty-box {
  grid-column: 1/-1;
  text-align: center;
  color: #909399;
  padding: 60px 0;
  font-size: 16px;
}
/* 右侧详情面板 */
.detail-panel {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  height: fit-content;
  position: sticky;
  top: 24px;
}
.detail-title {
  font-size: 18px;
  font-weight: 600;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 16px;
}
.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f2f3f5;
}
.detail-label {
  color: #606266;
}
.detail-value {
  color: #303133;
  font-weight: 500;
  text-align: right;
}
.empty-tip {
  text-align: center;
  color: #909399;
  padding: 40px 0;
}
/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  padding-top: 10px;
}
.page-btn {
  width: 34px;
  height: 34px;
  border: 1px solid #dcdfe6;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
}
.page-btn.active {
  background: #2563eb;
  color: #fff;
  border-color: #2563eb;
}
.page-input {
  width: 50px;
  height: 34px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  text-align: center;
}
</style>
