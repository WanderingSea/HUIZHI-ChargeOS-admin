<template>
  <div class="statistics-page">
    <div class="top-tabs">
      <div
        class="tab-item"
        :class="{ active: activeTopTab === 'overview' }"
        @click="activeTopTab = 'overview'"
      >
        经营总览
      </div>
      <el-dropdown trigger="click" @command="(cmd) => (activeTopTab = cmd)">
        <div
          class="tab-item dropdown-tab"
          :class="{ active: activeTopTab.startsWith('ops') }"
        >
          运营商统计
          <i class="el-icon-arrow-down arrow-down"></i>
        </div>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="ops-1">运营商统计-概览</el-dropdown-item>
          <el-dropdown-item command="ops-2">运营商统计-明细</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-dropdown trigger="click" @command="(cmd) => (activeTopTab = cmd)">
        <div
          class="tab-item dropdown-tab"
          :class="{ active: activeTopTab.startsWith('org') }"
        >
          机构统计
          <i class="el-icon-arrow-down arrow-down"></i>
        </div>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="org-1">机构统计-概览</el-dropdown-item>
          <el-dropdown-item command="org-2">机构统计-明细</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>

      <div class="top-right-actions">
        <button class="overview-btn" @click="goDashboard">
          <i class="el-icon-data-analysis"></i>
          总览
        </button>
        <button class="action-btn download-btn" @click="handleExport">
          <i class="el-icon-download"></i>
          下载中心
        </button>
        <button class="action-btn outline-btn" @click="handleMobile">
          <i class="el-icon-mobile-phone"></i>
          手机端
        </button>
        <el-dropdown trigger="click">
          <div class="user-info">
            <span class="user-name">{{ currentUser }}</span>
            <i class="el-icon-arrow-down arrow-down"></i>
          </div>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click.native="handleGo('个人中心')"
              >个人中心</el-dropdown-item
            >
            <el-dropdown-item @click.native="handleGo('退出登录')"
              >退出登录</el-dropdown-item
            >
          </el-dropdown-menu>
        </el-dropdown>
        <button class="msg-btn" @click="handleGo('暂无消息')" title="消息">
          <i class="el-icon-bell"></i>
          <span class="msg-dot"></span>
        </button>
      </div>
    </div>

    <div class="breadcrumb">
      <span>统计中心</span>
      <span class="sep">></span>
      <span>经营总览</span>
      <span class="sep">></span>
      <span class="bc-active">经营总览</span>
    </div>

    <div class="filter-bar">
      <el-select
        v-model="selectStation"
        placeholder="全部电站"
        size="default"
        style="width: 160px"
      >
        <el-option label="全部电站" value=""></el-option>
        <el-option label="同星旭智充电站" value="1"></el-option>
        <el-option label="同星东马坊充电站" value="2"></el-option>
        <el-option label="同星南桥里充电站" value="3"></el-option>
      </el-select>

      <div class="time-btn-group">
        <el-button
          type="primary"
          plain
          size="default"
          :class="{ 'btn-solid': timeType === '7' }"
          @click="changeTime('7')"
          >近7天</el-button
        >
        <el-button
          type="primary"
          plain
          size="default"
          :class="{ 'btn-solid': timeType === '30' }"
          @click="changeTime('30')"
          >近30天</el-button
        >
        <el-button
          type="primary"
          plain
          size="default"
          :class="{ 'btn-solid': timeType === '12' }"
          @click="changeTime('12')"
          >近12月</el-button
        >
        <el-button
          type="primary"
          plain
          size="default"
          :class="{ 'btn-solid': timeType === 'custom' }"
          @click="showCustomDate = true"
          >自定义</el-button
        >
      </div>
    </div>

    <div class="card-row">
      <div class="data-card">
        <div class="card-header">
          <span class="card-title">核心指标</span>
          <el-tooltip content="昨日数据，在第2日早8点更新" placement="top">
            <span class="tip-icon" title="说明">?</span>
          </el-tooltip>
          <span class="warm-tip">温馨提示：昨日数据，在第2日早8点更新</span>
        </div>

        <div class="kpi-row">
          <div
            v-for="(k, idx) in leftKpiList"
            :key="k.label"
            class="kpi-item"
            :class="{ active: idx === 0 }"
          >
            <div class="kpi-num">{{ k.num }}</div>
            <div class="kpi-label">{{ k.label }}</div>
            <div v-if="idx === 0" class="kpi-underline"></div>
          </div>
        </div>

        <div ref="chartLeft" class="chart-box"></div>
      </div>

      <div class="data-card">
        <div class="card-header">
          <span class="card-title">设备分析</span>
          <el-tooltip
            content="设备统计指标（所有未删除并且通过审核的设备）"
            placement="top"
          >
            <span class="tip-icon" title="说明">?</span>
          </el-tooltip>
        </div>

        <div class="kpi-row">
          <div
            v-for="(k, idx) in rightKpiList"
            :key="k.label"
            class="kpi-item"
            :class="{ active: idx === 0 }"
          >
            <div class="kpi-num">{{ k.num }}</div>
            <div class="kpi-label">{{ k.label }}</div>
            <div v-if="idx === 0" class="kpi-underline"></div>
          </div>
        </div>

        <div ref="chartRight" class="chart-box"></div>
      </div>
    </div>

    <div class="table-card">
      <div class="table-header">
        <div class="table-title-wrap">
          <span class="table-title">电站数据</span>
          <span class="table-tip">
            订单统计范围即结算时间在所选时段内的订单，设备统计范围即所有未删除并且通过审核的设备
          </span>
        </div>
        <div class="table-tools">
          <button class="export-simple-btn" @click="handleExport">
            <i class="el-icon-download"></i>
            导出
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
        <el-table-column label="电站信息" min-width="180" fixed="left">
          <template slot-scope="{ row }">
            <div class="station-cell">
              <div class="station-name">{{ row.stationName }}</div>
              <div class="station-id">ID: {{ row.id }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="总充电量（度）"
          prop="totalPower"
          sortable
          align="center"
        />
        <el-table-column
          label="总充电次数"
          prop="totalCount"
          sortable
          align="center"
        />
        <el-table-column
          label="总充电金额（元）"
          prop="totalMoney"
          sortable
          align="center"
        />
        <el-table-column
          label="总充电服务费（元）"
          prop="serviceFee"
          sortable
          align="center"
        />
        <el-table-column
          label="枪日均电量（度）"
          prop="avgGunPower"
          sortable
          align="center"
        />
        <el-table-column
          label="可用率（%）"
          prop="availableRate"
          sortable
          align="center"
        >
          <template slot-scope="{ row }">
            <el-tag
              :type="
                row.availableRate >= 80
                  ? 'success'
                  : row.availableRate >= 50
                  ? 'warning'
                  : 'danger'
              "
              effect="plain"
              size="small"
              round
              >{{ row.availableRate }}%</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column
          label="利用率（%）"
          prop="useRate"
          sortable
          align="center"
        />
        <el-table-column
          label="故障率（%）"
          prop="faultRate"
          sortable
          align="center"
        >
          <template slot-scope="{ row }">
            <el-tag
              :type="row.faultRate === 0 ? 'success' : 'danger'"
              effect="plain"
              size="small"
              round
              >{{ row.faultRate }}%</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column
          label="离线率（%）"
          prop="offlineRate"
          sortable
          align="center"
          fixed="right"
        >
          <template slot-scope="{ row }">
            <el-tag
              :type="
                row.offlineRate <= 10
                  ? 'success'
                  : row.offlineRate <= 50
                  ? 'warning'
                  : 'danger'
              "
              effect="plain"
              size="small"
              round
              >{{ row.offlineRate }}%</el-tag
            >
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-bar">
        <div class="total-count">
          共 <b>{{ tableData.length }}</b> 条
        </div>
        <el-pagination
          :page-sizes="[10, 20, 50, 100]"
          :total="tableData.length"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
          background
        />
        <div class="jump-last">
          跳至
          <el-input-number
            v-model="jumpPage"
            :min="1"
            :max="maxPage"
            size="small"
            controls-position="right"
            style="width: 90px; margin: 0 6px"
          />
          页
          <el-button
            type="primary"
            plain
            size="small"
            @click="handleJump"
            style="margin-left: 8px"
            >确认</el-button
          >
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span>备案号：苏ICP备17010210号</span>
      <span>Copyright©2016Co.,Ltd.All Rights Reserved</span>
      <span>版权所有：江苏云快充新能源科技有限公司</span>
    </div>

    <el-dialog
      :visible.sync="showCustomDate"
      title="自定义时间范围"
      width="460px"
      append-to-body
    >
      <div class="date-picker-box">
        <el-date-picker
          v-model="customDateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd"
          size="large"
          style="width: 100%"
        />
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showCustomDate = false">取消</el-button>
        <el-button type="primary" @click="confirmCustomDate">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import * as echarts from "echarts";

export default {
  name: "WorkbenchOverview",
  data() {
    return {
      activeTopTab: "overview",
      zoomValue: 100,
      currentUser: "TXJXGS01",
      selectStation: "",
      timeType: "7",
      showCustomDate: false,
      customDateRange: [],
      currentPage: 1,
      pageSize: 10,
      jumpPage: 1,
      tableData: [
        {
          stationName: "同星旭智充电站",
          id: 439830,
          totalPower: 11342.72,
          totalCount: 380,
          totalMoney: 7043.47,
          serviceFee: 565.04,
          avgGunPower: 405.0971,
          availableRate: 99.99,
          useRate: 44.17,
          faultRate: 0,
          offlineRate: 0,
        },
        {
          stationName: "同星东马坊充电站",
          id: 283613,
          totalPower: 9830.42,
          totalCount: 206,
          totalMoney: 5941.9,
          serviceFee: 480.02,
          avgGunPower: 127.6678,
          availableRate: 44.82,
          useRate: 7.93,
          faultRate: 0,
          offlineRate: 53.87,
        },
        {
          stationName: "同星南桥里充电站",
          id: 347832,
          totalPower: 0,
          totalCount: 0,
          totalMoney: 0,
          serviceFee: 0,
          avgGunPower: 0,
          availableRate: 0,
          useRate: 0,
          faultRate: 0,
          offlineRate: 91.66,
        },
        {
          stationName: "星星充电-南京南站",
          id: 551230,
          totalPower: 15230.18,
          totalCount: 512,
          totalMoney: 9812.6,
          serviceFee: 782.15,
          avgGunPower: 512.22,
          availableRate: 98.12,
          useRate: 52.3,
          faultRate: 0.1,
          offlineRate: 1.78,
        },
        {
          stationName: "星星充电-苏州新区",
          id: 551231,
          totalPower: 8762.33,
          totalCount: 301,
          totalMoney: 5650.8,
          serviceFee: 420.05,
          avgGunPower: 298.33,
          availableRate: 86.45,
          useRate: 38.1,
          faultRate: 0,
          offlineRate: 13.55,
        },
        {
          stationName: "特来电-上海虹桥",
          id: 660210,
          totalPower: 23450.9,
          totalCount: 804,
          totalMoney: 15230.5,
          serviceFee: 1250.33,
          avgGunPower: 620.15,
          availableRate: 96.7,
          useRate: 61.24,
          faultRate: 0.2,
          offlineRate: 3.1,
        },
        {
          stationName: "特来电-杭州萧山",
          id: 660211,
          totalPower: 12008.7,
          totalCount: 405,
          totalMoney: 7820.4,
          serviceFee: 620.18,
          avgGunPower: 402.77,
          availableRate: 91.33,
          useRate: 45.5,
          faultRate: 0,
          offlineRate: 8.67,
        },
        {
          stationName: "国家电网-北京西二旗",
          id: 889901,
          totalPower: 33500.2,
          totalCount: 1100,
          totalMoney: 21800.7,
          serviceFee: 1800.5,
          avgGunPower: 712.1,
          availableRate: 99.5,
          useRate: 68.3,
          faultRate: 0.05,
          offlineRate: 0.45,
        },
      ],
      leftKpiList: [
        { num: "2.1173", label: "总充电量（万度）" },
        { num: "586", label: "总充电次数" },
        { num: "1.2985", label: "总充电金额（万元）" },
        { num: "1045.06", label: "总充电服务费（元）" },
      ],
      rightKpiList: [
        { num: "23.96", label: "可用率（%）" },
        { num: "6.82", label: "利用率（%）" },
        { num: "70.74", label: "离线率（%）" },
        { num: "0", label: "故障率（%）" },
      ],
      chartLeftIns: null,
      chartRightIns: null,
    };
  },
  computed: {
    maxPage() {
      return Math.max(1, Math.ceil(this.tableData.length / this.pageSize));
    },
    pagedTableData() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.tableData.slice(start, start + this.pageSize);
    },
  },
  watch: {
    pageSize() {
      this.currentPage = 1;
    },
    maxPage(v) {
      if (this.jumpPage > v) this.jumpPage = v;
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.initCharts();
    });
    this._resizeHandler = this.resizeCharts.bind(this);
    window.addEventListener("resize", this._resizeHandler);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this._resizeHandler);
    if (this.chartLeftIns) this.chartLeftIns.dispose();
    if (this.chartRightIns) this.chartRightIns.dispose();
  },
  methods: {
    getMockData() {
      const t = this.timeType;
      if (t === "7") {
        return {
          dates: [
            "08-07",
            "08-08",
            "08-09",
            "08-10",
            "08-11",
            "08-12",
            "08-13",
          ],
          leftData: [4050, 3050, 3100, 3800, 4100, 4050, 0],
          rightData: [21.5, 23, 23.8, 24, 24, 24, 24],
          leftMax: 5000,
          rightMax: 25,
        };
      }
      if (t === "30") {
        const part1 = Array.from({ length: 17 }, (_, i) => {
          const n = i + 15;
          return "07-" + (n < 10 ? "0" + n : "" + n);
        });
        const part2 = Array.from({ length: 13 }, (_, i) => {
          const n = i + 1;
          return "08-" + (n < 10 ? "0" + n : "" + n);
        });
        const dates = part1.concat(part2);
        return {
          dates,
          leftData: dates.map(() => Math.floor(2000 + Math.random() * 2500)),
          rightData: dates.map(() => (20 + Math.random() * 5).toFixed(1)),
          leftMax: 5000,
          rightMax: 30,
        };
      }
      return {
        dates: [
          "1月",
          "2月",
          "3月",
          "4月",
          "5月",
          "6月",
          "7月",
          "8月",
          "9月",
          "10月",
          "11月",
          "12月",
        ],
        leftData: [
          3500, 3800, 4200, 4100, 4500, 4800, 5200, 5100, 4900, 4700, 4400,
          4600,
        ],
        rightData: [
          22, 22.5, 23, 23.4, 23.8, 24, 24.3, 24.5, 24.2, 24, 23.8, 23.9,
        ],
        leftMax: 6000,
        rightMax: 30,
      };
    },
    initCharts() {
      const { dates, leftData, rightData, leftMax, rightMax } =
        this.getMockData();
      if (this.chartLeftIns) this.chartLeftIns.dispose();
      if (this.chartRightIns) this.chartRightIns.dispose();

      const axisColor = "#909399";
      const gridColor = "#EBEEF5";
      const blue = "#4078f5";

      this.chartLeftIns = echarts.init(this.$refs.chartLeft);
      this.chartLeftIns.setOption({
        tooltip: { trigger: "axis", confine: true },
        grid: { left: 55, right: 20, top: 20, bottom: 30 },
        xAxis: {
          type: "category",
          data: dates,
          boundaryGap: false,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: axisColor, fontSize: 11 },
        },
        yAxis: {
          type: "value",
          name: "度",
          max: leftMax,
          nameTextStyle: {
            color: axisColor,
            fontSize: 11,
            padding: [0, 30, 0, 0],
          },
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: axisColor, fontSize: 11 },
          splitLine: { lineStyle: { color: gridColor, type: "dashed" } },
        },
        series: [
          {
            data: leftData,
            type: "line",
            smooth: true,
            symbol: "circle",
            symbolSize: 5,
            showSymbol: false,
            lineStyle: { width: 2.5, color: blue },
            itemStyle: { color: blue, borderColor: "#fff", borderWidth: 2 },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: "rgba(64,120,245,0.28)" },
                { offset: 1, color: "rgba(64,120,245,0.02)" },
              ]),
            },
          },
        ],
      });

      this.chartRightIns = echarts.init(this.$refs.chartRight);
      this.chartRightIns.setOption({
        tooltip: {
          trigger: "axis",
          confine: true,
          formatter: (p) => p[0].axisValue + "<br/>利用率：" + p[0].value + "%",
        },
        grid: { left: 55, right: 20, top: 20, bottom: 30 },
        xAxis: {
          type: "category",
          data: dates,
          boundaryGap: false,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: axisColor, fontSize: 11 },
        },
        yAxis: {
          type: "value",
          max: rightMax,
          name: "%",
          nameTextStyle: {
            color: axisColor,
            fontSize: 11,
            padding: [0, 25, 0, 0],
          },
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: {
            color: axisColor,
            fontSize: 11,
            formatter: (v) => v + "%",
          },
          splitLine: { lineStyle: { color: gridColor, type: "dashed" } },
        },
        series: [
          {
            data: rightData,
            type: "line",
            smooth: true,
            symbol: "circle",
            symbolSize: 5,
            showSymbol: false,
            lineStyle: { width: 2.5, color: blue },
            itemStyle: { color: blue, borderColor: "#fff", borderWidth: 2 },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: "rgba(64,120,245,0.18)" },
                { offset: 1, color: "rgba(64,120,245,0.02)" },
              ]),
            },
          },
        ],
      });
      this.$nextTick(() => {
        if (this.chartLeftIns) this.chartLeftIns.resize();
        if (this.chartRightIns) this.chartRightIns.resize();
      });
    },
    resizeCharts() {
      if (this.chartLeftIns) this.chartLeftIns.resize();
      if (this.chartRightIns) this.chartRightIns.resize();
    },
    changeTime(t) {
      this.timeType = t;
      this.$nextTick(() => this.initCharts());
    },
    confirmCustomDate() {
      if (!this.customDateRange || this.customDateRange.length < 2) {
        alert("请选择开始和结束日期");
        return;
      }
      this.timeType = "custom";
      this.showCustomDate = false;
      this.$nextTick(() => this.initCharts());
    },
    changeZoom(step) {
      const next = Math.min(200, Math.max(50, this.zoomValue + step));
      this.zoomValue = next;
      document.documentElement.style.zoom = next + "%";
    },
    handleReset() {
      this.zoomValue = 100;
      document.documentElement.style.zoom = "100%";
      this.selectStation = "";
      this.timeType = "7";
      this.currentPage = 1;
      this.pageSize = 10;
      this.customDateRange = [];
      this.$nextTick(() => this.initCharts());
    },
    handleExport() {
      const headers = [
        "电站名称",
        "ID",
        "总充电量(度)",
        "总充电次数",
        "总充电金额(元)",
        "服务费(元)",
        "枪日均",
        "可用率%",
        "利用率%",
        "故障率%",
        "离线率%",
      ];
      const rows = this.tableData.map((r) => [
        r.stationName,
        r.id,
        r.totalPower,
        r.totalCount,
        r.totalMoney,
        r.serviceFee,
        r.avgGunPower,
        r.availableRate,
        r.useRate,
        r.faultRate,
        r.offlineRate,
      ]);
      const all = [headers].concat(rows);
      const csv = all.map((r) => r.join(",")).join("\n");
      const BOM = "\uFEFF";
      const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        "\u7535\u7ad9\u7ecf\u8425\u6570\u636e_" +
        new Date().toISOString().slice(0, 10) +
        ".csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    handleMobile() {
      alert(
        "\u8bf7\u4f7f\u7528\u624b\u673a\u626b\u63cf\u4e8c\u7ef4\u7801\u8bbf\u95ee\u79fb\u52a8\u7aef"
      );
    },
    handleGo(msg) {
      alert(msg);
    },
    goDashboard() {
      this.$router.push({ path: "/dashboard" });
    },
    handleSizeChange() {
      this.currentPage = 1;
    },
    handlePageChange(p) {
      this.currentPage = p;
    },
    handleJump() {
      if (this.jumpPage >= 1 && this.jumpPage <= this.maxPage) {
        this.currentPage = this.jumpPage;
      }
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
  padding-bottom: 0;
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
.zoom-box {
  display: flex;
  align-items: center;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 20px;
  padding: 2px 6px 2px 12px;
}
.zoom-box > * + * {
  margin-left: 4px;
}
.zoom-val {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
  min-width: 44px;
  text-align: center;
}
.zoom-btn {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: none;
  background: #f5f7fa;
  color: #606266;
  font-size: 16px;
  line-height: 24px;
  cursor: pointer;
}
.zoom-btn:hover:not(:disabled) {
  background: #ecf5ff;
  color: #4078f5;
}
.zoom-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.reset-btn {
  height: 30px;
  padding: 0 14px;
  border-radius: 15px;
  border: 1px solid #dcdfe6;
  background: #fff;
  font-size: 13px;
  cursor: pointer;
  margin-left: 4px;
  color: #303133;
}
.reset-btn:hover {
  border-color: #4078f5;
  color: #4078f5;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  font-size: 13px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}
.action-btn > * + * {
  margin-left: 6px;
}
.download-btn {
  background: linear-gradient(135deg, #4078f5 0%, #5b8def 100%);
  color: #fff;
  box-shadow: 0 2px 6px rgba(64, 120, 245, 0.3);
}
.download-btn:hover {
  background: linear-gradient(135deg, #356ae0 0%, #4e82ec 100%);
}
.outline-btn {
  background: #fff;
  color: #4078f5;
  border-color: #a7c5f9;
}
.outline-btn:hover {
  background: #ecf5ff;
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

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: #fff;
  border-bottom: 1px solid #ebeef5;
}
.time-btn-group {
  display: flex;
}
.time-btn-group > * + * {
  margin-left: 8px;
}
.time-btn-group /deep/ .el-button {
  border-radius: 3px;
}
.time-btn-group /deep/ .el-button.btn-solid {
  background: #4078f5;
  border-color: #4078f5;
  color: #fff;
}

.card-row {
  display: flex;
  padding: 16px 20px 0;
}
.card-row > * + * {
  margin-left: 16px;
}
.data-card {
  flex: 1;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 20px 20px 16px;
}
.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 18px;
}
.card-header > * + * {
  margin-left: 8px;
}
.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}
.tip-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid #c0c4cc;
  font-size: 11px;
  color: #909399;
  line-height: 14px;
  cursor: help;
  font-weight: 500;
}
.warm-tip {
  font-size: 12px;
  color: #909399;
  margin-left: 6px;
}

.kpi-row {
  display: flex;
  margin-bottom: 14px;
}
.kpi-row > * + * {
  margin-left: 12px;
}
.kpi-item {
  flex: 1;
  text-align: center;
  padding: 10px 6px 14px;
  border-radius: 6px;
  position: relative;
  transition: background 0.2s;
}
.kpi-item:hover {
  background: #fafbfc;
}
.kpi-item.active {
  background: #f5f7fa;
}
.kpi-num {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  line-height: 1.2;
  letter-spacing: 0.2px;
  font-family: "DIN Alternate", "Helvetica Neue", Arial, sans-serif;
}
.kpi-label {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.4;
}
.kpi-underline {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 2px;
  background: #4078f5;
  border-radius: 2px;
}

.chart-box {
  width: 100%;
  height: 280px;
  min-height: 280px;
  flex-shrink: 0;
  display: block;
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
}
.table-title-wrap {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}
.table-title-wrap > * + * {
  margin-left: 10px;
}
.table-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}
.table-tip {
  font-size: 12px;
  color: #909399;
}
.export-simple-btn {
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  border-radius: 3px;
  background: #fff;
  border: 1px solid #dcdfe6;
  font-size: 13px;
  color: #606266;
  cursor: pointer;
  transition: all 0.2s;
}
.export-simple-btn > * + * {
  margin-left: 4px;
}
.export-simple-btn:hover {
  color: #4078f5;
  border-color: #a7c5f9;
  background: #ecf5ff;
}
.station-cell {
  line-height: 1.5;
}
.station-name {
  font-size: 13px;
  color: #303133;
}
.station-id {
  font-size: 12px;
  color: #909399;
}

.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid #f0f2f5;
  flex-wrap: wrap;
}
.pagination-bar > * + * {
  margin-left: 12px;
}
.total-count {
  font-size: 13px;
  color: #606266;
}
.total-count b {
  color: #303133;
  margin: 0 2px;
}
.jump-last {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #606266;
}
.jump-last /deep/ .el-input-number .el-input__inner {
  text-align: center;
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

.date-picker-box {
  padding: 16px 4px;
}

/* ========== 总览按钮 ========== */
.overview-btn {
  display: inline-flex;
  align-items: center;
  padding: 6px 16px;
  font-size: 13px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  color: #fff;
  box-shadow: 0 2px 6px rgba(82, 196, 26, 0.3);
}
.overview-btn > * + * {
  margin-left: 6px;
}
.overview-btn:hover {
  background: linear-gradient(135deg, #49b018 0%, #66c12a 100%);
}
</style>
