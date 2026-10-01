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
/* ============ 基础重置 ============ */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.page-wrap {
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
  --danger-dark: #a84638;
  --danger-soft: #fbf0ee;
  --warm: #b89968;
  --warm-soft: #f7f2e8;
  --green: #2f9e6f;
  --green-soft: #e8f6ef;

  min-height: 100vh;
  max-width: 1720px;
  margin: 0 auto;

  padding: 28px 32px 56px;
  color: var(--ink);
  font-size: 14px;
  line-height: 1.5;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC",
    "Hiragino Sans GB", "Microsoft YaHei", system-ui, sans-serif;
  background-color: #ffffff;
  background-image: radial-gradient(
    900px 320px at 50% -160px,
    #f3f8fc 0%,
    rgba(243, 248, 252, 0) 70%
  );
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.breadcrumb {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: -18px;
  font-size: 13px;
  color: var(--ink-3);
}
.breadcrumb span {
  transition: color 0.2s ease;
}
.breadcrumb strong {
  color: var(--ink);
  font-weight: 600;
  letter-spacing: 0.6px;
  position: relative;
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
  gap: 6px;
  height: 34px;
  padding: 0 14px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid transparent;
  border-radius: 9px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.top-action-bar button:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px -6px rgba(31, 42, 55, 0.22);
}
.top-action-bar button:active {
  transform: translateY(0);
  box-shadow: none;
}
.btn-green {
  background: var(--green-soft);
  color: var(--green);
  border-color: #d4ecdf;
}
.btn-green:hover {
  background: #d4ecdf;
}
.btn-blue-light {
  background: var(--ice-soft);
  color: var(--accent-2);
  border-color: #d4e4f0;
}
.btn-blue-light:hover {
  background: #d4e4f0;
}
.btn-teal {
  background: #f0fdfa;
  color: #0e9384;
  border-color: #ccfbf1;
}
.btn-teal:hover {
  background: #ccfbf1;
}
.btn-gray {
  background: #fff;
  color: var(--ink-2);
  border-color: var(--line);
}
.btn-gray:hover {
  background: var(--line-2);
  color: var(--ink);
}

/* ============ 筛选模块 ============ */
.filter-box {
  position: relative;
  padding: 22px 24px 16px;
  margin-bottom: 20px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 18px;
  box-shadow: 0 1px 2px rgba(31, 42, 55, 0.03),
    0 10px 28px -22px rgba(31, 42, 55, 0.22);
}
.filter-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px 20px;
}
.filter-item label {
  display: block;
  margin-bottom: 7px;
  font-size: 13px;
  font-weight: 500;
  color: var(--ink-2);
  letter-spacing: 0.3px;
}
.filter-item input {
  width: 100%;
  height: 40px;
  padding: 0 13px;
  font-size: 13.5px;
  color: var(--ink);
  background: #f8fbfd;
  border: 1px solid var(--line);
  border-radius: 10px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}
.filter-item input::placeholder {
  color: #b6bdc9;
}
.filter-item input:hover {
  border-color: #cdd9e4;
}
.filter-item input:focus {
  outline: none;
  border-color: var(--accent);
  background: #fff;
  box-shadow: 0 0 0 3px rgba(107, 143, 176, 0.12);
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
  font-size: 13.5px;
  font-weight: 500;
  border: 1px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-primary {
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%);
  color: #fff;
  box-shadow: 0 8px 18px -8px rgba(79, 114, 149, 0.75);
}
.btn-primary:hover {
  background: linear-gradient(135deg, var(--accent-2) 0%, #3d5a77 100%);
}
.btn-primary:active {
  transform: translateY(1px);
}
.btn-default {
  background: #fff;
  color: var(--ink-2);
  border-color: var(--line);
}
.btn-default:hover {
  background: var(--accent-soft);
  border-color: var(--accent);
  color: var(--accent-2);
}
.more-filter-toggle {
  width: fit-content;
  margin: 14px auto 0;
  padding: 6px 16px;
  font-size: 13px;
  color: var(--accent-2);
  border-radius: 999px;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s ease, color 0.2s ease;
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
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(31, 42, 55, 0.03),
    0 10px 28px -22px rgba(31, 42, 55, 0.22);
  transition: transform 0.25s ease, box-shadow 0.25s ease,
    border-color 0.25s ease;
}
.station-card:hover {
  transform: translateY(-2px);
  border-color: #d7e0ea;
  box-shadow: 0 2px 4px rgba(31, 42, 55, 0.04),
    0 18px 40px -22px rgba(31, 42, 55, 0.3);
}

/* ---- 卡片头部 ---- */
.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;

  padding: 20px 22px 18px;
  background: linear-gradient(180deg, #fbfcfe 0%, #ffffff 100%);
  border-bottom: 1px solid var(--line-2);
}
.station-title {
  flex: 1;
  min-width: 0;
}
.station-title h2 {
  display: flex;
  align-items: center;

  gap: 4px;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.35;
  letter-spacing: 0.2px;
  color: var(--ink);
}
.station-title h2 > span {
  font-weight: 400;
  color: var(--ink-4);

  transition: transform 0.2s ease, color 0.2s ease;
}
.station-card:hover .station-title h2 > span {
  color: var(--accent);
  transform: translateX(2px);
}
.station-title .id-text,
.station-title .operator-text {
  margin-top: 6px;
  font-size: 12.5px;

  line-height: 1.5;
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

  padding: 3px 8px;
  margin-bottom: 10px;
  font-size: 10px;
  font-weight: 500;
  color: #b54708;
  background: #fffaeb;
  border: 1px solid #fdead7;
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

  padding: 0 12px;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;

  transition: all 0.18s ease;
}
.btn-solid-red {
  background: var(--danger);
  color: #fff;
  box-shadow: 0 6px 14px -8px rgba(192, 85, 74, 0.95);
}
.btn-solid-red:hover {
  background: var(--danger-dark);
}
.btn-solid-blue {
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%);
  color: #fff;
  box-shadow: 0 6px 14px -8px rgba(79, 114, 149, 0.95);
}
.btn-solid-blue:hover {
  background: linear-gradient(135deg, var(--accent-2) 0%, #3d5a77 100%);
}
.btn-outline-blue {
  color: var(--accent-2);
  background: #fff;

  color: var(--accent-2);
  border-color: #d4e4f0;
}
.btn-outline-blue:hover {
  background: var(--accent-soft);
  border-color: var(--accent);
}

.more-dropdown {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  position: relative;
}
.more-dropdown > button {
  height: 30px;

  padding: 0 12px;
  font-size: 13px;

  color: var(--ink-2);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;

  transition: all 0.18s ease;
}
.more-dropdown > button:hover {
  background: var(--line-2);
  color: var(--ink);
}
.dropdown-menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 20;
  width: 136px;
  padding: 6px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 12px;
  box-shadow: 0 16px 36px -16px rgba(31, 42, 55, 0.32);
  animation: dropIn 0.16s ease;
}
.dropdown-menu div {
  padding: 8px 10px;
  font-size: 13px;
  color: var(--ink-2);
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.16s ease, color 0.16s ease;
}
.dropdown-menu div:hover {
  background: var(--line-2);
  color: var(--ink);
}
.dropdown-menu div:last-child {
  color: var(--danger);
}
.dropdown-menu div:last-child:hover {
  background: var(--danger-soft);
}

