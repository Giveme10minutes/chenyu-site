# 开发进度

## 第一版

- 原个人介绍首页来自 GitHub 提交 `ca7ec39`。从顶部导航和两张项目卡片可进入面试学习区。
- 学习区共有 29 节，围绕职业探索 Agent、Java 社区论坛和通用工程基础。每节有面试题、参考要点与小练习。源码引用固定到华为项目的 `b204cbc` 和论坛公开版本的 `cd12462`。论坛本地 `0bc52a7` 与公开版本的浏览量列表展示差异已在对应讲义注明。
- 可搜索、切换学习与自测、收藏、标记掌握程度、保存回答和笔记、导出或导入 JSON 备份。复制按钮将题目、项目做法、示例、引用和用户输入复制到剪贴板。
- 使用 Chrome 核验了两个项目入口、课程目录、搜索、自测、复制内容、收藏及待复习筛选、刷新后恢复、进度、备份导出与导入、无效备份提示。检查了 390px 移动端布局和目录操作。30 条不同引用路径已在所引用提交中确认存在。

## 接续工作

在新聊天中从本站仓库打开。如果要补课，定位 `docs/study/topics.js` 中的知识点并核对引用版本。如果要改个人经历或贡献，先依据用户确认的信息。发布记录可在仓库的 GitHub Pages 部署历史中查看。

## 主页视觉更新 · 2026-11-14

- 使用宽留白、大标题和蓝白配色，增加“想法、构建、验证”的个人介绍图形。
- Agent 项目采用深蓝色展示区，保留录屏，开发方法与调试细节可展开。新增独立的学习区入口。
- 首页样式独立到 `docs/assets/home.css`。已检查 320、390、768、1440px 无横向溢出，展开详情、学习链接和视频来源正常，并查看桌面与手机截图。

## 沉浸式作品集

- `docs/showcase/` 包含肖像、机器人竞赛、职业探索 Agent 和 Java 社区论坛。原首页提供入口，作品集提供返回链接。桌面具有滚动转场，手机可顺序浏览。证书公开文件遮盖了编号。

- 按用户要求将沉浸式作品集设为首页，旧版移至 `docs/classic/`，与首页互相链接。`/showcase/` 跳转至首页，资源仍保存在原目录。
- 旧版入口移到论坛之后的小页脚。桌面与项目文字对齐，窄屏靠右，均随正文滚出。已本地验证入口位置和旧版跳转。
- 首屏滚动提示改为 18px 暖白文字和轻缓下探的箭头。验证了下探、停顿、滚动后淡出、点击进入肖像及减少动态效果。
- 首屏提示随滚动向上移动并淡出。已验证往回滚时位置和亮度恢复，以及点击跳至肖像。
- 按用户澄清，首屏提示改为文字与箭头整体随滚动放大并缓慢淡出。已验证中段可见的放大幅度、位置、回退和点击跳转。
- 将首屏放大与淡出拆成两个相邻阶段。实际滚轮测试确认首次滚 120px 时保持完全可见并放大约 1.8 倍，随后在两倍尺寸上淡出。
- 肖像亮起时随滚动从下方升至原位，光斑的亮度、中心和扩张公式沿用原设定。验证了正反滚动及减少动态效果。
- 新版页脚增加 GitHub 个人主页链接，与旧版入口并列。

## 新版首页 React 迁移

- 新版首页源码在 `homepage/`，肖像、机器人竞赛、Agent、论坛和页脚各有组件。滚动进度和各幕时间点集中在 `homepage/scrollScenes.js`。
- 修改后运行 `npm ci` 安装依赖，再运行 `npm run build`。构建生成首页 HTML 和浏览器脚本，将构建产物随源码一起提交。GitHub Pages 继续从 `docs/` 发布静态文件。
- 已验证桌面滚动及回退、证书弹窗焦点恢复、录屏关闭后暂停、手机页脚、减少动态效果，以及关闭 JavaScript 后的正文和媒体链接。此阶段只做本地迁移。

## 个人博客改版规划 · 2026-11-15

