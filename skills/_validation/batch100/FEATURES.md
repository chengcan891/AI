# FEATURES (~100 mined from ag6.0, read-only)

Source: `D:\WorkSpace\git\ag6.0` (**untouched**).
Mined: Fragment=175, Dialog=56, Manager=28, PageLoader=6.
**PageRoute.kt is SafeNet-locked** (shell cannot parse Path consts). Loader SafeNet flags: `{'CommonPageLoader.kt': True, 'DevicePageLoader.kt': True, 'HomePageLoader.kt': True, 'IsobusPageLoader.kt': True, 'SettingPageLoader.kt': True, 'WorkPageLoader.kt': True}`.
Selected: **100**. Types: A=23, B=32, C=24, D=14, E=7.

Heuristics: nested path/`Container`→A; top-level Fragment→B(+E risk, SafeNet); *Dialog*→C; core *Manager*→D; PageLoader/PageRoute→E.

| id | name | type | kind | module | key path | risk flags |
|---|---|---|---|---|---|---|
| F001 | DeviceFarmToolEditFragment | A | Fragment | component-device | `component/component-device/src/main/java/com/sinognss/ag/component/device/farmtools/edit/container/DeviceFarmToolEditFragment.kt` | verify-parent;nested-path |
| F002 | DeviceFarmToolControlTypeFragment | A | Fragment | component-device | `component/component-device/src/main/java/com/sinognss/ag/component/device/farmtools/edit/control/DeviceFarmToolControlTypeFragment.kt` | verify-parent;nested-path |
| F003 | DeviceFarmToolInfoFragment | A | Fragment | component-device | `component/component-device/src/main/java/com/sinognss/ag/component/device/farmtools/edit/info/DeviceFarmToolInfoFragment.kt` | verify-parent;nested-path |
| F004 | DeviceFarmToolIsobusControlEditFragment | A | Fragment | component-device | `component/component-device/src/main/java/com/sinognss/ag/component/device/farmtools/edit/isobus/container/DeviceFarmToolIsobusControlEditFragment.kt` | verify-parent;nested-path |
| F005 | DeviceFarmToolIsobusControlFragment | A | Fragment | component-device | `component/component-device/src/main/java/com/sinognss/ag/component/device/farmtools/edit/isobus/DeviceFarmToolIsobusControlFragment.kt` | verify-parent;nested-path |
| F006 | IsobusControlLatencyFragment | A | Fragment | component-device | `component/component-device/src/main/java/com/sinognss/ag/component/device/farmtools/edit/isobus/latency/IsobusControlLatencyFragment.kt` | verify-parent;nested-path |
| F007 | AppCheckSystemFragment | A | Fragment | component-home | `component/component-home/src/main/java/com/sino/component/home/check/system/AppCheckSystemFragment.kt` | verify-parent;nested-path |
| F008 | HomeInfoContainerFragment | A | Fragment | component-home | `component/component-home/src/main/java/com/sino/component/home/info/HomeInfoContainerFragment.kt` | container-parent |
| F009 | HomeWorkContainerFragment | A | Fragment | component-home | `component/component-home/src/main/java/com/sino/component/home/work/container/HomeWorkContainerFragment.kt` | container-parent |
| F010 | IsobusInfoAndSettingContainerFragment | A | Fragment | component-isobus | `component/component-isobus/src/main/java/com/sinognss/component/isobus/container/IsobusInfoAndSettingContainerFragment.kt` | container-parent |
| F011 | HomeIsoBusInfoContainerFragment | A | Fragment | component-isobus | `component/component-isobus/src/main/java/com/sinognss/component/isobus/home/HomeIsoBusInfoContainerFragment.kt` | container-parent |
| F012 | SettingAboutFirmwareFragment | A | Fragment | component-setting | `component/component-setting/src/main/java/com/sinognss/component/setting/system/about/SettingAboutFirmwareFragment.kt` | verify-parent;nested-path |
| F013 | SettingAboutFragment | A | Fragment | component-setting | `component/component-setting/src/main/java/com/sinognss/component/setting/system/about/SettingAboutFragment.kt` | verify-parent;nested-path |
| F014 | SettingSafeCenterFragment | A | Fragment | component-setting | `component/component-setting/src/main/java/com/sinognss/component/setting/system/alarm/SettingSafeCenterFragment.kt` | verify-parent;nested-path |
| F015 | SettingCameraFragment | A | Fragment | component-setting | `component/component-setting/src/main/java/com/sinognss/component/setting/system/camera/SettingCameraFragment.kt` | verify-parent;nested-path |
| F016 | SettingSystemContainerFragment | A | Fragment | component-setting | `component/component-setting/src/main/java/com/sinognss/component/setting/system/container/SettingSystemContainerFragment.kt` | container-parent |
| F017 | SettingDisplayFragment | A | Fragment | component-setting | `component/component-setting/src/main/java/com/sinognss/component/setting/system/display/SettingDisplayFragment.kt` | verify-parent;nested-path |
| F018 | FieldBlockEditFragment | A | Fragment | component-work | `component/component-work/src/main/java/com/sinognss/ag/component/work/block/edit/FieldBlockEditFragment.kt` | verify-parent;nested-path |
| F019 | FieldBlockStoreFragment | A | Fragment | component-work | `component/component-work/src/main/java/com/sinognss/ag/component/work/block/store/FieldBlockStoreFragment.kt` | verify-parent;nested-path |
| F020 | FieldBoundaryStoreFragment | A | Fragment | component-work | `component/component-work/src/main/java/com/sinognss/ag/component/work/boundary/store/FieldBoundaryStoreFragment.kt` | verify-parent;nested-path |
| F021 | FieldFarmStoreFragment | A | Fragment | component-work | `component/component-work/src/main/java/com/sinognss/ag/component/work/farm/store/FieldFarmStoreFragment.kt` | verify-parent;nested-path |
| F022 | FieldHomeContainerFragment | A | Fragment | component-work | `component/component-work/src/main/java/com/sinognss/ag/component/work/field/FieldHomeContainerFragment.kt` | container-parent |
| F023 | WorkAreaMarkerFragment | A | Fragment | component-work | `component/component-work/src/main/java/com/sinognss/ag/component/work/marker/create/impl/WorkAreaMarkerFragment.kt` | verify-parent;nested-path |
| F024 | CloudFileDownloadFragment | B | Fragment | component-common | `component/component-common/src/main/java/com/sinognss/component/common/cloud/download/CloudFileDownloadFragment.kt` | route-wire;PageRoute-safenet;safenet-maybe |
| F025 | CloudFileExportDialogFragment | B | Fragment | component-common | `component/component-common/src/main/java/com/sinognss/component/common/cloud/share/CloudFileExportDialogFragment.kt` | route-wire;PageRoute-safenet;safenet-maybe |
| F026 | CloudFileExportFragment | B | Fragment | component-common | `component/component-common/src/main/java/com/sinognss/component/common/cloud/share/CloudFileExportFragment.kt` | route-wire;PageRoute-safenet;safenet-maybe |
| F027 | CommonFileExportFragment | B | Fragment | component-common | `component/component-common/src/main/java/com/sinognss/component/common/dataexchange/exportfile/CommonFileExportFragment.kt` | route-wire;PageRoute-safenet;safenet-maybe |
| F028 | CommonFileImportFragment | B | Fragment | component-common | `component/component-common/src/main/java/com/sinognss/component/common/dataexchange/importfile/CommonFileImportFragment.kt` | route-wire;PageRoute-safenet;safenet-maybe |
| F029 | CommonFileExplorerFragment | B | Fragment | component-common | `component/component-common/src/main/java/com/sinognss/component/common/file/CommonFileExplorerFragment.kt` | route-wire;PageRoute-safenet;safenet-maybe |
| F030 | DeviceFarmToolHomeFragment | B | Fragment | component-device | `component/component-device/src/main/java/com/sinognss/ag/component/device/farmtools/home/DeviceFarmToolHomeFragment.kt` | route-wire;PageRoute-safenet;safenet-maybe |
| F031 | DeviceUTurnSettingFragment | B | Fragment | component-device | `component/component-device/src/main/java/com/sinognss/ag/component/device/farmtools/uturn/DeviceUTurnSettingFragment.kt` | route-wire;PageRoute-safenet;safenet-maybe |
| F032 | DeviceRtkPPPFragment | B | Fragment | component-device | `component/component-device/src/main/java/com/sinognss/ag/component/device/rtk/ppp/DeviceRtkPPPFragment.kt` | route-wire;PageRoute-safenet;safenet-maybe |
| F033 | SettingRtkSatelliteInfoFragment | B | Fragment | component-device | `component/component-device/src/main/java/com/sinognss/ag/component/device/rtk/satellite/info/SettingRtkSatelliteInfoFragment.kt` | route-wire;PageRoute-safenet;safenet-maybe |
| F034 | SettingRtkSatelliteIonosphereFragment | B | Fragment | component-device | `component/component-device/src/main/java/com/sinognss/ag/component/device/rtk/satellite/ionosphere/SettingRtkSatelliteIonosphereFragment.kt` | route-wire;PageRoute-safenet;safenet-maybe |
| F035 | SettingRtkSatelliteSkyViewFragment | B | Fragment | component-device | `component/component-device/src/main/java/com/sinognss/ag/component/device/rtk/satellite/skyview/SettingRtkSatelliteSkyViewFragment.kt` | route-wire;PageRoute-safenet;safenet-maybe |
| F036 | DeviceActivationFragment | B | Fragment | component-home | `component/component-home/src/main/java/com/sino/component/home/activation/DeviceActivationFragment.kt` | route-wire;PageRoute-safenet;safenet-maybe |
| F037 | BeginnerGuideDialogFragment | B | Fragment | component-home | `component/component-home/src/main/java/com/sino/component/home/beginnerguide/BeginnerGuideDialogFragment.kt` | route-wire;PageRoute-safenet;safenet-maybe |
| F038 | AppCheckFragment | B | Fragment | component-home | `component/component-home/src/main/java/com/sino/component/home/check/AppCheckFragment.kt` | route-wire;PageRoute-safenet;safenet-maybe |
| F039 | AppCheckDebugConsoleFragment | B | Fragment | component-home | `component/component-home/src/main/java/com/sino/component/home/check/debug/console/AppCheckDebugConsoleFragment.kt` | route-wire;PageRoute-safenet;safenet-maybe |
| F040 | AppCheckDeviceProfileInfoFragment | B | Fragment | component-home | `component/component-home/src/main/java/com/sino/component/home/check/debug/info/AppCheckDeviceProfileInfoFragment.kt` | route-wire;PageRoute-safenet;safenet-maybe |
| F041 | AppDeviceProfileWriteSnFragment | B | Fragment | component-home | `component/component-home/src/main/java/com/sino/component/home/check/debug/info/AppDeviceProfileWriteSnFragment.kt` | route-wire;PageRoute-safenet;safenet-maybe |
| F042 | IsobusInfoFragment | B | Fragment | component-isobus | `component/component-isobus/src/main/java/com/sinognss/component/isobus/info/IsobusInfoFragment.kt` | route-wire;PageRoute-safenet;safenet-maybe |
| F043 | IsobusFormatsAndUnitsDetailFragment | B | Fragment | component-isobus | `component/component-isobus/src/main/java/com/sinognss/component/isobus/setting/IsobusFormatsAndUnitsDetailFragment.kt` | route-wire;PageRoute-safenet;safenet-maybe |
| F044 | IsobusFormatsAndUnitsSettingFragment | B | Fragment | component-isobus | `component/component-isobus/src/main/java/com/sinognss/component/isobus/setting/IsobusFormatsAndUnitsSettingFragment.kt` | route-wire;PageRoute-safenet;safenet-maybe |
| F045 | IsobusSettingFragment | B | Fragment | component-isobus | `component/component-isobus/src/main/java/com/sinognss/component/isobus/setting/IsobusSettingFragment.kt` | route-wire;PageRoute-safenet;safenet-maybe |
| F046 | IsobusStatisticFragment | B | Fragment | component-isobus | `component/component-isobus/src/main/java/com/sinognss/component/isobus/statistic/IsobusStatisticFragment.kt` | route-wire;PageRoute-safenet;safenet-maybe |
| F047 | IsobusGeoControlFragment | B | Fragment | component-isobus | `component/component-isobus/src/main/java/com/sinognss/component/isobus/tc/IsobusGeoControlFragment.kt` | route-wire;PageRoute-safenet;safenet-maybe |
| F048 | SystemDataTransFragment | B | Fragment | component-setting | `component/component-setting/src/main/java/com/sinognss/component/setting/datatrans/SystemDataTransFragment.kt` | route-wire;PageRoute-safenet;safenet-maybe |
| F049 | LaunchLegacyMigrationProgressDialog | C | Dialog | app | `app/src/main/java/com/sinognss/ag/launch/migration/LaunchLegacyMigrationProgressDialog.kt` | custom-dialog;check-utils-first |
| F050 | LaunchLegacyMigrationPromptDialog | C | Dialog | app | `app/src/main/java/com/sinognss/ag/launch/migration/LaunchLegacyMigrationPromptDialog.kt` | custom-dialog;check-utils-first |
| F051 | LaunchLegacyMigrationResultDialog | C | Dialog | app | `app/src/main/java/com/sinognss/ag/launch/migration/LaunchLegacyMigrationResultDialog.kt` | custom-dialog;check-utils-first |
| F052 | FieldBlockDataTypeSelectDialog | C | Dialog | app | `app/src/main/java/com/sinognss/sf/fieldwork/ui/FieldBlockDataTypeSelectDialog.kt` | custom-dialog;check-utils-first |
| F053 | BaseFieldBlockCoverDialog | C | Dialog | app | `app/src/main/java/com/sinognss/sf2/fileimport/snfilemanager/dialog/BaseFieldBlockCoverDialog.kt` | custom-dialog;check-utils-first |
| F054 | FieldBlockCoverSelectDialog | C | Dialog | app | `app/src/main/java/com/sinognss/sf2/fileimport/snfilemanager/dialog/FieldBlockCoverSelectDialog.kt` | custom-dialog;check-utils-first |
| F055 | BaseFragmentDialog | C | Dialog | app | `app/src/main/java/com/sinognss/sf2/widget/dialog/BaseFragmentDialog.kt` | custom-dialog;check-utils-first |
| F056 | BaseUpanDialogFragment | C | Dialog | app | `app/src/main/java/com/sinognss/sf2/widget/dialog/BaseUpanDialogFragment.kt` | custom-dialog;check-utils-first |
| F057 | ExportShapefileDialog | C | Dialog | app | `app/src/main/java/com/sinognss/sf2/widget/dialog/ExportShapefileDialog.kt` | custom-dialog;check-utils-first |
| F058 | HarrowPointNumSettingDialog | C | Dialog | app | `app/src/main/java/com/sinognss/sf2/widget/dialog/HarrowPointNumSettingDialog.kt` | custom-dialog;check-utils-first |
| F059 | BaseVBCardDialogFragment | C | Dialog | base-component | `common/base-component/src/main/java/com/sino/common/base/component/BaseVBCardDialogFragment.kt` | dialog-base |
| F060 | BaseVBCardInputDialogFragment | C | Dialog | base-component | `common/base-component/src/main/java/com/sino/common/base/component/BaseVBCardInputDialogFragment.kt` | dialog-base |
| F061 | DialogImePaddingAvoidance | C | Dialog | base-component | `common/base-component/src/main/java/com/sino/common/base/component/DialogImePaddingAvoidance.kt` | custom-dialog;check-utils-first |
| F062 | DatePickerDialogUtil | C | Dialog | common-utils-android | `common/common-utils-android/src/main/java/com/sinognss/util/DatePickerDialogUtil.kt` | custom-dialog;check-utils-first |
| F063 | CommonDialogUtils | C | Dialog | common-view | `common/common-view/src/main/java/com/sinognss/ag/common/view/dialog/CommonDialogUtils.kt` | utils-entry |
| F064 | CommonDataLoadingDialog | C | Dialog | common-view | `common/common-view/src/main/java/com/sinognss/ag/common/view/dialog/impl/CommonDataLoadingDialog.kt` | shared-dialog |
| F065 | CommonLocalNoticeDialog | C | Dialog | common-view | `common/common-view/src/main/java/com/sinognss/ag/common/view/dialog/impl/CommonLocalNoticeDialog.kt` | shared-dialog |
| F066 | CommonNoticeDialog | C | Dialog | common-view | `common/common-view/src/main/java/com/sinognss/ag/common/view/dialog/impl/CommonNoticeDialog.kt` | shared-dialog |
| F067 | UPanManager | D | Manager | core-app | `core/core-app/src/main/java/com/sinognss/ag/core/app/file/UPanManager.kt` | need-caller |
| F068 | LanguageManager | D | Manager | core-app | `core/core-app/src/main/java/com/sinognss/ag/core/app/language/LanguageManager.kt` | need-caller |
| F069 | RegionDataManager | D | Manager | core-app | `core/core-app/src/main/java/com/sinognss/ag/core/app/region/RegionDataManager.kt` | need-caller |
| F070 | UpdateManager | D | Manager | core-app | `core/core-app/src/main/java/com/sinognss/ag/core/app/update/UpdateManager.kt` | need-caller |
| F071 | DtCloudManager | D | Manager | core-cloud | `core/core-cloud/src/main/java/com/sinognss/ag/core/cloud/dt/DtCloudManager.kt` | need-caller |
| F072 | LuoWangCloudManager | D | Manager | core-cloud | `core/core-cloud/src/main/java/com/sinognss/ag/core/cloud/luowang/LuoWangCloudManager.kt` | need-caller |
| F073 | RegisterCodeManager | D | Manager | core-cloud | `core/core-cloud/src/main/java/com/sinognss/ag/core/cloud/register/RegisterCodeManager.kt` | need-caller |
| F074 | SinoCloudManager | D | Manager | core-cloud | `core/core-cloud/src/main/java/com/sinognss/ag/core/cloud/sino/SinoCloudManager.kt` | need-caller |
| F075 | Ag501ProNmeaSerialOutputManager | D | Manager | core-device | `core/core-device/src/main/java/com/sinognss/ag/core/device/nmea/Ag501ProNmeaSerialOutputManager.kt` | need-caller |
| F076 | Ag601NmeaSerialOutputManager | D | Manager | core-device | `core/core-device/src/main/java/com/sinognss/ag/core/device/nmea/Ag601NmeaSerialOutputManager.kt` | need-caller |
| F077 | DataOutputManager | D | Manager | core-device | `core/core-device/src/main/java/com/sinognss/ag/core/device/nmea/DataOutputManager.kt` | need-caller |
| F078 | BuiltinFirmwareUpgradeManager | D | Manager | core-device | `core/core-device/src/main/java/com/sinognss/ag/core/device/update/builtin/BuiltinFirmwareUpgradeManager.kt` | need-caller |
| F079 | GyroCanUpdateManager | D | Manager | core-device | `core/core-device/src/main/java/com/sinognss/ag/core/device/update/gyro/GyroCanUpdateManager.kt` | need-caller |
| F080 | AppGlobalDataManager | D | Manager | core-global-data | `core/core-global-data/src/main/java/com/sinognss/ag/core/global/data/AppGlobalDataManager.kt` | need-caller |
| F081 | CommonPageLoader | E | PageLoader | component-common | `component/component-common/src/main/java/com/sinognss/component/common/route/CommonPageLoader.kt` | safenet-locked;ide-only;pair-with-path+fragment |
| F082 | DevicePageLoader | E | PageLoader | component-device | `component/component-device/src/main/java/com/sinognss/ag/component/device/route/DevicePageLoader.kt` | safenet-locked;ide-only;pair-with-path+fragment |
| F083 | HomePageLoader | E | PageLoader | component-home | `component/component-home/src/main/java/com/sino/component/home/route/HomePageLoader.kt` | safenet-locked;ide-only;pair-with-path+fragment |
| F084 | IsobusPageLoader | E | PageLoader | component-isobus | `component/component-isobus/src/main/java/com/sinognss/component/isobus/route/IsobusPageLoader.kt` | safenet-locked;ide-only;pair-with-path+fragment |
| F085 | SettingPageLoader | E | PageLoader | component-setting | `component/component-setting/src/main/java/com/sinognss/component/setting/route/SettingPageLoader.kt` | safenet-locked;ide-only;pair-with-path+fragment |
| F086 | WorkPageLoader | E | PageLoader | component-work | `component/component-work/src/main/java/com/sinognss/ag/component/work/route/WorkPageLoader.kt` | safenet-locked;ide-only;pair-with-path+fragment |
| F087 | PageRoute(SafeNet) | E | RouteConst | page-route | `core/page-route/src/main/java/com/sino/page/route/PageRoute.kt` | safenet-locked;ide-only;pair-with-loader |
| F088 | FieldBoundaryCreateFragment | B | Fragment | component-work | `component/component-work/src/main/java/com/sinognss/ag/component/work/boundary/create/FieldBoundaryCreateFragment.kt` | route-wire;PageRoute-safenet;safenet-maybe |
| F089 | CustomerAndFarmFragment | B | Fragment | component-work | `component/component-work/src/main/java/com/sinognss/ag/component/work/customerfarm/CustomerAndFarmFragment.kt` | route-wire;PageRoute-safenet;safenet-maybe |
| F090 | MaterialEditFragment | B | Fragment | component-work | `component/component-work/src/main/java/com/sinognss/ag/component/work/material/MaterialEditFragment.kt` | route-wire;PageRoute-safenet;safenet-maybe |
| F091 | MaterialManagerFragment | B | Fragment | component-work | `component/component-work/src/main/java/com/sinognss/ag/component/work/material/MaterialManagerFragment.kt` | route-wire;PageRoute-safenet;safenet-maybe |
| F092 | FieldSummaryFragment | B | Fragment | component-work | `component/component-work/src/main/java/com/sinognss/ag/component/work/summary/FieldSummaryFragment.kt` | route-wire;PageRoute-safenet;safenet-maybe |
| F093 | FieldTaskDetailFragment | B | Fragment | component-work | `component/component-work/src/main/java/com/sinognss/ag/component/work/task/detail/FieldTaskDetailFragment.kt` | route-wire;PageRoute-safenet;safenet-maybe |
| F094 | HomeNavigationBarClassicFragment | B | Fragment | component-common | `component/component-common/src/main/java/com/sinognss/component/common/navigation/HomeNavigationBarClassicFragment.kt` | route-wire;PageRoute-safenet;safenet-maybe |
| F095 | CommonProgressLoadingDialog | C | Dialog | common-view | `common/common-view/src/main/java/com/sinognss/ag/common/view/dialog/impl/CommonProgressLoadingDialog.kt` | shared-dialog |
| F096 | KeyboardNumberDialog | C | Dialog | common-view | `common/common-view/src/main/java/com/sinognss/ag/common/view/keyboard/KeyboardNumberDialog.kt` | shared-dialog |
| F097 | CommonPopupDialog | C | Dialog | common-view | `common/common-view/src/main/java/com/sinognss/ag/common/view/popup/CommonPopupDialog.kt` | shared-dialog |
| F098 | AgToastDialog | C | Dialog | common-view | `common/common-view/src/main/java/com/sinognss/ag/common/view/toash/AgToastDialog.kt` | shared-dialog |
| F099 | CommonFileExportFormatDialog | C | Dialog | component-common | `component/component-common/src/main/java/com/sinognss/component/common/dataexchange/exportfile/CommonFileExportFormatDialog.kt` | custom-dialog;check-utils-first |
| F100 | CommonFileImportCompleteDialog | C | Dialog | component-common | `component/component-common/src/main/java/com/sinognss/component/common/dataexchange/importfile/CommonFileImportCompleteDialog.kt` | custom-dialog;check-utils-first |
