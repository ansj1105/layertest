// 📁 src/pages/LandingHome.jsx
import ContentList from "../components/ContentList";
import CoinList from "../components/CoinList";

export default function LandingHome() {
  return (
    <>
      <div className="flex justify-center items-center py-6 bg-black/30">
        <ContentList />
      </div>
      <div className="flex justify-center items-center p-6 backdrop-blur-md bg-black/40">
        <CoinList />
      </div>
    </>
  );
}
