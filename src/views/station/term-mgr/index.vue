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
          下载二维码
        </button>
        <button class="btn btn-primary" @click="handleExport">导出</button>
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
/* ================= 基础重置 ================= */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* ================= 容器 & 冷调主题变量 ================= */
.terminal-page {
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
  --danger: #c0554a; /* 停用红：低饱和陶土红 */
  --danger-soft: #fbf0ee;

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
  margin-bottom: 20px;
  font-size: 13px;
  color: var(--ink-3);
}
.breadcrumb span {
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

/* ================= 页头 ================= */
.page-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  margin-bottom: 20px;
}
.title {
  position: relative;
  padding-left: 14px;
  font-size: 17px;
  font-weight: 600;
  letter-spacing: 0.8px;
  color: var(--ink);
}
.title::before {
  content: "";
  position: absolute;
  left: 0;
  top: 4px;
  bottom: 4px;
  width: 3px;
  border-radius: 2px;
  background: linear-gradient(180deg, var(--accent) 0%, var(--ice) 100%);
}
.head-actions {
  display: flex;
  gap: 10px;
}

/* ================= 按钮体系 ================= */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 34px;
  padding: 0 18px;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.4px;
  border: 1px solid transparent;
  border-radius: 999px;
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
.btn-danger {
  color: #fff;
  background: linear-gradient(135deg, #c97262 0%, #a8564a 100%);
  box-shadow: 0 8px 18px -10px rgba(168, 86, 74, 0.9);
}
.btn-danger:hover {
  background: linear-gradient(135deg, #a8564a 0%, #8e453b 100%);
  transform: translateY(-1px);
}
.btn-default {
  color: var(--ink-2);
  background: #fff;
  border-color: var(--line);
}
.btn-default:hover:not(:disabled) {
  color: var(--accent-2);
  background: var(--accent-soft);
  border-color: var(--accent);
}
.btn-default:disabled {
  color: var(--ink-4);
  background: #f8fbfd;
  cursor: not-allowed;
}
.btn-ghost {
  color: var(--accent-2);
  background: #fff;
  border-color: var(--line);
  box-shadow: 0 1px 2px rgba(31, 42, 55, 0.03);
}
.btn-ghost:hover {
  color: #fff;
  background: linear-gradient(135deg, #82a8c4 0%, #5e88ab 100%);
  border-color: transparent;
  transform: translateY(-1px);
  box-shadow: 0 10px 22px -10px rgba(94, 136, 171, 0.85);
}

/* ================= 筛选卡片 ================= */
.filter-card {
  padding: 24px 26px 16px;
  margin-bottom: 18px;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 18px;
  box-shadow: 0 1px 2px rgba(31, 42, 55, 0.03),
    0 10px 28px -22px rgba(31, 42, 55, 0.28);
}
.filter-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr)) auto;
  gap: 18px;
  align-items: end;
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
.filter-btns {
  display: flex;
  gap: 10px;
}
.filter-btns .btn {
  height: 38px;
  padding: 0 22px;
  border-radius: 10px;
}
.more-toggle {
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
.more-toggle:hover {
  background: var(--accent-soft);
  color: var(--accent-2);
}
.more-panel {
  margin-top: 16px;
  padding-top: 18px;
  border-top: 1px dashed var(--line);
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
.table-scroll {
  overflow-x: auto;
  padding: 20px 14px 0;
}
.table-scroll::-webkit-scrollbar {
  height: 8px;
}
.table-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.table-scroll::-webkit-scrollbar-thumb {
  background: #d3dde6;
  border-radius: 4px;
}
.table-scroll::-webkit-scrollbar-thumb:hover {
  background: #bccad6;
}

table {
  width: 100%;
  min-width: 1500px;
  border-collapse: separate;
  border-spacing: 0;
}
thead th {
  padding: 12px 12px;
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
  padding: 14px 12px;
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
.empty {
  padding: 64px 0 !important;
  text-align: center;
  font-size: 13px;
  letter-spacing: 3px;
  color: var(--ink-4) !important;
  background: transparent !important;
}

/* ================= 状态标签 ================= */
.tag {
  display: inline-block;
  padding: 3px 9px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.6;
  border-radius: 6px;
}
.tag-green {
  background: var(--accent-soft);
  color: var(--accent-2);
}
.tag-red {
  background: var(--danger-soft);
  color: var(--danger);
}
.work-tag {
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0.3px;
}
.w-green {
  color: var(--accent-2);
}
.w-gray {
  color: var(--ink-3);
}
.w-red {
  color: var(--danger);
}

/* ================= 操作按钮 ================= */
.ops {
  display: flex;
  gap: 4px;
  flex-wrap: nowrap;
}
.op {
  padding: 5px 10px;
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0.3px;
  background: transparent;
  border: none;
  border-radius: 7px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}
.op.green {
  color: var(--accent-2);
}
.op.green:hover {
  background: var(--accent-soft);
}
.op.blue {
  color: var(--accent-2);
}
.op.blue:hover {
  background: var(--accent-soft);
}
.op.red {
  color: var(--danger);
}
.op.red:hover {
  background: var(--danger-soft);
}
.op.orange {
  color: #6b8fb0;
}
.op.orange:hover {
  background: var(--ice-soft);
}

/* ================= 分页 ================= */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 6px;
  padding: 22px 26px 4px;
  font-size: 12.5px;
  color: var(--ink-3);
  border-top: 1px solid var(--line-2);
}
.pagination .btn {
  height: 32px;
  padding: 0 14px;
  font-size: 12.5px;
  border-radius: 8px;
}

/* ================= 弹窗 ================= */
.mask {
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
.modal {
  width: 640px;
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
  margin-bottom: 20px;
  padding-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.8px;
  color: var(--ink);
  border-bottom: 1px solid var(--line-2);
}
.modal h3::before {
  content: "";
  position: absolute;
  left: 0;
  top: 3px;
  bottom: 19px;
  width: 3px;
  border-radius: 2px;
  background: linear-gradient(180deg, var(--accent) 0%, var(--ice) 100%);
}
.modal p {
  margin-bottom: 20px;
  font-size: 13.5px;
  line-height: 1.75;
  color: var(--ink-2);
}
.modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--line-2);
}
.modal-foot .btn {
  height: 38px;
  padding: 0 22px;
  font-size: 13px;
  border-radius: 10px;
}

/* ================= 表单 ================= */
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

/* ================= 详情 ================= */
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
@media (max-width: 1200px) {
  .filter-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .filter-btns {
    grid-column: 1 / -1;
    justify-content: flex-end;
  }
}
@media (max-width: 1024px) {
  .terminal-page {
    padding: 24px 22px 48px;
  }
  .form-grid,
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 640px) {
  .terminal-page {
    padding: 20px 16px 40px;
  }
  .filter-row {
    grid-template-columns: 1fr;
  }
  .filter-btns {
    width: 100%;
  }
  .filter-btns .btn {
    flex: 1;
  }
  .filter-card {
    padding: 18px 16px;
    border-radius: 16px;
  }
  .head-actions {
    width: 100%;
  }
  .head-actions .btn {
    flex: 1;
    justify-content: center;
  }
  .modal {
    padding: 22px 20px;
    border-radius: 18px;
  }
}
</style>
