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
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
.pile-container {
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
  background: #f0f2f5;
  color: #1f2937;
  padding: 20px;
}
/* 面包屑 */
.breadcrumb {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 12px;
  gap: 6px;
}
.breadcrumb strong {
  color: #1f2937;
  font-weight: 500;
}
.breadcrumb span.div {
  color: #9ca3af;
}
.top-action-bar {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-bottom: 12px;
}
.btn-top {
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}
.btn-blue {
  background: #3b82f6;
  color: #fff;
}
.btn-green {
  background: #10b981;
  color: #fff;
}
/* 提示栏 */
.tip-bar {
  background: #fff7ed;
  color: #c2410c;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  margin-bottom: 16px;
}
.tip-bar a {
  color: #3b82f6;
  cursor: pointer;
  text-decoration: none;
}
/* 筛选区域 */
.filter-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 18px;
  margin-bottom: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}
.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: flex-end;
}
.filter-item label {
  display: block;
  font-size: 13px;
  color: #4b5563;
  margin-bottom: 5px;
}
.filter-item input,
.filter-item select {
  width: 260px;
  height: 34px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 0 10px;
  font-size: 14px;
}
.filter-item input:focus,
.filter-item select:focus {
  outline: none;
  border-color: #3b82f6;
}
.filter-buttons {
  display: flex;
  gap: 10px;
}
.btn-filter {
  background: #3b82f6;
  color: #fff;
  border: none;
  height: 34px;
  padding: 0 16px;
  border-radius: 4px;
  cursor: pointer;
}
.btn-reset {
  background: #fff;
  color: #3b82f6;
  border: 1px solid #3b82f6;
  height: 34px;
  padding: 0 16px;
  border-radius: 4px;
  cursor: pointer;
}
.more-filter {
  width: 100%;
  text-align: center;
  margin-top: 12px;
  color: #3b82f6;
  font-size: 14px;
  cursor: pointer;
}
/* 表格卡片 */
.table-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}
.table-title {
  padding: 14px 18px;
  background: #f3f4f6;
  font-weight: 500;
  font-size: 15px;
}
.table-wrap {
  overflow-x: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1350px;
}
thead tr {
  background: #f9fafb;
}
th {
  text-align: left;
  padding: 12px 14px;
  font-size: 13px;
  color: #4b5563;
  font-weight: 500;
  white-space: nowrap;
}
td {
  padding: 12px 14px;
  font-size: 13px;
  color: #374151;
  border-bottom: 1px solid #f3f4f6;
  white-space: nowrap;
}
tbody tr:hover {
  background: #f9fafb;
}
.operate button {
  border: none;
  background: none;
  cursor: pointer;
  font-size: 13px;
  margin: 0 6px;
}
.btn-edit {
  color: #3b82f6;
}
.btn-detail {
  color: #f59e0b;
}
/* 分页 */
.pagination-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  gap: 8px;
}
.page-btn {
  padding: 5px 12px;
  border: 1px solid #d1d5db;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
}
.page-btn:disabled {
  color: #9ca3af;
  cursor: not-allowed;
}
.page-num {
  padding: 5px 12px;
  cursor: pointer;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  margin: 0 3px;
}
.page-num.active {
  background: #3b82f6;
  color: #fff;
  border-color: #3b82f6;
}
.page-input {
  width: 45px;
  height: 30px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  text-align: center;
}
/* 弹窗遮罩 */
.mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
.mask.show {
  display: flex;
}
.modal {
  width: 680px;
  max-width: 92vw;
  background: #fff;
  border-radius: 10px;
  padding: 24px;
  max-height: 85vh;
  overflow-y: auto;
}
.modal-header {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.form-item label {
  display: block;
  font-size: 13px;
  color: #4b5563;
  margin-bottom: 6px;
}
.form-item input,
.form-item select {
  width: 100%;
  height: 36px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 0 10px;
}
.form-item input:focus,
.form-item select:focus {
  outline: none;
  border-color: #3b82f6;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
}
.modal-footer button {
  padding: 8px 18px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
}
.cancel-btn {
  background: #f3f4f6;
}
.save-btn {
  background: #3b82f6;
  color: #fff;
}
/*详情弹窗*/
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.detail-item {
  background: #f9fafb;
  padding: 12px;
  border-radius: 6px;
}
.detail-label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
}
.detail-value {
  font-size: 14px;
  color: #1f2937;
}
/*toast*/
.toast {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: #1f2937;
  color: #fff;
  padding: 10px 20px;
  border-radius: 6px;
  display: none;
  z-index: 1000;
}
.toast.show {
  display: block;
}
</style>
