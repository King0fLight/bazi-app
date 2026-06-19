## 八字排盘 Web 应用 — 项目技术文档

本文档为项目交接用途编写，面向接手本项目的开发者或 AI Agent，涵盖架构设计、技术实现、部署流程和已知坑点。

---

### 一、项目概述

本项目是一个基于传统子平命理学的八字排盘与命盘解惑 Web 应用。用户输入出生年月日时、性别和当前困惑，系统先完成四柱八字、十神、大运、神煞、五行力量、地支关系等结构化排盘，再围绕用户问题生成一份白话“解惑报告”。

当前产品定位不是教用户系统学习八字，而是面向“真的有疑惑、希望得到解释”的访问者：先回答问题，再展示命盘依据、经典线索和继续追问所需的现实信息。排盘模块是底层工具，前端报告负责把术语翻译成可理解的答复。

线上地址：`https://king0flight.eoty.cn`（自定义域名，由 Gleam 免费子域名平台管理）
备用地址：`https://bazi-app-seven.vercel.app`
代码仓库：`https://github.com/King0fLight/bazi-app`

参考项目：
- `https://github.com/jinchenma94/bazi-skill`：可参考其“逐步收集用户问题和出生信息 -> 排盘 -> 综合分析 -> 引用经典”的 Agent 工作流。
- `https://github.com/cantian-ai/bazi-mcp`：可参考其“把八字排盘做成 MCP 工具，供 AI Agent 调用结构化结果”的工具化思路。

---

### 二、技术栈

| 层面 | 技术 | 版本 |
|------|------|------|
| 后端计算引擎 | Python + lunar_python + pydantic | Python 3.12, lunar_python 1.4.8, pydantic 2.13 |
| 前端框架 | React + TypeScript | React 19.2, TS 6.0 |
| 构建工具 | Vite | 8.0 |
| CSS 框架 | Tailwind CSS v4 | 4.3（通过 @tailwindcss/vite 插件，无需配置文件） |
| 图表库 | Recharts | 3.8 |
| 部署平台 | Vercel | Hobby 免费计划 |
| 数据分析 | Vercel Web Analytics | 免费版，每月 2500 事件 |
| 性能监控 | Vercel Speed Insights | 免费版，自动追踪 Core Web Vitals |
| 版本控制 | Git + GitHub | 仓库 King0fLight/bazi-app，自动部署 |

---

### 三、项目架构

```
请求流程：

用户浏览器 → Vercel Edge → Python Serverless Function (api/calculate.py)
                              ├── GET  → 返回 frontend/dist 中的静态文件，或 SPA 回退到 index.html
                              ├── POST → 调用 bazi/ 模块计算八字，返回 JSON
                              └── OPTIONS → CORS 预检响应
```

整个应用只部署一个 Python serverless function，同时承担前端静态文件服务器和后端 API 两个角色。这是 Vercel 对 Python 项目的特殊架构——不像 Node.js 项目有独立的静态文件托管，Python 项目需要手动在 handler 中同时处理 GET 和 POST。

---

### 四、目录结构

```
玄学/
├── .git/                     ← Git 仓库（已连接 GitHub: King0fLight/bazi-app）
├── .gitignore                ← Git 忽略规则（排除 玄学古籍PDF/、node_modules/、.vercel/ 等）
├── .vercel/                  ← Vercel 本地配置（project.json 含 orgId + projectId，不推送 GitHub）
├── api/
│   └── calculate.py          ← Vercel serverless handler（核心，同时处理 API 和静态文件）
├── bazi/                     ← 八字计算模块
│   ├── __init__.py
│   ├── engine.py             ← 主计算引擎，约 336 行
│   ├── models.py             ← Pydantic 数据模型，约 121 行
│   ├── tables.py             ← 天干地支/纳音/神煞查找表，约 278 行
│   ├── shishen.py            ← 十神计算，约 68 行
│   ├── dayun.py              ← 大运计算，约 70 行
│   └── shensha.py            ← 神煞检测，约 129 行
├── frontend/
│   ├── src/
│   │   ├── main.tsx          ← React 入口
│   │   ├── App.tsx           ← 主应用组件（状态管理 + Analytics 追踪）
│   │   ├── index.css         ← 全局样式 + Tailwind v4 + 五行配色
│   │   ├── api/bazi.ts       ← API 客户端（POST /api/bazi/calculate）
│   │   ├── types/bazi.ts     ← TypeScript 接口（与 Python models 对应）
│   │   └── components/       ← UI 组件
│   │       ├── BaziForm.tsx       输入表单
│   │       ├── LearningReport.tsx 解惑报告（围绕用户问题组织答复）
│   │       ├── ReadingPath.tsx    命盘证据路径
│   │       ├── ClassicsGuide.tsx  古籍依据线索
│   │       ├── PillarGrid.tsx     四柱展示卡片
│   │       ├── WuxingChart.tsx    五行柱状图（Recharts）
│   │       ├── DayunTimeline.tsx  大运时间线
│   │       ├── ShenshaList.tsx    神煞标签
│   │       └── Relations.tsx      天干地支关系
│   ├── index.html            ← SPA 入口 HTML
│   ├── vite.config.ts        ← Vite 配置（React + Tailwind v4 + API 代理）
│   └── package.json          ← 前端依赖
├── vercel.json               ← Vercel 部署配置
├── pyproject.toml            ← Python 项目配置 + Vercel 入口点
├── requirements.txt          ← Python 依赖
├── .vercelignore             ← Vercel 部署排除列表
├── PROJECT.md                ← 本文件
└── 玄学古籍PDF/               ← 138 本命理古籍 PDF（约 462 MB，不部署）
```

