/* BrowserStealthShield v0.1 — Browser-managed privacy settings, no injected code. */
const GEO_KEY = 'geoGuardEnabled';
const WEBRTC_KEY = 'webRtcGuardEnabled';
const TEST_URL = 'https://probe.browserstealthshield.invalid/'; // Reserved .invalid name; never fetched.
const CONTROL_LEVELS = new Set([
  'controllable_by_this_extension',
  'controlled_by_this_extension'
]);

export function siteFromUrl(input) {
  if (!input || typeof input !== 'string') return null;
  try {
    const url = new URL(input);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    return url.origin + '/';
  } catch {
    return null;
  }
}

export function mayControlWebRtc(level) {
  return CONTROL_LEVELS.has(level);
}

export async function readStatus(api, pageUrl) {
  const site = siteFromUrl(pageUrl);
  const [flags, defaultGeo, siteGeo, webRtc] = await Promise.all([
    api.storage.local.get({[GEO_KEY]: false, [WEBRTC_KEY]: false}),
    api.contentSettings.location.get({primaryUrl: TEST_URL, secondaryUrl: TEST_URL}),
    site ? api.contentSettings.location.get({primaryUrl: site, secondaryUrl: site}) : Promise.resolve(null),
    api.privacy.network.webRTCIPHandlingPolicy.get({})
  ]);
  return {
    geoRequested: flags[GEO_KEY] === true,
    webRtcRequested: flags[WEBRTC_KEY] === true,
    defaultGeo: defaultGeo.setting,
    site,
    siteGeo: siteGeo ? siteGeo.setting : null,
    webRtcValue: webRtc.value,
    webRtcLevel: webRtc.levelOfControl,
    webRtcControllable: mayControlWebRtc(webRtc.levelOfControl)
  };
}

/** Removes only the contentSettings.location rules created by this extension. */
export async function setGeolocationGuard(api, enabled) {
  if (enabled) {
    await api.contentSettings.location.set({
      primaryPattern: '<all_urls>',
      secondaryPattern: '<all_urls>',
      setting: 'block',
      scope: 'regular'
    });
  } else {
    await api.contentSettings.location.clear({scope: 'regular'});
  }
  await api.storage.local.set({[GEO_KEY]: Boolean(enabled)});
}

/** Clears this extension's override; does not force the system policy to "default". */
export async function setWebRtcGuard(api, enabled) {
  const policy = api.privacy.network.webRTCIPHandlingPolicy;
  const before = await policy.get({});
  if (!mayControlWebRtc(before.levelOfControl)) {
    throw new Error('此设置被浏览器政策或其他扩展管理，无法由本扩展更改。');
  }
  if (enabled) {
    await policy.set({value: 'disable_non_proxied_udp', scope: 'regular'});
  } else {
    await policy.clear({scope: 'regular'});
  }
  const after = await policy.get({});
  if (enabled && (after.value !== 'disable_non_proxied_udp' ||
      after.levelOfControl !== 'controlled_by_this_extension')) {
    throw new Error('浏览器没有确认 WebRTC 限制生效，请检查企业策略或其他扩展。');
  }
  await api.storage.local.set({[WEBRTC_KEY]: Boolean(enabled)});
}
