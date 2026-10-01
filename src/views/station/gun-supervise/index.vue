<template>
  <div class="page-wrap">
    <div class="breadcrumb">
      <span>首页</span>
      <span>/</span>
      <span>站场监管</span>
      <span>/</span>
      <strong>充电枪监管信息列表</strong>
    </div>

    <div class="filter-box">
      <div class="filter-row">
        <div class="filter-item">
          <label>枪编号</label>
          <input v-model="filter.gunNo" placeholder="请输入枪编号" />
        </div>
        <div class="filter-item">
          <label>所属电站</label>
          <input v-model="filter.stationName" placeholder="请输入电站名称" />
        </div>
        <div class="filter-item">
          <label>所属电桩</label>
          <input v-model="filter.pileNo" placeholder="请输入电桩编号" />
        </div>
        <div class="filter-item">
          <label>枪类型</label>
          <select v-model="filter.gunType">
            <option value="">全部</option>
            <option value="直流">直流</option>
            <option value="交流">交流</option>
          </select>
        </div>
        <div class="filter-item">
          <label>运行状态</label>
          <select v-model="filter.status">
            <option value="">全部</option>
            <option value="空闲">空闲</option>
            <option value="充电中">充电中</option>
            <option value="故障">故障</option>
            <option value="离线">离线</option>
          </select>
        </div>
      </div>
      <div class="filter-btn-group">
        <button class="btn-default" @click="resetFilter">重置</button>
        <button class="btn-primary" @click="applyFilter">筛选</button>
      </div>
    </div>

    <div class="table-box">
      <div class="table-header">
        <span class="table-title">充电枪监管列表</span>
        <span class="table-count">共 {{ filteredList.length }} 条</span>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>枪编号</th>
            <th>所属电站</th>
            <th>所属电桩</th>
            <th>枪类型</th>
            <th>运行状态</th>
            <th>当前功率</th>
            <th>今日充电量</th>
            <th>心跳时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in pagedList" :key="item.id">
            <td class="bold">{{ item.gunNo }}</td>
            <td>{{ item.stationName }}</td>
            <td>{{ item.pileNo }}</td>
            <td>
              <span
                class="tag"
                :class="item.gunType === '直流' ? 'tag-blue' : 'tag-green'"
                >{{ item.gunType }}</span
              >
            </td>
            <td>
              <span class="status-tag" :class="statusClass(item.status)">{{
                item.status
              }}</span>
            </td>
            <td>{{ item.currentPower }}</td>
            <td>{{ item.todayKwh }}</td>
            <td>{{ item.heartbeat }}</td>
            <td class="op-cell">
              <button class="op-btn" @click="openDetail(item)">详情</button>
            </td>
          </tr>
          <tr v-if="filteredList.length === 0">
            <td colspan="9" class="empty-row">暂无数据</td>
          </tr>
        </tbody>
      </table>

      <div class="pagination">
        <div class="page-info">
          共 {{ filteredList.length }} 条，每页
          <select v-model="pageSize" class="page-size-select">
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
          </select>
          条
        </div>
        <div class="page-controls">
          <button :disabled="pageNum <= 1" @click="pageNum = 1">«</button>
          <button :disabled="pageNum <= 1" @click="pageNum--">‹</button>
          <span class="page-num">{{ pageNum }} / {{ totalPages }}</span>
          <button :disabled="pageNum >= totalPages" @click="pageNum++">
            ›
          </button>
          <button
            :disabled="pageNum >= totalPages"
            @click="pageNum = totalPages"
          >
            »
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showDetailModal"
      class="modal-mask"
      @click.self="showDetailModal = false"
    >
      <div class="modal-box">
        <div class="modal-title">充电枪监管详情</div>
        <div class="detail-item">
          <span>枪编号：</span>{{ currentItem.gunNo }}
        </div>
        <div class="detail-item">
          <span>所属电站：</span>{{ currentItem.stationName }}
        </div>
        <div class="detail-item">
          <span>所属电桩：</span>{{ currentItem.pileNo }}
        </div>
        <div class="detail-item">
          <span>枪类型：</span>{{ currentItem.gunType }}
        </div>
        <div class="detail-item">
          <span>运行状态：</span>{{ currentItem.status }}
        </div>
        <div class="detail-item">
          <span>当前功率：</span>{{ currentItem.currentPower }}
        </div>
        <div class="detail-item">
          <span>今日充电量：</span>{{ currentItem.todayKwh }}
        </div>
        <div class="detail-item">
          <span>心跳时间：</span>{{ currentItem.heartbeat }}
        </div>
        <div class="modal-btn-group">
          <button class="modal-btn-cancel" @click="showDetailModal = false">
            关闭
          </button>
        </div>
      </div>
    </div>

    <div v-if="toast" class="toast">{{ toast }}</div>
  </div>
