(function () {
  var ENDPOINT = "https://script.google.com/macros/s/AKfycbzfaCdbJtq5bkt3Vxm86KE1J-XRTKyZOk6Zsm9oygS9-4AFYklnVh3L872wLbaksyPLjw/exec";
  if (!ENDPOINT || ENDPOINT.indexOf("https://script.google.com/") !== 0) {
    return;
  }

  function ping(geo) {
    geo = geo || {};
    var conn = geo.connection || {};
    var q = new URLSearchParams({
      city: geo.city || "",
      region: geo.region || "",
      country: geo.country || "",
      ip: geo.ip || "",
      isp: conn.isp || "",
      page: location.href,
      ref: document.referrer || "",
      tz: (Intl.DateTimeFormat().resolvedOptions().timeZone) || "",
      lang: navigator.language || "",
      ua: navigator.userAgent || ""
    });
    fetch(ENDPOINT + "?" + q.toString(), { mode: "no-cors", keepalive: true }).catch(function () {});
  }

  fetch("https://ipwho.is/")
    .then(function (r) { return r.json(); })
    .then(function (geo) { ping(geo && geo.success === false ? {} : geo); })
    .catch(function () { ping({}); });
})();
