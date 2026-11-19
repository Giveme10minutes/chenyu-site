import { readFile, readdir, realpath, stat } from "node:fs/promises";
import { extname, join, relative, sep } from "node:path";
import MarkdownIt from "markdown-it";
import { parse } from "yaml";

export const categories = [
  { id: "life", title: "生活记录", tone: "sand" },
  { id: "projects", title: "做过的项目", tone: "blue" },
];

const markdown = new MarkdownIt({ html: false });
const tones = new Set(["sand", "green", "rust", "blue"]);
const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"]);
const coverStyles = new Set(["photo", "illustrated", "type"]);
const fields = new Set(["title", "spine", "date", "summary", "cover", "coverStyle", "jacket", "tone", "mark", "featured"]);

function decodeMediaPath(src, extensions = imageExtensions) {
  const path = decodeURIComponent(src);
  const segments = path.replace(/^\.\//, "").split("/");
  if (path.includes("\\") || segments.some(segment => !segment || segment === "." || segment === "..")
    || !extensions.has(extname(path).toLowerCase())) {
    throw new Error(`媒体文件路径无效或格式不受支持 · ${src}`);
  }
  return segments;
}

async function readArticle(root, category, slug) {
  const folder = join(root, category.id, slug);
  try {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error("文件夹名请使用小写英文字母、数字和连字符");
    const articlePath = join(folder, "index.md");
    if (!(await realpath(articlePath)).startsWith((await realpath(folder)) + sep)) throw new Error("正文需放在文章文件夹内");
    const source = await readFile(articlePath, "utf8");
    const frontMatter = source.match(/^\uFEFF?---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/);
    if (!frontMatter) throw new Error("缺少由 --- 包起来的文章信息");
    const data = parse(frontMatter[1]);
    if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("文章信息格式不正确");
    for (const [field, value] of Object.entries(data)) {
      if (!fields.has(field)) throw new Error(`不认识字段 ${field}`);
      if (field === "featured" ? typeof value !== "boolean" : typeof value !== "string" || !value.trim()) {
        throw new Error(`检查字段 ${field} 的值`);
      }
    }
    if (!data.title) throw new Error("缺少 title");
    if (data.date) {
      const date = new Date(data.date);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date) || Number.isNaN(date.getTime())
        || date.toISOString().slice(0, 10) !== data.date) throw new Error("date 请填写有效的 YYYY-MM-DD 日期");
    }
    if (data.tone && !tones.has(data.tone)) throw new Error("tone 可选 sand、green、rust、blue");
    if (data.coverStyle && !coverStyles.has(data.coverStyle)) {
      throw new Error("coverStyle 可选 photo、illustrated、type");
    }
    const coverStyle = data.coverStyle ?? (data.cover ? "illustrated" : "type");
    if (coverStyle !== "type" && !data.cover && !data.jacket) {
      throw new Error("照片或图文封面需要填写 cover 或 jacket");
    }
    const body = source.slice(frontMatter[0].length).trim();
    if (!body) throw new Error("缺少 Markdown 正文");

    const images = new Map();
    async function registerImage(src, extensions = imageExtensions) {
      const segments = decodeMediaPath(src, extensions);
      const path = join(...segments);
      if (!images.has(path)) {
        const realFolder = await realpath(folder);
        const realImage = await realpath(join(folder, path)).catch(() => null);
        if (!realImage || !realImage.startsWith(realFolder + sep) || !(await stat(realImage)).isFile()) {
          throw new Error(`找不到文章文件夹内的图片 · ${src}`);
        }
        images.set(path, realImage);
      }
      return segments.map(encodeURIComponent).join("/");
    }

    const cover = data.cover ? await registerImage(data.cover) : undefined;
    const jacket = data.jacket ? await registerImage(data.jacket) : undefined;
    const tokens = markdown.parse(body, {});
    for (const token of tokens) {
      for (const child of token.children ?? []) {
        if (child.type !== "image") continue;
        const src = child.attrGet("src");
        const description = child.content;
        if (description.startsWith("视频：")) {
          const label = description.slice(3).trim();
          if (!label) throw new Error("视频需要填写说明");
          const video = await registerImage(src, new Set([".mp4", ".webm"]));
          child.type = "html_inline";
          child.content = `<video controls playsinline preload="metadata" aria-label="${markdown.utils.escapeHtml(label)}"><source src="${markdown.utils.escapeHtml(video)}" type="${extname(video).toLowerCase() === ".mp4" ? "video/mp4" : "video/webm"}">你的浏览器不支持播放视频。</video>`;
          continue;
        }
        if (/^https?:\/\//i.test(src)) continue;
        child.attrSet("src", await registerImage(src));
      }
    }
    return {
      entry: {
        id: slug,
        href: `entries/${category.id}/${slug}/`,
        title: data.title,
        spine: data.spine,
        summary: data.summary,
        date: data.date,
        tone: data.tone ?? category.tone,
        mark: data.mark ?? Array.from(data.title)[0],
        cover,
        coverStyle,
        jacket,
        featured: data.featured,
      },
      body: markdown.renderer.render(tokens, markdown.options, {}),
      images,
    };
  } catch (error) {
    throw new Error(`${relative(process.cwd(), folder)}/index.md · ${error.message}`, { cause: error });
  }
}

export async function readBlog(root) {
  return Promise.all(categories.map(async category => {
    const folders = await readdir(join(root, category.id), { withFileTypes: true });
    const articles = await Promise.all(folders
      .filter(folder => folder.isDirectory() && !folder.name.startsWith("."))
      .map(folder => readArticle(root, category, folder.name)));
    articles.sort((a, b) => (b.entry.date ?? "").localeCompare(a.entry.date ?? "") || a.entry.id.localeCompare(b.entry.id));
    if (articles.filter(({ entry }) => entry.featured).length > 1) {
      throw new Error(`${category.id} 只能设置一本 featured 书`);
    }
    return { category, articles };
  }));
}
