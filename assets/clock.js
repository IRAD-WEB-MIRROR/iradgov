/* Irad Time clock for any website. Official time of the Irad Special Economic Zone (Standard Time Act 1993: UTC+6,
   no summer time since 1996). Free to use; please keep the link to iradgov.org.

   <script src="https://iradgov.org/assets/clock.js" data-style="badge" async></script>

   data-style: badge (88 x 31 button, the default), line (time and date in the text), dial (a clock face).
   data-lang: en, ir or ru (default: the language of the page). data-seconds="no" hides the seconds.
   data-target: the id of an element to draw into (default: just where the script tag is). */
(function () {
  "use strict";
  var me = document.currentScript;
  if (!me) return;
  var STYLE = me.getAttribute("data-style") || "badge", SEC = me.getAttribute("data-seconds") !== "no";
  var FIXED = me.getAttribute("data-lang"), LANG = 0;
  function lang() { var l = (FIXED || document.documentElement.lang || "en").slice(0, 2); LANG = l === "ru" ? 2 : (l === "ir" || l === "ky") ? 1 : 0; }
  lang();
  var URL = "https://iradgov.org/time.html", DAY = 864e5;
  var TXT = { irt: ["Irad Time", "Irad ubaktısı", "Время Ирада"], title: ["Irad Time (UTC+6), official time of the ISEZ", "Irad ubaktısı (UTC+6), Irad Atayın Ekonomikalık Zonasının rasmiy ubaktısı", "Время Ирада (UTC+6), официальное время Особой экономической зоны Ирада"] };
  var MON = [["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
             ["yanv.", "fevr.", "mart", "apr.", "may", "iyun", "iyul", "avg.", "sent.", "okt.", "noyab.", "dek."],
             ["янв.", "февр.", "марта", "апр.", "мая", "июня", "июля", "авг.", "сент.", "окт.", "нояб.", "дек."]];
  var WD = [["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], ["Jek", "Düy", "Shey", "Shar", "Bey", "Juma", "Ish"], ["вс", "пн", "вт", "ср", "чт", "пт", "сб"]];
  var HOL = { "01-01": ["New Year's Day", "Jañı jıl", "Новый год"], "03-08": ["Women's Day", "Ayaldar küni", "Женский день"], "03-11": ["Irad Day", "Irad Küni", "День Ирада"],
    "03-21": ["Nooruz", "Nooruz", "Нооруз"], "08-15": ["Day of the Lost Tribes", "Jogolgon uruktar küni", "День пропавших родов"], "08-24": ["Feast of St. Janyl", "Janıl Mayramı", "Праздник Святой Джаныл"],
    "12-25": ["Christmas Day", "Rojdestvo", "Рождество"], "12-26": ["Day after Christmas", "Rojdestvonun ekinchi küni", "Второй день Рождества"] };
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function irt() { return new Date(Date.now() + 6 * 3600000); }   /* read with getUTC* */
  function easterMonday(y) {
    var a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3),
      h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451),
      mo = Math.floor((h + l - 7 * m + 114) / 31), da = ((h + l - 7 * m + 114) % 31) + 1;
    var x = new Date(Date.UTC(y, mo - 1, da) + DAY); return pad(x.getUTCMonth() + 1) + "-" + pad(x.getUTCDate());
  }
  function holiday(t) { var md = pad(t.getUTCMonth() + 1) + "-" + pad(t.getUTCDate()); return HOL[md] ? HOL[md][LANG] : md === easterMonday(t.getUTCFullYear()) ? ["Easter Monday", "Kyamtanın ekinchi küni", "Пасхальный понедельник"][LANG] : ""; }
  function dateText(t) { return WD[LANG][t.getUTCDay()] + " " + t.getUTCDate() + " " + MON[LANG][t.getUTCMonth()] + " " + t.getUTCFullYear(); }

  var box = document.createElement("a");
  box.href = URL; box.target = "_blank"; box.rel = "noopener"; box.title = TXT.title[LANG];
  box.className = "irad-clock irad-clock-" + STYLE;
  var css = {
    badge: "display:inline-block;width:88px;height:31px;box-sizing:border-box;background:#7a0000;border:1px solid #3d0000;color:#fff;text-decoration:none;font:bold 9px/1 Verdana,Tahoma,sans-serif;text-align:center;padding:3px 2px 0;vertical-align:middle;overflow:hidden;position:relative;",
    line: "color:inherit;text-decoration:none;font:inherit;white-space:nowrap;",
    dial: "display:inline-block;width:120px;text-align:center;color:inherit;text-decoration:none;font:11px/1.3 Verdana,Tahoma,sans-serif;"
  };
  box.setAttribute("style", css[STYLE] || css.badge);
  var target = me.getAttribute("data-target") && document.getElementById(me.getAttribute("data-target"));
  if (target) target.appendChild(box); else me.parentNode.insertBefore(box, me.nextSibling);

  function dial(t) {
    var h = t.getUTCHours() % 12, m = t.getUTCMinutes(), s = t.getUTCSeconds();
    var hand = function (deg, len, w, col) { var r = (deg - 90) * Math.PI / 180; return '<line x1="50" y1="50" x2="' + (50 + Math.cos(r) * len).toFixed(1) + '" y2="' + (50 + Math.sin(r) * len).toFixed(1) + '" stroke="' + col + '" stroke-width="' + w + '" stroke-linecap="round"/>'; };
    var ticks = ""; for (var i = 0; i < 12; i++) { var r = i * 30 * Math.PI / 180; ticks += '<line x1="' + (50 + Math.sin(r) * 40).toFixed(1) + '" y1="' + (50 - Math.cos(r) * 40).toFixed(1) + '" x2="' + (50 + Math.sin(r) * (i % 3 ? 44 : 46)).toFixed(1) + '" y2="' + (50 - Math.cos(r) * (i % 3 ? 44 : 46)).toFixed(1) + '" stroke="#333" stroke-width="' + (i % 3 ? 1.2 : 2.4) + '"/>'; }
    return '<svg viewBox="0 0 100 100" width="110" height="110" aria-hidden="true"><circle cx="50" cy="50" r="48" fill="#f6f0e0" stroke="#7a0000" stroke-width="3"/>' + ticks +
      '<text x="50" y="34" text-anchor="middle" font-size="7" font-family="Verdana,sans-serif" fill="#7a0000" font-weight="bold">IRT</text>' +
      hand(h * 30 + m / 2, 24, 3.6, "#222") + hand(m * 6 + s / 10, 35, 2.4, "#222") + (SEC ? hand(s * 6, 38, 1, "#aa0000") : "") + '<circle cx="50" cy="50" r="2.6" fill="#7a0000"/></svg>';
  }
  function draw() {
    lang(); box.title = TXT.title[LANG];
    var t = irt(), hm = pad(t.getUTCHours()) + ":" + pad(t.getUTCMinutes()), hs = hm + (SEC ? ":" + pad(t.getUTCSeconds()) : ""), hol = holiday(t);
    if (STYLE === "line") box.textContent = hs + " " + TXT.irt[LANG] + ", " + dateText(t) + (hol ? " · " + hol : "");
    else if (STYLE === "dial") box.innerHTML = dial(t) + "<br><b>" + TXT.irt[LANG] + "</b><br>" + dateText(t) + (hol ? '<br><span style="color:#7a0000">' + hol + "</span>" : "");
    else box.innerHTML = '<span style="display:block;font:bold 13px/1 \'Courier New\',monospace;color:#ffd84a;letter-spacing:1px">' + hs + "</span>" +
      '<span style="display:block;margin-top:2px;font-size:8px;letter-spacing:.3px">' + (hol ? hol.toUpperCase().slice(0, 16) : TXT.irt[LANG].toUpperCase() + " UTC+6") + "</span>";
  }
  draw();
  setInterval(draw, SEC ? 1000 : 15000);
})();
