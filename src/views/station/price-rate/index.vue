<template>
  <div class="page-wrap">
    <div class="breadcrumb">
      <span>首页</span>
      <span>/</span>
      <span>站场设备</span>
      <span>/</span>
      <strong>费率定价管理</strong>
    </div>

    <div class="top-action-bar">
      <button class="btn-outline-blue" @click="openAdd">+ 新增费率方案</button>
      <button class="btn-gray" @click="exportData">导出数据</button>
    </div>

    <div class="filter-box">
      <div class="filter-row">
        <div class="filter-item">
          <label>方案名称</label>
          <input v-model="filter.name" placeholder="请输入方案名称" />
        </div>
        <div class="filter-item">
          <label>费率类型</label>
          <select v-model="filter.type">
            <option value="">全部</option>
            <option value="分时电价">分时电价</option>
            <option value="统一电价">统一电价</option>
          </select>
        </div>
        <div class="filter-item">
          <label>状态</label>
          <select v-model="filter.status">
            <option value="">全部</option>
            <option value="启用">启用</option>
            <option value="停用">停用</option>
          </select>
        </div>
      </div>
      <div class="filter-btn-group">
        <button class="btn-default" @click="resetFilter">重置</button>
        <button class="btn-primary" @click="applyFilter">筛选</button>
      </div>
    </div>

    <div class="table-box">
      <div class="table-header">
        <span class="table-title">费率方案列表</span>
        <span class="table-count">共 {{ filteredList.length }} 条</span>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>方案名称</th>
            <th>费率类型</th>
            <th>尖峰电价</th>
            <th>高峰电价</th>
            <th>平段电价</th>
            <th>低谷电价</th>
            <th>服务费率</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in pagedList" :key="item.id">
            <td>{{ item.name }}</td>
            <td>
              <span
                class="tag"
                :class="item.type === '分时电价' ? 'tag-blue' : 'tag-green'"
              >
                {{ item.type }}
              </span>
            </td>
            <td>{{ item.peakPrice }}</td>
            <td>{{ item.highPrice }}</td>
            <td>{{ item.flatPrice }}</td>
            <td>{{ item.lowPrice }}</td>
            <td>{{ item.serviceRate }}</td>
            <td>
              <span
                class="status-tag"
                :class="item.status === '启用' ? 's-ok' : 's-off'"
                >{{ item.status }}</span
              >
            </td>
            <td class="op-cell">
              <button class="op-btn" @click="openEdit(item)">编辑</button>
              <button class="op-btn" @click="openDetail(item)">详情</button>
              <button class="op-btn op-danger" @click="openDelete(item)">
                删除
              </button>
            </td>
          </tr>
          <tr v-if="filteredList.length === 0">
            <td colspan="9" class="empty-row">暂无数据</td>
          </tr>
        </tbody>
      </table>

      <div class="pagination">
        <div class="page-info">
          共 {{ filteredList.length }} 条，每页
          <select v-model="pageSize" class="page-size-select">
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
          </select>
          条
        </div>
        <div class="page-controls">
          <button :disabled="pageNum <= 1" @click="pageNum = 1">«</button>
          <button :disabled="pageNum <= 1" @click="pageNum--">‹</button>
          <span class="page-num">{{ pageNum }} / {{ totalPages }}</span>
          <button :disabled="pageNum >= totalPages" @click="pageNum++">
            ›
          </button>
          <button
            :disabled="pageNum >= totalPages"
            @click="pageNum = totalPages"
          >
            »
          </button>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="modal-mask" @click.self="closeModal">
      <div class="modal-box">
        <div class="modal-title">
          {{ modalMode === "add" ? "新增费率方案" : "编辑费率方案" }}
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label>方案名称</label>
            <input v-model="formData.name" placeholder="如 工商业峰谷电价" />
          </div>
          <div class="form-group">
            <label>费率类型</label>
            <select v-model="formData.type">
              <option value="分时电价">分时电价</option>
              <option value="统一电价">统一电价</option>
            </select>
          </div>
          <div class="form-group">
            <label>尖峰电价（元/度）</label>
            <input v-model="formData.peakPrice" placeholder="如 1.50" />
          </div>
          <div class="form-group">
            <label>高峰电价（元/度）</label>
            <input v-model="formData.highPrice" placeholder="如 1.20" />
          </div>
          <div class="form-group">
            <label>平段电价（元/度）</label>
            <input v-model="formData.flatPrice" placeholder="如 0.80" />
          </div>
          <div class="form-group">
            <label>低谷电价（元/度）</label>
            <input v-model="formData.lowPrice" placeholder="如 0.40" />
          </div>
          <div class="form-group">
            <label>服务费率（元/度）</label>
            <input v-model="formData.serviceRate" placeholder="如 0.45" />
          </div>
          <div class="form-group">
            <label>状态</label>
            <select v-model="formData.status">
              <option value="启用">启用</option>
              <option value="停用">停用</option>
            </select>
          </div>
        </div>
        <div class="modal-btn-group">
          <button class="modal-btn-cancel" @click="closeModal">取消</button>
          <button class="modal-btn-confirm confirm-blue" @click="saveForm">
            保存
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showDetailModal"
      class="modal-mask"
      @click.self="showDetailModal = false"
    >
      <div class="modal-box">
        <div class="modal-title">费率方案详情</div>
        <div class="detail-item">
          <span>方案名称：</span>{{ currentItem.name }}
        </div>
        <div class="detail-item">
          <span>费率类型：</span>{{ currentItem.type }}
        </div>
        <div class="detail-item">
          <span>尖峰电价：</span>{{ currentItem.peakPrice }}
        </div>
        <div class="detail-item">
          <span>高峰电价：</span>{{ currentItem.highPrice }}
        </div>
        <div class="detail-item">
          <span>平段电价：</span>{{ currentItem.flatPrice }}
        </div>
        <div class="detail-item">
          <span>低谷电价：</span>{{ currentItem.lowPrice }}
        </div>
        <div class="detail-item">
          <span>服务费率：</span>{{ currentItem.serviceRate }}
        </div>
        <div class="detail-item">
          <span>状态：</span>{{ currentItem.status }}
        </div>
        <div class="modal-btn-group">
          <button class="modal-btn-cancel" @click="showDetailModal = false">
            关闭
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showDeleteModal"
      class="modal-mask"
      @click.self="showDeleteModal = false"
    >
      <div class="modal-box">
        <div class="modal-title">确认删除</div>
        <div class="modal-desc">
          确定要删除费率方案
          <strong>{{ currentItem.name }}</strong> 吗？该操作不可撤销。
        </div>
        <div class="modal-btn-group">
          <button class="modal-btn-cancel" @click="showDeleteModal = false">
            取消
          </button>
          <button class="modal-btn-confirm confirm-red" @click="confirmDelete">
            确认删除
          </button>
        </div>
      </div>
    </div>

    <div v-if="toast" class="toast">{{ toast }}</div>
  </div>
