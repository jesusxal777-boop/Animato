import type { UploadedModel } from "@/types/model";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Button, ButtonLink, Card, Empty, Stat } from "@santi020k/lumen-react";
import { title, subtitle } from "@/components/primitives";
import { listFiles, uploadModel } from "@/lib/api";
import { setModel } from "@/lib/model-store";
import { ACCEPT_ATTR, ACCEPTED_MODEL_EXTENSIONS } from "@/types/model";

function formatSize(bytes:number){if(bytes<1024)return bytes+" B";if(bytes<1024*1024)return (bytes/1024).toFixed(0)+" KB";return (bytes/(1024*1024)).toFixed(1)+" MB"}

export default function IndexPage(){
 const navigate=useNavigate(),inputRef=useRef<HTMLInputElement>(null);
 const [files,setFiles]=useState<UploadedModel[]>([]),[loading,setLoading]=useState(true),[uploading,setUploading]=useState(false),[error,setError]=useState<string|null>(null);
 useEffect(()=>{let cancelled=false;listFiles().then(list=>{if(!cancelled)setFiles(list)}).catch((err:unknown)=>{if(!cancelled)setError(err instanceof Error?err.message:"Failed to load models.")}).finally(()=>{if(!cancelled)setLoading(false)});return()=>{cancelled=true}},[]);
 const open=(model:UploadedModel)=>{setModel(model);navigate("/editor")};
 const handleFile=async(e:React.ChangeEvent<HTMLInputElement>)=>{const file=e.target.files?.[0];e.target.value="";if(!file)return;setError(null);setUploading(true);try{open(await uploadModel(file))}catch(err){setError(err instanceof Error?err.message:"Upload failed.")}finally{setUploading(false)}};
 return <main className="animato-home"><Card className="animato-home-card" glass="strong"><div style={{display:"grid",gap:24,padding:8}}>
  <header style={{display:"flex",justifyContent:"space-between",gap:18,alignItems:"flex-start",flexWrap:"wrap"}}>
   <div><div className="animato-brand"><span className="animato-mark">A</span><span>Animato</span><Badge variant="success">MCP ready</Badge></div><h1 style={{...title(),fontSize:"clamp(2.6rem,7vw,5.6rem)",margin:"26px 0 10px"}}>Animate 3D<br/>with one prompt.</h1><p style={{...subtitle({class:""}),maxWidth:700}}>A local-first animation workspace for rigged 3D models. Connect GPT, Claude, Grok or another MCP host and let the agent drive the creative workflow.</p></div>
   <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(90px,1fr))",gap:8}}><Stat label="Formats" value="GLB · FBX · OBJ" variant="glass"/><Stat label="Engine" value="Blender" variant="glass"/><Stat label="Transport" value="MCP" variant="glass"/></div>
  </header>
  <section className="animato-drop"><input ref={inputRef} accept={ACCEPT_ATTR} type="file" hidden onChange={handleFile}/><div style={{fontSize:48,opacity:.9}}>◇</div><h2 style={{margin:"8px 0"}}>Start a new animation</h2><p style={{color:"var(--ink-soft)",margin:"0 auto 18px",maxWidth:560}}>Upload a rigged character, inspect it in the 3D editor, then describe the motion you want.</p><Button size="lg" loading={uploading} onClick={()=>inputRef.current?.click()}>Open 3D file</Button><div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap",marginTop:14}}>{ACCEPTED_MODEL_EXTENSIONS.map(ext=><Badge key={ext} variant="secondary">{ext}</Badge>)}</div></section>
  <section><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,marginBottom:12}}><div><h2 style={{margin:"0 0 4px"}}>Your models</h2><p style={{margin:0,color:"var(--ink-soft)"}}>Models available to the local Animato engine.</p></div><Button variant="secondary" onClick={()=>inputRef.current?.click()}>Upload</Button></div>
   {error&&<Card variant="muted"><p role="alert" style={{margin:0,color:"var(--danger)"}}>{error}</p></Card>}
   {loading?<Card variant="muted"><p>Loading models…</p></Card>:files.length===0?<Empty glass><h3>No models yet</h3><p>Upload your first GLB, FBX or OBJ to create an animation workspace.</p></Empty>:<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))",gap:10}}>{files.map(model=><Card key={model.filename} variant="interactive" as="article"><button onClick={()=>open(model)} style={{all:"unset",cursor:"pointer",display:"block",width:"100%"}}><strong style={{display:"block",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}} title={model.filename}>{model.filename}</strong><span style={{display:"block",color:"var(--ink-soft)",fontSize:13,marginTop:5}}>{model.filename.split(".").pop()?.toUpperCase()} · {formatSize(model.size)}</span></button></Card>)}</div>}
  </section>
  <footer style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"center",flexWrap:"wrap",borderTop:"1px solid var(--line)",paddingTop:18}}><span style={{color:"var(--ink-muted)",fontSize:13}}>DreamByte Studios · Local-first · MCP native</span><ButtonLink href="https://github.com/jesusxal777-boop/Animato" newTab showArrow variant="ghost">GitHub</ButtonLink></footer>
 </div></Card></main>
}