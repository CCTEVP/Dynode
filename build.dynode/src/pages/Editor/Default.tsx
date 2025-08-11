import { Link } from "../../components/Link";
function Home() {
  return (
    <div>
      <h2>Editor Page</h2>
      <p>Welcome to your Builder App!</p>
      <Link label="Editor/Assets/Upload" target="/editor/assets/upload" />
    </div>
  );
}

export default Home;
