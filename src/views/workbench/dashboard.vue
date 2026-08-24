<template>
  <div class="charge-overview">
    <!-- 返回按钮 -->
    <div class="page-topbar">
      <el-button
        class="back-btn"
        icon="el-icon-arrow-left"
        size="medium"
        @click="goBack"
        >返回首页</el-button
      >
    </div>

    <div class="page-title">
      <span>充 电 总 览</span>
    </div>

    <div class="card-row card-row-4">
      <div class="stat-card">
        <div class="stat-icon icon-blue">
          <svg viewBox="0 0 1024 1024" width="36" height="36" fill="#fff">
            <path d="M576 64L256 576h192l-64 384 320-512H512l64-384z" />
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-label">累计充电度数（度）</div>
          <div class="stat-value">
            {{ formatNumber(totalData.totalDegrees) }}
          </div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon icon-blue2">
          <svg viewBox="0 0 1024 1024" width="36" height="36" fill="#fff">
            <path
              d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372zm-18-534h-48c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h4v116h-54c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h54v132h-64c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h176c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8h-48V478h60c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8h-60V294h52c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8z"
            />
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-label">累计充电金额（元）</div>
          <div class="stat-value">
            {{ formatNumber(totalData.totalAmount) }}
          </div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon icon-blue3">
          <svg viewBox="0 0 1024 1024" width="36" height="36" fill="#fff">
            <path
              d="M832 384H704V224c0-17.7-14.3-32-32-32H352c-17.7 0-32 14.3-32 32v160H192c-17.7 0-32 14.3-32 32v416c0 17.7 14.3 32 32 32h640c17.7 0 32-14.3 32-32V416c0-17.7-14.3-32-32-32zM384 256h256v128H384V256z m-192 512V448h128v64c0 17.7 14.3 32 32 32h320c17.7 0 32-14.3 32-32v-64h128v320H192v-320z"
            />
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-label">累计充电次数（次）</div>
          <div class="stat-value">{{ formatNumber(totalData.totalTimes) }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon icon-blue4">
          <svg viewBox="0 0 1024 1024" width="36" height="36" fill="#fff">
            <path
              d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372zm35.2-583.2c-21.6-16.8-51.4-14.4-71 4.8L439.6 409.6c-10.4 10.4-15.4 21.8-15.4 36.8v281.6c0 17.6 14.4 32 32 32h92.8c17.6 0 32-14.4 32-32V548.8l58-42c14.4-10.4 20.8-28.8 16.8-47.2l-38.8-122c-5.6-17.6-19.2-30.4-37.8-34zM512 620.8v108.8h-32V524.8l76-56c5.6-4 12.8-5.6 18.4-2.4 5.6 3.2 8.8 9.6 7.2 16l-24.8 80-44.8 60.4z"
            />
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-label">累计充电时长（小时）</div>
          <div class="stat-value">{{ formatNumber(totalData.totalHours) }}</div>
        </div>
      </div>
    </div>

    <div class="card-row">
      <div class="panel-left">
        <div class="today-item">
          <div class="today-icon icon-today1">
            <svg viewBox="0 0 1024 1024" width="48" height="48" fill="#409EFF">
              <path
                d="M832 384H704V224c0-17.7-14.3-32-32-32H352c-17.7 0-32 14.3-32 32v160H192c-17.7 0-32 14.3-32 32v416c0 17.7 14.3 32 32 32h640c17.7 0 32-14.3 32-32V416c0-17.7-14.3-32-32-32zM384 256h256v128H384V256z"
              />
            </svg>
          </div>
          <div class="today-info">
            <div class="today-label">今日充电电量（度）</div>
            <div class="today-value">
              {{ formatNumber(todayData.todayDegrees) }}
            </div>
          </div>
        </div>
        <div class="today-divider"></div>
        <div class="today-item">
          <div class="today-icon icon-today2">
            <svg viewBox="0 0 1024 1024" width="48" height="48" fill="#608cff">
              <path
                d="M832 128H672c-17.7 0-32 14.3-32 32v128h-96v-96c0-17.7-14.3-32-32-32H256c-17.7 0-32 14.3-32 32v672c0 17.7 14.3 32 32 32h576c17.7 0 32-14.3 32-32V160c0-17.7-14.3-32-32-32zM640 224h128v96H640v-96z m-352 64h224v96H288v-96z m480 576H256V448h512v416z"
              />
            </svg>
          </div>
          <div class="today-info">
            <div class="today-label">今日充电收入（元）</div>
            <div class="today-value">
              {{ formatNumber(todayData.todayIncome) }}
            </div>
          </div>
        </div>
      </div>

      <div class="middle-panel">
        <div class="panel-title">
          <span class="title-tag">充电终端监控</span>
          <span class="title-line"></span>
        </div>
        <div class="gauge-row">
          <div class="gauge-item">
            <div id="gauge1" class="gauge-chart"></div>
          </div>
          <div class="gauge-item">
            <div id="gauge2" class="gauge-chart"></div>
          </div>
          <div class="gauge-item">
            <div id="gauge3" class="gauge-chart"></div>
          </div>
        </div>
      </div>

      <div class="right-panel">
        <div class="panel-title">
          <span class="title-tag tag-purple">节能减排</span>
          <span class="title-line"></span>
        </div>
        <div class="energy-item">
          <span class="energy-label">二氧化碳减排：</span>
          <span class="energy-value">
            {{ formatNumber(energyData.co2) }}
            <span class="energy-unit">摩尔</span>
          </span>
        </div>
        <div class="energy-item">
          <span class="energy-label">相当于植树量：</span>
          <span class="energy-value">
            {{ formatNumber(energyData.trees) }}
            <span class="energy-unit">棵</span>
          </span>
        </div>
      </div>
    </div>

    <div class="card-row">
      <div class="yesterday-panel">
        <div class="panel-title">
          <span class="title-tag tag-small"
            >昨日充电汇总（昨日与前一天的对比增长）</span
          >
          <span class="title-line"></span>
        </div>
        <div class="yesterday-grid">
          <div class="yesterday-item">
            <div class="yesterday-label">昨日充电金额（元）</div>
            <div class="yesterday-value">
              {{ formatNumber(yesterdayData.amount) }}
            </div>
            <div class="yesterday-rate rate-up">
              环比：+{{ yesterdayData.amountRate }}%
              <svg
                viewBox="0 0 1024 1024"
                width="14"
                height="14"
                fill="#ff4d4f"
              >
                <path d="M512 128L128 512h224v384h320V512h224z" />
              </svg>
            </div>
          </div>
          <div class="yesterday-item">
            <div class="yesterday-label">昨日充电时长（小时）</div>
            <div class="yesterday-value">
              {{ formatNumber(yesterdayData.hours) }}
            </div>
            <div class="yesterday-rate rate-up">
              环比：+{{ yesterdayData.hoursRate }}%
              <svg
                viewBox="0 0 1024 1024"
                width="14"
                height="14"
                fill="#ff4d4f"
              >
                <path d="M512 128L128 512h224v384h320V512h224z" />
              </svg>
            </div>
          </div>
          <div class="yesterday-item">
            <div class="yesterday-label">昨日充电度数（度）</div>
            <div class="yesterday-value">
              {{ formatNumber(yesterdayData.degrees) }}
            </div>
            <div class="yesterday-rate rate-up">
              环比：+{{ yesterdayData.degreesRate }}%
              <svg
                viewBox="0 0 1024 1024"
                width="14"
                height="14"
                fill="#ff4d4f"
              >
                <path d="M512 128L128 512h224v384h320V512h224z" />
              </svg>
            </div>
          </div>
          <div class="yesterday-item">
            <div class="yesterday-label">昨日充电次数（次）</div>
            <div class="yesterday-value">
              {{ formatNumber(yesterdayData.times) }}
            </div>
            <div class="yesterday-rate rate-up">
              环比：+{{ yesterdayData.timesRate }}%
              <svg
                viewBox="0 0 1024 1024"
                width="14"
                height="14"
                fill="#ff4d4f"
              >
                <path d="M512 128L128 512h224v384h320V512h224z" />
              </svg>
            </div>
          </div>
        </div>
        <div class="rank-list">
          <div class="rank-item rank-1">
            <div class="rank-no">No.1</div>
            <div class="rank-name">同星旭智充站</div>
            <div class="rank-value">2,007.15 度</div>
          </div>
          <div class="rank-item rank-2">
            <div class="rank-no">No.2</div>
            <div class="rank-name">同星东马坊充电站</div>
            <div class="rank-value">1,956.63 度</div>
          </div>
        </div>
      </div>

      <div class="map-panel">
        <div class="map-stats">
          <div class="map-stat-item">
            <span class="map-stat-label">电站数</span>
            <span class="map-stat-value">{{ mapData.stationCount }}</span>
          </div>
          <div class="map-stat-item">
            <span class="map-stat-label">终端数</span>
            <span class="map-stat-value">{{ mapData.terminalCount }}</span>
          </div>
        </div>
        <div id="amap-container" class="amap-chart"></div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from "echarts";

export default {
  name: "ChargeOverview",
  data() {
    return {
      totalData: {
        totalDegrees: 856734.06,
        totalAmount: 524567.37,
        totalTimes: 23582,
        totalHours: 16714.9,
      },
      todayData: {
        todayDegrees: 3934.5,
        todayIncome: 2347.29,
      },
      energyData: {
        co2: 17134681,
        trees: 44550.17,
      },
      yesterdayData: {
        amount: 2306.8,
        amountRate: 1.0,
        hours: 73.52,
        hoursRate: 1.0,
        degrees: 3963.78,
        degreesRate: 4.0,
        times: 114,
        timesRate: 12.0,
      },
      mapData: {
        stationCount: 3,
        terminalCount: 41,
      },
      gaugeChart1: null,
      gaugeChart2: null,
      gaugeChart3: null,
      amap: null,
      stationMarkerList: [],
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.initGaugeCharts();
      this.initAmap();
    });
    window.addEventListener("resize", this.handleResize);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.handleResize);
    if (this.gaugeChart1) this.gaugeChart1.dispose();
    if (this.gaugeChart2) this.gaugeChart2.dispose();
    if (this.gaugeChart3) this.gaugeChart3.dispose();

    if (this.amap) {
      this.stationMarkerList.forEach((mk) => this.amap.remove(mk));
      this.amap.destroy();
      this.stationMarkerList = [];
      this.amap = null;
    }
  },
  methods: {
    formatNumber(num) {
      if (num === null || num === undefined) return "0";
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    handleResize() {
      if (this.gaugeChart1) this.gaugeChart1.resize();
      if (this.gaugeChart2) this.gaugeChart2.resize();
      if (this.gaugeChart3) this.gaugeChart3.resize();
      if (this.amap) this.amap.resize();
    },
    // 返回按钮逻辑
    goBack() {
      // 有历史记录就回退，没有则跳转到工作台首页，按你实际路由修改路径
      if (window.history.length > 1) {
        this.$router.back();
      } else {
        this.$router.push("/workbench/overview");
      }
    },
    initAmap() {
      if (!window.AMap) {
        console.error("高德地图JS未加载，请检查index.html配置");
        return;
      }
      this.amap = new window.AMap.Map("amap-container", {
        zoom: 3,
        center: [104.0, 35.0],
        viewMode: "2D",
        mapStyle: "amap://styles/darkblue",
        showLabel: true,
        zoomEnable: true,
      });

      const stationList = [
        {
          name: "东站充电站",
          lng: 113.65,
          lat: 34.76,
          totalPile: 12,
          freePile: 5,
          address: "郑州市东站东广场",
        },
        {
          name: "高新区产业园充电站",
          lng: 113.53,
          lat: 34.82,
          totalPile: 24,
          freePile: 8,
          address: "高新区科学大道产业园",
        },
      ];
      this.renderStationMarkers(stationList);
    },
    renderStationMarkers(list) {
      const AMap = window.AMap;
      list.forEach((item) => {
        const markerContent = `<div class="charge-marker">⚡</div>`;
        const marker = new AMap.Marker({
          position: [item.lng, item.lat],
          content: markerContent,
          offset: new AMap.Pixel(-16, -34),
        });

        const infoHtml = `
<div class="amap-info">
  <h4>${item.name}</h4>
  <p>地址：${item.address}</p>
  <p>总桩数：${item.totalPile} 个</p>
  <p>空闲桩：${item.freePile} 个</p>
</div>`;
        const infoWin = new AMap.InfoWindow({
          content: infoHtml,
          offset: new AMap.Pixel(0, -30),
        });
        marker.on("click", () => {
          infoWin.open(this.amap, marker.getPosition());
        });
        this.amap.add(marker);
        this.stationMarkerList.push(marker);
      });
    },
    getGaugeOption(value, name, color) {
      return {
        series: [
          {
            type: "gauge",
            radius: "90%",
            center: ["50%", "58%"],
            startAngle: 90,
            endAngle: -270,
            pointer: { show: false },
            progress: {
              show: true,
              overlap: false,
              roundCap: false,
              clip: false,
              itemStyle: {
                color: color,
              },
            },
            axisLine: {
              lineStyle: {
                width: 8,
                color: [[1, "rgba(255,255,255,0.1)"]],
              },
            },
            splitLine: { show: false },
            axisTick: { show: false },
            axisLabel: { show: false },
            data: [{ value: value, name: name }],
            title: {
              offsetCenter: [0, "45%"],
              fontSize: 14,
              color: "#fff",
            },
            detail: {
              fontSize: 22,
              offsetCenter: [0, "-15%"],
              formatter: "{value}%",
              color: "#fff",
              fontWeight: "bold",
            },
          },
        ],
      };
    },
    initGaugeCharts() {
      this.gaugeChart1 = echarts.init(document.getElementById("gauge1"));
      this.gaugeChart2 = echarts.init(document.getElementById("gauge2"));
      this.gaugeChart3 = echarts.init(document.getElementById("gauge3"));

      this.gaugeChart1.setOption(this.getGaugeOption(0, "充电", "#29c7ff"));
      this.gaugeChart2.setOption(this.getGaugeOption(100, "空闲", "#a862ff"));
      this.gaugeChart3.setOption(this.getGaugeOption(0, "异常", "#4c7dff"));
    },
  },
};
</script>

