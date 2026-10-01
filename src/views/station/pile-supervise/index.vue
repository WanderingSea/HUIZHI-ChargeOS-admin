<template>
  <div class="pile-container">
    <!--面包屑-->
    <div class="breadcrumb">
      电站电桩 <span class="div">></span> 电桩监管信息登记
      <span class="div">></span>
      <strong>电桩监管信息登记列表</strong>
    </div>
    <div class="top-action-bar">
      <button class="btn-top btn-blue" @click="showToast('批量更新')">
        批量更新
      </button>
      <button class="btn-top btn-green" @click="showToast('导出文件开始下载')">
        导出
      </button>
    </div>

    <!--提示栏-->
    <div class="tip-bar">
      温馨提示：请根据所在地区监管部门要求提报的信息仔细填写，平台不对信息的准确性负责。
      <a @click="showToast('打开填写指引弹窗')">【查看填写指引】</a>
    </div>

    <!--筛选区域-->
    <div class="filter-card">
      <div class="filter-row">
        <div class="filter-item">
          <label>电桩编号</label>
          <input v-model="searchForm.pileCode" placeholder="请输入电桩编号" />
        </div>
        <div class="filter-item">
          <label>电站名称</label>
          <input
            v-model="searchForm.stationName"
            placeholder="请输入电站名称"
          />
        </div>
        <div class="filter-item">
          <label>计量精准度</label>
          <select v-model="searchForm.precision">
            <option value="">请选择计量精准度</option>
            <option value="0.5S">0.5S</option>
            <option value="0.2S">0.2S</option>
          </select>
        </div>
        <div class="filter-buttons">
          <button class="btn-filter" @click="handleSearch">筛选</button>
          <button class="btn-reset" @click="resetFilter">恢复默认</button>
        </div>
      </div>
      <div class="more-filter" @click="showToast('展开更多筛选条件')">
        更多筛选 ∨
      </div>
    </div>

    <!--表格区域-->
    <div class="table-card">
      <div class="table-title">电桩监管信息登记列表</div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>电桩编号</th>
              <th>电站名称</th>
              <th>运营商名称</th>
              <th>正式投运时间</th>
              <th>设备投资金额(元)</th>
              <th>计量精准度</th>
              <th>电桩电表号</th>
              <th>电桩功率(kw)</th>
              <th>设备号</th>
              <th>更新时间</th>
              <th>操作人</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="pageData.length === 0">
              <td
                colspan="12"
                style="text-align: center; padding: 30px; color: #6b7280"
              >
                暂无数据
              </td>
            </tr>
            <tr v-else v-for="item in pageData" :key="item.pileCode">
              <td>{{ item.pileCode }}</td>
              <td>{{ item.stationName }}</td>
              <td>{{ item.operator }}</td>
              <td>{{ item.runTime || "——" }}</td>
              <td>{{ item.invest || "——" }}</td>
              <td>{{ item.precision || "——" }}</td>
              <td>{{ item.meterNo || "——" }}</td>
              <td>{{ item.power || "——" }}</td>
              <td>{{ item.deviceNo || "——" }}</td>
              <td>{{ item.updateTime || "——" }}</td>
              <td>{{ item.operatorUser || "——" }}</td>
              <td class="operate">
                <button class="btn-edit" @click="openEdit(item)">编辑</button>
                <button class="btn-detail" @click="openDetail(item)">
                  详情
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pagination-wrap">
        <button
          class="page-btn"
          :disabled="currentPage <= 1"
          @click="currentPage--"
        >
          上一页
        </button>
        <span id="pageBox">
          <span
            class="page-num"
            :class="{ active: currentPage === i }"
            v-for="i in totalPage"
            :key="i"
            @click="currentPage = i"
            >{{ i }}</span
          >
        </span>
        <button
          class="page-btn"
          :disabled="currentPage >= totalPage"
          @click="currentPage++"
        >
          下一页
        </button>
        <span>跳至</span>
        <input
          class="page-input"
          v-model="jumpPage"
          @keydown.enter="handleJump"
        />
        <span
          >页 &nbsp;共{{ filterList.length }}条 &nbsp;每页
          <select v-model="pageSize" @change="currentPage = 1">
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option></select
          >条
        </span>
      </div>
    </div>

    <!--编辑弹窗-->
    <div
      class="mask"
      :class="{ show: editVisible }"
      @click="handleMaskClose('edit')"
    >
      <div class="modal" @click.stop>
        <div class="modal-header">编辑电桩监管信息</div>
        <div class="form-grid">
          <div class="form-item">
            <label>电桩编号</label>
            <input v-model="editForm.pileCode" />
          </div>
          <div class="form-item">
            <label>电站名称</label>
            <input v-model="editForm.stationName" />
          </div>
          <div class="form-item">
            <label>运营商名称</label>
            <input v-model="editForm.operator" />
          </div>
          <div class="form-item">
            <label>正式投运时间</label>
            <input v-model="editForm.runTime" type="date" />
          </div>
          <div class="form-item">
            <label>设备投资金额(元)</label>
            <input v-model="editForm.invest" />
          </div>
          <div class="form-item">
            <label>计量精准度</label>
            <select v-model="editForm.precision">
              <option value="">--请选择--</option>
              <option value="0.2S">0.2S</option>
              <option value="0.5S">0.5S</option>
            </select>
          </div>
          <div class="form-item">
            <label>电桩电表号</label>
            <input v-model="editForm.meterNo" />
          </div>
          <div class="form-item">
            <label>电桩功率(kw)</label>
            <input v-model="editForm.power" />
          </div>
          <div class="form-item">
            <label>设备号</label>
            <input v-model="editForm.deviceNo" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="editVisible = false">取消</button>
          <button class="save-btn" @click="saveEdit">保存</button>
        </div>
      </div>
    </div>

    <!--详情弹窗-->
    <div
      class="mask"
      :class="{ show: detailVisible }"
      @click="handleMaskClose('detail')"
    >
      <div class="modal" @click.stop>
        <div class="modal-header">电桩监管信息详情</div>
        <div class="detail-grid">
          <div
            class="detail-item"
            v-for="(item, idx) in detailFields"
            :key="idx"
          >
            <div class="detail-label">{{ item.label }}</div>
            <div class="detail-value">{{ item.value || "——" }}</div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="detailVisible = false">
            关闭
          </button>
        </div>
      </div>
    </div>

    <div class="toast" :class="{ show: toastShow }">{{ toastMsg }}</div>
  </div>
