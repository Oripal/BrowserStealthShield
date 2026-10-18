const permissionText = document.getElementById('permission');
const geoOutput = document.getElementById('geo-result');
const rtcOutput = document.getElementById('rtc-result');

async function showGeolocationPermission() {
  try {
    const permission = await navigator.permissions.query({name: 'geolocation'});
    permissionText.textContent = `当前站点权限：${permission.state}`;
    permission.onchange = () => { permissionText.textContent = `当前站点权限：${permission.state}`; };
  } catch (error) {
    permissionText.textContent = `浏览器未返回状态：${error.message}`;
  }
}
showGeolocationPermission();

document.getElementById('geo-test').addEventListener('click', () => {
  geoOutput.textContent = '尝试请求中（本页面不显示坐标）…';
  if (!navigator.geolocation) {
    geoOutput.textContent = '本浏览器不支持 Geolocation API。';
    return;
  }
  navigator.geolocation.getCurrentPosition(
    () => {geoOutput.textContent = '成功：网站获得了位置权限（坐标未显示、未存储）。';},
    (err) => {geoOutput.textContent = `未获得位置：错误码 ${err.code}（${err.message}）`;},
    {timeout: 8000, maximumAge: 0, enableHighAccuracy: false}
  );
});

document.getElementById('rtc-test').addEventListener('click', async () => {
  rtcOutput.textContent = '正在收集本地候选类型…';
  if (typeof RTCPeerConnection === 'undefined') {
    rtcOutput.textContent = '浏览器不支持 RTCPeerConnection。';
    return;
  }
  let pc;
  const found = {host: 0, srflx: 0, relay: 0, other: 0};
  try {
    pc = new RTCPeerConnection({iceServers: []}); // No external STUN/TURN.
    pc.onicecandidate = (event) => {
      if (!event.candidate) return;
      // Do NOT display or store the actual candidate / IP address.
      const match = /\btyp\s+(host|srflx|relay)\b/.exec(event.candidate.candidate);
      const type = match ? match[1] : 'other';
      found[type]++;
    };
    pc.createDataChannel('local-test');
    await pc.setLocalDescription(await pc.createOffer());
    await new Promise((resolve) => {
      const timer = setTimeout(resolve, 2500);
      pc.onicegatheringstatechange = () => {
        if (pc.iceGatheringState === 'complete') {clearTimeout(timer); resolve();}
      };
    });
    rtcOutput.textContent = `候选数量：host ${found.host} / srflx ${found.srflx} / relay ${found.relay} / 其他 ${found.other}。不能据此推断公网 IP 是否泄漏。`;
  } catch (error) {
    rtcOutput.textContent = `测试失败：${error.message}`;
  } finally {
    if (pc) pc.close();
  }
});
