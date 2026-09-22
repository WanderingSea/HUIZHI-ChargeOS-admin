<template>
  <div class="page-container">
    <!-- 面包屑 -->
    <div class="breadcrumb-wrap">
      <div>
        电站电桩 <span class="divider">/</span> 电站设置
        <span class="divider">/</span> 电站监管信息登记
        <span class="divider">/</span> <strong>电站监管信息登记列表</strong>
      </div>
      <button class="btn-export" @click="showToast('导出数据已开始下载')">
        📄 导出
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
    <div class="card">
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
        <div>
          <button class="btn btn-primary" @click="handleSearch">筛选</button>
          <button class="btn btn-default" @click="resetSearch">恢复默认</button>
        </div>
      </div>
    </div>

    <!-- 表格卡片 -->
    <div class="card">
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
              <td
                colspan="11"
                style="text-align: center; color: #94a3b8; padding: 40px"
              >
                暂无数据
              </td>
            </tr>
            <tr v-else v-for="row in tableList" :key="row.stationId">
              <td>{{ row.stationId }}</td>
              <td>{{ row.stationName }}</td>
              <td>{{ row.operatorName }}</td>
              <td>{{ row.buildTime || "——" }}</td>
              <td>{{ row.runTime || "——" }}</td>
              <td>{{ row.recordNo || "——" }}</td>
              <td>{{ row.isSeparateInstall || "——" }}</td>
              <td>{{ row.subsidyCompany || "——" }}</td>
              <td>{{ row.updateTime || "——" }}</td>
              <td>{{ row.operator || "——" }}</td>
              <td>
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
        <span>跳至</span>
        <input
          class="jump-input"
          v-model.number="page"
          @keydown.enter="jumpPage"
        />
        <span>页</span>
        <span>共{{ filteredData.length }}条 / 每页</span>
        <select
          class="size-select"
          v-model.number="pageSize"
          @change="page = 1"
        >
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
        <span>条</span>
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
      // 找到原数据索引
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
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
.page-container {
  background-color: #f7f9fc;
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
  color: #242b3b;
  padding: 24px;
}
.breadcrumb-wrap {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #717c94;
  margin-bottom: 16px;
}
.breadcrumb-wrap .divider {
  margin: 0 6px;
}
.breadcrumb-wrap strong {
  color: #3b82f6;
  font-weight: 500;
}
.btn-export {
  background: #10b981;
  color: #fff;
  border: none;
  padding: 7px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}
.tip-alert {
  background: #fffbeb;
  color: #c2410c;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 16px;
}
.tip-link {
  color: #3b82f6;
  cursor: pointer;
}
.card {
  background: #fff;
  border: 1px solid #e4eaf3;
  border-radius: 12px;
  padding: 22px;
  margin-bottom: 18px;
}
.filter-row {
  display: flex;
  gap: 16px;
  align-items: flex-end;
  flex-wrap: wrap;
}
.filter-item label {
  display: block;
  font-size: 13px;
  color: #64748b;
  margin-bottom: 6px;
}
.filter-item input {
  width: 280px;
  height: 38px;
  border: 1px solid #dce3ee;
  border-radius: 8px;
  padding: 0 12px;
  font-size: 14px;
}
.filter-item input:focus {
  outline: none;
  border-color: #3b82f6;
}
.btn {
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
}
.btn-primary {
  background: #3b82f6;
  color: #fff;
}
.btn-primary:hover {
  background: #2563eb;
}
.btn-default {
  background: #fff;
  border: 1px solid #dce3ee;
  color: #242b3b;
}
.table-title {
  font-size: 16px;
  font-weight: 500;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
  margin-bottom: 12px;
}
.table-wrap {
  overflow-x: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1300px;
}
thead th {
  background: #f7f9fc;
  color: #54627c;
  font-weight: 500;
  text-align: left;
  padding: 12px 10px;
  font-size: 13px;
  white-space: nowrap;
}
tbody td {
  padding: 12px 10px;
  font-size: 13px;
  border-bottom: 1px solid #f1f4f9;
  white-space: nowrap;
}
tbody tr:hover td {
  background: #f7f9fc;
}
.op-btn {
  border: none;
  background: none;
  font-size: 13px;
  cursor: pointer;
  margin-right: 16px;
}
.op-btn.edit {
  color: #3b82f6;
}
.op-btn.detail {
  color: #f59e0b;
}
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
}
.page-btn {
  padding: 6px 12px;
  border: 1px solid #dce3ee;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
}
.page-btn:disabled {
  color: #bbb;
  cursor: not-allowed;
}
.page-num {
  padding: 6px 12px;
  cursor: pointer;
}
.page-num.current {
  background: #3b82f6;
  color: #fff;
  border-radius: 4px;
}
.jump-input {
  width: 45px;
  height: 30px;
  border: 1px solid #dce3ee;
  border-radius: 4px;
  text-align: center;
}
.size-select {
  height: 30px;
  border: 1px solid #dce3ee;
  border-radius: 4px;
}

/* 弹窗 */
.mask {
  position: fixed;
  inset: 0;
  background: rgba(36, 43, 59, 0.4);
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
.mask.show {
  display: flex;
}
.modal {
  background: #fff;
  border-radius: 12px;
  width: 640px;
  max-width: 92vw;
  max-height: 86vh;
  overflow-y: auto;
  padding: 26px;
}
.modal h3 {
  margin-bottom: 18px;
  font-size: 17px;
}
.modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.form-item label {
  display: block;
  font-size: 13px;
  color: #64748b;
  margin-bottom: 5px;
}
.form-item label .req {
  color: #ef4444;
  margin-right: 3px;
}
.form-item input,
.form-item select {
  width: 100%;
  height: 36px;
  border: 1px solid #dce3ee;
  border-radius: 7px;
  padding: 0 10px;
  font-size: 14px;
  background: #f7f9fc;
}
.form-item input:focus,
.form-item select:focus {
  outline: none;
  border-color: #3b82f6;
}
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.d-item {
  background: #f7f9fc;
  border-radius: 8px;
  padding: 10px 12px;
}
.d-item .k {
  font-size: 12px;
  color: #717c94;
  margin-bottom: 4px;
}
.d-item .v {
  font-size: 14px;
  color: #242b3b;
}
.toast {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: #242b3b;
  color: #fff;
  padding: 10px 20px;
  border-radius: 8px;
  z-index: 1000;
  font-size: 14px;
  display: none;
}
.toast.show {
  display: block;
}
</style>