---

### 五、核心计算引擎（bazi/engine.py）

`calculate_bazi(inp: BaziInput) -> BaziChart` 是核心函数，执行流程：

1. 用 `lunar_python.Solar.fromYmdHms()` 将公历日期转为天文数据
2. 获取 `EightChar` 对象，提取年柱/月柱/日柱/时柱的天干地支
3. 处理子时分界（`split` 保持早晚子时，`whole` 将 23:00 后归入次日并重算日柱/时柱）
4. 查 `tables.py` 中的查找表获取藏干、纳音、十二长生
5. 调用 `shishen.py` 计算每个天干相对于日主的十神
6. 调用 `dayun.py` 计算 8 步大运（顺逆由年干阴阳 + 性别决定）
7. 调用 `shensha.py` 检测 11 种神煞
8. 统计五行力量（天干地支 + 藏干加权）
9. 检测地支关系（六合/三合/三会/六冲/刑/害/破）和天干关系（合化）
10. 计算空亡（日柱旬空）、生肖、农历日期格式化

**lunar_python 库**：底层使用瑞士星历表（Swiss Ephemeris）计算天文数据，精度覆盖 1900-2100 年，是中文历法计算中最可靠的 Python 库之一。

---

### 六、前后端数据接口

前端通过 `POST /api/bazi/calculate` 发送 JSON，后端返回 JSON。两端的数据模型严格对应：

**请求体（BaziInput）**：

| 字段 | 类型 | 说明 |
|------|------|------|
| year | int | 公历年份（1900-2100） |
| month | int | 月份（1-12） |
| day | int | 日期（1-31） |
| hour | int | 小时（0-23） |
| minute | int | 分钟（0-59） |
| gender | string | "男" 或 "女" |
| zi_mode | string | "split"（早晚子时）或 "whole"（整子时） |

前端表单还会收集 `topic`（问题主题）和 `question`（用户具体困惑），用于生成页面内的解惑报告；这两个字段不会发送给当前 Python 排盘 API，`frontend/src/api/bazi.ts` 会在请求前剥离它们，避免后端 Pydantic 模型报额外字段错误。后续如果接入真正的 Agent/RAG 后端，可以把这两个字段作为咨询上下文传入新接口。

**响应体（BaziChart）** — 关键字段：

| 字段 | 说明 |
|------|------|
| solar_date / lunar_date | 公历和农历日期字符串 |
| year/month/day/hour_pillar | 四柱数据，每柱含天干(stem)、地支(branch)、纳音(nayin)、藏干(canggan)等 |
| day_master | 日主信息（天干名、五行、阴阳） |
| dayun[] | 大运列表，每项含天干、地支、起始年龄、起始年份、纳音 |
| wuxing | 五行力量统计 {木, 火, 土, 金, 水} |
| shensha[] | 神煞列表，每项含名称、类型（吉/凶）、所在柱 |
| dizhi_relations[] / tiangan_relations[] | 地支和天干关系（合、冲、刑、害等） |
| kongwang[] | 空亡地支 |
| shengxiao | 生肖 |

Python 端的 Pydantic 模型在 `bazi/models.py`，TypeScript 端的接口定义在 `frontend/src/types/bazi.ts`。修改数据结构时两端必须同步更新。

---

### 七、Vercel 部署架构详解

#### 7.1 关键配置文件

**`pyproject.toml`** — 告诉 Vercel 使用哪个 Python 入口点：
```toml
[tool.vercel]
entrypoint = "api.calculate:handler"
```