</template>

<script>
export default {
  name: "GunSupervise",
  data() {
    return {
      filter: {
        gunNo: "",
        stationName: "",
        pileNo: "",
        gunType: "",
        status: "",
      },
      pageNum: 1,
      pageSize: 10,
      list: [
        {
          id: 1,
          gunNo: "G001",
          stationName: "星河湾充电站",
          pileNo: "P-001",
          gunType: "直流",
          status: "空闲",
          currentPower: "0 kW",
          todayKwh: "186.5 kWh",
          heartbeat: "2026-10-01 10:22:31",
        },
        {
          id: 2,
          gunNo: "G002",
          stationName: "星河湾充电站",
          pileNo: "P-001",
          gunType: "直流",
          status: "充电中",
          currentPower: "120 kW",
          todayKwh: "432.8 kWh",
          heartbeat: "2026-10-01 10:22:28",
        },
        {
          id: 3,
          gunNo: "G003",
          stationName: "星河湾充电站",
          pileNo: "P-002",
          gunType: "交流",
          status: "空闲",
          currentPower: "0 kW",
          todayKwh: "58.2 kWh",
          heartbeat: "2026-10-01 10:22:25",
        },
        {
          id: 4,
          gunNo: "G004",
          stationName: "科技园超级充电站",
          pileNo: "P-015",
          gunType: "直流",
          status: "充电中",
          currentPower: "180 kW",
          todayKwh: "621.4 kWh",
          heartbeat: "2026-10-01 10:22:30",
        },
        {
          id: 5,
          gunNo: "G005",
          stationName: "科技园超级充电站",
          pileNo: "P-015",
          gunType: "直流",
          status: "故障",
          currentPower: "—",
          todayKwh: "0 kWh",
          heartbeat: "2026-10-01 09:12:18",
        },
        {
          id: 6,
          gunNo: "G006",
          stationName: "中央商务区充电站",
          pileNo: "P-022",
          gunType: "交流",
          status: "空闲",
          currentPower: "0 kW",
          todayKwh: "24.6 kWh",
          heartbeat: "2026-10-01 10:22:32",
        },
        {
          id: 7,
          gunNo: "G007",
          stationName: "中央商务区充电站",
          pileNo: "P-023",
          gunType: "直流",
          status: "离线",
          currentPower: "—",
          todayKwh: "12.3 kWh",
          heartbeat: "2026-10-01 07:45:02",
        },
        {
          id: 8,
          gunNo: "G008",
          stationName: "滨江新城充电站",
          pileNo: "P-031",
          gunType: "直流",
          status: "充电中",
          currentPower: "95 kW",
          todayKwh: "298.7 kWh",
          heartbeat: "2026-10-01 10:22:29",
        },
      ],
      showDetailModal: false,
      currentItem: {},
      toast: "",
    };
  },
  computed: {
    filteredList() {
      return this.list.filter((item) => {
        return (
          (!this.filter.gunNo || item.gunNo.includes(this.filter.gunNo)) &&
          (!this.filter.stationName ||
            item.stationName.includes(this.filter.stationName)) &&
          (!this.filter.pileNo || item.pileNo.includes(this.filter.pileNo)) &&
          (!this.filter.gunType || item.gunType === this.filter.gunType) &&
          (!this.filter.status || item.status === this.filter.status)
        );
      });
    },
    totalPages() {
      return Math.max(1, Math.ceil(this.filteredList.length / this.pageSize));
    },
    pagedList() {
      const start = (this.pageNum - 1) * this.pageSize;
      return this.filteredList.slice(start, start + this.pageSize);
    },
  },
  methods: {
    statusClass(s) {
      if (s === "空闲") return "s-ok";
      if (s === "充电中") return "s-run";
      if (s === "故障") return "s-warn";
      return "s-off";
    },
    applyFilter() {
      this.pageNum = 1;
      this.showToast("筛选完成");
    },
    resetFilter() {
      this.filter = {
        gunNo: "",
        stationName: "",
        pileNo: "",
        gunType: "",
        status: "",
      };
      this.pageNum = 1;
    },
    openDetail(item) {
      this.currentItem = item;
      this.showDetailModal = true;
    },
    showToast(msg) {
      this.toast = msg;
      setTimeout(() => (this.toast = ""), 2200);
    },
  },
};
</script>

