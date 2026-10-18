# BrowserStealthShield

> 浏览器隔离、指纹可观测性与开发环境诊断的开源研究项目。

**状态：Research Draft — 2026-10-18。无稳定版或安全保证。**

本仓库是长文《Claude 封号风波：Chrome 多开就能防关联？——浏览器指纹与账号隔离的四层真相》的研究配套资料。讨论浏览器隔离能力、检测局限、可复现实验和环境管理，并不提供绕过平台风控或身份审查的保证。

## 四层技术模型
1. 会话与存储层：Cookie、LocalStorage、IndexedDB、Cache Storage、Service Worker。
2. 浏览器与设备层：Canvas、WebGL、字体、语言、语音与浏览器 API 特征。
3. 网络与传输层：WebRTC、DNS、IPv6、出口 IP 及不同客户端的网络配置。
4. 平台账号与风控层：登录关系、账户行为、身份验证和服务政策。

## 内容索引
- [长文 V2.0：写作底稿](docs/ARTICLE_V2_ZH.md)
- [技术主张审计表](docs/CLAIM_REVIEW_ZH.md)
- [可复现实验计划](docs/TEST_PLAN_ZH.md)

## 原始扩展状态
最初提供的 Manifest V3 实验脚本包含对 `Function.prototype.toString`、字体声明、DOM 尺寸及语音列表的页面主世界修改。该实现尚未经过跨版本和兼容性验证，不在此研究版中作为可安装的正式扩展发布。

## 安全与隐私
不发布绕过网站反欺诈检测、规避封禁、清除安全日志或伪造设备身份的使用保证；不采集或提交账号令牌、Cookie 或未脱敏的指纹数据。实验应在自有环境和经许可的网站上进行。测试结论标明“观察”“推断”或“未验证”。

## 官方参考
- https://support.google.com/chrome/answer/2364824
- https://support.google.com/chrome/answer/95464
- https://support.mozilla.org/en-US/kb/how-use-firefox-containers
- https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts
- https://developer.mozilla.org/en-US/docs/Web/API/FontFaceSet/check

## License
许可证待项目维护者确认；此研究稿暂不声明开源许可证。
