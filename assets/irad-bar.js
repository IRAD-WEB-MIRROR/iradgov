/* The notice strip shared by the Irad state sites, e-Irad and the papers: public holidays (Holidays and
   Commemorative Days Act 1993, rev. 2008, the same rules as /holidays.html), the flag at half-mast
   (/data/flag.json), the Ala-Bel pass in heavy snow and Iradenergo's power notices (iradone.com/data/today.json).

   <script src="https://iradgov.org/assets/irad-bar.js" data-kind="gov" defer></script>

   data-kind: gov (default), eirad, bank, post, loto, univ, news. data-name: the outlet, for kind="news".
   The strip follows the page language (html lang: en, ky/ir, ru) and changes with it. */
(function () {
  "use strict";
  var me = document.currentScript || document.querySelector('script[src*="irad-bar.js"]');
  var KIND = (me && me.getAttribute("data-kind")) || "gov", NAME = (me && me.getAttribute("data-name")) || "";
  var DAY = 86400000;
  var now = new Date(Date.now() + 6 * 3600000);
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

  var bar;
  function draw() {
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
                flag: "#262626;color:#f2f2f2", pass: "#e9f1fb;color:#123b63;border-bottom:1px solid #a9c4e4", power: "#fdebd8;color:#5a2d00;border-bottom:1px solid #e8b98a" };
    bar.hidden = false;
    bar.innerHTML = ls.map(function (x) {
      return '<div style="padding:5px 12px;background:' + COL[x[0]] + '">' + (x[0] === "flag" ? "&#9632; " : "") + (x[0] === "pass" || x[0] === "power" ? x[1] : esc(x[1])) + "</div>";
    }).join("");
    [].forEach.call(bar.querySelectorAll("a"), function (a) { a.style.color = "inherit"; });
  }

  Promise.all([get("https://iradgov.org/data/flag.json"), get("https://iradone.com/data/today.json")]).then(function (r) {
    data.flag = r[0]; data.today = r[1]; draw();
  });
  if (document.body) draw(); else document.addEventListener("DOMContentLoaded", draw);
  new MutationObserver(draw).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
})();
