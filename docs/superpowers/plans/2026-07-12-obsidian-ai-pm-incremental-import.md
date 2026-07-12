# Obsidian AI 产品经理资料增量导入 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 Obsidian 中 2026-07-06 两节 AI 产品经理求职课程的全部有效新知识去重后增量加入现有复习题库。

**Architecture:** 保持单页静态架构不变，将新卡追加到 `index.html` 的 `CARDS` JSON 数组。先以验证脚本锁定新增卡的结构、ID 和覆盖面，再从八份结构化笔记提炼卡片，最后进行程序校验和浏览器回归。

**Tech Stack:** HTML、原生 JavaScript、Node.js `assert`、浏览器本地存储

---

## 文件结构

- Modify: `index.html` — 保存全部复习卡和页面运行逻辑；本次只追加 `kc-0706-*` 卡片。
- Modify: `scripts/validate-cards.mjs` — 校验新增卡数量、唯一 ID、来源覆盖、字段结构和面试卡数量。
- Reference only: Obsidian `AI产品班/总结版/` 与 `AI产品班/提取/` 下八份 2026-07-06 结构化笔记。
- Reference only: `docs/superpowers/specs/2026-07-12-obsidian-ai-pm-incremental-import-design.md` — 已确认设计。

### Task 1: 建立增量导入失败基线

**Files:**
- Modify: `scripts/validate-cards.mjs`
- Test: `scripts/validate-cards.mjs`

- [ ] **Step 1: 在验证脚本中加入 7 月 6 日增量约束**

在解析 `cards` 后增加：

```js
const july6Cards = cards.filter((card) => card.id.startsWith('kc-0706-'));
assert(july6Cards.length >= 50, 'July 6 import should contain at least 50 deduplicated cards');

for (const id of [
  'kc-0706-hr-screening-25',
  'kc-0706-project-evidence-chain',
  'kc-0706-model-evaluation-story',
  'kc-0706-online-resume-first',
  'kc-0706-self-intro-mainline',
  'kc-0706-staged-applications',
  'kc-0706-interview-review-loop',
]) {
  assert(ids.has(id), `missing expected card ${id}`);
}

const july6Sources = new Set(july6Cards.map((card) => card.source));
assert(july6Sources.has('7-6上午 AI产品经理求职培训课程'));
assert(july6Sources.has('7-6中午 AI产品经理求职简历与面试准备'));
```

将固定总数断言暂时改为：

```js
assert(cards.length >= 293, 'card count should include the complete July 6 import');
```

- [ ] **Step 2: 运行验证并确认因缺少新增卡失败**

Run: `node scripts/validate-cards.mjs`

Expected: FAIL，错误包含 `July 6 import should contain at least 50 deduplicated cards`。

- [ ] **Step 3: 提交失败测试**

```bash
git add scripts/validate-cards.mjs
git commit -m "test: define July 6 card import coverage"
```

### Task 2: 读取来源并建立去重清单

**Files:**
- Reference: Obsidian 中八份 2026-07-06 结构化笔记
- Modify: `index.html`

- [ ] **Step 1: 读取两份总结版和六份提取稿**

逐份读取全文，来源限定为：上午/中午各一份总结版，以及各自的老师强调、面试要点、重点知识点。只在结论语义不清时用 `rg -n` 定位原版对应段落。

- [ ] **Step 2: 检索旧卡防止重复**

Run:

```bash
rg -n "HR 初筛|项目证据链|模型评测|AI PRD|在线简历|PDF 简历|自我介绍|分阶段投递|面试复盘" index.html
```

Expected: 显示已有相近卡片；逐条判断是完全重复还是新增场景/框架。

- [ ] **Step 3: 形成不少于 50 个唯一知识点**

覆盖以下七组且两节课均有卡片：项目证据链、数据埋点与模型评测、AI PRD 与内部资源、在线/PDF 简历、求职资料库、自我介绍与项目讲述、投递与面试复盘。完全相同结论合并为一张，包含不同执行细节的拆成独立卡。

### Task 3: 追加完整的 7 月 6 日卡片

**Files:**
- Modify: `index.html`（`const CARDS=[...]`）
- Test: `scripts/validate-cards.mjs`

- [ ] **Step 1: 按现有 schema 追加新卡**

每张新卡使用如下完整结构之一：

```js
{
  "id": "kc-0706-project-evidence-chain",
  "type": "qa",
  "topic": "项目表达",
  "source": "7-6上午 AI产品经理求职培训课程",
  "cat": "面试",
  "front": "面试中如何用项目证据链证明项目真实做过？",
  "back": "围绕需求来源、方案取舍、协作文档、埋点数据、模型评测、上线结果和迭代记录展示可核验证据；不要只给结论或一张最终 Demo。",
  "analogy": "像法庭举证，不能只说做过，要把连续证据摆出来。",
  "srs": {"ease": 2.5, "interval": 0, "reps": 0, "lapses": 0, "due": null, "last": null}
}
```

