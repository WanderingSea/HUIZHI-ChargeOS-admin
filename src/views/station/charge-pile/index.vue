<template>
  <div class="page-wrap">
    <div class="breadcrumb">
      站场设备管理 <span>></span> <strong>充电桩管理</strong>
    </div>

    <div class="top-bar">
      <button class="btn btn-primary" @click="openAdd">+ 新增充电桩</button>
    </div>

    <div class="filter-box">
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
          <label>运行状态</label>
          <select v-model="searchForm.status">
            <option value="">全部</option>
            <option value="在线">在线</option>
            <option value="离线">离线</option>
            <option value="故障">故障</option>
          </select>
        </div>
      </div>
      <div class="filter-btns">
        <button class="btn btn-primary" @click="handleSearch">筛选</button>
        <button class="btn btn-default" @click="resetFilter">重置</button>
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
              <th>运行状态</th>
              <th>入网时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="pageData.length === 0">
              <td colspan="8" class="empty">暂无数据</td>
            </tr>
            <tr v-else v-for="item in pageData" :key="item.pileCode">
              <td class="mono">{{ item.pileCode }}</td>
              <td>{{ item.stationName }}</td>
              <td>{{ item.brand }}</td>
              <td>{{ item.power }}</td>
              <td>{{ item.gunCount }}</td>
              <td>
                <span
                  class="tag"
                  :class="{
                    'tag-green': item.status === '在线',
                    'tag-gray': item.status === '离线',
                    'tag-red': item.status === '故障',
                  }"
                  >{{ item.status }}</span
                >
              </td>
              <td>{{ item.joinTime }}</td>
              <td class="ops">
                <button class="op-edit" @click="openEdit(item)">编辑</button>
                <button class="op-detail" @click="openDetail(item)">
                  详情
                </button>
                <button class="op-del" @click="openDelete(item)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pagination">
        <button
          class="p-btn"
          :disabled="currentPage <= 1"
          @click="currentPage--"
        >
          上一页
        </button>
        <span
          v-for="i in totalPage"
          :key="i"
          class="p-num"
          :class="{ active: currentPage === i }"
          @click="currentPage = i"
          >{{ i }}</span
        >
        <button
          class="p-btn"
          :disabled="currentPage >= totalPage"
          @click="currentPage++"
        >
          下一页
        </button>
        <span class="p-info">共 {{ filterList.length }} 条</span>
      </div>
    </div>

    <div
      class="mask"
      :class="{ show: modal.edit || modal.add }"
      @click="closeModal"
    >
      <div class="modal" @click.stop>
        <h3>{{ modal.add ? "新增充电桩" : "编辑充电桩" }}</h3>
        <div class="form-grid">
          <div class="form-item">
            <label>电桩编号</label><input v-model="form.pileCode" />
          </div>
          <div class="form-item">
            <label>电站名称</label><input v-model="form.stationName" />
          </div>
          <div class="form-item">
            <label>品牌</label><input v-model="form.brand" />
          </div>
          <div class="form-item">
            <label>功率(kw)</label><input v-model="form.power" />
          </div>
          <div class="form-item">
            <label>枪数</label><input v-model="form.gunCount" />
          </div>
          <div class="form-item">
            <label>状态</label>
            <select v-model="form.status">
              <option value="在线">在线</option>
              <option value="离线">离线</option>
              <option value="故障">故障</option>
            </select>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn btn-default" @click="closeModal">取消</button>
          <button class="btn btn-primary" @click="saveModal">保存</button>
        </div>
      </div>
    </div>

    <div class="mask" :class="{ show: modal.detail }" @click="closeModal">
      <div class="modal" @click.stop>
        <h3>充电桩详情</h3>
        <div class="detail-grid">
          <div class="d-item" v-for="f in detailList" :key="f.label">
            <div class="d-k">{{ f.label }}</div>
            <div class="d-v">{{ f.value || "——" }}</div>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn btn-primary" @click="closeModal">关闭</button>
        </div>
      </div>
    </div>

    <div class="mask" :class="{ show: modal.delete }" @click="closeModal">
      <div class="modal modal-sm" @click.stop>
        <h3>确认删除</h3>
        <p class="modal-desc">
          确定要删除充电桩
          <b>{{ deleteTarget && deleteTarget.pileCode }}</b>
          吗？此操作不可恢复。
        </p>
        <div class="modal-foot">
          <button class="btn btn-default" @click="closeModal">取消</button>
          <button class="btn btn-danger" @click="confirmDelete">删除</button>
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
          brand: "特来电 120kW",
          power: "120",
          gunCount: 2,
          status: "在线",
          joinTime: "2025-06-12",
        },
        {
          pileCode: "32010600832248",
          stationName: "同星旭智充站",
          brand: "特来电 120kW",
          power: "120",
          gunCount: 2,
          status: "在线",
          joinTime: "2025-06-12",
        },
        {
          pileCode: "32010601174425",
          stationName: "同星东马坊充电站",
          brand: "星星充电 60kW",
          power: "60",
          gunCount: 1,
          status: "离线",
          joinTime: "2025-08-03",
        },
        {
          pileCode: "32010601129513",
          stationName: "同星东马坊充电站",
          brand: "星星充电 60kW",
          power: "60",
          gunCount: 1,
          status: "在线",
          joinTime: "2025-08-03",
        },
        {
          pileCode: "32010601047756",
          stationName: "同星东马坊充电站",
          brand: "国家电网 120kW",
          power: "120",
          gunCount: 2,
          status: "故障",
          joinTime: "2024-12-18",
        },
        {
          pileCode: "32010600832246",
          stationName: "同星南桥里充电站",
          brand: "特来电 240kW",
          power: "240",
          gunCount: 4,
          status: "在线",
          joinTime: "2025-02-22",
        },
        {
          pileCode: "32010600981460",
          stationName: "同星东马坊充电站",
          brand: "云快充 7kW",
          power: "7",
          gunCount: 1,
          status: "在线",
          joinTime: "2026-01-05",
        },
        {
          pileCode: "32010600964370",
          stationName: "同星南桥里充电站",
          brand: "特来电 180kW",
          power: "180",
          gunCount: 3,
          status: "在线",
          joinTime: "2025-05-30",
        },
      ],
      filterList: [],
      searchForm: { pileCode: "", stationName: "", status: "" },
      currentPage: 1,
      pageSize: 10,
      modal: { edit: false, add: false, detail: false, delete: false },
      form: {},
      editIdx: -1,
      detailList: [],
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
  mounted() {
    this.filterList = [...this.sourceData];
  },
  methods: {
    showToast(msg) {
      this.toastMsg = msg;
      this.toastShow = true;
      setTimeout(() => (this.toastShow = false), 1800);
    },
    handleSearch() {
      const c = this.searchForm.pileCode.trim(),
        n = this.searchForm.stationName.trim(),
        s = this.searchForm.status;
      this.filterList = this.sourceData.filter(
        (r) =>
          (!c || r.pileCode.includes(c)) &&
          (!n || r.stationName.includes(n)) &&
          (!s || r.status === s)
      );
      this.currentPage = 1;
      this.showToast("筛选完成");
    },
    resetFilter() {
      this.searchForm = { pileCode: "", stationName: "", status: "" };
      this.filterList = [...this.sourceData];
      this.currentPage = 1;
    },
    openAdd() {
      this.form = {
        pileCode: "",
        stationName: "",
        brand: "",
        power: "",
        gunCount: "",
        status: "在线",
        joinTime: "",
      };
      this.modal.add = true;
    },
    openEdit(row) {
      this.form = { ...row };
      this.editIdx = this.sourceData.findIndex(
        (x) => x.pileCode === row.pileCode
      );
      this.modal.edit = true;
    },
    openDetail(row) {
      this.detailList = [
        { label: "电桩编号", value: row.pileCode },
        { label: "电站名称", value: row.stationName },
        { label: "品牌型号", value: row.brand },
        { label: "功率(kw)", value: row.power },
        { label: "枪数", value: row.gunCount },
        { label: "运行状态", value: row.status },
        { label: "入网时间", value: row.joinTime },
      ];
      this.modal.detail = true;
    },
    openDelete(row) {
      this.deleteTarget = row;
      this.modal.delete = true;
    },
    closeModal() {
      this.modal = { edit: false, add: false, detail: false, delete: false };
      this.form = {};
    },
    saveModal() {
      if (this.modal.add) {
        this.sourceData.unshift({
          ...this.form,
          joinTime: this.form.joinTime || new Date().toISOString().slice(0, 10),
        });
      } else if (this.modal.edit && this.editIdx > -1) {
        this.sourceData[this.editIdx] = { ...this.form };
      }
      this.filterList = [...this.sourceData];
      this.closeModal();
      this.showToast("保存成功");
    },
    confirmDelete() {
      if (this.deleteTarget) {
        this.sourceData = this.sourceData.filter(
          (x) => x.pileCode !== this.deleteTarget.pileCode
        );
        this.filterList = [...this.sourceData];
      }
      this.closeModal();
      this.showToast("已删除");
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
.page-wrap {
  padding: 32px 40px 48px;
  font-family: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
  color: #1f2a37;
  --accent: #6b8fb0;
  --accent-2: #4f7295;
  --accent-soft: #e9f0f6;
  --ink-3: #94a3b3;
  --line: #e4eaf1;
  --line-2: #eef3f8;
  background: #f5f7fa;
  min-height: 100vh;
}
.breadcrumb {
  font-size: 13px;
  color: #94a3b3;
  margin-bottom: -16px;
  display: flex;
  gap: 8px;
  align-items: center;
}
.breadcrumb strong {
  color: #1f2a37;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.top-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 14px;
}

.btn {
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 9px 22px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s;
  letter-spacing: 0.4px;
}
.btn-primary {
  color: #fff;
  background: linear-gradient(135deg, #6b8fb0 0%, #4f7295 100%);
  box-shadow: 0 6px 14px -8px rgba(79, 114, 149, 0.9);
}
.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 22px -10px rgba(79, 114, 149, 0.95);
}
.btn-default {
  color: #5a6b7b;
  background: #fff;
  border-color: #e4eaf1;
}
.btn-default:hover {
  color: #4f7295;
  background: #e9f0f6;
  border-color: #6b8fb0;
}
.btn-danger {
  color: #fff;
  background: linear-gradient(135deg, #f53f3f 0%, #c93030 100%);
  box-shadow: 0 6px 14px -8px rgba(245, 63, 63, 0.85);
}
.btn-danger:hover {
  transform: translateY(-1px);
}

.filter-box {
  background: #fff;
  border: 1px solid #e4eaf1;
  border-radius: 18px;
  padding: 24px 26px 18px;
  margin-bottom: 18px;
  box-shadow: 0 1px 2px rgba(31, 42, 55, 0.03),
    0 10px 28px -22px rgba(31, 42, 55, 0.22);
}
.filter-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px 20px;
}
.filter-item label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.6px;
  color: #5a6b7b;
  margin-bottom: 8px;
}
.filter-item input,
.filter-item select {
  width: 100%;
  height: 38px;
  padding: 0 14px;
  font-size: 13px;
  background: #f8fbfd;
  border: 1px solid #e4eaf1;
  border-radius: 10px;
  transition: all 0.22s;
  color: #1f2a37;
}
.filter-item input:focus,
.filter-item select:focus {
  outline: none;
  background: #fff;
  border-color: #6b8fb0;
  box-shadow: 0 0 0 4px rgba(107, 143, 176, 0.12);
}
.filter-btns {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 18px;
}

.table-card {
  background: #fff;
  border: 1px solid #e4eaf1;
  border-radius: 18px;
  box-shadow: 0 1px 2px rgba(31, 42, 55, 0.03),
    0 10px 28px -22px rgba(31, 42, 55, 0.22);
  overflow: hidden;
}
.table-title {
  position: relative;
  padding: 18px 24px;
  font-size: 15px;
  font-weight: 600;
  color: #1f2a37;
  letter-spacing: 0.5px;
}
.table-title::before {
  content: "";
  position: absolute;
  left: 0;
  top: 16px;
  bottom: 16px;
  width: 3px;
  border-radius: 0 2px 2px 0;
  background: linear-gradient(180deg, #6b8fb0, #82a8c4);
}
.table-wrap {
  overflow-x: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
  min-width: 960px;
}
thead tr {
  background: #f8fbfd;
}
th {
  padding: 14px 16px;
  text-align: left;
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0.5px;
  color: #5a6b7b;
  white-space: nowrap;
}
td {
  padding: 14px 16px;
  font-size: 13px;
  color: #2a3b4b;
  border-bottom: 1px solid #eef3f8;
  white-space: nowrap;
}
tbody tr {
  transition: background 0.2s;
}
tbody tr:hover td {
  background: #f8fbfd;
}
.empty {
  text-align: center;
  color: #94a3b3;
  padding: 40px !important;
}
.mono {
  font-family: "SF Mono", Menlo, Consolas, monospace;
}
.tag {
  display: inline-block;
  padding: 3px 12px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 20px;
}
.tag-green {
  color: #fff;
  background: linear-gradient(135deg, #6b8fb0, #4f7295);
  box-shadow: 0 2px 6px -2px rgba(79, 114, 149, 0.5);
}
.tag-gray {
  color: #5a6b7b;
  background: #eef3f8;
}
.tag-red {
  color: #fff;
  background: linear-gradient(135deg, #f53f3f, #c93030);
  box-shadow: 0 2px 6px -2px rgba(245, 63, 63, 0.5);
}
.ops button {
  border: none;
  background: none;
  font-size: 13px;
  cursor: pointer;
  margin-right: 14px;
  padding: 0;
}
.op-edit {
  color: #4f7295;
}
.op-detail {
  color: #8b6f3f;
}
.op-del {
  color: #c93030;
}
.ops button:hover {
  text-decoration: underline;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 20px;
  border-top: 1px solid #eef3f8;
}
.p-btn {
  padding: 6px 14px;
  border: 1px solid #e4eaf1;
  background: #fff;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  color: #5a6b7b;
  transition: all 0.2s;
}
.p-btn:hover:not(:disabled) {
  color: #4f7295;
  border-color: #6b8fb0;
}
.p-btn:disabled {
  color: #c3ced9;
  cursor: not-allowed;
}
.p-num {
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  color: #5a6b7b;
  transition: all 0.2s;
}
.p-num:hover {
  background: #e9f0f6;
}
.p-num.active {
  color: #fff;
  background: linear-gradient(135deg, #6b8fb0, #4f7295);
  box-shadow: 0 4px 10px -4px rgba(79, 114, 149, 0.8);
}
.p-info {
  margin-left: 12px;
  font-size: 13px;
  color: #94a3b3;
}

.mask {
  position: fixed;
  inset: 0;
  background: rgba(31, 42, 55, 0.35);
  backdrop-filter: blur(6px);
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 24px;
}
.mask.show {
  display: flex;
}
.modal {
  background: #fff;
  border-radius: 22px;
  padding: 28px 32px;
  width: 620px;
  max-width: 92vw;
  box-shadow: 0 32px 80px -32px rgba(31, 42, 55, 0.5);
  animation: modalIn 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}
.modal-sm {
  width: 420px;
}
.modal h3 {
  position: relative;
  padding-left: 14px;
  padding-bottom: 18px;
  margin-bottom: 20px;
  font-size: 16px;
  font-weight: 600;
  color: #1f2a37;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #eef3f8;
}
.modal h3::before {
  content: "";
  position: absolute;
  left: 0;
  top: 3px;
  bottom: 21px;
  width: 3px;
  border-radius: 2px;
  background: linear-gradient(180deg, #6b8fb0, #82a8c4);
}
.modal-desc {
  padding: 14px 16px;
  background: #f8fbfd;
  border-left: 3px solid #6b8fb0;
  border-radius: 0 12px 12px 0;
  font-size: 13.5px;
  line-height: 1.8;
  color: #5a6b7b;
  margin-bottom: 24px;
}
.modal-desc b {
  color: #4f7295;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.form-item label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #5a6b7b;
  margin-bottom: 8px;
  letter-spacing: 0.4px;
}
.form-item input,
.form-item select {
  width: 100%;
  height: 38px;
  padding: 0 14px;
  border: 1px solid #e4eaf1;
  border-radius: 10px;
  background: #f8fbfd;
  font-size: 13px;
  transition: all 0.22s;
}
.form-item input:focus,
.form-item select:focus {
  outline: none;
  background: #fff;
  border-color: #6b8fb0;
  box-shadow: 0 0 0 4px rgba(107, 143, 176, 0.12);
}
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.d-item {
  background: #f8fbfd;
  border-radius: 12px;
  padding: 12px 14px;
  border: 1px solid #eef3f8;
}
.d-k {
  font-size: 12px;
  color: #94a3b3;
  margin-bottom: 4px;
  letter-spacing: 0.3px;
}
.d-v {
  font-size: 13.5px;
  color: #1f2a37;
  font-weight: 500;
}
.modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
}

.toast {
  position: fixed;
  left: 50%;
  bottom: 44px;
  transform: translateX(-50%);
  background: rgba(31, 42, 55, 0.92);
  backdrop-filter: blur(8px);
  color: #fff;
  padding: 11px 24px;
  border-radius: 999px;
  font-size: 13px;
  letter-spacing: 0.5px;
  z-index: 1000;
  opacity: 0;
  transition: opacity 0.3s;
}
.toast.show {
  opacity: 1;
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

@media (max-width: 1024px) {
  .filter-row {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 640px) {
  .page-wrap {
    padding: 20px;
  }
  .filter-row,
  .form-grid,
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
