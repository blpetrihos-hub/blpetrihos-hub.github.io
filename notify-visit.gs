/**
 * Resume site visit mailer for blpetrihos@wm.edu
 *
 * Deploy: script.google.com -> New project -> paste this file -> Deploy -> New deployment
 * Type: Web app
 * Execute as: Me
 * Who has access: Anyone
 * Copy the web app URL into notify-visit.js as ENDPOINT.
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
    to: "blpetrihos@wm.edu",
    subject: "Resume site visit: " + city + ", " + country,
    body: body
  });

  return ContentService.createTextOutput("ok");
}
