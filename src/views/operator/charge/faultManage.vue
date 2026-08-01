<template>
  <div class="app-container">
    <el-tabs v-model="activeTab" type="border-card">
      <el-tab-pane label="故障上报" name="faultReport">
        <el-form :model="faultReportForm" ref="faultReportForm" label-width="120px" style="margin-top: 20px;">
          <el-form-item label="桩编号" prop="pileId">
            <el-input v-model="faultReportForm.pileId" placeholder="请输入桩编号"></el-input>
          </el-form-item>
          <el-form-item label="接口号" prop="portId">
            <el-input type="number" v-model="faultReportForm.portId" placeholder="请输入接口号"></el-input>
          </el-form-item>
          <el-form-item label="故障类型" prop="faultType">
            <el-input type="number" v-model="faultReportForm.faultType" placeholder="请输入故障类型"></el-input>
          </el-form-item>
          <el-form-item label="故障代码" prop="faultCode">
            <el-input type="number" v-model="faultReportForm.faultCode" placeholder="请输入故障代码"></el-input>
          </el-form-item>
          <el-form-item label="故障时间" prop="faultTime">
            <el-date-picker v-model="faultReportForm.faultTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" placeholder="选择故障时间"></el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleFaultReport">提交故障上报</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="故障复位" name="faultReset">
        <el-form :model="faultResetForm" ref="faultResetForm" label-width="120px" style="margin-top: 20px;">
          <el-form-item label="桩编号" prop="pileId">
            <el-input v-model="faultResetForm.pileId" placeholder="请输入桩编号"></el-input>
          </el-form-item>
          <el-form-item label="接口号" prop="portId">
            <el-input type="number" v-model="faultResetForm.portId" placeholder="请输入接口号"></el-input>
          </el-form-item>
          <el-form-item label="故障代码" prop="faultCode">
            <el-input type="number" v-model="faultResetForm.faultCode" placeholder="请输入故障代码"></el-input>
          </el-form-item>
          <el-form-item label="复位时间" prop="resetTime">
            <el-date-picker v-model="faultResetForm.resetTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" placeholder="选择复位时间"></el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleFaultReset">提交故障复位</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="充电机启动完成" name="startupComplete">
        <el-form :model="startupForm" ref="startupForm" label-width="120px" style="margin-top: 20px;">
          <el-form-item label="桩编号" prop="pileId">
            <el-input v-model="startupForm.pileId" placeholder="请输入桩编号"></el-input>
          </el-form-item>
          <el-form-item label="接口号" prop="portId">
            <el-input type="number" v-model="startupForm.portId" placeholder="请输入接口号"></el-input>
          </el-form-item>
          <el-form-item label="订单号" prop="orderId">
            <el-input v-model="startupForm.orderId" placeholder="请输入订单号"></el-input>
          </el-form-item>
          <el-form-item label="启动结果" prop="startupResult">
            <el-select v-model="startupForm.startupResult" placeholder="选择启动结果">
              <el-option label="成功" :value="0"></el-option>
              <el-option label="失败" :value="1"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="失败代码" prop="failCode">
            <el-input type="number" v-model="startupForm.failCode" placeholder="请输入失败代码"></el-input>
          </el-form-item>
          <el-form-item label="表计数值" prop="meterValue">
            <el-input type="number" v-model="startupForm.meterValue" placeholder="请输入表计数值"></el-input>
          </el-form-item>
          <el-form-item label="VIN码" prop="vinCode">
            <el-input v-model="startupForm.vinCode" placeholder="请输入VIN码"></el-input>
          </el-form-item>
          <el-form-item label="SOC" prop="soc">
            <el-input type="number" v-model="startupForm.soc" placeholder="请输入SOC值"></el-input>
          </el-form-item>
          <el-form-item label="BMS状态" prop="bmsStatus">
            <el-input type="number" v-model="startupForm.bmsStatus" placeholder="请输入BMS状态"></el-input>
          </el-form-item>
          <el-form-item label="充电机状态" prop="chargerStatus">
            <el-input type="number" v-model="startupForm.chargerStatus" placeholder="请输入充电机状态"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleStartupComplete">提交启动完成</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="VIN鉴权" name="vinAuth">
        <el-form :model="vinAuthForm" ref="vinAuthForm" label-width="120px" style="margin-top: 20px;">
          <el-form-item label="桩编号" prop="pileId">
            <el-input v-model="vinAuthForm.pileId" placeholder="请输入桩编号"></el-input>
          </el-form-item>
          <el-form-item label="接口号" prop="portId">
            <el-input type="number" v-model="vinAuthForm.portId" placeholder="请输入接口号"></el-input>
          </el-form-item>
          <el-form-item label="VIN码" prop="vinCode">
            <el-input v-model="vinAuthForm.vinCode" placeholder="请输入VIN码"></el-input>
          </el-form-item>
          <el-form-item label="鉴权结果" prop="authResult">
            <el-select v-model="vinAuthForm.authResult" placeholder="选择鉴权结果">
              <el-option label="成功" :value="0"></el-option>
              <el-option label="失败" :value="1"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="订单号" prop="orderId">
            <el-input v-model="vinAuthForm.orderId" placeholder="请输入订单号"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleVinAuth">提交VIN鉴权</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="功率控制" name="powerControl">
        <el-form :model="powerControlForm" ref="powerControlForm" label-width="120px" style="margin-top: 20px;">
          <el-form-item label="桩编号" prop="pileId">
            <el-input v-model="powerControlForm.pileId" placeholder="请输入桩编号"></el-input>
          </el-form-item>
          <el-form-item label="接口号" prop="portId">
            <el-input type="number" v-model="powerControlForm.portId" placeholder="请输入接口号"></el-input>
          </el-form-item>
          <el-form-item label="最大功率" prop="maxPower">
            <el-input type="number" v-model="powerControlForm.maxPower" placeholder="请输入最大功率"></el-input>
          </el-form-item>
          <el-form-item label="优先级" prop="priority">
            <el-input type="number" v-model="powerControlForm.priority" placeholder="请输入优先级"></el-input>
          </el-form-item>
          <el-form-item label="限制分钟数" prop="limitMinutes">
            <el-input type="number" v-model="powerControlForm.limitMinutes" placeholder="请输入限制分钟数"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handlePowerControl">提交功率控制</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { faultReport, faultReset, startupComplete, vinAuth, powerControl } from "@/api/operator/charge";