选择题使用：

```js
{
  "id": "kc-0706-online-resume-first",
  "type": "choice",
  "topic": "简历作品集",
  "source": "7-6中午 AI产品经理求职简历与面试准备",
  "cat": "面试",
  "front": "制作求职材料时，为什么应先完成飞书在线简历？",
  "options": ["便于持续更新、链接作品证据并沉淀完整母版", "因为 PDF 无法投递", "为了省略项目数据", "因为在线简历不需要排版"],
  "answer": 0,
  "back": "在线版适合作为持续更新的完整母版，可链接项目文档和作品证据；再按岗位压缩成 PDF 投递版。",
  "explain": "在线版负责完整与可扩展，PDF 版负责针对岗位快速阅读。",
  "analogy": "在线简历像资料总库，PDF 像针对岗位剪出的预告片。",
  "srs": {"ease": 2.5, "interval": 0, "reps": 0, "lapses": 0, "due": null, "last": null}
}
```

所有新卡 ID 必须以 `kc-0706-` 开头，`source` 只能使用计划中两个规范来源名。

- [ ] **Step 2: 运行结构验证**

Run: `node scripts/validate-cards.mjs`

Expected: 若仅剩固定总数或面试阈值不匹配，记录实际统计；不得出现重复 ID、空答案、非法题型或越界答案。

- [ ] **Step 3: 统计增量分布并人工抽查**

Run:

```bash
node -e "const fs=require('fs');const h=fs.readFileSync('index.html','utf8');const c=JSON.parse(h.match(/const CARDS=(\[.*?\]);\nconst STANDALONE/s)[1]);const n=c.filter(x=>x.id.startsWith('kc-0706-'));console.log({total:c.length,july6:n.length,interview:n.filter(x=>x.cat==='面试').length,course:n.filter(x=>x.cat!=='面试').length,types:Object.groupBy?n.reduce((a,x)=>(a[x.type]=(a[x.type]||0)+1,a),{}):{}})"
```

Expected: `july6 >= 50`，上午和中午来源均非零，`choice`、`qa`、`recall` 均有覆盖。

- [ ] **Step 4: 提交卡片内容**

```bash
git add index.html
git commit -m "feat: add complete July 6 AI PM review cards"
```

### Task 4: 固化完整性校验并通过测试

**Files:**
- Modify: `scripts/validate-cards.mjs`
- Test: `scripts/validate-cards.mjs`

- [ ] **Step 1: 将总数校验绑定到旧卡基线与本次增量**

把 `assert(cards.length >= 293, ...)` 改为：

```js
assert.equal(cards.length, 243 + july6Cards.length, 'only the July 6 import may extend the 243-card baseline');
```

这能精确保证当前总卡数由原 243 张和本次 `kc-0706-*` 增量组成，避免混入其他未审计卡片。将面试卡阈值提高到 `90`，并保留七个关键 ID 断言。

- [ ] **Step 2: 增加新卡字段与来源约束**

```js
for (const card of july6Cards) {
  assert(['7-6上午 AI产品经理求职培训课程', '7-6中午 AI产品经理求职简历与面试准备'].includes(card.source), `${card.id} has unexpected source`);
  assert(card.srs && card.srs.ease === 2.5 && card.srs.interval === 0, `${card.id} must start with fresh SRS state`);
}
```

- [ ] **Step 3: 运行最终自动验证**

Run: `node scripts/validate-cards.mjs`

Expected: PASS，输出 `validated N cards (M interview cards)`。

- [ ] **Step 4: 提交校验更新**

```bash
git add scripts/validate-cards.mjs
git commit -m "test: validate complete July 6 card set"
```

### Task 5: 浏览器回归与交付检查

**Files:**
- Verify: `index.html`
- Verify: `scripts/validate-cards.mjs`

- [ ] **Step 1: 启动静态服务器**

Run: `python3 -m http.server 4173`

Expected: 服务监听 `http://127.0.0.1:4173/`。

- [ ] **Step 2: 浏览器验证核心流程**

打开页面并确认：总卡数与脚本一致；“日常知识”和“面试题库”筛选可用；至少作答一张新增选择题；至少翻面一张新增 `qa` 或 `recall` 卡；控制台无 JavaScript 错误。

- [ ] **Step 3: 检查改动边界**

Run:

```bash
git status --short
git diff HEAD~3 --check
git diff HEAD~3 --stat
git log -4 --oneline
```

Expected: 仅设计/计划文档、`index.html`、`scripts/validate-cards.mjs` 有相关改动；无 Obsidian 原文、密钥、私人聊天或无关文件。

- [ ] **Step 4: 运行最终验证并记录结果**

Run: `node scripts/validate-cards.mjs`

Expected: PASS。将实际新增卡数、总卡数、面试卡数和浏览器验证结果写入交付说明。
