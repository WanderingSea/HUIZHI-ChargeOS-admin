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
                @click.native="openDateDialog"
              ></el-radio-button>
            </el-radio-group>
          </div>
        </div>
        <div id="chartRight" style="width: 100%; height: 340px"></div>
      </div>
    </div>

    <el-dialog
      title="选择时间范围"
      :visible.sync="dateDialogVisible"
      width="440px"
      append-to-body
      :close-on-click-modal="false"
      custom-class="date-range-dialog"
    >
      <el-form label-width="90px">
        <el-form-item label="开始日期">
          <el-date-picker
            v-model="customStart"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="开始日期"
            style="width: 100%"
            :picker-options="{
              disabledDate: (t) => customEnd && t > new Date(customEnd),
            }"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="结束日期">
          <el-date-picker
            v-model="customEnd"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="结束日期"
            style="width: 100%"
            :picker-options="{
              disabledDate: (t) => customStart && t < new Date(customStart),
            }"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="快捷选择">
          <el-button-group>
            <el-button size="mini" @click="customQuick(7)">近7天</el-button>
            <el-button size="mini" @click="customQuick(30)">近30天</el-button>
            <el-button size="mini" @click="customQuick(90)">近3月</el-button>
            <el-button size="mini" @click="customYear(1)">近1年</el-button>
          </el-button-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dateDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmCustomDate"
          >确定并重绘</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as echarts from "echarts";
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
      lastCustomRange: null, // 记住上次自定义的时间段
      customStart: "",
      customEnd: "",

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
  watch: {
    rangeSel(v) {
      if (v === "自定义") return;
      this.reRenderLeftByRange();
    },
    chartStation() {
      this.reRenderLeftByRange();
      if (this.chartRightInstance) {
        // 右图也想刷新的话，就把 initChart 里右图那段抽成 reRenderRightTime() 并在这里调用
      }
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart();
    });
    window.addEventListener("resize", this.handleResize);
  },
  customQuick(days) {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days + 1);
    const pad = (n) => String(n).padStart(2, "0");
    this.customStart = `${start.getFullYear()}-${pad(
      start.getMonth() + 1
    )}-${pad(start.getDate())}`;
    this.customEnd = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(
      end.getDate()
    )}`;
  },
  customYear(y) {
    const end = new Date();
    const start = new Date();
    start.setFullYear(end.getFullYear() - y);
    const pad = (n) => String(n).padStart(2, "0");
    this.customStart = `${start.getFullYear()}-${pad(
      start.getMonth() + 1
    )}-${pad(start.getDate())}`;
    this.customEnd = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(
      end.getDate()
    )}`;
  },

  beforeDestroy() {
    window.removeEventListener("resize", this.handleResize);
    this.chartLeftInstance?.dispose();
    this.chartRightInstance?.dispose();
  },
  methods: {
    openDateDialog() {
      this.rangeSel = "自定义";
      this.dateDialogVisible = true;
    },
    confirmCustomDate() {
      if (!this.customStart || !this.customEnd) {
        this.$message.warning("请选择完整起止时间");
        return;
      }
      if (new Date(this.customStart) > new Date(this.customEnd)) {
        this.$message.warning("开始日期不能晚于结束日期");
        return;
      }
      this.lastCustomRange = [this.customStart, this.customEnd];
      this.dateDialogVisible = false;
      // 选中后立刻用新数据重绘左图（根据自定义日期生成 X 轴）
      this.reRenderLeftByRange();
      this.$message.success(`已应用：${this.customStart} 至 ${this.customEnd}`);
    },

    // ===== 新增：根据 rangeSel 决定 X 轴，然后重绘左图 =====
    reRenderLeftByRange() {
      if (!this.chartLeftInstance) return;
      const pad = (n) => String(n).padStart(2, "0");
      const fmtDay = (d) =>
        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      const fmtMonth = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
      let xData = [];

      if (this.rangeSel === "近30天") {
        const today = new Date();
        for (let i = 29; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          xData.push(fmtDay(d));
        }
      } else if (this.rangeSel === "近12月") {
        const now = new Date();
        for (let i = 11; i >= 0; i--) {
          xData.push(
            fmtMonth(new Date(now.getFullYear(), now.getMonth() - i, 1))
          );
        }
      } else if (this.rangeSel === "自定义" && this.lastCustomRange) {
        const [s, e] = this.lastCustomRange;
        const start = new Date(s),
          end = new Date(e);
        const diffDays = Math.max(1, Math.round((end - start) / 86400000) + 1);
        if (diffDays > 100) {
          // 大于 100 天按月粒度
          for (let y = start.getFullYear(); y <= end.getFullYear(); y++) {
            const ms = y === start.getFullYear() ? start.getMonth() : 0;
            const me = y === end.getFullYear() ? end.getMonth() : 11;
            for (let m = ms; m <= me; m++)
              xData.push(fmtMonth(new Date(y, m, 1)));
          }
        } else {
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            xData.push(fmtDay(new Date(d)));
          }
        }
      }

      const mul = this.chartStation === "all" ? 1 : 0.6;
      const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
      const electric = xData.map(() => rand(1800, 5000) * mul);
      const counts = xData.map(() => rand(20, 60));
      const amounts = xData.map((_, i) => Math.round(electric[i] * 0.62));

      this.chartLeftInstance.setOption(
        {
          color: ["#73c990", "#e6a445", "#4972dd"],
          tooltip: { trigger: "axis", axisPointer: { type: "cross" } },
          legend: {
            data: ["充电电量(度)", "充电次数(单)", "订单金额(元)"],
            right: 10,
            top: 4,
          },
          grid: {
            left: "3%",
            right: "4%",
            bottom: 60,
            top: 48,
            containLabel: true,
          },
          xAxis: {
            type: "category",
            boundaryGap: false,
            data: xData,
            axisLabel: {
              rotate: xData.length > 15 ? 30 : 0,
              fontSize: 11,
              color: "#666",
              hideOverlap: true,
            },
          },
          yAxis: [
            {
              type: "value",
              name: "电量/金额",
              splitLine: { lineStyle: { type: "dashed", color: "#eee" } },
            },
            { type: "value", name: "次数", splitLine: { show: false } },
          ],
          dataZoom:
            xData.length > 14
              ? [
                  { type: "inside", start: 0, end: 100 },
                  {
                    type: "slider",
                    height: 16,
                    bottom: 10,
                    start: 0,
                    end: 100,
                  },
                ]
              : undefined,
          series: [
            {
              name: "充电电量(度)",
              type: "line",
              smooth: true,
              showSymbol: false,
              lineStyle: { width: 2.6 },
              areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: "rgba(115,201,144,0.45)" },
                  { offset: 1, color: "rgba(115,201,144,0.04)" },
                ]),
              },
              data: electric,
            },
            {
              name: "订单金额(元)",
              type: "line",
              smooth: true,
              showSymbol: false,
              lineStyle: { width: 2.4 },
              data: amounts,
            },
            {
              name: "充电次数(单)",
              type: "line",
              yAxisIndex: 1,
              smooth: true,
              showSymbol: false,
              lineStyle: { width: 2, type: "dashed" },
              data: counts,
            },
          ],
        },
        true
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
        grid: { left: "3%", right: "4%", bottom: "12%", containLabel: true },
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
  padding: 20px 24px;
  background-color: #f5f7fa;
  box-sizing: border-box;
}

