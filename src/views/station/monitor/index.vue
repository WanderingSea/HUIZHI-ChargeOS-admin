<template>
  <div class="page-shell">
    <div class="page-header">
      <div>
        <h1 class="page-title">场站监控</h1>
        <p class="page-subtitle">实时查看各站点设备状态、空闲情况与异常分布</p>
      </div>
      <div class="toolbar">
        <input
          v-model="keyword"
          class="search-input"
          placeholder="搜索电站名称"
        />
        <select v-model="sortType" class="sort-select">
          <option value="default">默认排序</option>
          <option value="nameAsc">名称 A-Z</option>
          <option value="nameDesc">名称 Z-A</option>
          <option value="totalDesc">设备总数 高到低</option>
          <option value="totalAsc">设备总数 低到高</option>
        </select>
      </div>
    </div>

    <div class="station-grid">
      <div
        v-if="filterList.length === 0"
        style="
          grid-column: 1/-1;
          text-align: center;
          color: #717b8c;
          padding: 40px;
        "
      >
        暂无匹配站点
      </div>
      <div
        v-for="item in filterList"
        :key="item.id"
        class="station-card"
        @click="openModal(item)"
      >
        <span class="card-label">{{ item.label }}</span>
        <div class="card-header">
          <div class="station-name">{{ item.name }}</div>
          <div class="device-total">
            设备总数 <strong>{{ item.total }}</strong>
          </div>
        </div>

        <div class="status-list">
          <div
            v-for="s in statusMap"
            :key="s.key"
            :class="['status-row', s.class]"
          >
            <div class="status-name">{{ s.name }}</div>
            <div class="status-bar">
              <div
                class="status-fill"
                :style="{
                  width: `${Math.round(
                    (item.status[s.key] / item.total) * 100
                  )}%`,
                }"
              ></div>
            </div>
            <div class="status-number">{{ item.status[s.key] }}</div>
          </div>
        </div>

        <div class="sub-status">
          <div v-for="s in subMap" :key="s.key" class="sub-item">
            <div class="sub-label">{{ s.label }}</div>
            <div class="sub-number">{{ item.subStatus[s.key] }}</div>
          </div>
        </div>

        <div class="card-footer">
          <button class="btn btn-default" @click.stop="handleOrder">
            查看订单
          </button>
          <button class="btn btn-primary" @click.stop="openModal(item)">
            监控详情
          </button>
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
      keyword: "",
      sortType: "default",
      modalShow: false,
      currentStation: {},
      stationData: [
        {
          id: 1,
          label: "STATION 01",
          name: "同星旭智充站",
          total: 4,
          status: {
            charge: 0,
            idle: 4,
            fault: 0,
            offline: 0,
            stop: 0,
          },
          subStatus: {
            soonFull: 0,
            plugUnCharge: 0,
            afterChargeOccupied: 1,
          },
        },
        {
          id: 2,
          label: "STATION 02",
          name: "同星南桥里充电站",
          total: 24,
          status: {
            charge: 0,
            idle: 0,
            fault: 0,
            offline: 0,
            stop: 24,
          },
          subStatus: {
            soonFull: 0,
            plugUnCharge: 0,
            afterChargeOccupied: 0,
          },
        },
        {
          id: 3,
          label: "STATION 03",
          name: "同星东马坊充电站",
          total: 13,
          status: {
            charge: 0,
            idle: 7,
            fault: 0,
            offline: 4,
            stop: 2,
          },
          subStatus: {
            soonFull: 0,
            plugUnCharge: 4,
            afterChargeOccupied: 0,
          },
        },
      ],
      statusMap: [
        { key: "charge", name: "充电", class: "" },
        { key: "idle", name: "空闲", class: "idle" },
        { key: "fault", name: "故障", class: "fault" },
        { key: "offline", name: "离线", class: "offline" },
        { key: "stop", name: "停用", class: "stop" },
      ],
      subMap: [
        { key: "soonFull", label: "即将充满" },
        { key: "plugUnCharge", label: "插枪未充" },
        { key: "afterChargeOccupied", label: "充电后占用" },
      ],
    };
  },
  mounted() {
    const id = this.$route.params.id;
    this.stationId = id;
  },
  computed: {
    filterList() {
      let list = this.stationData.filter((item) => {
        return item.name.toLowerCase().includes(this.keyword.toLowerCase());
      });
      // 排序逻辑
      switch (this.sortType) {
        case "nameAsc":
          list.sort((a, b) => a.name.localeCompare(b.name, "zh"));
          break;
        case "nameDesc":
          list.sort((a, b) => b.name.localeCompare(a.name, "zh"));
          break;
        case "totalDesc":
          list.sort((a, b) => b.total - a.total);
          break;
        case "totalAsc":
          list.sort((a, b) => a.total - b.total);
          break;
        default:
          list.sort((a, b) => a.id - b.id);
      }
      return list;
    },
  },
  methods: {
    openModal(item) {
      this.$router.push({
        name: "StationMonitorDetail",
        params: { id: item.id },
      });
    },
    closeModalByMask(e) {
      if (e.target === e.currentTarget) {
        this.modalShow = false;
      }
    },
    handleOrder() {
      alert("查看订单");
    },
    handleDetail() {
      alert("进入监控详情");
    },
  },
};
</script>

