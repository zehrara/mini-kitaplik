import React, { useEffect, useMemo, useState } from "react";

const KITAPLAR = [
  { id: 1, baslik: "Simyacı", yazar: "Paulo Coelho", kategori: "Roman" },
  { id: 2, baslik: "Körlük", yazar: "José Saramago", kategori: "Roman" },
  { id: 3, baslik: "Hayvan Çiftliği", yazar: "George Orwell", kategori: "Siyaset" },
  { id: 4, baslik: "Nutuk", yazar: "Mustafa Kemal Atatürk", kategori: "Tarih" },
  { id: 5, baslik: "Küçük Prens", yazar: "Antoine de Saint-Exupéry", kategori: "Çocuk" },
  { id: 6, baslik: "1984", yazar: "George Orwell", kategori: "Distopya" },
  { id: 7, baslik: "Don Kişot", yazar: "Miguel de Cervantes", kategori: "Klasik" },
  { id: 8, baslik: "Dönüşüm", yazar: "Franz Kafka", kategori: "Modern Klasik" },
];

function getUniqueCategories(list) {
  return ["Tümü", ...Array.from(new Set(list.map((k) => k.kategori)))];
}

export default function App() {
  const ARAMA_KEY = "okul-kitapligi-arama";
  const KATEGORI_KEY = "okul-kitapligi-kategori";
  const FAVORI_KEY = "okul-kitapligi-favoriler";

  const [aramaMetni, setAramaMetni] = useState(() => localStorage.getItem(ARAMA_KEY) || "");
  const [kategori, setKategori] = useState(() => localStorage.getItem(KATEGORI_KEY) || "Tümü");
  const [favoriler, setFavoriler] = useState(() => {
    try {
      const savedFavoriler = localStorage.getItem(FAVORI_KEY);
      return savedFavoriler ? JSON.parse(savedFavoriler) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => localStorage.setItem(ARAMA_KEY, aramaMetni), [aramaMetni]);
  useEffect(() => localStorage.setItem(KATEGORI_KEY, kategori), [kategori]);
  useEffect(() => localStorage.setItem(FAVORI_KEY, JSON.stringify(favoriler)), [favoriler]);

  const filtrelenmis = useMemo(() => {
    const metin = aramaMetni.trim().toLowerCase();
    return KITAPLAR.filter(
      (k) =>
        (kategori === "Tümü" || k.kategori === kategori) &&
        k.baslik.toLowerCase().includes(metin)
    );
  }, [aramaMetni, kategori]);

  function toggleFavori(kitap) {
    setFavoriler((prev) =>
      prev.some((fav) => fav.id === kitap.id)
        ? prev.filter((fav) => fav.id !== kitap.id)
        : [...prev, kitap]
    );
  }

  const kategoriler = useMemo(() => getUniqueCategories(KITAPLAR), []);

  return (
    <div style={styles.page}>
      <div style={styles.app}>
        <header style={styles.header}>
          <h1>📚 Okul Kulübü Kitaplığı</h1>
          <p style={styles.headerDescription}>Arama, kategori ve favoriler tarayıcıya kaydedilir.</p>
        </header>

        <div style={styles.controls}>
          <AramaCubugu value={aramaMetni} onChange={setAramaMetni} />
          <KategoriFiltre kategoriler={kategoriler} value={kategori} onChange={setKategori} />
        </div>

        <main style={styles.mainContent}>
          <KitapListe
            kitaplar={filtrelenmis}
            favoriler={favoriler}
            onToggleFavori={toggleFavori}
          />
          <FavoriPaneli favoriler={favoriler} onClear={() => setFavoriler([])} onToggleFavori={toggleFavori} />
        </main>

        <footer style={styles.footer}>
          <small>
            Arama: "{aramaMetni || " "}" — Kategori: {kategori} — Toplam favori: {favoriler.length}
          </small>
        </footer>
      </div>
    </div>
  );
}

// --- Bileşenler ---

function AramaCubugu({ value, onChange }) {
  return (
    <div style={styles.searchBox}>
      <label style={styles.controlLabel}>Ara:</label>
      <input
        type="text"
        placeholder="Kitap başlığına göre ara..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={styles.input}
      />
    </div>
  );
}

function KategoriFiltre({ kategoriler, value, onChange }) {
  return (
    <div style={styles.categoryBox}>
      <label style={styles.controlLabel}>Kategori:</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={styles.select}>
        {kategoriler.map((k) => (
          <option key={k} value={k}>{k}</option>
        ))}
      </select>
    </div>
  );
}

function KitapListe({ kitaplar, favoriler, onToggleFavori }) {
  if (!kitaplar.length) return <div style={styles.emptyListMessage}>Eşleşen kitap yok.</div>;
  return (
    <div style={styles.kitapListesi}>
      {kitaplar.map((k) => (
        <KitapKarti
          key={k.id}
          {...k}
          favorideMi={favoriler.some((fav) => fav.id === k.id)}
          onToggle={() => onToggleFavori(k)}
        />
      ))}
    </div>
  );
}

function KitapKarti({ baslik, yazar, kategori, favorideMi, onToggle }) {
  return (
    <div
      style={{
        ...styles.kitapKarti,
        border: favorideMi ? "1px solid #ff8fab" : "1px solid rgba(255,255,255,0.2)",
        boxShadow: favorideMi
          ? "0 0 20px rgba(255, 140, 171, 0.6)"
          : "0 4px 12px rgba(0,0,0,0.3)",
      }}
    >
      <h3 style={styles.kitapBaslik}>{baslik}</h3>
      <p style={styles.kitapYazar}>{yazar}</p>
      <span style={styles.kitapKategori}>{kategori}</span>
      <button
        onClick={onToggle}
        style={{
          ...styles.kitapFavButton,
          background: favorideMi ? "#ff8fab" : "rgba(255,255,255,0.15)",
        }}
      >
        {favorideMi ? "💔 Çıkar" : "💖 Favori"}
      </button>
    </div>
  );
}

function FavoriPaneli({ favoriler, onClear, onToggleFavori }) {
  return (
    <div style={styles.favPanelContainer}>
      <div style={styles.favPanelHeader}>
        <h2 style={styles.favPanelTitle}>💖 Favoriler ({favoriler.length})</h2>
        <button style={styles.clearFavButton} onClick={onClear}>Temizle</button>
      </div>
      <div style={styles.favList}>
        {favoriler.length === 0 ? (
          <div style={styles.emptyFavMessage}>Henüz favori yok.</div>
        ) : (
          <ul style={styles.favUl}>
            {favoriler.map((k) => (
              <li key={k.id} style={styles.favListItem}>
                {k.baslik} — {k.yazar}
                <button onClick={() => onToggleFavori(k)} style={styles.favRemoveButton}>✖</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// --- Yeni Modern Tasarım (Glassmorphism + Responsive) ---
const styles = {
  page: {
    background: "linear-gradient(135deg, #2b1055 0%, #7597de 100%)",
    minHeight: "100vh",
    color: "#fff",
    padding: 24,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  app: {
    width: "100%",
    maxWidth: 1200,
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(15px)",
    borderRadius: 16,
    padding: 30,
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
  },
  header: {
    textAlign: "center",
    marginBottom: 25,
  },
  headerDescription: {
    marginTop: 8,
    color: "#b0c4de",
    fontSize: "0.9em",
  },
  controls: {
    display: "flex",
    gap: 20,
    alignItems: "center",
    marginBottom: 25,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  controlLabel: {
    marginRight: 10,
    fontWeight: "bold",
    color: "#aee1ff",
  },
  searchBox: { display: "flex", alignItems: "center" },
  input: {
    padding: "10px 15px",
    minWidth: 250,
    borderRadius: 8,
    border: "none",
    background: "rgba(255,255,255,0.2)",
    color: "#fff",
    fontSize: "1em",
    outline: "none",
  },
  categoryBox: { display: "flex", alignItems: "center" },
  select: {
    padding: "10px 15px",
    borderRadius: 8,
    border: "none",
    background: "rgba(255,255,255,0.2)",
    color: "#fff",
    fontSize: "1em",
    cursor: "pointer",
  },
  mainContent: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: 30,
  },
  kitapListesi: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: 20,
  },
  kitapKarti: {
    background: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 20,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    transition: "all 0.3s ease",
  },
  kitapBaslik: { fontSize: "1.3em", marginBottom: 8 },
  kitapYazar: { fontSize: "0.95em", color: "#cfe2ff", marginBottom: 8 },
  kitapKategori: {
    background: "rgba(255,255,255,0.15)",
    borderRadius: 6,
    padding: "4px 10px",
    fontSize: "0.8em",
    color: "#aee1ff",
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  kitapFavButton: {
    padding: "10px 15px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    color: "#fff",
    fontSize: "1em",
    transition: "all 0.3s ease",
  },
  favPanelContainer: {
    background: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 20,
    border: "1px solid rgba(255,255,255,0.2)",
    overflowY: "auto",
    maxHeight: 600,
  },
  favPanelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid rgba(255,255,255,0.2)",
    paddingBottom: 10,
    marginBottom: 10,
  },
  favPanelTitle: { color: "#ff8fab", margin: 0 },
  clearFavButton: {
    padding: "8px 12px",
    borderRadius: 8,
    border: "none",
    background: "rgba(255,255,255,0.2)",
    color: "#fff",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  favList: { marginTop: 10 },
  emptyFavMessage: { color: "#b0c4de", textAlign: "center" },
  favUl: { listStyle: "none", padding: 0, margin: 0 },
  favListItem: {
    background: "rgba(255,255,255,0.1)",
    padding: "10px 12px",
    borderRadius: 8,
    marginBottom: 8,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  favRemoveButton: {
    background: "transparent",
    border: "none",
    color: "#ff8fab",
    cursor: "pointer",
    fontSize: "1em",
  },
  footer: {
    marginTop: 30,
    textAlign: "center",
    color: "#b0c4de",
    fontSize: "0.85em",
  },
};

// --- Responsive ---
styles["@media (max-width: 768px)"] = {
  mainContent: {
    gridTemplateColumns: "1fr",
  },
};