<template>
  <div class="pile-container">
    <div class="breadcrumb">
      电站电桩 <span class="div">></span> 充电桩管理
      <span class="div">></span>
      <strong>充电桩列表</strong>
    </div>
    <div class="top-action-bar">
      <button class="btn-top btn-blue" @click="openAdd">新增电桩</button>
      <button class="btn-top btn-green" @click="showToast('导出文件开始下载')">
        导出
      </button>
    </div>

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
          <label>品牌型号</label>
          <input v-model="searchForm.model" placeholder="请输入品牌或型号" />
        </div>
        <div class="filter-item">
          <label>运行状态</label>
          <select v-model="searchForm.status">
            <option value="">全部</option>
            <option value="在线">在线</option>
            <option value="离线">离线</option>
            <option value="故障">故障</option>
          </select>
        </div>
        <div class="filter-buttons">
          <button class="btn-filter" @click="handleSearch">筛选</button>
          <button class="btn-reset" @click="resetFilter">恢复默认</button>
        </div>
      </div>
    </div>

    <div class="table-card">
      <div class="table-title">充电桩列表</div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>电桩编号</th>
              <th>电站名称</th>
              <th>品牌型号</th>
              <th>功率(kw)</th>
              <th>枪数</th>
              <th>生产厂商</th>
              <th>投运时间</th>
              <th>运行状态</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="pageData.length === 0">
              <td
                colspan="10"
                style="text-align: center; padding: 30px; color: #94a3b3"
              >
                暂无数据
              </td>
            </tr>
            <tr v-else v-for="item in pageData" :key="item.pileCode">
              <td>{{ item.pileCode }}</td>
              <td>{{ item.stationName }}</td>
              <td>{{ item.model }}</td>
              <td>{{ item.power }}</td>
              <td>{{ item.gunCount }}</td>
              <td>{{ item.vendor }}</td>
              <td>{{ item.runTime || "——" }}</td>
              <td>
                <span :class="['status-tag', statusClass(item.status)]">
                  {{ item.status }}
                </span>
              </td>
              <td>{{ item.createTime }}</td>
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
        <div class="modal-header">{{ isAdd ? "新增电桩" : "编辑电桩" }}</div>
        <div class="form-grid">
          <div class="form-item">
            <label>电桩编号</label>
            <input v-model="editForm.pileCode" :disabled="!isAdd" />
          </div>
          <div class="form-item">
            <label>电站名称</label>
            <input v-model="editForm.stationName" />
          </div>
          <div class="form-item">
            <label>品牌</label>
            <input v-model="editForm.brand" />
          </div>
          <div class="form-item">
            <label>型号</label>
            <input v-model="editForm.model" />
          </div>
          <div class="form-item">
            <label>功率(kw)</label>
            <input v-model="editForm.power" type="number" />
          </div>
          <div class="form-item">
            <label>枪数</label>
            <input v-model="editForm.gunCount" type="number" />
          </div>
          <div class="form-item">
            <label>生产厂商</label>
            <input v-model="editForm.vendor" />
          </div>
          <div class="form-item">
            <label>投运时间</label>
            <input v-model="editForm.runTime" type="date" />
          </div>
          <div class="form-item">
            <label>运行状态</label>
            <select v-model="editForm.status">
              <option value="在线">在线</option>
              <option value="离线">离线</option>
              <option value="故障">故障</option>
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
        <div class="modal-header">电桩详情</div>
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
          确定要删除电桩
          <strong>{{ deleteTarget && deleteTarget.pileCode }}</strong>
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
  name: "ChargePile",
  data() {
    return {
      sourceData: [
        {
          pileCode: "32010600832249",
          stationName: "同星旭智充站",
          brand: "星星充电",
          model: "XX-DC-60KW",
          power: "60",
          gunCount: 2,
          vendor: "星星充电科技",
          runTime: "2024-06-15",
          status: "在线",
          createTime: "2024-06-15 10:22:31",
        },
        {
          pileCode: "32010600832248",
          stationName: "同星旭智充站",
          brand: "星星充电",
          model: "XX-DC-60KW",
          power: "60",
          gunCount: 2,
          vendor: "星星充电科技",
          runTime: "2024-06-15",
          status: "离线",
          createTime: "2024-06-15 10:22:31",
        },
        {
          pileCode: "32010601174425",
          stationName: "同星东马坊充电站",
          brand: "特来电",
          model: "TL-DC-120KW",
          power: "120",
          gunCount: 2,
          vendor: "特来电新能源",
          runTime: "2025-03-20",
          status: "在线",
          createTime: "2025-03-20 09:11:02",
        },
        {
          pileCode: "32010601129513",
          stationName: "同星东马坊充电站",
          brand: "特来电",
          model: "TL-DC-120KW",
          power: "120",
          gunCount: 2,
          vendor: "特来电新能源",
          runTime: "2025-03-20",
          status: "故障",
          createTime: "2025-03-20 09:11:02",
        },
        {
          pileCode: "32010601047756",
          stationName: "同星东马坊充电站",
          brand: "国家电网",
          model: "SG-AC-7KW",
          power: "7",
          gunCount: 1,
          vendor: "国电南瑞",
          runTime: "2024-11-08",
          status: "在线",
          createTime: "2024-11-08 14:30:15",
        },
        {
          pileCode: "32010600832246",
          stationName: "同星南桥里充电站",
          brand: "星星充电",
          model: "XX-DC-30KW",
          power: "30",
          gunCount: 1,
          vendor: "星星充电科技",
          runTime: "2024-07-22",
          status: "在线",
          createTime: "2024-07-22 16:45:08",
        },
        {
          pileCode: "32010600981460",
          stationName: "同星东马坊充电站",
          brand: "特来电",
          model: "TL-DC-180KW",
          power: "180",
          gunCount: 2,
          vendor: "特来电新能源",
          runTime: "2026-01-10",
          status: "在线",
          createTime: "2026-01-10 11:20:00",
        },
        {
          pileCode: "32010600981459",
          stationName: "同星东马坊充电站",
          brand: "国家电网",
          model: "SG-AC-7KW",
          power: "7",
          gunCount: 1,
          vendor: "国电南瑞",
          runTime: "2026-01-10",
          status: "离线",
          createTime: "2026-01-10 11:20:00",
        },
        {
          pileCode: "32010600964370",
          stationName: "同星南桥里充电站",
          brand: "星星充电",
          model: "XX-DC-60KW",
          power: "60",
          gunCount: 2,
          vendor: "星星充电科技",
          runTime: "2025-09-01",
          status: "在线",
          createTime: "2025-09-01 08:55:41",
        },
        {
          pileCode: "32010600964369",
          stationName: "同星南桥里充电站",
          brand: "星星充电",
          model: "XX-DC-60KW",
          power: "60",
          gunCount: 2,
          vendor: "星星充电科技",
          runTime: "2025-09-01",
          status: "在线",
          createTime: "2025-09-01 08:55:41",
        },
        {
          pileCode: "32010600832250",
          stationName: "同星旭智充站",
          brand: "特来电",
          model: "TL-DC-240KW",
          power: "240",
          gunCount: 4,
          vendor: "特来电新能源",
          runTime: "2026-04-18",
          status: "在线",
          createTime: "2026-04-18 13:12:20",
        },
        {
          pileCode: "32010600832251",
          stationName: "同星旭智充站",
          brand: "特来电",
          model: "TL-DC-240KW",
          power: "240",
          gunCount: 4,
          vendor: "特来电新能源",
          runTime: "2026-04-18",
          status: "在线",
          createTime: "2026-04-18 13:12:20",
        },
      ],
      filterList: [],
      searchForm: { pileCode: "", stationName: "", model: "", status: "" },
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
    statusClass(s) {
      return (
        { 在线: "tag-online", 离线: "tag-offline", 故障: "tag-error" }[s] ||
        "tag-offline"
      );
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
      const p = this.searchForm.pileCode.trim();
      const s = this.searchForm.stationName.trim();
      const m = this.searchForm.model.trim();
      const st = this.searchForm.status;
      this.filterList = this.sourceData.filter(
        (r) =>
          (!p || r.pileCode.includes(p)) &&
          (!s || r.stationName.includes(s)) &&
          (!m ||
            (r.brand && r.brand.includes(m)) ||
            (r.model && r.model.includes(m))) &&
          (!st || r.status === st)
      );
      this.currentPage = 1;
      this.showToast("筛选完成");
    },
    resetFilter() {
      this.searchForm = {
        pileCode: "",
        stationName: "",
        model: "",
        status: "",
      };
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
        pileCode: "",
        stationName: "",
        brand: "",
        model: "",
        power: "",
        gunCount: "",
        vendor: "",
        runTime: "",
        status: "在线",
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
          createTime: this.nowStr(),
        });
      } else {
        const idx = this.sourceData.findIndex(
          (x) => x.pileCode === this.editOriginRow.pileCode
        );
        this.sourceData[idx] = { ...this.editForm };
      }
      this.filterList = [...this.sourceData];
      this.editVisible = false;
      this.showToast(this.isAdd ? "新增成功！" : "保存成功！");
    },
    openDetail(row) {
      this.detailFields = [
        { label: "电桩编号", value: row.pileCode },
        { label: "电站名称", value: row.stationName },
        { label: "品牌", value: row.brand },
        { label: "型号", value: row.model },
        { label: "功率(kw)", value: row.power },
        { label: "枪数", value: row.gunCount },
        { label: "生产厂商", value: row.vendor },
        { label: "投运时间", value: row.runTime },
        { label: "运行状态", value: row.status },
        { label: "创建时间", value: row.createTime },
      ];
      this.detailVisible = true;
    },
    openDelete(row) {
      this.deleteTarget = row;
      this.delVisible = true;
    },
    confirmDelete() {
      this.sourceData = this.sourceData.filter(
        (x) => x.pileCode !== this.deleteTarget.pileCode
      );
      this.filterList = [...this.sourceData];
      this.delVisible = false;
      this.showToast("删除成功！");
    },
    handleMaskClose(type) {
      if (type === "edit") this.editVisible = false;
      if (type === "detail") this.detailVisible = false;
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
.pile-container {
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
  min-width: 1200px;
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
.status-tag {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.4px;
}
.tag-online {
  color: #fff;
  background: linear-gradient(135deg, #6b8fb0 0%, #4f7295 100%);
  box-shadow: 0 4px 10px -4px rgba(79, 114, 149, 0.6);
}
.tag-offline {
  color: var(--accent-2);
  background: var(--ice-soft);
  border: 1px solid #cddfe9;
}
.tag-error {
  color: #fff;
  background: linear-gradient(135deg, #f53f3f 0%, #c93030 100%);
  box-shadow: 0 4px 10px -4px rgba(245, 63, 63, 0.6);
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
