import { addonBuilder, serveHTTP } from "stremio-addon-sdk";
import axios from "axios";
import * as cheerio from "cheerio";

const builder = new addonBuilder({
  id: "org.subtitlecat.vi",
  version: "1.0.0",
  name: "SubtitleCat Vietnamese",
  description: "Phụ đề tiếng Việt từ SubtitleCat (dùng cá nhân)",
  types: ["movie", "series"],
  catalogs: [],
  resources: ["subtitles"],
  idPrefixes: ["tt"]
});

builder.defineSubtitlesHandler(async ({ id, type, season, episode }) => {
  const subtitles = [];

  try {
    const searchUrl = `https://www.subtitlecat.com/index.php?search=${id}`;
    const { data } = await axios.get(searchUrl, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const $ = cheerio.load(data);

    $("a[href*='/subtitles/']").each((_, el) => {
      const href = $(el).attr("href");
      const text = $(el).text().toLowerCase();

      if (text.includes("vietnamese") || text.includes("vi")) {
        subtitles.push({
          id: href,
          lang: "vie",
          url: "https://www.subtitlecat.com" + href
        });
      }
    });
  } catch (err) {
    console.error("SubtitleCat error:", err.message);
  }

  return { subtitles };
});

serveHTTP(builder.getInterface(), { port: process.env.PORT || 3000 });
