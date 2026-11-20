# 界面样式表

默认文字、尺寸查 `common/common-res/src/main/res/values/{styles,dimens}.xml`，颜色追到 `theme-styles.xml`。参照列写的是布局文件名。

## 外壳与导航

| 角色 | 资源与用法 | 参照 |
|---|---|---|
| 普通页面背景 | `?attr/bg_color_2`，可由宿主提供。地图、遮罩和沉浸页按各自容器核对 | `activity_statue_bar_fragment_stack_container.xml` |
| 页面内边距 | `page_container` 四边默认 10dp；`sub_page_container` 另设宽高填满父容器。普通页面左右主内容净距为 `page_padding_horizontal`（18dp），核对时合计宿主和子布局 | `fragment_field_home_container.xml`、`fragment_material_manager.xml` |
| 信息卡片 | `drawable_card_1_with_border`，底色 `bg_color_1`。服务、用户、设备卡片靠留白分组，设置「关于」操作行可用 `divide_line`（1px） | `fragment_home_service_info.xml`、`fragment_setting_about.xml` |
| 分段导航 | `CommonTabLayout` + `SegmentedTabLayout`，轨道 `bg_color_3`，选中背景 `bg_color_1`，选中文字 `new_main_color`。导航线编辑页签沿用该样式提供的轨道、内边距和选中色。单选项查 `SegmentedTabRadioButton` 或 `style_rb_page_switch` | `fragment_field_work_line_edit.xml`、`fragment_harrow_work_line_edit.xml`、`fragment_field_home_container.xml` |
| 状态列表项、弹窗 | `drawable_bg_active_with_border` 保留选择器；`card_view_container` 用于同类 CardView 弹窗 | `rv_item_field_task_store.xml`、`dialog_field_task_edit.xml` |

## 文字与图标

| 角色 | 资源与用法 | 参照 |
|---|---|---|
| 信息卡片标题 | 服务、用户、设备和设置的同类卡片用 `text_1_label`（16sp、加粗、主文字色）。标题紧跟左侧图标，省略额外起始边距。小图标可用 `image_view_small`（20dp） | `fragment_home_service_info.xml`、`fragment_home_user_device.xml` |
| 弹窗标题 | `text_1`（16sp、主文字色），按既有弹窗标题组件复用 | `dialog_field_task_edit.xml` |
| 入口与字段 | `text_2_label` 用于入口，`text_2` 用于主要字段名，均为 14sp、次级色；普通字段值用 `text_1_content`（14sp、主色） | `fragment_home_help.xml`、`fragment_home_user_device.xml` |
| 辅助说明与正文 | `text_3`（12sp）、`text_4`（10sp）均用三级色；协议等长文用 `text_2_paragraph` | `fragment_home_help.xml`、`fragment_home_useragree.xml` |
| 强调数值 | `style_text_card_label_normal` 默认 16sp、主题色、加粗，布局可覆盖字号 | `fragment_home_simulation.xml` |
| ISOBUS | 紧凑单行卡片用 `style_text_isobus` 派生样式，如 `text_title`、`text_subtitle` | `view_feature_status_card.xml` |

## 表单与操作控件

| 角色 | 资源与用法 | 参照 |
|---|---|---|
| 主次按钮 | `CommonIconButton` 的 `main`、`normal`，常规高度 `button_size_normal`（42dp），紧凑弹窗可用小尺寸。宽度按[操作区](review-rules.md#操作区) | `fragment_home_user_info.xml`、`dialog_field_task_edit.xml` |
| 输入与选择 | 单行 `edit_text`；下拉外层可用 `Widget.MaterialComponents.TextInputLayout.OutlinedBox.ExposedDropdownMenu`；角度按格式用 `edit_text_degree` 或 `edit_text_dms` | `fragment_device_vehicle_sensor.xml`、`view_degree_input.xml` |
| 开关、步进器、列表 | `switch_button` 及同类变体、`ViewNumberStepper`；需关闭滚动条与过度滚动时用 `style_rv` | `fragment_setting_hand_panel.xml`、`fragment_harrow_field_planning.xml` |
| 状态与进度 | 保留已有徽标、状态色、进度条和地图工具控件，核对颜色与可见性变化 | `fragment_home_service_info.xml`、`item_launch_legacy_migration_progress.xml` |
