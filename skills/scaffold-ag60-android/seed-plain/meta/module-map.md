# 模块地图

> **速查**：谁依赖谁（依据 `settings.gradle`）。详细职责见 [01-modules](../01-modules/README.md)；  
> 分层原则见 [分层方法](./layering-method.md)；现状叙述见 [项目架构](./project-architecture.md)。

## 1. 分层一览

> 与 [分层方法](./layering-method.md) 的 L0～L5 **对齐**。  
> **易混点**：`core-cloud` / `core-device` 在 **L2 领域**（编排）；`cloud-*` / `device-*` 在 **L3 能力**（协议与硬件适配）。二者不是同一层，也不是重复列出。

| 抽象层 | Gradle / 目录群 | 典型模块 | 文档 |
|--------|-----------------|----------|------|
| **L0** 应用壳 | `app` | Application、Launch、MainService、云 Host 桥接 | （产品入口，见 [架构总览](./project-architecture.md)） |
| **L1** 表现层 | `component-*` | home / work / device / setting / common / isobus | [component](../01-modules/component/) |
| **L2** 领域编排 | `core-*` | page-route、global-data、**core-app**、**core-work**、work-map、**core-device**、gnss、map、isobus-data、camera、remote-control、**core-cloud** | [core](../01-modules/core/) |
| **L3** 能力适配（并列） | `device-*`、`cloud-*`、`communication-*` 等 | **设备**：device-common / board / borad-ag502 / profile / radio-*；**云协议**：libcloud / libdtcloud / sino-cloud / file-share | [device](../01-modules/device/) · [cloud](../01-modules/cloud/) |
| **L4** 持久化 | `db-*` | db-manager / base / main / track / user | [db](../01-modules/db/) |
| **L5** 公共基础 | `common-*`、部分 `lib*` | base-component、common-view、common-res、common-unit、common-log… | 见 §7 |

```text
依赖方向（原则，不是严格「一层压一层」）：

  L0 app
    → L1 component ──────────────→ L5 common（控件/基类，UI 可直连）
         → L2 core ──┬──→ L3 device | cloud | communication
                     ├──→ L4 db
                     └──→ L5 common

  L3 ──→ L5（工具/通讯基建）     ※ 一般不依赖 L4
  L4 ──→ L5
  L3 ↔ L4                       ※ 默认无依赖；并列，不是上下级
```

| 关系 | 是否明确 | 说明 |
|------|----------|------|
| L0→L1→L2 | 明确 | 主调用链 |
| L2→L3、L2→L4 | 明确 | 领域分别编排「外部世界」与「落库」 |
| L3 与 L4 | **并列** | 都挂在 L2 下；**不是** L3→L4→L5 一条链 |
| 各层→L5 | 明确 | L5 是地基，谁都可以用；L5 不依赖上层 |
| L1→L5 | 允许 | UI 直接用 `common-view` 等，不必经 core |
| L3→L4 | **原则上禁止** | 板卡/云协议不应感知 Room；落库由 L2 编排 |

## 2. Core 依赖关系（简化）

```text
page-route
    ↑
core-global-data
    ↑
    ├── core-device
    ├── core-gnss
    ├── core-work-map ←── core-camera
    ├── core-remote-control
    ├── core-work ←── global-data, isobus-data, device, work-map
    ├── core-cloud ←── work, gnss, app, device-common, libcloud, libdtcloud
    └── core-app  ←── work, device, gnss, map (api)

core-isobus-data、core-map：相对独立（不依赖其他 core）
:core:unit：settings 有 include，源码目录未落地（单位能力在 core-app + common-unit）
```

## 3. Cloud 关系（简化）

```text
MainService
  └── core-cloud（CloudService 6s 调度）
        ├── SinoCloudManager ──→ cloud:libcloud（TCP）
        ├── DtCloudManager   ──→ cloud:libdtcloud（TCP）+ Farm HTTP
        ├── LuoWangCloudManager ──→ Diff LuoWangClient
        └── sino/issue/*（云端下发写库）

文件分享（独立于 6s 周期）：
component-common UI ──→ cloud:file-share ──→ cloud:sino-cloud（HTTP）
```

详见 [cloud 模块索引](../01-modules/cloud/README.md)、[上云流程](../02-features/flows/cloud-flow.md)。

## 4. Device 关系（简化）

```text
device-common（门面）
  ├── device-profile（能力模型）──→ device-radio-data
  ├── device-board（501Pro）
  ├── device-borad-ag502（AG502）
  └── device-radio-external ──→ device-radio-data
```

## 5. DB 关系（简化）

```text
业务 → DBServiceManager
         ├── Main  → db-main   （农场/田块/线/任务/边界…）
         ├── User  → db-user   （车辆/机具/电台/激活…）
         └── Track → db-track  （轨迹，可按田块分库）
契约均定义在 db-base
```

## 6. Component 与路由

各 `component-*` 通过 `*PageLoader` + AutoService 注册到 `page-route`。

| 模块 | Loader | 典型职责 |
|------|--------|----------|
| home | HomePageLoader | 主壳、作业主界面、自检 |
| work | WorkPageLoader | 农田数据管理 UI |
| device | DevicePageLoader | 车辆/机具/RTK UI |
| setting | SettingPageLoader | 系统设置与升级 |
| common | CommonPageLoader | 文件/云交换、通用容器 |
| isobus | IsobusPageLoader | VT/TC/GEO/SC UI |

## 7. 本目录未展开但常见的周边模块

| 模块群 | 说明 |
|--------|------|
| `communication-*` | 串口/通讯基础 |
| `common-*` | ViewBinding 基类、资源、工具、单位、ISOXML 等 |
| `lib*` / `opfmaps` / `libagmap` | 算法、地图、协议等封装 |
| `app` | 产品入口与部分遗留逻辑（含 `SinoCloudHostImpl` / `DtCloudHostImpl`） |

云模块已展开：[01-modules/cloud](../01-modules/cloud/README.md)。