- 已整理[个人博客改版计划](blog-redesign-plan.md)，涵盖首访肖像、蝴蝶转场、生活与项目书架、卡片详情，以及各阶段的验收条件。当前是设计阶段，页面实现尚未开始。
- 用户确认保留下滑时肖像慢慢升起和亮起的现有动画。已将肖像完整亮相后再进入蝴蝶转场写入分镜与验收条件。

## 蝴蝶转场第一版 · 2026-11-15

- 在 `codex/blog-redesign` 分支实现首访开场的过渡。肖像沿用原来的升起、聚光和介绍节奏。继续下滑时，蝶群从右下方飞入，暖色纸面随之展开。转场和博客预览在同一页。
- 桌面展示六只蝴蝶，手机展示三只。飞行位置跟随滚动，可回退。左右翅膀独立扇动，素材为内置图片生成工具产出的透明图，压缩后保存在 `docs/showcase/butterfly-blue.webp`。落点暂用「生活记录」与「做过的项目」两张静态预览封面。
- 构建通过。用 Chrome 验证 1440、390 和 320 像素宽布局的肖像显现、蝶群飞行、落点、回滚和滚动提示点击。验证减少动态效果和关闭 JavaScript 时可直接阅读介绍与博客预览。保留本地预览供评审。
- 图片生成提示词：One isolated realistic dusty pale steel-blue butterfly, dorsal top-down orthographic view, head straight up, body exactly vertical, both wings fully open flat symmetrical left and right, on genuine transparent background. This is a cutout sprite for independent wing flapping in a cinematic web animation. Finely detailed veins, slate-blue outer edges, slightly luminous silvery blue inner wing, natural velvety scales, ethereal but photographic, no glow. Centered, fully visible with small transparent margin around wing tips and antennae. Exactly one butterfly, no shadow, no text, no other objects.

## 蝶群密度与翅形调整 · 2026-11-15

- 桌面蝶群从六只增至十四只，手机从三只增至八只。单只最大显示宽度约为上一版的一半。增加象牙白圆翅和深紫灰凤蝶，与原来的蓝灰蝶错落飞过。
- 两种新素材由内置图片生成工具生成并保留透明背景，存于 `docs/showcase/butterfly-ivory.webp` 与 `docs/showcase/butterfly-swallowtail.webp`。Chrome 验证 1440、390、320 像素宽下的蝶群数量、大小、三款素材加载、肖像显现、落点与回滚，减少动态效果和无 JavaScript 的页面也通过复查。
- 象牙白提示词：One isolated photorealistic ivory-white butterfly with distinct rounded forewings, subtle parchment cream near the body and charcoal tips, real insect scales and soft thin veins, flat top-down dorsal orthographic view on a genuinely transparent background. Single clean cutout for a tiny animated sprite. Body straight up and exactly centered on the vertical midline, front and back wings fully opened symmetrically on both sides, antennae and all wing tips completely inside frame with slight padding. No shadow, no glow, no backdrop, no text, no other objects.
- 凤蝶提示词：One isolated realistic small swallowtail butterfly cutout, dark charcoal and muted smoky lavender blue coloring, narrow swept angular forewings, two short distinctive hindwing tails with a subtle warm copper eye spot, dorsal top-down orthographic view, symmetrical fully open wings, body vertically centered with head straight up. Genuine transparent background for a tiny animated sprite, slight padding outside wing tips and antennae, evenly lit delicate natural markings. Exactly one butterfly, no shadows, scenery, text, or border.

## 蝶群全屏分布 · 2026-11-15

