import Link from "../../components/Link";
function Home() {
  return (
    <div>
      <h2>Home Page</h2>
      <p>Welcome to your Builder App!</p>
      <Link label="Asset Uploader" target="/editor/assetupload" />
    </div>
  );
}

export default Home;
