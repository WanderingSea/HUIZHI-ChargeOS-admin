<template>
  <div class="container">
    <!-- 充电数据模块 -->
    <div class="block-card">
      <div class="block-title-row">
        <div class="block-title">充电数据</div>
        <div class="top-select-group">
          <el-select v-model="selStation" placeholder="全部电站" size="small">
            <el-option label="全部电站" value="all"></el-option>
          </el-select>
          <el-radio-group v-model="timeSel" size="small">
            <el-radio-button label="今日"></el-radio-button>
            <el-radio-button label="昨日"></el-radio-button>
          </el-radio-group>
        </div>
      </div>
      <div class="data-card-wrap">
        <div class="data-card-item card-green">
          <div class="data-label">充电电量(度)</div>
          <div class="data-value">{{ chargeData.electric }}</div>
        </div>
        <div class="data-card-item card-orange">
          <div class="data-label">充电次数(单)</div>
          <div class="data-value">{{ chargeData.count }}</div>
        </div>
        <div class="data-card-item card-blue1">
          <div class="data-label">订单应收金额(元)</div>
          <div class="data-value">{{ chargeData.totalAmount }}</div>
        </div>
        <div class="data-card-item card-purple">
          <div class="data-label">订单应收电费(元)</div>
          <div class="data-value">{{ chargeData.electricFee }}</div>
        </div>
        <div class="data-card-item card-blue2">
          <div class="data-label">订单应收服务费(元)</div>
          <div class="data-value">{{ chargeData.serviceFee }}</div>
        </div>
      </div>
    </div>

    <!-- 实时状态模块 -->
    <div class="block-card">
      <div class="block-title-row">
        <div class="block-title">
          实时状态 <span style="font-size: 12px; color: #888">(已停用 26)</span>
        </div>
      </div>
      <div class="status-row">
        <div class="status-item" v-for="item in statusList" :key="item.label">
          <div class="status-icon-box">🔌</div>
          <div class="status-text">
            <small>{{ item.label }}</small>
            <div class="num">{{ item.value }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 场站经营数据 双图表 -->
    <div class="block-title" style="margin: 10px 0 12px">场站经营数据</div>
    <div class="chart-row">
      <div class="chart-card">
        <div class="chart-header">
          <span style="font-size: 14px; font-weight: 600">充电趋势</span>
        </div>
        <div id="chartLeft" style="width: 100%; height: 340px"></div>
      </div>
      <div class="chart-card">
        <div class="chart-header">
          <div style="display: flex; gap: 8px; align-items: center">
            <el-select size="small" v-model="chartStation">
              <el-option label="全部电站" value="all"></el-option>
            </el-select>
            <el-radio-group size="small" v-model="rangeSel">
              <el-radio-button label="近30天"></el-radio-button>
              <el-radio-button label="近12月"></el-radio-button>
              <!-- 点击自定义打开弹窗 -->
              <el-radio-button
                label="自定义"
                @click="openDateDialog"
              ></el-radio-button>
            </el-radio-group>
          </div>
        </div>
        <div id="chartRight" style="width: 100%; height: 340px"></div>
      </div>
    </div>

    <!-- 自定义时间弹窗 -->
    <el-dialog
      title="选择时间范围"
      :visible.sync="dateDialogVisible"
      width="420px"
    >
      <el-date-picker
        v-model="customDateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        style="width: 100%"
      ></el-date-picker>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dateDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmCustomDate">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import echarts from "echarts";
export default {
  name: "StationOverview",
  data() {
    return {
      selStation: "all",
      timeSel: "今日",
      chartStation: "all",
      rangeSel: "近30天",
      // 弹窗相关
      dateDialogVisible: false,
      customDateRange: [],

      chargeData: {
        electric: "3854.1610",
        count: "101",
        totalAmount: "2480.3600",
        electricFee: "2288.1900",
        serviceFee: "192.1700",
      },
      statusList: [
        { label: "充电中", value: 0 },
        { label: "空闲中", value: 11 },
        { label: "离线中", value: 4 },
        { label: "故障中", value: 0 },
        { label: "占用中", value: 2 },
      ],
      chartLeftInstance: null,
      chartRightInstance: null,
    };
  },
  mounted() {
    this.initChart();
    window.addEventListener("resize", this.handleResize);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.handleResize);
    this.chartLeftInstance?.dispose();
    this.chartRightInstance?.dispose();
  },
  methods: {
    openDateDialog() {
      this.dateDialogVisible = true;
    },
    confirmCustomDate() {
      if (!this.customDateRange || this.customDateRange.length !== 2) {
        this.$message.warning("请选择起止时间");
        return;
      }
      this.dateDialogVisible = false;
      // 拿到选中的时间：this.customDateRange[0] 开始时间，this.customDateRange[1]结束时间
      console.log("自定义时间", this.customDateRange);
      // 这里写axios请求，把时间传给后端，拿到新数据后再调用 this.initChart() 刷新图表
      this.$message.success(
        `已选择：${this.customDateRange[0]} 至 ${this.customDateRange[1]}`
      );
    },
    initChart() {
      // 左侧充电趋势
      this.chartLeftInstance = echarts.init(
        document.getElementById("chartLeft")
      );
      this.chartLeftInstance.setOption({
        tooltip: { trigger: "axis" },
        legend: { data: ["充电电量", "充电次数", "订单金额"], right: 10 },
        grid: { left: "3%", right: "4%", bottom: "12%" },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: [
            "2026‑07‑21",
            "2026‑07‑25",
            "2026‑07‑29",
            "2026‑08‑02",
            "2026‑08‑06",
            "2026‑08‑08",
            "2026‑08‑10",
            "2026‑08‑14",
            "2026‑08‑18",
          ],
        },
        yAxis: [{ type: "value" }],
        series: [
          {
            name: "充电电量",
            type: "line",
            smooth: true,
            color: "#73c990",
            data: [4100, 3400, 4500, 3600, 3800, 4000, 3000, 3300, 4200],
          },
          {
            name: "充电次数",
            type: "line",
            smooth: true,
            color: "#e6a445",
            data: [40, 44, 42, 46, 48, 45, 41, 43, 47],
          },
          {
            name: "订单金额",
            type: "line",
            smooth: true,
            color: "#4972dd",
            data: [2600, 2100, 2900, 2400, 2500, 2300, 1700, 2000, 2400],
          },
        ],
      });

      // 右侧时段分布
      this.chartRightInstance = echarts.init(
        document.getElementById("chartRight")
      );
      this.chartRightInstance.setOption({
        tooltip: { trigger: "axis" },
        legend: { data: ["充电电量", "充电次数", "订单金额"], right: 10 },
        grid: { left: "3%", right: "4%", bottom: "12%" },
        xAxis: {
          type: "category",
          boundaryGap: false,
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
            color: "#73c990",
            data: [11200, 4300, 6200, 6500, 5100, 800],
          },
          {
            name: "充电次数",
            type: "line",
            smooth: true,
            color: "#e6a445",
            data: [32, 28, 38, 41, 35, 10],
          },
          {
            name: "订单金额",
            type: "line",
            smooth: true,
            color: "#4972dd",
            data: [5200, 2400, 3100, 4400, 3600, 600],
          },
        ],
      });
    },
    handleResize() {
      this.chartLeftInstance?.resize();
      this.chartRightInstance?.resize();
    },
  },
};
</script>

<style scoped>
.container {
  max-width: 100%;
  padding: 24px;
  background-color: #f7f8fa;
}
.block-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.06);
}
.block-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.block-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}
.top-select-group {
  display: flex;
  gap: 8px;
  align-items: center;
}
.data-card-wrap {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}
.data-card-item {
  border-radius: 10px;
  padding: 20px 16px;
  color: #fff;
}
.card-green {
  background: #70bd63;
}
.card-orange {
  background: #f2b040;
}
.card-blue1 {
  background: #57a8e8;
}
.card-purple {
  background: #8478e8;
}
.card-blue2 {
  background: #497cdb;
}
.data-label {
  font-size: 13px;
  margin-bottom: 8px;
}
.data-value {
  font-size: 34px;
  font-weight: bold;
}
.status-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}
.status-item {
  display: flex;
  align-items: center;
  gap: 10px;
}
.status-icon-box {
  font-size: 28px;
}
.status-text small {
  color: #888;
  font-size: 13px;
}
.status-text .num {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}
.chart-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.chart-card {
  background: #fff;
  border-radius: 12px;
  padding: 18px;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.06);
}
.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
</style>
