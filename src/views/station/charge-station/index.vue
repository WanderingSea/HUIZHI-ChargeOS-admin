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
      <button class="btn-green">充电配置工具</button>
      <button class="btn-blue-light">售电/金融/保险服务</button>
      <button class="btn-teal">批量改价</button>
      <button class="btn-gray">导出</button>
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
}

.page-wrap {
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
  --danger: #d92d20;
  --danger-dark: #b42318;

  min-height: 100vh;
  max-width: 1720px;
  margin: 0 auto;
  padding: 32px 40px 64px;
  color: var(--ink);
  font-size: 14px;
  line-height: 1.6;
  letter-spacing: 0.2px;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC",
    "Hiragino Sans GB", "Microsoft YaHei", system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.breadcrumb {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 4px;
  font-size: 13px;
  color: var(--ink-3);
}
.breadcrumb span {
  transition: color 0.2s ease;
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

.top-action-bar {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
  margin-top: -20px;
}
.top-action-bar button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 30px;
  padding: 0 18px;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.4px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: #fff;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 2px rgba(31, 42, 55, 0.03);
}
.top-action-bar button:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 22px -10px rgba(79, 114, 149, 0.85);
}
.top-action-bar button:active {
  transform: translateY(0);
  box-shadow: none;
}
.btn-green {
  color: var(--accent-2);
}
.btn-green:hover {
  color: #fff;
  background: linear-gradient(135deg, #82a8c4 0%, #5e88ab 100%);
  border-color: transparent;
}
.btn-blue-light {
  color: var(--accent-2);
}
.btn-blue-light:hover {
  color: #fff;
  background: linear-gradient(135deg, #6b8fb0 0%, #4f7295 100%);
  border-color: transparent;
}
.btn-teal {
  color: #3d5a77;
}
.btn-teal:hover {
  color: #fff;
  background: linear-gradient(135deg, #7a9db5 0%, #4f7295 100%);
  border-color: transparent;
}
.btn-gray {
  color: var(--ink-2);
}
.btn-gray:hover {
  color: #fff;
  background: linear-gradient(135deg, #82a8c4 0%, #6b8fb0 100%);
  border-color: transparent;
}

.filter-box {
  position: relative;
  padding: 24px 26px 18px;
  margin-bottom: 18px;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 18px;
  box-shadow: 0 1px 2px rgba(31, 42, 55, 0.03),
    0 10px 28px -22px rgba(31, 42, 55, 0.28);
}
.filter-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px 20px;
}
.filter-item label {
  display: block;
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.6px;
  color: var(--ink-2);
}
.filter-item input {
  width: 100%;
  height: 38px;
  padding: 0 14px;
  font-size: 13px;
  color: var(--ink);
  background: #f8fbfd;
  border: 1px solid var(--line);
  border-radius: 10px;
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}
.filter-item input::placeholder {
  color: #aebbca;
}
.filter-item input:hover {
  border-color: #cdd9e4;
}
.filter-item input:focus {
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
  border: 1px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
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
.more-filter-toggle {
  width: fit-content;
  margin: 10px auto 0;
  padding: 6px 18px;
  font-size: 13px;
  color: var(--accent-2);
  border-radius: 999px;
  cursor: pointer;
  user-select: none;
  transition: all 0.22s ease;
}
.more-filter-toggle:hover {
  background: var(--accent-soft);
  color: var(--accent-2);
}
.more-filter-panel {
  margin-top: 16px;
  padding-top: 18px;
  border-top: 1px dashed var(--line);
}

.station-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}
.station-card {
  display: flex;
  flex-direction: column;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(31, 42, 55, 0.03),
    0 10px 28px -22px rgba(31, 42, 55, 0.28);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.3s ease;
}
.station-card:hover {
  transform: translateY(-3px);
  border-color: #cdd9e4;
  box-shadow: 0 2px 4px rgba(31, 42, 55, 0.05),
    0 22px 50px -24px rgba(79, 114, 149, 0.35);
}

.card-header {
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  padding: 22px 24px 18px;
  background: linear-gradient(180deg, #f8fbfd 0%, #ffffff 100%);
  border-bottom: 1px solid var(--line-2);
}
.card-header::before {
  content: "";
  position: absolute;
  left: 24px;
  top: 0;
  width: 3px;
  height: 36px;
  border-radius: 0 2px 2px 0;
  background: linear-gradient(180deg, var(--accent) 0%, var(--ice) 100%);
}
.station-title {
  flex: 1;
  min-width: 0;
  padding-left: 10px;
}
.station-title h2 {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.35;
  letter-spacing: 0.4px;
  color: var(--ink);
}
.station-title h2 > span {
  font-weight: 400;
  color: var(--ink-4);
  transition: transform 0.25s ease, color 0.25s ease;
}
.station-card:hover .station-title h2 > span {
  color: var(--accent);
  transform: translateX(3px);
}
.station-title .id-text,
.station-title .operator-text {
  margin-top: 6px;
  font-size: 12.5px;
  line-height: 1.6;
  color: var(--ink-3);
  word-break: break-all;
}
.card-right-top {
  flex-shrink: 0;
  text-align: right;
}
.warn-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  margin-bottom: 12px;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.3px;
  color: #b54708;
  background: #fff8eb;
  border: 1px solid #fde2a6;
  border-radius: 999px;
}

.card-op-buttons {
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, auto);
  gap: 8px;
  justify-content: end;
}
.card-op-buttons button {
  height: 32px;
  padding: 0 14px;
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0.3px;
  white-space: nowrap;
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}
.btn-solid-red {
  color: #fff;
  background: linear-gradient(135deg, #f53f3f 0%, #c93030 100%);
  box-shadow: 0 6px 14px -8px rgba(245, 63, 63, 0.85);
}
.btn-solid-red:hover {
  background: linear-gradient(135deg, #d92d20 0%, #b42318 100%);
  transform: translateY(-1px);
  box-shadow: 0 10px 18px -8px rgba(245, 63, 63, 0.95);
}
.btn-solid-blue {
  color: #fff;
  background: linear-gradient(135deg, #6b8fb0 0%, #4f7295 100%);
  box-shadow: 0 6px 14px -8px rgba(79, 114, 149, 0.85);
}
.btn-solid-blue:hover {
  background: linear-gradient(135deg, #4f7295 0%, #3d5a77 100%);
  transform: translateY(-1px);
  box-shadow: 0 10px 18px -8px rgba(79, 114, 149, 0.95);
}
.btn-outline-blue {
  color: var(--accent-2);
  background: #fff;
  border-color: var(--line);
}
.btn-outline-blue:hover {
  color: #fff;
  background: linear-gradient(135deg, #6b8fb0 0%, #4f7295 100%);
  border-color: transparent;
  box-shadow: 0 6px 14px -8px rgba(79, 114, 149, 0.85);
}

.more-dropdown {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  position: relative;
}
.more-dropdown > button {
  height: 30px;
  padding: 0 14px;
  font-size: 12.5px;
  color: var(--ink-2);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.22s ease;
}
.more-dropdown > button:hover {
  background: var(--accent-soft);
  color: var(--accent-2);
}
.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 20;
  width: 140px;
  padding: 6px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 12px;
  box-shadow: 0 18px 44px -18px rgba(31, 42, 55, 0.4);
  animation: dropIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.dropdown-menu div {
  padding: 9px 12px;
  font-size: 13px;
  color: var(--ink-2);
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.18s ease, color 0.18s ease;
}
.dropdown-menu div:hover {
  background: var(--accent-soft);
  color: var(--accent-2);
}
.dropdown-menu div:last-child {
  color: var(--danger);
}
.dropdown-menu div:last-child:hover {
  background: #fef3f2;
  color: #b42318;
}

.gun-summary-bar {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
  padding: 16px 24px;
  border-bottom: 1px solid var(--line-2);
}
.gun-item {
  padding: 11px 4px;
  text-align: center;
  border-radius: 10px;
  transition: transform 0.22s ease, box-shadow 0.22s ease;
}
.gun-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px -6px rgba(31, 42, 55, 0.2);
}
.gun-idle {
  background: #f0fdf4;
  color: #067647;
}
.gun-charging {
  background: var(--ice-soft);
  color: var(--accent-2);
}
.gun-offline {
  background: #f4f7fa;
  color: var(--ink-2);
}
.gun-fault {
  background: #fef3f2;
  color: #b42318;
}
.gun-stop {
  background: #fff8eb;
  color: #b54708;
}
.gun-num {
  font-size: 20px;
  font-weight: 600;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}
.gun-name {
  margin-top: 4px;
  font-size: 12px;
  font-weight: 500;
  opacity: 0.85;
  letter-spacing: 0.3px;
}

.card-body {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px 26px;
  padding: 22px 24px 26px;
}
.info-cell h4 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.6px;
  color: var(--ink-3);
}
.edit-link {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 500;
  color: var(--accent-2);
  cursor: pointer;
  transition: all 0.22s ease;
  letter-spacing: 0.3px;
}
.edit-link:hover {
  text-decoration: underline;
}
.info-content {
  font-size: 13px;
  line-height: 1.8;
  color: var(--ink-2);
  word-break: break-all;
}
.status-badge {
  display: inline-block;
  padding: 3px 11px;
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.3px;
  line-height: 1.6;
  border-radius: 20px;
}
.badge-green {
  color: #fff;
  background: linear-gradient(135deg, #6b8fb0 0%, #4f7295 100%);
  box-shadow: 0 4px 10px -4px rgba(79, 114, 149, 0.6);
}
.badge-orange {
  color: #b54708;
  background: #fff8eb;
  border: 1px solid #fde2a6;
}
.price-card {
  padding: 16px 18px;
  background: linear-gradient(135deg, #f8fbfd 0%, #eef4f9 100%);
  border: 1px solid #d9e4ed;
  border-radius: 12px;
}
.price-main {
  font-size: 22px;
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: 0.2px;
  color: var(--accent-2);
  font-variant-numeric: tabular-nums;
}
.price-sub {
  margin-top: 6px;
  font-size: 12.5px;
  line-height: 1.7;
  color: var(--ink-3);
}
.hint-link {
  display: inline-block;
  margin-top: 4px;
  font-size: 12.5px;
  color: var(--accent-2);
  cursor: pointer;
  transition: opacity 0.22s ease;
}
.hint-link:hover {
  text-decoration: underline;
}
.empty-tip {
  grid-column: 1 / -1;
  padding: 72px 0;
  text-align: center;
  font-size: 14px;
  color: var(--ink-3);
  background: var(--card);
  border: 1px dashed var(--line);
  border-radius: 18px;
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
  margin-bottom: 14px;
  padding-bottom: 18px;
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
.modal-desc {
  margin-bottom: 26px;
  font-size: 13.5px;
  line-height: 1.8;
  color: var(--ink-2);
  padding: 14px 16px;
  background: #f8fbfd;
  border-radius: 12px;
  border-left: 3px solid var(--accent);
}
.modal-btn-group {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
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
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.modal-btn-cancel:hover {
  color: var(--accent-2);
  background: var(--accent-soft);
  border-color: var(--accent);
}
.modal-btn-confirm {
  height: 38px;
  padding: 0 22px;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.5px;
  color: #fff;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.confirm-red {
  background: linear-gradient(135deg, #f53f3f 0%, #c93030 100%);
  box-shadow: 0 8px 18px -10px rgba(245, 63, 63, 0.9);
}
.confirm-red:hover {
  background: linear-gradient(135deg, #d92d20 0%, #b42318 100%);
  transform: translateY(-1px);
  box-shadow: 0 12px 24px -10px rgba(245, 63, 63, 0.95);
}
.confirm-blue {
  background: linear-gradient(135deg, #6b8fb0 0%, #4f7295 100%);
  box-shadow: 0 8px 18px -10px rgba(79, 114, 149, 0.9);
}
.confirm-blue:hover {
  background: linear-gradient(135deg, #4f7295 0%, #3d5a77 100%);
  transform: translateY(-1px);
  box-shadow: 0 12px 24px -10px rgba(79, 114, 149, 0.95);
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
  -webkit-backdrop-filter: blur(8px);
  transform: translateX(-50%);
  animation: toastIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes dropIn {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
@media (max-width: 1360px) {
  .station-list {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 1024px) {
  .page-wrap {
    padding: 24px 22px 48px;
  }
  .filter-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 720px) {
  .filter-row {
    grid-template-columns: 1fr;
  }
  .card-header {
    flex-direction: column;
    gap: 14px;
  }
  .card-right-top {
    width: 100%;
    text-align: left;
  }
  .card-op-buttons {
    justify-content: flex-start;
  }
  .more-dropdown {
    justify-content: flex-start;
  }
  .card-body {
    grid-template-columns: 1fr;
  }
  .gun-summary-bar {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .modal-box {
    padding: 22px 20px;
    border-radius: 18px;
  }
}
</style>
