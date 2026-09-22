<template>
  <div class="page-wrap">
    <!-- 面包屑导航 -->
    <div class="breadcrumb">
      <span>充电桩 ></span>
      <span>平台站桩管理 ></span>
      <span>平台电站管理 ></span>
      <strong>电站列表</strong>
    </div>

    <!-- 顶部功能按钮 -->
    <div class="top-action-bar">
      <button class="btn-green">⚡ 充电配置工具</button>
      <button class="btn-blue-light">💰 售电/金融/保险服务</button>
      <button class="btn-teal">📝 批量改价</button>
      <button class="btn-gray">📤 导出</button>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-box">
      <div class="filter-row">
        <div class="filter-item">
          <label>电站名称</label>
          <input
            v-model="searchForm.name"
            type="text"
            placeholder="请输入电站名称"
            @keyup.enter="filterStation"
          />
        </div>
        <div class="filter-item">
          <label>电站ID</label>
          <input
            v-model="searchForm.id"
            type="text"
            placeholder="请输入电站ID"
            @keyup.enter="filterStation"
          />
        </div>
        <div class="filter-item">
          <label>归属运营商</label>
          <input
            v-model="searchForm.operator"
            type="text"
            placeholder="请输入归属运营商"
            @keyup.enter="filterStation"
          />
        </div>
      </div>
      <div class="filter-btn-group">
        <button class="btn-primary" @click="filterStation">筛选</button>
        <button class="btn-default" @click="resetSearch">恢复默认</button>
      </div>
      <div class="more-filter-toggle" @click="showMoreFilter = !showMoreFilter">
        {{ showMoreFilter ? "收起筛选 △" : "更多筛选 ▽" }}
      </div>
      <div class="more-filter-panel" v-show="showMoreFilter">
        <div class="filter-row">
          <div class="filter-item">
            <label>电站状态</label>
            <input placeholder="请选择电站状态" />
          </div>
          <div class="filter-item">
            <label>电价区间</label>
            <input placeholder="最低电价" />
          </div>
          <div class="filter-item">
            <label>上线状态</label>
            <input placeholder="请选择上线状态" />
          </div>
        </div>
      </div>
    </div>

    <!-- 电站卡片列表 -->
    <div class="station-list">
      <div
        class="station-card"
        v-for="station in filterStationList"
        :key="station.id"
      >
        <div class="card-header">
          <div class="station-title">
            <h2>{{ station.name }} <span>></span></h2>
            <div class="id-text">ID: {{ station.id }}</div>
            <div class="operator-text">归属运营商：{{ station.operator }}</div>
          </div>
          <div class="card-right-top">
            <span class="warn-tag">❗ 还有 1 项未配置</span>
            <div class="card-op-buttons">
              <button
                class="btn-toggle-station"
                :class="station.enabled ? 'btn-solid-red' : 'btn-solid-blue'"
                @click="openModal(station)"
              >
                {{ station.enabled ? "停用电站" : "启用电站" }}
              </button>
              <button class="btn-outline-blue">修改电价</button>
              <button class="btn-outline-blue">管理电枪</button>
              <button class="btn-outline-blue">电站详情</button>
              <div class="more-dropdown">
                <button @click.stop="toggleDrop(station.id)">更多 ∨</button>
                <div class="dropdown-menu" v-show="dropId === station.id">
                  <div>导出数据</div>
                  <div>复制电站ID</div>
                  <div>删除电站</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 电枪状态横向概览 -->
        <div class="gun-summary-bar">
          <div class="gun-item gun-idle">
            <div class="gun-num">{{ station.gun.idle }}</div>
            <div class="gun-name">空闲</div>
          </div>
          <div class="gun-item gun-charging">
            <div class="gun-num">{{ station.gun.charging }}</div>
            <div class="gun-name">充电中</div>
          </div>
          <div class="gun-item gun-offline">
            <div class="gun-num">{{ station.gun.offline }}</div>
            <div class="gun-name">离线</div>
          </div>
          <div class="gun-item gun-fault">
            <div class="gun-num">{{ station.gun.fault }}</div>
            <div class="gun-name">故障</div>
          </div>
          <div class="gun-item gun-stop">
            <div class="gun-num">{{ station.gun.stop }}</div>
            <div class="gun-name">停用</div>
          </div>
        </div>
        <!-- 详细信息 -->
        <div class="card-body">
          <div class="info-cell">
            <h4>电站地址 <span class="edit-link">修改></span></h4>
            <div class="info-content">
              {{ station.address }}<br />
              经度：{{ station.lng }}<br />
              纬度：{{ station.lat }}
            </div>
          </div>
          <div class="info-cell">
            <h4>电站上线状态 <span class="edit-link">修改></span></h4>
            <div class="info-content status-wrap">
              <span
                class="status-badge"
                :class="station.enabled ? 'badge-green' : 'badge-orange'"
              >
                {{ station.enabled ? "已启用可充电" : "已停用不可充电" }}
              </span>
              <div>运营状态：{{ station.enabled ? "经营中" : "暂停经营" }}</div>
              <div>
                云快充APP：{{ station.enabled ? "已上线展示" : "已下线不展示" }}
              </div>
            </div>
          </div>
          <div class="info-cell">
            <h4>当前电站价 <span class="edit-link">修改></span></h4>
            <div class="price-card">
              <div class="price-main">{{ station.price.total }}元/度</div>
              <div class="price-sub">
                电费：{{ station.price.electric }}元/度<br />服务费：{{
                  station.price.service
                }}元/度
              </div>
            </div>
          </div>
          <div class="info-cell">
            <h4>司机找站指引 <span class="edit-link">修改></span></h4>
            <div class="info-content">
              场地实景图：{{ station.imgCount }}张<br />
              <span class="hint-link">找站指引：去配置 ① ></span>
            </div>
          </div>
          <div class="info-cell">
            <h4>电站开放说明 <span class="edit-link">修改></span></h4>
            <div class="info-content">
              <span class="status-badge badge-green">所有司机都可用</span>
              {{ station.openTime }}<br />
              {{ station.allowCar }}
            </div>
          </div>
          <div class="info-cell">
            <h4>停车费说明 <span class="edit-link">修改></span></h4>
            <div class="info-content">
              <span class="status-badge badge-green">停车免费</span>
            </div>
          </div>
        </div>
      </div>
      <div class="empty-tip" v-show="filterStationList.length === 0">
        未查询到匹配的电站数据
      </div>
    </div>

    <!-- 确认弹窗：启用/停用 -->
    <div class="modal-mask" v-show="modalShow" @click="handleMaskClick">
      <div class="modal-box">
        <div class="modal-title">{{ modalTitle }}</div>
        <div class="modal-desc">{{ modalDesc }}</div>
        <div class="modal-btn-group">
          <button class="modal-btn-cancel" @click="modalShow = false">
            取消
          </button>
          <button
            class="modal-btn-confirm"
            :class="modalConfirmClass"
            @click="confirmOperate"
          >
            {{ modalConfirmText }}
          </button>
        </div>
      </div>
    </div>

    <!-- Toast消息提示 -->
    <div class="toast" v-show="toastShow">{{ toastMsg }}</div>
  </div>
