import test from 'node:test';
import assert from 'node:assert/strict';
import {siteFromUrl, mayControlWebRtc, readStatus, setGeolocationGuard, setWebRtcGuard} from '../extension/controller.js';

function createFakeApi(overrides = {}) {
  const state = {geoSetting: 'ask', rtcSetting: 'default', rtcLevel: 'controllable_by_this_extension', flags: {}, logs: []};
  const api = {
    storage: {local: {
      get: async (defaults) => ({...defaults, ...state.flags}),
      set: async (data) => {Object.assign(state.flags, data);}
    }},
    contentSettings: {location: {
      get: async ({primaryUrl}) => ({setting: primaryUrl.includes('allowed.test') ? 'allow' : state.geoSetting}),
      set: async (options) => {state.logs.push(['geo-set', options]); state.geoSetting = options.setting;},
      clear: async (options) => {state.logs.push(['geo-clear', options]); state.geoSetting = 'ask';}
    }},
    privacy: {network: {webRTCIPHandlingPolicy: {
      get: async () => ({value: state.rtcSetting, levelOfControl: state.rtcLevel}),
      set: async ({value, scope}) => {state.logs.push(['rtc-set', {value, scope}]); state.rtcSetting = value; state.rtcLevel = 'controlled_by_this_extension';},
      clear: async (opts) => {state.logs.push(['rtc-clear', opts]); state.rtcSetting = 'default'; state.rtcLevel = 'controllable_by_this_extension';}
    }}}
  };
  Object.assign(state, overrides);
  return {api, state};
}

test('site URL parser only accepts HTTP(S)', () => {
  assert.equal(siteFromUrl('https://example.test/a?b=1'), 'https://example.test/');
  assert.equal(siteFromUrl('http://localhost:8765/test'), 'http://localhost:8765/');
  assert.equal(siteFromUrl('chrome://settings'), null);
  assert.equal(siteFromUrl('garbage'), null);
});

test('geolocation guard sets wildcard rule and can restore', async () => {
  const {api, state} = createFakeApi();
  await setGeolocationGuard(api, true);
  assert.equal(state.geoSetting, 'block');
  assert.deepEqual(state.logs[0], ['geo-set', {primaryPattern:'<all_urls>',secondaryPattern:'<all_urls>',setting:'block',scope:'regular'}]);
  const read = await readStatus(api, 'https://allowed.test/page');
  assert.equal(read.geoRequested, true);
  assert.equal(read.siteGeo, 'allow'); // More specific site permission may override.
  await setGeolocationGuard(api, false);
  assert.equal(state.geoSetting, 'ask');
  assert.equal(state.flags.geoGuardEnabled, false);
});

test('WebRTC guard uses ChromeSetting and clears only extension override', async () => {
  const {api, state} = createFakeApi();
  await setWebRtcGuard(api, true);
  assert.equal(state.rtcSetting, 'disable_non_proxied_udp');
  assert.equal(state.flags.webRtcGuardEnabled, true);
  await setWebRtcGuard(api, false);
  assert.equal(state.rtcSetting, 'default');
  assert.deepEqual(state.logs.at(-1), ['rtc-clear', {scope:'regular'}]);
});

test('WebRTC guard refuses policies owned elsewhere', async () => {
  const {api, state} = createFakeApi({rtcLevel:'not_controllable'});
  await assert.rejects(setWebRtcGuard(api, true), /无法由本扩展更改/);
  assert.equal(state.logs.length, 0);
  assert.equal(mayControlWebRtc('controlled_by_other_extensions'), false);
});

test('WebRTC guard verifies effective value after set', async () => {
  const {api, state} = createFakeApi();
  api.privacy.network.webRTCIPHandlingPolicy.set = async () => {state.logs.push('simulated-policy-override');};
  await assert.rejects(setWebRtcGuard(api, true), /没有确认/);
  assert.equal(state.flags.webRtcGuardEnabled, undefined);
});
