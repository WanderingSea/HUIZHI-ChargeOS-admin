import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

/* Layout */
import Layout from "@/layout";
import ParentView from "@/components/ParentView";

/**
 * Note: 路由配置项
 *
 * hidden: true                     // 当设置 true 的时候该路由不会再侧边栏出现 如 401，login 等页面，或者如一些编辑页面 /edit/1
 * alwaysShow: true                 // 当你一个路由下面的 children 声明的路由大于 1 个时，自动会变成嵌套的模式 -- 如组件页面
 *                                  // 只有一个时，会将那个子路由当做根路由显示在侧边栏 -- 如引导页面
 *                                  // 若你想不管路由下面的 children 声明的个数都显示你的根路由
 *                                  // 你可以设置 alwaysShow: true，这样它就会忽略之前定义的规则，一直显示根路由
 * redirect: noRedirect             // 当设置 noRedirect 的时候该路由在面包屑导航中不可被点击
 * name:'router-name'               // 设定路由的名字，一定要填写不然使用<keep-alive>时会出现各种问题
 * query: '{"id": 1, "name": "vctgo"}' // 访问路由的默认传递参数
 * roles: ['admin', 'common']       // 访问路由的角色权限
 * permissions: ['a:a:a', 'b:b:b']  // 访问路由的菜单权限
 * meta : {
    noCache: true                   // 如果设置为 true，则不会被 <keep-alive> 缓存 (默认 false)
    title: 'title'                  // 设置该路由在侧边栏和面包屑中展示的名字
    icon: 'svg-name'                // 设置该路由的图标，对应路径 src/assets/icons/svg
    breadcrumb: false               // 如果设置为 false，则不会在 breadcrumb 面包屑中显示
    activeMenu: '/system/user'      // 当路由设置了该属性，则会高亮相对应的侧边栏。
  }
 */

const Placeholder = () => import("@/views/placeholder/index");
export const dynamicRoutes = [];
// 公共路由
export const constantRoutes = [
  {
    path: "/redirect",
    component: Layout,
    hidden: true,
    children: [
      {
        path: "/redirect/:path (.*)",
        component: () => import("@/views/redirect"),
      },
    ],
  },
  {
    path: "/login",
    component: () => import("@/views/login"),
    hidden: true,
  },
  {
    path: "/register",
    component: () => import("@/views/register"),
    hidden: true,
  },
  {
    path: "/404",
    component: () => import("@/views/error/404"),
    hidden: true,
  },
  {
    path: "/401",
    component: () => import("@/views/error/401"),
    hidden: true,
  },
  {
    path: "/user",
    component: Layout,
    hidden: true,
    redirect: "noredirect",
    children: [
      {
        path: "profile",
        component: () => import("@/views/system/user/profile/index"),
        name: "Profile",
        meta: { title: "个人中心", icon: "user" },
      },
    ],
  },
  {
    path: "/",
    redirect: "/workbench/overview",
  },
  {
    path: "/workbench/dashboard",
    component: () => import("@/views/workbench/dashboard"),
    name: "FullDashboard",
    meta: { title: "总览", icon: "chart" },
    hidden: true,
  },
];

