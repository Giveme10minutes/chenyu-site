// Temporary blank covers for testing a full shelf.
function withBlankBooks(entries) {
  const tones = ["sand", "green", "rust", "blue", "sand", "rust",
    "green", "sand", "blue", "rust", "green", "sand"];
  const blankBooks = tones.map((tone, index) => ({
    title: `空白书 ${index + 1}`,
    subtitle: "测试占位",
    tone,
    blank: true,
  }));
  const middle = blankBooks.length / 2;
  return [...blankBooks.slice(0, middle), ...entries, ...blankBooks.slice(middle)];
}

export const bookshelfRows = [
  {
    id: "life",
    title: "生活记录",
    entries: withBlankBooks([
      { title: "电吉他", subtitle: "个人兴趣", tone: "rust", mark: "琴" },
      { title: "音乐", subtitle: "个人兴趣", tone: "blue", mark: "乐" },
      { title: "摄影", subtitle: "个人兴趣", tone: "sand", mark: "影" },
    ]),
  },
  {
    id: "projects",
    title: "做过的项目",
    entries: withBlankBooks([
      { title: "Aelos 机器人挑战赛", spine: "机器人竞赛", subtitle: "树莓派版本", tone: "green", mark: "机" },
      { title: "职业探索与学习行动 Agent", spine: "职业探索 Agent", subtitle: "华为 ICT 大赛项目", tone: "blue", mark: "路", image: "career-agent.jpg" },
      { title: "Java 社区论坛", subtitle: "Java 后端项目", tone: "rust", mark: "坛" },
    ]),
  },
];
