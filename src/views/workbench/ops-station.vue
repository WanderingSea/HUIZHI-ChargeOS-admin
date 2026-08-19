<template>
  <div class="statistics-page">
    <div class="top-tabs">
      <div
        class="tab-item"
        :class="{ active: activeTopTab === 'overview' }"
        @click="$router.push('/workbench/index')"
      >
        经营总览
      </div>
      <el-dropdown trigger="click" @command="handleOpsCmd">
        <div
          class="tab-item dropdown-tab"
          :class="{ active: activeTopTab.startsWith('ops') }"
        >
          运营商统计<i class="el-icon-arrow-down arrow-down"></i>
        </div>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="period">时期统计</el-dropdown-item>
          <el-dropdown-item command="hour">小时统计</el-dropdown-item>
          <el-dropdown-item command="operator">运营商统计</el-dropdown-item>
          <el-dropdown-item command="station">电站统计</el-dropdown-item>
          <el-dropdown-item command="terminal">终端统计</el-dropdown-item>
          <el-dropdown-item command="station-compare"
            >站点对比</el-dropdown-item
          >
          <el-dropdown-item command="terminal-compare"
            >终端对比</el-dropdown-item
          >
        </el-dropdown-menu>
      </el-dropdown>
      <el-dropdown trigger="click" @command="handleOrgCmd">
        <div
          class="tab-item dropdown-tab"
          :class="{ active: activeTopTab.startsWith('org') }"
        >
          机构统计<i class="el-icon-arrow-down arrow-down"></i>
        </div>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="period">时期统计</el-dropdown-item>
          <el-dropdown-item command="stat">机构统计</el-dropdown-item>
          <el-dropdown-item command="compare">机构对比</el-dropdown-item>
          <el-dropdown-item command="user-compare">用户对比</el-dropdown-item>
          <el-dropdown-item command="user-stat">用户统计</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <div class="top-right-actions">
        <button class="overview-btn" @click="goDashboard">
          <i class="el-icon-data-analysis"></i>
          总览
        </button>
        <button class="action-btn platform-btn" @click="goDashboard">
          <i class="el-icon-data-analysis"></i>
          平台规则
        </button>
        <button class="action-btn download-btn" @click="handleExport">
          <i class="el-icon-download"></i>
          下载中心
        </button>
        <button class="action-btn outline-btn" @click="handleMobile">
          <i class="el-icon-mobile-phone"></i>
          手机端
        </button>
        <el-dropdown trigger="click"
          ><div class="user-info">
            <span class="user-name">{{ currentUser }}</span
            ><i class="el-icon-arrow-down arrow-down"></i>
          </div>
          <el-dropdown-menu slot="dropdown"
            ><el-dropdown-item @click.native="handleGo('个人中心')"
              >个人中心</el-dropdown-item
            ><el-dropdown-item @click.native="handleGo('退出登录')"
              >退出登录</el-dropdown-item
            ></el-dropdown-menu
          >
        </el-dropdown>
        <button class="msg-btn" @click="handleGo('暂无消息')">
          <i class="el-icon-bell"></i><span class="msg-dot"></span>
        </button>
      </div>
    </div>
    <div class="breadcrumb">
      <span>统计中心</span><span class="sep">></span><span>运营商统计</span
      ><span class="sep">></span><span>电站统计</span><span class="sep">></span
      ><span class="bc-active">电站统计列表</span>
    </div>
    <div class="warn-tip-bar">
      <i class="el-icon-warning-outline"></i
      >温馨提示：由于统计数据量过大，默认显示当天统计数据，需要查看其他数据请使用查询功能。
    </div>
    <div class="filter-card">
      <div class="filter-row">
        <div class="filter-item">
          <label class="filter-label">订单结算时间</label>
          <el-date-picker
            v-model="dateStart"
            type="date"
            value-format="yyyy-MM-dd"
            size="default"
            style="width: 160px"
          />
          <span class="filter-sep">至</span>
          <el-date-picker
            v-model="dateEnd"
            type="date"
            value-format="yyyy-MM-dd"
            size="default"
            style="width: 160px"
          />
        </div>
        <div class="filter-item">
          <label class="filter-label">电站名称</label>
          <el-input
            v-model="filter.stationName"
            placeholder="请输入电站名称"
            size="default"
            style="width: 240px"
            clearable
          />
        </div>
        <div class="filter-item">
          <label class="filter-label">运营商</label>
          <el-select
            v-model="filter.operator"
            placeholder="全部运营商"
            size="default"
            style="width: 180px"
            clearable
          >
            <el-option label="同星新能源" value="1" /><el-option
              label="星星充电"
              value="2"
            /><el-option label="特来电" value="3" /><el-option
              label="国家电网"
              value="4"
            />
          </el-select>
        </div>
        <div class="filter-actions">
          <el-button type="primary" size="default" @click="handleFilter"
            ><i class="el-icon-search"></i>筛选</el-button
          >
          <el-button size="default" @click="handleReset">恢复默认</el-button>
        </div>
      </div>
      <div class="more-filter-wrap">
        <span class="more-filter-btn" @click="showMore = !showMore"
          >更多筛选
          <i :class="showMore ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i
        ></span>
      </div>
      <div v-show="showMore" class="filter-row more-row">
        <div class="filter-item">
          <label class="filter-label">电站类型</label>
          <el-select
            v-model="filter.stationType"
            placeholder="全部类型"
            size="default"
            style="width: 160px"
            clearable
          >
            <el-option label="公共站" value="public" /><el-option
              label="专用站"
              value="private"
            /><el-option label="专用对外" value="private-out" />
          </el-select>
        </div>
        <div class="filter-item">
          <label class="filter-label">所在地区</label>
          <el-input
            v-model="filter.area"
            placeholder="请输入地区"
            size="default"
            style="width: 200px"
            clearable
          />
        </div>
      </div>
    </div>
    <div class="table-card">
      <div class="table-header">
        <div class="table-title-wrap">
          <span class="table-title">电站维度统计表</span>
          <el-tooltip content="报表统计口径说明" placement="top"
            ><span class="table-tip-link"
              >报表统计口径说明 <i class="el-icon-question"></i></span
          ></el-tooltip>
        </div>
        <div class="table-tools">
          <button class="export-simple-btn" @click="handleExport">
            <i class="el-icon-download"></i>导出
          </button>
        </div>
      </div>
      <el-table
        :data="pagedTableData"
        stripe
        style="width: 100%"
        :header-cell-style="{
          background: '#fafbfc',
          color: '#606266',
          fontWeight: 500,
        }"
      >
        <el-table-column
          label="电站名称"
          prop="stationName"
          min-width="200"
          fixed="left"
        />
        <el-table-column
          label="电站ID"
          prop="id"
          min-width="100"
          align="center"
        />
        <el-table-column label="运营商" prop="operator" min-width="160" />
        <el-table-column
          label="终端数量"
          prop="terminalCount"
          min-width="100"
          sortable
          align="center"
        />
        <el-table-column
          label="电量(度)"
          prop="totalPower"
          min-width="120"
          sortable
          align="center"
        />
        <el-table-column
          label="充电时长(小时)"
          prop="chargeHours"
          min-width="130"
          sortable
          align="center"
        />
        <el-table-column
          label="充电次数(次)"
          prop="totalCount"
          min-width="120"
          sortable
          align="center"
        />
        <el-table-column
          label="电费(元)"
          prop="elecFee"
          min-width="110"
          sortable
          align="center"
        />
        <el-table-column
          label="服务费(元)"
          prop="serviceFee"
          min-width="110"
          sortable
          align="center"
        />
        <el-table-column
          label="订单总金额(元)"
          prop="totalMoney"
          min-width="130"
          sortable
          align="center"
        />
        <el-table-column
          label="可用率(%)"
          prop="availableRate"
          min-width="100"
          sortable
          align="center"
          fixed="right"
        />
      </el-table>
      <div class="pagination-bar">
        <button
          class="page-btn"
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          上一页
        </button>
        <button
          v-for="p in pageNumbers"
          :key="p"
          class="page-num"
          :class="{ active: currentPage === p }"
          @click="currentPage = p"
        >
          {{ p }}
        </button>
        <button
          class="page-btn"
          :disabled="currentPage === maxPage"
          @click="currentPage++"
        >
          下一页
        </button>
        <span class="jump-text">跳至</span
        ><el-input
          v-model="jumpPage"
          size="small"
          style="width: 50px; margin: 0 6px"
        /><span class="jump-text">页</span>
        <span class="total-text"
          >共 <b>{{ tableData.length }}</b> 条</span
        >
        <span class="size-text">每页</span>
        <el-select
          v-model="pageSize"
          size="small"
          style="width: 60px; margin: 0 6px"
        >
          <el-option label="10" :value="10" /><el-option
            label="20"
            :value="20"
          /><el-option label="50" :value="50" /><el-option
            label="100"
            :value="100"
          /> </el-select
        ><span class="size-text">条</span>
      </div>
    </div>
    <div class="page-footer">
      <span>备案号：苏ICP备17010210号</span
      ><span>Copyright©2016Co.,Ltd.All Rights Reserved</span
      ><span>版权所有：江苏云快充新能源科技有限公司</span>
    </div>
  </div>
