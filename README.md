# BrowserStealthShield v0.1 — Browser Geolocation Privacy Guard

> 轻量 Chrome 扩展：控制网页的**精确定位权限**，并可选限制 **WebRTC 非代理 UDP**。无页面脚本注入，不修改 Canvas、字体、时区、语言或浏览器指纹。

**状态：可审阅源码 + 单元测试通过；Chrome 桌面端的实际兼容性仍需在使用者环境验证。**

## 安装（无需打包或联网运行）

1. 在本仓库下载源码，在 Chrome 中打开 `chrome://extensions/`。
2. 开启开发者模式，选择 **加载已解压的扩展程序**。
3. **选中 `extension/` 文件夹**（其中包含 `manifest.json`）。
4. 点击工具栏的 BrowserStealthShield，按需启用「默认阻止定位」；WebRTC 限制为**可选项**。
5. 使用「移除本扩展规则」撤销对 Chrome 原有权限或 WebRTC 策略的覆盖。

按 Chrome 官方设计，本工具**只对安装它的那个 Chrome Profile 生效**。并不会影响其他 Profile、Firefox 或 Claude Code CLI。

## 实现了什么

| 功能 | 原生 Chrome API | 作用 | 重要限制 |
|---|---|---|---|
| 默认阻止网页 Geolocation 请求 | `chrome.contentSettings.location` | 设置 `<all_urls>` 通用规则为 `block` | 既有的特定站点权限及策略可能优先；请看当前网站的实际权限 |
| 当前网站位置规则 | `chrome.tabs.query` + `chrome.contentSettings.location.get` | 只对当前打开的 HTTP(S) 网站检查生效设置 | 不读取其他标签内容，特殊页面不适用 |
| WebRTC 隐私选项 | `chrome.privacy.network.webRTCIPHandlingPolicy` | 可选使用 `disable_non_proxied_udp` | 可能损害实时音视频；不保证公网 IP 不可见 |
| 撤销修改 | 对应 API `clear({scope:'regular'})` | 仅移除本扩展创建的覆盖，其他浏览器设置恢复接管 | 如果管理员或其他扩展有规则，最终结果由 Chrome 决定 |
| 本地诊断页 | 本机 `localhost` | 观察权限拒绝和 ICE 候选类型 | 无 STUN，因此不能验证第三方服务器看到的实际公网地址 |

权限请求：`contentSettings`、`privacy`、`storage`、`activeTab`。没有 `host_permissions`、`content_scripts`、后台常驻服务或第三方 CDN。`storage.local` 只保存**两个开关标记**，没有凭证、位置或 IP。

## 明确的安全边界

- 本扩展**不能使网站服务器无法看到正常 HTTP(S) 访问的出口 IP**；服务器可能据此推断大致地理位置。
- 不阻断经过用户已授权的其他系统级定位途径，也不能检查或控制 CLI、IDE、VPN 和其他客户端。
- 站点定位例外规则可能比通用拦截规则更具体；即使界面显示“已请求默认阻止”，也应阅读“当前网站实际权限”。
- 不用于规避服务地区限制、平台风控或身份验证，不保证「无法检测所在地」「零泄漏」或「永不封号」。
- WebRTC 设置可以影响视频会议、远程协作、P2P。出问题可在弹窗一键移除本扩展覆盖。
- 无需管理员权限，不更改 Windows 注册表、事件日志、系统 DNS 或时区。

## 本地自测

在仓库根目录运行：

```bash
python -m http.server 8765
```

然后访问 `http://localhost:8765/tests/privacy-check.html`；测试页面不会显示、存储或上传经纬度、候选 IP。**点击测试定位按钮才会实际触发浏览器的定位流程**。重新加载页面后比较开关前后的状态。测试详细要求见 [测试计划](docs/TEST_PLAN_ZH.md)。

## 开发验证

需要 Node.js 18+，无须 `npm install`：

```bash
npm test
npm run check
```

测试针对控制逻辑与 API Mock，不代表在每个 Chrome 版本上的端到端测试。Chrome API 可能被企业策略或其他扩展覆盖。

## 文件结构

```text
extension/
  manifest.json
  controller.js
  popup.html
  popup.js
  popup.css
  test-guide.html
tests/
  privacy-check.html
  privacy-check.js
  controller.test.mjs
```

## 项目资料

- [文章：Chrome 多开与账号隔离的四层真相](docs/ARTICLE_V2_ZH.md)
- [地理位置保护项目规划](docs/PROJECT_VISION_ZH.md)
- [测试方案](docs/TEST_PLAN_ZH.md)
- [历史技术主张审查](docs/CLAIM_REVIEW_ZH.md)

## 来源与许可

- [Chrome contentSettings](https://developer.chrome.com/docs/extensions/reference/api/contentSettings)
- [Chrome privacy](https://developer.chrome.com/docs/extensions/reference/api/privacy)
- [Chrome ChromeSetting](https://developer.chrome.com/docs/extensions/reference/api/types)

源码已公开供审阅；**项目目前没有指定开源许可证**，许可证和稳定版发布须由仓库维护者明确决定。
