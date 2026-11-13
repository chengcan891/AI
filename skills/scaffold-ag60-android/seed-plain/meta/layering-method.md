# 架构分层方法（可复用）

> 从 AG6.0 现行分层抽象而来，供学习与后续同类 Android 多模块项目套用。  
> 本仓库中的「现状地图」见 [项目架构总览](./project-architecture.md)、[模块地图](./module-map.md)。  
> 单功能如何落类见 [功能实现落类指南](./feature-implementation-guide.md)。  
> **要动手加功能**见 [增功能规范](./add-feature-sop.md)。  
> 本软件各主要业务域如何对照本方法阅读，见 [主要功能模块说明](./main-feature-modules.md)。

## 1. 方法目标

把「页面能跑」提升为「边界清晰、可替换、可测、可多人并行」：

| 目标 | 做法 |
|------|------|
| 改 UI 不牵动协议/库表 | UI 只依赖领域门面，不碰 DAO/串口细节 |
| 换设备/换云协议不牵动页面 | 协议与硬件落在独立层，向上只暴露稳定 API |
| 新人能定位代码 | 按层找模块，再按领域找 Service / Fragment |
| 后续项目可直接套模板 | 保留「层名 + 依赖方向 + 禁区」，产品名可换 |

## 2. 推荐分层（抽象模板）

把 AG6.0 的 `app / component / core / device|cloud / db / common` 抽象为六层：

```text
┌──────────────────────────────────────────────────────────┐
│ L0  应用壳（App Shell）     产品组装、Application、遗留桥接 │
├──────────────────────────────────────────────────────────┤
│ L1  表现层（Presentation）  Fragment / Activity / Dialog   │
│                             + 同包 ViewModel               │
├──────────────────────────────────────────────────────────┤
│ L2  领域编排（Domain）      Service / Coordinator / Manager│
│                             业务状态机、会话、跨设备编排     │
├──────────────────────────────────────────────────────────┤
│ L3  能力适配（Capability）  设备协议 / 云协议 / 地图算法等  │
│                             对上稳定门面，对下可换实现       │
├──────────────────────────────────────────────────────────┤
│ L4  持久化（Persistence）   Entity / DAO / DB 门面         │
├──────────────────────────────────────────────────────────┤
│ L5  公共基础（Foundation）  基类、工具、资源、日志、单位等   │
└──────────────────────────────────────────────────────────┘
```

### 与 AG6.0 模块对照

| 抽象层 | AG6.0 典型模块 | 一句话 |
|--------|----------------|--------|
| L0 | `app` | 装产品、起进程；新业务尽量不往这里堆 |
| L1 | `component-*` | 业务 UI + ViewModel |
| L2 | `core-*` | 领域服务与编排（如作业、差分、设备运行时） |
| L3 | `device-*`、`cloud-*`、`communication-*`、地图/算法 lib | 可替换的外部世界适配 |
| L4 | `db-*` | 三库（Main/User/Track）等持久化 |
| L5 | `common-*`、`lib*` 基建 | 无业务状态机的复用能力 |

> 套用到新项目时：层可以合并（例如小型项目把 L2+L3 合成 `domain`），但**不要倒置依赖**。

## 3. 依赖方向（硬规则）

```text
主链：  L0 → L1 → L2
L2 向下并列调用：  L3（能力） | L4（持久化） | L5（基础）
地基：  L1 / L2 / L3 / L4 均可依赖 L5；L5 不依赖上层
反向：  L2 可通过 SPI/路由发现 L1（禁止编译期硬依赖具体页面）

L3 与 L4 是并列，不是 L3 → L4 → L5。
```

| 规则 | 说明 |
|------|------|
| 只向下依赖 | 上层可调用下层；下层不得 import 上层具体页面 |
| L3∥L4 | 设备/云 与 DB **同级挂在 L2 下**；协议层默认不依赖 DAO |
| 同层慎交叉 | 同层模块之间优先经更稳定的契约或更下层转发，避免网状依赖 |
| 契约下沉 | 持久化接口放在 `db-base` 一类契约模块；实现模块可被装配替换 |
| 路由反向 | 用 `PageRoute` + Loader/SPI 发现页面，避免 Domain 硬依赖所有 UI 模块 |
| 禁止穿透 | L1 不直接调 DAO / 串口 / 云协议编解码；应经 L2（必要时再经 L3） |
| L5 可被多方依赖 | UI 可直连 common-view；业务经 L2；L5 禁止引用业务 Entity |

