/**
 * Sage — Personal Knowledge Website
 * UI Rendering Engine
 */

(function () {
  'use strict';

  const Render = {
    mainContainer: null,
    sidebarContainer: null,
    tocContainer: null,

    init: function () {
      this.mainContainer = document.getElementById('main-content-area');
      this.sidebarContainer = document.getElementById('sidebar-nav-container');
      this.tocContainer = document.getElementById('toc-container');
    },

    // ------------------------------------------------------------------------
    // Homepage View
    // ------------------------------------------------------------------------
    renderHome: function () {
      if (!this.mainContainer) return;
      if (this.tocContainer) this.tocContainer.style.display = 'none';

      const recentIds = SAGE.Store.getRecent();
      const recentTopics = recentIds.map(id => SAGE.getTopic(id)).filter(Boolean);
      const bookmarks = SAGE.Store.getBookmarks().map(id => SAGE.getTopic(id)).filter(Boolean);

      let continueHtml = '';
      if (recentTopics.length > 0) {
        const lastTopic = recentTopics[0];
        const sub = SAGE.getSubject(lastTopic.subject);
        continueHtml = `
          <div style="background-color: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 1.25rem 1.5rem; margin-bottom: 2rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; box-shadow: var(--shadow-sm);">
            <div>
              <div style="font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: var(--accent); margin-bottom: 0.25rem;">Continue Studying</div>
              <div style="font-size: 1.15rem; font-weight: 600; color: var(--text-primary);">${lastTopic.title}</div>
              <div style="font-size: 0.85rem; color: var(--text-secondary);">${sub ? sub.name : ''} &middot; ${lastTopic.module}</div>
            </div>
            <button class="btn-action-pill active" onclick="SAGE.Router.navigate('/${lastTopic.subject}/${lastTopic.id}')" style="padding: 0.5rem 1.1rem; font-size: 0.88rem;">
              Resume &rarr;
            </button>
          </div>
        `;
      }

      // Subject directory cards
      const subjectCardsHtml = SAGE.subjects.map(sub => {
        const mods = SAGE.modulesBySubject[sub.id] || {};
        let topicCount = 0;
        for (const m in mods) topicCount += mods[m].length;
        const modCount = Object.keys(mods).length;

        return `
          <div class="subject-card" onclick="SAGE.Router.navigate('/${sub.id}')">
            <div>
              <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">${sub.icon || '📘'}</div>
              <div class="subject-card-title">${sub.name}</div>
              <div class="subject-card-desc">${sub.description}</div>
            </div>
            <div class="subject-card-footer">
              <span>${modCount} Modules &middot; ${topicCount} Topics</span>
              <span>Open &rarr;</span>
            </div>
          </div>
        `;
      }).join('');

      let recentSectionHtml = '';
      if (recentTopics.length > 1) {
        recentSectionHtml = `
          <div style="margin-bottom: 2.5rem;">
            <div class="home-section-title">Recently Visited</div>
            <div style="display: flex; flex-wrap: wrap; gap: 0.6rem;">
              ${recentTopics.slice(1, 6).map(t => `
                <a href="#/${t.subject}/${t.id}" class="btn-action-pill" style="font-size: 0.85rem;">
                  <span>${t.title}</span>
                </a>
              `).join('')}
            </div>
          </div>
        `;
      }

      this.mainContainer.innerHTML = `
        <div class="home-hero">
          <span class="home-badge">Personal Knowledge Base</span>
          <h1 class="home-hero-title">Sage</h1>
          <p class="home-hero-lead">
            A permanent reference system and self-paced technical curriculum. Pure educational content, verified code examples, step-by-step explanations, and interactive practice.
          </p>
        </div>

        ${continueHtml}
        ${recentSectionHtml}

        <div class="home-section-title">Core Disciplines</div>
        <div class="subject-grid">
          ${subjectCardsHtml}
        </div>
      `;

      window.scrollTo(0, 0);
    },

    // ------------------------------------------------------------------------
    // Subject Overview View
    // ------------------------------------------------------------------------
    renderSubjectOverview: function (subjectId) {
      if (!this.mainContainer) return;
      if (this.tocContainer) this.tocContainer.style.display = 'none';

      const sub = SAGE.getSubject(subjectId);
      if (!sub) return this.renderNotFound();

      const mods = SAGE.modulesBySubject[subjectId] || {};
      
      let modulesListHtml = '';
      for (const modName in mods) {
        const topics = mods[modName];
        modulesListHtml += `
          <div style="margin-bottom: 2rem; background-color: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 1.5rem;">
            <h3 style="font-size: 1.15rem; font-weight: 600; margin-bottom: 1rem; color: var(--text-primary); border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.5rem;">
              ${modName}
            </h3>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
              ${topics.map(t => {
                const isC = SAGE.Store.isCompleted(t.id);
                return `
                  <a href="#/${subjectId}/${t.id}" style="display: flex; align-items: center; justify-content: space-between; padding: 0.6rem 0.8rem; border-radius: var(--radius-md); background-color: var(--bg-subtle); color: var(--text-primary);">
                    <div>
                      <strong style="font-size: 0.95rem;">${t.title}</strong>
                      <div style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 0.15rem;">${t.description}</div>
                    </div>
                    <span style="font-size: 0.8rem; color: ${isC ? '#16a34a' : 'var(--accent)'}; font-weight: 600;">
                      ${isC ? '✓ Mastered' : 'Study &rarr;'}
                    </span>
                  </a>
                `;
              }).join('')}
            </div>
          </div>
        `;
      }

      this.mainContainer.innerHTML = `
        <div class="breadcrumbs">
          <a href="#/">Home</a>
          <span class="breadcrumb-sep">/</span>
          <span>${sub.name}</span>
        </div>

        <div class="topic-header">
          <div class="topic-meta-row">
            <span class="meta-badge">${sub.name}</span>
          </div>
          <h1 class="topic-title">${sub.title || sub.name}</h1>
          <p class="topic-summary-lead">${sub.description}</p>
        </div>

        <div class="home-section-title">Modules & Topics</div>
        ${modulesListHtml}
      `;

      window.scrollTo(0, 0);
    },

    // ------------------------------------------------------------------------
    // Standard Topic View
    // ------------------------------------------------------------------------
    renderTopic: function (topic, fragment) {
      if (!this.mainContainer) return;
      if (this.tocContainer) this.tocContainer.style.display = 'block';

      const sub = SAGE.getSubject(topic.subject);
      const subName = sub ? sub.name : topic.subject;
      const isBookmarked = SAGE.Store.isBookmarked(topic.id);
      const isCompleted = SAGE.Store.isCompleted(topic.id);

      // Diff class
      const diffClass = topic.difficulty ? `diff-${topic.difficulty.toLowerCase()}` : 'diff-beginner';

      // 1. Overview Section
      let overviewHtml = '';
      if (topic.overview) {
        overviewHtml = `
          <section id="overview" class="topic-section">
            <h2 class="section-heading"><span class="section-heading-number">A.</span> Overview</h2>
            <div class="overview-card">
              <div class="overview-definition">${topic.overview.definition}</div>
              ${topic.overview.mentalModel ? `
                <div class="overview-mental-model">
                  <div class="mental-model-title">Mental Model & Memory Representation</div>
                  <div>${topic.overview.mentalModel}</div>
                </div>
              ` : ''}
            </div>
          </section>
        `;
      }

      // 2. Key Terminology Section
      let terminologyHtml = '';
      if (topic.terminology && topic.terminology.length > 0) {
        terminologyHtml = `
          <section id="terminology" class="topic-section">
            <h2 class="section-heading"><span class="section-heading-number">B.</span> Key Terminology</h2>
            <div class="terminology-grid">
              ${topic.terminology.map(t => `
                <div class="term-item">
                  <div class="term-header">
                    <span class="term-badge">${t.term}</span>
                  </div>
                  <div class="term-meaning">${t.definition}</div>
                </div>
              `).join('')}
            </div>
          </section>
        `;
      }

      // 3. Explanation Section
      let explanationHtml = '';
      if (topic.explanation && topic.explanation.length > 0) {
        explanationHtml = `
          <section id="explanation" class="topic-section">
            <h2 class="section-heading"><span class="section-heading-number">C.</span> In-Depth Explanation</h2>
            ${topic.explanation.map(exp => `
              <div class="prose-block">
                <h3 class="prose-subheading">${exp.heading}</h3>
                <div class="prose-text">${exp.content}</div>
              </div>
            `).join('')}
          </section>
        `;
      }

      // 4. Syntax & Structure Section
      let syntaxHtml = '';
      if (topic.syntax) {
        syntaxHtml = `
          <section id="syntax" class="topic-section">
            <h2 class="section-heading"><span class="section-heading-number">D.</span> Syntax & Structure</h2>
            <div class="syntax-container">
              <div class="syntax-header">Syntax Pattern</div>
              <div class="syntax-code">${this.escapeHtml(topic.syntax.pattern)}</div>
              ${topic.syntax.components && topic.syntax.components.length > 0 ? `
                <div class="syntax-breakdown">
                  ${topic.syntax.components.map(c => `
                    <div class="syntax-part-item">
                      <code class="syntax-part-code">${this.escapeHtml(c.part)}</code>
                      <span class="syntax-part-desc">${c.meaning}</span>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          </section>
        `;
      }

      // 5. Code Examples Section
      let examplesHtml = '';
      if (topic.examples && topic.examples.length > 0) {
        examplesHtml = `
          <section id="examples" class="topic-section">
            <h2 class="section-heading"><span class="section-heading-number">E.</span> Code Examples</h2>
            ${topic.examples.map((ex, idx) => `
              <div class="example-card">
                <div class="example-card-header">
                  <span class="example-title">${ex.title}</span>
                  ${ex.description ? `<span style="font-size: 0.8rem; color: var(--text-muted);">${ex.description}</span>` : ''}
                </div>
                <div class="code-wrapper">
                  <div class="code-toolbar">
                    <button class="btn-copy-code" onclick="SAGE.Render.copyCode(this)">Copy</button>
                  </div>
                  <pre class="code-body"><code>${this.escapeHtml(ex.code)}</code></pre>
                </div>
                ${ex.output ? `
                  <div class="output-block">
                    <div class="output-header">Expected Output</div>
                    <div class="output-content">${this.escapeHtml(ex.output)}</div>
                  </div>
                ` : ''}
                ${ex.explanation && ex.explanation.length > 0 ? `
                  <div class="execution-walkthrough">
                    <div class="walkthrough-title">Step-by-Step Execution</div>
                    <ol class="walkthrough-list">
                      ${ex.explanation.map(item => `<li>${item}</li>`).join('')}
                    </ol>
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </section>
        `;
      }

      // 6. Important Notes Section
      let notesHtml = '';
      if (topic.notes && topic.notes.length > 0) {
        notesHtml = `
          <section id="notes" class="topic-section">
            <h2 class="section-heading"><span class="section-heading-number">F.</span> Important Notes & Gotchas</h2>
            ${topic.notes.map(n => {
              const calloutType = n.type === 'warning' ? 'callout-warn' : (n.type === 'tip' ? 'callout-tip' : 'callout-info');
              const icon = n.type === 'warning' ? '⚠️' : (n.type === 'tip' ? '💡' : 'ℹ️');
              return `
                <div class="callout ${calloutType}">
                  <div class="callout-title">${icon} ${n.title}</div>
                  <div>${n.body}</div>
                </div>
              `;
            }).join('')}
          </section>
        `;
      }

      // 7. Common Mistakes Section
      let mistakesHtml = '';
      if (topic.commonMistakes && topic.commonMistakes.length > 0) {
        mistakesHtml = `
          <section id="mistakes" class="topic-section">
            <h2 class="section-heading"><span class="section-heading-number">G.</span> Common Mistakes</h2>
            ${topic.commonMistakes.map(m => `
              <div class="mistake-card">
                <div class="mistake-title">${m.mistake}</div>
                <div class="mistake-comparison-grid">
                  <div class="mistake-col incorrect">
                    <div class="mistake-col-header">&#x2715; Incorrect Approach</div>
                    <pre class="mistake-code"><code>${this.escapeHtml(m.incorrectCode)}</code></pre>
                  </div>
                  <div class="mistake-col correct">
                    <div class="mistake-col-header">&#x2713; Correct Approach</div>
                    <pre class="mistake-code"><code>${this.escapeHtml(m.correctCode)}</code></pre>
                  </div>
                </div>
                <div class="mistake-why">
                  <strong>Why this matters:</strong> ${m.why}
                </div>
              </div>
            `).join('')}
          </section>
        `;
      }

      // 8. Comparisons Section
      let comparisonsHtml = '';
      if (topic.comparisons && topic.comparisons.length > 0) {
        comparisonsHtml = `
          <section id="comparisons" class="topic-section">
            <h2 class="section-heading"><span class="section-heading-number">H.</span> Concept Comparisons</h2>
            ${topic.comparisons.map(comp => `
              <div style="margin-bottom: 1.5rem;">
                <h4 style="font-size: 1rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.5rem;">${comp.title}</h4>
                <div class="table-wrapper">
                  <table class="comparison-table">
                    <thead>
                      <tr>
                        ${comp.headers.map(h => `<th>${h}</th>`).join('')}
                      </tr>
                    </thead>
                    <tbody>
                      ${comp.rows.map(row => `
                        <tr>
                          ${row.map(cell => `<td>${cell}</td>`).join('')}
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
            `).join('')}
          </section>
        `;
      }

      // 9. Questions & Answers Section
      let qaHtml = '';
      if (topic.questions && topic.questions.length > 0) {
        qaHtml = `
          <section id="questions" class="topic-section">
            <h2 class="section-heading"><span class="section-heading-number">I.</span> Test Your Knowledge</h2>
            <div style="margin-bottom: 1rem; font-size: 0.9rem; color: var(--text-secondary);">
              Review the questions below. Think through your answer before revealing the explanation.
            </div>
            ${topic.questions.map((q, idx) => `
              <div class="qa-item" id="qa-${idx}">
                <button class="qa-trigger" onclick="this.parentElement.classList.toggle('open')">
                  <span>${idx + 1}. ${q.question}</span>
                  <span class="qa-chevron">&#x25BC;</span>
                </button>
                <div class="qa-body">
                  <div class="qa-answer-tag">Answer: ${q.answer}</div>
                  <div>${q.explanation}</div>
                </div>
              </div>
            `).join('')}
          </section>
        `;
      }

      // 10. Practice Exercises Section
      let practiceHtml = '';
      if (topic.practice && topic.practice.length > 0) {
        practiceHtml = `
          <section id="practice" class="topic-section">
            <h2 class="section-heading"><span class="section-heading-number">J.</span> Practice Exercises</h2>
            ${topic.practice.map((p, idx) => `
              <div class="practice-card" id="practice-${idx}">
                <div class="practice-header">
                  <span class="practice-title">Exercise ${idx + 1}: ${p.title}</span>
                  <span class="meta-badge diff-${(p.difficulty || 'beginner').toLowerCase()}">${p.difficulty || 'Beginner'}</span>
                </div>
                <div class="practice-prompt">${p.prompt}</div>
                ${p.starterCode ? `
                  <div class="code-wrapper" style="margin-bottom: 1rem; border: 1px solid var(--border-subtle); border-radius: var(--radius-md);">
                    <pre class="code-body"><code>${this.escapeHtml(p.starterCode)}</code></pre>
                  </div>
                ` : ''}
                <button class="practice-solution-toggle" onclick="this.parentElement.classList.toggle('show-solution')">
                  <span>Reveal Solution &amp; Walkthrough</span>
                </button>
                <div class="practice-solution-body">
                  <div class="code-wrapper" style="border: 1px solid var(--border-subtle); border-radius: var(--radius-md); margin-bottom: 0.75rem;">
                    <div class="code-toolbar">
                      <button class="btn-copy-code" onclick="SAGE.Render.copyCode(this)">Copy Solution</button>
                    </div>
                    <pre class="code-body"><code>${this.escapeHtml(p.solution)}</code></pre>
                  </div>
                  <div style="font-size: 0.9rem; line-height: 1.6; color: var(--text-secondary);">
                    <strong>Solution Walkthrough:</strong> ${p.explanation}
                  </div>
                </div>
              </div>
            `).join('')}
          </section>
        `;
      }

      // 11. References Section
      let referencesHtml = '';
      if (topic.references && topic.references.length > 0) {
        referencesHtml = `
          <section id="references" class="topic-section">
            <h2 class="section-heading"><span class="section-heading-number">K.</span> Supplementary References</h2>
            <div class="ref-list">
              ${topic.references.map(r => `
                <div class="ref-item">
                  <a href="${r.url}" target="_blank" rel="noopener" class="ref-title-link">
                    ${r.title} &nearr;
                  </a>
                  <span class="ref-type-tag">${r.type}</span>
                </div>
              `).join('')}
            </div>
          </section>
        `;
      }

      // Prev / Next Navigation Footer
      const navFooterHtml = this.getTopicNavFooter(topic);

      this.mainContainer.innerHTML = `
        <div class="breadcrumbs">
          <a href="#/">Home</a>
          <span class="breadcrumb-sep">/</span>
          <a href="#/${topic.subject}">${subName}</a>
          <span class="breadcrumb-sep">/</span>
          <span>${topic.module}</span>
          <span class="breadcrumb-sep">/</span>
          <span>${topic.title}</span>
        </div>

        <div class="topic-header">
          <div class="topic-meta-row">
            <span class="meta-badge">${subName}</span>
            <span class="meta-badge ${diffClass}">${topic.difficulty || 'Beginner'}</span>
            <span class="meta-read-time">${topic.readTime || '10 min read'}</span>
          </div>
          <div class="topic-title-row">
            <h1 class="topic-title">${topic.title}</h1>
            <div class="topic-actions">
              <button class="btn-action-pill btn-bookmark-topic ${isBookmarked ? 'active' : ''}" onclick="SAGE.Store.toggleBookmark('${topic.id}')">
                ${isBookmarked ? '★ Bookmarked' : '☆ Bookmark'}
              </button>
              <button class="btn-action-pill btn-complete-topic ${isCompleted ? 'active' : ''}" onclick="SAGE.Store.toggleCompleted('${topic.id}')">
                ${isCompleted ? '✓ Mastered' : '○ Mark as Mastered'}
              </button>
            </div>
          </div>
          <p class="topic-summary-lead">${topic.description}</p>
        </div>

        ${overviewHtml}
        ${terminologyHtml}
        ${explanationHtml}
        ${syntaxHtml}
        ${examplesHtml}
        ${notesHtml}
        ${mistakesHtml}
        ${comparisonsHtml}
        ${qaHtml}
        ${practiceHtml}
        ${referencesHtml}

        ${navFooterHtml}
      `;

      // Render right-side table of contents
      this.renderToc(topic);

      // Handle anchor scrolling
      if (fragment) {
        setTimeout(() => {
          const el = document.getElementById(fragment);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 50);
      } else {
        window.scrollTo(0, 0);
      }
    },

    // ------------------------------------------------------------------------
    // Prev / Next Navigation Footer
    // ------------------------------------------------------------------------
    getTopicNavFooter: function (topic) {
      const mods = SAGE.modulesBySubject[topic.subject] || {};
      const allTopicsInSub = [];
      for (const m in mods) {
        allTopicsInSub.push(...mods[m]);
      }

      const idx = allTopicsInSub.findIndex(t => t.id === topic.id);
      const prevTopic = idx > 0 ? allTopicsInSub[idx - 1] : null;
      const nextTopic = idx < allTopicsInSub.length - 1 ? allTopicsInSub[idx + 1] : null;

      return `
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-top: 4rem; padding-top: 2rem; border-top: 1px solid var(--border-subtle);">
          ${prevTopic ? `
            <a href="#/${prevTopic.subject}/${prevTopic.id}" class="btn-action-pill" style="padding: 0.6rem 1rem;">
              &larr; Previous: ${prevTopic.title}
            </a>
          ` : '<div></div>'}
          ${nextTopic ? `
            <a href="#/${nextTopic.subject}/${nextTopic.id}" class="btn-action-pill active" style="padding: 0.6rem 1rem;">
              Next: ${nextTopic.title} &rarr;
            </a>
          ` : '<div></div>'}
        </div>
      `;
    },

    // ------------------------------------------------------------------------
    // Right-Side Table of Contents (On This Page)
    // ------------------------------------------------------------------------
    renderToc: function (topic) {
      if (!this.tocContainer) return;

      const sections = [
        { id: 'overview', title: 'Overview' },
        { id: 'terminology', title: 'Key Terminology' },
        { id: 'explanation', title: 'Explanation' },
        { id: 'syntax', title: 'Syntax & Structure' },
        { id: 'examples', title: 'Code Examples' },
        { id: 'notes', title: 'Important Notes' },
        { id: 'mistakes', title: 'Common Mistakes' },
        { id: 'comparisons', title: 'Comparisons' },
        { id: 'questions', title: 'Q&A Check' },
        { id: 'practice', title: 'Practice Exercises' },
        { id: 'references', title: 'References' }
      ].filter(s => document.getElementById(s.id));

      if (sections.length === 0) {
        this.tocContainer.style.display = 'none';
        return;
      }

      this.tocContainer.style.display = 'block';
      this.tocContainer.innerHTML = `
        <div class="toc-title">On This Page</div>
        <ul class="toc-list">
          ${sections.map(s => `
            <li>
              <a href="#/${topic.subject}/${topic.id}#${s.id}" class="toc-link" data-target="${s.id}">
                ${s.title}
              </a>
            </li>
          `).join('')}
        </ul>
      `;

      // Set up scrollspy
      this.setupScrollSpy(sections.map(s => s.id));
    },

    setupScrollSpy: function (sectionIds) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            document.querySelectorAll('.toc-link').forEach(link => {
              link.classList.toggle('active', link.dataset.target === id);
            });
          }
        });
      }, { rootMargin: '-20% 0px -70% 0px' });

      sectionIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
      });
    },

    // ------------------------------------------------------------------------
    // Sidebar Navigation
    // ------------------------------------------------------------------------
    updateSidebar: function () {
      if (!this.sidebarContainer) return;

      const currentSubId = SAGE.activeSubjectId || (SAGE.subjects[0] ? SAGE.subjects[0].id : null);
      if (!currentSubId) return;

      const currentTopicId = SAGE.activeTopicId;

      // Subject select options
      const selectorHtml = `
        <div class="sidebar-header">
          <label class="subject-select-label">Subject</label>
          <select class="subject-selector" onchange="SAGE.Router.navigate('/' + this.value)">
            ${SAGE.subjects.map(s => `
              <option value="${s.id}" ${s.id === currentSubId ? 'selected' : ''}>
                ${s.icon || '📘'} ${s.name}
              </option>
            `).join('')}
          </select>
        </div>
      `;

      // Module and topic tree
      const mods = SAGE.modulesBySubject[currentSubId] || {};
      let modulesNavHtml = '';

      for (const modName in mods) {
        const topics = mods[modName];
        modulesNavHtml += `
          <div class="nav-module-group">
            <div class="nav-module-title">${modName}</div>
            <ul class="nav-topic-list">
              ${topics.map(t => {
                const isActive = t.id === currentTopicId;
                const isC = SAGE.Store.isCompleted(t.id);
                return `
                  <li class="nav-topic-item">
                    <a href="#/${t.subject}/${t.id}" class="nav-topic-link ${isActive ? 'active' : ''}">
                      <span class="nav-topic-title-text">${t.title}</span>
                      <span class="nav-topic-status ${isC ? 'completed' : ''}" data-topic-id="${t.id}">
                        ${isC ? '✓' : ''}
                      </span>
                    </a>
                  </li>
                `;
              }).join('')}
            </ul>
          </div>
        `;
      }

      this.sidebarContainer.innerHTML = selectorHtml + `
        <nav class="sidebar-nav">
          <div style="margin-bottom: 1rem; padding: 0 0.5rem;">
            <a href="#/" class="nav-topic-link" style="font-weight: 600;">
              <span>&larr; Subject Directory</span>
            </a>
          </div>
          ${modulesNavHtml}
        </nav>
      `;
    },

    // ------------------------------------------------------------------------
    // Bookmarks Modal
    // ------------------------------------------------------------------------
    openBookmarksModal: function () {
      const bModal = document.getElementById('bookmarks-modal');
      const bList = document.getElementById('bookmarks-list');
      if (!bModal || !bList) return;

      const bookmarkedIds = SAGE.Store.getBookmarks();
      const topics = bookmarkedIds.map(id => SAGE.getTopic(id)).filter(Boolean);

      if (topics.length === 0) {
        bList.innerHTML = `
          <div style="padding: 2.5rem; text-align: center; color: var(--text-muted); font-size: 0.95rem;">
            No bookmarked topics yet.<br>Click "☆ Bookmark" on any topic page to save it for quick reference.
          </div>
        `;
      } else {
        bList.innerHTML = topics.map(t => {
          const sub = SAGE.getSubject(t.subject);
          return `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; border-bottom: 1px solid var(--border-subtle);">
              <div onclick="SAGE.Router.navigate('/${t.subject}/${t.id}'); document.getElementById('bookmarks-modal').classList.remove('open');" style="cursor: pointer; flex: 1;">
                <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--accent); font-weight: 600;">${sub ? sub.name : ''} &middot; ${t.module}</div>
                <div style="font-weight: 600; font-size: 0.95rem; color: var(--text-primary);">${t.title}</div>
              </div>
              <button class="btn-icon" onclick="SAGE.Store.toggleBookmark('${t.id}'); SAGE.Render.openBookmarksModal();" title="Remove bookmark">
                &times;
              </button>
            </div>
          `;
        }).join('');
      }

      bModal.classList.add('open');
    },

    // ------------------------------------------------------------------------
    // Utilities
    // ------------------------------------------------------------------------
    copyCode: function (button) {
      const pre = button.closest('.code-wrapper').querySelector('pre');
      if (!pre) return;
      const text = pre.innerText;
      navigator.clipboard.writeText(text).then(() => {
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.style.color = '#16a34a';
        setTimeout(() => {
          button.textContent = originalText;
          button.style.color = '';
        }, 1800);
      });
    },

    escapeHtml: function (str) {
      if (!str) return '';
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    },

    renderNotFound: function () {
      if (!this.mainContainer) return;
      this.mainContainer.innerHTML = `
        <div style="text-align: center; padding: 6rem 2rem;">
          <h1 style="font-size: 3rem; font-weight: 800; color: var(--text-primary); margin-bottom: 1rem;">404</h1>
          <p style="font-size: 1.15rem; color: var(--text-secondary); margin-bottom: 2rem;">
            The requested topic or subject could not be found.
          </p>
          <a href="#/" class="btn-action-pill active" style="display: inline-block; padding: 0.6rem 1.5rem; font-size: 0.95rem;">
            &larr; Return to Homepage
          </a>
        </div>
      `;
    }
  };

  SAGE.Render = Render;

  document.addEventListener('DOMContentLoaded', function () {
    Render.init();
  });

})();