</template>

<script>
export default {
  name: "StationManage",
  data() {
    return {
      showMoreFilter: false,
      dropId: "",
      searchForm: {
        name: "",
        id: "",
        operator: "",
      },
      stationList: [
        {
          id: 439830,
          name: "同星旭智充站",
          operator: "新乡市牧野区同星机械有限公司（运营商ID：35202）",
          enabled: true,
          address: "河南省新乡市牧野区新辉路东马坊路口东",
          lng: "113.857128",
          lat: "35.352931",
          price: {
            total: "0.6800",
            electric: "0.6300",
            service: "0.0500",
          },
          imgCount: 1,
          openTime: "周一至周五 00:00-24:00",
          allowCar: "私家乘用车、出租/网约车、厢货车",
          gun: { idle: 2, charging: 2, offline: 0, fault: 0, stop: 0 },
        },
        {
          id: 347832,
          name: "同星南桥里充电站",
          operator: "新乡市牧野区同星机械有限公司（运营商ID：35202）",
          enabled: false,
          address: "河南省新乡市卫滨区解放南桥南桥里",
          lng: "113.862",
          lat: "35.27469",
          price: {
            total: "1.2600",
            electric: "1.2000",
            service: "0.0600",
          },
          imgCount: 5,
          openTime: "",
          allowCar: "私家乘用车、出租/网约车、厢货车",
          gun: { idle: 0, charging: 0, offline: 0, fault: 0, stop: 24 },
        },
      ],
      //弹窗
      modalShow: false,
      modalTitle: "",
      modalDesc: "",
      modalConfirmText: "",
      modalConfirmClass: "",
      currentStation: null,
      //toast
      toastShow: false,
      toastMsg: "",
    };
  },
  computed: {
    filterStationList() {
      const nameVal = this.searchForm.name.trim().toLowerCase();
      const idVal = this.searchForm.id.trim();
      const operatorVal = this.searchForm.operator.trim().toLowerCase();
      return this.stationList.filter((item) => {
        let match = true;
        if (nameVal && !item.name.toLowerCase().includes(nameVal))
          match = false;
        if (idVal && !String(item.id).includes(idVal)) match = false;
        if (operatorVal && !item.operator.toLowerCase().includes(operatorVal))
          match = false;
        return match;
      });
    },
  },
  mounted() {
    //点击空白关闭下拉
    document.addEventListener("click", () => {
      this.dropId = "";
    });
  },
  methods: {
    toggleDrop(id) {
      this.dropId = this.dropId === id ? "" : id;
    },
    filterStation() {
      // 计算属性自动监听，无需额外处理
    },
    resetSearch() {
      this.searchForm = { name: "", id: "", operator: "" };
    },
    openModal(station) {
      this.currentStation = station;
      if (station.enabled) {
        //停用
        this.modalTitle = "确认停用电站";
        this.modalDesc =
          "停用后，该电站将停止对外提供充电服务，云快充APP下线，司机无法扫码充电，是否确认？";
        this.modalConfirmText = "确认停用";
        this.modalConfirmClass = "confirm-red";
      } else {
        //启用
        this.modalTitle = "确认启用电站";
        this.modalDesc =
          "启用后，电站恢复对外充电服务，云快充APP上线展示，司机可正常扫码充电，是否确认？";
        this.modalConfirmText = "确认启用";
        this.modalConfirmClass = "confirm-blue";
      }
      this.modalShow = true;
    },
    handleMaskClick(e) {
      if (e.target === e.currentTarget) {
        this.modalShow = false;
      }
    },
    confirmOperate() {
      this.currentStation.enabled = !this.currentStation.enabled;
      this.modalShow = false;
      this.showToast(
        this.currentStation.enabled ? "电站启用成功" : "电站停用成功"
      );
    },
    showToast(msg) {
      this.toastMsg = msg;
      this.toastShow = true;
      setTimeout(() => {
        this.toastShow = false;
      }, 1800);
    },
  },
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "PingFang SC", "Inter", "Microsoft YaHei", sans-serif;
}
.page-wrap {
  max-width: 1700px;
  margin: 0 auto;
  padding: 24px;
  background-color: #f7f9fc;
  color: #222938;
}
/* 面包屑 */
.breadcrumb {
  display: flex;
  gap: 8px;
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 20px;
}
.breadcrumb strong {
  color: #1f2937;
  font-weight: 500;
}
/* 顶部右上角功能按钮 */
.top-action-bar {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-bottom: 16px;
}
.top-action-bar button {
  border: none;
  border-radius: 8px;
  padding: 7px 12px;
  font-size: 14px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}
