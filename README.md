# BrowserStealthShield

> **Browser Geolocation Privacy Guard · 浏览器地理位置隐私保护工具**  
> **目标：减少网站对位置相关信息的非预期获取与暴露。**

**状态：设计与研究阶段（2026-10-18）。尚无经过测试的可安装版本。**

## 项目定位

最初的 BrowserStealthShield 是尝试隐藏 CJK 等浏览器可观察特征的实验脚本。该方向容易把“修改检测结果”与“有效保护隐私”混为一谈，因此项目**正式收敛到网页地理位置隐私**。

**我们只做三件事：**

1. **Location Permission Guard**：检查并在用户明确授权下，使用浏览器原生机制阻止网页读取精确地理位置（Geolocation API）。
2. **WebRTC Address Privacy**：检查 WebRTC 地址暴露的相关配置；提供可选的浏览器原生隐私设置说明和回滚路径。
3. **Location Exposure Check**：通过自有测试页面帮助用户理解精确位置、WebRTC 地址和公开出口 IP 等不同信息来源与局限。

## 明确的技术边界

- **本扩展不能阻止服务器看到正常网络请求的出口 IP**，因此不能保证网站无法依据 IP 推断国家、城市或网络归属。
- 时区、语言、字体等特征可能成为弱位置线索，但**不等于精确定位**；MVP 不伪装这些信号，也不修改浏览器原生 JS 函数签名。
- 扩展无权保证 CLI、IDE、Electron 等独立进程的网络路径，也无法替代操作系统和网络配置。
- 不提供绕过服务地区限制、平台封禁、反欺诈或身份核验的保证。
- 限制 WebRTC 直连可能影响视频会议和点对点功能；需要显式授权、兼容性测试与回滚。

## MVP（只做 Chrome，后续按需要评估 Edge / Firefox）

- 显示当前浏览器的精确定位权限策略（允许、询问、阻止）。
- 可选一键阻止网页通过 Geolocation API 获取位置，提供恢复原设置的操作。
- 显示 WebRTC IP 处理策略及其说明；**默认只读**，用户主动选择后才改变设置。
- 提供自有测试页面和测试说明，不发送账号令牌、Cookie、精确位置或原始指纹数据到项目服务器。

**第一版不做：** Chrome Profile/Firefox Containers 隔离实验室、通用指纹识别或伪装、企业策略批量修改、系统/局域网扫描、后台 CLI 代理审计。

## 文档

- [项目范围与 MVP 验收标准](docs/PROJECT_VISION_ZH.md)
- [地理位置隐私测试方案](docs/TEST_PLAN_ZH.md)
- [技术长文 V2.0（浏览器隔离与风控的背景研究）](docs/ARTICLE_V2_ZH.md)
- [原稿技术主张历史核查](docs/CLAIM_REVIEW_ZH.md)

## 原始脚本说明

原始 Manifest V3 实验包含全站 `MAIN` 世界 Hook、字体、语音与 `Function.prototype.toString` 等修改。该版本**不构成当前产品方案，也未作为正式扩展发布**。历史研究素材不等于 MVP 功能承诺。

## 官方参考

- [Chrome 位置访问权限](https://support.google.com/chrome/answer/142065)
- [Chrome extensions: contentSettings.location](https://developer.chrome.com/docs/extensions/reference/api/contentSettings)
- [Chrome extensions: privacy.network.webRTCIPHandlingPolicy](https://developer.chrome.com/docs/extensions/reference/api/privacy)

## License

许可证由维护者决定；当前尚未提供正式开源许可证和稳定构建。
