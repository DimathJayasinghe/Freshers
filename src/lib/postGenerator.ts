// Client-side post generator using Canvas (no external API)
// Places text on top of a template PNG, scaled to the template size.
// Default template path: /templates/post_template.png (put under public/templates/)

export type PostGenOptions = {
  templatePath?: string; // override default template location
  sportPosition?: { x: number; y: number };
  sportFontSize?: number;
  sportColor?: string;
  facultyPositions?: Array<{ x: number; y: number }>;
  facultyFontSize?: number;
  facultyColor?: string;
};

const BASE = { width: 1400, height: 1400 };
const DEFAULTS = {
  templatePath: "/templates/post_template.png",
  sportPosition: { x: 430, y: 460 },
  sportFontSize: 64,
  sportColor: "#c7c7c7ff",
  facultyPositions: [
    { x: 335, y: 640 },
    { x: 335, y: 860 },
    { x: 335, y: 1070 },
  ],
  facultyFontSize: 32,
  facultyColor: "#ebeaeaff",
};

function escapeText(s: string) {
  return String(s ?? "");
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // allow drawing if template is from same origin
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

export async function generatePostImage(
  sport: string,
  faculties: string[],
  options?: PostGenOptions
): Promise<{ success: true; imageBase64: string; width: number; height: number } | { success: false; error: string }> {
  try {
    if (!sport || !Array.isArray(faculties) || faculties.length === 0) {
      return { success: false, error: "sport (string) and faculties (array) are required" };
    }
    const cfg = { ...DEFAULTS, ...(options || {}) };

    const templateSrc = cfg.templatePath || DEFAULTS.templatePath;
    const template = await loadImage(templateSrc);
    const width = template.naturalWidth || BASE.width;
    const height = template.naturalHeight || BASE.height;

    const scaleX = width / BASE.width;
    const scaleY = height / BASE.height;
    const fontScale = Math.min(scaleX, scaleY);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return { success: false, error: "Canvas 2D context unavailable" };

    // Draw template
    ctx.drawImage(template, 0, 0, width, height);

    // Draw sport
    ctx.fillStyle = cfg.sportColor;
    ctx.font = `700 ${Math.round((cfg.sportFontSize ?? DEFAULTS.sportFontSize) * fontScale)}px Inter, Arial, sans-serif`;
    ctx.textBaseline = "alphabetic";
    ctx.fillText(
      escapeText(sport),
      Math.round((cfg.sportPosition.x ?? DEFAULTS.sportPosition.x) * scaleX),
      Math.round((cfg.sportPosition.y ?? DEFAULTS.sportPosition.y) * scaleY)
    );

    // Draw faculties (top 3)
    ctx.fillStyle = cfg.facultyColor;
    ctx.font = `700 ${Math.round((cfg.facultyFontSize ?? DEFAULTS.facultyFontSize) * fontScale)}px Inter, Arial, sans-serif`;
    const list = faculties.slice(0, cfg.facultyPositions.length);
    list.forEach((name, i) => {
      const pos = cfg.facultyPositions[i];
      ctx.fillText(escapeText(name ?? ""), Math.round(pos.x * scaleX), Math.round(pos.y * scaleY));
    });

    const imageBase64 = canvas.toDataURL("image/png");
    return { success: true, imageBase64, width, height };
  } catch (err: any) {
    const message = err?.message || String(err);
    return { success: false, error: message };
  }
}
