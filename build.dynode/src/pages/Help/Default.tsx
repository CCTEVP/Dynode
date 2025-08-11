import { Link } from "../../components/Link";
function Home() {
  return (
    <div>
      <h2>Help Page</h2>
      <p>Welcome to your Builder App!</p>
      <Link label="Help/Components" target="/help/components" />
    </div>
  );
}

export default Home;