<style scoped>
.charge-overview {
  width: 100%;
  min-height: 100vh;
  background: #060d22;
  background-image: radial-gradient(
      circle at 20% 30%,
      rgba(34, 70, 138, 0.22) 0%,
      transparent 52%
    ),
    radial-gradient(
      circle at 80% 70%,
      rgba(32, 66, 130, 0.16) 0%,
      transparent 52%
    );
  padding: 20px 28px 40px;
  box-sizing: border-box;
  position: relative;
  overflow-x: hidden;
}

.charge-overview::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: radial-gradient(
    rgba(64, 158, 255, 0.05) 1px,
    transparent 1px
  );
  background-size: 32px 32px;
  pointer-events: none;
  z-index: 0;
}

/* 返回按钮 */
.page-topbar {
  position: relative;
  z-index: 2;
  margin-bottom: 22px;
}
.back-btn {
  background: linear-gradient(90deg, #29c7ff, #409eff) !important;
  border: none !important;
  color: #fff !important;
  font-weight: 500;
  box-shadow: 0 3px 12px rgba(64, 158, 255, 0.28);
  transition: all 0.22s ease;
}
.back-btn:hover {
  transform: translateX(-3px);
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.4);
}

/* 页面大标题 */
.page-title {
  text-align: center;
  margin-bottom: 32px;
  position: relative;
  z-index: 1;
}
.page-title span {
  display: inline-block;
  font-size: 36px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 10px;
  padding: 14px 100px 20px;
  background: rgba(64, 158, 255, 0.1);
  clip-path: polygon(8% 0, 92% 0, 100% 100%, 0% 100%);
  text-shadow: 0 0 12px rgba(64, 158, 255, 0.35);
}

