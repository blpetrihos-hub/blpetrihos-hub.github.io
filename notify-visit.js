(function () {
  var ENDPOINT = "https://script.google.com/macros/s/AKfycbzfaCdbJtq5bkt3Vxm86KE1J-XRTKyZOk6Zsm9oygS9-4AFYklnVh3L872wLbaksyPLjw/exec";
  if (!ENDPOINT || ENDPOINT.indexOf("https://script.google.com/") !== 0) {
    return;
  }

  function withTimeout(promise, ms) {
    return Promise.race([
      promise,
      new Promise(function (_, reject) {
        setTimeout(function () { reject(new Error("timeout")); }, ms);
      })
    ]);
  }

  function readJson(url) {
    return withTimeout(fetch(url, { keepalive: true }).then(function (r) {
      if (!r.ok) throw new Error("http");
      return r.json();
    }), 2500);
  }

  function sources() {
    return [
      readJson("https://ipwho.is/").then(function (g) {
        if (!g || g.success === false || !g.ip) throw new Error("ipwho");
        return {
          city: g.city || "",
          region: g.region || "",
          country: g.country || "",
          ip: g.ip,
          isp: (g.connection && g.connection.isp) || ""
        };
      }),
      readJson("https://ipapi.co/json/").then(function (g) {
        if (!g || g.error || !g.ip) throw new Error("ipapi");
        return {
          city: g.city || "",
          region: g.region || "",
          country: g.country_name || g.country || "",
          ip: g.ip,
          isp: g.org || ""
        };
      }),
      readJson("https://get.geojs.io/v1/ip/geo.json").then(function (g) {
        if (!g || !g.ip) throw new Error("geojs");
        return {
          city: g.city || "",
          region: g.region || "",
          country: g.country || "",
          ip: g.ip,
          isp: g.organization_name || g.organization || ""
        };
      })
    ];
  }

  function ipOnly() {
    return readJson("https://api.ipify.org?format=json")
      .then(function (g) { return { ip: (g && g.ip) || "" }; })
      .catch(function () { return {}; });
  }

  function ping(geo) {
    geo = geo || {};
    var q = new URLSearchParams({
      city: geo.city || "",
      region: geo.region || "",
      country: geo.country || "",
      ip: geo.ip || "",
      isp: geo.isp || "",
      page: location.href,
      ref: document.referrer || "",
      tz: (Intl.DateTimeFormat().resolvedOptions().timeZone) || "",
      lang: navigator.language || "",
      ua: navigator.userAgent || ""
    });
    fetch(ENDPOINT + "?" + q.toString(), { mode: "no-cors", keepalive: true }).catch(function () {});
  }

  (typeof Promise.any === "function" ? Promise.any(sources()) : sources()[0])
    .catch(ipOnly)
    .then(ping)
    .catch(function () { ping({}); });
})();
