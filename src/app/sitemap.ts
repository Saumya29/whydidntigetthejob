import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_URL || "https://whydidntigetthejob.com";

export default function sitemap(): MetadataRoute.Sitemap {
	return [
		{
			url: BASE_URL,
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 1,
		},
		{
			url: `${BASE_URL}/analyze`,
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 0.9,
		},
		{
			url: `${BASE_URL}/privacy`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.3,
		},
		{
			url: `${BASE_URL}/terms`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.3,
		},
	];
}