// 菜单路由
export const staticMenuRoutes = [
  // 工作台
  {
    path: "/workbench",
    component: Layout,
    redirect: "/workbench/overview",
    meta: { title: "工作台", icon: "home" },
    children: [
      {
        path: "overview",
        component: () => import("@/views/workbench/overview"),
        name: "Overview",
        meta: { title: "首页", icon: "dashboard", affix: true },
      },
      {
        path: "dashboard-redirect",
        redirect: "/workbench/dashboard",
        meta: { title: "总览", icon: "chart" },
      },
      {
        path: "todo",
        component: ParentView,
        name: "Todo",
        redirect: "/workbench/todo/repair",
        meta: { title: "待办事项", icon: "list" },
        alwaysShow: true,
        children: [
          {
            path: "repair",
            component: Placeholder,
            name: "TodoRepair",
            meta: { title: "报修待处理" },
          },
          {
            path: "withdraw",
            component: Placeholder,
            name: "TodoWithdraw",
            meta: { title: "提现待审核" },
          },
        ],
      },
      {
        path: "notice",
        component: Placeholder,
        name: "WorkbenchNotice",
        meta: { title: "平台公告", icon: "message" },
      },
    ],
  }, //  组织与权限

  {
    path: "/org",
    component: Layout,
    redirect: "/org/dept",
    meta: { title: "组织与权限", icon: "peoples" },
    children: [
      {
        path: "dept",
        component: Placeholder,
        name: "OrgDept",
        meta: { title: "机构管理", icon: "tree" },
      },
      {
        path: "internal-user",
        component: Placeholder,
        name: "InternalUser",
        meta: { title: "内部用户管理", icon: "user" },
      },
      {
        path: "role",
        component: Placeholder,
        name: "OrgRole",
        meta: { title: "角色权限管理", icon: "lock" },
      },
      {
        path: "operator-user",
        component: ParentView,
        name: "OperatorUser",
        redirect: "/org/operator-user/exclusive",
        meta: { title: "运营商专属用户", icon: "people" },
        alwaysShow: true,
        children: [
          {
            path: "exclusive",
            component: Placeholder,
            name: "ExclusiveUser",
            meta: { title: "运营商专属用户列表" },
          },
        ],
      },
      {
        path: "platform-user-group",
        component: Placeholder,
        name: "PlatformUserGroup",
        meta: { title: "平台用户分组", icon: "peoples" },
      },
      {
        path: "vehicle",
        component: Placeholder,
        name: "OrgVehicle",
        meta: { title: "车辆管理", icon: "list" },
      },
      {
        path: "operlog",
        component: Placeholder,
        name: "OrgOperlog",
        meta: { title: "操作日志", icon: "log" },
      },
    ],
  }, // 运维管理

  {
    path: "/ops",
    component: Layout,
    redirect: "/ops/safety-alert",
    meta: { title: "运维管理", icon: "monitor" },
    children: [
      {
        path: "safety-alert",
        component: Placeholder,
        name: "SafetyAlert",
        meta: { title: "电桩安全告警", icon: "warning" },
      },
      {
        path: "fault-alert",
        component: Placeholder,
        name: "FaultAlert",
        meta: { title: "电桩故障告警", icon: "bug" },
      },
      {
        path: "vehicle-alert",
        component: Placeholder,
        name: "VehicleAlert",
        meta: { title: "车辆告警", icon: "phone" },
      },
      {
        path: "alert-setting",
        component: Placeholder,
        name: "AlertSetting",
        meta: { title: "告警设置", icon: "edit" },
      },
      {
        path: "repair-order",
        component: Placeholder,
        name: "RepairOrder",
        meta: { title: "保修工单", icon: "form" },
      },
    ],
  }, // 站场设备管理

  {
    path: "/station",
    component: Layout,
    redirect: "/station/monitor",
    meta: { title: "站场设备管理", icon: "server" },
    children: [
      {
        path: "monitor",
        component: Placeholder,
        name: "StationMonitor",
        meta: { title: "场站监控", icon: "monitor" },
      },
      {
        path: "charge-station",
        component: Placeholder,
        name: "ChargeStation",
        meta: { title: "充电站管理", icon: "list" },
      },
      {
        path: "charge-pile",
        component: Placeholder,
        name: "ChargePile",
        meta: { title: "充电桩管理", icon: "build" },
      },
      {
        path: "charge-gun",
        component: Placeholder,
        name: "ChargeGun",
        meta: { title: "充电枪管理", icon: "tool" },
      },
      {
        path: "price-rate",
        component: Placeholder,
        name: "PriceRate",
        meta: { title: "费率定价管理", icon: "money" },
      },
      {
        path: "station-supervise",
        component: Placeholder,
        name: "StationSupervise",
        meta: { title: "充电站监管信息列表", icon: "chart" },
      },
      {
        path: "pile-supervise",
        component: Placeholder,
        name: "PileSupervise",
        meta: { title: "充电桩监管信息列表", icon: "chart" },
      },
      {
        path: "gun-supervise",
        component: Placeholder,
        name: "GunSupervise",
        meta: { title: "充电枪监管信息列表", icon: "chart" },
      },
    ],
  }, // 订单管理

  {
    path: "/order",
    component: Layout,
    redirect: "/order/list",
    meta: { title: "订单管理", icon: "excel" },
    children: [
      {
        path: "list",
        component: ParentView,
        name: "OrderList",
        redirect: "/order/list/realtime",
        meta: { title: "订单管理", icon: "excel" },
        alwaysShow: true,
        children: [
          {
            path: "realtime",
            component: Placeholder,
            name: "OrderRealtime",
            meta: { title: "实时订单" },
          },
          {
            path: "history",
            component: Placeholder,
            name: "OrderHistory",
            meta: { title: "历史订单" },
          },
          {
            path: "abnormal",
            component: Placeholder,
            name: "OrderAbnormal",
            meta: { title: "异常订单" },
          },
        ],
      },
      {
        path: "reservation",
        component: Placeholder,
        name: "OrderReservation",
        meta: { title: "预约订单", icon: "date-range" },
      },
      {
        path: "refund",
        component: Placeholder,
        name: "OrderRefund",
        meta: { title: "退款申请处理", icon: "edit" },
      },
    ],
  }, // 财务管理

  {
    path: "/finance",
    component: Layout,
    redirect: "/finance/account",
    meta: { title: "财务管理", icon: "money" },
    children: [
      {
        path: "account",
        component: Placeholder,
        name: "FinanceAccount",
        meta: { title: "账户总览", icon: "dashboard" },
      },
      {
        path: "income-bill",
        component: Placeholder,
        name: "IncomeBill",
        meta: { title: "收入账单管理", icon: "excel" },
      },
      {
        path: "withdraw",
        component: ParentView,
        name: "FinanceWithdraw",
        redirect: "/finance/withdraw/apply",
        meta: { title: "提现管理", icon: "form" },
        alwaysShow: true,
        children: [
          {
            path: "apply",
            component: Placeholder,
            name: "WithdrawApply",
            meta: { title: "提现申请" },
          },
          {
            path: "record",
            component: Placeholder,
            name: "WithdrawRecord",
            meta: { title: "提现记录" },
          },
        ],
      },
      {
        path: "reconciliation",
        component: Placeholder,
        name: "Reconciliation",
        meta: { title: "对账管理", icon: "chart" },
      },
      {
        path: "invoice",
        component: Placeholder,
        name: "FinanceInvoice",
        meta: { title: "发票管理", icon: "list" },
      },
    ],
  }, // 数据统计

  {
    path: "/statistics",
    component: Layout,
    redirect: "/statistics/business",
    meta: { title: "数据统计", icon: "chart" },
    children: [
      {
        path: "business",
        component: Placeholder,
        name: "BusinessOverview",
        meta: { title: "经营总览", icon: "dashboard" },
      },
      {
        path: "station-charge",
        component: Placeholder,
        name: "StationChargeStats",
        meta: { title: "站场充电统计", icon: "chart" },
      },
      {
        path: "station-run",
        component: Placeholder,
        name: "StationRunStats",
        meta: { title: "站场运行统计", icon: "monitor" },
      },
      {
        path: "device-charge",
        component: Placeholder,
        name: "DeviceChargeStats",
        meta: { title: "设备充电统计", icon: "build" },
      },
      {
        path: "station-asset",
        component: Placeholder,
        name: "StationAssetStats",
        meta: { title: "站场资产统计", icon: "list" },
      },
      {
        path: "device-asset",
        component: Placeholder,
        name: "DeviceAssetStats",
        meta: { title: "设备资产统计", icon: "tool" },
      },
    ],
  }, //  客户管理
  {
    path: "/customer",
    component: Layout,
    redirect: "/customer/car-owner",
    meta: { title: "客户管理", icon: "user" },
    children: [
      {
        path: "car-owner",
        component: ParentView,
        name: "CarOwnerUser",
        redirect: "/customer/car-owner/exclusive",
        meta: { title: "车主用户列表", icon: "people" },
        alwaysShow: true,
        children: [
          {
            path: "exclusive",
            component: Placeholder,
            name: "CarOwnerExclusive",
            meta: { title: "运营商专属用户" },
          },
          {
            path: "public",
            component: Placeholder,
            name: "CarOwnerPublic",
            meta: { title: "平台公共用户" },
          },
        ],
      },
      {
        path: "user-group",
        component: Placeholder,
        name: "CustomerUserGroup",
        meta: { title: "用户分组管理", icon: "peoples" },
      },
      {
        path: "blacklist",
        component: Placeholder,
        name: "CustomerBlacklist",
        meta: { title: "黑名单管理", icon: "lock" },
      },
      {
        path: "free-account",
        component: Placeholder,
        name: "FreeChargeAccount",
        meta: { title: "免费充电账号", icon: "money" },
      },
      {
        path: "feedback",
        component: Placeholder,
        name: "CustomerFeedback",
        meta: { title: "用户反馈", icon: "message" },
      },
    ],
  }, // 营销管理 // 营销管理（独立一级，不是谁的父目录 / 子目录）
  {
    path: "/marketing",
    component: Layout,
    redirect: "/marketing/index",
    meta: { title: "营销管理", icon: "shopping" },
    children: [
      {
        path: "index",
        component: Placeholder,
        name: "MarketingIndex",
        meta: { title: "营销管理", icon: "shopping", affix: true },
      },
    ],
  }, //- 增值服务
  {
    path: "/value-added",
    component: Layout,
    redirect: "/value-added/index",
    name: "ValueAddedService",
    meta: { title: "增值服务", icon: "star" },
    children: [
      {
        path: "index",
        component: Placeholder,
        name: "ValueAddedIndex",
        meta: { title: "增值服务", icon: "star", affix: true },
      },
    ],
  }, // 系统设置
  {
    path: "/system",
    component: Layout,
    redirect: "/system/account",
    meta: { title: "系统设置", icon: "system" },
    children: [
      {
        path: "account",
        component: Placeholder,
        name: "SystemAccount",
        meta: { title: "账户中心", icon: "user" },
      },
      {
        path: "sms-log",
        component: Placeholder,
        name: "SmsSendLog",
        meta: { title: "短息发送记录", icon: "message" },
      },
      {
        path: "operlog",
        component: ParentView,
        name: "SystemOperlog",
        redirect: "/system/operlog/login",
        meta: { title: "操作日志", icon: "log" },
        alwaysShow: true,
        children: [
          {
            path: "login",
            component: Placeholder,
            name: "LoginLog",
            meta: { title: "登录日志" },
          },
          {
            path: "backend",
            component: Placeholder,
            name: "BackendOperlog",
            meta: { title: "后台操作日志" },
          },
        ],
      },
      {
        path: "agreement",
        component: Placeholder,
        name: "AgreementManage",
        meta: { title: "协议管理", icon: "form" },
      },
      {
        path: "issue-feedback",
        component: Placeholder,
        name: "IssueFeedback",
        meta: { title: "问题反馈", icon: "question" },
      },
    ],
  },

  //   { path: "*", redirect: "/404", hidden: true },
];

// 防止连续点击多次路由报错
let routerPush = Router.prototype.push;
let routerReplace = Router.prototype.replace;
//push
Router.prototype.push = function push(location) {
  return routerPush.call(this, location).catch((err) => err);
};
//replace
Router.prototype.replace = function push(location) {
  return routerReplace.call(this, location).catch((err) => err);
};

export default new Router({
  mode: "history", // 去掉 url 中的 #
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes,
});
