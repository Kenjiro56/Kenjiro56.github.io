import { Works } from './components/Works';
import { Logs } from './components/Logs';
import { DecryptText } from './components/DecryptText';

function App() {
  const identity = {
    name: "Kenjiro Hirose / Jiroken / r0se6k",
    role: "SECURITY ENGINEER / SOC ANALYST", 
  };

  return (
    <div className="min-h-screen bg-black text-[#00FF00] p-6 sm:p-12 font-mono text-xl sm:text-2xl">

      <header className="mb-16 mt-8 h-24 flex items-center">
        <DecryptText />
      </header>

      <main className="max-w-5xl">
        {/* INFO SECTION */}
        <section className="mb-12 opacity-90">
          <p>{`> NAME: ${identity.name}`}</p>
          <p>{`> ROLE: ${identity.role}`}</p>
          <p>{`> LOCATION: TOKYO`}</p>
        </section>

        {/* NAVIGATION: 番号付き縦並び */}
        <section className="mb-12">
          <p className="mb-4 text-white underline">[ DIRECTORY ]</p>
          <nav className="flex flex-col gap-2">
            <a href="https://github.com/Kenjiro56" target="_blank" className="hover:bg-[#00FF00] hover:text-black w-fit px-2">(1) GITHUB_REPOSITORY</a><br/>
            <a href="https://zenn.dev/jiroken" target="_blank" className="hover:bg-[#00FF00] hover:text-black w-fit px-2">(2) ZENN_ARTICLES</a><br/>
            <a href="https://qiita.com/Jiroken" target="_blank" className="hover:bg-[#00FF00] hover:text-black w-fit px-2">(3) QIITA_POSTS</a>
          </nav>
        </section>

        {/* BLOG LOGS: 番号なし縦並び */}
        <section className="mb-12">
          <p className="mb-4 text-white underline">[ ACTIVITY_LOGS ]</p>
          <Logs />
        </section>

        <section id="works" className="mb-12">
          <p className="mb-4 text-white underline">[ PROJECT_WORKS / REPOSITORY ]</p>
          <Works />
        </section>

        {/* PROMPT */}
        <div className="flex items-center mt-40 opacity-70">
          <span>{`$ root@kenjiro:~#`}</span>
          <span className="cursor-blink ml-2">_</span>
        </div>
      </main>
    </div>
  );
}

export default App;