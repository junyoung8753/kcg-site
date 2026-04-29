import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = resolve(rootDir, "docs/setup/OPEN_TASKS.md");
const outputPath = resolve(rootDir, "output/kcg-open-tasks.html");

const statusOrder = ["blocked", "user-only", "doing", "todo", "done"];
const priorityOrder = ["P0", "P1", "P2", "P3"];
const ownerOrder = ["codex", "shared", "junyoung"];

const statusLabels = {
  blocked: "막힘",
  "user-only": "junyoung 직접",
  doing: "진행 중",
  todo: "해야 함",
  done: "완료",
};

const priorityLabels = {
  P0: "오픈 전 필수",
  P1: "현재 품질 게이트",
  P2: "런칭 품질 개선",
  P3: "나중 선택",
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function inlineMarkdown(value) {
  return escapeHtml(value).replace(/`([^`]+)`/g, "<code>$1</code>");
}

function parseTasks(markdown) {
  return markdown
    .split(/\r?\n/)
    .filter((line) => /^\|\s*KCG-TODO-\d+/.test(line))
    .map((line) => {
      const cells = line
        .trim()
        .split("|")
        .slice(1, -1)
        .map((cell) => cell.trim());

      if (cells.length < 7) return null;

      const [id, priority, status, owner, task, acceptance, verification] = cells;
      return { id, priority, status, owner, task, acceptance, verification };
    })
    .filter(Boolean);
}

function countWhere(tasks, predicate) {
  return tasks.filter(predicate).length;
}

function buildOptions(values, labels, allLabel) {
  const options = [`<option value="all">${escapeHtml(allLabel)}</option>`];
  for (const value of values) {
    options.push(`<option value="${escapeHtml(value)}">${escapeHtml(labels[value] || value)}</option>`);
  }
  return options.join("");
}

function renderMetric(label, value, hint, accent = "") {
  return `
    <article class="metric ${accent}">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
      <small>${escapeHtml(hint)}</small>
    </article>`;
}

function renderTaskCard(task) {
  const searchable = [
    task.id,
    task.priority,
    task.status,
    task.owner,
    task.task,
    task.acceptance,
    task.verification,
  ]
    .join(" ")
    .toLowerCase();

  return `
    <article class="task-card priority-${escapeHtml(task.priority.toLowerCase())}"
      data-card
      data-status="${escapeHtml(task.status)}"
      data-priority="${escapeHtml(task.priority)}"
      data-owner="${escapeHtml(task.owner)}"
      data-search="${escapeHtml(searchable)}">
      <div class="task-card__top">
        <div>
          <strong>${escapeHtml(task.id)}</strong>
          <p>${inlineMarkdown(task.task)}</p>
        </div>
        <span class="priority">${escapeHtml(task.priority)}</span>
      </div>
      <div class="badges">
        <span class="badge status-${escapeHtml(task.status)}">${escapeHtml(statusLabels[task.status] || task.status)}</span>
        <span class="badge owner-${escapeHtml(task.owner)}">${escapeHtml(task.owner)}</span>
        <span class="badge muted">${escapeHtml(priorityLabels[task.priority] || task.priority)}</span>
      </div>
      <dl>
        <div>
          <dt>완료 기준</dt>
          <dd>${inlineMarkdown(task.acceptance)}</dd>
        </div>
        <div>
          <dt>검증</dt>
          <dd>${inlineMarkdown(task.verification)}</dd>
        </div>
      </dl>
    </article>`;
}

function renderSection(status, tasks) {
  const sectionTasks = tasks.filter((task) => task.status === status);
  return `
    <section class="task-section" data-section="${escapeHtml(status)}">
      <header>
        <div>
          <span class="section-kicker">${escapeHtml(status)}</span>
          <h2>${escapeHtml(statusLabels[status] || status)}</h2>
        </div>
        <strong data-section-count>${sectionTasks.length}</strong>
      </header>
      <div class="task-grid">
        ${sectionTasks.map(renderTaskCard).join("") || '<p class="empty">표시할 항목이 없습니다.</p>'}
      </div>
    </section>`;
}

function renderHtml(tasks) {
  const generatedAt = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    dateStyle: "full",
    timeStyle: "medium",
  }).format(new Date());

  const counts = {
    active: countWhere(tasks, (task) => task.status !== "done"),
    p0: countWhere(tasks, (task) => task.priority === "P0" && task.status !== "done"),
    userOnly: countWhere(tasks, (task) => task.status === "user-only"),
    blocked: countWhere(tasks, (task) => task.status === "blocked"),
    done: countWhere(tasks, (task) => task.status === "done"),
  };

  const sourceUrl = pathToFileURL(sourcePath).href;

  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>KCG Open Tasks Dashboard</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f5f3ee;
      --surface: #fffdf8;
      --surface-strong: #ffffff;
      --ink: #191714;
      --muted: #6b6255;
      --line: #ded5c6;
      --gold: #b88424;
      --gold-soft: #f0dfbd;
      --red: #b42318;
      --red-soft: #fee4e2;
      --blue: #175cd3;
      --blue-soft: #dbeafe;
      --green: #067647;
      --green-soft: #dcfae6;
      --violet: #6941c6;
      --violet-soft: #ebe9fe;
      --shadow: 0 16px 40px rgba(46, 36, 20, 0.08);
      font-family: "Pretendard", "Segoe UI", "Apple SD Gothic Neo", "Malgun Gothic", Arial, sans-serif;
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      background:
        linear-gradient(180deg, rgba(184, 132, 36, 0.12), rgba(245, 243, 238, 0) 320px),
        var(--bg);
      color: var(--ink);
      line-height: 1.55;
    }

    a { color: var(--blue); }

    .page {
      width: min(1180px, calc(100% - 32px));
      margin: 0 auto;
      padding: 32px 0 56px;
    }

    .hero {
      display: grid;
      gap: 14px;
      padding: 28px;
      border: 1px solid rgba(184, 132, 36, 0.25);
      border-radius: 10px;
      background: rgba(255, 253, 248, 0.88);
      box-shadow: var(--shadow);
    }

    .eyebrow,
    .section-kicker {
      color: var(--gold);
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0;
      text-transform: uppercase;
    }

    h1,
    h2,
    p {
      margin: 0;
    }

    h1 {
      font-size: clamp(28px, 4vw, 44px);
      letter-spacing: 0;
      line-height: 1.1;
    }

    .hero p {
      max-width: 860px;
      color: var(--muted);
      font-size: 16px;
    }

    .hero-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 6px;
    }

    .button {
      display: inline-flex;
      align-items: center;
      min-height: 40px;
      padding: 9px 14px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--surface-strong);
      color: var(--ink);
      font-size: 14px;
      font-weight: 700;
      text-decoration: none;
    }

    .metrics {
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      gap: 12px;
      margin-top: 18px;
    }

    .metric {
      min-height: 108px;
      padding: 16px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--surface);
    }

    .metric span,
    .metric small {
      display: block;
      color: var(--muted);
      font-size: 13px;
    }

    .metric strong {
      display: block;
      margin: 6px 0;
      font-size: 30px;
      line-height: 1;
    }

    .metric.danger { border-color: rgba(180, 35, 24, 0.28); background: var(--red-soft); }
    .metric.warn { border-color: rgba(184, 132, 36, 0.35); background: var(--gold-soft); }
    .metric.done { border-color: rgba(6, 118, 71, 0.22); background: var(--green-soft); }

    .controls {
      position: sticky;
      top: 0;
      z-index: 10;
      display: grid;
      grid-template-columns: minmax(220px, 1fr) 170px 170px 170px;
      gap: 10px;
      margin: 18px 0;
      padding: 12px;
      border: 1px solid var(--line);
      border-radius: 10px;
      background: rgba(255, 253, 248, 0.94);
      backdrop-filter: blur(8px);
      box-shadow: 0 10px 30px rgba(46, 36, 20, 0.07);
    }

    input,
    select {
      width: 100%;
      min-height: 42px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #ffffff;
      color: var(--ink);
      font: inherit;
      padding: 9px 11px;
    }

    .task-section {
      margin-top: 16px;
      padding: 18px;
      border: 1px solid var(--line);
      border-radius: 10px;
      background: rgba(255, 253, 248, 0.72);
    }

    .task-section > header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 12px;
    }

    .task-section h2 {
      font-size: 21px;
      letter-spacing: 0;
    }

    .task-section > header > strong {
      min-width: 38px;
      padding: 4px 10px;
      border-radius: 999px;
      background: var(--ink);
      color: #fff;
      text-align: center;
      font-size: 14px;
    }

    .task-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }

    .task-card {
      display: grid;
      gap: 12px;
      padding: 16px;
      border: 1px solid var(--line);
      border-left-width: 4px;
      border-radius: 8px;
      background: var(--surface-strong);
      box-shadow: 0 6px 20px rgba(46, 36, 20, 0.05);
    }

    .task-card[hidden],
    .task-section[hidden] {
      display: none;
    }

    .priority-p0 { border-left-color: var(--red); }
    .priority-p1 { border-left-color: var(--gold); }
    .priority-p2 { border-left-color: var(--blue); }
    .priority-p3 { border-left-color: var(--muted); }

    .task-card__top {
      display: flex;
      justify-content: space-between;
      gap: 14px;
    }

    .task-card__top strong {
      display: block;
      font-size: 13px;
      color: var(--muted);
    }

    .task-card__top p {
      margin-top: 4px;
      font-size: 16px;
      font-weight: 800;
      line-height: 1.35;
      word-break: keep-all;
    }

    .priority {
      align-self: flex-start;
      min-width: 42px;
      padding: 5px 8px;
      border-radius: 8px;
      background: var(--ink);
      color: #fff;
      font-size: 12px;
      font-weight: 800;
      text-align: center;
    }

    .badges {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      min-height: 26px;
      padding: 4px 8px;
      border-radius: 999px;
      background: #f2f4f7;
      color: #344054;
      font-size: 12px;
      font-weight: 800;
    }

    .status-blocked { background: var(--red-soft); color: var(--red); }
    .status-user-only { background: var(--violet-soft); color: var(--violet); }
    .status-doing { background: var(--blue-soft); color: var(--blue); }
    .status-todo { background: var(--gold-soft); color: #7a4e09; }
    .status-done { background: var(--green-soft); color: var(--green); }
    .owner-codex { background: #eef4ff; color: #3538cd; }
    .owner-shared { background: #fdf2fa; color: #c11574; }
    .owner-junyoung { background: #ecfdf3; color: #067647; }
    .muted { background: #f2f0eb; color: var(--muted); }

    dl {
      display: grid;
      gap: 10px;
      margin: 0;
    }

    dt {
      margin-bottom: 3px;
      color: var(--muted);
      font-size: 12px;
      font-weight: 800;
    }

    dd {
      margin: 0;
      color: #332c22;
      font-size: 14px;
    }

    code {
      padding: 1px 5px;
      border-radius: 5px;
      background: #f2f0eb;
      color: #2a2218;
      font-family: "Cascadia Code", Consolas, monospace;
      font-size: 0.92em;
    }

    .empty,
    .footer {
      color: var(--muted);
      font-size: 14px;
    }

    .footer {
      margin-top: 20px;
      padding: 16px 4px 0;
    }

    @media (max-width: 920px) {
      .metrics,
      .task-grid,
      .controls {
        grid-template-columns: 1fr;
      }

      .controls {
        position: static;
      }
    }
  </style>
</head>
<body>
  <main class="page">
    <section class="hero">
      <span class="eyebrow">KCG Launch Workbench</span>
      <h1>오픈 준비 TODO 대시보드</h1>
      <p>원본은 <code>docs/setup/OPEN_TASKS.md</code>입니다. 비밀번호, 토큰, 실제 사업자등록번호, 고객 정보는 이 대시보드나 원본 문서에 적지 않습니다.</p>
      <div class="hero-actions">
        <a class="button" href="${sourceUrl}">원본 OPEN_TASKS.md 열기</a>
        <span class="button">생성 시각: ${escapeHtml(generatedAt)}</span>
      </div>
    </section>

    <section class="metrics" aria-label="작업 요약">
      ${renderMetric("전체 작업", String(tasks.length), "OPEN_TASKS 표 기준")}
      ${renderMetric("남은 작업", String(counts.active), "done 제외", "warn")}
      ${renderMetric("P0 오픈 차단", String(counts.p0), "공개 전 반드시 해결", "danger")}
      ${renderMetric("junyoung 직접", String(counts.userOnly), "로그인·승인·실제값 입력", "warn")}
      ${renderMetric("완료", String(counts.done), "검증 기록 포함", "done")}
    </section>

    <section class="controls" aria-label="작업 필터">
      <input id="task-search" type="search" placeholder="검색: 도메인, Supabase, KRX, 상품, /review..." autocomplete="off">
      <select id="status-filter" aria-label="상태 필터">
        ${buildOptions(statusOrder, statusLabels, "모든 상태")}
      </select>
      <select id="priority-filter" aria-label="우선순위 필터">
        ${buildOptions(priorityOrder, priorityLabels, "모든 우선순위")}
      </select>
      <select id="owner-filter" aria-label="담당 필터">
        ${buildOptions(ownerOrder, {}, "모든 담당")}
      </select>
    </section>

    ${statusOrder.map((status) => renderSection(status, tasks)).join("")}

    <p class="footer">
      새로고침 방법: <code>npm run tasks:dashboard</code>를 다시 실행한 뒤 브라우저를 새로고침합니다.
      실제 작업 상태 수정은 원본 <code>docs/setup/OPEN_TASKS.md</code>에서 합니다.
    </p>
  </main>

  <script>
    const cards = Array.from(document.querySelectorAll("[data-card]"));
    const sections = Array.from(document.querySelectorAll("[data-section]"));
    const search = document.querySelector("#task-search");
    const statusFilter = document.querySelector("#status-filter");
    const priorityFilter = document.querySelector("#priority-filter");
    const ownerFilter = document.querySelector("#owner-filter");

    function matches(card) {
      const query = search.value.trim().toLowerCase();
      const status = statusFilter.value;
      const priority = priorityFilter.value;
      const owner = ownerFilter.value;

      return (!query || card.dataset.search.includes(query))
        && (status === "all" || card.dataset.status === status)
        && (priority === "all" || card.dataset.priority === priority)
        && (owner === "all" || card.dataset.owner === owner);
    }

    function applyFilters() {
      for (const card of cards) {
        card.hidden = !matches(card);
      }

      for (const section of sections) {
        const visibleCards = Array.from(section.querySelectorAll("[data-card]")).filter((card) => !card.hidden);
        section.hidden = visibleCards.length === 0;
        const count = section.querySelector("[data-section-count]");
        if (count) count.textContent = String(visibleCards.length);
      }
    }

    search.addEventListener("input", applyFilters);
    statusFilter.addEventListener("change", applyFilters);
    priorityFilter.addEventListener("change", applyFilters);
    ownerFilter.addEventListener("change", applyFilters);
  </script>
</body>
</html>`;
}

const markdown = readFileSync(sourcePath, "utf8");
const tasks = parseTasks(markdown);

if (tasks.length === 0) {
  throw new Error(`No KCG-TODO rows found in ${sourcePath}`);
}

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, renderHtml(tasks));

console.log(`Rendered ${tasks.length} tasks to ${outputPath}`);
