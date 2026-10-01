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
/* ================= 基础重置 ================= */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* ================= 容器 & 冷调主题变量 ================= */
.container {
  --bg: #ffffff;
  --card: #ffffff;
  --ink: #1f2a37;
  --ink-2: #5a6b7b;
  --ink-3: #94a3b3;
  --ink-4: #c3ced9;
  --line: #e4eaf1;
  --line-2: #eef3f8;
  --accent: #6b8fb0;
  --accent-2: #4f7295;
  --accent-soft: #e9f0f6;
  --ice: #82a8c4;
  --ice-soft: #e8f2f8;
  --danger: #c0554a;
  --danger-soft: #fbf0ee;
  --warm: #b89968;
  --warm-soft: #f7f2e8;

  max-width: 1720px;
  margin: 0 auto;
  min-height: 100vh;
  padding: 32px 40px 64px;
  background-color: var(--bg);
  color: var(--ink);
  font-size: 14px;
  line-height: 1.6;
  letter-spacing: 0.2px;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC",
    "Hiragino Sans GB", "Microsoft YaHei", system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 全屏模式下的留白 */
body:fullscreen,
body:-webkit-full-screen {
  padding: 24px;
  background-color: var(--bg);
}

/* ================= 面包屑 ================= */
.breadcrumb {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
  font-size: 13px;
  color: var(--ink-3);
}
.breadcrumb a {
  color: var(--accent-2);
  text-decoration: none;
  font-weight: 500;
  letter-spacing: 0.4px;
  transition: color 0.2s ease;
}
.breadcrumb a:hover {
  color: var(--accent);
}
.breadcrumb span {
  color: var(--ink-4);
  font-size: 11px;
}
.breadcrumb span:last-child {
  color: var(--ink);
  font-weight: 500;
  letter-spacing: 0.5px;
  font-size: 13px;
}

/* ================= 站点头部 ================= */
.station-top-wrap {
  padding: 26px 28px 20px;
  margin-bottom: 20px;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 20px;
  box-shadow: 0 1px 2px rgba(31, 42, 55, 0.03),
    0 10px 28px -22px rgba(31, 42, 55, 0.28);
}
.station-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 22px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--line-2);
}
.station-title {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding-left: 14px;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 0.6px;
  color: var(--ink);
}
.station-title::before {
  content: "";
  position: absolute;
  left: 0;
  top: 4px;
  bottom: 4px;
  width: 3px;
  border-radius: 2px;
  background: linear-gradient(180deg, var(--accent) 0%, var(--ice) 100%);
}
.station-title .arrow {
  font-size: 11px;
  color: var(--ink-3);
  transition: color 0.2s ease;
}
.station-title:hover .arrow {
  color: var(--accent);
}

