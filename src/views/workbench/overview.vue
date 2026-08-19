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
      <el-dropdown trigger="click" @command="handleOpsCmd">
        <div
          class="tab-item dropdown-tab"
          :class="{ active: activeTopTab.startsWith('ops') }"
        >
          运营商统计
          <i class="el-icon-arrow-down arrow-down"></i>
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
          机构统计
          <i class="el-icon-arrow-down arrow-down"></i>
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
          <button class="export-simple-btn" @click="doExportTable">
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

    <download-center-dialog :visible.sync="showDownloadCenter" />
  </div>
</template>

<script>
import * as echarts from "echarts";
import DownloadCenterDialog from "../../components/DownloadCenterDialog.vue";
import { exportToCSV } from "../../utils/exportCSV";

export default {
  name: "WorkbenchOverview",
  components: { DownloadCenterDialog },
  data() {
    return {
      activeTopTab: "overview",
      zoomValue: 100,
      currentUser: "TXJXGS01",
      selectStation: "",
      timeType: "7",
      showCustomDate: false,
      customDateRange: [],
      showDownloadCenter: false,
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
    doExportTable() {
      const columns = [
        { label: "电站名称", prop: "stationName" },
        { label: "ID", prop: "id" },
        { label: "总充电量(度)", prop: "totalPower" },
        { label: "总充电次数", prop: "totalCount" },
        { label: "总充电金额(元)", prop: "totalMoney" },
        { label: "服务费(元)", prop: "serviceFee" },
        { label: "枪日均电量(度)", prop: "avgGunPower" },
        { label: "可用率(%)", prop: "availableRate" },
        { label: "利用率(%)", prop: "useRate" },
        { label: "故障率(%)", prop: "faultRate" },
        { label: "离线率(%)", prop: "offlineRate" },
      ];
      exportToCSV(columns, this.tableData, "电站数据", {
        pageName: "经营总览-电站数据",
      });
    },
    handleExport() {
      this.showDownloadCenter = true;
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
      if (map[cmd]) {
        this.activeTopTab = "ops-" + cmd;
        this.$router.push(map[cmd]);
      }
    },
    handleOrgCmd(cmd) {
      const map = {
        period: "/workbench/org/period",
        stat: "/workbench/org/stat",
        compare: "/workbench/org/compare",
        "user-compare": "/workbench/org/user-compare",
        "user-stat": "/workbench/org/user-stat",
      };
      if (map[cmd]) {
        this.activeTopTab = "org-" + cmd;
        this.$router.push(map[cmd]);
      }
    },
  },
};
</script>
<style scope>
.statistics-page {
  min-height: 100vh;
  background: radial-gradient(
      circle at 12% 12%,
      rgba(64, 120, 245, 0.08),
      transparent 28%
    ),
    linear-gradient(135deg, #f7f9fc 0%, #f0f4f8 100%);
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC",
    "Microsoft YaHei", Helvetica, Arial, sans-serif;
  color: #1f2329;
  padding-bottom: 0;
}

/* ------------------------------
   顶部导航
------------------------------ */
.top-tabs {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.96);
  border-bottom: 1px solid rgba(229, 230, 235, 0.8);
  padding: 0 28px;
  height: 56px;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: saturate(180%) blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

.tab-item {
  padding: 0 24px;
  font-size: 14px;
  color: #64656a;
  height: 56px;
  line-height: 56px;
  cursor: pointer;
  position: relative;
  transition: 0.22s ease;
  user-select: none;
  display: flex;
  align-items: center;
  gap: 5px;
  border-radius: 6px 6px 0 0;
}

.tab-item:hover {
  color: #4078f5;
  background: rgba(64, 120, 245, 0.04);
}

.tab-item.active {
  color: #1f2329;
  font-weight: 600;
  background: linear-gradient(to bottom, rgba(64, 120, 245, 0.08), transparent);
}

.tab-item.active::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 12px;
  right: 12px;
  height: 3px;
  background: linear-gradient(90deg, #4078f5, #699bff);
  border-radius: 3px 3px 0 0;
}

.arrow-down {
  font-size: 12px;
  transition: transform 0.2s ease;
}

.tab-item:hover .arrow-down {
  transform: translateY(2px);
}

.top-right-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 14px;
}

/* ------------------------------
   按钮统一
------------------------------ */
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

/* ------------------------------
   用户信息与消息
------------------------------ */
.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #64656a;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.22s ease;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(229, 230, 235, 0.8);
}