</template>
<script>
export default {
  name: "OpsStation",
  data() {
    return {
      activeTopTab: "ops-station",
      currentUser: "TXJXGS01",
      dateStart: "2026-08-19",
      dateEnd: "2026-08-19",
      showMore: false,
      filter: { stationName: "", operator: "", stationType: "", area: "" },
      currentPage: 1,
      pageSize: 10,
      jumpPage: 1,
      tableData: [
        {
          stationName: "同星旭智充电站",
          id: 439830,
          operator: "同星新能源",
          terminalCount: 8,
          totalPower: 11342.72,
          chargeHours: 358.22,
          totalCount: 380,
          elecFee: 7478.4,
          serviceFee: 565.04,
          totalMoney: 7043.47,
          availableRate: 99.99,
        },
        {
          stationName: "同星东马坊充电站",
          id: 283613,
          operator: "同星新能源",
          terminalCount: 6,
          totalPower: 9830.42,
          chargeHours: 298.11,
          totalCount: 206,
          elecFee: 5461.8,
          serviceFee: 480.02,
          totalMoney: 5941.9,
          availableRate: 44.82,
        },
        {
          stationName: "同星南桥里充电站",
          id: 347832,
          operator: "同星新能源",
          terminalCount: 4,
          totalPower: 0,
          chargeHours: 0,
          totalCount: 0,
          elecFee: 0,
          serviceFee: 0,
          totalMoney: 0,
          availableRate: 0,
        },
        {
          stationName: "星星充电-南京南站",
          id: 551230,
          operator: "星星充电",
          terminalCount: 20,
          totalPower: 15230.18,
          chargeHours: 482.33,
          totalCount: 512,
          elecFee: 9030.4,
          serviceFee: 782.15,
          totalMoney: 9812.6,
          availableRate: 98.12,
        },
        {
          stationName: "星星充电-苏州新区",
          id: 551231,
          operator: "星星充电",
          terminalCount: 12,
          totalPower: 8762.33,
          chargeHours: 275.1,
          totalCount: 301,
          elecFee: 5230.7,
          serviceFee: 420.05,
          totalMoney: 5650.8,
          availableRate: 86.45,
        },
      ],
    };
  },
  computed: {
    maxPage() {
      return Math.max(1, Math.ceil(this.tableData.length / this.pageSize));
    },
    pageNumbers() {
      const a = [];
      for (let i = 1; i <= this.maxPage; i++) a.push(i);
      return a;
    },
    pagedTableData() {
      const s = (this.currentPage - 1) * this.pageSize;
      return this.tableData.slice(s, s + this.pageSize);
    },
  },
  methods: {
    handleOpsCmd(cmd) {
      const map = {
        period: "/workbench/ops/period",
        hour: "/workbench/ops/hour",
        operator: "/workbench/ops/operator",
        station: "/workbench/ops/station",
        terminal: "/workbench/ops/terminal",
        "station-compare": "/workbench/ops/station-compare",
        "terminal-compare": "/workbench/ops/terminal-compare",
      };
      if (map[cmd]) this.$router.push(map[cmd]);
    },
    handleOrgCmd(cmd) {
      const map = {
        period: "/workbench/org/period",
        stat: "/workbench/org/stat",
        compare: "/workbench/org/compare",
        "user-compare": "/workbench/org/user-compare",
        "user-stat": "/workbench/org/user-stat",
      };
      if (map[cmd]) this.$router.push(map[cmd]);
    },
    handleFilter() {},
    handleReset() {
      this.dateStart = "2026-08-19";
      this.dateEnd = "2026-08-19";
      this.filter = {
        stationName: "",
        operator: "",
        stationType: "",
        area: "",
      };
      this.showMore = false;
      this.currentPage = 1;
    },
    handleExport() {
      alert("导出功能");
    },
    handleMobile() {
      alert("请使用手机扫描二维码访问移动端");
    },
    handleGo(msg) {
      alert(msg);
    },
  },
};
</script>
<style scoped>
.statistics-page {
  min-height: 100vh;
  background: #f4f6f9;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC",
    "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif;
  color: #303133;
}
.top-tabs {
  display: flex;
  align-items: center;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 0 20px;
  position: sticky;
  top: 0;
  z-index: 100;
  height: 50px;
}
.tab-item {
  padding: 0 20px;
  font-size: 14px;
  color: #606266;
  height: 50px;
  line-height: 50px;
  cursor: pointer;
  position: relative;
  transition: color 0.2s;
  user-select: none;
  display: flex;
  align-items: center;
}
.tab-item > * + * {
  margin-left: 4px;
}
.tab-item:hover {
  color: #4078f5;
}
.tab-item.active {
  color: #303133;
  font-weight: 500;
}
.tab-item.active::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 20px;
  right: 20px;
  height: 2px;
  background: #4078f5;
}
.dropdown-tab .arrow-down {
  font-size: 12px;
}
.top-right-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
}
.top-right-actions > * + * {
  margin-left: 12px;
}
.action-btn,
.overview-btn,
.export-simple-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.22s ease;
  border: 1px solid transparent;
  height: 36px;
  padding: 0 16px;
  background: #ffffff;
  white-space: nowrap;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.overview-btn {
  background: linear-gradient(135deg, #4078f5, #5a8df7);
  color: #fff;
  border-color: rgba(64, 120, 245, 0.8);
  box-shadow: 0 2px 8px rgba(64, 120, 245, 0.35);
}

.overview-btn:hover {
  transform: translateY(-1px);
  background: linear-gradient(135deg, #3368dd, #4078f5);
  box-shadow: 0 4px 12px rgba(64, 120, 245, 0.45);
}

.download-btn,
.platform-btn,
.outline-btn {
  color: #4078f5;
  border-color: #b4c8f2;
  background: rgba(255, 255, 255, 0.9);
}

.download-btn:hover,
.platform-btn:hover,
.outline-btn:hover {
  transform: translateY(-1px);
  background: rgba(64, 120, 245, 0.06);
  border-color: #4078f5;
  box-shadow: 0 4px 12px rgba(64, 120, 245, 0.12);
}

.export-simple-btn:hover {
  color: #4078f5;
  border-color: #4078f5;
  background: rgba(64, 120, 245, 0.06);
  box-shadow: 0 4px 12px rgba(64, 120, 245, 0.12);
}

.user-info {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #606266;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
}
.user-info > * + * {
  margin-left: 6px;
}
.user-info:hover {
  background: #f5f7fa;
  color: #4078f5;
}
.user-name {
  font-weight: 500;
}
.msg-btn {
  position: relative;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #606266;
}
.msg-btn:hover {
  background: #f5f7fa;
  color: #4078f5;
}
.msg-dot {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f56c6c;
  border: 1px solid #fff;
}

.breadcrumb {
  font-size: 12px;
  color: #909399;
  padding: 14px 20px 6px;
}
.breadcrumb .sep {
  margin: 0 8px;
}
.bc-active {
  color: #4078f5;
}
.warn-tip-bar {
  margin: 6px 20px 0;
  padding: 10px 16px;
  background: #fff6e6;
  border: 1px solid #ffe2b8;
  border-radius: 4px;
  color: #c45600;
  font-size: 13px;
  display: flex;
  align-items: center;
}
.warn-tip-bar > i {
  margin-right: 6px;
  color: #fa8c16;
}
.filter-card {
  margin: 12px 20px 0;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 18px 20px 6px;
}
.filter-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 10px;
}
.filter-row > * + * {
  margin-left: 16px;
}
.filter-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}
.filter-label {
  font-size: 13px;
  color: #606266;
  margin-right: 8px;
  white-space: nowrap;
}
.filter-sep {
  margin: 0 8px;
  color: #909399;
  font-size: 13px;
}
.filter-actions {
  display: flex;
  margin-left: auto;
  margin-bottom: 12px;
}
.filter-actions > * + * {
  margin-left: 8px;
}
.more-filter-wrap {
  text-align: center;
  padding: 8px 0 14px;
}
.more-filter-btn {
  font-size: 13px;
  color: #4078f5;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
}
.more-filter-btn > i {
  margin-left: 4px;
}
.more-row {
  padding-top: 6px;
  border-top: 1px dashed #ebeef5;
}
.table-card {
  margin: 16px 20px 0;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 16px 20px 18px;
}
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 10px 16px;
  background: #f5f7fa;
  border-radius: 4px;
}
.table-title-wrap {
  display: flex;
  align-items: center;
}
.table-title-wrap > * + * {
  margin-left: 10px;
}
.table-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}
.table-tip-link {
  font-size: 12px;
  color: #4078f5;
  cursor: help;
}

.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 16px;
  padding-top: 14px;
  flex-wrap: wrap;
  font-size: 13px;
  color: #606266;
}
.pagination-bar > * + * {
  margin-left: 8px;
}
.page-btn,
.page-num {
  min-width: 32px;
  height: 32px;
  padding: 0 12px;
  border: 1px solid #dcdfe6;
  background: #fff;
  color: #606266;
  font-size: 13px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}
.page-btn:hover:not(:disabled),
.page-num:hover {
  color: #4078f5;
  border-color: #c6e2ff;
  background: #ecf5ff;
}
.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.page-num {
  padding: 0 10px;
}
.page-num.active {
  background: #4078f5;
  border-color: #4078f5;
  color: #fff;
}
.jump-text,
.total-text,
.size-text {
  font-size: 13px;
  color: #606266;
}
.total-text b {
  color: #303133;
  margin: 0 2px;
}
.page-footer {
  margin-top: 32px;
  padding: 18px 20px;
  background: #fafbfc;
  border-top: 1px solid #ebeef5;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  font-size: 12px;
  color: #909399;
}
.page-footer > * + * {
  margin-left: 40px;
}
</style>