/* 全屏按钮 */
.full-screen-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 34px;
  padding: 0 18px;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.4px;
  color: var(--accent-2);
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 999px;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(31, 42, 55, 0.03);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.full-screen-btn:hover {
  color: #fff;
  background: linear-gradient(135deg, #82a8c4 0%, #5e88ab 100%);
  border-color: transparent;
  transform: translateY(-1px);
  box-shadow: 0 10px 22px -10px rgba(94, 136, 171, 0.85);
}

/* ================= 状态卡片（标签页） ================= */
.status-card-row {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 4px;
}
.status-card-row::-webkit-scrollbar {
  height: 6px;
}
.status-card-row::-webkit-scrollbar-thumb {
  background: #d3dde6;
  border-radius: 3px;
}
.status-card {
  flex: 1 0 auto;
  min-width: 112px;
  padding: 16px 14px 14px;
  text-align: center;
  background: #f8fbfd;
  border: 1px solid transparent;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.24s cubic-bezier(0.4, 0, 0.2, 1);
}
.status-card:hover:not(.active) {
  background: #fff;
  border-color: var(--line);
  box-shadow: 0 4px 14px -10px rgba(31, 42, 55, 0.35);
}
.status-card .num {
  margin-bottom: 6px;
  font-size: 22px;
  font-weight: 600;
  letter-spacing: 0.3px;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
  transition: color 0.24s ease;
}
.status-card .name {
  font-size: 12.5px;
  letter-spacing: 0.5px;
  color: var(--ink-3);
  transition: color 0.24s ease;
}
.status-card.active {
  background: linear-gradient(135deg, #6b8fb0 0%, #4f7295 100%);
  border-color: transparent;
  box-shadow: 0 12px 26px -14px rgba(79, 114, 149, 0.9);
}
.status-card.active .num,
.status-card.active .name {
  color: #fff;
}

/* ================= 工具栏 ================= */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  padding: 18px 24px;
  margin-bottom: 20px;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 18px;
  box-shadow: 0 1px 2px rgba(31, 42, 55, 0.03),
    0 10px 28px -22px rgba(31, 42, 55, 0.28);
}
.toolbar-left {
  position: relative;
  padding-left: 12px;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.5px;
  color: var(--ink);
}
.toolbar-left::before {
  content: "";
  position: absolute;
  left: 0;
  top: 5px;
  bottom: 5px;
  width: 3px;
  border-radius: 2px;
  background: linear-gradient(180deg, var(--accent) 0%, var(--ice) 100%);
}
.toolbar-right {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}
.toolbar select,
.toolbar input {
  height: 38px;
  padding: 0 16px;
  font-size: 13px;
  color: var(--ink);
  background: #f8fbfd;
  border: 1px solid var(--line);
  border-radius: 10px;
  outline: none;
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}
.toolbar input {
  width: 220px;
}
.toolbar input::placeholder {
  color: #aebbca;
}
.toolbar select:hover,
.toolbar input:hover {
  border-color: #cdd9e4;
}
.toolbar select:focus,
.toolbar input:focus {
  background: #fff;
  border-color: var(--accent);
  box-shadow: 0 0 0 4px rgba(107, 143, 176, 0.12);
}

/* ================= 主区域布局 ================= */
.main-content {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 400px;
  gap: 20px;
  align-items: start;
}

/* ================= 左侧设备网格 ================= */
.device-grid-box {
  padding: 24px 24px 20px;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 20px;
  box-shadow: 0 1px 2px rgba(31, 42, 55, 0.03),
    0 10px 28px -22px rgba(31, 42, 55, 0.28);
}
.device-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 22px;
  min-height: 240px;
}

/* 设备卡片 */
.device-card {
  position: relative;
  padding: 22px 22px 20px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 16px;
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.28s cubic-bezier(0.4, 0, 0.2, 1),
    border-color 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}
.device-card::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, var(--accent) 0%, var(--ice) 100%);
  opacity: 0;
  transition: opacity 0.28s ease;
}
.device-card:hover {
  transform: translateY(-2px);
  border-color: #d7e0ea;
  box-shadow: 0 2px 4px rgba(31, 42, 55, 0.04),
    0 18px 36px -24px rgba(31, 42, 55, 0.3);
}
.device-card.selected {
  background: linear-gradient(180deg, #fbfdff 0%, #ffffff 100%);
  border-color: var(--accent);
  box-shadow: 0 2px 4px rgba(31, 42, 55, 0.04),
    0 20px 40px -24px rgba(79, 114, 149, 0.5);
}
.device-card.selected::before {
  opacity: 1;
}

/* 状态标签 */
.tag-status {
  position: absolute;
  top: 18px;
  right: 18px;
  padding: 3px 10px;
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: 0.6px;
  color: var(--accent-2);
  background: var(--accent-soft);
  border-radius: 999px;
}

/* 设备标题与信息 */
.device-title {
  padding-right: 64px;
  margin-bottom: 14px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.4px;
  color: var(--ink);
  word-break: break-all;
}
.device-item {
  display: flex;
  gap: 6px;
  padding: 3px 0;
  font-size: 13px;
  line-height: 1.7;
  color: var(--ink-2);
}
.device-item::before {
  content: "";
  flex-shrink: 0;
  width: 4px;
  height: 4px;
  margin-top: 9px;
  border-radius: 50%;
  background: var(--ink-4);
}

/* 空状态 */
.empty-box {
  grid-column: 1 / -1;
  padding: 80px 20px;
  text-align: center;
  font-size: 13px;
  letter-spacing: 3px;
  color: var(--ink-4);
  background: #f8fbfd;
  border: 1px dashed var(--line);
  border-radius: 16px;
}

/* ================= 右侧详情面板 ================= */
.detail-panel {
  position: sticky;
  top: 24px;
  height: fit-content;
  padding: 24px 24px 22px;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 20px;
  box-shadow: 0 1px 2px rgba(31, 42, 55, 0.03),
    0 10px 28px -22px rgba(31, 42, 55, 0.28);
}
.detail-title {
  position: relative;
  padding-left: 14px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.8px;
  color: var(--ink);
  border-bottom: 1px solid var(--line-2);
}
.detail-title::before {
  content: "";
  position: absolute;
  left: 0;
  top: 3px;
  bottom: 19px;
  width: 3px;
  border-radius: 2px;
  background: linear-gradient(180deg, var(--accent) 0%, var(--ice) 100%);
}
.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14px;
  padding: 12px 0;
  border-bottom: 1px solid var(--line-2);
}
.detail-row:last-child {
  border-bottom: none;
}
.detail-label {
  flex-shrink: 0;
  font-size: 12.5px;
  letter-spacing: 0.4px;
  color: var(--ink-3);
}
.detail-value {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  text-align: right;
  color: var(--ink);
  word-break: break-all;
}
.empty-tip {
  padding: 60px 20px;
  text-align: center;
  font-size: 13px;
  letter-spacing: 2px;
  color: var(--ink-4);
}

