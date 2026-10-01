<template>
  <div class="rate-container">
    <div class="breadcrumb">
      电站电桩 <span class="div">></span> 费率定价管理
      <span class="div">></span>
      <strong>费率方案列表</strong>
    </div>
    <div class="top-action-bar">
      <button class="btn-top btn-blue" @click="openAdd">新增费率方案</button>
      <button class="btn-top btn-green" @click="showToast('导出文件开始下载')">
        导出
      </button>
    </div>

    <div class="filter-card">
      <div class="filter-row">
        <div class="filter-item">
          <label>方案名称</label>
          <input v-model="searchForm.name" placeholder="请输入方案名称" />
        </div>
        <div class="filter-item">
          <label>电站名称</label>
          <input
            v-model="searchForm.stationName"
            placeholder="请输入电站名称"
          />
        </div>
        <div class="filter-item">
          <label>费率类型</label>
          <select v-model="searchForm.type">
            <option value="">全部</option>
            <option value="分时电价">分时电价</option>
            <option value="统一电价">统一电价</option>
          </select>
        </div>
        <div class="filter-item">
          <label>状态</label>
          <select v-model="searchForm.status">
            <option value="">全部</option>
            <option value="启用">启用</option>
            <option value="停用">停用</option>
          </select>
        </div>
        <div class="filter-buttons">
          <button class="btn-filter" @click="handleSearch">筛选</button>
          <button class="btn-reset" @click="resetFilter">恢复默认</button>
        </div>
      </div>
    </div>

    <div class="table-card">
      <div class="table-title">费率方案列表</div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>方案编号</th>
              <th>方案名称</th>
              <th>适用电站</th>
              <th>费率类型</th>
              <th>尖峰电价(元/kwh)</th>
              <th>高峰电价(元/kwh)</th>
              <th>平段电价(元/kwh)</th>
              <th>低谷电价(元/kwh)</th>
              <th>服务费(元/kwh)</th>
              <th>状态</th>
              <th>更新时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="pageData.length === 0">
              <td
                colspan="12"
                style="text-align: center; padding: 30px; color: #94a3b3"
              >
                暂无数据
              </td>
            </tr>
            <tr v-else v-for="item in pageData" :key="item.code">
              <td>{{ item.code }}</td>
              <td>{{ item.name }}</td>
              <td>{{ item.stationName || "全部电站" }}</td>
              <td>
                <span
                  :class="[
                    'type-tag',
                    item.type === '分时电价' ? 'time' : 'flat',
                  ]"
                  >{{ item.type }}</span
                >
              </td>
              <td>{{ item.peakPrice || "——" }}</td>
              <td>{{ item.highPrice || "——" }}</td>
              <td>{{ item.flatPrice || "——" }}</td>
              <td>{{ item.lowPrice || "——" }}</td>
              <td>{{ item.servicePrice }}</td>
              <td>
                <span
                  :class="['status-tag', item.status === '启用' ? 'on' : 'off']"
                  >{{ item.status }}</span
                >
              </td>
              <td>{{ item.updateTime }}</td>
              <td class="operate">
                <button class="btn-edit" @click="openEdit(item)">编辑</button>
                <button class="btn-detail" @click="openDetail(item)">
                  详情
                </button>
                <button class="btn-del" @click="openDelete(item)">删除</button>
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
        <span>
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

    <div
      class="mask"
      :class="{ show: editVisible }"
      @click="handleMaskClose('edit')"
    >
      <div class="modal" @click.stop>
        <div class="modal-header">
          {{ isAdd ? "新增费率方案" : "编辑费率方案" }}
        </div>
        <div class="form-grid">
          <div class="form-item">
            <label>方案编号</label>
            <input v-model="editForm.code" :disabled="!isAdd" />
          </div>
          <div class="form-item">
            <label>方案名称</label>
            <input v-model="editForm.name" />
          </div>
          <div class="form-item">
            <label>适用电站</label>
            <input
              v-model="editForm.stationName"
              placeholder="留空为全部电站"
            />
          </div>
          <div class="form-item">
            <label>费率类型</label>
            <select v-model="editForm.type">
              <option value="分时电价">分时电价</option>
              <option value="统一电价">统一电价</option>
            </select>
          </div>
          <div class="form-item">
            <label>尖峰电价(元/kwh)</label>
            <input v-model="editForm.peakPrice" type="number" step="0.01" />
          </div>
          <div class="form-item">
            <label>高峰电价(元/kwh)</label>
            <input v-model="editForm.highPrice" type="number" step="0.01" />
          </div>
          <div class="form-item">
            <label>平段电价(元/kwh)</label>
            <input v-model="editForm.flatPrice" type="number" step="0.01" />
          </div>
          <div class="form-item">
            <label>低谷电价(元/kwh)</label>
            <input v-model="editForm.lowPrice" type="number" step="0.01" />
          </div>
          <div class="form-item">
            <label>服务费(元/kwh)</label>
            <input v-model="editForm.servicePrice" type="number" step="0.01" />
          </div>
          <div class="form-item">
            <label>状态</label>
            <select v-model="editForm.status">
              <option value="启用">启用</option>
              <option value="停用">停用</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="editVisible = false">取消</button>
          <button class="save-btn" @click="saveEdit">保存</button>
        </div>
      </div>
    </div>

    <div
      class="mask"
      :class="{ show: detailVisible }"
      @click="handleMaskClose('detail')"
    >
      <div class="modal" @click.stop>
        <div class="modal-header">费率方案详情</div>
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

    <div class="mask" :class="{ show: delVisible }" @click="delVisible = false">
      <div class="modal" @click.stop>
        <div class="modal-header">确认删除</div>
        <p class="del-tip">
          确定要删除费率方案
          <strong>{{ deleteTarget && deleteTarget.name }}</strong>
          吗？此操作不可恢复。
        </p>
        <div class="modal-footer">
          <button class="cancel-btn" @click="delVisible = false">取消</button>
          <button
            class="save-btn"
            style="
              background: linear-gradient(135deg, #f53f3f 0%, #c93030 100%);
            "
            @click="confirmDelete"
          >
            删除
          </button>
        </div>
      </div>
    </div>

    <div class="toast" :class="{ show: toastShow }">{{ toastMsg }}</div>
  </div>
</template>

<script>
export default {
  name: "PriceRate",
  data() {
    return {
      sourceData: [
        {
          code: "RT2026001",
          name: "同星峰谷电价方案A",
          stationName: "同星旭智充站",
          type: "分时电价",
          peakPrice: "1.80",
          highPrice: "1.20",
          flatPrice: "0.80",
          lowPrice: "0.40",
          servicePrice: "0.60",
          status: "启用",
          updateTime: "2026-06-01 10:20:15",
        },
        {
          code: "RT2026002",
          name: "同星峰谷电价方案B",
          stationName: "同星东马坊充电站",
          type: "分时电价",
          peakPrice: "1.60",
          highPrice: "1.10",
          flatPrice: "0.70",
          lowPrice: "0.35",
          servicePrice: "0.55",
          status: "启用",
          updateTime: "2026-05-20 14:30:22",
        },
        {
          code: "RT2026003",
          name: "同星统一电价方案",
          stationName: "同星南桥里充电站",
          type: "统一电价",
          peakPrice: "",
          highPrice: "",
          flatPrice: "1.20",
          lowPrice: "",
          servicePrice: "0.50",
          status: "启用",
          updateTime: "2026-04-15 09:10:08",
        },
        {
          code: "RT2026004",
          name: "东马坊快充站方案",
          stationName: "同星东马坊充电站",
          type: "分时电价",
          peakPrice: "2.00",
          highPrice: "1.40",
          flatPrice: "0.90",
          lowPrice: "0.45",
          servicePrice: "0.70",
          status: "启用",
          updateTime: "2026-08-10 16:45:33",
        },
        {
          code: "RT2026005",
          name: "旭智充站新版方案",
          stationName: "同星旭智充站",
          type: "分时电价",
          peakPrice: "1.90",
          highPrice: "1.30",
          flatPrice: "0.85",
          lowPrice: "0.42",
          servicePrice: "0.65",
          status: "停用",
          updateTime: "2026-03-28 11:20:50",
        },
        {
          code: "RT2026006",
          name: "南桥里慢充专用",
          stationName: "同星南桥里充电站",
          type: "统一电价",
          peakPrice: "",
          highPrice: "",
          flatPrice: "0.80",
          lowPrice: "",
          servicePrice: "0.30",
          status: "启用",
          updateTime: "2026-07-05 08:55:41",
        },
        {
          code: "RT2026007",
          name: "全站默认方案",
          stationName: "",
          type: "分时电价",
          peakPrice: "1.50",
          highPrice: "1.00",
          flatPrice: "0.60",
          lowPrice: "0.30",
          servicePrice: "0.50",
          status: "启用",
          updateTime: "2026-01-01 00:00:00",
        },
        {
          code: "RT2026008",
          name: "夏季尖峰加价方案",
          stationName: "同星旭智充站",
          type: "分时电价",
          peakPrice: "2.20",
          highPrice: "1.50",
          flatPrice: "0.95",
          lowPrice: "0.48",
          servicePrice: "0.70",
          status: "停用",
          updateTime: "2026-06-15 17:30:00",
        },
      ],
      filterList: [],
      searchForm: { name: "", stationName: "", type: "", status: "" },
      currentPage: 1,
      pageSize: 10,
      jumpPage: 1,
      editVisible: false,
      isAdd: false,
      editForm: {},
      editOriginRow: null,
      detailVisible: false,
      detailFields: [],
      delVisible: false,
      deleteTarget: null,
      toastShow: false,
      toastMsg: "",
    };
  },
  computed: {
    totalPage() {
      return Math.max(1, Math.ceil(this.filterList.length / this.pageSize));
    },
    pageData() {
      const s = (this.currentPage - 1) * this.pageSize;
      return this.filterList.slice(s, s + this.pageSize);
    },
  },
  watch: {
    currentPage(v) {
      this.jumpPage = v;
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
    nowStr() {
      const n = new Date();
      return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(n.getDate()).padStart(2, "0")} ${String(
        n.getHours()
      ).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}:${String(
        n.getSeconds()
      ).padStart(2, "0")}`;
    },
    handleSearch() {
      const n = this.searchForm.name.trim();
      const s = this.searchForm.stationName.trim();
      const t = this.searchForm.type;
      const st = this.searchForm.status;
      this.filterList = this.sourceData.filter(
        (r) =>
          (!n || r.name.includes(n)) &&
          (!s || (r.stationName && r.stationName.includes(s))) &&
          (!t || r.type === t) &&
          (!st || r.status === st)
      );
      this.currentPage = 1;
      this.showToast("筛选完成");
    },
    resetFilter() {
      this.searchForm = { name: "", stationName: "", type: "", status: "" };
      this.filterList = [...this.sourceData];
      this.currentPage = 1;
      this.showToast("筛选条件已重置");
    },
    handleJump() {
      let p = parseInt(this.jumpPage) || 1;
      p = Math.min(Math.max(1, p), this.totalPage);
      this.currentPage = p;
    },
    openAdd() {
      this.isAdd = true;
      this.editForm = {
        code: "",
        name: "",
        stationName: "",
        type: "分时电价",
        peakPrice: "",
        highPrice: "",
        flatPrice: "",
        lowPrice: "",
        servicePrice: "0.50",
        status: "启用",
      };
      this.editVisible = true;
    },
    openEdit(row) {
      this.isAdd = false;
      this.editOriginRow = row;
      this.editForm = { ...row };
      this.editVisible = true;
    },
    saveEdit() {
      if (this.isAdd) {
        this.sourceData.unshift({
          ...this.editForm,
          updateTime: this.nowStr(),
        });
      } else {
        const idx = this.sourceData.findIndex(
          (x) => x.code === this.editOriginRow.code
        );
        this.sourceData[idx] = { ...this.editForm, updateTime: this.nowStr() };
      }
      this.filterList = [...this.sourceData];
      this.editVisible = false;
      this.showToast(this.isAdd ? "新增成功！" : "保存成功！");
    },
    openDetail(row) {
      this.detailFields = [
        { label: "方案编号", value: row.code },
        { label: "方案名称", value: row.name },
        { label: "适用电站", value: row.stationName || "全部电站" },
        { label: "费率类型", value: row.type },
        { label: "尖峰电价(元/kwh)", value: row.peakPrice },
        { label: "高峰电价(元/kwh)", value: row.highPrice },
        { label: "平段电价(元/kwh)", value: row.flatPrice },
        { label: "低谷电价(元/kwh)", value: row.lowPrice },
        { label: "服务费(元/kwh)", value: row.servicePrice },
        { label: "状态", value: row.status },
        { label: "更新时间", value: row.updateTime },
      ];
      this.detailVisible = true;
    },
    openDelete(row) {
      this.deleteTarget = row;
      this.delVisible = true;
    },
    confirmDelete() {
      this.sourceData = this.sourceData.filter(
        (x) => x.code !== this.deleteTarget.code
      );
      this.filterList = [...this.sourceData];
      this.delVisible = false;
      this.showToast("删除成功！");
    },
    handleMaskClose(t) {
      if (t === "edit") this.editVisible = false;
      if (t === "detail") this.detailVisible = false;
    },
  },
};
</script>

<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
.rate-container {
  --bg: #ffffff;
  --card: #ffffff;
  --ink: #1f2a37;
  --ink-2: #5a6b7b;
  --ink-3: #94a3b3;
  --ink-4: #c3ced9;
  --line: #e4eaf1;
  --line-2: #eef3f8;
  --accent: #6b8fb0;
  --accent-2: #4f7295;
  --accent-soft: #e9f0f6;
  --ice: #82a8c4;
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
.breadcrumb {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
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
.top-action-bar {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
  margin-top: -20px;
}
.btn-top {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 30px;
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
.table-wrap::-webkit-scrollbar-thumb {
  background: #d3dde6;
  border-radius: 4px;
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
.type-tag {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.4px;
}
.type-tag.time {
  color: var(--accent-2);
  background: var(--ice-soft);
  border: 1px solid #cddfe9;
}
.type-tag.flat {
  color: #fff;
  background: linear-gradient(135deg, #6b8fb0 0%, #4f7295 100%);
  box-shadow: 0 4px 10px -4px rgba(79, 114, 149, 0.6);
}
.status-tag {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.4px;
}
.status-tag.on {
  color: #fff;
  background: linear-gradient(135deg, #6b8fb0 0%, #4f7295 100%);
  box-shadow: 0 4px 10px -4px rgba(79, 114, 149, 0.6);
}
.status-tag.off {
  color: #86909c;
  background: #f2f3f5;
  border: 1px solid #e5e6eb;
}
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
.btn-del {
  color: #f53f3f;
}
.btn-del:hover {
  background: rgba(245, 63, 63, 0.08);
}
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
.form-item input:disabled {
  background: #eef1f5;
  color: var(--ink-3);
  cursor: not-allowed;
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
.del-tip {
  font-size: 13px;
  color: var(--ink-2);
  line-height: 1.7;
  margin-bottom: 4px;
}
.del-tip strong {
  color: #f53f3f;
}
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
@media (max-width: 1024px) {
  .rate-container {
    padding: 24px 22px 48px;
  }
  .form-grid,
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 640px) {
  .rate-container {
    padding: 20px 16px 40px;
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