- 蝶群从右下角飞入后沿高低不同的路线铺开。部分蝴蝶沿右侧上升，部分横穿画面后从左侧和顶部散去。桌面二十六只，手机十四只，单只尺寸和三种翅形沿用上一版。
- 构建通过。Chrome 在 1440、390 和 320 像素宽下验证转场中段的蝶群分布，屏幕按上中下与左中右划分的九个区域均有蝴蝶。复查肖像显现、回滚、博客落点及减少动态效果。
- 按反馈将整群蝴蝶的基础宽度放大约 15%，沿用全屏分布和飞行节奏。构建通过，在 1440、390 和 320 像素宽下复查尺寸与完整转场。
- 优化转场衔接。蝴蝶段对滚动变化做短暂缓动，肖像最初的显现仍直接跟随滚动。暖白纸面从右下方铺向中央，博客封面随蝶群散开轻微上移显现。蝶群数量、尺寸和路线沿用上一版。用 Chrome 核验短距离滚动的中间帧、快速滚动后的落点、回滚和减少动态效果。
- 保留缓动与画面交接节奏，加密全屏蝶群。桌面从二十六只增至四十二只，手机从十四只增至二十四只，单只最大尺寸沿用上一版。构建通过，并在桌面和两种手机宽度验证中段数量、九个区域的分布、快速滚动落点、回滚和减少动态效果。
- 将蝶群基础宽度再放大约 20%。构建通过，并在桌面和两种手机宽度验证新尺寸与九个区域的分布。
- 试做滚动与自动收尾的衔接。书架开始露出后，剩余蝶群和纸面按约 650 毫秒完成转场，页面滚动位置仍由用户掌控。往回滑过接力点可打断并恢复滚动控制。同步缩短固定舞台的滚动距离。用 Chrome 核验停在接力点前后、打断收尾、快速下滑与减少动态效果。

## 手动转场与蝶群密度分段 · 2026-11-15

- 在 `codex/blog-transition-experiment` 恢复 `084dc90` 的手动滚动方式。前段小群从右下角先飞入，中段六种蝴蝶一起铺满画面，末段各自散开。桌面共六十六条路径，手机共三十六条。保留肖像显现、滚动缓动和暖白纸面展开。
- 构建通过。Chrome 在桌面及两个手机宽度验证稀疏出场、全屏高密度、疏散收尾，以及停在后段时画面停住。回滚、快速滚动、减少动态效果及无 JavaScript 的浏览路径均通过。
- 三种透明素材由内置图片生成工具生成，保存在 `docs/showcase/butterfly-amber.webp`、`docs/showcase/butterfly-jade.webp` 和 `docs/showcase/butterfly-rose.webp`。

琥珀橙素材提示词

> A single isolated realistic amber orange butterfly, wings rounded and slightly scalloped with rich burnt ochre, a subtle dark brown border and fine pale vein markings, no eyespots. Dorsal top-down orthographic view, body perfectly centered and straight upright, head up, wings fully open flat and symmetrical. Clean crisp cutout on genuinely transparent background, complete antennae and wingtips with slight margin. It will be used as a small independently flapping wing sprite in a photo-real cinematic website. No shadows, no text, no other objects.

灰绿尖翅素材提示词

> One isolated photorealistic pale sage-jade butterfly with elongated gently pointed forewings and soft leaf green panels, smoky dark fine veins, thin charcoal edging and a few pale small spots near the wing edge. Top down dorsal orthographic view, body EXACTLY centered on vertical centerline, head upwards, wings spread fully open symmetrically. Entire insect visible with small transparent margin on a genuine fully transparent background. One tiny animated web sprite, no backdrop, shadow, text or other objects.

玫瑰棕波纹翅素材提示词

> One single isolated photorealistic butterfly with muted dusty rose and lilac bands on smoky dark rounded forewings and scalloped hindwings with subtle deep burgundy eyespots. Dorsal top-down orthographic view, head straight up, body perfectly vertical and centered, both wings fully open flat to left and right symmetrically. Genuine transparent background and slight transparent margin around wings and antennae. Photographic small animated web sprite, natural texture, no shadow, glow, border, or text.

### 延长尾蝶路线并加密中段

- 为中段增加八条桌面路线，其中四条也在手机上显示。拉长六只尾蝶的路线，让书架完整露出后仍有少数蝴蝶朝左侧和上方飞离。手动转场的末段增加约五分之一屏的滚动距离。
- 构建通过。在桌面和两种手机宽度复查起落密度、全屏分布、尾蝶延长后的可见性、停滚、回滚及减少动态效果。

### 准备博客预览发布

- 实验分支继续维护博客源码，GitHub Pages 的 `main/docs/blog/` 发布通过验收的静态快照。原版继续位于 `yuchen.ink` 根路径，博客预览页脚可返回原版。

