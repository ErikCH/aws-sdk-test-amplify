// import logo from './logo.svg';
import { Authenticator } from "@aws-amplify/ui-react";
import { Storage, Auth } from "aws-amplify";
import { useState, useEffect } from "react";
import "@aws-amplify/ui-react/styles.css";
import "./App.css";

function App() {
  const [files, setFiles] = useState([]);

  async function upload() {}
  async function grabFile() {}

  async function list() {}
  return (
    <div className="App">
      <button>Upload</button>
    </div>
  );
}

export default App;
