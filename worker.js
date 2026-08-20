const MODEL = "@cf/zai-org/glm-4.7-flash";

const SYSTEM_PROMPT = `
You are KARA AI, a friendly and intelligent AI assistant.

LANGUAGE RULE:
- Reply in the same language/style the user uses.
- Tamil -> Tamil.
- Thanglish -> Thanglish.
- English -> English.
- If the user mixes Tamil and English, naturally mix Tamil and English.
- Never unnecessarily change the user's language.

PERSONALITY:
- Friendly, helpful, clear and concise.
- For casual messages, respond naturally.
- Call the user "macha" only when the user's tone is casual.
- Do not claim you performed actions you cannot perform.

CODING CAPABILITIES:
1. Explain programming concepts.
2. Write and debug code.
3. Fix syntax and logic errors.
4. Explain errors clearly.
5. Optimize code for performance, readability and maintainability.
6. Create complete project structures and starter projects.
7. Build HTML, CSS and JavaScript websites.
8. Help create mobile and web applications.
9. Write SQL queries and help with databases.
10. Integrate APIs and explain API usage.
11. Generate unit tests, test cases and testing strategies.
12. Review code for common security problems.
13. Create README files and technical documentation.
14. Refactor and clean up existing code.
15. Help with libraries, packages and frameworks.
16. Write terminal commands, Bash scripts and automation scripts.
17. Solve algorithms and data-structure problems.
18. Create frontend UI code and responsive interfaces.
19. Help with AI and machine-learning code.

CODING RULES:
- When code is requested, provide useful working code.
- Analyze user-provided code before changing it.
- Preserve existing working functionality unless the user asks for a rewrite.
- If fixing code, clearly show the corrected version.
- Never invent APIs, libraries or functions.
- Match the requested programming language.
- For large projects, organize the solution by files.
- Keep explanations simple unless the user asks for detail.

IMPORTANT:
- Accuracy is more important than speed.
- For mathematics, calculate carefully.
- Do not guess arithmetic answers.
- Respect the user's request first.
`;

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>KARA AI</title>

<style>
*{
  box-sizing:border-box;
}

body{
  margin:0;
  background:#07070c;
  color:#fff;
  font-family:Arial,Helvetica,sans-serif;
  min-height:100vh;
}

.app{
  width:100%;
  max-width:900px;
  margin:auto;
  min-height:100vh;
  display:flex;
  flex-direction:column;
}

.header{
  text-align:center;
  padding:35px 20px 20px;
}

.logo{
  font-size:42px;
  font-weight:800;
  letter-spacing:2px;
}

.subtitle{
  color:#8f8f9c;
  margin-top:8px;
}

.chat{
  flex:1;
  padding:20px;
  overflow-y:auto;
}

.welcome{
  text-align:center;
  margin-top:60px;
}

.welcome h1{
  font-size:42px;
  margin-bottom:10px;
}

.welcome p{
  color:#8f8f9c;
  font-size:18px;
}

.message{
  margin:18px 0;
  padding:18px;
  border-radius:22px;
  line-height:1.6;
  white-space:pre-wrap;
  overflow-wrap:anywhere;
}

.user{
  background:#171720;
  border:1px solid #292936;
}

.kara{
  background:#101017;
  border:1px solid #292936;
}

.label{
  font-weight:bold;
  margin-bottom:8px;
}

.composer{
  position:sticky;
  bottom:0;
  padding:15px;
  background:#07070c;
  border-top:1px solid #20202a;
}

.box{
  display:flex;
  align-items:flex-end;
  gap:10px;
  background:#111118;
  border:1px solid #30303d;
  border-radius:28px;
  padding:10px 12px;
}

textarea{
  flex:1;
  resize:none;
  min-height:48px;
  max-height:160px;
  background:transparent;
  border:0;
  outline:0;
  color:#fff;
  font-size:17px;
  padding:12px;
}

button{
  width:52px;
  height:52px;
  border:0;
  border-radius:50%;
  background:linear-gradient(135deg,#19c8ff,#7667ff);
  color:white;
  font-size:25px;
  cursor:pointer;
}

button:disabled{
  opacity:.5;
}

.code{
  background:#050509;
  border:1px solid #30303d;
  border-radius:12px;
  padding:14px;
  overflow-x:auto;
  font-family:monospace;
}

@media(max-width:600px){
  .welcome h1{
    font-size:32px;
  }

  .chat{
    padding:12px;
  }
}
</style>
</head>

<body>

<div class="app">

  <div class="header">
    <div class="logo">KARA AI</div>
    <div class="subtitle">Your AI Assistant</div>
  </div>

  <div id="chat" class="chat">
    <div class="welcome">
      <h1>How can I help you?</h1>
      <p>Ask KARA anything...</p>
    </div>
  </div>

  <div class="composer">
    <div class="box">
      <textarea
        id="input"
        placeholder="Ask KARA anything..."
        rows="1"
      ></textarea>

      <button id="send">➤</button>
    </div>
  </div>

</div>

<script>
const input = document.getElementById("input");
const send = document.getElementById("send");
const chat = document.getElementById("chat");

let history = [];

function removeWelcome(){
  const w = document.querySelector(".welcome");
  if(w) w.remove();
}

function addMessage(type,text){
  removeWelcome();

  const div = document.createElement("div");
  div.className = "message " + type;

  const label = document.createElement("div");
  label.className = "label";
  label.textContent = type === "user" ? "You:" : "🤖 KARA:";

  const content = document.createElement("div");

  // Safe rendering
  content.textContent = text;

  div.appendChild(label);
  div.appendChild(content);

  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

async function askKara(){
  const text = input.value.trim();

  if(!text || send.disabled) return;

  input.value = "";
  send.disabled = true;

  addMessage("user",text);

  const loading = document.createElement("div");
  loading.className = "message kara";
  loading.id = "loading";
  loading.innerHTML = "<div class='label'>🤖 KARA:</div><div>Thinking...</div>";
  chat.appendChild(loading);
  chat.scrollTop = chat.scrollHeight;

  try{
    const response = await fetch("/api/chat",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        message:text,
        history
      })
    });

    const data = await response.json();

    const oldLoading = document.getElementById("loading");
    if(oldLoading) oldLoading.remove();

    if(!response.ok){
      throw new Error(data.error || "Something went wrong");
    }

    addMessage("kara",data.reply);

    history.push({
      role:"user",
      content:text
    });

    history.push({
      role:"assistant",
      content:data.reply
    });

    // Keep conversation reasonably small
    if(history.length > 20){
      history = history.slice(-20);
    }

  }catch(error){

    const oldLoading = document.getElementById("loading");
    if(oldLoading) oldLoading.remove();

    addMessage(
      "kara",
      "Sorry macha, something went wrong. Please try again."
    );

    console.error(error);
  }

  send.disabled = false;
  input.focus();
}

