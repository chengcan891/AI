# 项目架构总览

> **本文职责**：AG6.0 **现状**分层、依赖、六大运行时入口、几条典型链路。  
> 可复用原则与禁区 → [分层方法](./layering-method.md)；模块清单 → [模块地图](./module-map.md)；用户路径 → [主流程](./main-flows.md)。

## 1. 项目定位

司南农业导航 Android 应用（多 flavor）。核心能力：作业（田/线/任务）、采点与自动驾驶、轨迹与地图、GNSS 差分、设备连接、ISOBUS、上云、设置与远程协助等。按域读代码见 [主要功能模块说明](./main-feature-modules.md)。

## 2. 分层结构（现状）

```text
┌─────────────────────────────────────────────────────────┐
│  app                         应用壳、产品组装、旧遗留 UI   │
├─────────────────────────────────────────────────────────┤
│  component-*                 业务 UI（Fragment/ViewModel）│
│  home / work / device / setting / common / isobus         │
├─────────────────────────────────────────────────────────┤
│  core-*                      领域服务与编排               │
│  app / work / work-map / device / gnss / cloud / ...      │
├─────────────────────────────────────────────────────────┤
│  cloud-*                     云协议 SDK / HTTP / 文件分享 │
│  device-* / communication-*  设备与通讯                   │
├─────────────────────────────────────────────────────────┤
│  db-*                        数据持久化（Main/User/Track） │
├─────────────────────────────────────────────────────────┤
│  common-* / lib*             公共能力与第三方封装          │
└─────────────────────────────────────────────────────────┘
```

| 层 | 职责 | 禁止（详见分层方法） |
|----|------|----------------------|
| `component` | UI、交互、路由页 | 直连板卡协议 / DAO |
| `core` | 业务编排、会话、算法协调 | 绑复杂 View |
| `device` / `cloud` | 设备与云协议适配 | 感知具体业务页 |
| `db` | Entity/DAO/Room | 业务状态机 |
| `common` / `lib*` | 复用基建 | 业务耦合 |

## 3. 依赖方向（原则）

```text
app → component → core → device / cloud / db / common
                 ↘ page-route（SPI 反向加载 component）
```

- **正向依赖**：上层依赖下层。
- **路由反向**：`IPageLoader` + AutoService，避免 core 硬依赖所有 UI。
- **数据契约**：业务依赖 `db-base`；Room 由 `db-manager` 装配。

## 4. 核心运行时入口

| 入口 | 模块 | 作用 |
|------|------|------|
| `AppContext` | core-app | 聚合单位、作业、车辆、差分等运行时服务 |
| `WorkService` | core-work | 当前作业选择态 / 采点 / 驾驶生命周期 |
| `CommonDeviceService` | device-common | 设备连接、Hub、GNSS、消息中心 |
| `DBServiceManager` | db-manager | Main / User / Track 三库门面 |
| `PageRoute` | page-route | 跨模块页面跳转 |
| `AppGlobalDataManager` | core-global-data | 全局设置与事件 |

## 5. 典型业务链路（示意）

端到端四段流程（冷启动 → Home 运行时 → 作业准备 → 采点/驾驶）见 **[程序主流程总览](./main-flows.md)**；详细状态机见 [02-features/flows](../02-features/flows/README.md)。

### 选田 → 选线 → 开车

```text
component-work 选线 UI
    → WorkService.updateSelection(...)
    → 持久化 WorkInfo + 切换 Track 库
    → WorkService.initPilotSession / startPilotDriving
    → PilotService + WorkAlgorithmCenter
    → WorkMapDisplayController / WorkMapRenderService 刷新地图
```

详见 [作业主流程](../02-features/flows/work-main-flow.md)。

### 差分定位

```text
component-device RTK UI
    → DiffService / DiffClientFactory
    → NTRIP/电台客户端
    → CommonDeviceService 写差分到板卡
```

### 页面跳转

```text
任意模块 PageRoute.open(RoutePath)
    → RouteModuleConfig 解析模块
    → 对应 *PageLoader 创建 Fragment/Activity
```

### 上云

```text
MainService
    → SinoCloudManager / DtCloudManager / LuoWangCloudManager.install
    → CloudService.start（6s 周期）
    → libcloud / libdtcloud 协议 + Farm HTTP
    → CloudDataIssueListener → sino/issue 写库
```

详见 [上云流程](../02-features/flows/cloud-flow.md)。

## 6. 与旧代码关系

- `app` 模块仍有部分遗留代码（如 `com.sinognss.sf.main.WorkService`），**不要**与 `com.sinognss.ag.core.work.service.WorkService` 混淆。
- 新功能优先落在 `component` + `core`，避免继续膨胀 `app` 遗留包。

## 7. 相关文档

- [总览阅读路径](./README.md)
- [分层方法](./layering-method.md) · [落类指南](./feature-implementation-guide.md)
- [主流程](./main-flows.md) · [主要功能模块](./main-feature-modules.md)
- [模块地图](./module-map.md) · [01-modules](../01-modules/README.md)
- [WorkService](../02-features/work-service.md) · [上云流程](../02-features/flows/cloud-flow.md)
