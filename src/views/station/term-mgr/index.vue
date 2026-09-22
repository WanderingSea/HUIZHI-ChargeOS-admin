<template>
  <div class="terminal-page">
    <!-- 面包屑 -->
    <div class="breadcrumb">
      电站电桩 <span>/</span> 平台站桩管理 <span>/</span> 充电终端管理
      <span>/</span>
      <strong>终端列表</strong>
    </div>

    <!-- 顶部操作 -->
    <div class="page-head">
      <div class="title">终端列表</div>
      <div class="head-actions">
        <button class="btn btn-ghost" @click="handleDownloadQr">
          📶 下载二维码
        </button>
        <button class="btn btn-primary" @click="handleExport">📤 导出</button>
      </div>
    </div>

    <!-- 筛选区 -->
    <div class="filter-card">
      <div class="filter-row">
        <div class="filter-item">
          <label>归属运营商</label>
          <input
            v-model="searchForm.operator"
            placeholder="请输入归属运营商"
            @keyup.enter="handleSearch"
          />
        </div>
        <div class="filter-item">
          <label>运营商ID</label>
          <input
            v-model="searchForm.operatorId"
            placeholder="请输入运营商ID"
            @keyup.enter="handleSearch"
          />
        </div>
        <div class="filter-item">
          <label>终端名称</label>
          <input
            v-model="searchForm.terminalName"
            placeholder="请输入终端名称"
            @keyup.enter="handleSearch"
          />
        </div>
        <div class="filter-btns">
          <button class="btn btn-primary" @click="handleSearch">筛选</button>
          <button class="btn btn-default" @click="resetSearch">恢复默认</button>
        </div>
      </div>
      <div class="more-toggle" @click="showMore = !showMore">
        {{ showMore ? "收起筛选 △" : "更多筛选 ▽" }}
      </div>
      <div class="more-panel" v-show="showMore">
        <div class="filter-row">
          <div class="filter-item">
            <label>电站ID</label>
            <input v-model="searchForm.stationId" placeholder="电站ID" />
          </div>
          <div class="filter-item">
            <label>终端编码</label>
            <input v-model="searchForm.terminalCode" placeholder="终端编码" />
          </div>
          <div class="filter-item">
            <label>启停状态</label>
            <select v-model="searchForm.status">
              <option value="">全部</option>
              <option value="enable">启用</option>
              <option value="disable">停用</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- 表格 -->
    <div class="table-card">
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>运营商ID</th>
              <th>归属运营商</th>
              <th>终端名称</th>
              <th>归属电站</th>
              <th>电站ID</th>
              <th>终端编码</th>
              <th>电桩编码</th>
              <th>充电桩名称</th>
              <th>终端品牌</th>
              <th>终端型号</th>
              <th>终端功率(KW)</th>
              <th>电桩设备类型</th>
              <th>堆主机类型</th>
              <th>启停状态</th>
              <th>插枪状态</th>
              <th>工作状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filterList.length === 0">
              <td colspan="17" class="empty">暂无匹配数据</td>
            </tr>
            <tr v-for="item in filterList" :key="item.terminalCode">
              <td>{{ item.operatorId }}</td>
              <td>{{ item.operatorName }}</td>
              <td>{{ item.terminalName }}</td>
              <td>{{ item.stationName }}</td>
              <td>{{ item.stationId }}</td>
              <td>{{ item.terminalCode }}</td>
              <td>{{ item.pileCode }}</td>
              <td>{{ item.pileName || "——" }}</td>
              <td>{{ item.brand }}</td>
              <td>{{ item.model }}</td>
              <td>{{ item.power }}</td>
              <td>{{ item.deviceType }}</td>
              <td>{{ item.hostType }}</td>
              <td>
                <span
                  class="tag"
                  :class="item.status === 'enable' ? 'tag-green' : 'tag-red'"
                >
                  {{ item.status === "enable" ? "启用" : "停用" }}
                </span>
              </td>
              <td>{{ item.gunStatus }}</td>
              <td>
                <span class="work-tag" :class="workClass(item.workStatus)">{{
                  item.workStatus
                }}</span>
              </td>
              <td>
                <div class="ops">
                  <button class="op green" @click="handleSyncPrice(item)">
                    校时校价
                  </button>
                  <button
                    class="op"
                    :class="item.status === 'enable' ? 'red' : 'blue'"
                    @click="openOperate(item)"
                  >
                    {{ item.status === "enable" ? "停用" : "启用" }}
                  </button>
                  <button class="op blue" @click="openEdit(item)">编辑</button>
                  <button class="op orange" @click="openDetail(item)">
                    详情
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div class="pagination">
        <button class="btn btn-default" :disabled="page <= 1" @click="page--">
          上一页
        </button>
        <span>第 {{ page }} 页 / 共 {{ totalPage }} 页</span>
        <button
          class="btn btn-default"
          :disabled="page >= totalPage"
          @click="page++"
        >
          下一页
        </button>
      </div>
    </div>

    <!-- 启用/停用弹窗 -->
    <div class="mask" v-show="operateShow" @click.self="operateShow = false">
      <div class="modal">
        <h3>{{ operateTitle }}</h3>
        <p>{{ operateDesc }}</p>
        <div class="modal-foot">
          <button class="btn btn-default" @click="operateShow = false">
            取消
          </button>
          <button
            class="btn"
            :class="operateConfirmClass"
            @click="confirmOperate"
          >
            确认
          </button>
        </div>
      </div>
    </div>

    <!-- 编辑弹窗 -->
    <div class="mask" v-show="editShow" @click.self="editShow = false">
      <div class="modal">
        <h3>编辑终端信息</h3>
        <div class="form-grid">
          <div class="form-item">
            <label>运营商ID</label><input v-model="editForm.operatorId" />
          </div>
          <div class="form-item">
            <label>归属运营商</label><input v-model="editForm.operatorName" />
          </div>
          <div class="form-item">
            <label>终端名称</label><input v-model="editForm.terminalName" />
          </div>
          <div class="form-item">
            <label>归属电站</label><input v-model="editForm.stationName" />
          </div>
          <div class="form-item">
            <label>电站ID</label><input v-model="editForm.stationId" />
          </div>
          <div class="form-item">
            <label>终端编码</label><input v-model="editForm.terminalCode" />
          </div>
          <div class="form-item">
            <label>电桩编码</label><input v-model="editForm.pileCode" />
          </div>
          <div class="form-item">
            <label>充电桩名称</label><input v-model="editForm.pileName" />
          </div>
          <div class="form-item">
            <label>终端品牌</label><input v-model="editForm.brand" />
          </div>
          <div class="form-item">
            <label>终端型号</label><input v-model="editForm.model" />
          </div>
          <div class="form-item">
            <label>终端功率(KW)</label
            ><input v-model.number="editForm.power" type="number" />
          </div>
          <div class="form-item">
            <label>电桩设备类型</label><input v-model="editForm.deviceType" />
          </div>
          <div class="form-item">
            <label>堆主机类型</label><input v-model="editForm.hostType" />
          </div>
          <div class="form-item">
            <label>启停状态</label>
            <select v-model="editForm.status">
              <option value="enable">启用</option>
              <option value="disable">停用</option>
            </select>
          </div>
          <div class="form-item">
            <label>插枪状态</label>
            <select v-model="editForm.gunStatus">
              <option>未知</option>
              <option>未插枪</option>
              <option>已插枪</option>
            </select>
          </div>
          <div class="form-item">
            <label>工作状态</label>
            <select v-model="editForm.workStatus">
              <option>离线</option>
              <option>空闲</option>
              <option>充电中</option>
              <option>故障</option>
            </select>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn btn-default" @click="editShow = false">
            取消
          </button>
          <button class="btn btn-primary" @click="saveEdit">保存修改</button>
        </div>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <div class="mask" v-show="detailShow" @click.self="detailShow = false">
      <div class="modal">
        <h3>终端详情</h3>
        <div class="detail-grid">
          <div class="d-item">
            <div class="k">终端名称</div>
            <div class="v">{{ detail.terminalName }}</div>
          </div>
          <div class="d-item">
            <div class="k">终端编码</div>
            <div class="v">{{ detail.terminalCode }}</div>
          </div>
          <div class="d-item">
            <div class="k">运营商ID</div>
            <div class="v">{{ detail.operatorId }}</div>
          </div>
          <div class="d-item">
            <div class="k">归属运营商</div>
            <div class="v">{{ detail.operatorName }}</div>
          </div>
          <div class="d-item">
            <div class="k">归属电站</div>
            <div class="v">{{ detail.stationName }}</div>
          </div>
          <div class="d-item">
            <div class="k">电站ID</div>
            <div class="v">{{ detail.stationId }}</div>
          </div>
          <div class="d-item">
            <div class="k">电桩编码</div>
            <div class="v">{{ detail.pileCode }}</div>
          </div>
          <div class="d-item">
            <div class="k">充电桩名称</div>
            <div class="v">{{ detail.pileName || "——" }}</div>
          </div>
          <div class="d-item">
            <div class="k">终端品牌</div>
            <div class="v">{{ detail.brand }}</div>
          </div>
          <div class="d-item">
            <div class="k">终端型号</div>
            <div class="v">{{ detail.model }}</div>
          </div>
          <div class="d-item">
            <div class="k">终端功率</div>
            <div class="v">{{ detail.power }} KW</div>
          </div>
          <div class="d-item">
            <div class="k">电桩设备类型</div>
            <div class="v">{{ detail.deviceType }}</div>
          </div>
          <div class="d-item">
            <div class="k">堆主机类型</div>
            <div class="v">{{ detail.hostType }}</div>
          </div>
          <div class="d-item">
            <div class="k">启停状态</div>
            <div class="v">
              {{ detail.status === "enable" ? "启用" : "停用" }}
            </div>
          </div>
          <div class="d-item">
            <div class="k">插枪状态</div>
            <div class="v">{{ detail.gunStatus }}</div>
          </div>
          <div class="d-item">
            <div class="k">工作状态</div>
            <div class="v">{{ detail.workStatus }}</div>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn btn-default" @click="detailShow = false">
            关闭
          </button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div class="toast" v-show="toastShow">{{ toastMsg }}</div>
  </div>