</template>

<script>
export default {
  name: "PriceRate",
  data() {
    return {
      filter: { name: "", type: "", status: "" },
      pageNum: 1,
      pageSize: 10,
      list: [
        {
          id: 1,
          name: "工商业峰谷电价",
          type: "分时电价",
          peakPrice: "1.50",
          highPrice: "1.20",
          flatPrice: "0.80",
          lowPrice: "0.40",
          serviceRate: "0.45",
          status: "启用",
        },
        {
          id: 2,
          name: "居民夜间优惠",
          type: "分时电价",
          peakPrice: "1.20",
          highPrice: "0.90",
          flatPrice: "0.60",
          lowPrice: "0.30",
          serviceRate: "0.35",
          status: "启用",
        },
        {
          id: 3,
          name: "公共充电站统一价",
          type: "统一电价",
          peakPrice: "0.00",
          highPrice: "0.00",
          flatPrice: "1.20",
          lowPrice: "0.00",
          serviceRate: "0.50",
          status: "启用",
        },
        {
          id: 4,
          name: "园区企业专用",
          type: "分时电价",
          peakPrice: "1.40",
          highPrice: "1.10",
          flatPrice: "0.75",
          lowPrice: "0.38",
          serviceRate: "0.42",
          status: "停用",
        },
        {
          id: 5,
          name: "商场停车配套",
          type: "统一电价",
          peakPrice: "0.00",
          highPrice: "0.00",
          flatPrice: "1.50",
          lowPrice: "0.00",
          serviceRate: "0.55",
          status: "启用",
        },
      ],
      showModal: false,
      showDetailModal: false,
      showDeleteModal: false,
      modalMode: "add",
      currentItem: {},
      formData: {
        name: "",
        type: "分时电价",
        peakPrice: "",
        highPrice: "",
        flatPrice: "",
        lowPrice: "",
        serviceRate: "",
        status: "启用",
      },
      toast: "",
    };
  },
  computed: {
    filteredList() {
      return this.list.filter((item) => {
        return (
          (!this.filter.name || item.name.includes(this.filter.name)) &&
          (!this.filter.type || item.type === this.filter.type) &&
          (!this.filter.status || item.status === this.filter.status)
        );
      });
    },
    totalPages() {
      return Math.max(1, Math.ceil(this.filteredList.length / this.pageSize));
    },
    pagedList() {
      const start = (this.pageNum - 1) * this.pageSize;
      return this.filteredList.slice(start, start + this.pageSize);
    },
  },
  methods: {
    applyFilter() {
      this.pageNum = 1;
      this.showToast("筛选完成");
    },
    resetFilter() {
      this.filter = { name: "", type: "", status: "" };
      this.pageNum = 1;
    },
    openAdd() {
      this.modalMode = "add";
      this.formData = {
        name: "",
        type: "分时电价",
        peakPrice: "",
        highPrice: "",
        flatPrice: "",
        lowPrice: "",
        serviceRate: "",
        status: "启用",
      };
      this.showModal = true;
    },
    openEdit(item) {
      this.modalMode = "edit";
      this.currentItem = item;
      this.formData = { ...item };
      this.showModal = true;
    },
    openDetail(item) {
      this.currentItem = item;
      this.showDetailModal = true;
    },
    openDelete(item) {
      this.currentItem = item;
      this.showDeleteModal = true;
    },
    closeModal() {
      this.showModal = false;
    },
    saveForm() {
      if (!this.formData.name) {
        this.showToast("方案名称不能为空");
        return;
      }
      if (this.modalMode === "add") {
        const newItem = { id: Date.now(), ...this.formData };
        this.list.unshift(newItem);
        this.showToast("新增成功");
      } else {
        const idx = this.list.findIndex((i) => i.id === this.currentItem.id);
        if (idx !== -1)
          this.list.splice(idx, 1, {
            ...this.formData,
            id: this.currentItem.id,
          });
        this.showToast("编辑成功");
      }
      this.showModal = false;
    },
    confirmDelete() {
      this.list = this.list.filter((i) => i.id !== this.currentItem.id);
      this.showDeleteModal = false;
      this.showToast("删除成功");
    },
    exportData() {
      this.showToast("导出功能暂未开放");
    },
    showToast(msg) {
      this.toast = msg;
      setTimeout(() => (this.toast = ""), 2200);
    },
  },
};
</script>

