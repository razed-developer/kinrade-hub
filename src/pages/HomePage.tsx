export function HomePage() {
  return (
    <main className="home-page">
      <section className="home-hero">
        <p className="home-eyebrow">Personal homepage</p>
        <h1>Useful pages, all in one place.</h1>
        <p>A growing collection of dashboards, references, and small tools I use.</p>
      </section>
      <section className="page-directory" aria-label="Site pages">
        <a className="directory-card" href="/marine/">
          <span>Live dashboard</span>
          <h2>Marine Weather & Tides</h2>
          <p>Vancouver Island forecasts and Canadian tide predictions.</p>
        </a>
        <a className="directory-card" href="/tools/">
          <span>Personal directory</span>
          <h2>Websites, Apps & Tools</h2>
          <p>A searchable catalogue of useful software and services.</p>
        </a>
      </section>
    </main>
  );
}
