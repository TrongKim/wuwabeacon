const HIGHLIGHT_REGEX = /\d+(\.\d+)?(%| ?giây| ?sao | ?stack | ?s| times?| lần)?/gi;

export function highlightNumbersToHtml(text: string): string {
  return text.replace(HIGHLIGHT_REGEX, (match) => {
    return `<span class="text-[#60a5fa] font-medium">${match}</span>`;
  });
}

export function getYoutubeEmbedUrl(url: string): string | null {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/;
  const match = url.match(regex);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}
