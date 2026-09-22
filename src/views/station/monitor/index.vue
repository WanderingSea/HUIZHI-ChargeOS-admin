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
  max-width: 1280px;
  margin: 0 auto;
  padding: 56px 32px;
  font-family: "Inter", "Helvetica Neue", "PingFang SC", "Microsoft YaHei",
    sans-serif;
  color: #2b2f3a;
  letter-spacing: 0.5px;
}
.page-header {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 24px;
  align-items: end;
  margin-bottom: 48px;
  padding-bottom: 28px;
  border-bottom: 1px solid #eaeef5;
}
.page-title {
  font-size: 34px;
  font-weight: 600;
  color: #1f2430;
}
.page-subtitle {
  margin-top: 10px;
  font-size: 14px;
  color: #6b7280;
}
.toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
}
.search-input,
.sort-select {
  height: 44px;
  padding: 0 18px;
  border: 1px solid #d9e0ec;
  border-radius: 999px;
  background: #ffffff;
  color: #2b2f3a;
  font-size: 14px;
  outline: none;
  transition: border-color 0.25s, box-shadow 0.25s;
}
.search-input {
  width: 240px;
}
.search-input:focus,
.sort-select:focus {
  border-color: #7c8db5;
  box-shadow: 0 0 0 4px rgba(124, 141, 181, 0.12);
}
.station-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
  gap: 32px;
}
.station-card {
  background: #ffffff;
  border: 1px solid #e8ecf4;
  border-radius: 32px;
  padding: 36px;
  box-shadow: 0 24px 60px rgba(37, 45, 65, 0.08);
  overflow: hidden;
  transition: transform 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease;
  cursor: pointer;
}
.station-card:hover {
  transform: translateY(-8px);
  border-color: #c9d4ff;
  box-shadow: 0 32px 80px rgba(37, 45, 65, 0.14);
}
.card-label {
  display: inline-block;
  font-size: 12px;
  color: #717b8c;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  margin-bottom: 14px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 28px;
}
.station-name {
  font-size: 22px;
  font-weight: 600;
  color: #1f2430;
}
.device-total {
  font-size: 13px;
  color: #717b8c;
}
.device-total strong {
  color: #1f2430;
  font-weight: 600;
}
.status-list {
  margin-bottom: 24px;
}
.status-row {
  display: grid;
  grid-template-columns: 80px 1fr 56px;
  align-items: center;
  gap: 16px;
  padding: 14px 0;
  border-top: 1px solid #f1f4fa;
}
.status-row:last-child {
  border-bottom: 1px solid #f1f4fa;
}
.status-name {
  font-size: 13px;
  color: #4f5a6b;
}
.status-bar {
  height: 10px;
  background: #eef2fb;
  border-radius: 999px;
  overflow: hidden;
}
.status-fill {
  height: 100%;
  border-radius: 999px;
  background: #6fc3a8; /*充电 明媚绿*/
  transition: width 0.4s ease;
}
.status-row.idle .status-fill {
  background: #7fa6e6; /*空闲 明媚蓝*/
}
.status-row.fault .status-fill {
  background: #e88585; /*故障 明媚红*/
}
.status-row.offline .status-fill {
  background: #b4b8d6; /*离线 明媚灰紫*/
}
.status-row.stop .status-fill {
  background: #cfb27a; /*停用 明媚暖灰金*/
}
.status-number {
  font-size: 18px;
  font-weight: 600;
  color: #1f2430;
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.sub-status {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 28px;
}
.sub-item {
  background: #f7f9ff;
  border: 1px solid #e5ebf8;
  border-radius: 20px;
  padding: 16px;
}
.sub-label {
  font-size: 12px;
  color: #717b8c;
  margin-bottom: 8px;
}
.sub-number {
  font-size: 22px;
  font-weight: 600;
  color: #1f2430;
}
.card-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
.btn {
  height: 44px;
  padding: 0 22px;
  border-radius: 999px;
  border: none;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.25s ease;
}
.btn-default {
  background: #eef2fb;
  color: #2b2f3a;
}
.btn-default:hover {
  background: #dde6f7;
}
.btn-primary {
  background: #5f73a1;
  color: #ffffff;
  box-shadow: 0 12px 28px rgba(95, 115, 161, 0.24);
}
.btn-primary:hover {
  background: #4a6192;
  transform: translateY(-2px);
  box-shadow: 0 16px 34px rgba(95, 115, 161, 0.32);
}
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(20, 24, 35, 0.45);
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
}
.modal-mask.active {
  display: flex;
}
.modal {
  background: #ffffff;
  border-radius: 32px;
  padding: 40px;
  width: 100%;
  max-width: 560px;
  box-shadow: 0 40px 100px rgba(20, 24, 35, 0.25);
  animation: modalIn 0.3s ease;
}
@keyframes modalIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
.modal-label {
  font-size: 12px;
  color: #717b8c;
  letter-spacing: 1.2px;
  margin-bottom: 12px;
}
.modal-title {
  font-size: 24px;
  font-weight: 600;
  color: #1f2430;
  margin-bottom: 24px;
}
.modal-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  margin-bottom: 24px;
}
.info-item {
  background: #f7f9ff;
  border: 1px solid #e5ebf8;
  border-radius: 20px;
  padding: 18px;
}
.info-label {
  font-size: 12px;
  color: #717b8c;
  margin-bottom: 8px;
}
.info-number {
  font-size: 22px;
  font-weight: 600;
  color: #1f2430;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
@media (max-width: 640px) {
  .page-shell {
    padding: 32px 18px;
  }
  .page-header {
    grid-template-columns: 1fr;
  }
  .search-input {
    width: 100%;
  }
  .sub-status {
    grid-template-columns: 1fr;
  }
  .modal-info {
    grid-template-columns: 1fr;
  }
}
</style>
