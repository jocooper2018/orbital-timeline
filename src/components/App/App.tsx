import "/src/styles/colors.css";
import "./App.css";
import Timeline from "../Timeline/Timeline";

const App: React.FC = () => {
  return (
    <>
      <main>
        <h1>Orbital Timeline</h1>
        <p>
          Orbital Timeline est une frise chronologique interactive sur
          l'histoire de l'exploration spatiale.
        </p>
        <p>
          Le site est en construction.
        </p>
        <Timeline />
      </main>
    </>
  );
};

export default App;
