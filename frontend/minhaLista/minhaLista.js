document.addEventListener('DOMContentLoaded', () => {
    function limitarTexto(nodeList, limite = 40) {
        if (!nodeList) return;
        nodeList.forEach(el => {
          const txt = (el.textContent || '').trim();
          if (txt.length > limite) el.textContent = txt.substring(0, limite).trim() + '...';
        });
      }

      function atualizarBreadcrumb(termo) {
        if (!breadcrumb) return;
        breadcrumb.innerHTML = `
          <a href="../home/home.html" class="hover:underline">Home</a>
          <span>/</span>
          <span>Pesquisa</span>
        `;
      }

      
});