<style scoped>
.page-wrap {
  --accent: #6b8fb0;
  --accent-2: #4f7295;
  --accent-soft: #e9f0f6;
  --ice: #82a8c4;
  --ink: #1f2a37;
  --ink-2: #5a6b7b;
  --ink-3: #94a3b3;
  --ink-4: #c3ced9;
  --line: #e4eaf1;
  --line-2: #eef3f8;
  min-height: 100vh;
  padding: 32px 40px 64px;
  font-size: 14px;
  color: var(--ink);
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC",
    "Microsoft YaHei", system-ui, sans-serif;
  letter-spacing: 0.2px;
  background: #f7fafd;
}
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: -20px;
  font-size: 13px;
  color: var(--ink-3);
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
  gap: 10px;
  margin-bottom: 16px;
}
.top-action-bar button {
  display: inline-flex;
  align-items: center;
  height: 32px;
  padding: 0 18px;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.4px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: #fff;
  color: var(--ink-2);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.top-action-bar button:hover {
  color: #fff;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%);
  border-color: transparent;
  transform: translateY(-1px);
  box-shadow: 0 10px 22px -10px rgba(79, 114, 149, 0.85);
}
.btn-outline-blue {
  color: var(--accent-2);
  border-color: var(--accent);
}

.filter-box {
  padding: 24px 28px 20px;
  margin-bottom: 18px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 18px;
  box-shadow: 0 1px 2px rgba(31, 42, 55, 0.03),
    0 10px 28px -22px rgba(31, 42, 55, 0.28);
}
.filter-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
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
  width: 100%;
  height: 38px;
  padding: 0 14px;
  font-size: 13px;
  color: var(--ink);
  background: #f8fbfd;
  border: 1px solid var(--line);
  border-radius: 10px;
  transition: all 0.22s ease;
}
.filter-item input:focus,
.filter-item select:focus {
  outline: none;
  background: #fff;
  border-color: var(--accent);
  box-shadow: 0 0 0 4px rgba(107, 143, 176, 0.12);
}
.filter-btn-group {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
.filter-btn-group button {
  height: 38px;
  padding: 0 22px;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.5px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.btn-primary {
  color: #fff;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%);
  box-shadow: 0 8px 18px -10px rgba(79, 114, 149, 0.9);
}
.btn-primary:hover {
  background: linear-gradient(135deg, var(--accent-2) 0%, #3d5a77 100%);
  transform: translateY(-1px);
}
.btn-default {
  color: var(--ink-2);
  background: #fff;
  border: 1px solid var(--line) !important;
}
.btn-default:hover {
  color: var(--accent-2);
  background: var(--accent-soft);
  border-color: var(--accent) !important;
}

.table-box {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 18px;
  box-shadow: 0 1px 2px rgba(31, 42, 55, 0.03),
    0 10px 28px -22px rgba(31, 42, 55, 0.28);
  overflow: hidden;
}
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 28px;
  border-bottom: 1px solid var(--line-2);
}
.table-title {
  position: relative;
  padding-left: 14px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.8px;
  color: var(--ink);
}
.table-title::before {
  content: "";
  position: absolute;
  left: 0;
  top: 2px;
  bottom: 2px;
  width: 3px;
  border-radius: 2px;
  background: linear-gradient(180deg, var(--accent) 0%, var(--ice) 100%);
}
.table-count {
  font-size: 12px;
  color: var(--ink-3);
}
.data-table {
  width: 100%;
  border-collapse: collapse;
}
.data-table thead {
  background: #f8fbfd;
}
.data-table th {
  padding: 14px 16px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.8px;
  text-align: left;
  color: var(--ink-2);
  border-bottom: 1px solid var(--line-2);
}
.data-table td {
  padding: 14px 16px;
  font-size: 13px;
  color: var(--ink);
  border-bottom: 1px solid var(--line-2);
}
.data-table tbody tr {
  transition: background 0.2s ease;
}
.data-table tbody tr:hover {
  background: #f7fafd;
}
.data-table tbody tr:last-child td {
  border-bottom: none;
}
.empty-row {
  text-align: center !important;
  color: var(--ink-3) !important;
  padding: 60px 0 !important;
}

.tag {
  display: inline-block;
  padding: 2px 10px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 999px;
}
.tag-blue {
  color: var(--accent-2);
  background: var(--accent-soft);
}
.tag-green {
  color: #067647;
  background: #ecfdf3;
}
.status-tag {
  display: inline-block;
  padding: 3px 11px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 20px;
}
.s-ok {
  color: #067647;
  background: #ecfdf3;
}
.s-off {
  color: var(--ink-2);
  background: #f4f7fa;
}
.op-cell {
  white-space: nowrap;
}
.op-btn {
  height: 28px;
  padding: 0 10px;
  margin-right: 6px;
  font-size: 12px;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--accent-2);
  cursor: pointer;
  transition: all 0.2s ease;
}
.op-btn:hover {
  background: var(--accent-soft);
}
.op-btn.op-danger {
  color: #d92d20;
}
.op-btn.op-danger:hover {
  background: #fef3f2;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 28px;
  border-top: 1px solid var(--line-2);
}
.page-info {
  font-size: 12px;
  color: var(--ink-3);
}
.page-size-select {
  height: 28px;
  margin: 0 6px;
  padding: 0 8px;
  font-size: 12px;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: #fff;
  color: var(--ink);
  cursor: pointer;
}
.page-controls {
  display: flex;
  align-items: center;
  gap: 6px;
}
.page-controls button {
  width: 30px;
  height: 30px;
  font-size: 12px;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: #fff;
  color: var(--ink-2);
  cursor: pointer;
  transition: all 0.2s ease;
}
.page-controls button:hover:not(:disabled) {
  background: var(--accent-soft);
  color: var(--accent-2);
  border-color: var(--accent);
}
.page-controls button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.page-num {
  font-size: 12px;
  color: var(--ink-2);
  padding: 0 6px;
}

.modal-mask {
  position: fixed;
  inset: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(31, 42, 55, 0.35);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}
.modal-box {
  width: 520px;
  max-width: 92vw;
  padding: 28px 32px;
  background: #fff;
  border-radius: 22px;
  box-shadow: 0 32px 80px -32px rgba(31, 42, 55, 0.55);
  animation: modalIn 0.32s cubic-bezier(0.16, 1, 0.3, 1);
}
.modal-title {
  position: relative;
  padding-left: 14px;
  padding-bottom: 18px;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.8px;
  color: var(--ink);
  border-bottom: 1px solid var(--line-2);
}
.modal-title::before {
  content: "";
  position: absolute;
  left: 0;
  top: 3px;
  bottom: 21px;
  width: 3px;
  border-radius: 2px;
  background: linear-gradient(180deg, var(--accent) 0%, var(--ice) 100%);
}
.modal-desc {
  margin-bottom: 26px;
  padding: 14px 16px;
  font-size: 13.5px;
  line-height: 1.8;
  color: var(--ink-2);
  background: #f8fbfd;
  border-radius: 12px;
  border-left: 3px solid var(--accent);
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}
.form-group {
  margin-bottom: 0;
}
.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.6px;
  color: var(--ink-2);
}
.form-group input,
.form-group select {
  width: 100%;
  height: 38px;
  padding: 0 14px;
  font-size: 13px;
  color: var(--ink);
  background: #f8fbfd;
  border: 1px solid var(--line);
  border-radius: 10px;
  transition: all 0.22s ease;
}
.form-group input:focus,
.form-group select:focus {
  outline: none;
  background: #fff;
  border-color: var(--accent);
  box-shadow: 0 0 0 4px rgba(107, 143, 176, 0.12);
}
.detail-item {
  padding: 10px 0;
  font-size: 13px;
  color: var(--ink-2);
  border-bottom: 1px dashed var(--line);
}
.detail-item:last-child {
  border-bottom: none;
}
.detail-item span {
  display: inline-block;
  width: 110px;
  color: var(--ink-3);
  font-weight: 500;
}