**`vercel.json`** — 构建和部署配置：
```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "installCommand": "pip install --upgrade pydantic lunar_python && cd frontend && npm install",
  "cleanUrls": true,
  "rewrites": [
    { "source": "/api/bazi/calculate", "destination": "/api/calculate" }
  ]
}
```

**`.vercelignore`** — 排除不需要部署的文件：
```
玄学古籍PDF/
frontend/node_modules/
__pycache__/
*.pyc
.git/
.env
.env.local
```

**`.gitignore`** — 排除不需要版本控制的文件：
```
__pycache__/
node_modules/
frontend/dist/
玄学古籍PDF/
.vercel/
.idea/
.env
```

#### 7.2 api/calculate.py — 最核心的文件

这个文件是整个应用的关键，它同时处理前端和后端：

```python
class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        path = self.path.split('?')[0].lstrip('/')

        # 关键：排除 /_vercel/ 路径，让 Vercel 基础设施处理
        if path.startswith('_vercel/'):
            self.send_response(404)
            self.end_headers()
            return

        # 尝试从 frontend/dist 中找静态文件
        # 找到 → 返回文件（assets/ 路径加 immutable 缓存头）
        # 找不到 → SPA 回退返回 index.html

    def do_POST(self):
        # 解析 JSON body → BaziInput → calculate_bazi() → 返回 JSON

    def do_OPTIONS(self):
        # CORS 预检
```

#### 7.3 已知坑点（非常重要）

**坑 1：`/_vercel/` 路径必须排除**

Vercel 会自动注入 analytics 脚本（`/_vercel/insights/script.js`）和数据上报端点（`/_vercel/insights/view`、`/_vercel/insights/event`）。如果 Python handler 的 SPA 回退不把这些路径排除掉，handler 会返回 index.html 而不是 404，导致 Vercel 的 analytics 完全失效——数据上报请求被当作页面路由处理了。

**坑 2：`installCommand` 必须显式安装 Python 依赖**

Vercel 的构建缓存可能恢复旧版本的 Python 包。如果只依赖 `pyproject.toml` 自动安装，缓存命中时会跳过安装，导致 `pydantic` 或 `lunar_python` 缺失（500 错误）。必须在 `vercel.json` 的 `installCommand` 中显式 `pip install --upgrade`。

**坑 3：`bazi/` 模块必须在项目根目录**

`api/calculate.py` 中的 `from bazi.models import BaziInput` 依赖 Python 的模块搜索路径。在 Vercel 的 serverless 环境中，只有项目根目录下的模块能被自动发现。如果 `bazi/` 放在子目录（如 `backend/bazi/`）下，会导致 500 错误（No module named 'bazi'）。这是最初开发时踩过的坑，后来统一为根目录结构。

**坑 4：中文路径问题（仅影响手动部署）**

项目目录名包含中文（"玄学"），在 Windows 上 PowerShell、robocopy、cmd 都无法正确处理编码。如果使用手动部署方式（方式二），需要用 Python 的 `shutil.copytree` 把项目复制到英文名目录再执行 `vercel --prod`。使用 Git 自动部署（方式一）则不受此影响，因为 Git 和 Vercel 的构建系统能正确处理中文路径。

---

### 八、自定义域名配置

自定义域名 `king0flight.eoty.cn` 由 Gleam 免费子域名平台（https://sld.0n.pub）管理。

DNS 配置：

| 记录类型 | 名称 | 值 | 用途 |
|---------|------|-----|------|
| CNAME | @ | cname.vercel-dns.com | 将域名指向 Vercel |
| TXT | _vercel | vc-domain-verify=king0flight.eoty.cn,692657187c947c543ecc | Vercel 域名验证 |

**注意事项：** Vercel 的 TXT 验证记录需要在 `_vercel.eoty.cn`（父域名级别）添加，但 Gleam 平台默认只能在子域名级别（`king0flight.eoty.cn`）添加记录。这意味着需要在 Gleam 提交工单，请管理员手动在父域名级别添加 TXT 记录。这是一次性操作，域名验证后无需再改。

**Vercel 项目信息：**
- Project ID: `prj_N9xzbM2MXBZSpNIxnGoaQBL6sQbh`
- Team ID: `team_gEhQh07XUWYuUrak24Zl1DQP`
- SSL 证书由 Vercel / Let's Encrypt 自动签发和续期

---

### 九、数据分析与性能监控

#### 9.1 Vercel Web Analytics

已集成 `@vercel/analytics`，配置方式：

1. `frontend/package.json` 中安装 `@vercel/analytics`
2. `frontend/src/App.tsx` 中引入 `Analytics` 组件和 `track` 函数
3. `api/calculate.py` 中排除 `/_vercel/` 路径（否则 analytics 失效）

