process.env.KCG_INCLUDE_ADMIN_SCREENSHOTS ||= "1";
process.env.KCG_ADMIN_SCREENSHOTS_ONLY ||= "1";

await import("./capture-site-screenshots.mjs");