</template>

<script>
export default {
  name: "TerminalList",
  data() {
    return {
      showMore: false,
      page: 1,
      pageSize: 10,
      searchForm: {
        operator: "",
        operatorId: "",
        terminalName: "",
        stationId: "",
        terminalCode: "",
        status: "",
      },
      operateShow: false,
      operateTitle: "",
      operateDesc: "",
      operateConfirmClass: "btn-primary",
      editShow: false,
      detailShow: false,
      toastShow: false,
      toastMsg: "",
      currentRow: null,
      editForm: {},
      detail: {},
      tableData: [
        {
          operatorId: "35202",
          operatorName: "新乡市牧野区同星机械有限公司",
          terminalName: "TXXHL01-A",
          stationName: "同星东马坊充充电站",
          stationId: "283613",
          terminalCode: "3201060083224401",
          pileCode: "32010600832244",
          pileName: "——",
          brand: "同兴",
          model: "TXDC-2-120",
          power: 120,
          deviceType: "一体式直流桩",
          hostType: "——",
          status: "enable",
          gunStatus: "未知",
          workStatus: "离线",
        },
        {
          operatorId: "35202",
          operatorName: "新乡市牧野区同星机械有限公司",
          terminalName: "TXXHL01-B",
          stationName: "同星东马坊充充电站",
          stationId: "283613",
          terminalCode: "3201060083224402",
          pileCode: "32010600832244",
          pileName: "——",
          brand: "同兴",
          model: "TXDC-2-120",
          power: 120,
          deviceType: "一体式直流桩",
          hostType: "——",
          status: "enable",
          gunStatus: "未知",
          workStatus: "离线",
        },
        {
          operatorId: "35202",
          operatorName: "新乡市牧野区同星机械有限公司",
          terminalName: "TXXHL02-A",
          stationName: "同星东马坊充充电站",
          stationId: "283613",
          terminalCode: "3201060083224501",
          pileCode: "32010600832245",
          pileName: "——",
          brand: "同兴",
          model: "TXDC-2-120",
          power: 120,
          deviceType: "一体式直流桩",
          hostType: "——",
          status: "enable",
          gunStatus: "未知",
          workStatus: "离线",
        },
        {
          operatorId: "35202",
          operatorName: "新乡市牧野区同星机械有限公司",
          terminalName: "TXXHL02-B",
          stationName: "同星东马坊充充电站",
          stationId: "283613",
          terminalCode: "3201060083224502",
          pileCode: "32010600832245",
          pileName: "——",
          brand: "同兴",
          model: "TXDC-2-120",
          power: 120,
          deviceType: "一体式直流桩",
          hostType: "——",
          status: "enable",
          gunStatus: "未知",
          workStatus: "离线",
        },
        {
          operatorId: "35202",
          operatorName: "新乡市牧野区同星机械有限公司",
          terminalName: "TXXHL04-A",
          stationName: "同星东马坊充充电站",
          stationId: "283613",
          terminalCode: "3201060083224701",
          pileCode: "32010600832247",
          pileName: "——",
          brand: "同兴",
          model: "TXDC-2-120",
          power: 120,
          deviceType: "一体式直流桩",
          hostType: "——",
          status: "disable",
          gunStatus: "未插枪",
          workStatus: "离线",
        },
        {
          operatorId: "35202",
          operatorName: "新乡市牧野区同星机械有限公司",
          terminalName: "TXXHL04-B",
          stationName: "同星东马坊充充电站",
          stationId: "283613",
          terminalCode: "3201060083224702",
          pileCode: "32010600832247",
          pileName: "——",
          brand: "同兴",
          model: "TXDC-2-120",
          power: 120,
          deviceType: "一体式直流桩",
          hostType: "——",
          status: "disable",
          gunStatus: "未插枪",
          workStatus: "离线",
        },
        {
          operatorId: "35202",
          operatorName: "新乡市牧野区同星机械有限公司",
          terminalName: "TXXHL07-A",
          stationName: "同星东马坊充充电站",
          stationId: "283613",
          terminalCode: "3201060098145901",
          pileCode: "32010600981459",
          pileName: "——",
          brand: "同兴",
          model: "TXDC-2-320",
          power: 320,
          deviceType: "一体式直流桩",
          hostType: "——",
          status: "enable",
          gunStatus: "已插枪",
          workStatus: "空闲",
        },
        {
          operatorId: "35202",
          operatorName: "新乡市牧野区同星机械有限公司",
          terminalName: "TXXHL07-B",
          stationName: "同星东马坊充充电站",
          stationId: "283613",
          terminalCode: "3201060098145902",
          pileCode: "32010600981459",
          pileName: "——",
          brand: "同兴",
          model: "TXDC-2-320",
          power: 320,
          deviceType: "一体式直流桩",
          hostType: "——",
          status: "enable",
          gunStatus: "已插枪",
          workStatus: "空闲",
        },
        {
          operatorId: "35202",
          operatorName: "新乡市牧野区同星机械有限公司",
          terminalName: "TXXHL08-A",
          stationName: "同星东马坊充充电站",
          stationId: "283613",
          terminalCode: "3201060098146001",
          pileCode: "32010600981460",
          pileName: "——",
          brand: "同兴",
          model: "TXDC-2-320",
          power: 320,
          deviceType: "一体式直流桩",
          hostType: "——",
          status: "enable",
          gunStatus: "未插枪",
          workStatus: "空闲",
        },
        {
          operatorId: "35202",
          operatorName: "新乡市牧野区同星机械有限公司",
          terminalName: "TXXHL08-B",
          stationName: "同星东马坊充充电站",
          stationId: "283613",
          terminalCode: "3201060098146002",
          pileCode: "32010600981460",
          pileName: "——",
          brand: "同兴",
          model: "TXDC-2-320",
          power: 320,
          deviceType: "一体式直流桩",
          hostType: "——",
          status: "enable",
          gunStatus: "未插枪",
          workStatus: "空闲",
        },
      ],
    };
  },
  computed: {
    filtered() {
      const f = this.searchForm;
      return this.tableData.filter(
        (item) =>
          (!f.operator || item.operatorName.includes(f.operator)) &&
          (!f.operatorId || item.operatorId.includes(f.operatorId)) &&
          (!f.terminalName || item.terminalName.includes(f.terminalName)) &&
          (!f.stationId || item.stationId.includes(f.stationId)) &&
          (!f.terminalCode || item.terminalCode.includes(f.terminalCode)) &&
          (!f.status || item.status === f.status)
      );
    },
    filterList() {
      const start = (this.page - 1) * this.pageSize;
      return this.filtered.slice(start, start + this.pageSize);
    },
    totalPage() {
      return Math.max(1, Math.ceil(this.filtered.length / this.pageSize));
    },
  },
  methods: {
    workClass(s) {
      if (s === "空闲" || s === "充电中") return "w-green";
      if (s === "离线") return "w-gray";
      return "w-red";
    },
    handleSearch() {
      this.page = 1;
      this.showToast("筛选完成");
    },
    resetSearch() {
      this.searchForm = {
        operator: "",
        operatorId: "",
        terminalName: "",
        stationId: "",
        terminalCode: "",
        status: "",
      };
      this.page = 1;
      this.showToast("已重置");
    },
    handleSyncPrice(row) {
      this.showToast(`终端【${row.terminalName}】校时校价请求已提交`);
    },
    handleExport() {
      this.showToast("导出数据成功");
    },
    handleDownloadQr() {
      this.showToast("二维码下载已开始");
    },
    openOperate(row) {
      this.currentRow = row;
      if (row.status === "enable") {
        this.operateTitle = "确认停用终端";
        this.operateDesc = `停用后终端【${row.terminalName}】停止充电服务，司机无法扫码充电，确认停用？`;
        this.operateConfirmClass = "btn-danger";
      } else {
        this.operateTitle = "确认启用终端";
        this.operateDesc = `启用后终端【${row.terminalName}】恢复充电服务，确认启用？`;
        this.operateConfirmClass = "btn-primary";
      }
      this.operateShow = true;
    },
    confirmOperate() {
      this.currentRow.status =
        this.currentRow.status === "enable" ? "disable" : "enable";
      this.operateShow = false;
      this.showToast("操作成功");
    },
    openEdit(row) {
      this.currentRow = row;
      this.editForm = { ...row };
      this.editShow = true;
    },
    saveEdit() {
      Object.assign(this.currentRow, this.editForm);
      this.editShow = false;
      this.showToast("保存成功");
    },
    openDetail(row) {
      this.detail = row;
      this.detailShow = true;
    },
    showToast(msg) {
      this.toastMsg = msg;
      this.toastShow = true;
      setTimeout(() => {
        this.toastShow = false;
      }, 1800);
    },
  },
};
</script>

