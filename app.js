const $=id=>document.getElementById(id);
const state={page:"home",listening:false,quizIndex:0,score:0,answered:false};

const quiz=[
 {q:"Which detail should you NEVER share with someone claiming to be a bank employee?",o:["Your branch name","OTP/PIN/CVV","Bank working hours","IFSC code"],a:1,e:"OTP, PIN and CVV are confidential. A genuine support person should not ask you to disclose them."},
 {q:"What is a safer action when an SMS asks you to click an urgent banking link?",o:["Click immediately","Forward your OTP","Open the official bank app/site yourself","Share your password"],a:2,e:"Do not use suspicious links. Open the bank's official app or type the official website yourself."},
 {q:"What does UPI primarily allow?",o:["Instant digital payments","Free loans for everyone","Guaranteed investment returns","ATM card replacement"],a:0,e:"UPI enables bank-account-based digital payments. It does not guarantee loans or returns."},
 {q:"What should you do before relying on a government-scheme eligibility claim?",o:["Trust any WhatsApp forward","Verify the official source","Pay an agent first","Share your OTP"],a:1,e:"Eligibility can change. Verify the latest details on an official government or department website."},
 {q:"What is a budget useful for?",o:["Tracking income and spending","Generating OTPs","Avoiding all taxes","Increasing your credit automatically"],a:0,e:"A budget helps you understand where money comes from and where it goes."},
 {q:"If you suspect a fraudulent transaction, what is the safest general first step?",o:["Ignore it","Share your PIN with the caller","Contact your bank through an official channel","Click a refund link"],a:2,e:"Use the bank's official app, website or verified customer-care channel—not a suspicious message link."}
];

const demoAnswers=[
 {keys:["account","open bank","bank account","account open","madodu","madbeku"],a:"To open a bank account, usually choose a bank, complete the account-opening form, provide the required KYC documents, and complete the bank's verification process. Requirements can vary by account type. Never share your OTP, PIN or password with another person."},
 {keys:["upi","payment","pay safely","gpay","phonepe"],a:"UPI lets you send or receive money directly between bank accounts. For safety, use the official app, check the recipient before paying, never share your UPI PIN, and remember that you generally enter your UPI PIN to SEND money—not to receive a refund."},
 {keys:["atm","cash"],a:"At an ATM, insert or tap your card as supported, enter your PIN privately, choose the transaction, and collect your card/cash. Shield the keypad and never tell anyone your PIN."},
 {keys:["loan","interest"],a:"A loan is borrowed money that you repay over time, usually with interest and possible fees. Compare the interest rate, total repayment, processing fees, late charges and other terms before accepting an offer."},
 {keys:["fraud","scam","otp","pin","cvv"],a:"If a message or caller asks for OTP, PIN, CVV, password or remote access, treat it as a major warning sign. Stop the conversation and contact the bank through an official channel."},
 {keys:["credit score","cibil"],a:"A credit score is a numerical indicator based on your credit history. Paying dues on time, keeping borrowing manageable and checking reports for errors can support healthy credit behaviour."},
 {keys:["saving","save money","budget"],a:"Start by tracking essential expenses, setting a realistic savings target, building an emergency buffer and reviewing subscriptions or unnecessary spending. Keep emergency savings accessible and use regulated financial products you understand."},
 {keys:["insurance"],a:"Insurance transfers specified financial risks to an insurer in exchange for a premium. Read coverage, exclusions, waiting periods, claim process and renewal terms before buying."}
];

function logEvent(type,detail=""){
  const logs=JSON.parse(localStorage.getItem("gb_audit")||"[]");
  logs.unshift({time:new Date().toLocaleString(),type,detail});
  localStorage.setItem("gb_audit",JSON.stringify(logs.slice(0,100)));
  renderAdmin();
}
function showPage(id){
  document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));
  document.querySelectorAll(".nav").forEach(x=>x.classList.remove("active"));
  $(id)?.classList.add("active"); document.querySelector(`[data-page="${id}"]`)?.classList.add("active");
  $("crumb").innerText=id==="profile"?"Profile & AI":id==="admin"?"Admin Console":id.replace(/^\w/,c=>c.toUpperCase());
  $("sidebar").classList.remove("open"); window.scrollTo({top:0,behavior:"smooth"}); state.page=id; logEvent("navigation",id);
}
document.querySelectorAll(".nav").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.page)));
$("menu").onclick=()=>$("sidebar").classList.toggle("open");
$("lang").onchange=e=>{localStorage.setItem("gb_lang",e.target.value);$("selectedLanguage").innerText=e.target.value;logEvent("language",e.target.value)};

