const { invoke } = window.__TAURI__.core;

let enginePath;
let projectPath;

async function greet() {
  // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
  greetMsgEl.textContent = await invoke("greet", { name: greetInputEl.value });
}

async function get_saved(input_key) {
  console.log("Get Saved")
  return await invoke("get_saved", { key: input_key });
}

async function set_saved(input_key, input_value) {
  console.log("Set saved")
  await invoke("set_saved", { key: input_key, value: input_value });
}

async function run_cmd(cmd, args_) {
  console.log("Execute command: " + cmd + " " + args_)
  await invoke("run_cmd", { program: cmd, args: args_ });
}

let enginePathStr = "";
let projectPathStr = "";

let buttonCompile = null;
let buttonLaunch = null;

function SetButtonsState(newState) {
  if (!newState) {
    buttonCompile.disabled = true;
    buttonLaunch.disabled = true;

    buttonCompile.style.opacity = '0.5';
    buttonLaunch.style.opacity = '0.5';
  } else {
    buttonCompile.style.opacity = '1.0';
    buttonLaunch.style.opacity = '1.0';
    buttonCompile.disabled = false;
    buttonLaunch.disabled = false;
  }
}

window.addEventListener("DOMContentLoaded", async () => {
  enginePath = document.querySelector("#engine-path");
  projectPath = document.querySelector("#project-path");

  enginePathStr = await get_saved("engine_path");
  projectPathStr = await get_saved("project_path");

  enginePath.value = enginePathStr;
  projectPath.value = projectPathStr; 

  buttonCompile = document.querySelector("#button-compile");
  buttonLaunch = document.querySelector("#button-launch");

  buttonCompile.addEventListener('click', async function() {
    SetButtonsState(false);
    document.querySelector("#p-state").textContent = "Compiling...";
    await run_cmd(enginePathStr + "/Engine/build/BatchFiles/RunUAT.bat", 'BuildCookRun -project=' + projectPathStr + ' -targetplatform=Win64 -configuration=Development -cook -build -run');
    document.querySelector("#p-state").textContent = "Compiled";
    SetButtonsState(true);
  });

  buttonLaunch.addEventListener('click', async function() {
    SetButtonsState(false);
    document.querySelector("#p-state").textContent = "Running editor";
    await run_cmd(enginePathStr + "/Engine/Binaries/Win64/UnrealEditor.exe", projectPathStr);
    document.querySelector("#p-state").textContent = "Stopped editor";
    SetButtonsState(true);
  });

  console.log("Loaded engine path: " + enginePathStr);
  console.log("Loaded project path: " + projectPathStr);

  document.querySelector("#launch-form").addEventListener("submit", (e) => {
    e.preventDefault();
    console.log("Submit")
    enginePathStr = enginePath.value;
    projectPathStr = projectPathStr;
    set_saved("engine_path", enginePath.value);
    set_saved("project_path", projectPath.value);
  });
});