.block-card {
  background: #ffffff;
  border-radius: 14px;
  padding: 22px 24px;
  margin-bottom: 18px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid #f0f2f5;
}

.block-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
  flex-wrap: wrap;
  gap: 12px;
}

.block-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.top-select-group {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

/* 数据卡片 */
.data-card-wrap {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
}

.data-card-item {
  border-radius: 12px;
  padding: 22px 18px;
  color: #fff;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
}
.data-card-item::after {
  content: "";
  position: absolute;
  right: -20px;
  top: -30px;
  width: 100px;
  height: 100px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 50%;
}

.card-green {
  background: linear-gradient(135deg, #68c478 0%, #4fb862 100%);
}
.card-orange {
  background: linear-gradient(135deg, #f7bc4e 0%, #f0a230 100%);
}
.card-blue1 {
  background: linear-gradient(135deg, #63b4ee 0%, #4398d8 100%);
}
.card-purple {
  background: linear-gradient(135deg, #9387f0 0%, #7466e2 100%);
}
.card-blue2 {
  background: linear-gradient(135deg, #598be8 0%, #3b68d0 100%);
}

.data-label {
  font-size: 13px;
  margin-bottom: 10px;
  opacity: 0.92;
}
.data-value {
  font-size: 32px;
  font-weight: 700;
  line-height: 1.1;
  word-break: break-all;
}

/* 实时状态行 */
.status-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
}
.status-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 10px;
  background-color: #f8fafc;
  border-radius: 10px;
}
.status-icon-box {
  font-size: 30px;
}
.status-text small {
  color: #6b7280;
  font-size: 13px;
  display: block;
  margin-bottom: 4px;
}
.status-text .num {
  font-size: 26px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1;
}

/* 图表区域 */
.chart-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}
.chart-card {
  background: #fff;
  border-radius: 14px;
  padding: 20px 22px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid #f0f2f5;
}
.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  flex-wrap: wrap;
  gap: 10px;
}

/* 弹窗自定义样式 */
:deep(.date-range-dialog .el-dialog__body) {
  padding-top: 10px;
}
:deep(.date-range-dialog .el-form-item) {
  margin-bottom: 18px;
}

/* 响应式适配 */
@media screen and (max-width: 1400px) {
  .data-card-wrap {
    grid-template-columns: repeat(3, 1fr);
  }
  .status-row {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media screen and (max-width: 992px) {
  .chart-row {
    grid-template-columns: 1fr;
  }
  .data-card-wrap {
    grid-template-columns: repeat(2, 1fr);
  }
  .status-row {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media screen and (max-width: 640px) {
  .container {
    padding: 12px;
  }
  .block-card {
    padding: 16px;
  }
  .data-card-wrap {
    grid-template-columns: 1fr;
  }
  .status-row {
    grid-template-columns: 1fr;
  }
  .data-value {
    font-size: 26px;
  }
}
</style>
