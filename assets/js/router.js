/**
 * Sage — Personal Knowledge Website
 * Client-Side Hash Router
 */

(function () {
  'use strict';

  const Router = {
    init: function () {
      window.addEventListener('hashchange', () => this.handleRoute());
      // Handle initial load
      this.handleRoute();
    },

    navigate: function (path) {
      window.location.hash = path;
    },

    handleRoute: function () {
      const rawHash = window.location.hash.slice(1) || '/';
      const [path, fragment] = rawHash.split('#');
      const parts = path.split('/').filter(Boolean);

      // Close mobile sidebar on route change
      const sidebar = document.getElementById('sidebar');
      if (sidebar) sidebar.classList.remove('mobile-open');

      if (parts.length === 0) {
        // Home view
        SAGE.activeSubjectId = null;
        SAGE.activeTopicId = null;
        SAGE.Render.renderHome();
      } else if (parts.length === 1) {
        // Subject view: open first topic of the subject or subject overview
        const subjectId = parts[0];
        const sub = SAGE.getSubject(subjectId);
        if (sub) {
          SAGE.activeSubjectId = subjectId;
          const mods = SAGE.modulesBySubject[subjectId];
          if (mods) {
            const firstModName = Object.keys(mods)[0];
            const firstTopic = mods[firstModName] && mods[firstModName][0];
            if (firstTopic) {
              this.navigate(`/${subjectId}/${firstTopic.id}`);
              return;
            }
          }
          SAGE.Render.renderSubjectOverview(subjectId);
        } else {
          SAGE.Render.renderNotFound();
        }
      } else {
        // Topic view: /subject/topic-id
        const subjectId = parts[0];
        const topicId = parts[1];
        const topic = SAGE.getTopic(topicId);

        if (topic) {
          SAGE.activeSubjectId = subjectId;
          SAGE.activeTopicId = topicId;
          SAGE.Store.addRecent(topicId);
          SAGE.Render.renderTopic(topic, fragment);
        } else {
          SAGE.Render.renderNotFound();
        }
      }

      // Update sidebar
      SAGE.Render.updateSidebar();
      SAGE.Store.updateBookmarkUI();
      SAGE.Store.updateCompletedUI();
    }
  };

  SAGE.Router = Router;

  document.addEventListener('DOMContentLoaded', function () {
    Router.init();
  });

})();