</template>

<script>
export default {
  name: "PileRegisterList",
  data() {
    return {
      sourceData: [
        {
          pileCode: "32010600832249",
          stationName: "同星旭智充站",
          operator: "新乡市牧野区同星机械有限公司",
          runTime: "",
          invest: "",
          precision: "",
          meterNo: "",
          power: "",
          deviceNo: "",
          updateTime: "",
          operatorUser: "",
        },
        {
          pileCode: "32010600832248",
          stationName: "同星旭智充站",
          operator: "新乡市牧野区同星机械有限公司",
          runTime: "",
          invest: "",
          precision: "",
          meterNo: "",
          power: "",
          deviceNo: "",
          updateTime: "",
          operatorUser: "",
        },
        {
          pileCode: "32010601174425",
          stationName: "同星东马坊充电站",
          operator: "新乡市牧野区同星机械有限公司",
          runTime: "",
          invest: "",
          precision: "",
          meterNo: "",
          power: "",
          deviceNo: "",
          updateTime: "2026-04-14 09:37:56",
          operatorUser: "admin",
        },
        {
          pileCode: "32010601129513",
          stationName: "同星东马坊充电站",
          operator: "新乡市牧野区同星机械有限公司",
          runTime: "",
          invest: "",
          precision: "",
          meterNo: "",
          power: "",
          deviceNo: "",
          updateTime: "",
          operatorUser: "",
        },
        {
          pileCode: "32010601047756",
          stationName: "同星东马坊充电站",
          operator: "新乡市牧野区同星机械有限公司",
          runTime: "",
          invest: "",
          precision: "",
          meterNo: "",
          power: "",
          deviceNo: "",
          updateTime: "2025-12-03 17:09:44",
          operatorUser: "admin",
        },
        {
          pileCode: "32010600832246",
          stationName: "同星南桥里充电站",
          operator: "新乡市牧野区同星机械有限公司",
          runTime: "",
          invest: "",
          precision: "",
          meterNo: "",
          power: "",
          deviceNo: "",
          updateTime: "",
          operatorUser: "",
        },
        {
          pileCode: "32010600981460",
          stationName: "同星东马坊充电站",
          operator: "新乡市牧野区同星机械有限公司",
          runTime: "",
          invest: "",
          precision: "",
          meterNo: "",
          power: "",
          deviceNo: "",
          updateTime: "2026-09-01 06:50:30",
          operatorUser: "admin",
        },
        {
          pileCode: "32010600981459",
          stationName: "同星东马坊充电站",
          operator: "新乡市牧野区同星机械有限公司",
          runTime: "",
          invest: "",
          precision: "",
          meterNo: "",
          power: "",
          deviceNo: "",
          updateTime: "2026-09-01 06:50:30",
          operatorUser: "admin",
        },
        {
          pileCode: "32010600964370",
          stationName: "同星南桥里充电站",
          operator: "新乡市牧野区同星机械有限公司",
          runTime: "",
          invest: "",
          precision: "",
          meterNo: "",
          power: "",
          deviceNo: "",
          updateTime: "2025-09-25 16:10:26",
          operatorUser: "admin",
        },
        {
          pileCode: "32010600964369",
          stationName: "同星南桥里充电站",
          operator: "新乡市牧野区同星机械有限公司",
          runTime: "",
          invest: "",
          precision: "",
          meterNo: "",
          power: "",
          deviceNo: "",
          updateTime: "2025-09-25 16:10:26",
          operatorUser: "admin",
        },
        {
          pileCode: "32010600832250",
          stationName: "同星旭智充站",
          operator: "新乡市牧野区同星机械有限公司",
          runTime: "",
          invest: "",
          precision: "",
          meterNo: "",
          power: "",
          deviceNo: "",
          updateTime: "",
          operatorUser: "",
        },
        {
          pileCode: "32010600832251",
          stationName: "同星旭智充站",
          operator: "新乡市牧野区同星机械有限公司",
          runTime: "",
          invest: "",
          precision: "",
          meterNo: "",
          power: "",
          deviceNo: "",
          updateTime: "",
          operatorUser: "admin",
        },
      ],
      filterList: [],
      searchForm: {
        pileCode: "",
        stationName: "",
        precision: "",
      },
      currentPage: 1,
      pageSize: 10,
      jumpPage: 1,

      editVisible: false,
      editForm: {},
      editOriginRow: null,

      detailVisible: false,
      detailFields: [],

      toastShow: false,
      toastMsg: "",
    };
  },
  computed: {
    totalPage() {
      return Math.max(1, Math.ceil(this.filterList.length / this.pageSize));
    },
    pageData() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.filterList.slice(start, start + this.pageSize);
    },
  },
  watch: {
    currentPage(val) {
      this.jumpPage = val;
    },
  },
  mounted() {
    this.filterList = [...this.sourceData];
  },
  methods: {
    showToast(msg) {
      this.toastMsg = msg;
      this.toastShow = true;
      setTimeout(() => {
        this.toastShow = false;
      }, 1800);
    },
    //筛选
    handleSearch() {
      const pCode = this.searchForm.pileCode.trim();
      const sName = this.searchForm.stationName.trim();
      const pre = this.searchForm.precision;
      this.filterList = this.sourceData.filter((row) => {
        let matchPile = !pCode || row.pileCode.includes(pCode);
        let matchStation = !sName || row.stationName.includes(sName);
        let matchPrecision = !pre || row.precision === pre;
        return matchPile && matchStation && matchPrecision;
      });
      this.currentPage = 1;
      this.showToast("筛选完成");
    },
    resetFilter() {
      this.searchForm = { pileCode: "", stationName: "", precision: "" };
      this.filterList = [...this.sourceData];
      this.currentPage = 1;
      this.showToast("筛选条件已重置");
    },
    handleJump() {
      let p = parseInt(this.jumpPage) || 1;
      p = Math.min(Math.max(1, p), this.totalPage);
      this.currentPage = p;
    },
    //编辑
    openEdit(row) {
      this.editOriginRow = row;
      this.editForm = { ...row };
      this.editVisible = true;
    },
    saveEdit() {
      const idx = this.sourceData.findIndex(
        (x) => x.pileCode === this.editOriginRow.pileCode
      );
      const now = new Date();
      const timeStr = `${now.getFullYear()}-${String(
        now.getMonth() + 1
      ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(
        now.getHours()
      ).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(
        now.getSeconds()
      ).padStart(2, "0")}`;
      this.sourceData[idx] = {
        ...this.editForm,
        updateTime: timeStr,
        operatorUser: "admin",
      };
      this.filterList = [...this.sourceData];
      this.editVisible = false;
      this.showToast("保存成功！");
    },
    //详情
    openDetail(row) {
      this.detailFields = [
        { label: "电桩编号", value: row.pileCode },
        { label: "电站名称", value: row.stationName },
        { label: "运营商名称", value: row.operator },
        { label: "正式投运时间", value: row.runTime },
        { label: "设备投资金额(元)", value: row.invest },
        { label: "计量精准度", value: row.precision },
        { label: "电桩电表号", value: row.meterNo },
        { label: "电桩功率(kw)", value: row.power },
        { label: "设备号", value: row.deviceNo },
        { label: "更新时间", value: row.updateTime },
        { label: "操作人", value: row.operatorUser },
      ];
      this.detailVisible = true;
    },
    handleMaskClose(type) {
      if (type === "edit") this.editVisible = false;
      if (type === "detail") this.detailVisible = false;
    },
  },
};
</script>