### 允许的「例外」与写法

| 场景 | 推荐写法 | 反例 |
|------|----------|------|
| Domain 要打开某页 | 调路由路径常量 | `core` 直接 `new XxxFragment` 并依赖整个 `component` |
| UI 要读库 | ViewModel → Service/Repository → DAO | Fragment 里拿 Room Database |
| 设备消息驱动业务 | L3 发消息/回调 → L2 消费 → L1 观察状态 | Decoder 里直接改 UI |
| 多产品差异 | L0/配置 + Capability 开关 | 在 DAO 里写 flavor if-else |

## 4. 各层职责与禁区

| 层 | 应做 | 禁区 |
|----|------|------|
| L0 应用壳 | Application、DI/装配、产品 flavor、旧代码隔离 | 堆新业务状态机、堆新设置页逻辑 |
| L1 表现层 | 渲染、点击、表单校验提示、观察 LiveData/Flow | 写串口、写 SQL、开长生命周期会话 |
| L2 领域编排 | 选择态、运行态、启停会话、跨模块编排、持久化策略 | 绑复杂 XML、解析板卡私有帧格式 |
| L3 能力适配 | 连接、协议编解码、云 TCP/HTTP、硬件差异 | 感知具体业务页、持有页面 Context 做 UI |
| L4 持久化 | Entity/DAO、库切换、事务边界 | 业务状态机、弹 Toast |
| L5 基础 | 基类、日志、单位、通用控件 | 引用具体业务 Entity 造成反向污染 |

## 5. 模块内部分层（单模块套用）

无论落在 `component` 还是 `core`，模块内部仍建议：

```text
api / facade     对外稳定入口（Service.instance、公开接口）
  ↓
domain logic     Coordinator / Manager / UseCase
  ↓
data access      Repository / DataSource / DAO 调用
  ↓
model            本域模型与映射
```

AG6.0 示例：`WorkService` 作门面，内部再拆 Selection / Survey / Pilot 等 Manager（见 [WorkService](../02-features/work-service.md)）。

## 6. 横切能力放哪

| 横切能力 | 推荐归属 | 备注 |
|----------|----------|------|
| 页面跳转 | 独立路由模块（L2 偏基础设施） | SPI 反向加载 L1 |
| 全局设置 / 事件 | 全局数据模块 | 不作单屏状态仓库 |
| 日志 | L5 | 统一 SLF4J，禁 System.out |
| 字符串 / 主题 / 单位 | L5 + 资源 | 多语言不靠重启 Activity（AG6.0 约定） |
| Feature / 渠道开关 | L2 或 L0 配置 + 文档化清单 | 见能力与 Feature 专文 |

## 7. 新项目落地步骤（套用清单）

1. **先定六层名字与模块前缀**（可改名，勿改依赖方向）。  
2. **画出 3～5 条主链路**（启动、主业务、设备/外部输入、持久化、设置）。  
3. **为每条链路标「入口类」**（谁拥有状态机）。  
4. **规定 UI ↔ Domain 通信方式**（LiveData/Flow + 可选事件总线）。  
5. **规定持久化契约位置**（接口与实现分离）。  
6. **规定路由/SPI 方式**（避免 Domain→UI 编译依赖）。  
7. **写一份「禁区表」**进 README，Code Review 按表打回。

## 8. 反模式速查

| 反模式 | 后果 | 改法 |
|--------|------|------|
| Fragment 直接 DAO | UI 与库表耦合，难测 | 经 ViewModel → Service/Repo |
| Service 持有 View | 泄漏、无法后台化 | 状态下行，UI 观察 |
| 协议类知道业务页 | 换板卡要改 UI 模块 | 协议停在 L3，业务在 L2 订阅 |
| 全局 EventBus 当状态库 | 时序难推、难复现 | 单屏状态进 ViewModel；跨屏用生命周期感知事件 |
| 新功能继续堆进 app 遗留包 | 边界消失 | 新功能进 component + core |

## 9. 相关文档

- [项目架构总览](./project-architecture.md)（AG6.0 现状）
- [模块地图](./module-map.md)
- [功能实现落类指南](./feature-implementation-guide.md)
- [主要功能模块说明](./main-feature-modules.md)（按本方法对照各业务域）
- 代码侧规范：`ag6.0/.coding-standards/skills/common-project-skill/SKILL.md`
