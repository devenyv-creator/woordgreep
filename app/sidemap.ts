import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://woordgreep.nl",
      lastModified: new Date(),
    },
    {
      url: "https://woordgreep.nl/over-woordgreep",
      lastModified: new Date(),
    },
    {
      url: "https://woordgreep.nl/tips-voor-beginners",
      lastModified: new Date(),
    },
    {
      url: "https://woordgreep.nl/privacy",
      lastModified: new Date(),
    },
    {
      url: "https://woordgreep.nl/contact",
      lastModified: new Date(),
    },
    {
      url: "https://woordgreep.nl/voorwaarden",
      lastModified: new Date(),
    },
  ];
}