export default {
  name: "FaultManage",
  data() {
    return {
      activeTab: "faultReport",
      faultReportForm: {
        pileId: "",
        portId: "",
        faultType: "",
        faultCode: "",
        faultTime: ""
      },
      faultResetForm: {
        pileId: "",
        portId: "",
        faultCode: "",
        resetTime: ""
      },
      startupForm: {
        pileId: "",
        portId: "",
        orderId: "",
        startupResult: "",
        failCode: "",
        meterValue: "",
        vinCode: "",
        soc: "",
        bmsStatus: "",
        chargerStatus: ""
      },
      vinAuthForm: {
        pileId: "",
        portId: "",
        vinCode: "",
        authResult: "",
        orderId: ""
      },
      powerControlForm: {
        pileId: "",
        portId: "",
        maxPower: "",
        priority: "",
        limitMinutes: ""
      }
    };
  },
  methods: {
    handleFaultReport() {
      faultReport(this.faultReportForm).then(res => {
        if (res.code === 200) {
          this.$message.success("故障上报成功");
          this.$refs.faultReportForm.resetFields();
        } else {
          this.$message.error(res.msg || "故障上报失败");
        }
      }).catch(err => {
        this.$message.error(err.response?.data?.msg || err.message || "故障上报异常");
      });
    },
    handleFaultReset() {
      faultReset(this.faultResetForm).then(res => {
        if (res.code === 200) {
          this.$message.success("故障复位成功");
          this.$refs.faultResetForm.resetFields();
        } else {
          this.$message.error(res.msg || "故障复位失败");
        }
      }).catch(err => {
        this.$message.error(err.response?.data?.msg || err.message || "故障复位异常");
      });
    },
    handleStartupComplete() {
      startupComplete(this.startupForm).then(res => {
        if (res.code === 200) {
          this.$message.success("启动完成报告成功");
          this.$refs.startupForm.resetFields();
        } else {
          this.$message.error(res.msg || "启动完成报告失败");
        }
      }).catch(err => {
        this.$message.error(err.response?.data?.msg || err.message || "启动完成报告异常");
      });
    },
    handleVinAuth() {
      vinAuth(this.vinAuthForm).then(res => {
        if (res.code === 200) {
          this.$message.success("VIN鉴权上报成功");
          this.$refs.vinAuthForm.resetFields();
        } else {
          this.$message.error(res.msg || "VIN鉴权上报失败");
        }
      }).catch(err => {
        this.$message.error(err.response?.data?.msg || err.message || "VIN鉴权上报异常");
      });
    },
    handlePowerControl() {
      powerControl(this.powerControlForm).then(res => {
        if (res.code === 200) {
          this.$message.success("功率控制上报成功");
          this.$refs.powerControlForm.resetFields();
        } else {
          this.$message.error(res.msg || "功率控制上报失败");
        }
      }).catch(err => {
        this.$message.error(err.response?.data?.msg || err.message || "功率控制上报异常");
      });
    }
  }
};
</script>