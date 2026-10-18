# BrowserStealthShield

> **Browser Privacy & Isolation Diagnostic Toolkit**  
> **浏览器隐私与隔离诊断工具箱**

**Understand your browser. Verify your isolation.**  
看清浏览器暴露面，验证环境隔离边界。

**项目状态：Research / Design（2026-10-18）** — 当前是研究文档与实验方案；**尚无可安装的稳定版扩展，也没有完成浏览器或操作系统环境实测**。

## 为什么做这个项目？

BrowserStealthShield 最初源于一段尝试隐藏 CJK 字体等可观察特征的浏览器扩展实验代码。但进一步审查发现：**修改浏览器指纹、获得漂亮的测试分数，不等于隐私真的得到改善，更不等于账号不会被平台关联或限制**。

项目因此重新定位为**诊断优先、研究透明、最小权限**的技术工具箱。名称中的 **Shield** 指保护与诊断，**不是模拟他人设备、规避风控或“隐身”承诺**。

## 四个目标模块（规划中，尚未实现）

| 模块 | 想解决的问题 | 计划交付 |
| --- | --- | --- |
| **Isolation Lab** 隔离实验室 | 不同 Profile / Containers 究竟隔离哪些站点数据？ | 受控本地测试页、存储边界测试、可复现报告 |
| **Fingerprint Observatory** 指纹观察站 | Canvas、WebGL、音频、字体等可见特征在什么时候变化？ | 本地查看和对照差异、不伪造设备身份 |
| **Network Path Audit** 网络路径审计 | WebRTC、DNS、代理、CLI 和浏览器访问是否符合预期？ | 分客户端诊断流程；系统检查需独立本地工具 |
| **Configuration Inspector** 配置检查器 | 浏览器扩展及企业策略是否有效、有冲突或无法回滚？ | 只读核查、版本提示、可回滚建议 |

这些目标不意味着浏览器扩展能够读取任意操作系统进程的网络连接、绕过浏览器权限或获知平台风控规则。

## 设计原则

- **本地优先、最小权限：** 不默认要求 `<all_urls>` 和 `MAIN` 世界全站注入；如未来某项功能确实需要权限，必须解释原因并征得用户授权。
- **默认只读：** 诊断与配置修改分离，避免为“检测全绿”而改变系统安全功能。
- **隐私与可复现：** 默认不采集账号、Cookie、访问令牌、唯一指纹标识或未经脱敏的网络数据；实验注明版本、条件和局限。
- **兼容性与回滚：** 任何可选变更都必须经过测试、有恢复步骤，不清空安全日志。
- **诚实的边界：** 不承诺零指纹、零泄漏、零关联或零封号，不预测 Claude、Stripe 等平台未公开的风险算法。

## 仓库内容

- [九章技术长文 V2.0（修订版）](docs/ARTICLE_V2_ZH.md)
- [项目重新定位与产品规划](docs/PROJECT_VISION_ZH.md)
- [原始技术主张核查表](docs/CLAIM_REVIEW_ZH.md)
- [浏览器隔离实验计划](docs/TEST_PLAN_ZH.md)

## 原始原型为什么还不发布？

初始 Manifest V3 脚本在网页主世界覆盖原生方法、修改 DOM 样式及过滤可见语音信息等。当前代码未经跨浏览器版本、可访问性与网站兼容性验证，可能制造新的不一致或破坏网站正常功能。因此**暂不把该脚本作为安全可靠的扩展发布**。

## 研发进度

- **阶段 0（当前）：** 文档、隔离模型、源码审查与实验方案。
- **阶段 1（计划）：** 自建测试页和可复现的 Profile / Containers 存储实验。
- **阶段 2（计划）：** 可选、只读、最小权限的浏览器诊断界面。
- **阶段 3（评估中）：** 经用户主动运行的本地网络／策略检查工具及回滚说明。

详细范围与验收要求见 [PROJECT_VISION_ZH.md](docs/PROJECT_VISION_ZH.md)。

## 官方技术参考

- [Chrome Profiles](https://support.google.com/chrome/answer/2364824)
- [Firefox Containers](https://support.mozilla.org/en-US/kb/how-use-firefox-containers)
- [Chrome Extensions: Content scripts](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts)
- [MDN: FontFaceSet.check()](https://developer.mozilla.org/en-US/docs/Web/API/FontFaceSet/check)

## License

许可证由维护者后续决定；当前**尚未声明开源许可证**，也未发布稳定二进制文件。