.top-action-bar button:hover {
  transform: translateY(-1px);
}
.btn-green {
  background: #e8f8f0;
  color: #067845;
}
.btn-blue-light {
  background: #eef6ff;
  color: #1d65b8;
}
.btn-teal {
  background: #e6f7f5;
  color: #0d7269;
}
.btn-gray {
  background: #eff2f7;
  color: #4b5563;
}

/* 筛选模块 */
.filter-box {
  background: #ffffff;
  border-radius: 16px;
  padding: 22px;
  box-shadow: 0 1px 8px rgba(15, 23, 42, 0.04);
  margin-bottom: 24px;
}
.filter-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 16px;
}
.filter-item label {
  display: block;
  font-size: 14px;
  color: #4b5563;
  margin-bottom: 6px;
}
.filter-item input {
  width: 100%;
  height: 40px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0 14px;
  font-size: 14px;
  transition: 0.2s;
}
.filter-item input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
.filter-btn-group {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
.filter-btn-group button {
  height: 40px;
  padding: 0 20px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  border: none;
}
.btn-primary {
  background: #3b82f6;
  color: #fff;
}
.btn-primary:hover {
  background: #2563eb;
}
.btn-default {
  background: #f1f5f9;
  color: #475569;
}
.btn-default:hover {
  background: #e2e8f0;
}
.more-filter-toggle {
  text-align: center;
  margin-top: 14px;
  color: #3b82f6;
  cursor: pointer;
  font-size: 14px;
}
.more-filter-panel {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed #e5e7eb;
}

/* 电站列表 */
.station-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}
.station-card {
  background: #fff;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 1px 10px rgba(15, 23, 42, 0.04);
  transition: 0.25s ease;
}
.station-card:hover {
  box-shadow: 0 4px 18px rgba(15, 23, 42, 0.07);
}
/* 卡片头部 */
.card-header {
  padding: 20px 24px;
  background-color: #fbfdff;
  border-bottom: 1px solid #f0f4f9;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.station-title h2 {
  font-size: 19px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}
