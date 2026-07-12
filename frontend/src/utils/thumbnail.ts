import type { ContentType } from "../types/content";

export function getDomain(url: string): string {
  if (!url) return "";
  try {
    const cleanUrl = url.startsWith("http") ? url : `https://${url}`;
    const parsed = new URL(cleanUrl);
    return parsed.hostname.replace("www.", "");
  } catch {
    return "";
  }
}

export function getFavicon(url: string): string {
  const domain = getDomain(url);
  if (!domain) return "";
  return `https://www.google.com/s2/favicons?sz=128&domain=${domain}`;
}

export function getYoutubeVideoId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export function getGithubOwnerRepo(url: string): { owner: string; repo?: string } | null {
  if (!url) return null;
  try {
    const cleanUrl = url.startsWith("http") ? url : `https://${url}`;
    const parsed = new URL(cleanUrl);
    if (!parsed.hostname.includes("github.com")) return null;
    const paths = parsed.pathname.split("/").filter(Boolean);
    if (paths.length >= 1) {
      return {
        owner: paths[0],
        repo: paths[1] || undefined,
      };
    }
  } catch {
    // ignore
  }
  return null;
}

export function getThumbnailUrl(url: string, type: ContentType): string | null {
  if (!url) return null;

  const cleanUrl = url.startsWith("http") ? url : `https://${url}`;

  if (type === "YouTube") {
    const videoId = getYoutubeVideoId(cleanUrl);
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
  }

  if (type === "GitHub") {
    const github = getGithubOwnerRepo(cleanUrl);
    if (github) {
      return `https://github.com/${github.owner}.png`;
    }
  }

  if (type === "Image" || (type === "Other" && /\.(jpeg|jpg|gif|png|webp|svg)/i.test(cleanUrl))) {
    return cleanUrl;
  }

  if (type === "Website" || type === "Article" || type === "LinkedIn" || type === "Twitter / X") {
    // thum.io provides simple website screenshots
    return `https://image.thum.io/get/width/600/crop/800/${cleanUrl}`;
  }

  return null;
}

export interface TypeStyle {
  accentColor: string;
  bgColor: string;
  borderColor: string;
  gradient: string;
  textColor: string;
  hoverBgColor: string;
}

export function getTypeStyle(type: ContentType): TypeStyle {
  switch (type) {
    case "YouTube":
      return {
        accentColor: "red-500",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        gradient: "from-red-600 to-rose-700",
        textColor: "text-red-700",
        hoverBgColor: "hover:bg-red-100",
      };
    case "GitHub":
      return {
        accentColor: "slate-950",
        bgColor: "bg-slate-50",
        borderColor: "border-slate-200",
        gradient: "from-slate-800 to-zinc-950",
        textColor: "text-slate-900",
        hoverBgColor: "hover:bg-slate-100",
      };
    case "Twitter / X":
      return {
        accentColor: "sky-500",
        bgColor: "bg-sky-50",
        borderColor: "border-sky-200",
        gradient: "from-sky-400 to-indigo-600",
        textColor: "text-sky-700",
        hoverBgColor: "hover:bg-sky-100",
      };
    case "LinkedIn":
      return {
        accentColor: "blue-700",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        gradient: "from-blue-700 to-indigo-900",
        textColor: "text-blue-800",
        hoverBgColor: "hover:bg-blue-100",
      };
    case "Website":
      return {
        accentColor: "purple-600",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200",
        gradient: "from-purple-600 to-indigo-700",
        textColor: "text-purple-700",
        hoverBgColor: "hover:bg-purple-100",
      };
    case "Article":
      return {
        accentColor: "orange-500",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
        gradient: "from-orange-500 to-amber-600",
        textColor: "text-orange-700",
        hoverBgColor: "hover:bg-orange-100",
      };
    case "PDF":
      return {
        accentColor: "rose-600",
        bgColor: "bg-rose-50",
        borderColor: "border-rose-200",
        gradient: "from-rose-600 to-red-800",
        textColor: "text-rose-700",
        hoverBgColor: "hover:bg-rose-100",
      };
    case "Image":
      return {
        accentColor: "green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        gradient: "from-green-500 to-emerald-700",
        textColor: "text-green-700",
        hoverBgColor: "hover:bg-green-100",
      };
    case "Notes":
      return {
        accentColor: "amber-500",
        bgColor: "bg-amber-50",
        borderColor: "border-amber-200",
        gradient: "from-amber-400 to-yellow-600",
        textColor: "text-amber-700",
        hoverBgColor: "hover:bg-amber-100",
      };
    case "Document":
      return {
        accentColor: "slate-500",
        bgColor: "bg-slate-50",
        borderColor: "border-slate-200",
        gradient: "from-slate-500 to-slate-700",
        textColor: "text-slate-700",
        hoverBgColor: "hover:bg-slate-100",
      };
    default:
      return {
        accentColor: "indigo-600",
        bgColor: "bg-indigo-50",
        borderColor: "border-indigo-200",
        gradient: "from-indigo-500 to-violet-700",
        textColor: "text-indigo-700",
        hoverBgColor: "hover:bg-indigo-100",
      };
  }
}
