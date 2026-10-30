/* The notice strip shared by the Irad state sites, e-Irad and the papers: public holidays (Holidays and
   Commemorative Days Act 1993, rev. 2008, the same rules as /holidays.html), office hours (closed at night, at
   weekends and over lunch, one hour early on the eve of a holiday), the flag at half-mast (/data/flag.json), the
   Ala-Bel pass in heavy snow and Iradenergo's power notices (iradone.com/data/today.json).

   <script src="https://iradgov.org/assets/irad-bar.js" data-kind="gov" defer></script>

   data-kind: gov (default), eirad, bank, post, loto, univ, news. data-name: the outlet, for kind="news".
   Office hours come with the kind (gov, eirad, bank, post); any other site can set its own with
   data-hours="1-5 09:00-18:00 13:00-14:00; 6 10:00-15:00" (weekdays 0 = Sunday, opening, closing, optional lunch)
   and data-place / data-place-ir / data-place-ru (who is closed: "Talasbank branches").
   The "closed" line is a thin strip above the page, never over it, and the reader can dismiss it.
   The strip follows the page language (html lang: en, ky/ir, ru) and changes with it.
   window.IradClock gives other scripts the same clock: now(), today(), holiday(iso), off(date), nextWorking(date),
   hours(spec). */
(function () {
  "use strict";
  var me = document.currentScript || document.querySelector('script[src*="irad-bar.js"]');
  var KIND = (me && me.getAttribute("data-kind")) || "gov", NAME = (me && me.getAttribute("data-name")) || "";
  var DAY = 86400000;
  var now = new Date(Date.now() + 6 * 3600000);   // a Date whose UTC fields read as Irad Time (UTC+6)
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function iso(d) { return d.getUTCFullYear() + "-" + pad(d.getUTCMonth() + 1) + "-" + pad(d.getUTCDate()); }
  var TODAY = iso(now);

  var HOL = {
    newyear: ["New Year's Day", "Jañı jıl", "Новый год"], women: ["International Women's Day", "Ayaldardın el aralık küni", "Международный женский день"],
    iradday: ["Irad Day", "Irad Küni", "День Ирада"], nooruz: ["Nooruz", "Nooruz", "Нооруз"], easter: ["Easter Monday", "Kyamtanın ekinchi küni", "Пасхальный понедельник"],
    losttribes: ["Remembrance Day of the Lost Tribes", "Jogolgon uruktardı eskerüü küni", "День памяти пропавших родов"], janyl: ["Feast of St. Janyl", "Janıl Mayramı", "Праздник Святой Джаныл"],
    christmas: ["Christmas Day", "Rojdestvo", "Рождество"], boxing: ["Day after Christmas", "Rojdestvonun ekinchi küni", "Второй день Рождества"]
  };
  var MON = [["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
             ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentyabr", "oktyabr", "noyabr", "dekabr"],
             ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"]];
  var WD = [["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            ["jekshembi", "düyshömbü", "sheyshembi", "sharshembi", "beyshembi", "juma", "ishembi"],
            ["воскресенье", "понедельник", "вторник", "среду", "четверг", "пятницу", "субботу"]];

  function easter(y) {
    var a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3),
      h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451),
      mo = Math.floor((h + l - 7 * m + 114) / 31), da = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(Date.UTC(y, mo - 1, da));
  }
  // date -> holiday key, with weekend holidays moved to the next free working day
  function holidays(y) {
    var em = new Date(easter(y).getTime() + DAY), out = {}, taken = {};
    var list = [["01-01", "newyear"], ["03-08", "women"], ["03-11", "iradday"], ["03-21", "nooruz"], [iso(em).slice(5), "easter"], ["08-15", "losttribes"], ["08-24", "janyl"], ["12-25", "christmas"], ["12-26", "boxing"]];
    list.forEach(function (h) { taken[y + "-" + h[0]] = true; });
    list.forEach(function (h) {
      var d = new Date(y + "-" + h[0] + "T00:00:00Z");
      if (d.getUTCDay() === 0 || d.getUTCDay() === 6) {
        do { d = new Date(d.getTime() + DAY); } while (d.getUTCDay() === 0 || d.getUTCDay() === 6 || (taken[iso(d)] && iso(d) !== y + "-" + h[0]));
        taken[iso(d)] = true;
        out[iso(d)] = { key: h[1], observed: true };
      } else out[iso(d)] = { key: h[1] };
    });
    return out;
  }
  var y = now.getUTCFullYear(), H = holidays(y), H2 = holidays(y + 1);
  for (var k in H2) H[k] = H2[k];
  function off(d) { return d.getUTCDay() === 0 || d.getUTCDay() === 6 || !!H[iso(d)]; }
  function nextWorking(d) { do { d = new Date(d.getTime() + DAY); } while (off(d)); return d; }

  // office hours: "1-5 09:00-18:00 13:00-14:00; 6 09:00-16:00" -> per weekday [open, close, lunch from, lunch to] in minutes
  var HOURS = { gov: "1-5 09:00-18:00 13:00-14:00", eirad: "1-5 09:00-18:00 13:00-14:00", bank: "1-5 09:00-17:00 13:00-14:00",
                post: "1-5 08:00-19:00; 6 09:00-16:00; 0 10:00-14:00" };
  function hm(t) { var p = t.split(":"); return +p[0] * 60 + +p[1]; }
  function parseHours(spec) {
    var w = [];
    String(spec || "").split(";").forEach(function (part) {
      var f = part.trim().split(/\s+/); if (f.length < 2) return;
      var dd = f[0].split("-"), a = +dd[0], b = dd.length > 1 ? +dd[1] : a, oc = f[1].split("-"), lu = f[2] ? f[2].split("-") : null;
      for (var i = a; i <= b; i++) w[i] = [hm(oc[0]), hm(oc[1])].concat(lu ? [hm(lu[0]), hm(lu[1])] : []);
    });
    return w;
  }
  // the hours on a given Irad date: none on a public holiday, one hour shorter on the eve of one
  function dayHours(W, d) {
    var x = W[d.getUTCDay()]; if (!x || H[iso(d)]) return null;
    x = x.slice();
    if (H[iso(new Date(d.getTime() + DAY))] && !off(d)) x[1] -= 60;
    return x;
  }
  // where an office stands at Irad time t: open, lunch (until), closed (opens next at)
  function standing(W, t) {
    var m = t.getUTCHours() * 60 + t.getUTCMinutes(), day = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate())), x = dayHours(W, day);
    if (x && m >= x[0] && m < x[1]) {
      if (x.length > 2 && m >= x[2] && m < x[3]) return { state: "lunch", at: x[3], day: day };
      return { state: "open", until: x[1], day: day };
    }
    if (x && m < x[0]) return { state: "closed", at: x[0], day: day };
    for (var i = 1; i < 15; i++) {
      var d = new Date(day.getTime() + i * DAY), y2 = dayHours(W, d);
      if (y2) return { state: "closed", at: y2[0], day: d };
    }
    return { state: "closed" };
  }

  function li() {
    var l = (document.documentElement.lang || "en").toLowerCase();
    return l.indexOf("ru") === 0 ? 2 : (l.indexOf("ky") === 0 || l.indexOf("ir") === 0) ? 1 : 0;
  }
  function when(d, L) {
    return L === 0 ? WD[0][d.getUTCDay()] + " " + d.getUTCDate() + " " + MON[0][d.getUTCMonth()]
      : L === 1 ? d.getUTCDate() + "-" + MON[1][d.getUTCMonth()] + ", " + WD[1][d.getUTCDay()]
      : WD[2][d.getUTCDay()] + ", " + d.getUTCDate() + " " + MON[2][d.getUTCMonth()];
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function tri(o, L) { return o ? (o[["en", "ir", "ru"][L]] || o.en || "") : ""; }

  var MSG = {
    gov: ["Public holiday: {h}. Government offices are closed today. Applications received today are registered on {n}.",
          "Mayram kün: {h}. Mamlekettik mekemeler bügün ishtebeyt. Bügün kelgen arızdar {n} kattalat.",
          "Праздничный день: {h}. Государственные учреждения сегодня закрыты. Поступившие сегодня заявления регистрируются {n}."],
    eirad: ["Public holiday: {h}. You can apply online as usual; applications are registered on {n}.",
            "Mayram kün: {h}. Onlayn arız beruuge bolot; arızdar {n} kattalat.",
            "Праздничный день: {h}. Заявления онлайн принимаются как обычно и регистрируются {n}."],
    bank: ["Bank holiday: {h}. Payments are not settled today; transfers are processed on {n}.",
           "Bank mayramı: {h}. Bügün tölömdör jürgüzülböyt; kotoruular {n} ishtelet.",
           "Банковский выходной: {h}. Платежи сегодня не проводятся; переводы будут исполнены {n}."],
    post: ["Public holiday: {h}. Post offices are closed and there is no delivery. Service resumes on {n}.",
           "Mayram kün: {h}. Pochta bölümdörü jabık, jetkiruu jok. Ish {n} kalıbına kelet.",
           "Праздничный день: {h}. Почтовые отделения закрыты, доставки нет. Работа возобновится {n}."],
    loto: ["Public holiday: {h}. The IradLoto office is closed today; draws are held as usual.",
           "Mayram kün: {h}. IradLotonun keñsesi bügün jabık; tirajdar kadimkidey ötöt.",
           "Праздничный день: {h}. Офис ИрадЛото сегодня закрыт; тиражи проводятся как обычно."],
    univ: ["Public holiday: {h}. The university and the National Library are closed. Classes resume on {n}.",
           "Mayram kün: {h}. Universitet jana Uluttuk kitepkana jabık. Sabaktar {n} kayra bashtalat.",
           "Праздничный день: {h}. Университет и Национальная библиотека закрыты. Занятия возобновятся {n}."],
    news: ["{o} wishes its readers a happy {h}.", "{o} okurmandarın {h} menen kuttuktayt.", "{o} поздравляет читателей: {h}."]
  };
  var EVE = ["Tomorrow, {d}, is a public holiday ({h}). Offices close one hour early today.",
             "Erteñ, {d}, mayram kün ({h}). Bügün mekemeler bir saat erte jabılat.",
             "Завтра, {d}, праздничный день ({h}). Сегодня учреждения закрываются на час раньше."];
  // closed: {t} the time in Talas, {w} the day it opens again, {o} the opening time, {hrs} the hours, {p} the place
  var SHUT = {
    gov: ["Government offices are closed now; it is {t} in Talas. They open again {w} at {o} (office hours: {hrs}, Irad Time).",
          "Mamlekettik mekemeler azır jabık; Talasta saat {t}. Alar {w} saat {o} achılat (ish ubaktısı: {hrs}, Irad ubaktısı).",
          "Государственные учреждения сейчас закрыты; в Таласе {t}. Они откроются {w} в {o} (часы приёма: {hrs}, по ирадскому времени)."],
    eirad: ["It is {t} in Talas and government offices are closed. You can still apply online; applications sent now are registered {w} at {o}.",
            "Talasta saat {t}, mamlekettik mekemeler jabık. Onlayn arız beruuge bolot; azır jiberilgen arızdar {w} saat {o} kattalat.",
            "В Таласе {t}, государственные учреждения закрыты. Заявление можно подать онлайн; поданные сейчас заявления регистрируются {w} в {o}."],
    bank: ["The Bank of Irad is closed now; it is {t} in Talas. Payment orders received now are processed {w} from {o} (hours: {hrs}, Irad Time).",
           "Irad Bankı azır jabık; Talasta saat {t}. Azır kelgen tölöm tapshırmaları {w} saat {o} ishtelet (ish ubaktısı: {hrs}, Irad ubaktısı).",
           "Банк Ирада сейчас закрыт; в Таласе {t}. Поступившие сейчас платёжные поручения будут исполнены {w} с {o} (часы работы: {hrs}, по ирадскому времени)."],
    post: ["The Talas Central Post Office is closed now; it is {t} in Talas. It opens again {w} at {o} (hours: {hrs}).",
           "Talastın Borborduk pochtası azır jabık; Talasta saat {t}. Al {w} saat {o} achılat (ish ubaktısı: {hrs}).",
           "Центральный почтамт Таласа сейчас закрыт; в Таласе {t}. Он откроется {w} в {o} (часы работы: {hrs})."],
    any: ["{p}: closed now; it is {t} in Talas. Open again {w} at {o} (hours: {hrs}, Irad Time).",
          "{p}: azır jabık; Talasta saat {t}. {w} saat {o} achılat (ish ubaktısı: {hrs}, Irad ubaktısı).",
          "{p}: сейчас закрыто; в Таласе {t}. Откроется {w} в {o} (часы работы: {hrs}, по ирадскому времени)."]
  };
  var LUNCH = {
    gov: ["Government offices are closed for lunch until {o}; it is {t} in Talas.", "Mamlekettik mekemelerde tüshkü tınıguu, saat {o} cheyin; Talasta saat {t}.", "В государственных учреждениях обеденный перерыв до {o}; в Таласе {t}."],
    any: ["{p}: lunch break until {o}; it is {t} in Talas.", "{p}: tüshkü tınıguu, saat {o} cheyin; Talasta saat {t}.", "{p}: обеденный перерыв до {o}; в Таласе {t}."]
  };
  var DAYW = [["today", "tomorrow"], ["bügün", "erteñ"], ["сегодня", "завтра"]];
  var SHORT = [["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], ["jek", "düy", "shey", "shar", "bey", "jum", "ish"], ["вс", "пн", "вт", "ср", "чт", "пт", "сб"]];
  var LUN = [", lunch ", ", tüshkü tınıguu ", ", обед "];
  function clock(m) { return Math.floor(m / 60) + ":" + pad(m % 60); }
  function hoursText(W, L) {   // "Mon–Fri 9:00–18:00, lunch 13:00–14:00; Sat 9:00–16:00"
    var out = [], order = [1, 2, 3, 4, 5, 6, 0], i = 0;
    while (i < 7) {
      var d = order[i], x = W[d], j = i;
      if (!x) { i++; continue; }
      while (j + 1 < 7 && W[order[j + 1]] && W[order[j + 1]].join() === x.join()) j++;
      out.push(SHORT[L][d] + (j > i ? "–" + SHORT[L][order[j]] : "") + " " + clock(x[0]) + "–" + clock(x[1]) + (x.length > 2 ? LUN[L] + clock(x[2]) + "–" + clock(x[3]) : ""));
      i = j + 1;
    }
    return out.join("; ");
  }
  function whenOpen(d, L) {
    var n = Math.round((d.getTime() - Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())) / DAY);
    if (n === 0 || n === 1) return DAYW[L][n];
    return L === 0 ? "on " + when(d, 0) : L === 2 ? "в " + when(d, 2) : when(d, 1);
  }
  var SPEC = (me && me.getAttribute("data-hours")) || HOURS[KIND] || "", WH = parseHours(SPEC);
  function place(L) { return (me && (me.getAttribute(["data-place", "data-place-ir", "data-place-ru"][L]) || me.getAttribute("data-place"))) || NAME || ""; }
  var OBS = [" (observed)", " (köchürülgön dem alısh)", " (перенесённый выходной)"];
  var FLAG = ["The national flag is at half-mast today: {r}.", "Bügün mamlekettik tuu jarım machtada: {r}.", "Сегодня государственный флаг приспущен: {r}."];
  var PASS = ["State Route 1: heavy snow at the Ala-Bel pass today; the road may be closed. Check the <a href=\"https://jandarm.iradgov.org/roads.html\">Gendarmerie road board</a> before travelling.",
              "1-mamlekettik jol: bügün Ala-Bel ashuusunda kalıñ kar; jol jabılıshı mümkün. Jolgo chıgardan murun <a href=\"https://jandarm.iradgov.org/roads.html\">Jandarmeriyanın jol taktasın</a> karañız.",
              "Трасса № 1: сегодня сильный снег на перевале Ала-Бель; дорога может быть закрыта. Перед поездкой проверьте <a href=\"https://jandarm.iradgov.org/roads.html\">дорожное табло жандармерии</a>."];

  var data = { flag: null, today: null };
  function get(u) { return fetch(u).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }); }

  function lines(L) {
    var out = [], h = H[TODAY], tom = new Date(now.getTime() + DAY), ht = H[iso(tom)];
    if (h) {
      var name = HOL[h.key][L] + (h.observed ? OBS[L] : "");
      var m = (MSG[KIND] || MSG.gov)[L];
      out.push(["hol", m.replace("{h}", name).replace("{n}", when(nextWorking(now), L)).replace("{o}", NAME || "")]);
    } else if (ht && !off(now) && /^(gov|eirad|bank|post)$/.test(KIND)) {
      out.push(["eve", EVE[L].replace("{d}", when(tom, L)).replace("{h}", HOL[ht.key][L])]);
    }
    if (!h && WH.length && !dismissed()) {
      var st = standing(WH, now), mm = now.getUTCHours() * 60 + now.getUTCMinutes(), own = me && me.getAttribute("data-hours");
      var tpl = st.state === "lunch" ? (own ? LUNCH.any : LUNCH[KIND] || LUNCH.gov) : st.state === "closed" && st.day ? (own ? SHUT.any : SHUT[KIND] || SHUT.any) : null;
      if (tpl) out.push(["shut", tpl[L].replace("{t}", clock(mm)).replace("{o}", clock(st.at)).replace("{w}", st.day ? whenOpen(st.day, L) : "")
        .replace("{hrs}", hoursText(WH, L)).replace("{p}", place(L))]);
    }
    var f = data.flag;
    if (f && KIND !== "loto") {
      var reason = null;
      (f.standing || []).forEach(function (s) { if (s.md === TODAY.slice(5)) reason = tri(s.name, L); });
      (f.orders || []).forEach(function (o) { if (o.from <= TODAY && TODAY <= o.to) reason = tri(o.reason, L); });
      if (reason) out.push(["flag", FLAG[L].replace("{r}", reason)]);
    }
    var t = data.today;
    if (t && t.date === TODAY) {
      var talas = (t.weather && t.weather.places || []).filter(function (p) { return p.id === "talas"; })[0];
      if (talas) {   // the same rule as the Gendarmerie's mountain table, at the Ala-Bel summit (3,184 m)
        var k2 = (3184 - 1270) * 0.0065, hi = talas.high - k2, wet = (talas.code || 0) >= 51 || (talas.precip_mm || 0) > 0;
        if (wet && hi <= 1 && ((talas.precip_mm || 0) >= 10 || (talas.code || 0) >= 73)) out.push(["pass", PASS[L]]);
      }
      var sup = t.power && t.power.supply;
      if (sup && sup.en && !/^Normal supply/i.test(sup.en)) out.push(["power", esc(["Iradenergo", "Iradenergo", "Ирадэнерго"][L] + ": ") + esc(tri(sup, L))]);
    }
    return out;
  }

  // the reader can put the "closed" line away for the rest of the visit
  function dismissed() { try { return sessionStorage.getItem("irad-bar-shut") === TODAY; } catch (e) { return false; } }

  var bar;
  function draw() {
    now = new Date(Date.now() + 6 * 3600000); TODAY = iso(now);
    var L = li(), ls = lines(L);
    if (!ls.length) { if (bar) bar.hidden = true; return; }
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "irad-bar";
      bar.setAttribute("role", "note");
      bar.style.cssText = "font:13px/1.45 Arial,Helvetica,sans-serif;text-align:center;position:relative;z-index:50";
      document.body.insertBefore(bar, document.body.firstChild);
    }
    var COL = { hol: "#fff3c4;color:#4a3800;border-bottom:1px solid #e0c96a", eve: "#fff8de;color:#4a3800;border-bottom:1px solid #eadb9c",
                flag: "#262626;color:#f2f2f2", shut: "#f1f1ee;color:#3a3a3a;border-bottom:1px solid #d6d6d0", pass: "#e9f1fb;color:#123b63;border-bottom:1px solid #a9c4e4", power: "#fdebd8;color:#5a2d00;border-bottom:1px solid #e8b98a" };
    bar.hidden = false;
    bar.innerHTML = ls.map(function (x) {
      return '<div style="padding:5px 12px;background:' + COL[x[0]] + (x[0] === "shut" ? ";font-size:12px;padding-right:34px;position:relative" : "") + '">' + (x[0] === "flag" ? "&#9632; " : "") +
        (x[0] === "pass" || x[0] === "power" ? x[1] : esc(x[1])) +
        (x[0] === "shut" ? '<button type="button" data-shut aria-label="' + ["Hide", "Jashır", "Скрыть"][L] + '" title="' + ["Hide", "Jashır", "Скрыть"][L] +
          '" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);border:0;background:none;color:inherit;font:16px/1 Arial,sans-serif;cursor:pointer;padding:2px 4px">&times;</button>' : "") + "</div>";
    }).join("");
    var x = bar.querySelector("[data-shut]");
    if (x) x.onclick = function () { try { sessionStorage.setItem("irad-bar-shut", TODAY); } catch (e) {} draw(); };
    [].forEach.call(bar.querySelectorAll("a"), function (a) { a.style.color = "inherit"; });
  }

  Promise.all([get("https://iradgov.org/data/flag.json"), get("https://iradone.com/data/today.json")]).then(function (r) {
    data.flag = r[0]; data.today = r[1]; draw();
  });
  if (document.body) draw(); else document.addEventListener("DOMContentLoaded", draw);
  setInterval(draw, 60000);   // the clock moves on: offices open and close while the page is open

  window.IradClock = {
    now: function () { return new Date(Date.now() + 6 * 3600000); },
    today: function () { return iso(new Date(Date.now() + 6 * 3600000)); },
    holiday: function (d) { var x = H[d]; return x ? { key: x.key, observed: !!x.observed, name: HOL[x.key] } : null; },
    off: off, nextWorking: nextWorking,
    hours: function (spec, t) { return standing(parseHours(spec), t || new Date(Date.now() + 6 * 3600000)); }
  };
  new MutationObserver(draw).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
})();