.station-title h2 > span {
  color: #6b7280;
  font-weight: normal;
}
.station-title .id-text {
  font-size: 13px;
  color: #6b7280;
}
.station-title .operator-text {
  font-size: 13px;
  color: #6b7280;
  margin-top: 4px;
}
.card-right-top {
  text-align: right;
}
.warn-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 9px;
  background: #fef2f2;
  color: #dc2626;
  border-radius: 6px;
  font-size: 13px;
  margin-bottom: 8px;
}
/* ========== 按钮样式 匹配截图样式 ========== */
.card-op-buttons {
  display: grid;
  grid-template-columns: auto auto;
  gap: 8px;
  justify-content: flex-end;
  position: relative;
}
.card-op-buttons button {
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: 0.2s;
}
.btn-solid-red {
  background-color: #dd3333;
  color: #fff;
  border: none;
}
.btn-solid-red:hover {
  background-color: #c22222;
}
.btn-solid-blue {
  background-color: #2b78e4;
  color: #fff;
  border: none;
}
.btn-solid-blue:hover {
  background-color: #1f65c9;
}
.btn-outline-blue {
  background: #fff;
  color: #2b78e4;
  border: 1px solid #2b78e4;
}
.btn-outline-blue:hover {
  background: #f0f6ff;
}
.more-dropdown {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  position: relative;
}
.dropdown-menu {
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 6px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  width: 120px;
  z-index: 9;
}
.dropdown-menu div {
  padding: 8px 12px;
  font-size: 13px;
  cursor: pointer;
}
.dropdown-menu div:hover {
  background: #f3f4f6;
}
/* 电枪状态概览条【匹配截图色块】 */
.gun-summary-bar {
  padding: 16px 24px;
  border-bottom: 1px solid #f3f4f6;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
}
.gun-item {
  text-align: center;
  padding: 10px 4px;
  border-radius: 10px;
}
.gun-idle {
  background: #ecf9ee;
  color: #229944;
}
.gun-charging {
  background: #e1edff;
  color: #2563eb;
}
.gun-offline {
  background: #f1f5f9;
  color: #475569;
}
.gun-fault {
  background: #fee2e2;
  color: #dc2626;
}
.gun-stop {
  background: #fff9e6;
  color: #d97706;
}
.gun-num {
  font-size: 20px;
  font-weight: 600;
}
.gun-name {
  font-size: 13px;
  margin-top: 4px;
}
/* 卡片详情主体 */
.card-body {
  padding: 20px 24px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}
.info-cell h4 {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
}
.edit-link {
  color: #3b82f6;
  font-size: 13px;
  cursor: pointer;
}
.info-content {
  font-size: 14px;
  line-height: 1.65;
}
.status-badge {
  display: inline-block;
  padding: 4px 9px;
  border-radius: 6px;
  font-size: 13px;
  margin-bottom: 8px;
}
.badge-green {
  background: #ecfdf3;
  color: #16a34a;
}
.badge-orange {
  background: #ffedd5;
  color: #c2410c;
}
.price-card {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 14px;
}
.price-main {
  font-size: 20px;
  color: #2563eb;
  font-weight: 600;
}
.price-sub {
  font-size: 13px;
  color: #6b7280;
  margin-top: 6px;
}
.hint-link {
  color: #2563eb;
  font-size: 13px;
  cursor: pointer;
}
/* 空状态 */
.empty-tip {
  grid-column: 1/-1;
  text-align: center;
  padding: 60px 0;
  color: #9ca3af;
  font-size: 15px;
}
/* ========== 弹窗确认框 ========== */
.modal-mask {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
.modal-box {
  background: #fff;
  border-radius: 14px;
  width: 420px;
  padding: 24px;
}
.modal-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 14px;
}
.modal-desc {
  font-size: 14px;
  color: #4b5563;
  margin-bottom: 24px;
  line-height: 1.6;
}
.modal-btn-group {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
.modal-btn-cancel {
  padding: 8px 18px;
  border: 1px solid #d1d5db;
  background: #fff;
  border-radius: 8px;
  cursor: pointer;
}
.modal-btn-confirm {
  padding: 8px 18px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: #fff;
}
.confirm-red {
  background: #dd3333;
}
.confirm-blue {
  background: #2b78e4;
}
/* Toast提示 */
.toast {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: #222;
  color: #fff;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  z-index: 1000;
}
</style>
