/**
 * Sage — Personal Knowledge Website
 * Client-Side Full-Text Search Engine with Fuzzy Normalization
 */

(function () {
  'use strict';

  const Search = {
    modalEl: null,
    inputEl: null,
    resultsEl: null,
    selectedIndex: 0,
    currentResults: [],

    init: function () {
      this.modalEl = document.getElementById('search-modal-backdrop');
      this.inputEl = document.getElementById('global-search-input');
      this.resultsEl = document.getElementById('search-results-list');

      if (this.inputEl) {
        this.inputEl.addEventListener('input', (e) => this.performSearch(e.target.value));
        this.inputEl.addEventListener('keydown', (e) => this.handleKeydown(e));
      }

      if (this.modalEl) {
        this.modalEl.addEventListener('click', (e) => {
          if (e.target === this.modalEl) {
            this.closeModal();
          }
        });
      }

      // Trigger buttons
      document.querySelectorAll('.search-trigger-btn').forEach(btn => {
        btn.addEventListener('click', () => this.openModal());
      });
    },

    openModal: function () {
      if (!this.modalEl) return;
      this.modalEl.classList.add('open');
      if (this.inputEl) {
        this.inputEl.value = '';
        this.inputEl.focus();
        this.performSearch('');
      }
    },

    closeModal: function () {
      if (!this.modalEl) return;
      this.modalEl.classList.remove('open');
    },

    performSearch: function (query) {
      const q = query.trim().toLowerCase();
      const qClean = q.replace(/[^a-z0-9]/g, '');
      this.selectedIndex = 0;
      this.currentResults = [];

      if (!q) {
        // Show recent topics if any, or suggested topics
        const recent = SAGE.Store.getRecent();
        const results = [];
        recent.forEach(id => {
          const t = SAGE.getTopic(id);
          if (t) results.push({ topic: t, matchType: 'Recent', snippet: t.description });
        });

        if (results.length === 0) {
          // Show first few topics from python
          Object.values(SAGE.topics).slice(0, 6).forEach(t => {
            results.push({ topic: t, matchType: 'Suggested', snippet: t.description });
          });
        }

        this.currentResults = results;
        this.renderResults(q);
        return;
      }

      // Search across all registered topics
      const matches = [];

      const matchesText = (target) => {
        if (!target) return false;
        const low = target.toLowerCase();
        if (low.includes(q)) return true;
        if (qClean && qClean.length > 2 && low.replace(/[^a-z0-9]/g, '').includes(qClean)) return true;
        return false;
      };

      for (const id in SAGE.topics) {
        const topic = SAGE.topics[id];
        let score = 0;
        let matchSnippet = '';
        let matchType = '';

        // Match Title
        if (matchesText(topic.title)) {
          score += 50;
          matchType = 'Title Match';
          matchSnippet = topic.description;
        }

        // Match Subject
        if (matchesText(topic.subject)) {
          score += 20;
          if (!matchType) {
            matchType = 'Subject';
            matchSnippet = topic.description;
          }
        }

        // Match Terminology
        if (topic.terminology) {
          for (const item of topic.terminology) {
            if (matchesText(item.term)) {
              score += 35;
              if (!matchType) matchType = `Term: ${item.term}`;
              matchSnippet = `${item.term} — ${item.definition}`;
              break;
            } else if (matchesText(item.definition)) {
              score += 15;
              if (!matchType) matchType = `Terminology`;
              matchSnippet = `${item.term} — ${item.definition}`;
              break;
            }
          }
        }

        // Match Overview / Definition
        if (topic.overview && matchesText(topic.overview.definition)) {
          score += 25;
          if (!matchType) {
            matchType = 'Definition';
            matchSnippet = topic.overview.definition;
          }
        }

        // Match Explanation
        if (topic.explanation) {
          for (const exp of topic.explanation) {
            if (matchesText(exp.content)) {
              score += 10;
              if (!matchType) {
                matchType = exp.heading;
                matchSnippet = this.extractSnippet(exp.content, q);
              }
              break;
            }
          }
        }

        if (score > 0) {
          matches.push({
            topic,
            score,
            matchType: matchType || 'Content',
            snippet: matchSnippet || topic.description
          });
        }
      }

      // Sort by relevance score
      matches.sort((a, b) => b.score - a.score);
      this.currentResults = matches.slice(0, 15);
      this.renderResults(q);
    },

    extractSnippet: function (text, query) {
      const idx = text.toLowerCase().indexOf(query.toLowerCase());
      if (idx === -1) return text.slice(0, 120) + '...';
      const start = Math.max(0, idx - 40);
      const end = Math.min(text.length, idx + query.length + 80);
      return (start > 0 ? '...' : '') + text.slice(start, end) + (end < text.length ? '...' : '');
    },

    highlightQuery: function (text, query) {
      if (!query || !text) return text;
      const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      return text.replace(regex, '<mark style="background-color: var(--accent-light); color: var(--accent); font-weight: 600; padding: 0 2px; border-radius: 2px;">$1</mark>');
    },

    renderResults: function (query) {
      if (!this.resultsEl) return;

      if (this.currentResults.length === 0) {
        this.resultsEl.innerHTML = `
          <div style="padding: 2rem; text-align: center; color: var(--text-muted); font-size: 0.9rem;">
            No topics found matching "<strong>${query}</strong>". Try searching for <em>lists</em>, <em>loops</em>, <em>functions</em>, or <em>indexing</em>.
          </div>
        `;
        return;
      }

      const html = this.currentResults.map((res, index) => {
        const isSelected = index === this.selectedIndex;
        const sub = SAGE.getSubject(res.topic.subject);
        const subName = sub ? sub.name : res.topic.subject;
        const highlightedTitle = this.highlightQuery(res.topic.title, query);
        const highlightedSnippet = this.highlightQuery(res.snippet, query);

        return `
          <li class="search-result-item ${isSelected ? 'selected' : ''}" data-index="${index}" onclick="SAGE.Search.selectItem(${index})">
            <div class="search-res-top">
              <span class="search-res-subject">${subName} &middot; ${res.matchType}</span>
            </div>
            <div class="search-res-title">${highlightedTitle}</div>
            <div class="search-res-snippet">${highlightedSnippet}</div>
          </li>
        `;
      }).join('');

      this.resultsEl.innerHTML = html;
    },

    handleKeydown: function (e) {
      if (this.currentResults.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.selectedIndex = (this.selectedIndex + 1) % this.currentResults.length;
        this.updateSelection();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.selectedIndex = (this.selectedIndex - 1 + this.currentResults.length) % this.currentResults.length;
        this.updateSelection();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        this.selectItem(this.selectedIndex);
      }
    },

    updateSelection: function () {
      const items = this.resultsEl.querySelectorAll('.search-result-item');
      items.forEach((item, idx) => {
        item.classList.toggle('selected', idx === this.selectedIndex);
        if (idx === this.selectedIndex) {
          item.scrollIntoView({ block: 'nearest' });
        }
      });
    },

    selectItem: function (index) {
      const selected = this.currentResults[index];
      if (selected && selected.topic) {
        this.closeModal();
        SAGE.Router.navigate(`/${selected.topic.subject}/${selected.topic.id}`);
      }
    }
  };

  SAGE.Search = Search;

  document.addEventListener('DOMContentLoaded', function () {
    Search.init();
  });

})();