.modal-btn-group {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
}
.modal-btn-cancel {
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
  transition: all 0.25s ease;
}
.modal-btn-cancel:hover {
  color: var(--accent-2);
  background: var(--accent-soft);
  border-color: var(--accent);
}
.modal-btn-confirm {
  height: 38px;
  padding: 0 22px;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.5px;
  color: #fff;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s ease;
}
.confirm-blue {
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%);
  box-shadow: 0 8px 18px -10px rgba(79, 114, 149, 0.9);
}
.confirm-blue:hover {
  background: linear-gradient(135deg, var(--accent-2) 0%, #3d5a77 100%);
  transform: translateY(-1px);
}
.confirm-red {
  background: linear-gradient(135deg, #f53f3f 0%, #c93030 100%);
  box-shadow: 0 8px 18px -10px rgba(245, 63, 63, 0.9);
}
.confirm-red:hover {
  background: linear-gradient(135deg, #d92d20 0%, #b42318 100%);
  transform: translateY(-1px);
}

.toast {
  position: fixed;
  left: 50%;
  bottom: 44px;
  z-index: 1000;
  padding: 11px 24px;
  font-size: 13px;
  letter-spacing: 0.5px;
  color: #fff;
  background: rgba(31, 42, 55, 0.92);
  border-radius: 999px;
  box-shadow: 0 18px 44px -18px rgba(31, 42, 55, 0.7);
  backdrop-filter: blur(8px);
  transform: translateX(-50%);
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
  .page-wrap {
    padding: 24px 22px 48px;
  }
  .filter-row {
    grid-template-columns: repeat(2, 1fr);
  }
  .form-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 640px) {
  .filter-row {
    grid-template-columns: 1fr;
  }
  .pagination {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}
</style>
