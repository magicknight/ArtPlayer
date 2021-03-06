(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (factory((global['artplayer-plugin-subtitle'] = {})));
}(this, (function (exports) { 'use strict';

    function i18nMix(i18n) {
      i18n.update({
        'zh-cn': {
          'Subtitle offset time': '字幕偏移时间'
        },
        'zh-tw': {
          'Subtitle offset time': '字幕偏移時間'
        }
      });
    }

    function settingMix(art) {
      var i18n = art.i18n,
          proxy = art.events.proxy;
      return {
        title: 'Subtitle',
        name: 'subtitle',
        index: 20,
        html: "\n            <div class=\"art-setting-header\">\n                ".concat(i18n.get('Subtitle offset time'), ": <span class=\"art-subtitle-value\">0</span>s\n            </div>\n            <div class=\"art-setting-body\">\n                <input\n                    style=\"width: 100%;height: 3px;outline: none;appearance: none;-moz-appearance: none;-webkit-appearance: none;background-color: #fff;\"\n                    class=\"art-subtitle-range\"\n                    type=\"range\"\n                    min=\"-5\"\n                    max=\"5\"\n                    step=\"0.5\"\n                >\n            </div>\n        "),
        mounted: function mounted($setting) {
          var $range = $setting.querySelector('.art-subtitle-range');
          var $value = $setting.querySelector('.art-subtitle-value');
          proxy($range, 'change', function () {
            var value = $range.value;
            $value.innerText = value;
            art.plugins.artplayerPluginSubtitle.offset(Number(value));
          });
          art.on('subtitle:switch', function () {
            $range.value = 0;
            $value.innerText = 0;
          });
          art.on('artplayerPluginSubtitle:set', function (value) {
            if ($range.value !== value) {
              $range.value = value;
              $value.innerText = value;
            }
          });
        }
      };
    }

    function artplayerPluginSubtitle(art) {
      var clamp = art.constructor.utils.clamp;
      var setting = art.setting,
          notice = art.notice,
          template = art.template,
          i18n = art.i18n;
      i18nMix(i18n);
      setting.add(settingMix);
      var cuesCache = [];
      art.on('subtitle:switch', function () {
        cuesCache = [];
      });
      return {
        offset: function offset(value) {
          var cues = Array.from(template.$track.track.cues);
          var time = clamp(value, -5, 5);
          cues.forEach(function (cue, index) {
            if (!cuesCache[index]) {
              cuesCache[index] = {
                startTime: cue.startTime,
                endTime: cue.endTime
              };
            }

            cue.startTime = cuesCache[index].startTime + time;
            cue.endTime = cuesCache[index].endTime + time;
          });
          notice.show("".concat(i18n.get('Subtitle offset time'), ": ").concat(value, "s"));
          art.emit('artplayerPluginSubtitle:set', value);
        }
      };
    }

    window.artplayerPluginSubtitle = artplayerPluginSubtitle;

    exports.default = artplayerPluginSubtitle;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
