<template>
  <el-dialog
    :visible.sync="dialogVisible"
    title="下载中心"
    width="820px"
    append-to-body
    :close-on-click-modal="false"
    custom-class="download-center-dialog"
  >
    <div class="dc-header">
      <div class="dc-header-info">
        <i class="el-icon-folder-opened"></i>
        <span class="dc-tip">文件将保留 {{ expireDays }} 天，请及时下载</span>
      </div>
      <div class="dc-header-actions">
        <el-button
          size="small"
          type="danger"
          plain
          :disabled="!downloadList.length"
          @click="handleClear"
        >
          <i class="el-icon-delete"></i>
          清空记录
        </el-button>
        <el-button size="small" type="primary" plain @click="refreshList">
          <i class="el-icon-refresh"></i>
          刷新
        </el-button>
      </div>
    </div>

    <div v-if="!downloadList.length" class="dc-empty">
      <i class="el-icon-document"></i>
      <p>暂无下载记录</p>
      <span>导出的文件将在这里显示</span>
    </div>

    <div v-else class="dc-table-wrap">
      <el-table
        :data="downloadList"
        stripe
        style="width: 100%"
        :header-cell-style="{
          background: '#fafbfc',
          color: '#606266',
          fontWeight: 500,
        }"
      >
        <el-table-column label="文件名" prop="filename" min-width="220">
          <template slot-scope="{ row }">
            <div class="file-name-cell">
              <i class="el-icon-document-csv file-icon"></i>
              <span class="file-name-text">{{ row.filename }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="来源页面"
          prop="pageName"
          min-width="140"
          show-overflow-tooltip
        />
        <el-table-column
          label="数据量"
          prop="dataCount"
          width="90"
          align="center"
        >
          <template slot-scope="{ row }"> {{ row.dataCount }} 条 </template>
        </el-table-column>
        <el-table-column label="大小" width="100" align="center">
          <template slot-scope="{ row }">
            {{ formatFileSize(row.fileSize) }}
          </template>
        </el-table-column>
        <el-table-column label="导出时间" width="160" align="center">
          <template slot-scope="{ row }">
            {{ formatTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="有效期" width="140" align="center">
          <template slot-scope="{ row }">
            <el-tooltip
              :content="formatTime(row.createTime + expireMs)"
              placement="top"
            >
              <span class="expire-tag">{{ getExpire(row.createTime) }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="110" align="center" fixed="right">
          <template slot-scope="{ row }">
            <el-button
              type="text"
              size="small"
              icon="el-icon-delete"
              class="delete-btn"
              @click="handleDelete(row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div slot="footer" class="dc-footer">
      <span class="dc-count"
        >共 <b>{{ downloadList.length }}</b> 个文件</span
      >
      <el-button @click="dialogVisible = false">关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import downloadCenter from "../utils/downloadCenter";

export default {
  name: "DownloadCenterDialog",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      downloadList: [],
      expireDays: downloadCenter.EXPIRE_DAYS,
    };
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible;
      },
      set(val) {
        this.$emit("update:visible", val);
      },
    },
    expireMs() {
      return downloadCenter.EXPIRE_DAYS * 24 * 60 * 60 * 1000;
    },
  },
  watch: {
    visible(val) {
      if (val) {
        this.refreshList();
      }
    },
  },
  methods: {
    refreshList() {
      this.downloadList = downloadCenter.getHistory();
    },
    formatTime(timestamp) {
      return downloadCenter.formatTime(timestamp);
    },
    formatFileSize(bytes) {
      return downloadCenter.getFileSize(bytes);
    },
    getExpire(timestamp) {
      return downloadCenter.getExpireTime(timestamp);
    },
    handleDelete(row) {
      this.$confirm(`确定要删除文件「${row.filename}」吗？`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          downloadCenter.removeRecord(row.id);
          this.refreshList();
          this.$message.success("删除成功");
        })
        .catch(() => {});
    },
    handleClear() {
      this.$confirm("确定要清空所有下载记录吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          downloadCenter.clearHistory();
          this.refreshList();
          this.$message.success("清空成功");
        })
        .catch(() => {});
    },
  },
};
</script>

<style scoped>
.dc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, #f0f7ff, #e8f0fe);
  border-radius: 8px;
  margin-bottom: 16px;
}
.dc-header-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #4078f5;
  font-size: 13px;
}
.dc-header-info i {
  font-size: 18px;
}
.dc-tip {
  font-weight: 500;
}
.dc-header-actions {
  display: flex;
  gap: 8px;
}

.dc-empty {
  text-align: center;
  padding: 60px 20px;
  color: #909399;
}
.dc-empty i {
  font-size: 64px;
  color: #dcdfe6;
  margin-bottom: 16px;
}
.dc-empty p {
  font-size: 15px;
  color: #606266;
  margin: 0 0 8px;
}
.dc-empty span {
  font-size: 12px;
}

.dc-table-wrap {
  max-height: 420px;
  overflow-y: auto;
}

.file-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}
.file-icon {
  font-size: 18px;
  color: #67c23a;
  flex-shrink: 0;
}
.file-name-text {
  font-size: 13px;
  color: #303133;
  word-break: break-all;
}

.expire-tag {
  font-size: 12px;
  color: #e6a23c;
  background: #fdf6ec;
  padding: 3px 8px;
  border-radius: 4px;
}

.delete-btn {
  color: #f56c6c !important;
}
.delete-btn:hover {
  color: #dd6161 !important;
}

.dc-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.dc-count {
  font-size: 13px;
  color: #606266;
}
.dc-count b {
  color: #4078f5;
  margin: 0 2px;
}
</style>

<style>
.download-center-dialog {
  border-radius: 12px !important;
  overflow: hidden;
}
.download-center-dialog .el-dialog__header {
  border-bottom: 1px solid #f0f1f3;
  padding: 18px 24px 14px;
}
.download-center-dialog .el-dialog__title {
  font-size: 17px;
  font-weight: 700;
  color: #1f2329;
}
.download-center-dialog .el-dialog__body {
  padding: 16px 24px 20px;
}
.download-center-dialog .el-dialog__footer {
  border-top: 1px solid #f0f1f3;
  padding: 14px 24px 18px;
}
.download-center-dialog .el-dialog__footer .el-button--primary {
  background: linear-gradient(135deg, #4078f5, #5a8df7);
  border-color: #4078f5;
  border-radius: 8px;
}
</style>