.user-info:hover {
  background: rgba(64, 120, 245, 0.06);
  border-color: #b4c8f2;
  color: #4078f5;
}

.user-name {
  font-weight: 600;
  letter-spacing: 0.3px;
}

.msg-btn {
  position: relative;
  width: 36px;
  height: 36px;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64656a;
  transition: 0.22s ease;
  border: 1px solid rgba(229, 230, 235, 0.8);
}

.msg-btn:hover {
  background: rgba(64, 120, 245, 0.06);
  border-color: #b4c8f2;
  color: #4078f5;
}

.msg-dot {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #ff7b7b, #f53f3f);
  border: 2px solid #fff;
  box-shadow: 0 0 0 2px rgba(245, 63, 63, 0.25);
}

/* ------------------------------
   面包屑
------------------------------ */
.breadcrumb {
  font-size: 13px;
  color: #86909c;
  padding: 18px 28px 10px;
  letter-spacing: 0.5px;
}

.breadcrumb .sep {
  margin: 0 10px;
  color: #c9cdd4;
}

.bc-active {
  color: #4078f5;
  font-weight: 500;
}

/* ------------------------------
   筛选栏
------------------------------ */
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 28px;
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 1px solid rgba(229, 230, 235, 0.8);
  flex-wrap: wrap;
  gap: 12px;
}

.time-btn-group {
  display: flex;
  gap: 10px;
}

.time-btn-group /deep/ .el-button {
  border-radius: 6px;
  height: 36px;
  padding: 0 18px;
  font-size: 13px;
  border: 1px solid #dcdfe6;
  background: #fff;
  color: #64656a;
  transition: 0.22s ease;
}

.time-btn-group /deep/ .el-button:hover {
  border-color: #4078f5;
  color: #4078f5;
}

.time-btn-group /deep/ .el-button.btn-solid {
  background: linear-gradient(135deg, #4078f5, #5a8df7);
  border-color: #4078f5;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(64, 120, 245, 0.35);
}

.time-btn-group /deep/ .el-button.btn-solid:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 120, 245, 0.45);
}

/* ------------------------------
   卡片区域
------------------------------ */
.card-row {
  display: flex;
  gap: 18px;
  padding: 18px 28px 0;
  flex-wrap: wrap;
}

.data-card {
  flex: 1 1 480px;
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 12px 24px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(229, 230, 235, 0.8);
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 22px;
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  color: #1f2329;
  letter-spacing: 0.5px;
}

.tip-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1px solid #c9cdd4;
  font-size: 11px;
  color: #86909c;
  cursor: help;
  transition: 0.22s ease;
}

.tip-icon:hover {
  border-color: #4078f5;
  color: #4078f5;
  background: rgba(64, 120, 245, 0.06);
}

.warm-tip {
  font-size: 12px;
  color: #86909c;
  margin-left: 4px;
}

/* ------------------------------
   KPI 指标
------------------------------ */
.kpi-row {
  display: flex;
  gap: 14px;
  margin-bottom: 22px;
  flex-wrap: wrap;
}

.kpi-item {
  flex: 1 1 120px;
  text-align: center;
  padding: 18px 10px;
  border-radius: 10px;
  background: linear-gradient(
    135deg,
    rgba(247, 248, 250, 0.9),
    rgba(255, 255, 255, 0.9)
  );
  border: 1px solid rgba(229, 230, 235, 0.8);
  transition: 0.22s ease;
  position: relative;
  overflow: hidden;
}

.kpi-item::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  width: 3px;
  height: 0;
  background: linear-gradient(180deg, #4078f5, #699bff);
  transition: height 0.22s ease;
}

.kpi-item:hover {
  transform: translateY(-2px);
  border-color: #b4c8f2;
  box-shadow: 0 4px 12px rgba(64, 120, 245, 0.12);
}

.kpi-item:hover::before {
  height: 100%;
}

.kpi-item.active {
  background: linear-gradient(
    135deg,
    rgba(64, 120, 245, 0.08),
    rgba(255, 255, 255, 0.96)
  );
  border-color: #4078f5;
  box-shadow: 0 4px 12px rgba(64, 120, 245, 0.14);
}

.kpi-item.active::before {
  height: 100%;
}

.kpi-num {
  font-size: 26px;
  font-weight: 800;
  color: #1f2329;
  line-height: 1.2;
  font-family: "DIN Alternate", "Helvetica Neue", sans-serif;
  letter-spacing: 1px;
}

.kpi-label {
  font-size: 13px;
  color: #86909c;
  margin-top: 8px;
  line-height: 1.4;
}

.kpi-underline {
  display: none;
}