追踪的数据：

| 类型 | 名称 | 说明 |
|------|------|------|
| 页面浏览 | 自动 | 每次访问自动记录 URL、来源、设备、地区 |
| 自定义事件 | `bazi_calculate` | 每次排盘时记录：year, month, day, hour, minute, gender |

在 Vercel 仪表盘 → bazi-app 项目 → Analytics 标签页查看数据。免费额度：每月 2500 个事件。

#### 9.2 Vercel Speed Insights

已集成 `@vercel/speed-insights`，配置方式：

1. `frontend/package.json` 中安装 `@vercel/speed-insights`
2. `frontend/src/App.tsx` 中引入 `SpeedInsights` 组件
3. 在页面根节点末尾渲染 `<SpeedInsights />`
4. 首次使用时，需要在 Vercel 仪表盘 → bazi-app 项目 → Speed Insights 标签页确认启用

自动追踪页面加载性能指标（Core Web Vitals）：

| 指标 | 说明 |
|------|------|
| LCP (Largest Contentful Paint) | 最大内容渲染时间 |
| CLS (Cumulative Layout Shift) | 累积布局偏移 |
| FID (First Input Delay) | 首次输入延迟 |

在 Vercel 仪表盘 → bazi-app 项目 → Speed Insights 标签页查看数据。免费版可用。代码侧已经完成接入；如果面板仍显示未启用，需要在 Vercel 后台手动点一次 Enable。

---

### 十、本地开发

#### 前端开发（主要方式）

```bash
cd frontend
npm install
npm run dev        # 启动 Vite 开发服务器（localhost:5173）
```

Vite 开发服务器内置了 API 代理：`vite.config.ts` 中配置了 `/api` 前缀的请求代理到 `http://localhost:8000`。这意味着在开发模式下，前端的 API 请求会自动转发到本地后端。如果只需要调试前端 UI，可以用 `vercel dev` 来同时运行前后端。

#### 本地测试后端计算

`api/calculate.py` 是 Vercel 使用的 `BaseHTTPRequestHandler`，不是 ASGI app，不能直接用 `uvicorn.run()` 启动。需要完整模拟线上路由时，优先使用 Vercel CLI：

```bash
vercel dev
```

只想验证核心排盘函数时，可以直接调用 Python 模块：

```bash
pip install lunar_python pydantic
python -c "from bazi.models import BaziInput; from bazi.engine import calculate_bazi; print(calculate_bazi(BaziInput(year=1990, month=1, day=1, hour=11, gender='男')).model_dump_json(indent=2))"
```

---

### 十一、部署流程

#### 方式一：Git 自动部署（推荐）

GitHub 仓库地址：`https://github.com/King0fLight/bazi-app`

GitHub 仓库已连接到 Vercel 项目（项目设置 → Git → 已连接 King0fLight/bazi-app），每次推送到 GitHub 会自动触发 Vercel 部署：

```bash
cd C:\Users\King0\PycharmProjects\玄学
git add -A
git commit -m "描述本次修改"
git push origin master
```

推送后 Vercel 会自动执行：安装 Python 依赖 → 构建前端 → 上传文件 → 创建新部署。约 1-2 分钟线上生效。

**注意事项：**
- 推送时需要能访问 github.com（国内可能需要代理）。本地代理端口通常在 `http://127.0.0.1:7897`，可用 `git -c https.proxy=http://127.0.0.1:7897 push` 走代理
- `.gitignore` 已配置排除 `玄学古籍PDF/`、`node_modules/`、`__pycache__/` 等
- `.vercel/` 目录已加入 `.gitignore`，不会推送到 GitHub

#### 方式二：手动部署（备用）

如果 Git 自动部署不可用，可以通过手动复制 + Vercel CLI 部署：

1. 用 Python 脚本复制项目到英文名目录：

```python
import shutil, os, stat

src = r'C:\Users\King0\PycharmProjects\玄学'
dst = r'C:\Users\King0\.qoderworkcn\workspace\<workspace-id>\bazi-deploy'

if os.path.exists(dst):
    shutil.rmtree(dst, onexc=lambda f, p, e: (os.chmod(p, stat.S_IWRITE), f(p)))

shutil.copytree(src, dst, ignore=shutil.ignore_patterns(
    'node_modules', '.git', '__pycache__', '*.pyc', '玄学古籍PDF'
))

# 创建 .vercel/project.json 链接到已有项目
vercel_dir = os.path.join(dst, '.vercel')
os.makedirs(vercel_dir, exist_ok=True)
with open(os.path.join(vercel_dir, 'project.json'), 'w') as f:
    f.write('{"orgId":"team_gEhQh07XUWYuUrak24Zl1DQP","projectId":"prj_N9xzbM2MXBZSpNIxnGoaQBL6sQbh"}')
```