<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.page-shell {
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

  max-width: 1320px;
  margin: 0 auto;
  min-height: 100vh;
  padding: 30px 40px 72px;
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

/* ================= 页头 ================= */
.page-header {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 24px;
  align-items: end;
  margin-bottom: 30px;
  padding-bottom: 25px;
  border-bottom: 1px solid var(--line-2);
}
.page-title {
  position: relative;
  padding-left: 16px;
  font-size: 26px;
  font-weight: 600;
  letter-spacing: 1.2px;
  color: var(--ink);
}
.page-title::before {
  content: "";
  position: absolute;
  left: 0;
  top: 6px;
  bottom: 6px;
  width: 3px;
  border-radius: 2px;
  background: linear-gradient(180deg, var(--accent) 0%, var(--ice) 100%);
}
.page-subtitle {
  margin-top: 10px;
  padding-left: 16px;
  font-size: 13.5px;
  color: var(--ink-3);
  letter-spacing: 0.3px;
}

/* ================= 工具栏 ================= */
.toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
}
.search-input,
.sort-select {
  height: 40px;
  padding: 0 18px;
  font-size: 13px;
  color: var(--ink);
  background: #f8fbfd;
  border: 1px solid var(--line);
  border-radius: 999px;
  outline: none;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.search-input {
  width: 240px;
}
.search-input::placeholder {
  color: #aebbca;
}
.search-input:hover,
.sort-select:hover {
  border-color: #cdd9e4;
}
.search-input:focus,
.sort-select:focus {
  background: #fff;
  border-color: var(--accent);
  box-shadow: 0 0 0 4px rgba(107, 143, 176, 0.12);
}

/* ================= 卡片网格 ================= */
.station-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
  gap: 24px;
}

/* ================= 场站卡片 ================= */
.station-card {
  position: relative;
  padding: 28px 28px 24px;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 20px;
  box-shadow: 0 1px 2px rgba(31, 42, 55, 0.03),
    0 10px 28px -22px rgba(31, 42, 55, 0.28);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.32s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.32s cubic-bezier(0.4, 0, 0.2, 1),
    border-color 0.32s cubic-bezier(0.4, 0, 0.2, 1);
}
.station-card::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(
    90deg,
    var(--accent) 0%,
    var(--ice) 60%,
    transparent 100%
  );
  opacity: 0;
  transition: opacity 0.32s ease;
}
.station-card:hover {
  transform: translateY(-3px);
  border-color: #d7e0ea;
  box-shadow: 0 2px 4px rgba(31, 42, 55, 0.04),
    0 24px 48px -28px rgba(31, 42, 55, 0.32);
}
.station-card:hover::before {
  opacity: 1;
}

/* 卡片标签 */
.card-label {
  display: inline-block;
  margin-bottom: 14px;
  padding: 3px 10px;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 1.4px;
  color: var(--ink-3);
  background: #f4f7fa;
  border-radius: 999px;
}