.gun-summary-bar {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
  padding: 16px 22px;
  border-bottom: 1px solid var(--line-2);
}
.gun-item {
  padding: 10px 4px;
  text-align: center;
  border-radius: 10px;
  transition: transform 0.2s ease;
}
.gun-item:hover {
  transform: translateY(-1px);
}
.gun-idle {
  background: var(--green-soft);
  color: var(--green);
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
  background: var(--danger-soft);
  color: var(--danger);
}
.gun-stop {
  background: var(--warm-soft);
  color: var(--warm);
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
}

/* ---- 卡片详情 ---- */
.card-body {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px 24px;
  padding: 20px 22px 24px;
}
.info-cell h4 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;

  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.2px;
  color: var(--ink-3);
}
.edit-link {
  flex-shrink: 0;

  font-size: 12.5px;
  font-weight: 500;
  color: var(--accent-2);
  cursor: pointer;
  transition: opacity 0.2s ease;
}
.edit-link:hover {
  text-decoration: underline;
}
.info-content {
  font-size: 13.5px;
  line-height: 1.75;
  color: var(--ink-2);
  word-break: break-all;
}
.status-badge {
  display: inline-block;

  padding: 3px 9px;
  margin-bottom: 8px;
  font-size: 12.5px;
  font-weight: 500;
  line-height: 1.6;
  border-radius: 6px;
}
.badge-green {
  background: var(--green-soft);
  color: var(--green);
}
.badge-orange {
  background: var(--warm-soft);
  color: var(--warm);
}
.price-card {
  padding: 14px 16px;
  background: linear-gradient(135deg, #f3f8fc 0%, #fbfdff 100%);
  border: 1px solid #dfe9f1;
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

  transition: opacity 0.2s ease;
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
  background: #fff;
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

  background: rgba(31, 42, 55, 0.45);
  backdrop-filter: blur(2px);
}
.modal-box {
  width: 440px;
  max-width: 100%;
  padding: 24px;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 24px 64px -24px rgba(31, 42, 55, 0.5);
  animation: modalIn 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}
.modal-title {
  margin-bottom: 12px;
  font-size: 17px;
  font-weight: 600;
  color: var(--ink);
}
.modal-desc {
  margin-bottom: 24px;
  font-size: 13.5px;
  line-height: 1.75;
  color: var(--ink-2);
}
.modal-btn-group {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.modal-btn-cancel {
  height: 38px;

  padding: 0 20px;
  font-size: 13.5px;

  color: var(--ink-2);
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.18s ease;
}
.modal-btn-cancel:hover {
  background: var(--accent-soft);
  border-color: var(--accent);
  color: var(--accent-2);
}
.modal-btn-confirm {
  height: 38px;
  padding: 0 20px;
  font-size: 13.5px;
  font-weight: 500;
  color: #fff;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.18s ease;
}
.confirm-red {
  background: var(--danger);
  box-shadow: 0 8px 18px -10px rgba(192, 85, 74, 0.95);
}
.confirm-red:hover {
  background: var(--danger-dark);
}
.confirm-blue {
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%);
  box-shadow: 0 8px 18px -10px rgba(79, 114, 149, 0.95);
}
.confirm-blue:hover {
  background: linear-gradient(135deg, var(--accent-2) 0%, #3d5a77 100%);
}

/* ============ Toast ============ */
.toast {
  position: fixed;
  left: 50%;
  bottom: 40px;
  z-index: 1000;
  padding: 11px 22px;
  font-size: 13.5px;
  color: #fff;
  background: rgba(31, 42, 55, 0.92);
  border-radius: 999px;
  box-shadow: 0 16px 32px -12px rgba(31, 42, 55, 0.65);
  transform: translateX(-50%);
  animation: toastIn 0.24s ease;
}

/* ============ 动画 ============ */
@keyframes dropIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes modalIn {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
@keyframes toastIn {
  from {
    opacity: 0;
    transform: translate(-50%, 10px);
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
    padding: 24px 20px 48px;
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
}
</style>
