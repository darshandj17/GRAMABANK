const http = require('http');
const https = require('https');
const { URL } = require('url');
const PORT = Number(process.env.PORT || 3000);
const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';
const hits = new Map();
function send(res,status,data){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':ALLOWED_ORIGIN,'Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type','Cache-Control':'no-store'});res.end(JSON.stringify(data));}
function readBody(req){return new Promise((resolve,reject)=>{let s='';req.on('data',c=>{s+=c;if(s.length>50000){reject(new Error('Request too large'));req.destroy();}});req.on('end',()=>{try{resolve(JSON.parse(s||'{}'));}catch(e){reject(new Error('Invalid JSON'));}});req.on('error',reject);});}
function gemini(contents,systemInstruction){return new Promise((resolve,reject)=>{const payload=JSON.stringify({contents, ...(systemInstruction?{systemInstruction:{parts:[{text:systemInstruction}]}}:{}),generationConfig:{temperature:0.25,maxOutputTokens:900}});const req=https.request({hostname:'generativelanguage.googleapis.com',path:`/v1beta/models/${encodeURIComponent(MODEL)}:generateContent`,method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':API_KEY,'Content-Length':Buffer.byteLength(payload)}},r=>{let data='';r.on('data',c=>data+=c);r.on('end',()=>{let d={};try{d=JSON.parse(data)}catch{}if(r.statusCode<200||r.statusCode>=300){const status=(r.statusCode===401||r.statusCode===403)?503:r.statusCode;return reject(Object.assign(new Error(d.error?.message||'Gemini provider request failed'),{status}));}const text=(d.candidates||[]).flatMap(c=>(c.content?.parts||[]).map(p=>p.text||'')).join('').trim();resolve(text);});});req.setTimeout(25000,()=>req.destroy(new Error('Gemini request timed out')));req.on('error',reject);req.write(payload);req.end();});}
const server=http.createServer(async(req,res)=>{if(req.method==='OPTIONS')return send(res,204,{});const url=new URL(req.url,'http://localhost');const ip=req.socket.remoteAddress||'unknown';const now=Date.now();const recent=(hits.get(ip)||[]).filter(t=>now-t<60000);if(recent.length>=30)return send(res,429,{error:'Too many requests. Please wait and retry.'});recent.push(now);hits.set(ip,recent);
if(req.method==='GET'&&url.pathname==='/api/health')return send(res,200,{ok:true,model:MODEL,configured:Boolean(API_KEY)});
if(req.method==='GET'&&url.pathname==='/api/models')return send(res,200,{models:[MODEL]});
if(req.method==='POST'&&url.pathname==='/api/generate'){if(!API_KEY)return send(res,503,{error:'Server is missing GEMINI_API_KEY. Configure it in your hosting provider environment settings.'});try{const body=await readBody(req);const prompt=String(body.prompt||'').trim();if(!prompt||prompt.length>12000)return send(res,400,{error:'Prompt is required and must be under 12000 characters.'});const text=await gemini([{role:'user',parts:[{text:prompt}]}],String(body.system||'').slice(0,5000));return send(res,200,{text});}catch(e){return send(res,e.status||502,{error:e.message||'AI provider request failed'});}}
return send(res,404,{error:'Not found'});
});
server.listen(PORT,'0.0.0.0',()=>console.log(`GramBank AI backend listening on ${PORT}`));
