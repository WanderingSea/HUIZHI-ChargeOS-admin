<template>
  <div class="page-container">
    <!-- 面包屑 -->
    <div class="breadcrumb-wrap">
      <div class="breadcrumb">
        电站电桩 <span class="divider">/</span> 电站设置
        <span class="divider">/</span> 电站监管信息登记
        <span class="divider">/</span> <strong>电站监管信息登记列表</strong>
      </div>
      <button class="btn-export" @click="showToast('导出数据已开始下载')">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        导出
      </button>
    </div>

    <!-- 提示条 -->
    <div class="tip-alert">
      温馨提示：信息填写错误可能影响补贴申报，平台不对您提交信息的准确性负责。请根据所在地区监管部门要求提报的信息仔细填写，核对无误后提交；
      <a class="tip-link" @click="showToast('打开填写指引')"
        >【查看填写指引】</a
      >
    </div>

    <!-- 筛选卡片 -->
    <div class="card filter-card">
      <div class="filter-row">
        <div class="filter-item">
          <label>电站ID</label>
          <input
            v-model="searchForm.stationId"
            placeholder="请输入电站ID"
            @keydown.enter="handleSearch"
          />
        </div>
        <div class="filter-item">
          <label>电站名称</label>
          <input
            v-model="searchForm.stationName"
            placeholder="请输入电站名称"
            @keydown.enter="handleSearch"
          />
        </div>
        <div class="filter-actions">
          <button class="btn btn-primary" @click="handleSearch">筛选</button>
          <button class="btn btn-default" @click="resetSearch">恢复默认</button>
        </div>
      </div>
    </div>

    <!-- 表格卡片 -->
    <div class="card table-card">
      <div class="table-title">电站监管信息登记列表</div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>电站ID</th>
              <th>电站名称</th>
              <th>运营商名称</th>
              <th>建站时间</th>
              <th>正式投运时间</th>
              <th>充电站备案号</th>
              <th>是否独立报装</th>
              <th>补贴申报公司</th>
              <th>更新时间</th>
              <th>操作人</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="tableList.length === 0">
              <td colspan="11" class="empty-cell">—— 暂无数据 ——</td>
            </tr>
            <tr v-else v-for="row in tableList" :key="row.stationId">
              <td class="cell-id">{{ row.stationId }}</td>
              <td class="cell-name">{{ row.stationName }}</td>
              <td>{{ row.operatorName }}</td>
              <td>{{ row.buildTime || "——" }}</td>
              <td>{{ row.runTime || "——" }}</td>
              <td>{{ row.recordNo || "——" }}</td>
              <td>{{ row.isSeparateInstall || "——" }}</td>
              <td>{{ row.subsidyCompany || "——" }}</td>
              <td class="cell-time">{{ row.updateTime || "——" }}</td>
              <td>{{ row.operator || "——" }}</td>
              <td class="cell-ops">
                <button class="op-btn edit" @click="openEdit(row)">编辑</button>
                <button class="op-btn detail" @click="openDetail(row)">
                  详情
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div class="pagination">
        <button class="page-btn" :disabled="page <= 1" @click="page--">
          上一页
        </button>
        <span
          v-for="num in totalPage"
          :key="num"
          class="page-num"
          :class="{ current: num === page }"
          @click="page = num"
          >{{ num }}</span
        >
        <button class="page-btn" :disabled="page >= totalPage" @click="page++">
          下一页
        </button>
        <span class="page-meta">跳至</span>
        <input
          class="jump-input"
          v-model.number="page"
          @keydown.enter="jumpPage"
        />
        <span class="page-meta">页</span>
        <span class="page-meta">共 {{ filteredData.length }} 条 / 每页</span>
        <select
          class="size-select"
          v-model.number="pageSize"
          @change="page = 1"
        >
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
        <span class="page-meta">条</span>
      </div>
    </div>

    <!-- 编辑弹窗 -->
    <div class="mask" :class="{ show: editVisible }" @click.self="closeEdit">
      <div class="modal">
        <h3>编辑电站监管信息</h3>
        <div class="form-grid">
          <div class="form-item">
            <label><span class="req">*</span>电站ID</label>
            <input v-model="editForm.stationId" />
          </div>
          <div class="form-item">
            <label><span class="req">*</span>电站名称</label>
            <input v-model="editForm.stationName" />
          </div>
          <div class="form-item">
            <label>运营商名称</label>
            <input v-model="editForm.operatorName" />
          </div>
          <div class="form-item">
            <label>建站时间</label>
            <input v-model="editForm.buildTime" type="date" />
          </div>
          <div class="form-item">
            <label>正式投运时间</label>
            <input v-model="editForm.runTime" type="date" />
          </div>
          <div class="form-item">
            <label>充电站备案号</label>
            <input v-model="editForm.recordNo" />
          </div>
          <div class="form-item">
            <label>是否独立报装</label>
            <select v-model="editForm.isSeparateInstall">
              <option value="是">是</option>
              <option value="否(转供电)">否(转供电)</option>
            </select>
          </div>
          <div class="form-item">
            <label>补贴申报公司</label>
            <input v-model="editForm.subsidyCompany" />
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn btn-default" @click="closeEdit">取消</button>
          <button class="btn btn-primary" @click="saveEdit">保存</button>
        </div>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <div
      class="mask"
      :class="{ show: detailVisible }"
      @click.self="closeDetail"
    >
      <div class="modal">
        <h3>电站监管信息详情</h3>
        <div class="detail-grid">
          <div class="d-item" v-for="item in detailList" :key="item.label">
            <div class="k">{{ item.label }}</div>
            <div class="v">{{ item.value || "——" }}</div>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn btn-default" @click="closeDetail">关闭</button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div class="toast" :class="{ show: toastShow }">{{ toastMsg }}</div>
  </div>