<style scoped>
.page-wrap {
  --accent: #6b8fb0;
  --accent-2: #4f7295;
  --accent-soft: #e9f0f6;
  --ice: #82a8c4;
  --ink: #1f2a37;
  --ink-2: #5a6b7b;
  --ink-3: #94a3b3;
  --ink-4: #c3ced9;
  --line: #e4eaf1;
  --line-2: #eef3f8;
  min-height: 100vh;
  padding: 32px 40px 64px;
  font-size: 14px;
  color: var(--ink);
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC",
    "Microsoft YaHei", system-ui, sans-serif;
  letter-spacing: 0.2px;
  background: #f7fafd;
}
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: -20px;
  font-size: 13px;
  color: var(--ink-3);
}
.breadcrumb strong {
  position: relative;
  color: var(--ink);
  font-weight: 600;
  letter-spacing: 0.6px;
}
.breadcrumb strong::after {
  content: "";
  display: inline-block;
  width: 5px;
  height: 5px;
  margin-left: 6px;
  vertical-align: 2px;
  border-radius: 50%;
  background: var(--accent);
}

.filter-box {
  padding: 24px 28px 20px;
  margin-bottom: 18px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 18px;
  box-shadow: 0 1px 2px rgba(31, 42, 55, 0.03),
    0 10px 28px -22px rgba(31, 42, 55, 0.28);
}
.filter-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
}
.filter-item label {
  display: block;
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.6px;
  color: var(--ink-2);
}
.filter-item input,
.filter-item select {
  width: 100%;
  height: 38px;
  padding: 0 14px;
  font-size: 13px;
  color: var(--ink);
  background: #f8fbfd;
  border: 1px solid var(--line);
  border-radius: 10px;
  transition: all 0.22s ease;
}
.filter-item input:focus,
.filter-item select:focus {
  outline: none;
  background: #fff;
  border-color: var(--accent);
  box-shadow: 0 0 0 4px rgba(107, 143, 176, 0.12);
}
.filter-btn-group {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
.filter-btn-group button {
  height: 38px;
  padding: 0 22px;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.5px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.btn-primary {
  color: #fff;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%);
  box-shadow: 0 8px 18px -10px rgba(79, 114, 149, 0.9);
}
.btn-primary:hover {
  background: linear-gradient(135deg, var(--accent-2) 0%, #3d5a77 100%);
  transform: translateY(-1px);
}
.btn-default {
  color: var(--ink-2);
  background: #fff;
  border: 1px solid var(--line) !important;
}
.btn-default:hover {
  color: var(--accent-2);
  background: var(--accent-soft);
  border-color: var(--accent) !important;
}

.table-box {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 18px;
  box-shadow: 0 1px 2px rgba(31, 42, 55, 0.03),
    0 10px 28px -22px rgba(31, 42, 55, 0.28);
  overflow: hidden;
}
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 28px;
  border-bottom: 1px solid var(--line-2);
}
.table-title {
  position: relative;
  padding-left: 14px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.8px;
  color: var(--ink);
}
.table-title::before {
  content: "";
  position: absolute;
  left: 0;
  top: 2px;
  bottom: 2px;
  width: 3px;
  border-radius: 2px;
  background: linear-gradient(180deg, var(--accent) 0%, var(--ice) 100%);
}
.table-count {
  font-size: 12px;
  color: var(--ink-3);
}
.data-table {
  width: 100%;
  border-collapse: collapse;
}
.data-table thead {
  background: #f8fbfd;
}
.data-table th {
  padding: 14px 16px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.8px;
  text-align: left;
  color: var(--ink-2);
  border-bottom: 1px solid var(--line-2);
}
.data-table td {
  padding: 14px 16px;
  font-size: 13px;
  color: var(--ink);
  border-bottom: 1px solid var(--line-2);
}
.data-table td.bold {
  font-weight: 600;
  color: var(--ink);
}
.data-table tbody tr {
  transition: background 0.2s ease;
}
.data-table tbody tr:hover {
  background: #f7fafd;
}
.data-table tbody tr:last-child td {
  border-bottom: none;
}
.empty-row {
  text-align: center !important;
  color: var(--ink-3) !important;
  padding: 60px 0 !important;
}

.tag {
  display: inline-block;
  padding: 2px 10px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 999px;
}
.tag-blue {
  color: var(--accent-2);
  background: var(--accent-soft);
}
.tag-green {
  color: #067647;
  background: #ecfdf3;
}
.status-tag {
  display: inline-block;
  padding: 3px 11px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 20px;
}
.s-ok {
  color: #067647;
  background: #ecfdf3;
}
.s-run {
  color: var(--accent-2);
  background: var(--accent-soft);
}
.s-warn {
  color: #b54708;
  background: #fffaeb;
}
.s-off {
  color: var(--ink-2);
  background: #f4f7fa;
}
.op-cell {
  white-space: nowrap;
}
.op-btn {
  height: 28px;
  padding: 0 10px;
  margin-right: 6px;
  font-size: 12px;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--accent-2);
  cursor: pointer;
  transition: all 0.2s ease;
}
.op-btn:hover {
  background: var(--accent-soft);
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 28px;
  border-top: 1px solid var(--line-2);
}
.page-info {
  font-size: 12px;
  color: var(--ink-3);
}
.page-size-select {
  height: 28px;
  margin: 0 6px;
  padding: 0 8px;
  font-size: 12px;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: #fff;
  color: var(--ink);
  cursor: pointer;
}
.page-controls {
  display: flex;
  align-items: center;
  gap: 6px;
}
.page-controls button {
  width: 30px;
  height: 30px;
  font-size: 12px;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: #fff;
  color: var(--ink-2);
  cursor: pointer;
  transition: all 0.2s ease;
}
.page-controls button:hover:not(:disabled) {
  background: var(--accent-soft);
  color: var(--accent-2);
  border-color: var(--accent);
}
.page-controls button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.page-num {
  font-size: 12px;
  color: var(--ink-2);
  padding: 0 6px;
}

.modal-mask {
  position: fixed;
  inset: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(31, 42, 55, 0.35);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}
.modal-box {
  width: 460px;
  max-width: 92vw;
  padding: 28px 32px;
  background: #fff;
  border-radius: 22px;
  box-shadow: 0 32px 80px -32px rgba(31, 42, 55, 0.55);
  animation: modalIn 0.32s cubic-bezier(0.16, 1, 0.3, 1);
}
.modal-title {
  position: relative;
  padding-left: 14px;
  padding-bottom: 18px;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.8px;
  color: var(--ink);
  border-bottom: 1px solid var(--line-2);
}
.modal-title::before {
  content: "";
  position: absolute;
  left: 0;
  top: 3px;
  bottom: 21px;
  width: 3px;
  border-radius: 2px;
  background: linear-gradient(180deg, var(--accent) 0%, var(--ice) 100%);
}
.detail-item {
  padding: 10px 0;
  font-size: 13px;
  color: var(--ink-2);
  border-bottom: 1px dashed var(--line);
}
.detail-item:last-child {
  border-bottom: none;
}
.detail-item span {
  display: inline-block;
  width: 110px;
  color: var(--ink-3);
  font-weight: 500;
}
.modal-btn-group {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
}
.modal-btn-cancel {
  height: 38px;
  padding: 0 22px;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.5px;
  color: var(--ink-2);
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s ease;
}
.modal-btn-cancel:hover {
  color: var(--accent-2);
  background: var(--accent-soft);
  border-color: var(--accent);
}

.toast {
  position: fixed;
  left: 50%;
  bottom: 44px;
  z-index: 1000;
  padding: 11px 24px;
  font-size: 13px;
  letter-spacing: 0.5px;
  color: #fff;
  background: rgba(31, 42, 55, 0.92);
  border-radius: 999px;
  box-shadow: 0 18px 44px -18px rgba(31, 42, 55, 0.7);
  backdrop-filter: blur(8px);
  transform: translateX(-50%);
  animation: toastIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
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
@keyframes toastIn {
  from {
    opacity: 0;
    transform: translate(-50%, 14px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}
@media (max-width: 1024px) {
  .page-wrap {
    padding: 24px 22px 48px;
  }
  .filter-row {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 640px) {
  .filter-row {
    grid-template-columns: 1fr;
  }
  .pagination {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}
</style>