function getSettings(){return{key:localStorage.getItem("gb_gemini_key")||"",model:localStorage.getItem("gb_gemini_model")||"gemini-2.0-flash"}}
function saveSettings(){
  const key=$("apiKey").value.trim(), model=$("model").value.trim()||"gemini-2.0-flash";
  localStorage.setItem("gb_gemini_key",key); localStorage.setItem("gb_gemini_model",model);
  $("testResult").innerHTML=key?'<span>⏳ Testing Gemini connection…</span>':'<span>ℹ Demo mode: no Gemini key entered.</span>';
  updateAIStatus();
  if(key) testGemini();
  else { $("aiStatus").innerText="Demo AI ready"; logEvent("ai_settings","Gemini key cleared / demo mode"); }
}
async function testGemini(){
  const s=getSettings();
  const box=$("testResult");
  if(!s.key){box.innerHTML="ℹ No API key — demo fallback is active.";return}
  box.innerHTML="⏳ Connecting to Gemini…";
  try{
    const endpoint=`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(s.model)}:generateContent?key=${encodeURIComponent(s.key)}`;
    const body={contents:[{parts:[{text:"Reply with exactly: GramBank AI Gemini connection successful."}]}],generationConfig:{temperature:0,maxOutputTokens:30}};
    const r=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
    const d=await r.json();
    if(!r.ok) throw new Error(d.error?.message||`HTTP ${r.status}`);
    const t=extractGeminiText(d);
    if(!t) throw new Error("Gemini returned no text. Try another available model.");
    box.innerHTML='<b class="ok">✓ Gemini connected successfully.</b><br><small>Live AI is ready.</small>';
    $("aiStatus").innerText="Gemini connected";$("assistantMode").innerText="Gemini live + demo fallback";
    logEvent("ai_test","Gemini connection successful");
  }catch(e){
    box.innerHTML=`<b class="bad">✕ Gemini connection failed.</b><br><small>${esc(e.message)}</small><br><small>Try model <b>gemini-2.0-flash</b> or check that your Gemini key is active/restricted for the Gemini API.</small>`;
    $("aiStatus").innerText="Gemini needs attention"; logEvent("ai_test","Failed: "+e.message.slice(0,100));
  }
}
async function loadGeminiModels(){
  const key=$("apiKey").value.trim()||getSettings().key;if(!key){$("testResult").innerText="Enter a Gemini API key first.";return}
  $("testResult").innerText="⏳ Loading available Gemini models…";
  try{
    const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`);
    const d=await r.json();if(!r.ok)throw new Error(d.error?.message||"Could not list models");
    const models=(d.models||[]).filter(m=>(m.supportedGenerationMethods||[]).includes("generateContent")).map(m=>m.name.replace(/^models\//,""));
    if(models.length){$("model").value=models.find(x=>/flash/i.test(x))||models[0];$("testResult").innerText=`✓ Found ${models.length} usable Gemini model(s). Selected ${$("model").value}.`;}
    else $("testResult").innerText="No generateContent model was returned for this key.";
  }catch(e){$("testResult").innerText="Model lookup failed: "+e.message}
}
function clearSettings(){localStorage.removeItem("gb_gemini_key");$("apiKey").value="";$("testResult").innerText="Status: demo mode. Demo answers remain available.";updateAIStatus();logEvent("ai_settings","Gemini key cleared")}
function updateAIStatus(){let s=getSettings();$("aiStatus").innerText=s.key?"Gemini configured":"Demo AI ready";$("assistantMode").innerText=s.key?"Gemini live + demo fallback":"Demo fallback"}
function selectedLang(){return $("lang").value||"English"}

function extractGeminiText(d){
  return (d.candidates||[]).flatMap(c=>(c.content?.parts||[]).map(p=>p.text||"")).join("").trim();
}
async function gemini(prompt,system=""){
  const s=getSettings(); if(!s.key)return null;
  const endpoint=`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(s.model)}:generateContent?key=${encodeURIComponent(s.key)}`;
  const body={systemInstruction:{parts:[{text:`You are GramBank AI, a safe financial-literacy assistant for rural and underserved Indian users. Use simple language. Respond in ${selectedLang()} when possible. Never request OTP, PIN, CVV, passwords or full banking credentials. Never claim to execute transactions. Never invent scheme eligibility, fees or policy facts. When current policy/scheme details are uncertain, say they must be verified on an official source. ${system}`}]},contents:[{role:"user",parts:[{text:prompt}]}],generationConfig:{temperature:.25,maxOutputTokens:900}};
  try{
    const r=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
    const d=await r.json();
    if(!r.ok)throw new Error(d.error?.message||"Gemini request failed");
    return extractGeminiText(d)||null;
  }catch(e){console.warn("Gemini fallback:",e);return null}
}
function demoAnswer(q){
  const l=q.toLowerCase();
  const lang=selectedLang();
  const hit=demoAnswers.find(x=>x.keys.some(k=>l.includes(k)));
  let base=hit?hit.a:"I can help with common banking and financial-literacy topics. For a specific policy, scheme or current bank rule, please verify the latest information on the official bank or government website. Add a Gemini API key in Profile for broader live AI answers.";
  const translations={
    "ಕನ್ನಡ":{
      "I can help with common banking and financial-literacy topics. For a specific policy, scheme or current bank rule, please verify the latest information on the official bank or government website. Add a Gemini API key in Profile for broader live AI answers.":"ನಾನು ಸಾಮಾನ್ಯ ಬ್ಯಾಂಕಿಂಗ್ ಮತ್ತು ಹಣಕಾಸು ಸಾಕ್ಷರತೆ ವಿಷಯಗಳಲ್ಲಿ ಸಹಾಯ ಮಾಡಬಹುದು. ನಿರ್ದಿಷ್ಟ ನೀತಿ, ಯೋಜನೆ ಅಥವಾ ಪ್ರಸ್ತುತ ಬ್ಯಾಂಕ್ ನಿಯಮಕ್ಕಾಗಿ ಅಧಿಕೃತ ಬ್ಯಾಂಕ್ ಅಥವಾ ಸರ್ಕಾರಿ ವೆಬ್‌ಸೈಟ್‌ನಲ್ಲಿ ಪರಿಶೀಲಿಸಿ. ಹೆಚ್ಚಿನ ಲೈವ್ AI ಉತ್ತರಗಳಿಗಾಗಿ Profile ನಲ್ಲಿ Gemini API key ಸೇರಿಸಿ.",
    },
    "हिन्दी":{
      "I can help with common banking and financial-literacy topics. For a specific policy, scheme or current bank rule, please verify the latest information on the official bank or government website. Add a Gemini API key in Profile for broader live AI answers.":"मैं सामान्य बैंकिंग और वित्तीय साक्षरता से जुड़े सवालों में मदद कर सकता हूँ। किसी खास नीति, योजना या मौजूदा बैंक नियम के लिए आधिकारिक बैंक या सरकारी वेबसाइट पर जानकारी सत्यापित करें। अधिक लाइव AI उत्तरों के लिए Profile में Gemini API key जोड़ें।"
    }
  };
  if(translations[lang]?.[base]) return translations[lang][base];
  if(lang==="ಕನ್ನಡ") return "ಉದಾಹರಣಾ ಉತ್ತರ: "+base+" ಅಧಿಕೃತ ಮಾಹಿತಿಯನ್ನು ಪರಿಶೀಲಿಸಿ.";
  if(lang==="हिन्दी") return "डेमो उत्तर: "+base;
  if(lang==="தமிழ்") return "டெமோ பதில்: "+base;
  if(lang==="తెలుగు") return "డెమో సమాధానం: "+base;
  return base;
}
async function callAI(prompt,system=""){
  const live=await gemini(prompt,system);
  return live||demoAnswer(prompt);
}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function addMsg(id,text,cls){
  const d=document.createElement("div");d.className=cls;
  d.innerHTML=`<b>${cls==="bot"?"GramBank AI":"You"}</b><p>${esc(text).replace(/\n/g,"<br>")}</p>${cls==="bot"?'<small class="source-tag">AI response • verify official policy when applicable</small>':""}`;
  $(id).appendChild(d);$(id).scrollTop=$(id).scrollHeight;
}
function usePrompt(q){$("assistantInput").value=q;showPage("assistant");$("assistantInput").focus()}
async function askAI(){
  const inp=$("assistantInput"),q=inp.value.trim();if(!q)return;
  addMsg("assistantChat",q,"user");inp.value="";
  const a=await callAI(q,"Answer in short, practical steps. If the user uses Romanized/code-mixed language, understand it and answer naturally.");
  addMsg("assistantChat",a,"bot");if($("autoRead")?.checked)speak(a);logEvent("assistant",q.slice(0,80));
}
function fillPolicy(){$("policyInput").value="Your bank may revise service charges for certain account services. Customers should review the latest schedule of charges and applicable conditions. Charges may vary by account type and service.";logEvent("demo","policy sample")}
async function simplifyPolicy(){
  const q=$("policyInput").value.trim();if(!q)return;
  $("policyResult").classList.remove("empty");$("policyResult").innerText="Analyzing…";
  const a=await callAI(`Simplify this banking policy. Return: 1) Simple meaning 2) Steps for the customer 3) Conditions/eligibility stated 4) Fees/risks stated 5) What is missing or must be verified. Do not invent facts.\n\n${q}`,"This is policy simplification. Preserve important conditions and explicitly mark unknown information.");
  $("policyResult").innerText=a+"\n\nOfficial-source reminder: verify the original notice/policy on the bank or government website.";
  logEvent("policy","policy simplified");
}
function fillFraud(){$("fraudInput").value="URGENT: Your bank account will be blocked today. Click http://example.invalid and enter your OTP and ATM PIN to verify your KYC. Failure will cause permanent closure.";logEvent("demo","fraud sample")}
async function checkFraud(){
  const q=$("fraudInput").value.trim();if(!q)return;
  $("fraudResult").classList.remove("empty");$("fraudResult").innerText="Checking…";
  const a=await callAI(`Analyze this suspicious message. Start with exactly one line: RISK: LOW, RISK: MEDIUM, or RISK: HIGH. Then list suspicious signs, what the person should do now, and what NOT to do. Never advise clicking a suspicious link or sharing credentials.\n\n${q}`,"Fraud analysis must prioritize user safety and explain why a message is suspicious.");
  const risk=(a.match(/RISK:\s*(LOW|MEDIUM|HIGH)/i)||[])[1]?.toUpperCase()||(/otp|pin|cvv|urgent|click|password/i.test(q)?"HIGH":"MEDIUM");
  $("riskBadge").innerText=risk;$("riskBadge").className="risk "+risk.toLowerCase();$("fraudResult").innerText=a;logEvent("fraud",risk);
}
async function findSchemes(demo=false){
  const profile=`Occupation: ${$("occupation").value}; Purpose: ${$("purpose").value}; State: ${$("state").value}; Age group: ${$("age").value}`;
  let a;
  if(demo){
    a=`1. PM-KISAN — educational match for eligible farmer households. Verify current eligibility and application status on the official government portal.\n2. Pradhan Mantri Mudra Yojana — may be relevant for eligible micro/small business credit. Verify lender and current terms.\n3. PMJJBY/PMSBY — insurance-related schemes subject to eligibility, enrolment and premium conditions. Verify current official details.`;
  }else{
    a=await callAI(`For this user profile: ${profile}. Suggest up to 4 Indian government financial/social schemes that may be relevant. For each give scheme name, why it may match, key eligibility to verify, and an official government source domain/name if known. Do not claim the user is eligible and do not invent URLs. Clearly say eligibility must be verified officially.`);
  }
  const items=a.split(/\n(?=\d+\.)/).filter(Boolean).slice(0,4);
  $("schemeResult").innerHTML=items.map((x,i)=>`<article class="scheme-card"><span class="badge">MATCH ${i+1}</span><h3>${esc(x.replace(/^\d+\.\s*/,"").split("—")[0].split(":")[0])}</h3><p>${esc(x.replace(/^\d+\.\s*/,""))}</p><a href="https://www.myscheme.gov.in/" target="_blank" rel="noopener">Verify on official MyScheme →</a></article>`).join("");
  logEvent("schemes",profile);
}
async function requestMicrophone(){
  if(!navigator.mediaDevices?.getUserMedia){
    throw new Error("This APK/browser does not expose microphone access. Try Chrome/Edge or enable microphone permission in Android app settings.");
  }
  const stream=await navigator.mediaDevices.getUserMedia({audio:true});
  stream.getTracks().forEach(t=>t.stop());
  return true;
}
function speechLang(){
  const map={"English":"en-IN","ಕನ್ನಡ":"kn-IN","हिन्दी":"hi-IN","தமிழ்":"ta-IN","తెలుగు":"te-IN","অসমীয়া":"as-IN","বাংলা":"bn-IN"};
  return map[selectedLang()]||"en-IN";
}
async function startListening(){
  $("voiceState").innerText="Requesting microphone permission…";
  try{await requestMicrophone()}catch(e){
    $("voiceState").innerText="Microphone permission required";
    $("voiceTranscript").innerText=e.message;
    $("voiceAnswer").innerText="On Android, open App info → Permissions → Microphone → Allow, then return and try again.";
    logEvent("voice_permission",e.message); return;
  }
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){
    $("voiceState").innerText="Microphone is allowed, but speech recognition is unavailable";
    $("voiceTranscript").innerText="Your APK WebView does not expose SpeechRecognition. Use the text box in AI Assistant, or open the web version in Chrome/Edge for live speech-to-text.";
    $("voiceAnswer").innerText="Microphone permission is working; this is a browser/WebView speech-recognition limitation.";
    return;
  }
  if(state.listening)return;state.listening=true;$("voiceOrb").classList.add("listening");$("voiceState").innerText="Listening…";$("voiceTranscript").innerText="Speak now…";
  const r=new SR();r.lang=speechLang();r.interimResults=true;r.continuous=false;r.maxAlternatives=1;
  let finalText="";
  r.onresult=e=>{
    let text="";
    for(let i=0;i<e.results.length;i++) text+=e.results[i][0].transcript+" ";
    $("voiceTranscript").innerText=text.trim();
    if(e.results[e.results.length-1].isFinal) finalText=text.trim();
  };
  r.onerror=e=>{
    state.listening=false;$("voiceOrb").classList.remove("listening");
    $("voiceState").innerText="Voice error";
    $("voiceAnswer").innerText=`${e.error||"Speech recognition failed"}. Microphone permission was granted. Try again or use Chrome/Edge.`;
    logEvent("voice_error",e.error||"unknown");
  };
  r.onend=async()=>{
    state.listening=false;$("voiceOrb").classList.remove("listening");
    if(!finalText) { $("voiceState").innerText="No speech detected";return; }
    $("voiceState").innerText="Thinking…";
    const a=await callAI(finalText,`The user's selected response language is ${selectedLang()}. Answer in that language. Do not translate the user's question unless helpful; directly answer it.`);
    $("voiceAnswer").innerText=a;$("voiceState").innerText="Answer ready";speak(a);logEvent("voice",finalText.slice(0,70));
  };
  try{r.start()}catch(e){$("voiceState").innerText="Could not start microphone";$("voiceAnswer").innerText=e.message}
}
function voiceTo(id){
  requestMicrophone().then(()=>{
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){alert("Microphone permission works, but this APK does not provide speech recognition. Use the AI Assistant text box or Chrome/Edge.");return}
    const r=new SR();r.lang=speechLang();r.interimResults=false;r.onresult=e=>$(id).value=e.results[0][0].transcript;r.onerror=e=>alert("Voice error: "+e.error);r.start();
  }).catch(e=>alert(e.message));
}
function speak(t){if(!("speechSynthesis"in window))return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.rate=.92;u.lang=speechLang();const voices=speechSynthesis.getVoices();const v=voices.find(x=>x.lang?.toLowerCase().startsWith(u.lang.slice(0,2)));if(v)u.voice=v;speechSynthesis.speak(u)}
function stopSpeaking(){speechSynthesis?.cancel()}
function renderQuiz(){
  const q=quiz[state.quizIndex%quiz.length];$("quizQuestion").innerText=q.q;$("quizOptions").innerHTML=q.o.map((x,i)=>`<button class="quiz-option" onclick="answerQuiz(${i})">${esc(x)}</button>`).join("");$("quizFeedback").innerText="";$("nextQuiz").style.display="none";state.answered=false;$("score").innerText=state.score;
}
function answerQuiz(i){
  if(state.answered)return;state.answered=true;const q=quiz[state.quizIndex%quiz.length];document.querySelectorAll(".quiz-option").forEach((b,n)=>{if(n===q.a)b.classList.add("correct");if(n===i&&i!==q.a)b.classList.add("wrong")});if(i===q.a){state.score++;$("quizFeedback").innerText="✓ Correct! "+q.e}else $("quizFeedback").innerText="Not quite. "+q.e;$("score").innerText=state.score;$("nextQuiz").style.display="inline-block";logEvent("quiz",i===q.a?"correct":"wrong")}
function nextQuiz(){state.quizIndex++;renderQuiz()}
function seedContent(){if(!localStorage.getItem("gb_content"))localStorage.setItem("gb_content",JSON.stringify([{title:"Fraud safety basics",source:"RBI / official bank guidance",status:"Verified"},{title:"Scheme verification rule",source:"MyScheme.gov.in",status:"Verified"},{title:"No credential collection",source:"GramBank Safety Policy",status:"Verified"}]))}
function renderAdmin(){
  seedContent();const c=JSON.parse(localStorage.getItem("gb_content")||"[]"),a=JSON.parse(localStorage.getItem("gb_audit")||"[]");
  $("auditCount").innerText=a.length;$("contentCount").innerText=c.length;
  $("contentList").innerHTML=c.map((x,i)=>`<div class="content-item"><div><b>${esc(x.title)}</b><br><span>${esc(x.source)}</span></div><span class="verified">${esc(x.status)} ✓</span></div>`).join("");
  $("auditList").innerHTML=a.length?a.slice(0,25).map(x=>`<div class="audit-item"><b>${esc(x.type)}</b> · ${esc(x.time)}<br><span>${esc(x.detail||"")}</span></div>`).join(""):'<div class="audit-item">No events yet.</div>';
}
function addVerifiedContent(){
  const title=prompt("Content title:");if(!title)return;const source=prompt("Official/source name:")||"Added by admin";
  const c=JSON.parse(localStorage.getItem("gb_content")||"[]");c.unshift({title,source,status:"Verified"});localStorage.setItem("gb_content",JSON.stringify(c));renderAdmin();logEvent("admin","verified content added");
}
function clearAudit(){if(confirm("Clear local audit log?")){localStorage.removeItem("gb_audit");renderAdmin()}}
function toggleLargeText(){document.body.classList.toggle("large-text",$("largeText").checked);localStorage.setItem("gb_large",$("largeText").checked)}
function toggleContrast(){document.body.classList.toggle("high-contrast",$("highContrast").checked);localStorage.setItem("gb_contrast",$("highContrast").checked)}

(function init(){
  const s=getSettings();$("apiKey").value=s.key;$("model").value=s.model;
  $("lang").value=localStorage.getItem("gb_lang")||"English";$("selectedLanguage").innerText=$("lang").value;
  $("largeText").checked=localStorage.getItem("gb_large")==="true";$("highContrast").checked=localStorage.getItem("gb_contrast")==="true";$("autoRead").checked=localStorage.getItem("gb_autoread")==="true";
  $("autoRead").onchange=e=>localStorage.setItem("gb_autoread",e.target.checked);
  toggleLargeText();toggleContrast();updateAIStatus();renderQuiz();seedContent();renderAdmin();
  logEvent("app","GramBank AI started");
})();