### 博客书架动效规格 · 2026-11-16

- 根据 VHS 书架录屏和提示词整理[博客书架动效规格](bookshelf-effects.md)，包括蝴蝶落点、选卡与封面展开、独立详情、返回恢复及验收清单。

### 双排书架本地原型 · 2026-11-16

- 在 `codex/blog-two-row-bookshelf` 分支实现上下双排。生活记录在上，已有项目在下。右侧按钮、滚轮或手机竖滑换排。主排显示大封面，另一排只在边缘露出约 14–30 像素。每排可独立点选书脊、用方向键换书或横拖，切到另一排后保留先前选书。
- 介绍页为 `/blog/intro/`，书架为 `/blog/`。现有蝴蝶退场后在同一文档内更新地址。书架可直达及刷新，浏览器历史和书架左上角可返回介绍。根目录在本地原型中跳转至介绍。
- 从仓库根目录运行 `npm run build`，再用 `python3 -m http.server 8000 --directory docs` 可以预览两条地址。两个入口生成在 `docs/blog/`，资源仍由 `docs/showcase/` 提供。原型仅保存在本地分支。详情页、文章内容与正式封面待后续制作。
- 构建通过。用 Chrome 核验桌面及 390、320 像素宽手机布局，复查蝴蝶转场保留原书架节点、上下排约 29 像素露边、一次普通滚轮换排、快速连点与键盘换书、触屏横拖和竖滑、历史返回和前进、直接刷新及减少动态效果。关闭 JavaScript 时，介绍页的入口仍能打开书架。

### 换排按钮样式 · 2026-11-16

- 右侧换排按钮改为圆形磨砂玻璃，箭头居中，目标分类放在圆底下方。桌面及 390、320 像素宽布局均核验了上下换排、标签更新与按钮轮廓，桌面同时复查了键盘焦点和回车操作。构建及书架回归检查通过。
- 书名两侧的上一册、下一册按钮也换成同款圆形磨砂玻璃。桌面及 390、320 像素宽布局验证了标题间距、双向换书和到头禁用，桌面另核验键盘焦点与回车操作。构建及书架回归检查通过。
- 给玻璃按钮加入桌面悬停回弹。移入时圆底轻抬后停稳，箭头沿操作方向移动，移开时一起回位，按下时略缩。Chrome 实测换排按钮峰值约 3.7 像素，换书按钮约 2.6 像素。检查了减少动态效果及书架原有操作。

### 书本悬停动效 · 2026-11-16

- 两侧书脊在指针移入时向上、向前抽出并露少量封面，约 280 毫秒回弹停稳。中央封面只轻抬并前倾。移开后约 200 毫秒归位，换书时收起悬停姿态。
- Chrome 实测书脊上抬峰值 11.7 像素，停稳 8 像素。核验指针停在原书脊底边时无跳动、原位置仍能点选、中央封面前倾、触屏点选、减少动态效果及书架回归。构建通过。
- 按反馈减小书本悬停幅度并放慢起步。两侧书脊约 340 毫秒抬起 5 像素，前探和翻转幅度一并减小，阴影与书本同步过渡。Chrome 实测前 75 毫秒抬升不足 1 像素。复查书脊边缘停留、点击换书、手机手势、减少动态效果及构建。

### 满书架预览 · 2026-11-16

- 两排各加入 12 本可选中的空白测试书，总计各 15 本。空白书脊和封面只显示材质与配色，选中时在下方标明「测试占位」。换排按钮下的文字加了浅底，以便书脊经过背后时仍能读清。
- 构建通过。在 Chrome 验证跨多本点选、空书悬停、键盘焦点与书架边界、两排独立选择及手机横滑和点选。占位书只用于本地评审。

### 博客内容维护规划 · 2026-11-16

- 已整理[博客内容维护计划](blog-content-plan.md)，约定拟采用的一篇一文件夹、Markdown 正文与可选封面，以及新增文章、生成详情页、返回书架和发布目录的验收步骤。内容构建和详情页仍待开发。
