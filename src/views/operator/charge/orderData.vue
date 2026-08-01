<template>
  <div class="app-container">
    <el-tabs v-model="activeTab" type="border-card">
      <el-tab-pane label="费率段同步" name="rateDetailSync">
        <el-form :model="rateSyncForm" ref="rateSyncForm" label-width="120px" style="margin-top: 20px;">
          <el-form-item label="定价规则ID" prop="priceId">
            <el-input type="number" v-model="rateSyncForm.priceId" placeholder="请输入定价规则ID"></el-input>
          </el-form-item>
          <el-form-item label="费率明细">
            <el-table :data="rateDetailList" border>
              <el-table-column prop="rateIndex" label="费率段编号" align="center">
                <template slot-scope="scope">
                  <el-input type="number" v-model="scope.row.rateIndex" placeholder="费率段编号"></el-input>
                </template>
              </el-table-column>
              <el-table-column prop="elecRate" label="电费单价" align="center">
                <template slot-scope="scope">
                  <el-input type="number" v-model="scope.row.elecRate" placeholder="电费单价"></el-input>
                </template>
              </el-table-column>
              <el-table-column prop="serviceRate" label="服务费电价" align="center">
                <template slot-scope="scope">
                  <el-input type="number" v-model="scope.row.serviceRate" placeholder="服务费电价"></el-input>
                </template>
              </el-table-column>
              <el-table-column prop="startTime" label="开始时间" align="center">
                <template slot-scope="scope">
                  <el-time-picker v-model="scope.row.startTime" format="HH:mm:ss" value-format="HH:mm:ss" placeholder="开始时间"></el-time-picker>
                </template>
              </el-table-column>
              <el-table-column prop="endTime" label="结束时间" align="center">
                <template slot-scope="scope">
                  <el-time-picker v-model="scope.row.endTime" format="HH:mm:ss" value-format="HH:mm:ss" placeholder="结束时间"></el-time-picker>
                </template>
              </el-table-column>
              <el-table-column label="操作" align="center">
                <template slot-scope="scope">
                  <el-button type="text" @click="removeRateDetail(scope.$index)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-button type="text" @click="addRateDetail">添加费率明细</el-button>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleRateDetailSync">提交费率同步</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="订单费率明细" name="orderRateDetail">
        <el-form :model="orderRateDetailForm" ref="orderRateDetailForm" label-width="120px" style="margin-top: 20px;">
          <el-form-item label="订单号" prop="orderId">
            <el-input v-model="orderRateDetailForm.orderId" placeholder="请输入订单号"></el-input>
          </el-form-item>
          <el-form-item label="费率段编号" prop="rateIndex">
            <el-input type="number" v-model="orderRateDetailForm.rateIndex" placeholder="请输入费率段编号"></el-input>
          </el-form-item>
          <el-form-item label="费率价格" prop="ratePrice">
            <el-input type="number" v-model="orderRateDetailForm.ratePrice" placeholder="请输入费率价格"></el-input>
          </el-form-item>
          <el-form-item label="电量" prop="energy">
            <el-input type="number" v-model="orderRateDetailForm.energy" placeholder="请输入电量"></el-input>
          </el-form-item>
          <el-form-item label="损耗电量" prop="lossEnergy">
            <el-input type="number" v-model="orderRateDetailForm.lossEnergy" placeholder="请输入损耗电量"></el-input>
          </el-form-item>
          <el-form-item label="金额" prop="amount">
            <el-input type="number" v-model="orderRateDetailForm.amount" placeholder="请输入金额"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleOrderRateDetail">提交订单费率明细</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="分时电量" name="hourlyEnergy">
        <el-form :model="hourlyEnergyForm" ref="hourlyEnergyForm" label-width="120px" style="margin-top: 20px;">
          <el-form-item label="订单号" prop="orderId">
            <el-input v-model="hourlyEnergyForm.orderId" placeholder="请输入订单号"></el-input>
          </el-form-item>
          <el-form-item label="时段索引" prop="slotIndex">
            <el-input type="number" v-model="hourlyEnergyForm.slotIndex" placeholder="请输入时段索引"></el-input>
          </el-form-item>
          <el-form-item label="电量" prop="energy">
            <el-input type="number" v-model="hourlyEnergyForm.energy" placeholder="请输入电量"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleHourlyEnergy">提交分时电量</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="V2.0订单结算" name="v2OrderSettlement">
        <el-form :model="settlementForm" ref="settlementForm" label-width="120px" style="margin-top: 20px;">
          <el-form-item label="订单号" prop="orderId">
            <el-input v-model="settlementForm.orderId" placeholder="请输入订单号"></el-input>
          </el-form-item>
          <el-form-item label="总耗电量(kWh)" prop="totalPower">
            <el-input type="number" v-model="settlementForm.totalPower" placeholder="请输入总耗电量"></el-input>
          </el-form-item>
          <el-form-item label="开始时间" prop="startTime">
            <el-date-picker v-model="settlementForm.startTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" placeholder="选择开始时间"></el-date-picker>
          </el-form-item>
          <el-form-item label="结束时间" prop="endTime">
            <el-date-picker v-model="settlementForm.endTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" placeholder="选择结束时间"></el-date-picker>
          </el-form-item>
          <el-form-item label="电费" prop="electricFee">
            <el-input type="number" v-model="settlementForm.electricFee" placeholder="请输入电费"></el-input>
          </el-form-item>
          <el-form-item label="服务费" prop="serviceFee">
            <el-input type="number" v-model="settlementForm.serviceFee" placeholder="请输入服务费"></el-input>
          </el-form-item>
          <el-form-item label="总金额" prop="totalAmount">
            <el-input type="number" v-model="settlementForm.totalAmount" placeholder="请输入总金额"></el-input>
          </el-form-item>
          <el-form-item label="结束原因" prop="stopReason">
            <el-input v-model="settlementForm.stopReason" placeholder="请输入结束原因"></el-input>
          </el-form-item>
          <el-form-item label="表号" prop="meterNumber">
            <el-input v-model="settlementForm.meterNumber" placeholder="请输入表号（选填）"></el-input>
          </el-form-item>
          <el-form-item label="表计密码" prop="meterCipher">
            <el-input v-model="settlementForm.meterCipher" placeholder="请输入表计密码（选填）"></el-input>
          </el-form-item>
          <el-form-item label="表起始值" prop="meterStartValue">
            <el-input type="number" v-model="settlementForm.meterStartValue" placeholder="请输入表起始值（选填）"></el-input>
          </el-form-item>
          <el-form-item label="表结束值" prop="meterEndValue">
            <el-input type="number" v-model="settlementForm.meterEndValue" placeholder="请输入表结束值（选填）"></el-input>
          </el-form-item>
          <el-form-item label="VIN码" prop="vinCode">
            <el-input v-model="settlementForm.vinCode" placeholder="请输入VIN码（选填）"></el-input>
          </el-form-item>
          <el-form-item label="损耗电量" prop="lossTotalPower">
            <el-input type="number" v-model="settlementForm.lossTotalPower" placeholder="请输入损耗电量（选填）"></el-input>
          </el-form-item>
          <el-form-item label="交易类型" prop="tradeType">
            <el-select v-model="settlementForm.tradeType" placeholder="选择交易类型（选填）">
              <el-option label="充电" :value="0"></el-option>
              <el-option label="放电" :value="1"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleV2OrderSettlement">提交订单结算</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { rateDetailSync, orderRateDetail, hourlyEnergy, v2OrderSettlement } from "@/api/operator/charge";