/* ------------------------------
   图表容器
------------------------------ */
.chart-box {
  width: 100%;
  height: 270px;
  min-height: 270px;
  flex-shrink: 0;
  display: block;
}

/* ------------------------------
   表格卡片
------------------------------ */
.table-card {
  margin: 18px 28px 0;
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 12px 24px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(229, 230, 235, 0.8);
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.table-title-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.table-title {
  font-size: 16px;
  font-weight: 700;
  color: #1f2329;
  letter-spacing: 0.5px;
}

.table-tip {
  font-size: 12px;
  color: #86909c;
  line-height: 1.5;
}

.station-cell {
  line-height: 1.6;
}

.station-name {
  font-size: 14px;
  color: #1f2329;
  font-weight: 600;
}

.station-id {
  font-size: 12px;
  color: #86909c;
}

/* 表格行细节补强 */
.el-table {
  border-radius: 8px;
  overflow: hidden;
}

.el-table th {
  background: linear-gradient(to bottom, #fafbfc, #f5f7fa) !important;
  color: #64656a !important;
  font-weight: 600 !important;
  border-bottom: 1px solid #e5e6eb !important;
}

.el-table tr:hover td {
  background: rgba(64, 120, 245, 0.04) !important;
}

.el-table td {
  border-bottom: 1px solid #f0f1f3 !important;
  color: #1f2329;
  font-size: 14px;
}

.el-table .el-tag {
  border-radius: 6px;
  font-weight: 600;
  padding: 0 10px;
  height: 24px;
  line-height: 22px;
  font-size: 12px;
}

/* ------------------------------
   分页
------------------------------ */
.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #f0f1f3;
  flex-wrap: wrap;
  gap: 12px;
}

.total-count {
  font-size: 13px;
  color: #64656a;
}

.total-count b {
  color: #1f2329;
  font-weight: 700;
}

.jump-last {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #64656a;
  gap: 8px;
}

.jump-last .el-input-number .el-input__inner {
  text-align: center;
  border-radius: 6px;
  border-color: #dcdfe6;
  transition: 0.22s ease;
}

.jump-last .el-input-number .el-input__inner:focus {
  border-color: #4078f5;
}

.el-pagination button {
  border-radius: 6px;
  border-color: #dcdfe6;
  transition: 0.22s ease;
}

.el-pagination button:hover {
  color: #4078f5;
  border-color: #4078f5;
}

.el-pagination .el-pager li {
  border-radius: 6px;
  transition: 0.22s ease;
}

.el-pagination .el-pager li:hover {
  color: #4078f5;
}

.el-pagination .el-pager li.active {
  background: linear-gradient(135deg, #4078f5, #5a8df7);
  color: #fff;
  box-shadow: 0 2px 8px rgba(64, 120, 245, 0.35);
}

/* ------------------------------
   页脚
------------------------------ */
.page-footer {
  margin-top: 48px;
  padding: 22px 28px;
  background: rgba(255, 255, 255, 0.95);
  border-top: 1px solid rgba(229, 230, 235, 0.8);
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  font-size: 12px;
  color: #86909c;
  gap: 48px;
}

/* ------------------------------
   弹窗
------------------------------ */
.date-picker-box {
  padding: 16px 8px;
}

.el-dialog {
  border-radius: 12px;
  overflow: hidden;
}

.el-dialog__header {
  border-bottom: 1px solid #f0f1f3;
  padding: 20px 24px 16px;
}

.el-dialog__title {
  font-size: 16px;
  font-weight: 700;
  color: #1f2329;
}

.el-dialog__body {
  padding: 16px 24px 20px;
}

.el-dialog__footer {
  border-top: 1px solid #f0f1f3;
  padding: 16px 24px;
}

.el-dialog__footer .el-button--primary {
  background: linear-gradient(135deg, #4078f5, #5a8df7);
  border-color: #4078f5;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(64, 120, 245, 0.35);
}

.el-dialog__footer .el-button--primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 120, 245, 0.45);
}

/* ------------------------------
   响应细节
------------------------------ */
@media (max-width: 1200px) {
  .card-row {
    flex-direction: column;
  }

  .data-card {
    flex: none;
  }
}

@media (max-width: 768px) {
  .top-tabs {
    padding: 0 16px;
  }

  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .time-btn-group {
    flex-wrap: wrap;
  }

  .card-row,
  .table-card {
    padding: 14px 16px 0;
  }

  .kpi-row {
    flex-wrap: wrap;
  }

  .page-footer {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
}
</style>
