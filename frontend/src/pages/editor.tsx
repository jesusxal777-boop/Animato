import type { ModelInfo } from "@/types/model";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Badge, Button, ButtonLink, Card, Sidebar, Stat, Tabs, TabsList, TabsPanel, TabsTrigger } from "@santi020k/lumen-react";
import ThreeViewer from "@/components/editor/three-viewer";
import { ChatPanel } from "@/components/editor/chat-panel";
import { InfoPanel } from "@/components/editor/info-panel";
import { OpenFileModal } from "@/components/editor/open-file-modal";
import { modelFromOutputUrl, removeAnimation, uploadModel } from "@/lib/api";
import { setModel, useModel } from "@/lib/model-store";
import { ACCEPT_ATTR } from "@/types/model";

export default function EditorPage(){
 const model=useModel(),inputRef=useRef<HTMLInputElement>(null);
 const [info,setInfo]=useState<ModelInfo|null>(null),[loading,setLoading]=useState(false),[error,setError]=useState<string|null>(null),[uploading,setUploading]=useState(false),[activeIndex,setActiveIndex]=useState<number|null>(null),[isPlaying,setIsPlaying]=useState(true),[removingAnim,setRemovingAnim]=useState<string|null>(null),[exporting,setExporting]=useState(false),[pickerOpen,setPickerOpen]=useState(false);
 useEffect(()=>{setInfo(null);setError(null);setActiveIndex(null);setIsPlaying(true)},[model]);
 const handleFile=async(e:React.ChangeEvent<HTMLInputElement>)=>{const picked=e.target.files?.[0];e.target.value="";if(!picked)return;setError(null);setUploading(true);try{setModel(await uploadModel(picked))}catch(err){setError(err instanceof Error?err.message:"Upload failed.")}finally{setUploading(false)}};
 const handleExport=async()=>{if(!model||exporting)return;setExporting(true);setError(null);try{const response=await fetch(model.absolute_url);if(!response.ok)throw new Error("Download failed ("+response.status+").");const blob=await response.blob(),href=URL.createObjectURL(blob),link=document.createElement("a");link.href=href;link.download=model.filename;document.body.appendChild(link);link.click();link.remove();URL.revokeObjectURL(href)}catch(err){setError(err instanceof Error?err.message:"Export failed.")}finally{setExporting(false)}};
 const handleLoaded=(loaded:ModelInfo)=>{setInfo(loaded);setError(null);setActiveIndex(null);setIsPlaying(true)};
 const handleRemoveAnimation=async(name:string)=>{if(!model||removingAnim)return;if(!window.confirm('Delete animation "'+name+'" from '+model.filename+"?"))return;setRemovingAnim(name);try{const res=await removeAnimation(model.filename,name);setModel(modelFromOutputUrl(res.output_url??model.absolute_url))}catch(err){setError(err instanceof Error?err.message:"Failed to remove animation.")}finally{setRemovingAnim(null)}};
 return <div className="animato-shell"><input ref={inputRef} accept={ACCEPT_ATTR} type="file" hidden onChange={handleFile}/>
  <div style={{display:"flex",minHeight:"100vh"}}>
   <Sidebar className="animato-sidebar" glass="subtle"><div className="animato-brand"><span className="animato-mark">A</span><span>Animato</span></div>
    <nav className="animato-nav" aria-label="Studio"><Link to="/">Models</Link><Link to="/editor" aria-current="page">Editor</Link><a href="#mcp">MCP</a></nav>
    <div style={{marginTop:28,display:"grid",gap:8}}><Stat label="Engine" value="Blender / bpy" variant="glass"/><Stat label="MCP" value="Ready" variant="glass"/></div>
    <div style={{marginTop:"auto",paddingTop:24}}><ButtonLink href="https://github.com/jesusxal777-boop/Animato/blob/feature/mcp-ready/docs/MCP.md" newTab showArrow variant="ghost">MCP docs</ButtonLink></div>
   </Sidebar>
   <main className="animato-main">
    <header className="animato-topbar"><div style={{minWidth:0}}><strong>{model?.filename??"Animation workspace"}</strong><div style={{display:"flex",gap:7,marginTop:5,flexWrap:"wrap"}}><Badge variant="success">Local engine</Badge><Badge variant="secondary">MCP</Badge>{model&&<Badge variant="outline">{model.filename.split(".").pop()?.toUpperCase()}</Badge>}</div></div><div style={{display:"flex",gap:8,flexWrap:"wrap"}}><Button size="sm" variant="secondary" loading={uploading} onClick={()=>inputRef.current?.click()}>Open file</Button><Button size="sm" variant="secondary" disabled={!model||exporting} loading={exporting} onClick={handleExport}>Export</Button></div></header>
    <div className="animato-content"><div className="animato-grid">
     <Card className="animato-panel" glass="subtle"><ChatPanel model={model} onModelReplaced={setModel}/></Card>
     <Card className="animato-panel animato-viewer" glass="strong">{model?<ThreeViewer activeClipIndex={activeIndex} isPlaying={isPlaying} model={model} onError={setError} onLoaded={handleLoaded} onLoadingChange={setLoading}/>:<div style={{height:"100%",minHeight:520,display:"grid",placeItems:"center"}}><div style={{maxWidth:420,textAlign:"center"}}><h2>Choose a character</h2><p style={{color:"var(--ink-soft)"}}>Open a GLB, FBX or OBJ file to start animating.</p><Button onClick={()=>inputRef.current?.click()}>Open 3D file</Button></div></div>}{loading&&<div style={{position:"absolute",inset:0,display:"grid",placeItems:"center",background:"rgba(2,7,18,.55)",backdropFilter:"blur(8px)"}}><Badge variant="secondary">Loading model…</Badge></div>}</Card>
     <Card className="animato-panel" glass="subtle"><InfoPanel activeClipIndex={activeIndex} info={info} isPlaying={isPlaying} loading={loading} removingName={removingAnim} onRemove={handleRemoveAnimation} onSelect={index=>{setActiveIndex(index);setIsPlaying(true)}} onTogglePlay={()=>setIsPlaying(v=>!v)}/></Card>
    </div>
    {error&&<Card variant="muted" style={{marginTop:14}}><p role="alert" style={{margin:0,color:"var(--danger)"}}>{error}</p></Card>}
    <Card glass="subtle" style={{marginTop:14}}><Tabs defaultValue="overview" glass indicator><TabsList><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="mcp">MCP</TabsTrigger></TabsList><TabsPanel value="overview"><div style={{paddingTop:14,display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}><Stat label="Model" value={model?model.filename:"None"} variant="bare"/><Stat label="Animations" value={info?String(info.animations.length):"—"} variant="bare"/><Stat label="Runtime" value="Blender / bpy" variant="bare"/></div></TabsPanel><TabsPanel value="mcp"><div className="animato-code" style={{marginTop:14}}>AI host → MCP → Animato → Blender / bpy{String.fromCharCode(10)}list_models · prepare_animation · run_animation_code · remove_animation</div></TabsPanel></Tabs></Card>
    </div>
   </main>
  </div>
  {pickerOpen&&<OpenFileModal isOpen={pickerOpen} onOpenChange={setPickerOpen} onPick={setModel}/>}
 </div>
}