/* 卡片头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 24px;
}
.station-name {
  font-size: 19px;
  font-weight: 600;
  letter-spacing: 0.4px;
  color: var(--ink);
  line-height: 1.35;
  word-break: break-all;
}
.device-total {
  flex-shrink: 0;
  font-size: 12.5px;
  letter-spacing: 0.4px;
  color: var(--ink-3);
}
.device-total strong {
  margin-left: 4px;
  font-size: 16px;
  font-weight: 600;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}

/* ================= 状态列表 ================= */
.status-list {
  margin-bottom: 22px;
}
.status-row {
  display: grid;
  grid-template-columns: 64px 1fr 46px;
  align-items: center;
  gap: 14px;
  padding: 11px 0;
  border-top: 1px solid var(--line-2);
}
.status-row:last-child {
  border-bottom: 1px solid var(--line-2);
}
.status-name {
  font-size: 12.5px;
  letter-spacing: 0.4px;
  color: var(--ink-2);
}
.status-bar {
  height: 6px;
  background: #f0f4f8;
  border-radius: 999px;
  overflow: hidden;
}
.status-fill {
  height: 100%;
  border-radius: 999px;
  background: #6b8fb0; /* 充电：主色钢蓝 */
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.status-row.idle .status-fill {
  background: #82a8c4; /* 空闲：冰蓝 */
}
.status-row.fault .status-fill {
  background: #c0554a; /* 故障：陶土红 */
}
.status-row.offline .status-fill {
  background: #b7c2cd; /* 离线：冷灰 */
}
.status-row.stop .status-fill {
  background: #b89968; /* 停用：暖金 */
}
.status-number {
  font-size: 15px;
  font-weight: 600;
  text-align: right;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.3px;
}

/* ================= 子状态 ================= */
.sub-status {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 22px;
}
.sub-item {
  padding: 14px 14px 12px;
  background: #f8fbfd;
  border: 1px solid transparent;
  border-radius: 14px;
  transition: all 0.24s cubic-bezier(0.4, 0, 0.2, 1);
}
.sub-item:hover {
  background: #fff;
  border-color: var(--line);
  box-shadow: 0 4px 14px -10px rgba(31, 42, 55, 0.35);
}
.sub-label {
  margin-bottom: 6px;
  font-size: 11.5px;
  letter-spacing: 0.5px;
  color: var(--ink-3);
}
.sub-number {
  font-size: 19px;
  font-weight: 600;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.3px;
}

/* ================= 卡片底部按钮 ================= */
.card-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 20px;
  border-top: 1px solid var(--line-2);
}
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  padding: 0 20px;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.5px;
  border: 1px solid transparent;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.btn-default {
  color: var(--ink-2);
  background: #fff;
  border-color: var(--line);
}
.btn-default:hover {
  color: var(--accent-2);
  background: var(--accent-soft);
  border-color: var(--accent);
}
.btn-primary {
  color: #fff;
  background: linear-gradient(135deg, #6b8fb0 0%, #4f7295 100%);
  box-shadow: 0 8px 18px -10px rgba(79, 114, 149, 0.9);
}
.btn-primary:hover {
  background: linear-gradient(135deg, #4f7295 0%, #3d5a77 100%);
  transform: translateY(-1px);
  box-shadow: 0 12px 24px -10px rgba(79, 114, 149, 0.95);
}
.btn-primary:active {
  transform: translateY(0);
}

/* ================= 空状态 ================= */
.station-grid > div[style*="grid-column"] {
  grid-column: 1 / -1 !important;
  padding: 80px 40px !important;
  text-align: center !important;
  font-size: 13px !important;
  letter-spacing: 3px !important;
  color: var(--ink-4) !important;
  background: #f8fbfd;
  border: 1px dashed var(--line);
  border-radius: 20px;
}

/* ================= 弹窗（保留兼容） ================= */
.modal-mask {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: none;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(31, 42, 55, 0.35);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}
.modal-mask.active {
  display: flex;
}
.modal {
  width: 100%;
  max-width: 560px;
  padding: 28px 32px;
  background: #fff;
  border-radius: 22px;
  box-shadow: 0 32px 80px -32px rgba(31, 42, 55, 0.55);
  animation: modalIn 0.32s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes modalIn {
  from {
    opacity: 0;
    transform: translateY(14px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
.modal-label {
  margin-bottom: 10px;
  font-size: 11.5px;
  letter-spacing: 1.2px;
  color: var(--ink-3);
}
.modal-title {
  position: relative;
  padding-left: 14px;
  margin-bottom: 22px;
  padding-bottom: 16px;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.6px;
  color: var(--ink);
  border-bottom: 1px solid var(--line-2);
}
.modal-title::before {
  content: "";
  position: absolute;
  left: 0;
  top: 4px;
  bottom: 19px;
  width: 3px;
  border-radius: 2px;
  background: linear-gradient(180deg, var(--accent) 0%, var(--ice) 100%);
}
.modal-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 22px;
}
.info-item {
  padding: 14px 16px;
  background: #f8fbfd;
  border: 1px solid transparent;
  border-radius: 12px;
  transition: all 0.22s ease;
}
.info-item:hover {
  background: #fff;
  border-color: var(--line);
  box-shadow: 0 4px 14px -10px rgba(31, 42, 55, 0.35);
}
.info-label {
  margin-bottom: 6px;
  font-size: 11.5px;
  letter-spacing: 0.5px;
  color: var(--ink-3);
}
.info-number {
  font-size: 19px;
  font-weight: 600;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 20px;
  border-top: 1px solid var(--line-2);
}

/* ================= 响应式 ================= */
@media (max-width: 1024px) {
  .page-shell {
    padding: 32px 24px 56px;
  }
  .station-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 640px) {
  .page-shell {
    padding: 24px 18px 48px;
  }
  .page-header {
    grid-template-columns: 1fr;
    gap: 18px;
  }
  .toolbar {
    width: 100%;
  }
  .search-input {
    flex: 1;
    width: auto;
  }
  .station-card {
    padding: 22px 20px 20px;
    border-radius: 18px;
  }
  .sub-status {
    grid-template-columns: 1fr;
  }
  .modal-info {
    grid-template-columns: 1fr;
  }
}
</style>
