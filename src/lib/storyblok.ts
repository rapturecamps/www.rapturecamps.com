const storyblokToken = import.meta.env.PUBLIC_STORYBLOK_TOKEN;

export async function fetchStory(
  slug: string,
  params?: Record<string, string>
) {
  const searchParams = new URLSearchParams({
    token: storyblokToken || "",
    version: "draft",
    ...params,
  });

  const response = await fetch(
    `https://api.storyblok.com/v2/cdn/stories/${slug}?${searchParams.toString()}`
  );

  if (!response.ok) return null;
  const data = await response.json();
  return data.story;
}

export async function fetchStories(params?: Record<string, string>) {
  const searchParams = new URLSearchParams({
    token: storyblokToken || "",
    version: "draft",
    ...params,
  });

  const response = await fetch(
    `https://api.storyblok.com/v2/cdn/stories?${searchParams.toString()}`
  );

  if (!response.ok) return [];
  const data = await response.json();
  return data.stories || [];
}