export default {
  name: "OrderData",
  data() {
    return {
      activeTab: "rateDetailSync",
      rateSyncForm: {
        priceId: ""
      },
      rateDetailList: [
        {
          rateIndex: "",
          elecRate: "",
          serviceRate: "",
          startTime: "",
          endTime: ""
        }
      ],
      orderRateDetailForm: {
        orderId: "",
        rateIndex: "",
        ratePrice: "",
        energy: "",
        lossEnergy: "",
        amount: ""
      },
      hourlyEnergyForm: {
        orderId: "",
        slotIndex: "",
        energy: ""
      },
      settlementForm: {
        orderId: "",
        totalPower: "",
        startTime: "",
        endTime: "",
        electricFee: "",
        serviceFee: "",
        totalAmount: "",
        stopReason: "",
        meterNumber: "",
        meterCipher: "",
        meterStartValue: "",
        meterEndValue: "",
        vinCode: "",
        lossTotalPower: "",
        tradeType: ""
      }
    };
  },
  methods: {
    addRateDetail() {
      this.rateDetailList.push({
        rateIndex: "",
        elecRate: "",
        serviceRate: "",
        startTime: "",
        endTime: ""
      });
    },
    removeRateDetail(index) {
      if (this.rateDetailList.length > 1) {
        this.rateDetailList.splice(index, 1);
      }
    },
    handleRateDetailSync() {
      rateDetailSync(this.rateSyncForm.priceId, this.rateDetailList).then(res => {
        if (res.code === 200) {
          this.$message.success(res.msg || "费率同步成功");
          this.$refs.rateSyncForm.resetFields();
          this.rateDetailList = [{ rateIndex: "", elecRate: "", serviceRate: "", startTime: "", endTime: "" }];
        } else {
          this.$message.error(res.msg || "费率同步失败");
        }
      }).catch(err => {
        this.$message.error(err.response?.data?.msg || err.message || "费率同步异常");
      });
    },
    handleOrderRateDetail() {
      orderRateDetail(this.orderRateDetailForm).then(res => {
        if (res.code === 200) {
          this.$message.success(res.msg || "订单费率明细上报成功");
          this.$refs.orderRateDetailForm.resetFields();
        } else {
          this.$message.error(res.msg || "订单费率明细上报失败");
        }
      }).catch(err => {
        this.$message.error(err.response?.data?.msg || err.message || "订单费率明细上报异常");
      });
    },
    handleHourlyEnergy() {
      hourlyEnergy(this.hourlyEnergyForm.orderId, {
        slotIndex: this.hourlyEnergyForm.slotIndex,
        energy: this.hourlyEnergyForm.energy
      }).then(res => {
        if (res.code === 200) {
          this.$message.success(res.msg || "订单分时电量数据上报成功");
          this.$refs.hourlyEnergyForm.resetFields();
        } else {
          this.$message.error(res.msg || "订单分时电量数据上报失败");
        }
      }).catch(err => {
        this.$message.error(err.response?.data?.msg || err.message || "订单分时电量数据上报异常");
      });
    },
    handleV2OrderSettlement() {
      v2OrderSettlement(this.settlementForm).then(res => {
        if (res.code === 200) {
          this.$message.success(res.msg || "订单结算成功");
          this.$refs.settlementForm.resetFields();
        } else {
          this.$message.error(res.msg || "订单结算失败");
        }
      }).catch(err => {
        this.$message.error(err.response?.data?.msg || err.message || "订单结算异常");
      });
    }
  }
};
</script>