2. 在英文名目录下执行部署：

```bash
cd <英文名目录>
vercel --prod --yes
```

Python 环境使用 `D:\Anaconda\envs\ceshi\python.exe`（Windows 上的 Anaconda 环境，能正确处理中文路径编码）。

#### 日常工作流总结

```
修改代码 → git add/commit/push → Vercel 自动构建部署 → 线上生效
```

每次部署 Vercel 会自动执行：安装 Python 依赖 → 构建前端（npm install + npm run build）→ 上传所有文件 → 创建新的 production deployment。整个过程约 1-2 分钟。

---

### 十二、Vercel 账号认证

Vercel CLI 的认证信息存储在：
```
%APPDATA%\xdg.data\com.vercel.cli\auth.json
```

包含 `token`、`userId`、`refreshToken`、`expiresAt`。Token 会过期自动刷新，如果 API 调用报 `invalidToken`，重新运行 `vercel login` 即可。

---

### 十三、优化建议（给接手者）

1. **代码分割**：前端 JS bundle 超过 500 KB（Vite 有警告），可以通过 `dynamic import()` 把 Recharts 图表库按需加载，减少首屏加载时间。

2. **时区处理**：当前排盘使用本地时间，未考虑出生地时区校正（真太阳时）。这是一个常见的命理应用需求。

3. **测试覆盖**：项目目前没有任何单元测试。建议至少为 `engine.py` 的核心计算逻辑添加测试，对照已知命盘验证计算正确性。

4. **古籍 PDF 利用**：`玄学古籍PDF/` 中有 138 本命理古籍（462 MB），可以作为知识库接入 RAG 系统，为用户提供排盘结果的经典文献解读。

5. **命盘解惑 Agent**：下一阶段建议做成“问题 -> 排盘工具 -> 古籍检索 -> 答案生成”的链路。先抽取 26 本八字命理 PDF，建立文本索引和书名/页码元数据；再让 Agent 根据用户问题、四柱结构、五行偏向、大运阶段去检索证据，输出带出处的回答。参考 `bazi-skill` 的交互流程和 `bazi-mcp` 的工具化结构。

---

### 十四、变更记录（给后续模型/开发者）

每次修改后建议同步更新本节，方便后续接手者快速判断本地文件、GitHub 仓库和 Vercel 部署之间的状态。

| 日期 | 提交 | 说明 |
|------|------|------|
| 2026-06-19 | 本次更新 | 根据用户反馈将产品定位从“学习用户”调整为“解惑用户”：前端表单新增问题主题和具体困惑，`LearningReport` 改为先回应用户问题、再展示命盘依据和追问信息；`ReadingPath` 改为“这个答复从哪里来”；`ClassicsGuide` 改为“古籍依据线索”。参考 `jinchenma94/bazi-skill` 和 `cantian-ai/bazi-mcp` 后，明确下一阶段方向为“排盘工具 + 本地古籍 PDF 检索 + Agent 回答”。 |
| 2026-06-19 | 本次更新 | 继续把产品从“排盘展示器”改成“命理学习报告”：新增 `LearningReport`，重做输入区说明和按钮文案，用问题驱动解释日主、月令、五行、合冲、神煞的阅读顺序；新增回档标签 `backup-before-learning-report-20260619`。 |
| 2026-06-19 | 本次更新 | 参考 GitHub 八字项目的常见功能组织后，新增“这张盘怎么读”导读卡片，并增强“经典依据”结果卡片：先给白话总览，再解释日主、月令、五行偏枯、调候、格局、神煞等术语，最后推荐本地八字古籍的研读方向；已创建回档标签 `backup-before-classics-20260619`。 |
| 2026-06-19 | `3c2cc04` | 安装并接入 Vercel Speed Insights；`App.tsx` 新增 `<SpeedInsights />`，代码已推送到 GitHub，Vercel 会自动部署。 |
| 2026-06-19 | `a445571` | 加固八字排盘输入校验和接口错误处理；修复整子时跨日逻辑；前端新增子时模式选项；构建验证通过。 |

当前协作说明：
- 本地仓库路径：`C:\Users\King0\PycharmProjects\玄学`
- GitHub 仓库：`https://github.com/King0fLight/bazi-app`
- 线上主域名：`https://king0flight.eoty.cn`
- Vercel 备用域名：`https://bazi-app-seven.vercel.app`
- 日常流程：改代码 → 更新本文件 → `git add`/`commit`/`push` → Vercel 自动部署
