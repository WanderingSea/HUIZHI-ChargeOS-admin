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
        <button
          class="action-btn download-btn"
          @click="showDownloadCenter = true"
        >
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
        <button
          class="msg-btn"
          @click="$router.push('/workbench/index')"
          title="首页"
        >
          <i class="el-icon-s-home"></i>
        </button>
        <button class="msg-btn" @click="handleGo('暂无消息')">
          <i class="el-icon-bell"></i><span class="msg-dot"></span>
        </button>
      </div>
    </div>
    <div class="breadcrumb">
      <span>统计中心</span><span class="sep">></span><span>运营商统计</span
      ><span class="sep">></span><span>终端对比</span><span class="sep">></span
      ><span class="bc-active">终端对比列表</span>
    </div>
    <div class="warn-tip-bar">
      <i class="el-icon-warning-outline"></i
      >温馨提示：由于统计数据量过大，默认显示当天统计数据，需要查看其他数据请使用查询功能。
    </div>
    <div class="filter-card">
      <div class="filter-row">
        <div class="filter-item">
          <label class="filter-label">对比时间</label>
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
          <label class="filter-label">对比终端</label>
          <el-select
            v-model="filter.terminals"
            multiple
            collapse-tags
            collapse-tags-tooltip
            placeholder="请选择终端(最多5个)"
            size="default"
            style="width: 360px"
            multiple-limit="5"
          >
            <el-option label="TXXHL05-A" value="1" /><el-option
              label="TXXHL05-B"
              value="2"
            /><el-option label="TXXHL06-A" value="3" /><el-option
              label="TXXHL06-B"
              value="4"
            /><el-option label="TXXHL08-B" value="5" />
          </el-select>
        </div>
        <div class="filter-actions">
          <el-button type="primary" size="default" @click="handleFilter"
            ><i class="el-icon-search"></i>对比</el-button
          >
          <el-button size="default" @click="handleReset">恢复默认</el-button>
        </div>
      </div>
    </div>
    <div class="table-card">
      <div class="table-header">
        <div class="table-title-wrap">
          <span class="table-title">终端对比分析表</span>
          <el-tooltip content="报表统计口径说明" placement="top"
            ><span class="table-tip-link"
              >报表统计口径说明 <i class="el-icon-question"></i></span
          ></el-tooltip>
        </div>
        <div class="table-tools">
          <button class="export-simple-btn" @click="doExportTable">
            <i class="el-icon-download"></i>导出
          </button>
        </div>
      </div>
      <el-table
        :data="tableData"
        stripe
        style="width: 100%"
        :header-cell-style="{
          background: '#fafbfc',
          color: '#606266',
          fontWeight: 500,
        }"
      >
        <el-table-column
          label="对比指标"
          prop="metric"
          min-width="160"
          fixed="left"
        />
        <el-table-column
          v-for="t in terminalCols"
          :key="t.key"
          :label="t.name"
          :prop="t.key"
          min-width="150"
          align="center"
        />
        <el-table-column
          label="差值(最高-最低)"
          prop="diff"
          min-width="140"
          align="center"
          fixed="right"
        />
      </el-table>
    </div>
    <div class="page-footer">
      <span>备案号：苏ICP备17010210号</span
      ><span>Copyright©2016Co.,Ltd.All Rights Reserved</span
      ><span>版权所有：江苏云快充新能源科技有限公司</span>
    </div>

    <download-center-dialog :visible.sync="showDownloadCenter" />
  </div>
</template>
<script>
import DownloadCenterDialog from "../../components/DownloadCenterDialog.vue";
import { exportToCSV } from "../../utils/exportCSV";

export default {
  name: "OpsTerminalCompare",
  components: { DownloadCenterDialog },
  data() {
    return {
      activeTopTab: "ops-terminal-compare",
      currentUser: "TXJXGS01",
      dateStart: "2026-08-19",
      dateEnd: "2026-08-19",
      showDownloadCenter: false,
      filter: { terminals: ["1", "2", "3"] },
      terminalCols: [
        { key: "t1", name: "TXXHL05-A" },
        { key: "t2", name: "TXXHL05-B" },
        { key: "t3", name: "TXXHL06-A" },
      ],
      tableData: [
        {
          metric: "总充电量(度)",
          t1: "8.79",
          t2: "37.15",
          t3: "33.80",
          diff: "28.36",
        },
        { metric: "充电次数(次)", t1: "1", t2: "1", t3: "1", diff: "0" },
        {
          metric: "充电时长(小时)",
          t1: "0.20",
          t2: "0.88",
          t3: "0.97",
          diff: "0.77",
        },
        {
          metric: "电费(元)",
          t1: "4.13",
          t2: "17.46",
          t3: "15.88",
          diff: "13.33",
        },
        {
          metric: "服务费(元)",
          t1: "0.43",
          t2: "1.85",
          t3: "1.68",
          diff: "1.42",
        },
        {
          metric: "订单总金额(元)",
          t1: "4.56",
          t2: "19.31",
          t3: "17.56",
          diff: "14.75",
        },
        {
          metric: "平均功率(kW)",
          t1: "43.95",
          t2: "42.22",
          t3: "34.85",
          diff: "9.10",
        },
        {
          metric: "在线率(%)",
          t1: "99.8%",
          t2: "99.5%",
          t3: "100%",
          diff: "0.5%",
        },
      ],
    };
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
      this.filter = { terminals: ["1", "2", "3"] };
    },
    doExportTable() {
      const dynamicCols = this.terminalCols.map((tc) => ({
        label: tc.name,
        prop: tc.key,
      }));
      const columns = [
        { label: "对比指标", prop: "metric" },
        ...dynamicCols,
        { label: "差值", prop: "diff" },
      ];
      exportToCSV(columns, this.tableData, "终端对比", {
        pageName: "终端维度对比",
      });
    },
    handleExport() {
      this.showDownloadCenter = true;
    },
    handleMobile() {
      alert("请使用手机扫描二维码访问移动端");
    },
    handleGo(msg) {
      alert(msg);
    },
    goDashboard() {
      this.$router.push("/dashboard");
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
.el-button {
  padding: 7px 20px;
  font-size: 14px;
  border-radius: 18px;
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