.card-row {
  display: flex;
  gap: 18px;
  margin-bottom: 18px;
  position: relative;
  z-index: 1;
}
.card-row-4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  margin-bottom: 18px;
}

/* 顶部统计卡片 */
.stat-card {
  background: rgba(20, 40, 86, 0.52);
  border: 1px solid rgba(64, 158, 255, 0.22);
  border-radius: 12px;
  padding: 22px 20px;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  transition: transform 0.22s ease, box-shadow 0.22s ease;
}
.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 18px rgba(41, 199, 255, 0.12);
  border-color: rgba(64, 158, 255, 0.35);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  flex-shrink: 0;
}
.icon-blue {
  background: radial-gradient(circle, #3a7bd5 0%, #1e4f9e 100%);
}
.icon-blue2 {
  background: radial-gradient(circle, #4a8de8 0%, #2563b8 100%);
}
.icon-blue3 {
  background: radial-gradient(circle, #5a9df5 0%, #2f73c8 100%);
}
.icon-blue4 {
  background: radial-gradient(circle, #6aacff 0%, #3a83d8 100%);
}

.stat-content {
  flex: 1;
  min-width: 0;
}
.stat-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.76);
  margin-bottom: 10px;
}
.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  font-family: "Arial", sans‑serif;
  letter-spacing: 0.5px;
  word-break: break‑all;
}

/* 中层三块面板 */
.panel-left,
.middle-panel,
.right-panel {
  background: rgba(16, 34, 72, 0.6);
  border: 1px solid rgba(64, 158, 255, 0.22);
  border-radius: 12px;
  padding: 20px;
  box-sizing: border-box;
}
.panel-left {
  flex: 1.2;
  display: flex;
  align-items: center;
}
.middle-panel {
  flex: 1;
}
.right-panel {
  flex: 0.75;
}

.today-item {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 8px 12px;
}
.today-icon {
  width: 68px;
  height: 68px;
  border-radius: 10px;
  background: rgba(64, 158, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 14px;
  flex-shrink: 0;
  border: 1px solid rgba(64, 158, 255, 0.2);
}
.today-info {
  flex: 1;
  min-width: 0;
}
.today-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 10px;
}
.today-value {
  font-size: 32px;
  font-weight: 700;
  color: #fff;
  font-family: "Arial", sans‑serif;
  word-break: break‑all;
}
.today-divider {
  width: 1px;
  height: 84px;
  background: linear-gradient(
    180deg,
    transparent,
    rgba(64, 158, 255, 0.32),
    transparent
  );
  flex-shrink: 0;
  margin: 0 10px;
}

/* 面板标题 */
.panel-title {
  display: flex;
  align-items: center;
  margin-bottom: 18px;
}
.title-tag {
  display: inline-block;
  background: linear-gradient(90deg, #29c7ff, #409eff);
  color: #fff;
  padding: 4px 14px;
  font-size: 13px;
  border-radius: 4px;
  position: relative;
  z-index: 1;
}
.title-tag.tag-purple {
  background: linear-gradient(90deg, #8b5cf6, #a862ff);
}
.title-tag.tag-small {
  font-size: 12px;
  padding: 3px 12px;
  background: linear-gradient(90deg, #409eff, #5a9df5);
}
.title-line {
  flex: 1;
  height: 1px;
  background: rgba(64, 158, 255, 0.22);
  margin-left: 10px;
}

/* 仪表盘 */
.gauge-row {
  display: flex;
  justify-content: space‑around;
  align-items: center;
}
.gauge-item {
  width: 33.33%;
}
.gauge-chart {
  width: 100%;
  height: 145px;
}

/* 节能减排模块 */
.energy-item {
  display: flex;
  justify-content: space‑between;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px dashed rgba(64, 158, 255, 0.14);
}
.energy-item:last-child {
  border-bottom: none;
}
.energy-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.74);
}
.energy-value {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  font-family: "Arial", sans‑serif;
}
.energy-unit {
  font-size: 13px;
  font-weight: normal;
  color: rgba(255, 255, 255, 0.58);
  margin-left: 4px;
}

/* 昨日汇总面板 */
.yesterday-panel {
  flex: 1;
  background: rgba(16, 34, 72, 0.6);
  border: 1px solid rgba(64, 158, 255, 0.22);
  border-radius: 12px;
  padding: 20px;
  box-sizing: border‑box;
}
.yesterday-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 22px;
}
.yesterday-item {
  background: rgba(64, 158, 255, 0.06);
  border-left: 3px solid #409eff;
  padding: 14px 16px;
  border-radius: 6px;
}
.yesterday-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
}
.yesterday-value {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  font-family: "Arial", sans‑serif;
  margin-bottom: 8px;
  word-break: break‑all;
}
.yesterday-rate {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.rate‑up {
  color: #ff6b6b;
}
.rate‑down {
  color: #4cd964;
}

/* 排名列表 */
.rank-list {
  display: flex;
  flex-direction: row;
  gap: 12px;
}
.rank-item {
  display: flex;
  align-items: center;
  background: rgba(24, 44, 84, 0.45);
  padding: 14px 18px;
  border-radius: 8px;
}
.rank-no {
  min-width: 72px;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  padding: 4px 10px;
  text-align: center;
  margin-right: 16px;
  border-radius: 4px;
}
.rank-1 .rank-no {
  background: linear-gradient(90deg, #e6a020, #f2b448);
}
.rank-2 .rank-no {
  background: linear-gradient(90deg, #788498, #949fb0);
}
.rank-name {
  flex: 1;
  font-size: 15px;
  color: #fff;
}
.rank-value {
  font-size: 17px;
  font-weight: 700;
  color: #409eff;
  font-family: "Arial", sans‑serif;
}

/* 地图面板 */
.map-panel {
  flex: 0.95;
  background: rgba(16, 34, 72, 0.6);
  border: 1px solid rgba(64, 158, 255, 0.22);
  border-radius: 12px;
  position: relative;
  overflow: hidden;
}
.map-stats {
  position: absolute;
  top: 14px;
  left: 14px;
  z-index: 10;
  display: flex;
  gap: 12px;
}
.map-stat-item {
  background: rgba(14, 32, 66, 0.86);
  border: 1px solid rgba(64, 158, 255, 0.28);
  padding: 8px 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 8px;
}
.map-stat-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 4px;
}
.map-stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  font-family: "Arial", sans‑serif;
}
.amap-chart {
  width: 100%;
  height: 380px;
  background: #070f26;
}
.charge‑marker {
  width: 32px;
  height: 36px;
  background: #0088ff;
  color: #fff;
  text-align: center;
  line-height: 36px;
  border-radius: 6px;
  font-size: 20px;
  box-shadow: 0 0 10px rgba(0, 136, 255, 0.55);
}
.amap‑info {
  color: #ffffff;
  font-size: 13px;
  line-height: 1.6;
}
@media screen and (max‑width: 1600px) {
  .page‑title span {
    font-size: 32px;
    letter-spacing: 8px;
  }
  .stat‑value {
    font-size: 26px;
  }
}
@media screen and (max‑width: 1366px) {
  .card‑row‑4 {
    grid-template-columns: repeat(2, 1fr);
  }
  .card‑row {
    flex-wrap: wrap;
  }
  .panel-left,
  .middle-panel,
  .right-panel,
  .yesterday-panel,
  .map-panel {
    flex: unset;
    width: 100%;
  }
  .yesterday-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media screen and (max‑width: 768px) {
  .charge-overview {
    padding: 14px;
  }
  .page‑title span {
    font-size: 24px;
    padding: 10px 40px;
    letter-spacing: 4px;
  }
  .card‑row‑4 {
    grid-template-columns: 1fr;
  }
  .yesterday-grid {
    grid-template-columns: 1fr;
  }
  .panel-left {
    flex-direction: column;
  }
  .today-divider {
    width: 80%;
    height: 1px;
    margin: 14px 0;
  }
  .gauge-row {
    flex-direction: column;
    gap: 10px;
  }
  .gauge-item {
    width: 100%;
  }
}
</style>
