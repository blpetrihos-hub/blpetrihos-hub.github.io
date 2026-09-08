/**
 * Resume site visit mailer.
 *
 * Create this project while signed into a personal Gmail, not blpetrihos@wm.edu.
 * Mail goes to the Google account that owns the project.
 *
 * Deploy: script.google.com -> paste this file -> Deploy -> Manage deployments
 * -> Edit -> New version. Same web app URL stays valid.
 * Execute as: Me. Who has access: Anyone.
 */
function doGet(e) {
  var p = (e && e.parameter) ? e.parameter : {};
  var cache = CacheService.getScriptCache();
  var stamp = String(p.ip || "") + "|" + String(p.page || "");
  if (stamp !== "|" && cache.get(stamp)) {
    return ContentService.createTextOutput("ok");
  }
  if (stamp !== "|") {
    cache.put(stamp, "1", 600);
  }

  p = enrichGeo_(p);

  var city = p.city || "unknown";
  var country = p.country || "unknown";
  var referrer = p.ref || "(none / typed or bookmark)";
  var body = [
    "Someone opened the resume site.",
    "",
    "When: " + new Date().toString(),
    "City: " + city,
    "Region: " + (p.region || ""),
    "Country: " + country,
    "IP: " + (p.ip || ""),
    "Network: " + (p.isp || ""),
    "Page: " + (p.page || ""),
    "Came from: " + referrer,
    "Timezone: " + (p.tz || ""),
    "Language: " + (p.lang || ""),
    "Browser: " + (p.ua || "")
  ].join("\n");

  MailApp.sendEmail({
    to: Session.getEffectiveUser().getEmail(),
    subject: "Resume site visit: " + city + ", " + country,
    body: body
  });

  return ContentService.createTextOutput("ok");
}

function enrichGeo_(p) {
  var ip = String(p.ip || "");
  var needCity = !p.city || p.city === "unknown";
  var needCountry = !p.country || p.country === "unknown";
  if (!ip || (!needCity && !needCountry && p.region && p.isp)) {
    return p;
  }

  var g = lookupIp_(ip);
  if (!g) {
    return p;
  }
  if (needCity) p.city = g.city || p.city;
  if (!p.region) p.region = g.region || p.region;
  if (needCountry) p.country = g.country || p.country;
  if (!p.isp) p.isp = g.isp || p.isp;
  return p;
}

function lookupIp_(ip) {
  var urls = [
    "https://ipwho.is/" + encodeURIComponent(ip),
    "https://ipapi.co/" + encodeURIComponent(ip) + "/json/"
  ];
  for (var i = 0; i < urls.length; i++) {
    try {
      var resp = UrlFetchApp.fetch(urls[i], { muteHttpExceptions: true, followRedirects: true });
      if (resp.getResponseCode() !== 200) {
        continue;
      }
      var g = JSON.parse(resp.getContentText());
      if (!g || g.success === false || g.error) {
        continue;
      }
      return {
        city: g.city || "",
        region: g.region || "",
        country: g.country_name || g.country || "",
        isp: (g.connection && g.connection.isp) || g.org || ""
      };
    } catch (err) {}
  }
  return null;
}