</template>

<script>
export default {
  name: "StationList",
  data() {
    return {
      // 原始数据
      tableData: [
        {
          stationId: "347832",
          stationName: "同星南桥里充电站",
          operatorName: "新乡市牧野区同星机械有限公司",
          buildTime: "2025-09-25",
          runTime: "2025-09-25",
          recordNo: "",
          isSeparateInstall: "否(转供电)",
          subsidyCompany: "新乡市牧野区同星机械有限公司",
          updateTime: "2025-09-25 16:30:12",
          operator: "admin",
        },
        {
          stationId: "283613",
          stationName: "同星东马坊充充电站",
          operatorName: "新乡市牧野区同星机械有限公司",
          buildTime: "2025-05-10",
          runTime: "2025-05-10",
          recordNo: "",
          isSeparateInstall: "否(转供电)",
          subsidyCompany: "新乡市牧野区同星机械有限公司",
          updateTime: "2025-05-10 15:12:48",
          operator: "admin",
        },
        {
          stationId: "439830",
          stationName: "同星旭智充站",
          operatorName: "新乡市牧野区同星机械有限公司",
          buildTime: "",
          runTime: "",
          recordNo: "",
          isSeparateInstall: "",
          subsidyCompany: "",
          updateTime: "",
          operator: "",
        },
      ],
      searchForm: {
        stationId: "",
        stationName: "",
      },
      // 分页
      page: 1,
      pageSize: 10,
      // 弹窗
      editVisible: false,
      detailVisible: false,
      editForm: {},
      detailList: [],
      // toast
      toastShow: false,
      toastMsg: "",
    };
  },
  computed: {
    filteredData() {
      const id = this.searchForm.stationId.trim();
      const name = this.searchForm.stationName.trim().toLowerCase();
      return this.tableData.filter((row) => {
        const matchId = !id || row.stationId.includes(id);
        const matchName = !name || row.stationName.toLowerCase().includes(name);
        return matchId && matchName;
      });
    },
    tableList() {
      const start = (this.page - 1) * this.pageSize;
      return this.filteredData.slice(start, start + this.pageSize);
    },
    totalPage() {
      return Math.max(1, Math.ceil(this.filteredData.length / this.pageSize));
    },
  },
  methods: {
    showToast(msg) {
      this.toastMsg = msg;
      this.toastShow = true;
      setTimeout(() => {
        this.toastShow = false;
      }, 1800);
    },
    handleSearch() {
      this.page = 1;
      this.showToast("筛选完成");
    },
    resetSearch() {
      this.searchForm.stationId = "";
      this.searchForm.stationName = "";
      this.page = 1;
      this.showToast("已重置筛选条件");
    },
    jumpPage() {
      if (this.page < 1) this.page = 1;
      if (this.page > this.totalPage) this.page = this.totalPage;
    },
    openEdit(row) {
      this.editForm = JSON.parse(JSON.stringify(row));
      this.editVisible = true;
    },
    closeEdit() {
      this.editVisible = false;
    },
    saveEdit() {
      const idx = this.tableData.findIndex(
        (item) => item.stationId === this.editForm.stationId
      );
      if (idx > -1) {
        const now = new Date();
        this.editForm.updateTime = `${now.getFullYear()}-${String(
          now.getMonth() + 1
        ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(
          now.getHours()
        ).padStart(2, "0")}:${String(now.getMinutes()).padStart(
          2,
          "0"
        )}:${String(now.getSeconds()).padStart(2, "0")}`;
        this.editForm.operator = "admin";
        this.tableData.splice(idx, 1, this.editForm);
      }
      this.closeEdit();
      this.showToast("保存成功");
    },
    openDetail(row) {
      this.detailList = [
        { label: "电站ID", value: row.stationId },
        { label: "电站名称", value: row.stationName },
        { label: "运营商名称", value: row.operatorName },
        { label: "建站时间", value: row.buildTime },
        { label: "正式投运时间", value: row.runTime },
        { label: "充电站备案号", value: row.recordNo },
        { label: "是否独立报装", value: row.isSeparateInstall },
        { label: "补贴申报公司", value: row.subsidyCompany },
        { label: "更新时间", value: row.updateTime },
        { label: "操作人", value: row.operator },
      ];
      this.detailVisible = true;
    },
    closeDetail() {
      this.detailVisible = false;
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

/* ================= 页面容器 & 冷调主题变量 ================= */
.page-container {
  /* 冷调清雅色板 · 白色底 */
  --bg: #ffffff;
  --bg-2: #fbfcfd;
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

/* ================= 面包屑 & 导出 ================= */
.breadcrumb-wrap {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 22px;
  font-size: 13px;
  color: var(--ink-3);
}
.breadcrumb {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.breadcrumb .divider {
  color: var(--ink-4);
  font-size: 11px;
}
.breadcrumb strong {
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

.btn-export {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 34px;
  padding: 0 18px;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.4px;
  color: var(--accent-2);
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 999px;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(31, 42, 55, 0.03);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.btn-export:hover {
  color: #fff;
  background: linear-gradient(135deg, #6b8fb0 0%, #4f7295 100%);
  border-color: transparent;
  transform: translateY(-1px);
  box-shadow: 0 10px 22px -10px rgba(79, 114, 149, 0.85);
}
.btn-export svg {
  transition: transform 0.25s ease;
}
.btn-export:hover svg {
  transform: translateY(1px);
}

/* ================= 提示条 ================= */
.tip-alert {
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
.tip-alert::before {
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
.tip-link {
  color: var(--accent-2);
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  border-bottom: 1px dashed rgba(79, 114, 149, 0.5);
  transition: all 0.2s ease;
}
.tip-link:hover {
  color: #3d5a77;
  border-bottom-color: #3d5a77;
}

/* ================= 卡片 ================= */
.card {
  padding: 24px 26px;
  margin-bottom: 18px;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 18px;
  box-shadow: 0 1px 2px rgba(31, 42, 55, 0.03),
    0 10px 28px -22px rgba(31, 42, 55, 0.28);
}

/* ================= 筛选 ================= */
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
.filter-item input {
  width: 260px;
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
.filter-item input:hover {
  border-color: #cdd9e4;
}
.filter-item input:focus {
  outline: none;
  background: #fff;
  border-color: var(--accent);
  box-shadow: 0 0 0 4px rgba(107, 143, 176, 0.12);
}
.filter-actions {
  display: flex;
  gap: 10px;
}

/* ================= 按钮 ================= */
.btn {
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
.btn-primary {
  color: #fff;
  background: linear-gradient(135deg, #6b8fb0 0%, #4f7295 100%);
  box-shadow: 0 8px 18px -10px rgba(79, 114, 149, 0.9);
}
.btn-primary:hover {
  background: linear-gradient(135deg, #4f7295 0%, #3d5a77 100%);
  transform: translateY(-1px);
  box-shadow: 0 12px 24px -10px rgba(79, 114, 149, 0.95);
}
.btn-primary:active {
  transform: translateY(0);
}
.btn-default {
  color: var(--ink-2);
  background: #fff;
  border-color: var(--line);
}
.btn-default:hover {
  color: var(--accent-2);
  background: var(--accent-soft);
  border-color: var(--accent);
}

/* ================= 表格 ================= */
.table-card {
  padding-bottom: 20px;
}
.table-title {
  position: relative;
  padding: 0 0 16px 14px;
  margin-bottom: 6px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.8px;
  color: var(--ink);
}
.table-title::before {
  content: "";
  position: absolute;
  left: 0;
  top: 4px;
  bottom: 20px;
  width: 3px;
  border-radius: 2px;
  background: linear-gradient(180deg, var(--accent) 0%, var(--ice) 100%);
}
.table-title::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 1px;
  background: var(--line-2);
}

.table-wrap {
  overflow-x: auto;
  margin: 0 -6px;
  padding: 0 6px;
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
  min-width: 1300px;
  border-collapse: separate;
  border-spacing: 0;
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
.cell-id {
  font-weight: 500;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.4px;
}
.cell-name {
  font-weight: 500;
  color: var(--ink);
}
.cell-time {
  font-variant-numeric: tabular-nums;
  color: var(--ink-3);
  font-size: 12.5px;
}
.empty-cell {
  padding: 64px 0 !important;
  text-align: center;
  font-size: 13px;
  letter-spacing: 3px;
  color: var(--ink-4) !important;
  background: transparent !important;
}

/* 操作按钮 */
.cell-ops {
  white-space: nowrap;
}
.op-btn {
  padding: 5px 11px;
  margin-right: 4px;
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0.3px;
  background: transparent;
  border: none;
  border-radius: 7px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.op-btn.edit {
  color: var(--accent-2);
}
.op-btn.edit:hover {
  background: var(--accent-soft);
}
.op-btn.detail {
  color: #4f7295;
}
.op-btn.detail:hover {
  background: var(--ice-soft);
}

/* ================= 分页 ================= */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
  padding-top: 22px;
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
.page-num.current {
  color: #fff;
  background: linear-gradient(135deg, #6b8fb0 0%, #4f7295 100%);
  box-shadow: 0 6px 14px -6px rgba(79, 114, 149, 0.85);
}
.page-meta {
  color: var(--ink-3);
  letter-spacing: 0.3px;
}
.jump-input {
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
.jump-input:focus {
  outline: none;
  background: #fff;
  border-color: var(--accent);
  box-shadow: 0 0 0 4px rgba(107, 143, 176, 0.12);
}
.size-select {
  height: 32px;
  padding: 0 8px;
  font-size: 12.5px;
  color: var(--ink-2);
  background: #f8fbfd;
  border: 1px solid var(--line);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.22s ease;
}
.size-select:hover,
.size-select:focus {
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
  width: 660px;
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
.modal h3 {
  position: relative;
  padding-left: 14px;
  margin-bottom: 24px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.8px;
  color: var(--ink);
}
.modal h3::before {
  content: "";
  position: absolute;
  left: 0;
  top: 3px;
  bottom: 3px;
  width: 3px;
  border-radius: 2px;
  background: linear-gradient(180deg, var(--accent) 0%, var(--ice) 100%);
}
.modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 26px;
  padding-top: 20px;
  border-top: 1px solid var(--line-2);
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
.form-item label .req {
  margin-right: 3px;
  color: #c0554a;
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

/* 详情 */
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.d-item {
  padding: 14px 16px;
  background: #f8fbfd;
  border: 1px solid transparent;
  border-radius: 12px;
  transition: all 0.22s ease;
}
.d-item:hover {
  background: #fff;
  border-color: var(--line);
  box-shadow: 0 4px 14px -10px rgba(31, 42, 55, 0.35);
}
.d-item .k {
  margin-bottom: 6px;
  font-size: 11.5px;
  letter-spacing: 0.6px;
  color: var(--ink-3);
}
.d-item .v {
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
  .page-container {
    padding: 24px 22px 48px;
  }
  .form-grid,
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 640px) {
  .page-container {
    padding: 20px 16px 40px;
  }
  .breadcrumb-wrap {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .filter-item input {
    width: 100%;
  }
  .filter-item {
    flex: 1 1 100%;
  }
  .filter-actions {
    width: 100%;
  }
  .filter-actions .btn {
    flex: 1;
  }
  .card {
    padding: 18px 16px;
    border-radius: 16px;
  }
  .modal {
    padding: 22px 20px;
    border-radius: 18px;
  }
}
</style>