<style scoped>
.terminal-page {
  padding: 24px;
  background: #f7f9fc;
  min-height: 100vh;
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
  color: #242b3b;
}
.breadcrumb {
  color: #717c94;
  font-size: 14px;
  margin-bottom: 16px;
}
.breadcrumb span {
  margin: 0 6px;
}
.breadcrumb strong {
  color: #3b82f6;
  font-weight: 500;
}
.page-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}
.title {
  font-size: 18px;
  font-weight: 600;
}
.head-actions {
  display: flex;
  gap: 10px;
}
.btn {
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-primary {
  background: #3b82f6;
  color: #fff;
}
.btn-primary:hover {
  background: #2563eb;
}
.btn-danger {
  background: #ef4444;
  color: #fff;
}
.btn-default {
  background: #fff;
  border: 1px solid #dce3ee;
  color: #242b3b;
}
.btn-default:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}
.btn-ghost {
  background: #eff6ff;
  color: #3b82f6;
  border: 1px solid #dbeafe;
}
.filter-card,
.table-card {
  background: #fff;
  border: 1px solid #e4eaf3;
  border-radius: 12px;
  padding: 22px;
  margin-bottom: 18px;
}
.filter-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr) auto;
  gap: 16px;
  align-items: end;
}
.filter-item label {
  display: block;
  font-size: 13px;
  color: #64748b;
  margin-bottom: 6px;
}
.filter-item input,
.filter-item select {
  width: 100%;
  height: 38px;
  border: 1px solid #dce3ee;
  border-radius: 8px;
  padding: 0 12px;
  font-size: 14px;
  background: #f7f9fc;
}
.filter-item input:focus,
.filter-item select:focus {
  outline: none;
  border-color: #3b82f6;
}
.filter-btns {
  display: flex;
  gap: 10px;
}
.more-toggle {
  text-align: center;
  color: #3b82f6;
  font-size: 14px;
  margin-top: 16px;
  cursor: pointer;
}
.more-panel {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed #e4eaf3;
}
.table-scroll {
  overflow-x: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1500px;
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
.empty {
  text-align: center;
  color: #717c94;
  padding: 40px;
}
.tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}
.tag-green {
  background: #ecfdf3;
  color: #16a34a;
}
.tag-red {
  background: #fef2f2;
  color: #dc2626;
}
.work-tag {
  font-size: 13px;
}
.w-green {
  color: #16a34a;
}
.w-gray {
  color: #64748b;
}
.w-red {
  color: #dc2626;
}
.ops {
  display: flex;
  gap: 8px;
}
.op {
  background: none;
  border: none;
  font-size: 13px;
  cursor: pointer;
}
.op.green {
  color: #10b981;
}
.op.blue {
  color: #3b82f6;
}
.op.red {
  color: #ef4444;
}
.op.orange {
  color: #f59e0b;
}
.op:hover {
  text-decoration: underline;
}
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
}
.mask {
  position: fixed;
  inset: 0;
  background: rgba(36, 43, 59, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
.modal {
  background: #fff;
  border-radius: 12px;
  width: 620px;
  max-width: 92vw;
  max-height: 86vh;
  overflow-y: auto;
  padding: 26px;
}
.modal h3 {
  margin-bottom: 18px;
  font-size: 17px;
}
.modal p {
  color: #717c94;
  line-height: 1.6;
  margin-bottom: 20px;
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
}
</style>