/* ================= 分页 ================= */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 20px;
  font-size: 12.5px;
  color: var(--ink-3);
  border-top: 1px solid var(--line-2);
}
.pagination select {
  height: 32px;
  padding: 0 10px;
  font-size: 12.5px;
  color: var(--ink-2);
  background: #f8fbfd;
  border: 1px solid var(--line);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.22s ease;
}
.pagination select:hover,
.pagination select:focus {
  outline: none;
  background: #fff;
  border-color: var(--accent);
}
.page-btn {
  min-width: 32px;
  height: 32px;
  padding: 0 10px;
  font-size: 12.5px;
  color: var(--ink-2);
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.22s ease;
}
.page-btn:hover:not(:disabled) {
  color: var(--accent-2);
  background: var(--accent-soft);
  border-color: var(--accent);
}
.page-btn.active {
  color: #fff;
  background: linear-gradient(135deg, #6b8fb0 0%, #4f7295 100%);
  border-color: transparent;
  box-shadow: 0 6px 14px -6px rgba(79, 114, 149, 0.85);
}
.page-input {
  width: 48px;
  height: 32px;
  padding: 0 4px;
  font-size: 13px;
  text-align: center;
  color: var(--ink);
  background: #f8fbfd;
  border: 1px solid var(--line);
  border-radius: 8px;
  transition: all 0.22s ease;
  font-variant-numeric: tabular-nums;
}
.page-input:focus {
  outline: none;
  background: #fff;
  border-color: var(--accent);
  box-shadow: 0 0 0 4px rgba(107, 143, 176, 0.12);
}

/* ================= 响应式 ================= */
@media (max-width: 1200px) {
  .main-content {
    grid-template-columns: 1fr;
  }
  .detail-panel {
    position: static;
  }
}
@media (max-width: 1024px) {
  .container {
    padding: 24px 22px 48px;
  }
  .device-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 640px) {
  .container {
    padding: 20px 16px 40px;
  }
  .station-top-wrap {
    padding: 20px 18px 16px;
    border-radius: 16px;
  }
  .station-head {
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
  }
  .station-title {
    font-size: 17px;
  }
  .full-screen-btn {
    width: 100%;
    justify-content: center;
  }
  .status-card {
    min-width: 100px;
    padding: 14px 10px 12px;
  }
  .status-card .num {
    font-size: 19px;
  }
  .toolbar {
    padding: 16px 18px;
  }
  .toolbar-right {
    width: 100%;
  }
  .toolbar select,
  .toolbar input {
    flex: 1;
    width: auto;
  }
  .device-grid-box {
    padding: 20px 18px 16px;
    border-radius: 16px;
  }
  .device-grid {
    grid-template-columns: 1fr;
  }
  .device-card {
    padding: 20px 18px 18px;
  }
  .detail-panel {
    padding: 20px 18px;
    border-radius: 16px;
  }
}
</style>
