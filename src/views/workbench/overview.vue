<template>
  <div class="charge-dashboard">
    <!-- 第一部分：充电数据指标卡片 -->
    <div class="dashboard-top">
      <div class="top-header">
        <span class="title">充电数据</span>
        <div class="filter-group">
          <el-select v-model="selectStation" placeholder="全部电站">
            <el-option label="全部电站" value=""></el-option>
          </el-select>
          <el-button size="mini" type="primary">今日</el-button>
          <el-button size="mini">昨日</el-button>
        </div>
      </div>
      <div class="card-wrap">
        <div class="stat-card card-green">
          <div class="card-label">充电电量(度)</div>
          <div class="card-value">3854.1610</div>
        </div>
        <div class="stat-card card-orange">
          <div class="card-label">充电次数(单)</div>
          <div class="card-value">101</div>
        </div>
        <div class="stat-card card-blue">
          <div class="card-label">订单应收金额(元)</div>
          <div class="card-value">2480.3600</div>
        </div>
        <div class="stat-card card-purple">
          <div class="card-label">订单应收电费(元)</div>
          <div class="card-value">2288.1900</div>
        </div>
        <div class="stat-card card-darkblue">
          <div class="card-label">订单应收服务费(元)</div>
          <div class="card-value">192.1700</div>
        </div>
      </div>
    </div>

    <!-- 第二部分：实时状态 -->
    <div class="status-wrap">
      <div class="status-title">
        实时状态 <span class="tip">（已停用 26）</span>
      </div>
      <div class="status-item-wrap">
        <div class="status-item">
          <i class="el-icon-lightning"></i>
          <span>充电中</span>
          <span class="num">0</span>
        </div>
        <div class="status-item">
          <i class="el-icon-plug"></i>
          <span>空闲中</span>
          <span class="num">11</span>
        </div>
        <div class="status-item">
          <i class="el-icon-mobile-phone"></i>
          <span>离线中</span>
          <span class="num">4</span>
        </div>
        <div class="status-item">
          <i class="el-icon-warning"></i>
          <span>故障中</span>
          <span class="num">0</span>
        </div>
        <div class="status-item">
          <i class="el-icon-set-up"></i>
          <span>占用中</span>
          <span class="num">2</span>
        </div>
      </div>
    </div>

    <!-- 第三部分：场站经营数据 两个图表并排 -->
    <div class="chart-container">
      <div class="chart-header">
        <span class="title">场站经营数据</span>
        <div class="filter-group">
          <el-select v-model="chartStation" placeholder="全部电站">
            <el-option label="全部电站" value=""></el-option>
          </el-select>
          <el-button size="mini" type="primary">近30天</el-button>
          <el-button size="mini">近12月</el-button>
          <el-button size="mini">自定义</el-button>
        </div>
      </div>
      <div class="chart-row">
        <div class="chart-box">
          <div class="sub-title">充电趋势</div>
          <div id="chartTrend" style="width: 100%; height: 400px"></div>
        </div>
        <div class="chart-box">
          <div class="sub-title">时段分布</div>
          <div id="chartTime" style="width: 100%; height: 400px"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ChargeDashboard",
  data() {
    return {
      selectStation: "",
      chartStation: "",
      chart1: null,
      chart2: null,
    };
  },
  mounted() {
    this.initChart();
    window.addEventListener("resize", this.resizeChart);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.resizeChart);
  },
  methods: {
    resizeChart() {
      this.chart1 && this.chart1.resize();
      this.chart2 && this.chart2.resize();
    },
    initChart() {
      // 左图：充电趋势
      this.chart1 = window.echarts.init(document.getElementById("chartTrend"));
      this.chart1.setOption({
        tooltip: { trigger: "axis" },
        legend: {
          data: ["充电电量", "充电次数", "订单金额"],
          left: 20,
        },
        grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
        xAxis: {
          type: "category",
          data: [
            "2026‑07‑21",
            "2026‑07‑25",
            "2026‑07‑29",
            "2026‑08‑02",
            "2026‑08‑06",
            "2026‑08‑10",
            "2026‑08‑14",
            "2026‑08‑18",
          ],
        },
        yAxis: { type: "value" },
        series: [
          {
            name: "充电电量",
            type: "line",
            smooth: true,
            color: "#62cc94",
            data: [4200, 3600, 4500, 3700, 3900, 3200, 2200, 3800],
          },
          {
            name: "充电次数",
            type: "line",
            smooth: true,
            color: "#f5b041",
            data: [30, 33, 36, 32, 38, 28, 31, 34],
          },
          {
            name: "订单金额",
            type: "line",
            smooth: true,
            color: "#4078e8",
            data: [2400, 2100, 2700, 2200, 2500, 1300, 1900, 2200],
          },
        ],
      });

      // 右图：时段分布
      this.chart2 = window.echarts.init(document.getElementById("chartTime"));
      this.chart2.setOption({
        tooltip: { trigger: "axis" },
        legend: {
          data: ["充电电量", "充电次数", "订单金额"],
          left: 20,
        },
        grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
        xAxis: {
          type: "category",
          data: [
            "00:00‑01:00",
            "04:00‑05:00",
            "08:00‑09:00",
            "12:00‑13:00",
            "16:00‑17:00",
            "20:00‑21:00",
          ],
        },
        yAxis: { type: "value" },
        series: [
          {
            name: "充电电量",
            type: "line",
            smooth: true,
            color: "#62cc94",
            data: [11500, 4400, 6200, 7100, 6400, 1200],
          },
          {
            name: "充电次数",
            type: "line",
            smooth: true,
            color: "#f5b041",
            data: [32, 22, 27, 35, 30, 8],
          },
          {
            name: "订单金额",
            type: "line",
            smooth: true,
            color: "#4078e8",
            data: [5400, 2600, 3300, 4600, 3700, 700],
          },
        ],
      });
    },
  },
};
</script>

<style scoped>
.charge-dashboard {
  background: #f5f7fa;
  padding: 16px;
}
.dashboard-top {
  background: #ffffff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}
.top-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.title {
  font-size: 16px;
  font-weight: bold;
}
.filter-group {
  display: flex;
  gap: 8px;
  align-items: center;
}
.card-wrap {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}
.stat-card {
  border-radius: 10px;
  padding: 20px 14px;
  color: #fff;
}
.card-green {
  background: #47b868;
}
.card-orange {
  background: #f7aa38;
}
.card-blue {
  background: #36a2e8;
}
.card-purple {
  background: #8068e5;
}
.card-darkblue {
  background: #3973ed;
}
.card-label {
  font-size: 14px;
  margin-bottom: 8px;
}
.card-value {
  font-size: 32px;
  font-weight: bold;
}

/*实时状态栏*/
.status-wrap {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}
.status-title {
  font-size: 15px;
  font-weight: bold;
  margin-bottom: 12px;
}
.tip {
  font-weight: normal;
  color: #666;
  font-size: 13px;
}
.status-item-wrap {
  display: flex;
  gap: 40px;
}
.status-item {
  display: flex;
  align-items: center;
  gap: 6px;
}
.num {
  font-size: 20px;
  font-weight: bold;
}

/*图表区域*/
.chart-container {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
}
.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.chart-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.sub-title {
  font-size: 14px;
  margin-bottom: 8px;
}
</style>