<style scoped>
/* ================= 基础重置 ================= */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* ================= 容器 & 冷调主题变量 ================= */
.pile-container {
  /* 冷调清雅色板 · 白色底 */
  --bg: #ffffff;
  --card: #ffffff;
  --ink: #1f2a37;
  --ink-2: #5a6b7b;
  --ink-3: #94a3b3;
  --ink-4: #c3ced9;
  --line: #e4eaf1;
  --line-2: #eef3f8;
  --accent: #6b8fb0; /* 主色：柔和钢蓝 */
  --accent-2: #4f7295; /* 主色加深 */
  --accent-soft: #e9f0f6;
  --ice: #82a8c4; /* 辅色：冰蓝 */
  --ice-soft: #e8f2f8;

  min-height: 100vh;
  padding: 32px 40px 64px;
  background-color: var(--bg);
  color: var(--ink);
  font-size: 14px;
  line-height: 1.6;
  letter-spacing: 0.2px;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC",
    "Hiragino Sans GB", "Microsoft YaHei", system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ================= 面包屑 ================= */
.breadcrumb {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: -20px;
  font-size: 13px;
  color: var(--ink-3);
}
.breadcrumb .div {
  color: var(--ink-4);
  font-size: 11px;
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

/* ================= 顶部功能按钮 ================= */
.top-action-bar {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
}
.btn-top {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 34px;
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
.btn-blue {
  color: var(--accent-2);
}
.btn-blue:hover {
  color: #fff;
  background: linear-gradient(135deg, #6b8fb0 0%, #4f7295 100%);
  border-color: transparent;
  transform: translateY(-1px);
  box-shadow: 0 10px 22px -10px rgba(79, 114, 149, 0.85);
}
.btn-green {
  color: #4f7295;
}
.btn-green:hover {
  color: #fff;
  background: linear-gradient(135deg, #82a8c4 0%, #5e88ab 100%);
  border-color: transparent;
  transform: translateY(-1px);
  box-shadow: 0 10px 22px -10px rgba(94, 136, 171, 0.85);
}

/* ================= 提示栏 ================= */
.tip-bar {
  position: relative;
  padding: 14px 20px 14px 48px;
  margin-bottom: 20px;
  font-size: 13px;
  line-height: 1.75;
  color: #4f7295;
  background: linear-gradient(135deg, #f3f8fc 0%, #eef6fb 100%);
  border: 1px solid #dceaf4;
  border-radius: 14px;
}
.tip-bar::before {
  content: "";
  position: absolute;
  left: 22px;
  top: 20px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--ice);
  box-shadow: 0 0 0 4px rgba(130, 168, 196, 0.18);
}
.tip-bar a {
  color: var(--accent-2);
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  border-bottom: 1px dashed rgba(79, 114, 149, 0.5);
  transition: all 0.2s ease;
}
.tip-bar a:hover {
  color: #3d5a77;
  border-bottom-color: #3d5a77;
}

/* ================= 筛选卡片 ================= */
.filter-card {
  padding: 24px 26px;
  margin-bottom: 18px;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 18px;
  box-shadow: 0 1px 2px rgba(31, 42, 55, 0.03),
    0 10px 28px -22px rgba(31, 42, 55, 0.28);
}
.filter-row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 18px;
}
.filter-item label {
  display: block;
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.6px;
  color: var(--ink-2);
}
.filter-item input,
.filter-item select {
  width: 240px;
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
.filter-item input:hover,
.filter-item select:hover {
  border-color: #cdd9e4;
}
.filter-item input:focus,
.filter-item select:focus {
  outline: none;
  background: #fff;
  border-color: var(--accent);
  box-shadow: 0 0 0 4px rgba(107, 143, 176, 0.12);
}
.filter-buttons {
  display: flex;
  gap: 10px;
}
.btn-filter {
  height: 38px;
  padding: 0 22px;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.5px;
  color: #fff;
  background: linear-gradient(135deg, #6b8fb0 0%, #4f7295 100%);
  border: 1px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 0 8px 18px -10px rgba(79, 114, 149, 0.9);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.btn-filter:hover {
  background: linear-gradient(135deg, #4f7295 0%, #3d5a77 100%);
  transform: translateY(-1px);
  box-shadow: 0 12px 24px -10px rgba(79, 114, 149, 0.95);
}
.btn-filter:active {
  transform: translateY(0);
}
.btn-reset {
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
.btn-reset:hover {
  color: var(--accent-2);
  background: var(--accent-soft);
  border-color: var(--accent);
}
.more-filter {
  width: fit-content;
  margin: 16px auto 0;
  padding: 6px 16px;
  font-size: 13px;
  color: var(--accent);
  border-radius: 999px;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s ease, color 0.2s ease;
}
.more-filter:hover {
  background: var(--accent-soft);
  color: var(--accent-2);
}

/* ================= 表格卡片 ================= */
.table-card {
  padding-bottom: 20px;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(31, 42, 55, 0.03),
    0 10px 28px -22px rgba(31, 42, 55, 0.28);
}
.table-title {
  position: relative;
  padding: 22px 26px 16px 40px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.8px;
  color: var(--ink);
}
.table-title::before {
  content: "";
  position: absolute;
  left: 26px;
  top: 26px;
  bottom: 20px;
  width: 3px;
  border-radius: 2px;
  background: linear-gradient(180deg, var(--accent) 0%, var(--ice) 100%);
}
.table-title::after {
  content: "";
  position: absolute;
  left: 26px;
  right: 26px;
  bottom: 0;
  height: 1px;
  background: var(--line-2);
}

.table-wrap {
  overflow-x: auto;
  padding: 0 14px;
}
.table-wrap::-webkit-scrollbar {
  height: 8px;
}
.table-wrap::-webkit-scrollbar-track {
  background: transparent;
}
.table-wrap::-webkit-scrollbar-thumb {
  background: #d3dde6;
  border-radius: 4px;
}
.table-wrap::-webkit-scrollbar-thumb:hover {
  background: #bccad6;
}

table {
  width: 100%;
  min-width: 1350px;
  border-collapse: separate;
  border-spacing: 0;
}
thead tr {
  background: transparent;
}
thead th {
  padding: 12px 14px;
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: 1px;
  text-align: left;
  white-space: nowrap;
  color: var(--ink-3);
  background: #f6f9fc;
  border-top: 1px solid var(--line-2);
  border-bottom: 1px solid var(--line-2);
}
thead th:first-child {
  border-radius: 10px 0 0 10px;
  border-left: 1px solid var(--line-2);
}
thead th:last-child {
  border-radius: 0 10px 10px 0;
  border-right: 1px solid var(--line-2);
}

tbody td {
  padding: 16px 14px;
  font-size: 13px;
  color: var(--ink-2);
  white-space: nowrap;
  border-bottom: 1px solid var(--line-2);
  transition: background 0.22s ease, color 0.22s ease;
}
tbody tr:last-child td {
  border-bottom: none;
}
tbody tr:hover td {
  background: #f7fbfe;
  color: var(--ink);
}

/* 操作按钮 */
.operate {
  white-space: nowrap;
}
.operate button {
  padding: 5px 11px;
  margin: 0 4px 0 0;
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0.3px;
  background: transparent;
  border: none;
  border-radius: 7px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-edit {
  color: var(--accent-2);
}
.btn-edit:hover {
  background: var(--accent-soft);
}
.btn-detail {
  color: #4f7295;
}
.btn-detail:hover {
  background: var(--ice-soft);
}

/* ================= 分页 ================= */
.pagination-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 6px;
  padding: 22px 26px 4px;
  margin-top: 6px;
  font-size: 12.5px;
  color: var(--ink-3);
  border-top: 1px solid var(--line-2);
}
.page-btn {
  height: 32px;
  padding: 0 14px;
  font-size: 12.5px;
  color: var(--ink-2);
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.22s ease;
}
.page-btn:hover:not(:disabled) {
  color: var(--accent-2);
  background: var(--accent-soft);
  border-color: var(--accent);
}
.page-btn:disabled {
  color: var(--ink-4);
  background: #f8fbfd;
  cursor: not-allowed;
}
.page-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  margin: 0 2px;
  font-size: 12.5px;
  color: var(--ink-2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.22s ease;
}
.page-num:hover {
  background: #eef4f9;
  color: var(--ink);
}
.page-num.active {
  color: #fff;
  background: linear-gradient(135deg, #6b8fb0 0%, #4f7295 100%);
  box-shadow: 0 6px 14px -6px rgba(79, 114, 149, 0.85);
}
.page-input {
  width: 48px;
  height: 32px;
  padding: 0 4px;
  font-size: 13px;
  text-align: center;
  color: var(--ink);
  background: #f8fbfd;
  border: 1px solid var(--line);
  border-radius: 8px;
  transition: all 0.22s ease;
  font-variant-numeric: tabular-nums;
}
.page-input:focus {
  outline: none;
  background: #fff;
  border-color: var(--accent);
  box-shadow: 0 0 0 4px rgba(107, 143, 176, 0.12);
}
.pagination-wrap select {
  height: 32px;
  padding: 0 8px;
  margin: 0 4px;
  font-size: 12.5px;
  color: var(--ink-2);
  background: #f8fbfd;
  border: 1px solid var(--line);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.22s ease;
}
.pagination-wrap select:hover,
.pagination-wrap select:focus {
  outline: none;
  background: #fff;
  border-color: var(--accent);
}

/* ================= 弹窗 ================= */
.mask {
  position: fixed;
  inset: 0;
  z-index: 999;
  display: none;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(31, 42, 55, 0.35);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}
.mask.show {
  display: flex;
}
.modal {
  width: 680px;
  max-width: 92vw;
  max-height: 86vh;
  overflow-y: auto;
  padding: 28px 32px;
  background: #fff;
  border-radius: 22px;
  box-shadow: 0 32px 80px -32px rgba(31, 42, 55, 0.55);
  animation: modalIn 0.32s cubic-bezier(0.16, 1, 0.3, 1);
}
.modal::-webkit-scrollbar {
  width: 6px;
}
.modal::-webkit-scrollbar-thumb {
  background: #d3dde6;
  border-radius: 3px;
}
.modal-header {
  position: relative;
  padding-left: 14px;
  margin-bottom: 24px;
  padding-bottom: 18px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.8px;
  color: var(--ink);
  border-bottom: 1px solid var(--line-2);
}
.modal-header::before {
  content: "";
  position: absolute;
  left: 0;
  top: 3px;
  bottom: 21px;
  width: 3px;
  border-radius: 2px;
  background: linear-gradient(180deg, var(--accent) 0%, var(--ice) 100%);
}

/* 表单 */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.form-item label {
  display: block;
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.5px;
  color: var(--ink-2);
}
.form-item input,
.form-item select {
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
.form-item input:focus,
.form-item select:focus {
  outline: none;
  background: #fff;
  border-color: var(--accent);
  box-shadow: 0 0 0 4px rgba(107, 143, 176, 0.12);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 26px;
  padding-top: 20px;
  border-top: 1px solid var(--line-2);
}
.modal-footer button {
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
.cancel-btn {
  color: var(--ink-2);
  background: #fff;
  border-color: var(--line);
}
.cancel-btn:hover {
  color: var(--accent-2);
  background: var(--accent-soft);
  border-color: var(--accent);
}
.save-btn {
  color: #fff;
  background: linear-gradient(135deg, #6b8fb0 0%, #4f7295 100%);
  box-shadow: 0 8px 18px -10px rgba(79, 114, 149, 0.9);
}
.save-btn:hover {
  background: linear-gradient(135deg, #4f7295 0%, #3d5a77 100%);
  transform: translateY(-1px);
  box-shadow: 0 12px 24px -10px rgba(79, 114, 149, 0.95);
}
.save-btn:active {
  transform: translateY(0);
}

/* 详情 */
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.detail-item {
  padding: 14px 16px;
  background: #f8fbfd;
  border: 1px solid transparent;
  border-radius: 12px;
  transition: all 0.22s ease;
}
.detail-item:hover {
  background: #fff;
  border-color: var(--line);
  box-shadow: 0 4px 14px -10px rgba(31, 42, 55, 0.35);
}
.detail-label {
  margin-bottom: 6px;
  font-size: 11.5px;
  letter-spacing: 0.6px;
  color: var(--ink-3);
}
.detail-value {
  font-size: 13.5px;
  font-weight: 500;
  color: var(--ink);
  word-break: break-all;
}

/* ================= Toast ================= */
.toast {
  position: fixed;
  left: 50%;
  bottom: 44px;
  z-index: 1000;
  display: none;
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
}
.toast.show {
  display: block;
  animation: toastIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

/* ================= 动画 ================= */
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

/* ================= 响应式 ================= */
@media (max-width: 1024px) {
  .pile-container {
    padding: 24px 22px 48px;
  }
  .form-grid,
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 640px) {
  .pile-container {
    padding: 20px 16px 40px;
  }
  .breadcrumb {
    gap: 6px;
  }
  .filter-item input,
  .filter-item select {
    width: 100%;
  }
  .filter-item {
    flex: 1 1 100%;
  }
  .filter-buttons {
    width: 100%;
  }
  .filter-buttons .btn-filter,
  .filter-buttons .btn-reset {
    flex: 1;
  }
  .filter-card {
    padding: 18px 16px;
    border-radius: 16px;
  }
  .table-title {
    padding: 20px 18px 14px 34px;
  }
  .table-title::before {
    left: 18px;
    top: 24px;
  }
  .table-title::after {
    left: 18px;
    right: 18px;
  }
  .modal {
    padding: 22px 20px;
    border-radius: 18px;
  }
}
</style>
