import {readStatus, setGeolocationGuard, setWebRtcGuard} from './controller.js';

const $ = (id) => document.getElementById(id);
const buttons = ['geo-enable', 'geo-reset', 'rtc-enable', 'rtc-reset'];
let busy = false;

function setFeedback(message, error = false) {
  const area = $('feedback');
  area.textContent = message;
  area.classList.toggle('error', error);
}

function badge(id, text, cls = '') {
  $(id).textContent = text;
  $(id).className = 'badge' + (cls ? ' ' + cls : '');
}

function geoLabel(setting) {
  return ({allow: '允许', block: '阻止', ask: '询问'})[setting] || '未知';
}

async function activePage() {
  try {
    const tabs = await chrome.tabs.query({active: true, currentWindow: true});
    return tabs[0]?.url || null;
  } catch {
    return null; // Some special tabs or managed profiles may hide their URLs.
  }
}

async function render() {
  const state = await readStatus(chrome, await activePage());

  const geoConfirmed = state.geoRequested && state.defaultGeo === 'block';
  badge('geo-badge', geoConfirmed ? '默认阻止' : state.geoRequested ? '请复核' : '原有设置', geoConfirmed ? 'on' : state.geoRequested ? 'warn' : '');
  $('geo-summary').textContent = state.geoRequested
    ? `扩展已请求默认阻止；通用规则测试值：${geoLabel(state.defaultGeo)}`
    : `扩展未启用默认阻止；浏览器规则测试值：${geoLabel(state.defaultGeo)}`;
  $('site-summary').textContent = state.site
    ? `当前网站 ${state.site}：${geoLabel(state.siteGeo)}（实际生效的 Chrome 规则）`
    : '当前标签不是普通网站，无法查看该站点的定位规则。';

  const managed = !state.webRtcControllable;
  const rtcConfirmed = state.webRtcRequested && state.webRtcValue === 'disable_non_proxied_udp' &&
    state.webRtcLevel === 'controlled_by_this_extension';
  badge('rtc-badge', managed ? '无法管理' : rtcConfirmed ? '已限制' : state.webRtcRequested ? '请复核' : '原有设置', managed || state.webRtcRequested && !rtcConfirmed ? 'warn' : rtcConfirmed ? 'on' : '');
  $('rtc-summary').textContent = `当前策略：${state.webRtcValue || '未知'}${managed ? '（由其他扩展或策略控制）' : ''}`;
  $('geo-enable').disabled = busy || state.geoRequested;
  $('geo-reset').disabled = busy || !state.geoRequested;
  $('rtc-enable').disabled = busy || managed || state.webRtcRequested;
  $('rtc-reset').disabled = busy || managed || !state.webRtcRequested;
}

async function run(action, success) {
  if (busy) return;
  busy = true;
  for (const id of buttons) $(id).disabled = true;
  setFeedback('正在应用配置…');
  try {
    await action();
    setFeedback(success);
  } catch (error) {
    setFeedback(`操作失败：${error?.message || String(error)}`, true);
  } finally {
    busy = false;
    try { await render(); }
    catch (error) {
      setFeedback(`无法重新读取浏览器设置：${error?.message || String(error)}`, true);
    }
  }
}

$('geo-enable').addEventListener('click', () => run(() => setGeolocationGuard(chrome, true), '已提交默认定位阻止，请检查当前网站实际权限。'));
$('geo-reset').addEventListener('click', () => run(() => setGeolocationGuard(chrome, false), '已清除本扩展的定位规则，浏览器原有设置接管。'));
$('rtc-enable').addEventListener('click', () => run(() => setWebRtcGuard(chrome, true), 'WebRTC 限制已提交，建议检查视频会议是否正常。'));
$('rtc-reset').addEventListener('click', () => run(() => setWebRtcGuard(chrome, false), '已撤销本扩展的 WebRTC 覆盖。'));
$('open-test').addEventListener('click', () => {
  chrome.tabs.create({url: chrome.runtime.getURL('test-guide.html')});
});

render().catch((error) => {
  setFeedback(`读取浏览器设置失败：${error?.message || String(error)}`, true);
  for (const id of buttons) $(id).disabled = true;
});
