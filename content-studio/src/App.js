import Sidebar from "./component/Sidebar";

export default function App() {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <main style={{ padding: 24 }}></main>
    </div>
  );
}