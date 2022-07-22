// import logo from './logo.svg';
import { Authenticator } from "@aws-amplify/ui-react";
import { Storage } from "aws-amplify";
import { useState } from "react";
import "@aws-amplify/ui-react/styles.css";
import "./App.css";

function App() {
  const [files, setFiles] = useState([]);

  async function upload(file) {
    const target = file.target;
    const myFile = target.files?.[0];
    const s = await Storage.put("abctest-file2", myFile, {
      level: "public",
      progressCallback(progress) {
        console.log(`Uploaded: ${progress.loaded}/${progress.total}`);
      },
    });

    console.log("s", s);
  }
  async function grabFile() {
    const target = await Storage.get("abc1234", { level: "public" });
    console.log("target", target);
  }

  async function list() {
    const s = await Storage.list("abc");
    setFiles(s);
  }
  return (
    <div className="App">
      <Authenticator>
        {({ signOut }) => <button onClick={signOut}>Sign Out</button>}
      </Authenticator>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          maxWidth: "300px",
          margin: "0 auto",
          gap: "1rem",
        }}
      >
        <button onClick={() => list()}>List Items</button>
        <button onClick={() => grabFile()}>Grab File</button>
        <input type="file" onChange={(event) => upload(event)} />
      </div>
      Upload
      <ul>
        {files && files.map((file, index) => <li key={index}>{file.key}</li>)}
      </ul>
    </div>
  );
}

export default App;