send.addEventListener("click",askKara);

input.addEventListener("keydown",e=>{
  if(e.key === "Enter" && !e.shiftKey){
    e.preventDefault();
    askKara();
  }
});

input.addEventListener("input",()=>{
  input.style.height="auto";
  input.style.height=Math.min(input.scrollHeight,160)+"px";
});
</script>

</body>
</html>`;

function corsHeaders(){
  return {
    "Access-Control-Allow-Origin":"*",
    "Access-Control-Allow-Headers":"Content-Type",
    "Access-Control-Allow-Methods":"GET,POST,OPTIONS"
  };
}

function json(data,status=200){
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers:{
        "Content-Type":"application/json; charset=utf-8",
        ...corsHeaders()
      }
    }
  );
}

/*
  Convert common calculator symbols into JavaScript-style operators.
*/
function normalizeMath(text){

  return text
    .replace(/×/g,"*")
    .replace(/÷/g,"/")
    .replace(/[−–—]/g,"-")
    .replace(/,/g,"")
    .replace(/\^/g,"**")
    .trim();
}

/*
  Safe calculator:
  Only numbers, operators, decimal points and parentheses are allowed.
*/
function calculate(text){

  const expression = normalizeMath(text);

  if(
    !/^[0-9+*/().%\s-]+$/.test(expression)
  ){
    return null;
  }

  if(!/[0-9]/.test(expression)){
    return null;
  }

  try{

    const result = Function(
      '"use strict"; return (' + expression + ')'
    )();

    if(
      typeof result !== "number" ||
      !Number.isFinite(result)
    ){
      return null;
    }

    return result;

  }catch{
    return null;
  }
}

function looksLikeMath(text){

  const normalized = normalizeMath(text);

  if(
    !/^[0-9+*/().%\s-]+$/.test(normalized)
  ){
    return false;
  }

  return /\d/.test(normalized);
}

function formatNumber(number){

  if(Number.isInteger(number)){
    return number.toLocaleString("en-IN");
  }

  return Number(number.toFixed(10)).toLocaleString("en-IN");
}

async function callAI(env,message,history){

  if(!env.AI){
    throw new Error(
      "Workers AI binding is missing. Add an AI binding named AI."
    );
  }

  const messages = [
    {
      role:"system",
      content:SYSTEM_PROMPT
    }
  ];

  for(const item of history.slice(-20)){
    if(
      item &&
      (item.role === "user" || item.role === "assistant") &&
      typeof item.content === "string"
    ){
      messages.push({
        role:item.role,
        content:item.content
      });
    }
  }

  messages.push({
    role:"user",
    content:message
  });

  const result = await env.AI.run(
    MODEL,
    {
      messages,
      max_tokens:1200,
      temperature:0.2
    }
  );

  if(typeof result === "string"){
    return result;
  }

  if(result?.response){
    return result.response;
  }

  if(result?.result?.response){
    return result.result.response;
  }

  if(result?.text){
    return result.text;
  }

  return JSON.stringify(result);
}

export default {

  async fetch(request,env){

    if(request.method === "OPTIONS"){
      return new Response(null,{
        headers:corsHeaders()
      });
    }

    const url = new URL(request.url);

    if(request.method === "GET" && url.pathname === "/"){
      return new Response(HTML,{
        headers:{
          "Content-Type":"text/html; charset=utf-8",
          "Cache-Control":"no-cache"
        }
      });
    }

    if(request.method === "GET" && url.pathname === "/health"){
      return json({
        ok:true,
        name:"KARA AI",
        aiBinding:!!env.AI
      });
    }

    if(
      request.method === "POST" &&
      url.pathname === "/api/chat"
    ){

      try{

        const body = await request.json();

        const message =
          typeof body?.message === "string"
            ? body.message.trim()
            : "";

        const history =
          Array.isArray(body?.history)
            ? body.history
            : [];

        if(!message){
          return json({
            error:"Message is empty."
          },400);
        }

        /*
          Exact calculator path.
          This prevents the AI from making arithmetic mistakes.
        */
        if(looksLikeMath(message)){

          const answer = calculate(message);

          if(answer !== null){

            return json({
              reply:
                message +
                " = " +
                formatNumber(answer)
            });
          }
        }

        /*
          AI path for normal questions.
        */
        const reply = await callAI(
          env,
          message,
          history
        );

        return json({
          reply
        });

      }catch(error){

        return json({
          error:
            error?.message ||
            "Server error"
        },500);
      }
    }

    return new Response("Not Found",{
      status:404
    });
  }
};
