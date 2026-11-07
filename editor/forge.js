(function(){
const ENEMY_TAG_BY_LIST = {
  "ENEMY_Q11_OUTLAW_PRINCE": "boss",
  "ENEMY_GILLIAM_1": "mini",
  "ENEMY_BOSS_ORBAN": "mini",
  "ENEMY_FAE_A2_NAMED": "mini",
  "ENEMY_GOLEM_A2_NAMED": "mini",
  "ENEMY_BACKBREAKER_1": "boss",
  "ENEMY_LT_DRYS": "mini",
  "ENEMY_LT_EIZ": "mini",
  "ENEMY_LT_ZERAI": "mini",
  "ENEMY_BOSS_XAIN": "boss",
  "ENEMY_SPECTER_A2_NAMED": "mini",
  "ENEMY_Q4_VAGABOND": "boss",
  "ENEMY_INTRO_BOSS": "boss",
  "ENEMY_Q8_BOSS_NE'KRUL": "boss",
  "ENEMY_BOSS_EURTH": "none",
  "ENEMY_BLOOD_SISTER_UNDEAD": "mini",
  "ENEMY_Q9_NEKRUL": "boss",
  "ENEMY_Q12_NE_KRUL_1": "mini",
  "ENEMY_Q12_NE_KRUL_2": "mini",
  "ENEMY_BOSS_ONE_FANG": "mini",
  "Q13_ENEMY_GREYSDON": "boss",
  "ENEMY_BOSS_GREYSDON": "none",
  "ENEMY_NAVOTH_1": "mini",
  "ENEMY_THE_BAILIFF": "mini",
  "ENEMY_BOSS_KHAMPANAX": "mini",
  "ENEMY_ZACHARETH_1": "boss",
  "A2Q02_ENEMY_MORANT": "mini",
  "ENEMY_BOSS_HOARY_FOX": "mini",
  "ENEMY_BOSS_ZADIE": "mini",
  "ENEMY_RENEYR_1": "boss",
  "ENEMY_GILLIAM_2": "boss",
  "A2Q01_VRASKHAR": "boss",
  "ENEMY_BOSS_ATHROK": "mini",
  "ENEMY_A2Q11_LEVIRAX_A": "boss",
  "ENEMY_A2Q11_LEVIRAX_B": "boss",
  "ENEMY_A2Q11_LEVIRAX_C": "boss",
  "ENEMY_DRAGON_1": "boss",
  "ENEMY_DRAGON_ELDER": "boss",
  "ENEMY_Q13_XENITH": "boss",
  "UNUSED_ENEMY_Q14_XENITH": "boss",
  "ENEMY_Q14_XENITH": "boss",
  "ENEMY_Q7_XENITH": "boss",
  "ENEMY_DRAGON_SCULPT": "boss",
  "ENEMY_Q8_XENITH": "boss",
  "ENEMY_BOSS_NAZGESH": "boss",
  "ENEMY_BERSERKER_1": "base",
  "ENEMY_WARY_BANDIT_1": "base",
  "ENEMY_ZEALOT_1": "base",
  "ENEMY_GOLEM_1": "base",
  "ENEMY_FAE_1": "base",
  "ENEMY_WOLF_1": "base",
  "ENEMY_SPECTER_1": "base",
  "ENEMY_WIGHT_1": "base",
  "ENEMY_HARBINGER_1": "base",
  "ENEMY_CENTURIAN_3": "base",
  "ENEMY_BLOOD_SISTER_1": "base",
  "ENEMY_DOOMCALLER_1": "base",
  "ENEMY_DRAGON_1": "base",
  "ENEMY_SALAMANDER_1": "base",
  "ENEMY_VAMPIRE_1": "base",
  "ENEMY_REANIMATE_1": "base",
  "ENEMY_VIPER_1": "base",
  "ENEMY_MERCENARY_1": "base",
  "ENEMY_BOSS_VRASKHAR": "mini",
  "Q13_ENEMY_FLAME_ZEALOT": "mini",
  "ENEMY_ZEALOT_RUNE_OF_BLADES": "mini",
  "ENEMY_Q4_HERMIT": "boss",
  "ENEMY_Q4_IGOR": "boss",
  "ENEMY_Q8_E2_BOSS_UTHUK": "mini",
};
const KEY='descentforge_forge_data_v1';
function clone(v){return JSON.parse(JSON.stringify(v||[]));}
let state={weaponParts:[]};
try{const r=localStorage.getItem(KEY);if(r){const p=JSON.parse(r);if(Array.isArray(p.weaponParts))state.weaponParts=p.weaponParts;}}catch(e){}
if(!Array.isArray(state.weaponParts)||!state.weaponParts.length)state.weaponParts=clone((typeof DATA!=="undefined")?DATA.weaponParts:[]);
if(typeof DATA!=="undefined")DATA.weaponParts=state.weaponParts;
function persist(){try{localStorage.setItem(KEY,JSON.stringify({weaponParts:state.weaponParts}));}catch(e){};if(typeof DATA!=="undefined")DATA.weaponParts=state.weaponParts;}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function prettyName(s){return String(s==null?'':s).replace(//g,' Plus').replace(/\s+/g,' ').trim();}
function partFlavor(p){if(!p) return ''; if(p.text) return p.text; try{ const k=(p.class||'')+'|'+(p.slot||'')+'|'+prettyName(p.name_en||p.name||''); if(typeof PART_EFFECTS!=='undefined' && PART_EFFECTS[k]) return PART_EFFECTS[k]; }catch(e){}; return ''; }
const overlay=document.createElement('div');
overlay.id='forgeOverlay';
overlay.style.cssText='position:fixed;left:0;right:0;bottom:0;z-index:10005;display:none;background:var(--board);color:var(--text);font-family:inherit;overflow:hidden;';
overlay.innerHTML=
  '<div style="padding:10px 18px;background:var(--panel2);border-bottom:1px solid var(--edge);display:flex;align-items:center;justify-content:flex-start;position:relative;">'+
    '<h1 style="margin:0;font-size:18px;">Forge</h1>'+
    '<div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:flex;gap:6px;">'+
      '<button id="forgeTopAddAll" style="background:var(--torch);color:var(--ink);border:0;border-radius:4px;padding:6px 10px;cursor:pointer;font-weight:600;font-size:12px;">Add all upgraded (selected act)</button>'+
      '<button id="forgeTopManage" style="background:var(--panel2);color:var(--text);border:1px solid var(--edge);border-radius:4px;padding:6px 10px;cursor:pointer;font-size:12px;">Manage Starting Inventory</button>'+
      '<button id="forgeTopClear" style="background:var(--panel2);color:var(--text);border:1px solid var(--edge);border-radius:4px;padding:6px 10px;cursor:pointer;font-size:12px;">Clear all</button>'+
    '</div>'+
  '</div>'+
  '<div style="display:flex;gap:8px;padding:8px 18px;background:var(--panel2);border-bottom:1px solid var(--edge);justify-content:center;">'+
    '<button data-forgecat="armor" style="padding:6px 12px;border:1px solid var(--edge);background:var(--panel);color:var(--text);border-radius:4px;cursor:pointer;">Armor</button>'+
    '<button data-forgecat="trinkets" style="padding:6px 12px;border:1px solid var(--edge);background:var(--panel);color:var(--text);border-radius:4px;cursor:pointer;">Trinkets</button>'+
    '<button data-forgecat="weaponinv" style="padding:6px 12px;border:1px solid var(--edge);background:var(--panel);color:var(--text);border-radius:4px;cursor:pointer;">Weapons</button>'+
    '<button data-forgecat="itempool" style="padding:6px 12px;border:1px solid var(--edge);background:var(--panel);color:var(--text);border-radius:4px;cursor:pointer;">Item Pool</button>'+
    '<button data-forgecat="reserved" style="padding:6px 12px;border:1px solid var(--edge);background:var(--panel);color:var(--text);border-radius:4px;cursor:pointer;">Reserved</button>'+
    '<button data-forgecat="startinv" style="padding:6px 12px;border:1px solid var(--edge);background:var(--panel);color:var(--text);border-radius:4px;cursor:pointer;">Starting Inventory</button>'+
    '<button data-forgecat="enemies" style="padding:6px 12px;border:1px solid var(--edge);background:var(--panel);color:var(--text);border-radius:4px;cursor:pointer;">Enemies</button>'+
  '</div>'+
  '<div id="forgeMain" style="overflow:auto;height:calc(100% - 106px);padding:10px 18px;">'+
    '<div id="forgeSearchWrap">'+
      '<input id="forgeSearch" placeholder="Search weapon parts..." style="width:100%;padding:6px 8px;margin-bottom:8px;border:1px solid var(--edge);background:var(--panel2);color:var(--text);border-radius:4px;box-sizing:border-box;">'+
      '<div id="forgeNew" style="padding:6px 10px;margin-bottom:8px;background:var(--torch);color:var(--ink);border-radius:4px;cursor:pointer;text-align:center;font-weight:600;">+ New weapon part</div>'+
    '</div>'+
    '<div id="forgeList"></div>'+
    '<div id="forgeEditor" style="margin-top:12px;"></div>'+
  '</div>';
document.body.appendChild(overlay);
const HERO_NAMES=['HERO_BRYNN','HERO_SYRUS','HERO_GALADEN','HERO_VAERIX','HERO_KEHLI','HERO_CHANCE'];
const HERO_LABELS={'HERO_BRYNN':'Brynn','HERO_SYRUS':'Syrus','HERO_GALADEN':'Galaden','HERO_VAERIX':'Vaerix','HERO_KEHLI':'Kehli','HERO_CHANCE':'Chance'};
const HERO_weapons={'HERO_BRYNN':['Sword','Warhammer'],'HERO_SYRUS':['Staff','Wand'],'HERO_GALADEN':['DualBlades','Bow'],'HERO_VAERIX':['Warbell','Spear'],'HERO_KEHLI':['Hammer','Crossbow'],'HERO_CHANCE':['Gauntlet','ThrowingKnives']};
let selectedHero='HERO_BRYNN';
let activeCat='weaponinv';
let selected=null;
const carIdx={};
function carKey(cls,slot){return cls+'|'+slot;}
function partVariants(cls,slot){return state.weaponParts.filter(function(w){return w.class===cls && w.slot===slot;}).sort(function(a,b){return a.id>b.id?1:-1;});}
function isDefaultPart(cls,slot,id){ id=String(id||''); if(slot==='A') return /_1$/i.test(id) && id.indexOf(cls)!==-1? true : /_1$/i.test(id); if(slot==='B'||slot==='C') return /_0$/i.test(id); return false; }
function carouselItems(cls,slot){
  const variants=partVariants(cls,slot);
  const picked=[];
  const seen={};
  function add(w){
    if(!w || seen[w.id]) return;
    seen[w.id]=true;
    picked.push(w);
  }
  variants.forEach(function(w){
    const owned=inStartInv(w.id);
    // A keeps its normal defaults (base "_1") plus owned items.
    if(slot==='A'){
      const isDefault=isDefaultPart(cls,slot,w.id);
      if(!owned && !isDefault) return;
    } else {
      // B/C show only items actually present in Starting Inventory.
      if(!owned) return;
    }
    add(w);
  });
  return picked;
}
function inStartInv(id){try{return !!(typeof camp!=='undefined' && camp.start && Array.isArray(camp.start.items) && camp.start.items.some(function(i){return i.id===id;}));}catch(e){return false;}}
function setStartInv(id,on){try{if(typeof camp==='undefined'||!camp) return; camp.start=camp.start||{items:[]}; if(!Array.isArray(camp.start.items)) camp.start.items=[]; if(on){if(!camp.start.items.some(function(i){return i.id===id;})) camp.start.items.push({id:id,qty:1});}else{camp.start.items=camp.start.items.filter(function(i){return i.id!==id;});} if(typeof renderRight==='function') renderRight();}catch(e){}}
const classes=Array.from(new Set(state.weaponParts.map(function(x){return x.class;}))).sort();
function renderList(){
  const q=(overlay.querySelector('#forgeSearch').value||'').toLowerCase();
  const list=overlay.querySelector('#forgeList');
  list.innerHTML='';
  state.weaponParts.slice().sort(function(a,b){return a.id>b.id?1:-1;}).filter(function(p){return !q||String(p.id).toLowerCase().includes(q)||String(p.name_en||'').toLowerCase().includes(q);}).forEach(function(p){
    const d=document.createElement('div');
    d.style.cssText='padding:8px;margin-bottom:4px;background:var(--panel2);border-radius:4px;cursor:pointer;display:flex;align-items:center;gap:8px;font-size:13px;';
    if(p.id===selected)d.style.outline='1px solid var(--torch)';
    const img=document.createElement('img');img.src='../img/weapon/'+p.id+'.png';img.style.cssText='width:28px;height:28px;object-fit:contain;background:var(--ink);border-radius:3px;';
    img.onerror=function(){img.style.display='none';};
    const span=document.createElement('span');span.textContent=p.id;
    d.appendChild(img);d.appendChild(span);
    d.addEventListener('click',function(){selected=p.id;renderAll();});
    list.appendChild(d);
  });
}
function makeSelect(id,values,cur){let h='<select id="'+id+'" style="width:100%;padding:6px 8px;border:1px solid var(--edge);background:var(--panel2);color:var(--text);border-radius:4px;margin-top:4px;box-sizing:border-box;">';values.forEach(function(v){h+='<option value="'+esc(v)+'"'+(v===cur?' selected':'')+'>'+esc(v)+'</option>';});h+='</select>';return h;}
function fields(p){
  return '<label style="display:block;font-size:12px;color:var(--dim);margin-top:10px;">ID</label><input id="wId" value="'+esc(p.id)+'" style="width:100%;padding:6px 8px;border:1px solid var(--edge);background:var(--panel2);color:var(--text);border-radius:4px;box-sizing:border-box;">'+
  '<label style="display:block;font-size:12px;color:var(--dim);margin-top:10px;">Name (ES)</label><input id="wName" value="'+esc(p.name)+'" style="width:100%;padding:6px 8px;border:1px solid var(--edge);background:var(--panel2);color:var(--text);border-radius:4px;box-sizing:border-box;">'+
  '<label style="display:block;font-size:12px;color:var(--dim);margin-top:10px;">Name (EN)</label><input id="wNameEn" value="'+esc(p.name_en)+'" style="width:100%;padding:6px 8px;border:1px solid var(--edge);background:var(--panel2);color:var(--text);border-radius:4px;box-sizing:border-box;">'+
  '<label style="display:block;font-size:12px;color:var(--dim);margin-top:10px;">Class</label>'+makeSelect('wClass',classes,p.class)+
  '<label style="display:block;font-size:12px;color:var(--dim);margin-top:10px;">Slot</label>'+makeSelect('wSlot',['A','B','C'],p.slot)+
  '<label style="display:block;font-size:12px;color:var(--dim);margin-top:10px;"><input id="wUpgraded" type="checkbox"'+(p.upgrade?' checked':'')+' style="margin-right:6px;">Upgraded</label>'+
  '<label style="display:block;font-size:12px;color:var(--dim);margin-top:10px;">Flavor text</label><textarea id="wText" style="width:100%;min-height:48px;padding:6px 8px;border:1px solid var(--edge);background:var(--panel2);color:var(--text);border-radius:4px;box-sizing:border-box;">'+esc(p.text || partFlavor(p))+'</textarea>'+
  '<div style="margin-top:12px;display:flex;gap:8px;">'+
    '<button id="wSave" style="background:var(--torch);color:var(--ink);font-weight:600;padding:6px 12px;border:0;border-radius:4px;cursor:pointer;">Save</button>'+
    '<button id="wDup" style="background:var(--edge);color:var(--text);padding:6px 12px;border:1px solid var(--edge);border-radius:4px;cursor:pointer;">Duplicate</button>'+
    '<button id="wDel" style="background:var(--edge);color:var(--text);padding:6px 12px;border:1px solid var(--edge);border-radius:4px;cursor:pointer;">Delete</button>'+
  '</div>'+
  '<p id="wMsg" style="color:var(--verd);font-size:12px;margin-top:8px;"></p>';
}
function bindEditor(p, root){
  const scope = root || overlay;
  const q = function(id){ return (scope==overlay)? overlay.querySelector('#'+id) : document.getElementById(id); };
  const msg=q('wMsg');
  const sync=function(){
    p.id=q('wId').value;
    p.name=q('wName').value;
    p.name_en=q('wNameEn').value;
    p.class=q('wClass').value;
    p.slot=q('wSlot').value;
    p.upgrade=q('wUpgraded').checked;
    p.text=q('wText').value;
  };
  ['wId','wName','wNameEn','wClass','wSlot','wUpgraded','wText'].forEach(function(id){const el=q(id);if(el)el.addEventListener('input',sync);});
  const dup=q('wDup'); if(dup)dup.addEventListener('click',function(){sync();const c=clone(p);c.id=p.id+'_COPY';state.weaponParts.push(c);selected=c.id;persist();renderAll();});
  const del=q('wDel'); if(del)del.addEventListener('click',function(){state.weaponParts=state.weaponParts.filter(function(x){return x!==p;});selected=null;persist();renderAll(); if(typeof dlg!=='undefined'&&dlg&&dlg.close)dlg.close();});
  const save=q('wSave'); if(save)save.addEventListener('click',function(){sync();persist();if(msg)msg.textContent='Saved';});
}
function renderEditor(){
  const e=overlay.querySelector('#forgeEditor');
  const p=state.weaponParts.find(function(x){return x.id===selected;});
  if(!p){e.innerHTML='<p style="color:var(--dim);">Select a weapon part to edit, or create a new one.</p>';return;}
  e.innerHTML=fields(p);
  bindEditor(p);
}
function defaultPart(cls,slot){
  let arr=state.weaponParts.filter(function(w){return w.class===cls && w.slot===slot;}).sort(function(a,b){return a.id>b.id?1:-1;});
  // Prefer a variant that has an image (non-_0 suffix) for the assembled preview.
  const withImg=arr.filter(function(w){return !/_0$/.test(w.id);});
  if(withImg.length) arr=withImg;
  return arr.length?arr[0].id:null;
}
function renderHeroPortraits(){
  const el=overlay.querySelector('#forgeMain');
  if(!el) return;
  // keep hero list in left column via separate container
}
function carouselHTML(cls,slot,showImage){
  const arr=carouselItems(cls,slot);
  if(!arr.length) return '<div style="color:var(--dim);font-size:12px;text-align:center;padding:8px 0;">none</div>';
  let idx=carIdx[carKey(cls,slot)];
  if(idx==null || idx<0 || idx>=arr.length){
    const def=arr.find(function(w){return isDefaultPart(cls,slot,w.id);});
    const withFlavor=arr.filter(function(w){return partFlavor(w);});
    if (def) idx=arr.indexOf(def);
    else if (withFlavor.length) idx=arr.indexOf(withFlavor[0]);
    else idx=0;
  }
  const p=arr[idx];
  const name=prettyName(p.name_en||p.name||p.id);
  const flavor=prettyName(partFlavor(p));
  const owned=arr.filter(function(w){return inStartInv(w.id);}).length;
  const imgBaseId = String(p.id||'').replace(/_UPGRADED$/i,'').replace(/_PLUS$/i,'');
  const imgTag = showImage ? '<img src="../img/weapon/'+imgBaseId+'.png" style="width:100%;max-width:180px;aspect-ratio:1/1;object-fit:contain;background:var(--ink);border:1px solid var(--edge);border-radius:6px;margin-bottom:6px;" onerror="this.style.display=&quot;none&quot;;">' : '';
  return '<div style="border:1px solid var(--edge);background:var(--panel);border-radius:6px;padding:8px;width:100%;max-width:240px;">'+
    '<div style="font-size:11px;color:var(--dim);margin-bottom:4px;">'+slot+' part ('+(idx+1)+'/'+arr.length+')</div>'+
    (imgTag? (imgTag+'<div style="margin-bottom:4px;"></div>') : '')+
    '<div style="display:flex;align-items:center;gap:8px;justify-content:space-between;margin-bottom:6px;">'+
      (arr.length>1 ? '<button data-step="'+cls+'|'+slot+'|-1" style="background:var(--panel2);color:var(--text);border:1px solid var(--edge);border-radius:4px;cursor:pointer;padding:2px 8px;">&lt;</button>' : '')+
      '<div style="flex:1;text-align:center;font-size:13px;word-break:break-word;">'+esc(name)+'</div>'+
      (arr.length>1 ? '<button data-step="'+cls+'|'+slot+'|1" style="background:var(--panel2);color:var(--text);border:1px solid var(--edge);border-radius:4px;cursor:pointer;padding:2px 8px;">&gt;</button>' : '')+
    '</div>'+
    (flavor ? '<div style="color:var(--dim);font-size:11px;text-align:center;margin-bottom:6px;line-height:1.3;">'+esc(flavor)+'</div>' : '')+
    '<div style="margin-top:6px;text-align:center;"><button data-editpart="'+p.id+'" style="background:var(--torch);color:var(--ink);border:0;border-radius:4px;padding:4px 10px;cursor:pointer;font-size:12px;">Edit</button></div>'+
  '</div>';
}
function currentCarouselPart(cls,slot){
  const arr=carouselItems(cls,slot);
  if(!arr.length) return null;
  let idx=carIdx[carKey(cls,slot)];
  if(idx==null || idx<0 || idx>=arr.length){
    const def=arr.find(function(w){return isDefaultPart(cls,slot,w.id);});
    const wf=arr.filter(function(w){return partFlavor(w);});
    if(def) idx=arr.indexOf(def);
    else if(wf.length) idx=arr.indexOf(wf[0]);
    else idx=0;
  }
  return arr[idx]||null;
}
function makeHeroLoadout(cls){
  try{
    if(typeof ensureCampLoadout!=='function'){ alert('Loadout editor not available.'); return; }
    const classes=(typeof HERO_DEFAULT_LOADOUT_CLASSES!=='undefined')? (HERO_DEFAULT_LOADOUT_CLASSES[selectedHero]||[]) : [];
    const slotIndex=classes.indexOf(cls);
    if(slotIndex<0){ alert('This weapon is not one of the selected hero default slots.'); return; }
    const a=currentCarouselPart(cls,'A');
    const b=currentCarouselPart(cls,'B');
    const c=currentCarouselPart(cls,'C');
    const L=ensureCampLoadout(selectedHero);
    L.slots[slotIndex].a=a? a.id : '';
    L.slots[slotIndex].b=b? b.id : '';
    L.slots[slotIndex].c=c? c.id : '';
    if(typeof renderRight==='function') renderRight();
    renderHeroWeapons();
    alert('Loadout updated for '+selectedHero+' slot '+(slotIndex+1)+'.');
  } catch(e){ console.error('MAKE_LOADOUT_ERR', e && (e.stack||e)); alert('Failed: '+(e&&e.message||e)); }
}
function renderHeroWeapons(){
  const main=overlay.querySelector('#forgeMain');
  if(!main) return;
  const classes=HERO_weapons[selectedHero]||[];
  const left='<div style="display:flex;flex-direction:column;gap:8px;width:120px;">'+
    HERO_NAMES.map(function(h){
      const on=h===selectedHero;
      return '<button data-hero="'+h+'" style="padding:10px 6px;background:'+(on?'var(--torch)':'var(--panel2)')+';color:'+(on?'var(--ink)':'var(--text)')+';border:1px solid var(--edge);border-radius:6px;cursor:pointer;font-weight:'+(on?'700':'400')+';">'+HERO_LABELS[h]+'</button>';
    }).join('')+
  '</div>';
  const columns=classes.map(function(cls){
    return '<div style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:8px;border:1px solid var(--edge);background:var(--panel2);border-radius:8px;">'+
      '<div style="font-weight:600;margin-bottom:6px;">'+cls+'</div>'+
      carouselHTML(cls,'A',true)+
      '<div style="height:6px"></div>'+
      carouselHTML(cls,'B')+
      '<div style="height:6px"></div>'+
      carouselHTML(cls,'C')+
      '<div style="margin-top:6px;text-align:center;"><button data-makeloadout="'+cls+'" style="background:var(--torch);color:var(--ink);border:0;border-radius:4px;padding:4px 10px;cursor:pointer;font-size:12px;font-weight:600;">click to make hero\'s loadout</button></div>'+
    '</div>'}).join('');
  main.innerHTML=
    '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;justify-content:center;position:static;background:var(--panel2);padding:8px 0;">'+
      '<button id="forgeAddAllAct" style="background:var(--torch);color:var(--ink);border:0;border-radius:4px;padding:6px 12px;cursor:pointer;font-weight:600;">Add all upgraded for selected Acts</button>'+
      '<button id="forgeManageStart" style="background:var(--panel2);color:var(--text);border:1px solid var(--edge);border-radius:4px;padding:6px 12px;cursor:pointer;">Manage Starting Inventory</button>'+
    '</div>'+
    '<div style="display:grid;grid-template-columns:130px 1fr;gap:12px;height:100%;">'+
      '<div style="display:flex;flex-direction:column;gap:8px;">'+left+'</div>'+
      '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;align-content:start;">'+columns+'</div>'+
    '</div>'+
    '<div id="forgeEditor" style="margin-top:12px;"></div>';
  main.querySelectorAll('[data-hero]').forEach(function(btn){
    btn.addEventListener('click',function(){ selectedHero=btn.getAttribute('data-hero'); renderHeroWeapons(); });
  });
  main.querySelectorAll('[data-selpart]').forEach(function(img){
    img.addEventListener('click',function(){ selected=img.getAttribute('data-selpart'); renderEditorTarget(); });
  });
  main.querySelectorAll('[data-step]').forEach(function(b){
    b.addEventListener('click',function(){
      const parts=b.getAttribute('data-step').split('|');
      const cls=parts[0], slot=parts[1], dir=+parts[2];
      const arr=carouselItems(cls,slot);
      if(!arr.length) return;
      const key=carKey(cls,slot);
      let idx=carIdx[key]||0;
      idx=(idx+dir+arr.length)%arr.length;
      carIdx[key]=idx;
      renderHeroWeapons();
    });
  });
  main.querySelectorAll('[data-editpart]').forEach(function(b){ b.addEventListener('click',function(){ selected=b.getAttribute('data-editpart'); renderEditorTarget(); }); });
  main.querySelectorAll('[data-makeloadout]').forEach(function(b){
    b.addEventListener('click',function(){ makeHeroLoadout(b.getAttribute('data-makeloadout')); });
  });
  const addBtn=overlay.querySelector('#forgeAddAllAct');
  if(addBtn) addBtn.addEventListener('click',function(){
    try {
      const allowedAct2= (typeof camp!=='undefined' && camp.meta && (camp.meta.act!=='I' || !!camp.meta.requiresAct2)) || false;
      if(typeof camp==='undefined'){ console.warn('no camp'); return; }
      camp.start=camp.start||{items:[]};
      if(!Array.isArray(camp.start.items)) camp.start.items=[];
      const ids=[];
      if(typeof GRUPOS_INICIO==='function'){
        GRUPOS_INICIO().filter(function(g){return g&&g[0]!=='loot';}).forEach(function(g){
          (g[1]||[]).forEach(function(x){
            const id=String(x.id||'');
            if(!id) return;
            if(typeof esMejoraStart==='function' && !esMejoraStart(id)) return;
            const act=(typeof itemActOf==='function')? itemActOf(x) : 1;
            if(act>=2 && !allowedAct2) return;
            ids.push(id);
          });
        });
      } else {
        state.weaponParts.forEach(function(w){
          if(/_UPGRADED$/.test(w.id)) ids.push(w.id);
        });
      }
      const seen=new Set();
      ids.filter(function(id){ if(seen.has(id)) return false; seen.add(id); return true; }).forEach(function(id){
        if(typeof addStartItem==='function') addStartItem(id);
        else if(!camp.start.items.some(function(i){return i.id===id;})) camp.start.items.push({id:id,qty:1});
      });
      if(typeof renderRight==='function') renderRight();
    } catch(e){ console.error('ADD_ALL_ERR', e && (e.stack||e)); }
    renderHeroWeapons();
  });
  const manageBtn=overlay.querySelector('#forgeManageStart');
  if(manageBtn) manageBtn.addEventListener('click',function(){
    if(typeof abrirInicioPopup==='function') abrirInicioPopup();
  });
}

function renderEditorTarget(){
  const e=overlay.querySelector('#forgeEditor');
  if(!e) return;
  const p=state.weaponParts.find(function(x){return x.id===selected;});
  if(!p){ e.innerHTML=''; return; }
  e.innerHTML=fields(p);
  bindEditor(p);
}
function renderSimpleCategory(title, items, imgFolder){
  const main=overlay.querySelector('#forgeMain');
  if(!main) return;
  const rows=items.map(function(x){
    const name = prettyName((typeof L==='function') ? L(x,'name') : (x.name_en||x.name||x.id));
    const isIn=inStartInv(x.id);
    const img = imgFolder ? '<img src="../img/'+imgFolder+'/'+x.id+'.png" style="width:48px;height:48px;object-fit:contain;background:var(--ink);border:1px solid var(--edge);border-radius:4px;margin-right:8px;" onerror="this.style.display=&quot;none&quot;;">' : '';
    return '<div style="padding:8px;margin-bottom:6px;border:1px solid var(--edge);background:var(--panel2);border-radius:6px;display:flex;justify-content:space-between;align-items:center;gap:8px;">'+
      '<div style="display:flex;align-items:center;gap:8px;">'+img+'<span>'+esc(name)+'</span></div>'+
      '<span style="font-size:11px;color:'+(isIn?'var(--verd)':'var(--dim)')+';">'+(isIn?'In Starting Inventory':'Not in Starting Inventory')+'</span>'+
    '</div>';
  }).join('');
  main.innerHTML=
    '<div style="display:flex;gap:8px;justify-content:center;margin-bottom:10px;flex-wrap:wrap;position:static;background:var(--panel2);padding:8px 0;">'+
      '<button id="forgeAddAllAct" style="background:var(--torch);color:var(--ink);border:0;border-radius:4px;padding:6px 12px;cursor:pointer;font-weight:600;">Add all upgraded for selected Acts</button>'+
      '<button id="forgeManageStart" style="background:var(--panel2);color:var(--text);border:1px solid var(--edge);border-radius:4px;padding:6px 12px;cursor:pointer;">Manage Starting Inventory</button>'+
    '</div>'+
    '<h2 style="margin:0 0 8px 0;font-size:16px;">'+esc(title)+'</h2>'+
    '<div>'+ (rows||'<p style="color:var(--dim);">No items found.</p>') +'</div>';
  const addBtn=main.querySelector('#forgeAddAllAct');
  if(addBtn) addBtn.addEventListener('click',function(){
    const forgeAdd=document.getElementById('forgeAddAllAct');
    // reuse weapons add all handler via clicking virtual? Just run add all
    if (typeof addAllUpgradedGlobal==='function') addAllUpgradedGlobal();
    else {
      // fallback
    }
    renderActiveCategory();
  });
  const manageBtn=main.querySelector('#forgeManageStart');
  if(manageBtn) manageBtn.addEventListener('click',function(){ if(typeof abrirInicioPopup==='function') abrirInicioPopup(); });
}
function forgeAllowedAct2(){ try { return !!(typeof camp!=="undefined" && camp && camp.meta && (camp.meta.act!=="I" || !!camp.meta.requiresAct2)); } catch(e){ return false; } }
function clearAllStartInv(){ try { camp.start=camp.start||{items:[]}; camp.start.items=[]; } catch(e){} if(typeof renderRight==='function') renderRight(); renderActiveCategory(); }
function renderArmorCategory(){
  const main=overlay.querySelector('#forgeMain');
  if(!main) return;
  const gear=((typeof DATA!=='undefined' && Array.isArray(DATA.gear))? DATA.gear.filter(function(g){return g.kind==='armor';}) : []);
  const families=[];
  const seen=new Set();
  gear.forEach(function(g){
    const m=String(g.id||'').match(/^ARMOR_[0-9]+/i);
    if(m && !seen.has(m[0])){ seen.add(m[0]); families.push(m[0].toUpperCase()); }
  });
  families.sort(function(a,b){ return a.localeCompare(b, undefined, {numeric:true}); });
  const familyRows=families.map(function(fam){
    const baseId=fam;
    const plusId=fam+'_PLUS';
    const g=gear.find(function(x){return x.id===baseId;}) || gear.find(function(x){return x.id===plusId;});
    const name=prettyName((typeof L==='function' && g)? L(g,'name') : (g && (g.name_en||g.name) || fam));
    const baseOwned=inStartInv(baseId);
    const plusOwned=inStartInv(plusId);
    const act=(typeof itemActOf==='function')? itemActOf({id:baseId}) : 1;
    const baseData=gear.find(function(x){return x.id===baseId;});
    const img = baseData ? '<img src="../img/armor/'+baseId+'.png" style="width:64px;height:64px;object-fit:contain;background:var(--ink);border:1px solid var(--edge);border-radius:4px;margin-right:8px;" onerror="this.style.display=&quot;none&quot;;">' : '';
    return {act: act, html: '<div style="padding:8px;margin-bottom:6px;border:1px solid var(--edge);background:var(--panel2);border-radius:6px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;">'+
      img+
      '<div style="flex:1;min-width:140px;">'+esc(name)+(act>=2?' (Act II)':'')+'</div>'+
      '<div style="display:flex;flex-direction:column;gap:4px;align-items:flex-start;">'+
        '<label style="display:flex;align-items:center;gap:4px;font-size:12px;'+(plusOwned?'opacity:.45;':'')+'"><input type="checkbox" data-startid="'+baseId+'" '+(baseOwned?'checked':'')+(plusOwned?' disabled':'')+'> Base</label>'+
        '<label style="display:flex;align-items:center;gap:4px;font-size:12px;"><input type="checkbox" data-startid="'+plusId+'" '+(plusOwned?'checked':'')+'> Upgraded</label>'+
      '</div>'+
    '</div>'};
  });
  const act1Rows=familyRows.filter(function(r){return r.act<2;}).map(function(r){return r.html;}).join('');
  const act2Rows=familyRows.filter(function(r){return r.act>=2;}).map(function(r){return r.html;}).join('');
  const allowedAct2=forgeAllowedAct2();
  main.innerHTML=
    '<div style="display:flex;gap:8px;justify-content:center;margin-bottom:10px;flex-wrap:wrap;position:static;background:var(--panel2);padding:8px 0;">'+
      '<button id="forgeAddAllBase" style="background:var(--panel2);color:var(--text);border:1px solid var(--edge);border-radius:4px;padding:6px 12px;cursor:pointer;">Add all base</button>'+
      '<button id="forgeAddAllUpgraded" style="background:var(--torch);color:var(--ink);border:0;border-radius:4px;padding:6px 12px;cursor:pointer;font-weight:600;">Add all upgraded</button>'+
      '<button id="forgeClearPage" style="background:var(--panel2);color:var(--text);border:1px solid var(--edge);border-radius:4px;padding:6px 12px;cursor:pointer;">Clear</button>'+
    '</div>'+
    '<div style="display:grid;grid-template-columns:repeat(2,minmax(0,max-content));gap:12px;align-items:start;justify-items:center;margin:0 auto;width:fit-content;">'+
      '<div><h2 style="margin:0 0 8px 0;font-size:16px;">Armor - Act I</h2><div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;">' + (act1Rows||'<p style="color:var(--dim);">No items found.</p>') + '</div></div>'+
      (allowedAct2 ? '<div><h2 style="margin:0 0 8px 0;font-size:16px;">Armor - Act II</h2><div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;">' + (act2Rows||'<p style="color:var(--dim);">No items found.</p>') + '</div></div>' : '')+
    '</div>'+
    '<div id="forgeEditor" style="margin-top:12px;"></div>';
  main.querySelectorAll('input[data-startid]').forEach(function(cb){
    cb.addEventListener('change', function(){ var id=cb.getAttribute('data-startid'); if(cb.checked && /_PLUS$/i.test(id)){ setStartInv(id.replace(/_PLUS$/i,''), false); } setStartInv(id, cb.checked); renderArmorCategory(); });
  });
  const addBaseBtn=main.querySelector('#forgeAddAllBase');
  if(addBaseBtn) addBaseBtn.addEventListener('click',function(){ families.forEach(function(fam){ const act=(typeof itemActOf==='function')? itemActOf({id:fam}) : 1; if(act>=2 && !allowedAct2) return; if((camp.start.items||[]).some(function(i){ return i.id=== (fam+'_PLUS') || i.id=== (fam+'_UPGRADED'); })) return; setStartInv(fam, true); }); renderArmorCategory(); });
  const addUpgradedBtn=main.querySelector('#forgeAddAllUpgraded');
  if(addUpgradedBtn) addUpgradedBtn.addEventListener('click',function(){ families.forEach(function(fam){ const act=(typeof itemActOf==='function')? itemActOf({id:fam}) : 1; if(act>=2 && !allowedAct2) return; setStartInv(fam+'_PLUS', true); setStartInv(fam, false); }); renderArmorCategory(); });
  const clearBtn=main.querySelector('#forgeClearPage');
  if(clearBtn) clearBtn.addEventListener('click',function(){ main.querySelectorAll('input[data-startid]').forEach(function(cb){ setStartInv(cb.getAttribute('data-startid'), false); }); renderArmorCategory(); });
}
function renderTrinketsCategory(){
  const main=overlay.querySelector('#forgeMain');
  if(!main) return;
  const gear=((typeof DATA!=='undefined' && Array.isArray(DATA.gear))? DATA.gear.filter(function(g){return g.kind==='trinket';}) : []);
  const families=[];
  const seen=new Set();
  gear.forEach(function(g){
    const m=String(g.id||'').match(/^TRINKET[0-9]+_ID/i);
    if(m && !seen.has(m[0])){ seen.add(m[0]); families.push(m[0].toUpperCase()); }
  });
  families.sort(function(a,b){ return a.localeCompare(b, undefined, {numeric:true}); });
  const familyRows=families.map(function(fam){
    const baseId=fam;
    const plusId=fam+'_PLUS';
    const g=gear.find(function(x){return x.id===baseId;}) || gear.find(function(x){return x.id===plusId;});
    const name=prettyName((typeof L==='function' && g)? L(g,'name') : (g && (g.name_en||g.name) || fam));
    const baseOwned=inStartInv(baseId);
    const plusOwned=inStartInv(plusId);
    const act=(typeof itemActOf==='function')? itemActOf({id:baseId}) : 1;
    const baseData=gear.find(function(x){return x.id===baseId;});
    const img = baseData ? '<img src="../img/trinket/'+baseId+'.png" style="width:64px;height:64px;object-fit:contain;background:var(--ink);border:1px solid var(--edge);border-radius:4px;margin-right:8px;" onerror="this.style.display=&quot;none&quot;;">' : '';
    return {act: act, html: '<div style="padding:8px;margin-bottom:6px;border:1px solid var(--edge);background:var(--panel2);border-radius:6px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;">'+
      img+
      '<div style="flex:1;min-width:140px;">'+esc(name)+(act>=2?' (Act II)':'')+'</div>'+
      '<div style="display:flex;flex-direction:column;gap:4px;align-items:flex-start;">'+
        '<label style="display:flex;align-items:center;gap:4px;font-size:12px;'+(plusOwned?'opacity:.45;':'')+'"><input type="checkbox" data-startid="'+baseId+'" '+(baseOwned?'checked':'')+(plusOwned?' disabled':'')+'> Base</label>'+
        '<label style="display:flex;align-items:center;gap:4px;font-size:12px;"><input type="checkbox" data-startid="'+plusId+'" '+(plusOwned?'checked':'')+'> Upgraded</label>'+
      '</div>'+
    '</div>'};
  });
  const act1Rows=familyRows.filter(function(r){return r.act<2;}).map(function(r){return r.html;}).join('');
  const act2Rows=familyRows.filter(function(r){return r.act>=2;}).map(function(r){return r.html;}).join('');
  const allowedAct2=forgeAllowedAct2();
  main.innerHTML=
    '<div style="display:flex;gap:8px;justify-content:center;margin-bottom:10px;flex-wrap:wrap;position:static;background:var(--panel2);padding:8px 0;">'+
      '<button id="forgeAddAllBase" style="background:var(--panel2);color:var(--text);border:1px solid var(--edge);border-radius:4px;padding:6px 12px;cursor:pointer;">Add all base</button>'+
      '<button id="forgeAddAllUpgraded" style="background:var(--torch);color:var(--ink);border:0;border-radius:4px;padding:6px 12px;cursor:pointer;font-weight:600;">Add all upgraded</button>'+
      '<button id="forgeClearPage" style="background:var(--panel2);color:var(--text);border:1px solid var(--edge);border-radius:4px;padding:6px 12px;cursor:pointer;">Clear</button>'+
    '</div>'+
    '<div style="display:grid;grid-template-columns:repeat(2,minmax(0,max-content));gap:12px;align-items:start;justify-items:center;margin:0 auto;width:fit-content;">'+
      '<div><h2 style="margin:0 0 8px 0;font-size:16px;">Trinkets - Act I</h2><div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;">' + (act1Rows||'<p style="color:var(--dim);">No items found.</p>') + '</div></div>'+
      (allowedAct2 ? '<div><h2 style="margin:0 0 8px 0;font-size:16px;">Trinkets - Act II</h2><div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;">' + (act2Rows||'<p style="color:var(--dim);">No items found.</p>') + '</div></div>' : '')+
    '</div>'+
    '<div id="forgeEditor" style="margin-top:12px;"></div>';
  main.querySelectorAll('input[data-startid]').forEach(function(cb){
    cb.addEventListener('change', function(){ var id=cb.getAttribute('data-startid'); if(cb.checked && /_PLUS$/i.test(id)){ setStartInv(id.replace(/_PLUS$/i,''), false); } setStartInv(id, cb.checked); renderTrinketsCategory(); });
  });
  const addBaseBtn=main.querySelector('#forgeAddAllBase');
  if(addBaseBtn) addBaseBtn.addEventListener('click',function(){ families.forEach(function(fam){ const act=(typeof itemActOf==='function')? itemActOf({id:fam}) : 1; if(act>=2 && !allowedAct2) return; if((camp.start.items||[]).some(function(i){ return i.id=== (fam+'_PLUS') || i.id=== (fam+'_UPGRADED'); })) return; setStartInv(fam, true); }); renderTrinketsCategory(); });
  const addUpgradedBtn=main.querySelector('#forgeAddAllUpgraded');
  if(addUpgradedBtn) addUpgradedBtn.addEventListener('click',function(){ families.forEach(function(fam){ const act=(typeof itemActOf==='function')? itemActOf({id:fam}) : 1; if(act>=2 && !allowedAct2) return; setStartInv(fam+'_PLUS', true); setStartInv(fam, false); }); renderTrinketsCategory(); });
  const clearBtn=main.querySelector('#forgeClearPage');
  if(clearBtn) clearBtn.addEventListener('click',function(){ main.querySelectorAll('input[data-startid]').forEach(function(cb){ setStartInv(cb.getAttribute('data-startid'), false); }); renderTrinketsCategory(); });
}

const ENEMY_TYPE_CAPS={"0": {"family_name": "Uthuk Berserker", "cap": 4, "act": 1, "member_ids": ["ENEMY_BERSERKER_1", "ENEMY_BERSERKER_0", "ENEMY_Q4_VAGABOND", "ENEMY_EVIL_GALADEN", "ENEMY_BERSERKER_FLAYED"], "faction": "Uthuk Y'llan", "notes": "No heavy armor.", "weak_to": {"ENEMY_BERSERKER_1": ["Pierce", "Aquos"], "ENEMY_BERSERKER_0": ["Pierce"], "ENEMY_Q4_VAGABOND": ["Slash", "Lumos"], "ENEMY_EVIL_GALADEN": ["Pierce", "Aquos"], "ENEMY_BERSERKER_FLAYED": ["Pierce", "Aquos", "Terros"]}}, "1": {"family_name": "Bandit", "cap": 4, "act": 1, "member_ids": ["ENEMY_WARY_BANDIT_1", "ENEMY_BANDIT_CRAZED_1", "ENEMY_BANDIT_RUNEBLADE_1", "ENEMY_BANDIT_SHADOWALK_1", "ENEMY_Q11_OUTLAW_PRINCE", "ENEMY_Q7_BANDIT_SNIPER", "ENEMY_EVIL_CHANCE", "ENEMY_GILLIAM_1", "ENEMY_BANDIT_BARONIAL_1", "ENEMY_BANDIT_BARONIAL_ARBALESTER_1", "ENEMY_BANDIT_SNIPER_1", "ENEMY_BOSS_ORBAN"], "faction": "Wilds", "notes": "Cheap leather/cloth armor. Tamalir markets.", "weak_to": {"ENEMY_WARY_BANDIT_1": ["Pierce", "Anemos"], "ENEMY_BANDIT_CRAZED_1": ["Pierce", "Anemos", "Aquos"], "ENEMY_BANDIT_RUNEBLADE_1": ["Pierce", "Anemos", "Umbros"], "ENEMY_BANDIT_SHADOWALK_1": ["Pierce", "Anemos", "Lumos"], "ENEMY_Q11_OUTLAW_PRINCE": ["Pierce", "Anemos"], "ENEMY_Q7_BANDIT_SNIPER": ["Pierce", "Anemos", "Umbros"], "ENEMY_EVIL_CHANCE": ["Pierce", "Anemos"], "ENEMY_GILLIAM_1": ["Slash", "Mortos", "Fortunos"], "ENEMY_BANDIT_BARONIAL_1": ["Pierce", "Anemos", "Mortos"], "ENEMY_BANDIT_BARONIAL_ARBALESTER_1": ["Pierce", "Fortunos", "Mortos"], "ENEMY_BANDIT_SNIPER_1": ["Pierce", "Fortunos", "Anemos"], "ENEMY_BOSS_ORBAN": ["Pierce", "Aquos", "Fortunos"]}}, "2": {"family_name": "Zealot", "cap": 4, "act": 1, "member_ids": ["ENEMY_ZEALOT_1", "ENEMY_ZEALOT_A2_NAMED", "ENEMY_ZEALOT_BARONIAL_1", "ENEMY_ZEALOT_CRIMSON_1", "ENEMY_ZEALOT_DREAD_1", "ENEMY_ZEALOT_PALE_1", "ENEMY_ZEALOT_RUNE_OF_BLADES", "ENEMY_ZEALOT_SQ2", "ENEMY_EVIL_SYRUS", "Q13_ENEMY_FLAME_ZEALOT", "ENEMY_BOSS_GREYSDON", "ENEMY_Q4_HERMIT", "ENEMY_Q4_IGOR", "ENEMY_S2_NECROMANCER", "Q13_ENEMY_GREYSDON"], "faction": "Uthuk Y'llan", "notes": "Guards Uthuk villages/strongholds. (reclassified from an inconsistent \"Wilds (Uthuk-aligned)\" label to match the exact faction string quest files use.)", "weak_to": {"ENEMY_ZEALOT_1": ["Slash", "Ignos"], "ENEMY_ZEALOT_A2_NAMED": ["Slash", "Ignos", "Vigos"], "ENEMY_ZEALOT_BARONIAL_1": ["Slash", "Anemos", "Aquos"], "ENEMY_ZEALOT_CRIMSON_1": ["Slash", "Ignos", "Aquos"], "ENEMY_ZEALOT_DREAD_1": ["Slash", "Ignos", "Umbros"], "ENEMY_ZEALOT_PALE_1": ["Slash", "Ignos", "Lumos"], "ENEMY_ZEALOT_RUNE_OF_BLADES": ["Ignos", "Terros"], "ENEMY_ZEALOT_SQ2": ["Slash", "Ignos", "Lumos"], "ENEMY_EVIL_SYRUS": ["Slash", "Ignos"], "Q13_ENEMY_FLAME_ZEALOT": ["Pierce", "Aquos"], "ENEMY_BOSS_GREYSDON": ["Slash", "Ignos", "Umbros"], "ENEMY_Q4_HERMIT": ["Slash"], "ENEMY_Q4_IGOR": ["Slash"], "ENEMY_S2_NECROMANCER": ["Slash"], "Q13_ENEMY_GREYSDON": ["Aquos", "Umbros"]}}, "3": {"family_name": "Golem", "cap": 2, "act": 1, "member_ids": ["ENEMY_GOLEM_1", "ENEMY_GOLEM_A2_NAMED", "ENEMY_GOLEM_BARONIAL_1", "ENEMY_GOLEM_MISTWALKER_1", "ENEMY_GOLEM_Q2", "ENEMY_GOLEM_RAGESTONE_1", "ENEMY_GOLEM_RUNEBOUND_1", "ENEMY_S2_GOLEM", "ENEMY_EVIL_KEHLI", "ENEMY_DELPHYNDRAS_MISTAKE", "ENEMY_BACKBREAKER_1"], "faction": "Wilds", "notes": "Highmont Fortress. (label normalized from \"Wilds/Citadel\" to the exact faction string quest files use.)", "weak_to": {"ENEMY_GOLEM_1": ["Crush", "Aquos"], "ENEMY_GOLEM_A2_NAMED": ["Crush", "Aquos", "Terros"], "ENEMY_GOLEM_BARONIAL_1": ["Crush", "Aquos", "Mortos"], "ENEMY_GOLEM_MISTWALKER_1": ["Crush", "Aquos", "Lumos"], "ENEMY_GOLEM_Q2": ["Crush", "Aquos"], "ENEMY_GOLEM_RAGESTONE_1": ["Crush", "Aquos", "Ignos"], "ENEMY_GOLEM_RUNEBOUND_1": ["Crush", "Aquos", "Umbros"], "ENEMY_S2_GOLEM": ["Crush"], "ENEMY_EVIL_KEHLI": ["Crush", "Aquos"], "ENEMY_DELPHYNDRAS_MISTAKE": ["Crush", "Aquos", "Ignos"], "ENEMY_BACKBREAKER_1": ["Aquos", "Umbros"]}}, "4": {"family_name": "Fae", "cap": 2, "act": 1, "member_ids": ["ENEMY_FAE_1", "ENEMY_FAE_A2_NAMED", "ENEMY_FAE_HEATH_SPAWN", "ENEMY_FAE_MIST_SPAWN", "ENEMY_FAE_RU_SPAWN"], "faction": "Wilds", "notes": "Frostgate/Forthyn highlands, illusion stealth.", "weak_to": {"ENEMY_FAE_1": ["Crush", "Terros"], "ENEMY_FAE_A2_NAMED": ["Crush", "Terros"], "ENEMY_FAE_HEATH_SPAWN": ["Crush", "Terros", "Umbros"], "ENEMY_FAE_MIST_SPAWN": ["Crush", "Terros", "Lumos"], "ENEMY_FAE_RU_SPAWN": ["Crush", "Terros", "Aquos"]}}, "5": {"family_name": "Wolf", "cap": 3, "act": 1, "member_ids": ["ENEMY_SUMMONED_WOLF", "ENEMY_WOLF_1", "ENEMY_WOLF_BARONIAL_1", "ENEMY_WOLF_ELDERBONE", "ENEMY_WOLF_PUTRID", "ENEMY_WOLF_RED_EYED", "ENEMY_BOSS_ONE_FANG", "ENEMY_WOLF_S2"], "faction": "Wilds", "notes": "Woodland regions near Kell baronies.", "weak_to": {"ENEMY_SUMMONED_WOLF": ["Slash", "Anemos"], "ENEMY_WOLF_1": ["Slash", "Anemos"], "ENEMY_WOLF_BARONIAL_1": ["Slash", "Anemos", "Mortos"], "ENEMY_WOLF_ELDERBONE": ["Slash", "Anemos", "Umbros"], "ENEMY_WOLF_PUTRID": ["Slash", "Anemos", "Lumos"], "ENEMY_WOLF_RED_EYED": ["Slash", "Anemos", "Aquos"], "ENEMY_BOSS_ONE_FANG": ["Slash", "Anemos"], "ENEMY_WOLF_S2": ["Slash", "Ignos"]}}, "6": {"family_name": "Specter", "cap": 2, "act": 1, "member_ids": ["ENEMY_Q12_SPECTER", "ENEMY_SPECTER_1", "ENEMY_SPECTER_A2_NAMED", "ENEMY_SPECTER_DEATHBORN", "ENEMY_SPECTER_RUNEMARKED", "ENEMY_SUMMONED_SPECTER", "ENEMY_WRATHFUL_SPECTER", "Q8_GYLDREN"], "faction": "Waiqar's Undead Host", "notes": "Physical weapons pass through spectral forms.", "weak_to": {"ENEMY_Q12_SPECTER": [], "ENEMY_SPECTER_1": ["Anemos", "Lumos"], "ENEMY_SPECTER_A2_NAMED": ["Anemos", "Lumos", "Vigos"], "ENEMY_SPECTER_DEATHBORN": ["Anemos", "Lumos", "Umbros"], "ENEMY_SPECTER_RUNEMARKED": ["Anemos", "Lumos", "Umbros"], "ENEMY_SUMMONED_SPECTER": ["Anemos", "Lumos"], "ENEMY_WRATHFUL_SPECTER": ["Aquos", "Terros"], "Q8_GYLDREN": ["Anemos", "Lumos", "Umbros"]}}, "7": {"family_name": "Wight", "cap": 4, "act": 1, "member_ids": ["ENEMY_WIGHT_1", "ENEMY_WIGHT_BLOODGUARD", "ENEMY_EVIL_BRYNN"], "faction": "Waiqar's Undead Host", "notes": "Undead reinforcements, corrupted battlefields.", "weak_to": {"ENEMY_WIGHT_1": ["Crush", "Lumos"], "ENEMY_WIGHT_BLOODGUARD": ["Crush", "Lumos", "Toxos"], "ENEMY_EVIL_BRYNN": ["Crush", "Lumos"]}}, "8": {"family_name": "Hybrid Harbinger", "cap": 4, "act": 1, "member_ids": ["ENEMY_HARBINGER_1", "ENEMY_HARBINGER_BARONIAL_1", "ENEMY_HARBINGER_SELLSWORD", "ENEMY_HARBINGER_VANGUARD_1", "ENEMY_FIREBREATHER", "ENEMY_LT_DRYS", "ENEMY_LT_EIZ", "ENEMY_LT_ZERAI", "ENEMY_BOSS_XAIN", "ENEMY_EVIL_VAERIX"], "faction": "Dragon-Kin", "notes": "Leathery wings are the vulnerability point.", "weak_to": {"ENEMY_HARBINGER_1": ["Pierce", "Umbros"], "ENEMY_HARBINGER_BARONIAL_1": ["Pierce", "Mortos"], "ENEMY_HARBINGER_SELLSWORD": ["Pierce", "Toxos"], "ENEMY_HARBINGER_VANGUARD_1": ["Slash", "Pierce", "Umbros"], "ENEMY_FIREBREATHER": ["Pierce", "Umbros"], "ENEMY_LT_DRYS": ["Pierce", "Umbros"], "ENEMY_LT_EIZ": ["Pierce", "Umbros"], "ENEMY_LT_ZERAI": ["Pierce", "Umbros"], "ENEMY_BOSS_XAIN": ["Slash", "Umbros"], "ENEMY_EVIL_VAERIX": ["Pierce", "Umbros"]}}, "9": {"family_name": "Hybrid Centurion", "cap": 1, "act": 1, "member_ids": ["ENEMY_CENTURIAN_3", "ENEMY_CENTURIAN_VANGUARD_1", "ENEMY_Q13_XENITH", "UNUSED_ENEMY_Q14_XENITH", "ENEMY_Q14_XENITH", "ENEMY_Q7_XENITH", "ENEMY_DRAGON_SCULPT", "ENEMY_BOSS_NAZGESH", "ENEMY_Q8_XENITH"], "faction": "Dragon-Kin", "notes": "Thick plate-like scales.", "weak_to": {"ENEMY_CENTURIAN_3": ["Aquos", "Umbros"], "ENEMY_CENTURIAN_VANGUARD_1": ["Aquos", "Umbros"], "ENEMY_Q13_XENITH": ["Aquos", "Umbros"], "UNUSED_ENEMY_Q14_XENITH": ["Aquos", "Umbros"], "ENEMY_Q14_XENITH": ["Aquos", "Umbros"], "ENEMY_Q7_XENITH": ["Aquos", "Umbros"], "ENEMY_DRAGON_SCULPT": ["Pierce"], "ENEMY_BOSS_NAZGESH": ["Vigos", "Umbros"], "ENEMY_Q8_XENITH": ["Aquos", "Umbros"]}}, "10": {"family_name": "Uthuk Blood Witch", "cap": 4, "act": 1, "member_ids": ["ENEMY_BLOOD_SISTER_1", "ENEMY_BLOOD_SISTER_NIGHT", "ENEMY_BLOOD_SISTER_UNDEAD", "ENEMY_INTRO_BOSS", "ENEMY_BOSS_EURTH", "ENEMY_MISTWITCH", "ENEMY_Q12_NE_KRUL_1", "ENEMY_Q12_NE_KRUL_2", "ENEMY_Q8_BOSS_NE'KRUL", "ENEMY_Q8_E2_BOSS_UTHUK", "ENEMY_Q9_NEKRUL"], "faction": "Uthuk Y'llan", "notes": "Blood/void corruption rituals at ruined strongholds.", "weak_to": {"ENEMY_BLOOD_SISTER_1": ["Slash", "Aquos"], "ENEMY_BLOOD_SISTER_NIGHT": ["Slash", "Aquos", "Terros"], "ENEMY_BLOOD_SISTER_UNDEAD": ["Slash", "Aquos", "Lumos"], "ENEMY_INTRO_BOSS": ["Slash"], "ENEMY_BOSS_EURTH": ["Slash", "Aquos", "Vigos"], "ENEMY_MISTWITCH": ["Slash", "Aquos"], "ENEMY_Q12_NE_KRUL_1": ["Slash", "Aquos"], "ENEMY_Q12_NE_KRUL_2": ["Slash", "Aquos"], "ENEMY_Q8_BOSS_NE'KRUL": ["Slash", "Aquos"], "ENEMY_Q8_E2_BOSS_UTHUK": ["Slash", "Aquos"], "ENEMY_Q9_NEKRUL": ["Slash", "Aquos"]}}, "11": {"family_name": "Doomcaller", "cap": 2, "act": 2, "member_ids": ["ENEMY_DOOMCALLER_1", "ENEMY_NAVOTH_1", "ENEMY_THE_BAILIFF", "ENEMY_BOSS_KHAMPANAX"], "faction": "Waiqar's Undead Host", "notes": "Dark ritualists and death-cult servants channeling necromantic power; light robes, no armor.", "weak_to": {"ENEMY_DOOMCALLER_1": ["Slash", "Umbros", "Mortos"], "ENEMY_NAVOTH_1": ["Umbros", "Mortos"], "ENEMY_THE_BAILIFF": ["Slash", "Fortunos", "Umbros"], "ENEMY_BOSS_KHAMPANAX": ["Slash", "Umbros", "Toxos"]}}, "12": {"family_name": "Dragon", "cap": 1, "act": 2, "member_ids": ["ENEMY_DRAGON_1", "ENEMY_DRAGON_ELDER", "ENEMY_A2Q11_LEVIRAX_A", "ENEMY_A2Q11_LEVIRAX_B", "ENEMY_A2Q11_LEVIRAX_C"], "faction": "Dragon-Kin", "notes": "True dragons and dragonlord-aligned creatures (including the LeViraX line); heavy natural armor.", "weak_to": {"ENEMY_DRAGON_1": ["Pierce", "Vigos"], "ENEMY_DRAGON_ELDER": ["Pierce", "Vigos", "Umbros"], "ENEMY_A2Q11_LEVIRAX_A": ["Vigos"], "ENEMY_A2Q11_LEVIRAX_B": ["Vigos"], "ENEMY_A2Q11_LEVIRAX_C": ["Vigos"]}}, "13": {"family_name": "Salamander", "cap": 2, "act": 2, "member_ids": ["ENEMY_SALAMANDER_1", "ENEMY_SALAMANDER_MOLTEN", "ENEMY_BOSS_ZADIE"], "faction": "Dragon-Kin", "notes": "Fire-elemental reptiles; natural resistance to fire-aligned attacks.", "weak_to": {"ENEMY_SALAMANDER_1": ["Crush", "Mortos"], "ENEMY_SALAMANDER_MOLTEN": ["Crush", "Mortos", "Umbros"], "ENEMY_BOSS_ZADIE": ["Crush", "Umbros"]}}, "14": {"family_name": "Vampire", "cap": 2, "act": 2, "member_ids": ["ENEMY_VAMPIRE_1", "ENEMY_GILLIAM_2", "ENEMY_VAMPIRE_NAMED", "ENEMY_RENEYR_1"], "faction": "Waiqar's Undead Host", "notes": "Undead bloodline creatures; no armor, high mobility.", "weak_to": {"ENEMY_VAMPIRE_1": ["Pierce", "Ignos", "Lumos", "Vigos"], "ENEMY_GILLIAM_2": ["Pierce", "Ignos", "Lumos", "Vigos"], "ENEMY_VAMPIRE_NAMED": ["Pierce", "Lumos", "Vigos"], "ENEMY_RENEYR_1": ["Pierce", "Ignos", "Lumos"]}}, "15": {"family_name": "Reanimate", "cap": 4, "act": 2, "member_ids": ["ENEMY_REANIMATE_1", "ENEMY_REANIMATE_FAMILIAR"], "faction": "Waiqar's Undead Host", "notes": "Reanimated corpses raised as soldiers; brittle, no armor.", "weak_to": {"ENEMY_REANIMATE_1": ["Crush", "Vigos"], "ENEMY_REANIMATE_FAMILIAR": ["Crush", "Ignos", "Vigos"]}}, "16": {"family_name": "Viper Legionnaire", "cap": 4, "act": 2, "member_ids": ["ENEMY_VIPER_1", "ENEMY_BOSS_VRASKHAR", "A2Q01_VRASKHAR", "ENEMY_BOSS_ATHROK"], "faction": "Dragon-Kin", "notes": "Serpentine legionnaires fighting in disciplined formation; moderate natural armor.", "weak_to": {"ENEMY_VIPER_1": ["Slash", "Aquos", "Fortunos"], "ENEMY_BOSS_VRASKHAR": ["Slash", "Aquos", "Fortunos"], "A2Q01_VRASKHAR": ["Slash", "Aquos", "Mortos"], "ENEMY_BOSS_ATHROK": ["Anemos", "Aquos", "Fortunos"]}}, "17": {"family_name": "Mercenary", "cap": 4, "act": 2, "member_ids": ["ENEMY_MERCENARY_1", "ENEMY_MERCENARY_BARONIAL_1", "ENEMY_MERCENARY_BLOODTHIRSTY", "ENEMY_MERCENARY_FALLEN", "ENEMY_MERCENARY_TARNISHED", "ENEMY_MERCENARY_WYRMBOUND", "A2Q02_ENEMY_MORANT", "ENEMY_BOSS_HOARY_FOX", "ENEMY_ZACHARETH_1"], "faction": "Wilds", "notes": "Hired blades and opportunists, same broad grouping as the Act 1 Bandit family; light-to-moderate armor.", "weak_to": {"ENEMY_MERCENARY_1": ["Pierce", "Toxos", "Ignos"], "ENEMY_MERCENARY_BARONIAL_1": ["Pierce", "Ignos", "Mortos"], "ENEMY_MERCENARY_BLOODTHIRSTY": ["Pierce", "Mortos", "Ignos"], "ENEMY_MERCENARY_FALLEN": ["Pierce", "Vigos", "Ignos"], "ENEMY_MERCENARY_TARNISHED": ["Vigos", "Mortos"], "ENEMY_MERCENARY_WYRMBOUND": ["Pierce", "Toxos", "Anemos"], "A2Q02_ENEMY_MORANT": ["Pierce", "Lumos", "Terros"], "ENEMY_BOSS_HOARY_FOX": ["Crush", "Toxos", "Ignos"], "ENEMY_ZACHARETH_1": ["Aquos", "Toxos", "Fortunos"]}}};
let enemyMechFilter=[];
let enemyThemeFilter=[];
let enemyFilterMode='and'; // 'and' = all selected, 'or' = any selected
let enemyPoolsSelected=0;
function ensureCustomEnemies(){ if(!camp || typeof camp!=='object') camp={}; if(!Array.isArray(camp.customEnemies)) camp.customEnemies=[]; return camp.customEnemies; }
const LOCKED_THEME_TRAITS=['Construct','Cold','Creature','Dragonkind','Fire','Humanoid','Incorporeal','Intelligent','Otherworldly','Water','Subterranean'];
function _lockedThemeTraits(baseId){
  const e=( (typeof DATA!=='undefined' && Array.isArray(DATA.enemies))? DATA.enemies.find(function(z){return z.id===baseId;}) : null );
  const th=(e && Array.isArray(e.theme))? e.theme : [];
  return th.filter(function(t){ return LOCKED_THEME_TRAITS.indexOf(t)>=0; });
}
function _sizeTraits(baseId){
  const e=( (typeof DATA!=='undefined' && Array.isArray(DATA.enemies))? DATA.enemies.find(function(z){return z.id===baseId;}) : null );
  const mech=(e && Array.isArray(e.mech))? e.mech : [];
  return mech.filter(function(t){ return t==='Huge' || t==='Small'; });
}
function _baseWeaknesses(baseId){
  if(!baseId || typeof ENEMY_TYPE_CAPS==='undefined') return [];
  const keys=Object.keys(ENEMY_TYPE_CAPS);
  for(let i=0;i<keys.length;i++){
    const fam=ENEMY_TYPE_CAPS[keys[i]];
    if((fam.member_ids||[]).indexOf(baseId)>=0 && fam.weak_to && fam.weak_to[baseId]){
      return (fam.weak_to[baseId]||[]).map(function(t){return {damage:t,kind:'weakness',when:'always'};});
    }
  }
  return [];
}
function _baseTiers(baseId){
  const e=((typeof DATA!=='undefined' && Array.isArray(DATA.enemies))? DATA.enemies.find(function(z){return z.id===baseId;}) : null);
  const tiers=(e && Array.isArray(e.tiers) && e.tiers.length)? e.tiers : [1];
  return tiers.map(function(t){ const st=(e && e.tierStats && e.tierStats[t]) ? e.tierStats[t] : {hp:(e&&e.hp)||40, def:(e&&e.def)||2, atk:(e&&e.atk)||2}; return {tier:+t, health:st.hp, defense:st.def, attack:st.atk}; });
}

function _baseExtra(baseId){
  if (baseId==='ENEMY_WARY_BANDIT_1') return {activation:'Serrated Bolt: During the defense, the first time the hero places a fatigue on a card, they also scar it.', tactics:'Tactic 1:\nThe Bandit sprints forward then backflips into the air, launching knives and bolts in all directions!\n\nMove to within 3 spaces of as many heroes as possible. Then, this attack targets all heroes within range.\n\nTactic 2:\nThe Bandit leaps from the defensive posture, daggers twirling through nimble fingers.\n\nTactic 3:\nBloodlust: After the Attack, the target is pushed 2 spaces.', defense:'Smokebomb: After the attack, this enemy shifts 2 away from the hero.'};
  return {activation:'', tactics:'', defense:''};
}


function _forgeWeaknessesFromExisting(existing, baseHint){
  if (existing && Array.isArray(existing.weaknesses) && existing.weaknesses.length) return existing.weaknesses.slice();
  if (existing && Array.isArray(existing.wr) && existing.wr.length) {
    return existing.wr.map(function(w){ const parts=w.split(':'); return {damage:parts[0], kind:parts[1]==='R'?'resist':'weakness', when:'always'}; });
  }
  const bid = (existing && existing.base) || baseHint || (existing && existing.id);
  return _baseWeaknesses(bid);
}


function _externalBaseEnemyED(baseId){
  const gd = window.DESCENTFORGE_EXTERNAL_GAME_DATA;
  if(!gd) return null;
  const src = (gd.catalogo) ? gd.catalogo : gd;
  const mons = Array.isArray(src.monstros)? src.monstros : [];
  return mons.find(function(m){ const id=m._id||m.id||m.Id; return id===baseId; }) || null;
}
function _resolveExternalActivationED(ref, gd){
  if(!ref) return null;
  const src = (gd && gd.catalogo) ? gd.catalogo : (gd||{});
  const acts = src.ativacoes || {};
  if(ref.id && acts[ref.id]) return acts[ref.id];
  if(ref.ref){ const f=Object.values(acts).find(function(a){return a._name===ref.ref;}); if(f) return f; }
  if(typeof ref==='string'){ if(acts[ref]) return acts[ref]; const f=Object.values(acts).find(function(a){return a._name===ref;}); if(f) return f; }
  if(ref.speed!==undefined || ref.text_en!==undefined || ref.hint_en!==undefined || ref.text!==undefined) return ref;
  return null;
}
function _externalActivationTextsED(ext, gd){
  const out={activation:'', tactics:''};
  if(!ext) return out;
  const arrs = [ {src: ext.Activations || ext.activations || [], target:'activation'}, {src: ext.ManualActivations || ext.manualActivations || [], target:'tactics'} ];
  arrs.forEach(function(w){
    const lines=[];
    (w.src||[]).forEach(function(ref){
      const a=_resolveExternalActivationED(ref, gd);
      if(!a) return;
      const name = a._name || a.name || '';
      const text = a.text_en || a.text || '';
      const hint = a.hint_en || a.hint || '';
      const stats = [];
      if(a.speed!==undefined) stats.push('Speed '+a.speed);
      if(a.damage!==undefined) stats.push('Damage '+a.damage);
      if(a.aim!==undefined) stats.push('Aim '+a.aim);
      if(a.attack!==undefined) stats.push('Attack '+a.attack);
      if(a.range!==undefined) stats.push('Range '+a.range);
      if(a.healing!==undefined) stats.push('Healing '+a.healing);
      if(a.shield!==undefined) stats.push('Shield '+a.shield);
      if(a.initiative!==undefined) stats.push('Initiative '+a.initiative);
      if(a.rangeType!==undefined||a.RangeType!==undefined) stats.push('RangeType '+(a.rangeType||a.RangeType));
      if(a.next!==undefined|| (a.NextActivation && (a.NextActivation.id||a.NextActivation._name))) stats.push('Next '+(a.next||(a.NextActivation&&(a.NextActivation.id||a.NextActivation._name))||''));
      let block='';
      if(name) block += name+': ';
      if(text) block += text;
      if(hint) block += (block?'
':'')+'Hint: '+hint;
      if(stats.length) block += (block?'
':'')+'('+stats.join(', ')+')';
      if(block) lines.push(block);
    });
    out[w.target]=lines.join('

');
  });
  return out;
}


function openForgeCustomEnemy(id, baseHint){ console.log("OPEN", "id=",id,"baseHint=",baseHint,"tiers=", (id && ensureCustomEnemies().find(c=>c.id===id)&&ensureCustomEnemies().find(c=>c.id===id).tiers) ? "yes":"no");
  const list=ensureCustomEnemies();
    let existing=id? list.find(function(c){return c.id===id;}) : null;
  if (!existing && baseHint) {
    existing = list.find(function(c){return c.id===baseHint || c.base===baseHint;}) ||
      ((typeof state!=='undefined' && state && Array.isArray(state.custom&&state.custom.enemies))? state.custom.enemies.find(function(c){return c.id===baseHint || c.base===baseHint;}): null) ||
      ((typeof DATA!=='undefined' && Array.isArray(DATA.enemies))? DATA.enemies.find(function(e){return e.id===baseHint && e.custom;}) : null);
  }
  let baseId = baseHint || (existing? existing.base : null);
  if(!baseId && id && (typeof DATA!=='undefined' && Array.isArray(DATA.enemies) && DATA.enemies.some(function(e){return e.id===id;}))) baseId=id;
  const baseEnemy = (typeof DATA!=='undefined' && Array.isArray(DATA.enemies))? DATA.enemies.find(function(e){return e.id===baseId;}) : null;
  const c=existing || {id: (baseId? ('CUSTOM_'+baseId) : ('CUSTOM_ENEMY_'+(list.length+1))), name:(baseEnemy && (baseEnemy.name_en||baseEnemy.name)) || ('Custom monster '+(list.length+1)), base: (baseId||''), hp:(baseEnemy? baseEnemy.hp : 40), def:(baseEnemy? baseEnemy.def : 2), atk:(baseEnemy? baseEnemy.atk : 2), mech:(baseEnemy && Array.isArray(baseEnemy.mech))? baseEnemy.mech.filter(function(t){return t!=='Huge' && t!=='Small';}).slice() : [], theme:(baseEnemy && Array.isArray(baseEnemy.theme))? baseEnemy.theme.slice() : [], weaknesses: _forgeWeaknessesFromExisting(existing, baseId) };
  if (!Array.isArray(c.tiers) || !c.tiers.length) c.tiers = _baseTiers(c.base || baseId);
  if (!c.activation) c.activation = _baseExtra(c.base || baseId).activation || (baseEnemy && baseEnemy.activation) || '';
  if (!c.tactics) c.tactics = _baseExtra(c.base || baseId).tactics || (baseEnemy && baseEnemy.tactics) || '';
  // pull detailed activation data from externally loaded game data (if available)
  try {
    const ext = _externalBaseEnemyED(c.base || baseId || id);
    if (ext) {
      const gd = window.DESCENTFORGE_EXTERNAL_GAME_DATA;
      const texts = _externalActivationTextsED(ext, gd);
      if (texts.activation && (!c.activation || !String(c.activation).trim())) c.activation = texts.activation;
      if (texts.tactics && (!c.tactics || !String(c.tactics).trim())) c.tactics = texts.tactics;
    }
  } catch(e){ console.warn('external activation pull failed', e); }

  if (c.defense==null && c.defence!=null) c.defense = c.defence;
  if (!c.defense) c.defense = _baseExtra(c.base || baseId).defense || (baseEnemy && baseEnemy.defense) || '';
  if (c.tiers && c.tiers.length) { c.hp=c.tiers[0].health; c.def=c.tiers[0].defense; c.atk=c.tiers[0].attack; }

  const bases=((typeof DATA!=='undefined' && Array.isArray(DATA.enemies))? DATA.enemies : []);
  const baseOpts=bases.map(function(e){ return '<option value="'+esc(e.id)+'" '+(e.id===c.base?'selected':'')+'>'+esc(e.name_en||e.name||e.id)+'</option>'; }).join('');
  const sizeTraits=_sizeTraits(c.base);
  const lockedSizeOpts=['Huge','Small'].map(function(t){ return '<label style="font-size:11px;margin-right:8px;opacity:.7;"><input type="checkbox" value="'+esc(t)+'" '+(sizeTraits.indexOf(t)>=0?'checked':'')+' disabled> '+esc(t)+' (locked)</label>'; }).join('');
  const _MEC=(typeof MECANICOS!=='undefined')?MECANICOS:['Melee','Ranged','Striker','Tank','Support','Debuffer','Fast','Slow','Flying','Huge','Small'];
  const mechAll=_MEC.filter(function(t){return t!=='Huge' && t!=='Small';});
  const mechOpts=mechAll.map(function(t){ return '<label style="font-size:11px;margin-right:8px;"><input type="checkbox" value="'+esc(t)+'" data-cm="mech" '+( (c.mech||[]).indexOf(t)>=0 ? 'checked' : '')+'> '+esc(t)+'</label>'; }).join('');
  const _TEM=(typeof TEMATICOS!=='undefined')?TEMATICOS:['Intelligent','Creature','Undead','Dragonkind','Uthuk','Otherworldly','Construct','Wild'];
  const lockedThemeTraits=LOCKED_THEME_TRAITS.slice();
  const themeTypeList=['Undead','Dragonkind','Uthuk','Wild','Raider','Mercenary'];
  const themeFactionList=['UndeadFaction','UthukFaction','DragonFaction','BaronialFaction'];
  const themeTypeTraits=_TEM.filter(function(t){return themeTypeList.indexOf(t)>=0 && lockedThemeTraits.indexOf(t)<0;});
  const themeFactionTraits=_TEM.filter(function(t){return themeFactionList.indexOf(t)>=0 && lockedThemeTraits.indexOf(t)<0;});
  const themeFeatureTraits=_TEM.filter(function(t){return themeTypeList.indexOf(t)<0 && themeFactionList.indexOf(t)<0 && lockedThemeTraits.indexOf(t)<0;});
  const mkTheme=function(arr){ return arr.map(function(t){ return '<label style="font-size:11px;margin-right:8px;"><input type="checkbox" value="'+esc(t)+'" data-cm="theme" '+( (c.theme||[]).indexOf(t)>=0 ? 'checked' : '')+'> '+esc(t)+'</label>'; }).join(''); };
  const themeOpts=(themeTypeTraits.length? '<div style="font-size:10px;color:var(--dim);margin-bottom:2px;">Type</div><br><div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:6px;">'+mkTheme(themeTypeTraits)+'</div>' : '')+
    (themeFactionTraits.length? '<div style="font-size:10px;color:var(--dim);margin-bottom:2px;">Faction</div><br><div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:6px;">'+mkTheme(themeFactionTraits)+'</div>' : '')+
    (themeFeatureTraits.length? '<div style="font-size:10px;color:var(--dim);margin-bottom:2px;">Feature</div><br><div style="display:flex;flex-wrap:wrap;gap:6px;">'+mkTheme(themeFeatureTraits)+'</div>' : '');
  const lockedThemeOpts=lockedThemeTraits.map(function(t){ return '<label style="font-size:11px;margin-right:8px;"><input type="checkbox" value="'+esc(t)+'" data-cm="theme" '+((c.theme||[]).indexOf(t)>=0?'checked':'')+'> '+esc(t)+'</label>'; }).join('');
  const portraitSrc=(typeof arte==='function' && typeof ASSETS!=='undefined' && ASSETS.enemyFamily)? arte('portraits', (ASSETS.enemyFamily[c.base]||'')) : '';
  const body=
    (portraitSrc? '<div style="text-align:center;margin-bottom:8px;"><img src="'+portraitSrc+'" style="width:64px;height:64px;object-fit:contain;background:var(--ink);border:1px solid var(--edge);border-radius:4px;"></div>' : '')+
    '<div class="field"><label>ID</label><input id="fce_id" value="'+esc(c.id)+'" style="width:100%;padding:6px 8px;border:1px solid var(--edge);background:var(--panel2);color:var(--text);border-radius:4px;box-sizing:border-box;"></div>'+
    '<div class="field"><label>Name</label><input id="fce_name" value="'+esc(c.name||'')+'" style="width:100%;padding:6px 8px;border:1px solid var(--edge);background:var(--panel2);color:var(--text);border-radius:4px;box-sizing:border-box;"></div>'+
    '<div class="field"><label>Base enemy</label><select id="fce_base" style="width:100%;padding:6px 8px;border:1px solid var(--edge);background:var(--panel2);color:var(--text);border-radius:4px;box-sizing:border-box;">'+baseOpts+'</select></div>'+
    '<label class="chk" style="margin-bottom:8px;display:block;"><input type="checkbox" id="fce_named" '+(c.named?'checked':'')+'> Named</label>'+
    '<div class="field"><label>HP</label><input id="fce_hp" type="number" value="'+esc(c.hp)+'" style="width:100%;padding:6px 8px;border:1px solid var(--edge);background:var(--panel2);color:var(--text);border-radius:4px;box-sizing:border-box;"></div>'+
    '<div class="field"><label>DEF</label><input id="fce_def" type="number" value="'+esc(c.def)+'" style="width:100%;padding:6px 8px;border:1px solid var(--edge);background:var(--panel2);color:var(--text);border-radius:4px;box-sizing:border-box;"></div>'+
    '<div class="field"><label>ATK</label><input id="fce_atk" type="number" value="'+esc(c.atk)+'" style="width:100%;padding:6px 8px;border:1px solid var(--edge);background:var(--panel2);color:var(--text);border-radius:4px;box-sizing:border-box;"></div>'+
    '<div class="field"><label>Weaknesses / Resistances</label>'+
      '<div id="fce_weak_rows" style="display:flex;flex-direction:column;gap:4px;margin-bottom:6px;"></div>'+
      '<button id="fce_wadd" class="sm" style="background:var(--panel2);color:var(--text);border:1px solid var(--edge);border-radius:4px;padding:2px 8px;cursor:pointer;font-size:11px;">'+esc('Add')+'</button>'+
    '</div>'+
    '<div class="field"><label>Tiers (stats per hero count)</label>'+
      '<div id="fce_tiers" style="display:flex;flex-direction:column;gap:6px;margin-bottom:6px;"></div>'+
    '</div>'+
    '<div class="field"><label>Mechanical traits</label><div style="display:flex;flex-wrap:wrap;gap:6px;">'+mechOpts+'</div><p class="help" style="font-size:11px;margin-top:4px;">Huge/Small are inherited from the base and shown in Advanced.</p></div>'+
    '<div class="field"><label>Theme traits</label><div style="display:flex;flex-wrap:wrap;gap:6px;">'+themeOpts+'</div><p class="help" style="font-size:11px;margin-top:4px;">Locked traits (inherited from base): '+((_lockedThemeTraits(c.base)).length? _lockedThemeTraits(c.base).join(', ') : 'none')+'</p></div>'+
    '<div class="field"><label>Activation</label><input id="fce_activation" value="'+esc(c.activation||'')+'" style="width:100%;padding:6px 8px;border:1px solid var(--edge);background:var(--panel2);color:var(--text);border-radius:4px;box-sizing:border-box;"></div>'+
    '<div class="field"><label>Tactics</label><input id="fce_tactics" value="'+esc(c.tactics||'')+'" style="width:100%;padding:6px 8px;border:1px solid var(--edge);background:var(--panel2);color:var(--text);border-radius:4px;box-sizing:border-box;"></div>'+
    '<div class="field"><label>Defense</label><input id="fce_defense" value="'+esc(c.defense||'')+'" style="width:100%;padding:6px 8px;border:1px solid var(--edge);background:var(--panel2);color:var(--text);border-radius:4px;box-sizing:border-box;"></div>'+
    '<button id="fce_advanced" class="sm" style="margin-top:4px;background:var(--panel2);color:var(--text);border:1px solid var(--edge);border-radius:4px;padding:4px 8px;cursor:pointer;font-size:11px;">Advanced (edit locked)</button>'+
    '<div id="fce_adv" style="display:none;margin-top:6px;padding:6px;border:1px dashed var(--edge);border-radius:4px;">'+
      '<div style="font-size:10px;color:var(--dim);margin-bottom:4px;margin-top:2px;">Size traits (locked)</div><div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:6px;">'+lockedSizeOpts+'</div>'+
      '<div style="font-size:10px;color:var(--dim);margin-bottom:4px;margin-top:6px;">Locked theme traits</div><div style="display:flex;flex-wrap:wrap;gap:6px;">'+lockedThemeOpts+'</div>'+
    '</div>';
  if(typeof openDlg==='function'){ openDlg('Custom monster', body, '<button id="fce_save" class="primary">Save</button><button id="fce_cancel">Cancel</button>');
    try { const _d=document.getElementById('dlg'); if(_d){ _d.style.maxWidth='980px'; const _h=()=>{ _d.style.maxWidth=''; _d.removeEventListener('close',_h); }; _d.addEventListener('close',_h); } } catch(e){} }
  else { alert('Dialog not available'); return; }

  const TRAIT_LIST=['Crush','Slash','Pierce','Ignos','Anemos','Aquos','Terros','Lumos','Umbros','Vigos','Mortos','Toxos','Fortunos'];
  function renderWeakRows(){
    const box=document.getElementById('fce_weak_rows'); if(!box) return;
    box.innerHTML=(c.weaknesses||[]).map(function(w,i){
      return '<div class="twfila" style="display:grid;grid-template-columns:minmax(120px,1fr) 110px 28px;gap:6px;align-items:center;margin-bottom:4px;">'+
        '<select data-fcew="'+i+'|damage" style="width:100%;padding:5px 8px;border:1px solid var(--edge);background:var(--panel2);color:var(--text);border-radius:4px;font-size:12px;">'+TRAIT_LIST.map(function(d){return '<option '+(d===w.damage?'selected':'')+'>'+esc(d)+'</option>';}).join('')+'</select>'+
        '<select data-fcew="'+i+'|kind" style="width:100%;padding:5px 8px;border:1px solid var(--edge);background:var(--panel2);color:var(--text);border-radius:4px;font-size:12px;"><option value="weakness" '+(w.kind!=='resist'?'selected':'')+'>Weakness</option><option value="resist" '+(w.kind==='resist'?'selected':'')+'>Resist</option></select>'+
        '<button class="sm" data-fcewdel="'+i+'" style="background:var(--panel2);color:var(--text);border:1px solid var(--edge);border-radius:4px;padding:2px 4px;cursor:pointer;font-size:11px;">X</button>'+
      '</div>';
    }).join('') || '<p class="empty" style="color:var(--dim);font-size:11px;margin:4px 0;">No weakness/resistance entries.</p>';
    box.querySelectorAll('[data-fcew]').forEach(function(sel){
      sel.addEventListener('change', function(){
        const parts=sel.getAttribute('data-fcew').split('|');
        if(!c.weaknesses[+parts[0]]) return;
        c.weaknesses[+parts[0]][parts[1]]=sel.value;
      });
    });
    box.querySelectorAll('[data-fcewdel]').forEach(function(btn){
      btn.addEventListener('click', function(){
        c.weaknesses.splice(+btn.getAttribute('data-fcewdel'),1);
        renderWeakRows();
      });
    });
  }
  renderWeakRows();
  const tierBox=document.getElementById('fce_tiers');
  const renderTierRows=function(){
    if(!tierBox) return;
    tierBox.innerHTML=(c.tiers||[]).map(function(t,idx){
      return '<div style="display:grid;grid-template-columns:60px 1fr 1fr 1fr;gap:6px;align-items:center;">'+
        '<span style="font-size:12px;color:var(--dim);">Tier '+esc(t.tier)+'</span>'+
        '<input data-fcetier="'+idx+'|health" type="number" value="'+esc(t.health)+'" placeholder="HP" style="padding:4px 6px;border:1px solid var(--edge);background:var(--panel2);color:var(--text);border-radius:4px;font-size:12px;">'+
        '<input data-fcetier="'+idx+'|defense" type="number" value="'+esc(t.defense)+'" placeholder="DEF" style="padding:4px 6px;border:1px solid var(--edge);background:var(--panel2);color:var(--text);border-radius:4px;font-size:12px;">'+
        '<input data-fcetier="'+idx+'|attack" type="number" value="'+esc(t.attack)+'" placeholder="ATK" style="padding:4px 6px;border:1px solid var(--edge);background:var(--panel2);color:var(--text);border-radius:4px;font-size:12px;">'+
      '</div>';
    }).join('');
  };
  renderTierRows();
  const baseSel=document.getElementById('fce_base');
  if(baseSel) baseSel.addEventListener('change', function(){ c.base=baseSel.value; c.weaknesses=_baseWeaknesses(baseSel.value).slice(); c.tiers=_baseTiers(baseSel.value); renderWeakRows(); renderTierRows(); });
  const wadd=document.getElementById('fce_wadd');
  if(wadd) wadd.addEventListener('click', function(){ (c.weaknesses=c.weaknesses||[]).push({damage:TRAIT_LIST[0],kind:'weakness',when:'always'}); renderWeakRows(); });
  // parse mech/theme on save unchanged; also ensure weaknesses remains c.weaknesses
  const save=document.getElementById('fce_save');
  if(save) save.onclick=function(){
    const mechVals=[].slice.call(document.querySelectorAll('[data-cm="mech"]:checked')).map(function(x){return x.value;});
    const themeVals=[].slice.call(document.querySelectorAll('[data-cm="theme"]:checked')).map(function(x){return x.value;});
    const parsedTiers=(c.tiers||[]).map(function(t,idx){
      const h=document.querySelector('[data-fcetier="'+idx+'|health"]');
      const d=document.querySelector('[data-fcetier="'+idx+'|defense"]');
      const a=document.querySelector('[data-fcetier="'+idx+'|attack"]');
      return {tier:+t.tier, health:Math.max(1,parseInt(h&&h.value,10)||t.health), defense:Math.max(0,parseInt(d&&d.value,10)||t.defense), attack:Math.max(0,parseInt(a&&a.value,10)||t.attack)};
    });
    const nc={id:(document.getElementById('fce_id').value.trim()||c.id), name:(document.getElementById('fce_name').value.trim()||c.id), base:document.getElementById('fce_base').value, hp:(parsedTiers[0]&&parsedTiers[0].health)||c.hp, def:(parsedTiers[0]&&parsedTiers[0].defense)||c.def, atk:(parsedTiers[0]&&parsedTiers[0].attack)||c.atk, tiers:parsedTiers, mech: mechVals.concat(_sizeTraits(document.getElementById('fce_base').value)), theme:themeVals, activation:(document.getElementById('fce_activation').value.trim()), tactics:(document.getElementById('fce_tactics').value.trim()), defense:(document.getElementById('fce_defense').value.trim()), weaknesses:(c.weaknesses||[]), named: (document.getElementById('fce_named') && document.getElementById('fce_named').checked)};
    const originalId=id;
    const list2=ensureCustomEnemies();
    // Update or append in the Forge bank by the ORIGINAL selection id.
    const _idx2=list2.findIndex(function(z){return z.id===originalId;});
    if(_idx2>=0) list2[_idx2]=nc; else list2.push(nc);
    camp.customEnemies=list2;
    // mirror to Workshop state bank (so it is a real .dmap custom enemy / DATA).
    try {
      if (typeof state !== 'undefined' && state) {
        if (!state.custom || typeof state.custom!=='object') state.custom={enemies:[]};
        if (!Array.isArray(state.custom.enemies)) state.custom.enemies=[];
        const baseEnemy=(typeof DATA!=='undefined' && Array.isArray(DATA.enemies))? DATA.enemies.find(function(e){return e.id===nc.base;}): null;
        const tierNums=(baseEnemy && Array.isArray(baseEnemy.tiers) && baseEnemy.tiers.length)? baseEnemy.tiers : [1];
        const tall={id:nc.id,name:nc.name,base:nc.base,named:!!nc.named,
          tiers:tierNums.map(function(t){ return {tier:+t, health:nc.hp, defense:nc.def, attack:nc.atk}; }),
          mechanical:(nc.mech||[]).slice(),theme:(nc.theme||[]).slice(),
          weaknesses:(nc.weaknesses||[]).map(function(w){return {damage:w.damage, kind:w.kind, when:w.when||'always'};})};
        const si=state.custom.enemies.findIndex(function(c){return c.id===originalId;});
        if (si>=0) state.custom.enemies[si]=tall; else state.custom.enemies.push(tall);
        if (typeof sincronizarTaller === 'function') sincronizarTaller();
      }
    } catch(e){ console.warn('Forge->Scenario custom sync failed', e && (e.stack||e)); }
    // Instantly register the Forge custom monster in DATA so it can be placed in the map editor.
    try {
      const baseEnemy = (typeof delJuego==='function'?delJuego():DATA.enemies).find(function(e){return e.id===nc.base;}) ||
        (DATA.enemies||[]).find(function(e){return e.id===nc.base;});
      if (baseEnemy) {
        for (let i=DATA.enemies.length-1;i>=0;i--) {
          if (DATA.enemies[i].custom && DATA.enemies[i].id===nc.id) {
            delete enemyById[DATA.enemies[i].id]; delete ASSETS.enemyFamily[DATA.enemies[i].id];
            DATA.enemies.splice(i,1);
          }
        }
        const e = { id:nc.id, name:nc.name, name_en:nc.name, custom:true, base:nc.base,
          hp:nc.hp, def:nc.def, atk:nc.atk,
          tiers:nc.tiers.map(function(t){return t.tier;}),
          tierStats:Object.fromEntries(nc.tiers.map(function(t){return [t.tier,{hp:t.health,def:t.defense,atk:t.attack}];})),
          wr:(nc.weaknesses||[]).map(function(w){return w.damage+':'+(w.kind==='resist'?'R':'W');}),
          type:baseEnemy.type, act:baseEnemy.act, size:baseEnemy.size, perQuest:baseEnemy.perQuest,
          mech: (nc.mech||[]).slice(), theme:(nc.theme||[]).slice(), named:!!nc.named };
        DATA.enemies.push(e); enemyById[e.id]=e;
        if (ASSETS.enemyFamily[nc.base]) ASSETS.enemyFamily[nc.id]=ASSETS.enemyFamily[nc.base];
      }
    } catch(e){ console.warn('Forge custom registration failed', e && (e.stack||e)); }
    if(typeof dlg!=='undefined' && dlg && dlg.close) dlg.close();
    renderEnemiesCategory();
  };
  const adv=document.getElementById('fce_advanced');
  if(adv) adv.addEventListener('click', function(){ const box=document.getElementById('fce_adv'); if(box) box.style.display=(box.style.display==='none'?'block':'none'); });
  const cancel=document.getElementById('fce_cancel');
  if(cancel) cancel.onclick=function(){ if(typeof dlg!=='undefined' && dlg && dlg.close) dlg.close(); };
}
function ensureCustomEnemies(){ if(!camp || typeof camp!=='object') camp={}; if(!Array.isArray(camp.customEnemies)) camp.customEnemies=[]; return camp.customEnemies; }
function renderEnemiesCategory(){
  const main=overlay.querySelector('#forgeMain');
  if(!main) return;
  if(!camp || typeof camp!=='object') camp={};
  if(!Array.isArray(camp.customEnemies)) camp.customEnemies=[];
  if(!Array.isArray(camp.enemyPools)) camp.enemyPools=[];
  if(!camp.enemyTags || typeof camp.enemyTags!=='object' || Array.isArray(camp.enemyTags)) camp.enemyTags={};
  if(camp.enemyPools.length===0) enemyPoolsSelected=-1; else if(enemyPoolsSelected<0 || enemyPoolsSelected>=camp.enemyPools.length) enemyPoolsSelected=Math.max(0,camp.enemyPools.length-1);
  const baseItems=((typeof DATA!=='undefined' && Array.isArray(DATA.enemies))? DATA.enemies : []).filter(function(e){
    return !(camp && Array.isArray(camp.customEnemies) && camp.customEnemies.some(function(c){return c.id===e.id;}));
  });
  const customEnemies=(typeof camp!=='undefined' && Array.isArray(camp.customEnemies))? camp.customEnemies : [];
  const customAsEnemies=customEnemies.map(function(c){
    const be=(typeof DATA!=='undefined' && Array.isArray(DATA.enemies))? DATA.enemies.find(function(e){return e.id===c.base;}) : null;
    return {id:c.id,name:c.name,name_en:c.name,hp:c.hp,def:c.def,atk:c.atk,act:(be && be.act)||1,mech:c.mech||[],theme:c.theme||[], named:!!c.named, weaknesses:c.weaknesses||[]};
  });
  const items=baseItems.concat(customAsEnemies);

  // Expose boss/mini tags as a Mech trait (like Huge/Small) for display and filtering.
  items.forEach(function(x){
    if(!Array.isArray(x.mech)) x.mech=[];
    const manual=(camp.enemyTags && camp.enemyTags[x.id]) || '';
    const mapped=(typeof ENEMY_TAG_BY_LIST!=='undefined' && ENEMY_TAG_BY_LIST[x.id]) || '';
    const auto=!mapped && !manual ? (/boss/i.test(String(x.id||'')) ? 'boss' : (/named/i.test(String(x.id||'')) ? 'mini' : '')) : '';
    const tag=manual || mapped || auto;
    const mechTag= tag==='boss' ? 'Boss' : (tag==='mini' ? 'Mini' : (tag==='base' ? 'Base' : ''));
    if(mechTag && x.mech.indexOf(mechTag)<0) x.mech.push(mechTag);
  });
  const allowedAct2=(typeof camp!=='undefined' && camp.meta && (camp.meta.act!=='I' || !!camp.meta.requiresAct2)) || false;
  const filteredBase=items.filter(function(x){ const act=familyAct(x); return !(act>=2 && !allowedAct2); });
  const filtered=filteredBase.filter(function(x){
    if(enemyMechFilter.length){
      const ok = enemyFilterMode==='and'
        ? (Array.isArray(x.mech) && enemyMechFilter.every(function(t){return (x.mech||[]).indexOf(t)>=0;}))
        : (Array.isArray(x.mech) && enemyMechFilter.some(function(t){return (x.mech||[]).indexOf(t)>=0;}));
      if(!ok) return false;
    }
    if(enemyThemeFilter.length){
      const ok = enemyFilterMode==='and'
        ? (Array.isArray(x.theme) && enemyThemeFilter.every(function(t){return (x.theme||[]).indexOf(t)>=0;}))
        : (Array.isArray(x.theme) && enemyThemeFilter.some(function(t){return (x.theme||[]).indexOf(t)>=0;}));
      if(!ok) return false;
    }
    return true;
  });
  const enemyById={};
  items.forEach(function(e){ enemyById[e.id]=e; });
  function familyOf(id){
    if((camp.customEnemies||[]).some(function(c){return c.id===id;})) return {family_name:'Custom', act:1};
    if ((typeof state!=='undefined' && state && Array.isArray(state.custom&&state.custom.enemies) && (state.custom.enemies||[]).some(function(c){return c.id===id;}))) return {family_name:'Custom', act:1};
    const _de=(typeof DATA!=='undefined' && Array.isArray(DATA.enemies))? DATA.enemies.find(function(e){return e.id===id;}): null;
    if (_de && _de.custom) return {family_name:'Custom', act:_de.act||1};
    if(typeof ENEMY_TYPE_CAPS!=='undefined'){
      const keys=Object.keys(ENEMY_TYPE_CAPS);
      for(let i=0;i<keys.length;i++){
        const fam=ENEMY_TYPE_CAPS[keys[i]];
        if((fam.member_ids||[]).indexOf(id)>=0) return fam;
      }
    }
    return null;
  }
  const FAMILY_PARENT={};
  function familyName(fam){ if(!fam) return 'Other'; return FAMILY_PARENT[fam.family_name] || fam.family_name; }
  function weaknessOf(id){
    const fam=familyOf(id);
    if(!fam || !fam.weak_to) return [];
    return fam.weak_to[id] || [];
  }
  function weaknessDisplayOf(id){
    const cu=(camp.customEnemies||[]).find(function(c){return c.id===id;});
    if(cu && Array.isArray(cu.weaknesses) && cu.weaknesses.length){
      return cu.weaknesses.map(function(w){ return (w.kind==='resist'?'Resist: ':'')+w.damage; }).filter(Boolean);
    }
    const wu=(typeof state!=='undefined' && state && Array.isArray(state.custom&&state.custom.enemies))? state.custom.enemies.find(function(c){return c.id===id;}): null;
    if(wu && Array.isArray(wu.weaknesses) && wu.weaknesses.length){
      return wu.weaknesses.map(function(w){ return (w.kind==='resist'?'Resist: ':'')+w.damage; }).filter(Boolean);
    }
    // Taller/Ficha enemies store weaknesses as wr: ["Damage:W", "Damage:R"]
    const de=(typeof DATA!=='undefined' && Array.isArray(DATA.enemies))? DATA.enemies.find(function(e){return e.id===id;}): null;
    if(de && Array.isArray(de.wr) && de.wr.length){
      return de.wr.map(function(w){ const parts=w.split(':'); const d=parts[0]; const k=parts[1]; return (k==='R'?'Resist: ':'')+d; }).filter(Boolean);
    }
    return weaknessOf(id);
  }
  function familyAct(x){ const fam=familyOf(x.id); return (fam && (fam.act===1 || fam.act===2))? fam.act : ((typeof itemActOf==='function')? itemActOf(x) : (x.act||1)); }
  function actOf(x){ return familyAct(x); }
  function portrait(x){
    let id=x.id;
    const cu=(camp.customEnemies||[]).find(function(c){return c.id===id;});
    if(cu && cu.base) id=cu.base;
    const famKey=(typeof ASSETS!=='undefined' && ASSETS.enemyFamily)? (ASSETS.enemyFamily[id]||'') : '';
    return (typeof arte==='function')? arte('portraits', famKey) : '';
  }
  function isInActivePool(id){ if(enemyPoolsSelected<0 || !camp.enemyPools.length) return false; var p=camp.enemyPools[enemyPoolsSelected]; return !!(p && (p.enemies||[]).indexOf(id)>=0); }
  function poolsOfEnemy(id){ const r=[]; (camp.enemyPools||[]).forEach(function(p,i){ if(Array.isArray(p.enemies) && p.enemies.indexOf(id)>=0) r.push(i+1); }); return r; }
  function row(x){
    const act=actOf(x);
    const weak=weaknessDisplayOf(x.id);
    const src=portrait(x);
    const img=src? '<img src="'+src+'" style="width:48px;height:48px;object-fit:contain;background:var(--ink);border:1px solid var(--edge);border-radius:4px;margin-right:8px;">' : '';
    const bossTagKey=(camp.enemyTags && camp.enemyTags[x.id]) || ENEMY_TAG_BY_LIST[x.id] || (/boss/i.test(String(x.id||'')) ? 'boss' : (/named/i.test(String(x.id||'')) ? 'mini' : ''));
    const bossTag=bossTagKey ? (bossTagKey==='boss' ? 'BOSS' : (bossTagKey==='mini' ? 'MINI' : (bossTagKey==='base' ? 'BASE' : ''))) : '';
    const border=bossTag==='BOSS' ? 'border-color:var(--torch);box-shadow:0 0 0 1px var(--torch);' : (bossTag==='MINI' ? 'border-color:#d9a441;box-shadow:0 0 0 1px #d9a441;' : (bossTag==='BASE' ? 'border-color:var(--verd);box-shadow:0 0 0 1px var(--verd);' : ''));
    return '<div style="padding:6px;margin-bottom:4px;border:1px solid var(--edge);'+border+'background:var(--panel2);border-radius:6px;display:flex;flex-direction:column;gap:4px;">'+
      '<div style="display:flex;align-items:flex-start;gap:8px;">'+
        img+
        '<div style="flex:1;min-width:0;">'+
          '<div style="font-size:12px;">'+esc(x.name_en||x.name||x.id)+'</div>'+
          '<div style="color:var(--dim);font-size:11px;">'+esc(x.id)+'</div>'+
          '<div style="color:var(--dim);font-size:11px;">HP '+esc(x.hp)+' | DEF '+esc(x.def)+' | ATK '+esc(x.atk)+' | Act '+((x.act||1)>=2?'II':'I')+'</div>'+
          '<div style="color:var(--dim);font-size:10px;">Mech: '+esc((x.mech||[]).join(', ')||'---')+' | Theme: '+esc((x.theme||[]).join(', ')||'---')+'</div>'+
          '<div style="color:var(--verd);font-size:11px;">Weak: '+(weak.length? weak.join(', ') : 'none listed')+'</div>'+
          (bossTag? '<div style="display:inline-block;margin-top:2px;padding:1px 6px;border-radius:3px;font-size:10px;font-weight:700;background:'+(bossTag==='BOSS'?'var(--torch)':(bossTag==='MINI'?'#d9a441':'var(--verd)'))+';color:#000;">'+bossTag+'</div>' : '')+
        '</div>'+
        '<button class="sm" data-forcustbase="'+x.id+'" style="background:var(--panel2);color:var(--text);border:1px solid var(--edge);border-radius:4px;padding:4px 8px;cursor:pointer;font-size:11px;">Edit</button>'+
        ((camp.customEnemies||[]).some(function(c){return c.id===x.id;}) ? '<button class="sm" data-forcustdel="'+x.id+'" style="background:var(--panel2);color:var(--text);border:1px solid var(--edge);border-radius:4px;padding:4px 8px;cursor:pointer;font-size:11px;">Del</button>' : '')+
      '</div>'+
      (camp.enemyPools.length ? '<div style="display:flex;gap:4px;flex-wrap:wrap;align-items:center;">'+camp.enemyPools.map(function(p,i){ const on=(Array.isArray(p.enemies)&&p.enemies.indexOf(x.id)>=0); return '<button class="sm" type="button" data-enempool="'+x.id+'" data-pool="'+i+'" style="background:'+(on?'var(--verd)':'var(--panel2)')+';color:'+(on?'var(--ink)':'var(--text)')+';border:1px solid var(--edge);border-radius:4px;padding:2px 8px;cursor:pointer;font-size:10px;">P'+(i+1)+'</button>'; }).join('')+(function(){ const ps=poolsOfEnemy(x.id); return ps && ps.length ? ' <span style="font-size:10px;padding:2px 6px;background:var(--panel2);border:1px solid var(--edge);border-radius:4px;">Pool '+ps.join(',')+'</span>' : ''; })()+'</div>' : '')+
    '</div>';


  }
  const byFam={};
  const order=[];
  filtered.forEach(function(x){
    const fam=familyOf(x.id);
    const name=familyName(fam);
    if(!byFam[name]){ byFam[name]=[]; order.push(name); }
    byFam[name].push(x);
  });
  order.sort();
  const blocks=order.map(function(famName){
    function _rankTag(x){
      const manual=(camp.enemyTags && camp.enemyTags[x.id]) || '';
      const listed=(typeof ENEMY_TAG_BY_LIST!=='undefined' && ENEMY_TAG_BY_LIST[x.id]) || '';
      const auto=!manual && !listed ? (/boss/i.test(String(x.id||'')) ? 'boss' : (/named/i.test(String(x.id||'')) ? 'mini' : '')) : '';
      const tag=manual || listed || auto;
      const order={'base':0, '':1, 'none':1, 'mini':2, 'boss':3};
      return (typeof order[tag]!=='undefined') ? order[tag] : 1;
    }
    const list=byFam[famName].slice().sort(function(a,b){
      const r=_rankTag(a)-_rankTag(b);
      if(r!==0) return r;
      return ((a.act||1)-(b.act||1)) || String(a.name_en||a.name||a.id).localeCompare(String(b.name_en||b.name||b.id));
    });
    const rows=list.map(row).join('');
    const famCap=(function(){ const fx=familyOf(list && list[0]? list[0].id : ''); return (fx && fx.cap!=null) ? ' (cap '+fx.cap+')' : ''; })();
    return '<div style="margin-bottom:10px;border:1px solid var(--edge);border-radius:6px;padding:8px;background:var(--panel);">'+
      '<h3 style="margin:0 0 6px 0;font-size:14px;">'+esc(famName)+famCap+'</h3>'+
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">'+rows+'</div>'+
    '</div>';
  }).join('');
  const mechOpts=Array.from(new Set(filteredBase.reduce(function(acc,x){ if(Array.isArray(x.mech)) x.mech.forEach(function(t){ if(['Base','Mini','Boss'].indexOf(t)<0) acc.push(t); }); return acc; },[]))).sort();
  const themeOpts=Array.from(new Set(filteredBase.reduce(function(acc,x){ if(Array.isArray(x.theme)) x.theme.forEach(function(t){acc.push(t);}); return acc; },[]))).sort();
  const customOpts=['Base','Mini','Boss'].filter(function(t){ return (filteredBase||[]).some(function(x){ return Array.isArray(x.mech) && x.mech.indexOf(t)>=0; }); });
  const mechSel='<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;border-bottom:1px solid var(--edge);padding-bottom:4px;margin-bottom:2px;"><span style="font-size:11px;color:var(--text);width:68px;font-weight:600;">Mech:</span>'+mechOpts.map(function(t){return '<label style="font-size:11px;white-space:nowrap;display:inline-flex;align-items:center;gap:4px;margin-right:10px;"><input type="checkbox" data-mech="'+esc(t)+'" '+(enemyMechFilter.indexOf(t)>=0?'checked':'')+'> '+esc(t)+'</label>';}).join(' ')+'</div>';
  const themeSel='<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;border-bottom:1px solid var(--edge);padding-bottom:4px;margin-bottom:2px;"><span style="font-size:11px;color:var(--text);width:68px;font-weight:600;">Theme:</span>'+themeOpts.map(function(t){return '<label style="font-size:11px;white-space:nowrap;display:inline-flex;align-items:center;gap:4px;margin-right:10px;"><input type="checkbox" data-theme="'+esc(t)+'" '+(enemyThemeFilter.indexOf(t)>=0?'checked':'')+'> '+esc(t)+'</label>';}).join(' ')+'</div>';
  const customSel='<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding-bottom:4px;"><span style="font-size:11px;color:var(--text);width:68px;font-weight:600;">Custom:</span>'+customOpts.map(function(t){return '<label style="font-size:11px;white-space:nowrap;display:inline-flex;align-items:center;gap:4px;margin-right:10px;"><input type="checkbox" data-mech="'+esc(t)+'" '+(enemyMechFilter.indexOf(t)>=0?'checked':'')+'> '+esc(t)+'</label>';}).join(' ')+'</div>';
  const createBtn='<button id="enemCreatePool" style="padding:4px 8px;border:1px solid var(--edge);background:var(--torch);color:var(--ink);border-radius:4px;cursor:pointer;font-size:11px;">Create pool</button>';
  const poolSel= (camp.enemyPools.length? '<select id="enemPoolSel" style="padding:4px 6px;border:1px solid var(--edge);background:var(--panel2);color:var(--text);border-radius:4px;">'+
            camp.enemyPools.map(function(p,i){return '<option value="'+i+'" '+(i===enemyPoolsSelected?'selected':'')+'>pool'+(i+1)+' ('+(p.enemies||[]).length+')</option>';}).join('')+ '</select>' : '');
  const customRows=(camp.customEnemies||[]).map(function(c){
    const src=(typeof arte==='function' && typeof ASSETS!=='undefined' && ASSETS.enemyFamily)? arte('portraits', (ASSETS.enemyFamily[c.base]||'')) : '';
    const img=src? '<img src="'+src+'" style="width:40px;height:40px;object-fit:contain;background:var(--ink);border:1px solid var(--edge);border-radius:4px;margin-right:8px;">' : '';
    return '<div style="padding:6px;margin-bottom:4px;border:1px solid var(--edge);background:var(--panel2);border-radius:6px;display:flex;align-items:center;gap:8px;">'+
      img+
      '<div style="flex:1;min-width:0;">'+
        '<div style="font-size:12px;">'+esc(c.name||c.id)+'</div>'+
        '<div style="color:var(--dim);font-size:11px;">'+esc(c.id)+' | HP '+esc(c.hp)+' | DEF '+esc(c.def)+' | ATK '+esc(c.atk)+(c.base?' | base '+esc(c.base):'')+'</div>'+
      '</div>'+
      '<button class="sm" data-forcustedit="'+c.id+'" style="background:var(--panel2);color:var(--text);border:1px solid var(--edge);border-radius:4px;padding:4px 8px;cursor:pointer;font-size:11px;">Edit</button>'+
      '<button class="sm" data-forcustdel="'+c.id+'" style="background:var(--panel2);color:var(--text);border:1px solid var(--edge);border-radius:4px;padding:4px 8px;cursor:pointer;font-size:11px;">Del</button>'+
      (Array.isArray(c.weaknesses) && c.weaknesses.length ? '<div style="width:100%;color:var(--verd);font-size:11px;margin-top:2px;">Weak: '+esc(c.weaknesses.map(function(w){return (w.kind==='resist'?'Resist: ':'')+w.damage;}).join(', '))+'</div>' : '')+
    '</div>';
  }).join('');
  const customSection='<div style="margin-top:12px;border:1px solid var(--edge);border-radius:6px;padding:8px;background:var(--panel);max-width:980px;margin-left:auto;margin-right:auto;">'+
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">'+
      '<h3 style="margin:0;font-size:14px;">Custom</h3>'+
    '</div>'+
    (customRows||'<p style="color:var(--dim);font-size:12px;">No custom monsters.</p>')+
  '</div>';
    const presetFamilies=(typeof ENEMY_TYPE_CAPS!=='undefined') ? Object.keys(ENEMY_TYPE_CAPS).map(function(k){ return ENEMY_TYPE_CAPS[k]; }).filter(function(f){ return f && Array.isArray(f.member_ids); }) : [];
  const BASE_PRESET_FAMILY_NAMES={'Bandit':1,'Fae':1,'Golem':1,'Hybrid Harbinger':1,'Mercenary':1,'Reanimate':1,'Salamander':1,'Specter':1,'Uthuk Berserker':1,'Uthuk Blood Witch':1,'Vampire':1,'Viper Legionnaire':1,'Wight':1,'Wolf':1,'Zealot':1};
  const presetOptions=[
    {value:'base', label:'Preset: Base'},
    {value:'uthuk', label:'Preset: Uthuk Faction'},
    {value:'dragon', label:'Preset: Dragon Faction'},
    {value:'baronial', label:'Preset: Baronial Faction'},
    {value:'undead', label:'Preset: Undead Faction'}
  ];
  const presetSelectHtml='<div style="display:flex;gap:4px;margin-top:6px;">'+
    '<select id="enemPresetChoice" style="flex:1;padding:3px 6px;border:1px solid var(--edge);background:var(--panel2);color:var(--text);border-radius:4px;font-size:10px;">'+
      presetOptions.map(function(o){ return '<option value="'+esc(o.value)+'">'+esc(o.label)+'</option>'; }).join('')+
    '</select>'+
    '<button class="sm" type="button" data-addpreset style="background:var(--torch);color:var(--ink);border:0;border-radius:4px;padding:4px 8px;cursor:pointer;font-size:10px;">Add preset</button>'+
  '</div>';
const poolRows=(camp.enemyPools||[]).map(function(p,i){
    const chips=(function(ids){ const groups={}; const order=[]; (ids||[]).forEach(function(id){ const fam=familyOf(id); const gname=(fam && fam.family_name) ? fam.family_name : (enemyById && enemyById[id] ? (enemyById[id].name_en||enemyById[id].name||id) : id); if(!groups[gname]){ groups[gname]={ids:[], sample: (enemyById && enemyById[id]) || {id:id}}; order.push(gname); } groups[gname].ids.push(id); }); return order.map(function(gname){ const g=groups[gname]; const src=g.sample; const psrc=portrait(src||{id:g.ids[0]}); const rankTag=function(id){ const manual=(camp.enemyTags && camp.enemyTags[id]) || ''; const listed=(typeof ENEMY_TAG_BY_LIST!=='undefined' && ENEMY_TAG_BY_LIST[id]) || ''; const auto=!manual && !listed ? (/boss/i.test(String(id||'')) ? 'boss' : (/named/i.test(String(id||'')) ? 'mini' : '')) : ''; const tag=manual || listed || auto; const order={'base':0, '':1, 'none':1, 'mini':2, 'boss':3}; return (typeof order[tag]!=='undefined') ? order[tag] : 1; };
const rankedIds=g.ids.slice().sort(function(a,b){ const ea=enemyById && enemyById[a]; const eb=enemyById && enemyById[b]; const aa=(ea && ea.act) ? ea.act : 99; const ab=(eb && eb.act) ? eb.act : 99; const r=rankTag(a)-rankTag(b); if(r!==0) return r; if(aa!==ab) return aa-ab; return String(a).localeCompare(String(b)); });
const idList=rankedIds.map(function(id){ const e=enemyById && enemyById[id]; const label=esc(e ? (e.name_en||e.name||id) : id); return '<span style="display:inline-flex;align-items:center;gap:3px;margin-right:6px;"><button type="button" class="sm" data-rmpool="'+esc(id)+'" data-pool="'+i+'" style="border:0;background:transparent;color:var(--text);cursor:pointer;font-size:10px;line-height:1;padding:0;">x</button><span style="font-size:11px;">'+label+'</span></span>'; }).join(' '); return '<span style="display:inline-flex;align-items:center;gap:4px;margin:2px 6px 2px 0;padding:3px 6px;background:var(--panel);border:1px solid var(--edge);border-radius:4px;">'+(psrc?'<img src="'+psrc+'" style="width:30px;height:30px;object-fit:contain;border-radius:4px;">':'')+'<span style="font-size:11px;">'+idList+'</span></span>'; }).join(''); })(Array.isArray(p.enemies)? p.enemies : []);    return '<div style="margin-bottom:6px;padding:6px;border:1px solid var(--edge);border-radius:4px;background:var(--panel2);">'+
      '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">'+
      '<strong>Pool '+(i+1)+'</strong>'+(p&&p.name?' <span style="color:var(--dim);font-size:10px;">'+esc(p.name)+'</span>':'')+(i===enemyPoolsSelected?' <span style="color:var(--verd);font-size:10px;">active</span>':'')+
      ' <button class="sm" data-selectpool="'+i+'">select</button>'+' <button class="sm" data-delpool="'+i+'">Del pool</button>'+
      ' <span style="color:var(--dim);font-size:10px;">'+(p.enemies||[]).length+' enemies</span>'+
      '</div>'+
      '<div style="margin-top:4px;font-size:11px;color:var(--text);"'+( (Array.isArray(p.enemies)&&p.enemies.length) ? '' : ' style="opacity:.5"' )+'>'+( (Array.isArray(p.enemies)&&p.enemies.length) ? chips : 'Empty' )+'</div>'+
      (Array.isArray(p.enemies)&&p.enemies.length ? '<div style="margin-top:4px;font-size:10px;color:var(--dim);user-select:all;word-break:break-all;">'+esc(p.enemies.join(', '))+'</div>' : '')+
    '</div>';
  }).join('');
  const poolSection='<div style="margin-top:12px;border:1px solid var(--edge);border-radius:6px;padding:8px;background:var(--panel);max-width:980px;margin-left:auto;margin-right:auto;">'+
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">'+
      '<h3 style="margin:0;font-size:14px;">Enemy Pools ('+camp.enemyPools.length+')</h3>'+
      '<button class="sm" type="button" data-createpool style="background:var(--torch);color:var(--ink);border:0;border-radius:4px;padding:4px 8px;cursor:pointer;font-size:11px;">Create pool</button>'+
    '</div>'+
    presetSelectHtml+
    (poolRows||'<p style="color:var(--dim);font-size:12px;">No enemy pools yet. Create one above.</p>')+
  '</div>';
  main.innerHTML=
    '<div style="width:980px;max-width:100%;margin:0 auto 8px;display:flex;flex-direction:column;gap:4px;border:1px solid var(--edge);border-radius:6px;padding:6px;background:var(--panel2);">'+mechSel+themeSel+customSel+
      '<div style="text-align:right;display:flex;gap:4px;justify-content:flex-end;align-items:center;flex-wrap:wrap;">'+
        '<button id="loadExtEnemyData" class="sm" type="button" style="border:1px solid var(--edge);border-radius:4px;padding:3px 8px;cursor:pointer;font-size:10px;background:var(--panel2);color:var(--text);">Load game data</button>'+
        '<button id="enemyFilterMode" class="sm" type="button" style="border:1px solid var(--edge);border-radius:4px;padding:3px 8px;cursor:pointer;font-size:10px;background:var(--panel2);color:var(--text);">Filter: '+(enemyFilterMode==='and'?'AND (all selected)':'OR (any selected)')+'</button>'+
      '</div>'+
    '</div>'+
    '<div style="display:grid;grid-template-columns:minmax(0,1fr) 360px;gap:12px;max-width:1320px;margin:0 auto;align-items:start;">'+
      '<div style="min-width:0;">'+blocks+(customSection||'')+'</div>'+
      '<div style="position:sticky;top:8px;height:calc(100vh - 220px);overflow-y:scroll;overscroll-behavior:contain;">'+poolSection+'</div>'+
    '</div>';


  main.querySelectorAll('[data-mech]').forEach(function(cb){ cb.addEventListener('change', function(){ var t=cb.getAttribute('data-mech'); if(cb.checked){ if(enemyMechFilter.indexOf(t)<0) enemyMechFilter.push(t); } else { enemyMechFilter=enemyMechFilter.filter(function(v){return v!==t;}); } renderEnemiesCategory(); }); });
  main.querySelectorAll('[data-theme]').forEach(function(cb){ cb.addEventListener('change', function(){ var t=cb.getAttribute('data-theme'); if(cb.checked){ if(enemyThemeFilter.indexOf(t)<0) enemyThemeFilter.push(t); } else { enemyThemeFilter=enemyThemeFilter.filter(function(v){return v!==t;}); } renderEnemiesCategory(); }); });
  const _fm=main.querySelector('#enemyFilterMode'); if(_fm) _fm.addEventListener('click', function(){ enemyFilterMode = (enemyFilterMode==='and' ? 'or' : 'and'); renderEnemiesCategory(); });
  const _led=main.querySelector('#loadExtEnemyData'); if(_led) _led.addEventListener('click', function(){ openExternalEnemyGameDataPicker(); });
  const _c=main.querySelector('#enemCreatePool'); if(_c) _c.addEventListener('click',function(){ if(!camp.enemyPools) camp.enemyPools=[]; camp.enemyPools.push({enemies:[]}); enemyPoolsSelected=camp.enemyPools.length-1; renderEnemiesCategory(); if(typeof ensureMapEnemyPoolsFromCamp==='function'){ ensureMapEnemyPoolsFromCamp(); if(typeof renderPalette==='function') renderPalette(); if(typeof renderRight==='function') renderRight(); if(typeof refreshRandomPoolDropdown==='function') refreshRandomPoolDropdown(); } });
  const _s=main.querySelector('#enemPoolSel'); if(_s) _s.addEventListener('change',function(){ enemyPoolsSelected=parseInt(_s.value,10); renderEnemiesCategory(); });
  main.querySelectorAll('[data-enempool]').forEach(function(btn){ btn.addEventListener('click',function(){ var id=btn.getAttribute('data-enempool'); var pi=parseInt(btn.getAttribute('data-pool'),10); var p=camp.enemyPools && camp.enemyPools[pi]; if(!p) return; if(!Array.isArray(p.enemies)) p.enemies=[]; var i=p.enemies.indexOf(id); if(i<0) p.enemies.push(id); else p.enemies.splice(i,1); renderEnemiesCategory(); if(typeof ensureMapEnemyPoolsFromCamp==='function'){ ensureMapEnemyPoolsFromCamp(); if(typeof renderPalette==='function') renderPalette(); if(typeof renderRight==='function') renderRight(); if(typeof refreshRandomPoolDropdown==='function') refreshRandomPoolDropdown(); } }); });
  main.querySelectorAll('[data-createpool]').forEach(function(b){ b.addEventListener('click',function(){ if(!camp.enemyPools) camp.enemyPools=[]; camp.enemyPools.push({name:'Base', enemies:[]}); enemyPoolsSelected=camp.enemyPools.length-1; renderEnemiesCategory(); if(typeof ensureMapEnemyPoolsFromCamp==='function'){ ensureMapEnemyPoolsFromCamp(); if(typeof renderPalette==='function') renderPalette(); if(typeof renderRight==='function') renderRight(); if(typeof refreshRandomPoolDropdown==='function') refreshRandomPoolDropdown(); } }); });
  main.querySelectorAll('[data-addpreset]').forEach(function(b){ b.addEventListener('click', function(){
    if(!camp.enemyPools) camp.enemyPools=[];
    const sel=main.querySelector('#enemPresetChoice');
    const val=sel ? sel.value : '';
    if(!val) return;
    const allowedAct2=forgeAllowedAct2();
    let ids=[];
    if(val==='base'){
      ids=[
        'ENEMY_BERSERKER_1','ENEMY_WARY_BANDIT_1','ENEMY_ZEALOT_1','ENEMY_GOLEM_1','ENEMY_FAE_1',
        'ENEMY_WOLF_1','ENEMY_SPECTER_1','ENEMY_WIGHT_1','ENEMY_HARBINGER_1','ENEMY_BLOOD_SISTER_1',
        'ENEMY_DOOMCALLER_1','ENEMY_SALAMANDER_1','ENEMY_VAMPIRE_1','ENEMY_REANIMATE_1','ENEMY_VIPER_1',
        'ENEMY_MERCENARY_1'
      ];
    }
    else if(val==='uthuk'){
      ids=[
        'ENEMY_BANDIT_CRAZED_1','ENEMY_FAE_RU_SPAWN','ENEMY_GOLEM_RAGESTONE_1','ENEMY_BERSERKER_1',
        'ENEMY_BERSERKER_FLAYED','ENEMY_BLOOD_SISTER_1','ENEMY_BLOOD_SISTER_NIGHT','ENEMY_WOLF_RED_EYED',
        'ENEMY_ZEALOT_CRIMSON_1'
      ];
    }
    else if(val==='dragon'){
      ids=[
        'ENEMY_BANDIT_RUNEBLADE_1','ENEMY_Q7_BANDIT_SNIPER','ENEMY_FAE_HEATH_SPAWN','ENEMY_GOLEM_RUNEBOUND_1',
        'ENEMY_HARBINGER_1','ENEMY_FIREBREATHER','ENEMY_HARBINGER_VANGUARD_1','ENEMY_WOLF_ELDERBONE',
        'ENEMY_BOSS_GREYSDON','ENEMY_ZEALOT_DREAD_1'
      ];
    }
    else if(val==='baronial'){
      ids=[
        'ENEMY_BANDIT_BARONIAL_1','ENEMY_BANDIT_BARONIAL_ARBALESTER_1','ENEMY_GOLEM_BARONIAL_1',
        'ENEMY_HARBINGER_BARONIAL_1','ENEMY_WOLF_BARONIAL_1','ENEMY_ZEALOT_BARONIAL_1'
      ];
    }
    else if(val==='undead'){
      ids=[
        'ENEMY_BANDIT_SHADOWALK_1','ENEMY_FAE_MIST_SPAWN','ENEMY_GOLEM_MISTWALKER_1','ENEMY_SPECTER_1',
        'Q8_GYLDREN','ENEMY_SPECTER_DEATHBORN','ENEMY_SPECTER_RUNEMARKED','ENEMY_SUMMONED_SPECTER',
        'ENEMY_BLOOD_SISTER_UNDEAD','ENEMY_WIGHT_1','ENEMY_WIGHT_BLOODGUARD','ENEMY_WOLF_PUTRID',
        'ENEMY_ZEALOT_SQ2','ENEMY_ZEALOT_PALE_1'
      ];
    }
    else if(val==='act1'){ ids=(DATA.enemies||[]).filter(function(e){return (itemActOf?itemActOf(e):e.act||1)<2;}).map(function(e){return e.id;}); }
    else if(val==='act2'){ ids=(DATA.enemies||[]).filter(function(e){return !( (itemActOf?itemActOf(e):e.act||1)<2 );}).map(function(e){return e.id;}); }
    else if(val==='mini' || val==='boss'){
      ids=(DATA.enemies||[]).filter(function(e){return !!(ENEMY_TAG_BY_LIST[e.id]===val || (camp.enemyTags && camp.enemyTags[e.id]===val));}).map(function(e){return e.id;});
      if(!ids.length){ ids=Object.keys(ENEMY_TAG_BY_LIST).filter(function(id){return ENEMY_TAG_BY_LIST[id]===val;}); }
    }
    else if(val.indexOf('family:')===0){
      const fname=val.slice('family:'.length);
      const fam=presetFamilies.find(function(f){return f.family_name===fname;});
      if(fam) ids=fam.member_ids.slice();
    }
    ids=Array.from(new Set(ids)).filter(function(id){
      const e=(DATA.enemies||[]).find(function(x){return x.id===id;}) || ((typeof state!=='undefined' && state && Array.isArray(state.custom&&state.custom.enemies))? state.custom.enemies.find(function(x){return x.id===id;}): undefined);
      if(!e) return true;
      const act=(itemActOf?itemActOf(e): (e.act||1));
      return !(act>=2 && !allowedAct2);
    });
    var poolName='Custom Pool';
    if(val==='base') poolName='Base';
    else if(val==='uthuk') poolName='Uthuk Faction';
    else if(val==='dragon') poolName='Dragon Faction';
    else if(val==='baronial') poolName='Baronial Faction';
    else if(val==='undead') poolName='Undead Faction';
    else if(val==='act1') poolName='Act 1 Pool';
    else if(val==='act2') poolName='Act 2 Pool';
    else if(val==='mini') poolName='Mini-Bosses';
    else if(val==='boss') poolName='Bosses';
    else if(val.indexOf('family:')===0) poolName=val.slice('family:'.length)+' Pool';
    camp.enemyPools.push({name:poolName, enemies:ids});
    enemyPoolsSelected=camp.enemyPools.length-1;
    renderEnemiesCategory();
  }); });
  main.querySelectorAll('[data-selectpool]').forEach(function(b){ b.addEventListener('click', function(){ enemyPoolsSelected=parseInt(b.getAttribute('data-selectpool'),10); renderEnemiesCategory(); }); });
  main.querySelectorAll('[data-delpool]').forEach(function(b){ b.addEventListener('click', function(){ var idx=parseInt(b.getAttribute('data-delpool'),10); if(isNaN(idx)) return; camp.enemyPools.splice(idx,1); if(camp.enemyPools.length===0) enemyPoolsSelected=-1; else if(enemyPoolsSelected>=camp.enemyPools.length) enemyPoolsSelected=camp.enemyPools.length-1; renderEnemiesCategory(); }); });
  main.querySelectorAll('[data-rmpool]').forEach(function(b){ b.addEventListener('click', function(){ var pid=b.getAttribute('data-pool'); var eid=b.getAttribute('data-rmpool'); var p=camp.enemyPools && camp.enemyPools[parseInt(pid,10)]; if(!p || !Array.isArray(p.enemies)) return; p.enemies=p.enemies.filter(function(x){return x!==eid;}); renderEnemiesCategory(); }); });

  main.querySelectorAll('[data-forcustedit]').forEach(function(b){ b.addEventListener('click', function(){ openForgeCustomEnemy(b.getAttribute('data-forcustedit')); }); });
  main.querySelectorAll('[data-forcustdel]').forEach(function(b){ b.addEventListener('click', function(){ var id=b.getAttribute('data-forcustdel'); camp.customEnemies=(camp.customEnemies||[]).filter(function(c){return c.id!==id;}); renderEnemiesCategory(); }); });
  main.querySelectorAll('[data-forcustbase]').forEach(function(b){ b.addEventListener('click', function(){
    const baseId=b.getAttribute('data-forcustbase');
    function _findExisting(){ var f=null;
      if (camp && Array.isArray(camp.customEnemies)){ f = camp.customEnemies.find(function(c){return c.id===baseId || c.base===baseId;}); if (f) return f; }
      if (typeof state!=='undefined' && state && Array.isArray(state.custom && state.custom.enemies)){ f = state.custom.enemies.find(function(c){return c.id===baseId || c.base===baseId;}); if (f) return f; }
      if (typeof DATA!=='undefined' && Array.isArray(DATA.enemies)){ f = DATA.enemies.find(function(e){return e.id===baseId && e.custom;}); if (f) return f; }
      return null;
    }
    const existing = _findExisting();
    openForgeCustomEnemy(existing ? existing.id : null, baseId);
  }); });
}
function sharedVariants(slot,rune){
  const keyHint=rune.toUpperCase();
  return partVariants('Rune',slot).filter(function(w){ return String(w.id||'').toUpperCase().indexOf(keyHint)>=0; });
}
function sharedCol(rune){
  const aArr=sharedVariants('A',rune).filter(function(w){ return inStartInv(w.id) || isDefaultPart('Rune','A',w.id); });
  const cArr=sharedVariants('C',rune).filter(function(w){ return inStartInv(w.id) || isDefaultPart('Rune','C',w.id); });
  const bId = 'WEAPON_PART_B_'+rune;
  const bPart = state.weaponParts.find(function(w){ return w.id===bId; });
  const aKey = 'shared|Rune|A|'+rune;
  const cKey = 'shared|Rune|C|'+rune;
  let aIdx = carIdx[aKey];
  if(aIdx==null || aIdx<0 || aIdx>=aArr.length){ const def=aArr.find(function(w){return isDefaultPart('Rune','A',w.id);}); const wf=aArr.filter(function(w){return partFlavor(w);}); if(def) aIdx=aArr.indexOf(def); else if(wf.length) aIdx=aArr.indexOf(wf[0]); else aIdx=0; }
  let cIdx = carIdx[cKey];
  if(cIdx==null || cIdx<0 || cIdx>=cArr.length){ const def=cArr.find(function(w){return isDefaultPart('Rune','C',w.id);}); const wf=cArr.filter(function(w){return partFlavor(w);}); if(def) cIdx=cArr.indexOf(def); else if(wf.length) cIdx=cArr.indexOf(wf[0]); else cIdx=0; }
  const aCur = aArr.length ? aArr[aIdx] : null;
  const cCur = cArr.length ? cArr[cIdx] : null;
  const car = function(cls,slot,arr,idx,key,showImg){
    if(!arr.length) return '<div style="color:var(--dim);font-size:12px;text-align:center;padding:8px 0;">none</div>';
    const p=arr[idx];
    const name=prettyName(p.name_en||p.name||p.id);
    const imgTag = showImg ? '<img src="../img/weapon/'+String(p.id).replace(/_UPGRADED$/i,'').replace(/_PLUS$/i,'')+'.png" style="width:100%;max-width:180px;aspect-ratio:1/1;object-fit:contain;background:var(--ink);border:1px solid var(--edge);border-radius:6px;margin-bottom:6px;" onerror="this.style.display=&quot;none&quot;;">' : '';
    const flavor=prettyName(partFlavor(p));
    const owned=arr.filter(function(w){return inStartInv(w.id);}).length;
    return '<div style="border:1px solid var(--edge);background:var(--panel);border-radius:6px;padding:8px;width:100%;max-width:240px;">'+
      '<div style="font-size:11px;color:var(--dim);margin-bottom:4px;">'+slot+' part ('+(idx+1)+'/'+arr.length+' · owned '+owned+')</div>'+
      (imgTag? (imgTag+'<div style="margin-bottom:4px;"></div>') : '')+
      '<div style="display:flex;align-items:center;gap:8px;justify-content:space-between;margin-bottom:6px;">'+
        (arr.length>1? '<button data-sharedstep="'+key+'|-1" style="background:var(--panel2);color:var(--text);border:1px solid var(--edge);border-radius:4px;cursor:pointer;padding:2px 8px;">&lt;</button>' : '')+
        '<div style="flex:1;text-align:center;font-size:13px;word-break:break-word;">'+esc(name)+'</div>'+
        (arr.length>1? '<button data-sharedstep="'+key+'|1" style="background:var(--panel2);color:var(--text);border:1px solid var(--edge);border-radius:4px;cursor:pointer;padding:2px 8px;">&gt;</button>' : '')+
      '</div>'+
      (flavor ? '<div style="color:var(--dim);font-size:11px;text-align:center;margin-bottom:6px;line-height:1.3;">'+esc(flavor)+'</div>' : '')+
      '<div style="margin-top:6px;text-align:center;"><button data-editpart="'+p.id+'" style="background:var(--torch);color:var(--ink);border:0;border-radius:4px;padding:4px 10px;cursor:pointer;font-size:12px;">Edit</button></div>'+
    '</div>';
  };
  const ownedShared = sharedVariants('A',rune).some(function(w){return inStartInv(w.id);}) || inStartInv('WEAPON_PART_B_'+rune) || sharedVariants('C',rune).some(function(w){return inStartInv(w.id);});
  return '<div style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:8px;border:1px solid var(--edge);background:var(--panel2);border-radius:8px;opacity:'+(ownedShared?'1':'.45')+';filter:'+(ownedShared?'none':'grayscale(1)')+';">'+
    '<div style="font-weight:600;margin-bottom:6px;">'+rune.replace(/_/g,' ')+(/DRAGONSBANE|FEAR|SUNBURST/i.test(rune)?' (Act II)':'')+'</div>'+
    '<div style="font-size:11px;color:'+( (sharedVariants('A',rune).some(function(w){return inStartInv(w.id);}) || inStartInv('WEAPON_PART_B_'+rune) || sharedVariants('C',rune).some(function(w){return inStartInv(w.id);}) ) ? 'var(--verd)' : 'var(--dim)' )+';margin-bottom:6px;">'+( (sharedVariants('A',rune).some(function(w){return inStartInv(w.id);}) || inStartInv('WEAPON_PART_B_'+rune) || sharedVariants('C',rune).some(function(w){return inStartInv(w.id);}) ) ? 'In Starting Inventory' : 'Not in Starting Inventory' )+'</div>'+
    car('Rune','A',aArr,aIdx,aKey,true)+
    (!ownedShared ? '<div style="text-align:center;margin-top:6px;"><button data-addshared="'+rune+'" style="background:var(--torch);color:var(--ink);border:0;border-radius:4px;padding:6px 10px;cursor:pointer;font-weight:600;font-size:12px;">Add to Starting Inventory</button></div>' : '')+
  '</div>';
}
function addSharedToStart(rune){
  const aVars=sharedVariants('A',rune);
  const aPick=aVars.find(function(w){return /_UPGRADED$/i.test(w.id);}) || aVars.find(function(w){return isDefaultPart('Rune','A',w.id);}) || aVars[0];
  if(aPick) setStartInv(aPick.id,true);
  setStartInv('WEAPON_PART_B_'+rune,true);
  const cVars=sharedVariants('C',rune);
  const cPick=cVars.find(function(w){return !/_UPGRADED$/i.test(w.id);}) || cVars[0];
  if(cPick) setStartInv(cPick.id,true);
  if(typeof renderRight==='function') renderRight();
  renderSharedCategory();
}
function renderSharedCategory(){
  const main=overlay.querySelector('#forgeMain');
  if(!main) return;
  const runes=['DRAGONSBANE','FEAR','ICE_STORM','LIGHTNING_STRIKE','RUNE_OF_BLADES','SUNBURST'];
  const act1Runes=runes.filter(function(r){return !/DRAGONSBANE|FEAR|SUNBURST/i.test(r);});
  const act2Runes=runes.filter(function(r){return /DRAGONSBANE|FEAR|SUNBURST/i.test(r);});
  const act1Cols=act1Runes.map(function(rune){return sharedCol(rune);}).join('');
  const act2Cols=act2Runes.map(function(rune){return sharedCol(rune);}).join('');
  main.innerHTML=
    '<div style="display:flex;gap:8px;justify-content:center;margin-bottom:10px;flex-wrap:wrap;position:static;background:var(--panel2);padding:8px 0;">'+
      '<button id="forgeAddAllAct" style="background:var(--torch);color:var(--ink);border:0;border-radius:4px;padding:6px 12px;cursor:pointer;font-weight:600;">Add all upgraded for selected Acts</button>'+
      '<button id="forgeManageStart" style="background:var(--panel2);color:var(--text);border:1px solid var(--edge);border-radius:4px;padding:6px 12px;cursor:pointer;">Manage Starting Inventory</button>'+
    '</div>'+
    '<h2 style="margin:0 0 8px 0;font-size:16px;">Shared Weapons - Act I</h2>'+
    '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;align-content:start;margin-bottom:10px;">'+act1Cols+'</div>'+
    '<h2 style="margin:0 0 8px 0;font-size:16px;">Shared Weapons - Act II</h2>'+
    '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;align-content:start;">'+act2Cols+'</div>'+
    '<div id="forgeEditor" style="margin-top:12px;"></div>';
  main.querySelectorAll('[data-sharedstep]').forEach(function(b){
    b.addEventListener('click',function(){
      const parts=b.getAttribute('data-sharedstep').split('|');
      const rune=parts[0], slot=parts[1], dir=parseInt(parts[parts.length-1],10);
      const key='shared|Rune|'+slot+'|'+rune;
      const arr=sharedVariants(slot,rune).filter(function(w){ return inStartInv(w.id) || isDefaultPart('Rune',slot,w.id); });
      if(!arr.length) return;
      let idx=carIdx[key]||0;
  idx=(idx+dir+arr.length)%arr.length;
  carIdx[key]=idx;
  renderSharedCategory();
  });
});
  main.querySelectorAll('[data-editpart]').forEach(function(b){ b.addEventListener('click',function(){ selected=b.getAttribute('data-editpart'); renderEditorTarget(); }); });
  main.querySelectorAll('[data-makeloadout]').forEach(function(b){ b.addEventListener('click',function(){ makeHeroLoadout(b.getAttribute('data-makeloadout')); }); });
  const clearBtn=main.querySelector('#forgeInvClear');
  if(clearBtn) clearBtn.addEventListener('click', function(){ main.querySelectorAll('input[data-startid]').forEach(function(cb){ setStartInv(cb.getAttribute('data-startid'), false); }); renderWeaponInventoryCategory(); });
}
function renderLoadoutCategory(){
  const main=overlay.querySelector('#forgeMain');
  if (typeof abrirPantallaLoadout==='function') { try { abrirPantallaLoadout(); } catch(e){ console.warn('Open shared loadout failed', e && (e.stack||e)); } return; }
  if(!main) return;
  main.innerHTML='<div id="hlPantallaBody"></div>';
  if(typeof pintarPantallaLoadout==='function') pintarPantallaLoadout();
}
function renderStartingInventoryCategory(){
  const main=overlay.querySelector('#forgeMain');
  if(!main) return;
  camp.start=camp.start||{items:[],reservedItems:[]};
  if(!Array.isArray(camp.start.items)) camp.start.items=[];
  const ids=camp.start.items.map(function(i){return i.id;});
  let allPool=[]; if(typeof GRUPOS_INICIO==='function'){ GRUPOS_INICIO().filter(function(g){return g && g[0]!=='loot';}).forEach(function(g){ (g[1]||[]).forEach(function(x){ allPool.push(x); }); }); }
  const poolById={}; allPool.forEach(function(x){ if(x && x.id) poolById[x.id]=x; });
  const allItems=ids.map(function(id){ var x=poolById[id] || (typeof DATA!=='undefined' && DATA.recipes? DATA.recipes.find(function(r){return r.id===id;}) : null) || {id:id}; return x; });
  function imageFor(id){
    id=String(id||''); let base=id.replace(/^RECIPE_/i,'').replace(/_UPGRADED$|_PLUS$/i,'');
    let folder=null;
    if(/ARMOR/.test(id)) folder='armor';
    else if(/TRINKET/.test(id)) folder='trinket';
    else if(/WEAPON_PART/.test(id)) folder='weapon';
    else if(/CSM/.test(id) || /MAT_/.test(id)) folder='csm';
    if(!folder) return '';
    return '<img src="../img/'+folder+'/'+base+'.png" style="width:40px;height:40px;object-fit:contain;background:var(--ink);border:1px solid var(--edge);border-radius:4px;margin-right:6px;" onerror="this.style.display=&quot;none&quot;;">';
  }
  function groupOf(x){
    const id=String(x.id||'').toUpperCase();
    if (/ARMOR/.test(id)) return 'Armor';
    if (/TRINKET/.test(id)) return 'Trinkets';
    if (/WEAPON_PART/.test(id)) return 'Weapons';
    if (/CSM/.test(id)) return 'Consumables';
    if (/MAT_/.test(id)) return 'Materials';
    return 'Other';
  }
  function titleOf(x){ const n=prettyName((typeof L==='function')? L(x,'name') : (x.name_en||x.name||x.id)); return n || x.id; }
  const weaponBtns = (typeof HERO_LABELS!=='undefined') ? Object.keys(HERO_LABELS) : [];
  function renderGroup(items){
    const cells = items.map(function(x){
      return '<div style="padding:6px;margin-bottom:4px;border:1px solid var(--edge);background:var(--panel2);border-radius:6px;display:flex;align-items:center;gap:8px;font-size:12px;line-height:1.2;">'+imageFor(x.id)+'<span style="word-break:break-all;flex:1;">'+esc(titleOf(x))+'<div style="color:var(--dim);font-size:11px;">'+esc(x.id)+'</div></span><button data-remove="'+x.id+'" style="background:var(--panel);color:var(--text);border:1px solid var(--edge);border-radius:4px;padding:2px 6px;cursor:pointer;font-size:10px;">RMV</button></div>';
    }).join('');
    return cells;
  }
  const groupOrder=['Armor','Trinkets','Weapons','Consumables','Materials','Other'];
  const byGroup={};
  allItems.forEach(function(x){ const g=groupOf(x); if(!byGroup[g]) byGroup[g]=[]; byGroup[g].push(x); });
  let sections='';
  groupOrder.forEach(function(gn){
    const items = byGroup[gn];
    if (!items || !items.length) return;
    if (gn === 'Weapons') {
      const heroGroups={};
      items.forEach(function(x){
        let hero='Common';
        const base=String(x.id||'').replace(/^RECIPE_/i,'').replace(/_UPGRADED$|_PLUS$/i,'');
        const w=(typeof DATA!=='undefined' && Array.isArray(DATA.weaponParts))? (DATA.weaponParts.find(function(p){return p.id===base;}) || DATA.weaponParts.find(function(p){return base.indexOf(p.id)===0;})) : null;
        if(w && typeof HERO_FOR_CLASS!=='undefined'){ hero=HERO_FOR_CLASS[w.class] || hero; }
        const label=(typeof HERO_LABELS!=='undefined' && hero!=='Common')? (HERO_LABELS[hero]||hero) : hero;
        if(!heroGroups[label]) heroGroups[label]=[];
        heroGroups[label].push(x);
      });
      const heroNames=Object.keys(heroGroups).sort();
      const blocks=heroNames.map(function(label){
        return '<div style="margin-bottom:6px;"><h4 style="margin:0 0 4px 0;font-size:13px;color:var(--text);font-weight:700;">'+esc(label)+' ('+heroGroups[label].length+')</h4><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;">'+renderGroup(heroGroups[label])+'</div></div>';
      }).join('');
      sections += '<div style="margin-bottom:8px;"><h3 style="margin:0 0 6px 0;font-size:15px;color:var(--text);font-weight:700;">Weapons ('+items.length+')</h3>'+blocks+'</div>';
    } else {
      sections += '<div style="margin-bottom:8px;"><h3 style="margin:0 0 6px 0;font-size:15px;color:var(--text);font-weight:700;">'+esc(gn)+' ('+items.length+')</h3><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;">'+renderGroup(items)+'</div></div>';
    }
  });
  main.innerHTML=
    '<div style="display:flex;gap:8px;justify-content:center;margin-bottom:10px;flex-wrap:wrap;position:static;background:var(--panel2);padding:8px 0;">'+
      '<button id="forgeStartClear" style="background:var(--panel2);color:var(--text);border:1px solid var(--edge);border-radius:4px;padding:6px 12px;cursor:pointer;">Clear</button>'+
    '</div>'+
    '<div style="color:var(--dim);font-size:12px;margin-bottom:8px;text-align:center;">Items in Starting Inventory.</div>' +
    (ids.length? '' : '<p style="color:var(--dim);text-align:center;margin-top:20px;">No items.</p>')+
    sections;
  main.querySelectorAll('[data-remove]').forEach(function(b){
    b.addEventListener('click', function(){
      const id=b.getAttribute('data-remove');
      camp.start.items=camp.start.items.filter(function(i){return i.id!==id;});
      renderStartingInventoryCategory();
      if(typeof renderRight==='function') renderRight();
    });
  });
  const clearBtn=main.querySelector('#forgeStartClear');
  if(clearBtn) clearBtn.addEventListener('click', function(){
    if(typeof clearAllStartInv==='function') clearAllStartInv();
    if(typeof renderRight==='function') renderRight();
    renderStartingInventoryCategory();
  });
}

function renderReservedItemsCategory(){
  const main=overlay.querySelector('#forgeMain');
  if(!main) return;
  camp.start=camp.start||{items:[],reservedItems:[]};
  if(!Array.isArray(camp.start.reservedItems)) camp.start.reservedItems=[];
  const ids=camp.start.reservedItems.slice();
  let allPool=[]; if(typeof GRUPOS_INICIO==='function'){ GRUPOS_INICIO().filter(function(g){return g && g[0]!=='loot';}).forEach(function(g){ (g[1]||[]).forEach(function(x){ allPool.push(x); }); }); }
  const poolById={}; allPool.forEach(function(x){ if(x && x.id) poolById[x.id]=x; });
  const allItems=ids.map(function(id){ var x=poolById[id] || (typeof DATA!=='undefined' && DATA.recipes? DATA.recipes.find(function(r){return r.id===id;}) : null) || {id:id}; return x; });
  function imageFor(id){
    id=String(id||''); let base=id.replace(/^RECIPE_/i,'').replace(/_UPGRADED$|_PLUS$/i,'');
    let folder=null;
    if(/ARMOR/.test(id)) folder='armor';
    else if(/TRINKET/.test(id)) folder='trinket';
    else if(/WEAPON_PART/.test(id)) folder='weapon';
    else if(/CSM/.test(id) || /MAT_/.test(id)) folder='csm';
    if(!folder) return '';
    return '<img src="../img/'+folder+'/'+base+'.png" style="width:64px;height:64px;object-fit:contain;background:var(--ink);border:1px solid var(--edge);border-radius:4px;margin-right:8px;" onerror="this.style.display=&quot;none&quot;;">';
  }
  function groupOf(x){
    const id=String(x.id||'').toUpperCase();
    if(/ARMOR/.test(id)) return 'Armor';
    if(/TRINKET/.test(id)) return 'Trinkets';
    if(/WEAPON_PART/.test(id)) return 'Weapons';
    if(/CSM/.test(id)) return 'Consumables';
    if(/MAT_/.test(id)) return 'Materials';
    return 'Other';
  }
  const groupOrder=['Armor','Trinkets','Weapons','Consumables','Materials','Other'];
  const grouped={};
  allItems.forEach(function(x){ const g=groupOf(x); if(!grouped[g]) grouped[g]=[]; grouped[g].push(x); });
  const sections=groupOrder.map(function(gn){
    const items=grouped[gn]; if(!items||!items.length) return '';
    const cells=items.map(function(x){
      const name=prettyName((typeof L==='function')? L(x,'name') : (x.name_en||x.name||x.id));
      const flavor=(typeof partFlavor==='function')? partFlavor(x) : '';
      const title= flavor || name || x.id;
      const img=imageFor(x.id);
      return '<div style="padding:8px;margin-bottom:4px;border:1px solid var(--edge);background:var(--panel2);border-radius:6px;display:flex;align-items:center;gap:10px;font-size:12px;line-height:1.2;">'+img+'<span style="word-break:break-all;flex:1;">'+esc(title)+(title!==x.id? '<div style="color:var(--dim);font-size:11px;">'+esc(x.id)+'</div>':'')+'</span><button data-release="'+x.id+'" style="background:var(--panel);color:var(--text);border:1px solid var(--edge);border-radius:4px;padding:2px 6px;cursor:pointer;font-size:10px;">REL</button></div>';
    }).join('');
    return '<div style="margin-bottom:8px;"><h3 style="margin:0 0 6px 0;font-size:15px;color:var(--text);font-weight:700;">'+esc(gn)+' ('+items.length+')</h3><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;">'+cells+'</div></div>';
  }).join('');
  main.innerHTML=
    '<div style="display:flex;gap:8px;justify-content:center;margin-bottom:10px;flex-wrap:wrap;position:static;background:var(--panel2);padding:8px 0;">'+
      '<button id="forgeReservedClear" style="background:var(--panel2);color:var(--text);border:1px solid var(--edge);border-radius:4px;padding:6px 12px;cursor:pointer;">Clear</button>'+
    '</div>'+
    '<div style="color:var(--dim);font-size:12px;margin-bottom:8px;text-align:center;">Reserved items (story/feat rewards).</div>'+
    (ids.length? '' : '<p style="color:var(--dim);text-align:center;margin-top:20px;">No reserved items.</p>')+
    sections;
  main.querySelectorAll('[data-release]').forEach(function(b){
    b.addEventListener('click', function(){
      const id=b.getAttribute('data-release');
      camp.start.reservedItems=camp.start.reservedItems.filter(function(x){return x!==id;});
      renderReservedItemsCategory();
    });
  });

  const clearBtn=main.querySelector('#forgeReservedClear');
  if(clearBtn) clearBtn.addEventListener('click', function(){ camp.start.reservedItems=[]; renderReservedItemsCategory(); });
}
function renderWeaponInventoryCategory(){
  const main=overlay.querySelector('#forgeMain');
  if(!main) return;
  if(typeof selectedHero==='undefined' || !selectedHero) selectedHero=(typeof HERO_LABELS!=='undefined'? (Object.keys(HERO_LABELS)[0]||'HERO_BRYNN') : 'HERO_BRYNN');
  const heroes=(typeof HERO_ORDER!=='undefined')? HERO_ORDER : Object.keys((typeof HERO_LABELS!=='undefined')? HERO_LABELS : {'HERO_BRYNN':'Brynn'});
  const classes=(typeof HERO_DEFAULT_LOADOUT_CLASSES!=='undefined')? (HERO_DEFAULT_LOADOUT_CLASSES[selectedHero]||[]) : [];
  const left=heroes.map(function(h){
    const on=h===selectedHero;
    return '<button data-hero="'+h+'" style="padding:10px 6px;background:'+(on?'var(--torch)':'var(--panel2)')+';color:'+(on?'var(--ink)':'var(--text)')+';border:1px solid var(--edge);border-radius:6px;cursor:pointer;font-weight:'+(on?'700':'400')+';">'+esc((typeof HERO_LABELS!=='undefined')? (HERO_LABELS[h]||h) : h)+'</button>';
  }).join('');
  function groupRows(cls, slotLetter){
    const allowedAct2=forgeAllowedAct2();
    const parts=((typeof DATA!=='undefined' && Array.isArray(DATA.weaponParts))? DATA.weaponParts : []).filter(function(w){
      if((slotLetter==='B' || slotLetter==='C') && /_0$/i.test(String(w.id||''))) return false;
      if((typeof itemActOf==='function') && itemActOf({id:w.id})>=2 && !allowedAct2) return false;
      return w.class===cls && w.slot===slotLetter;
    });
    const seen=new Set();
    const families=[];
    parts.forEach(function(w){ const base=String(w.id||'').replace(/_UPGRADED$/i,''); if(!seen.has(base)){ seen.add(base); families.push(base); } });
    families.sort(function(a,b){ return String(a).localeCompare(String(b)); });
    return families.map(function(baseId){
      const plusId=baseId+'_UPGRADED';
      const basePart=parts.find(function(x){return x.id===baseId;});
      const plusPart=parts.find(function(x){return x.id===plusId;});
      const g=basePart || plusPart;
      const baseOwned=inStartInv(baseId);
      const plusOwned=inStartInv(plusId);
      const img='<img src="../img/weapon/'+String(baseId).replace(/_UPGRADED$|_PLUS$/i,'')+'.png" style="width:40px;height:40px;object-fit:contain;background:var(--ink);border:1px solid var(--edge);border-radius:4px;margin-right:8px;" onerror="this.style.display=&quot;none&quot;;">';
      const wname=prettyName((g && (g.name_en||g.name)) || baseId);
      const flavor=partFlavor(g||{});
      const partAct=(typeof itemActOf==='function')? itemActOf({id:baseId}) : 1;
      return '<div style="padding:6px;margin-bottom:4px;border:1px solid var(--edge);background:var(--panel2);border-radius:6px;display:flex;align-items:center;gap:8px;">'+
        img+
        '<div style="flex:1;font-size:12px;word-break:break-all;">'+esc(wname)+(partAct>=2?' (Act II)':'')+(flavor && flavor!==wname? '<div style="color:var(--dim);font-size:11px;">'+esc(flavor)+'</div>':'')+'<div style="color:var(--dim);font-size:11px;">'+esc(baseId)+'</div></div>'+
        '<div style="display:flex;flex-direction:column;gap:4px;align-items:flex-start;">'+
          (basePart? '<label style="display:flex;align-items:center;gap:4px;font-size:12px;'+(plusOwned?'opacity:.45;':'')+'"><input type="checkbox" data-startid="'+baseId+'" '+(baseOwned?'checked':'')+(plusOwned?' disabled':'')+'> Base</label>' : '')+
          (plusPart? '<label style="display:flex;align-items:center;gap:4px;font-size:12px;"><input type="checkbox" data-startid="'+plusId+'" '+(plusOwned?'checked':'')+'> Upgraded</label>' : '')+
        '</div>'+
      '</div>';
    }).join('');
  }
  const slotsHtml=classes.map(function(cls, i){
    const aRows=groupRows(cls,'A');
    const bRows=groupRows(cls,'B');
    const cRows=groupRows(cls,'C');
    return '<div style="border:1px solid var(--edge);border-radius:8px;padding:8px;margin-bottom:10px;background:var(--panel);">'+
      '<div style="font-weight:600;margin-bottom:8px;">Slot '+(i+1)+' - '+esc(cls)+'</div>'+
      '<div style="margin-bottom:6px;font-size:12px;color:var(--dim);">Part A</div>'+ (aRows||'<p style="color:var(--dim);font-size:12px;">No items</p>')+
      '<div style="margin:8px 0 6px 0;font-size:12px;color:var(--dim);">Part B</div>'+ (bRows||'<p style="color:var(--dim);font-size:12px;">No items</p>')+
      '<div style="margin:8px 0 6px 0;font-size:12px;color:var(--dim);">Part C</div>'+ (cRows||'<p style="color:var(--dim);font-size:12px;">No items</p>')+
    '</div>';
  }).join('');
  main.innerHTML=
    '<div style="display:flex;gap:8px;justify-content:center;margin-bottom:10px;flex-wrap:wrap;position:static;background:var(--panel2);padding:8px 0;">'+
      '<button id="forgeInvAddBase" style="background:var(--panel2);color:var(--text);border:1px solid var(--edge);border-radius:4px;padding:6px 12px;cursor:pointer;">Add all base</button>'+
      '<button id="forgeInvAddUpgraded" style="background:var(--torch);color:var(--ink);border:0;border-radius:4px;padding:6px 12px;cursor:pointer;font-weight:600;">Add all upgraded</button>'+
      '<button id="forgeInvClear" style="background:var(--panel2);color:var(--text);border:1px solid var(--edge);border-radius:4px;padding:6px 12px;cursor:pointer;">Clear</button>'+
    '</div>'+
    '<div style="display:grid;grid-template-columns:130px 1fr;gap:12px;height:100%;">'+
      '<div style="display:flex;flex-direction:column;gap:8px;">'+left+'</div>'+
      '<div style="min-width:0;"><div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;">'+slotsHtml+'</div></div>'+
    '</div>'+
    '<div id="forgeEditor" style="margin-top:12px;"></div>';
  main.querySelectorAll('button[data-hero]').forEach(function(b){ b.addEventListener('click', function(){ selectedHero=b.getAttribute('data-hero'); renderWeaponInventoryCategory(); }); });
  main.querySelectorAll('input[data-startid]').forEach(function(cb){ cb.addEventListener('change', function(){ var id=cb.getAttribute('data-startid'); if(cb.checked && /_UPGRADED$/i.test(id)){ setStartInv(id.replace(/_UPGRADED$/i,''), false); } setStartInv(id, cb.checked); renderWeaponInventoryCategory(); }); });
  const addBaseBtn=main.querySelector('#forgeInvAddBase');
  if(addBaseBtn) addBaseBtn.addEventListener('click',function(){ main.querySelectorAll('input[data-startid]').forEach(function(cb){ const id=cb.getAttribute('data-startid'); if(!id || /_UPGRADED$/i.test(id)) return; if((camp.start.items||[]).some(function(i){ return i.id === (id+'_UPGRADED') || i.id === (id+'_PLUS'); })) return; setStartInv(id, true); }); renderWeaponInventoryCategory(); });
  const addUpgradedBtn=main.querySelector('#forgeInvAddUpgraded');
  if(addUpgradedBtn) addUpgradedBtn.addEventListener('click',function(){ main.querySelectorAll('input[data-startid]').forEach(function(cb){ const id=cb.getAttribute('data-startid'); if(!id || !/_UPGRADED$/i.test(id)) return; setStartInv(id, true); setStartInv(id.replace(/_UPGRADED$/i,''), false); }); renderWeaponInventoryCategory(); });
  main.querySelectorAll('[data-makeloadout]').forEach(function(b){ b.addEventListener('click',function(){ makeHeroLoadout(b.getAttribute('data-makeloadout')); }); });
  const clearBtn=main.querySelector('#forgeInvClear');
  if(clearBtn) clearBtn.addEventListener('click', function(){ main.querySelectorAll('input[data-startid]').forEach(function(cb){ setStartInv(cb.getAttribute('data-startid'), false); }); renderWeaponInventoryCategory(); });
}

function renderItemPoolCategory(){
  const main=overlay.querySelector('#forgeMain');
  if(!main) return;
  const invIds = (typeof camp!=='undefined' && camp.start && Array.isArray(camp.start.items)) ? camp.start.items.map(function(i){return i.id;}) : [];
  const invFamilies = new Set(invIds.map(function(id){ return (typeof itemFamilyId==='function') ? itemFamilyId(id) : String(id||'').replace(/^RECIPE_/i,'').replace(/_PLUS$|_UPGRADED$/i,''); }));
  let allItems = [];
  if(typeof GRUPOS_INICIO==='function'){
    GRUPOS_INICIO().filter(function(g){return g && g[0]!=='loot';}).forEach(function(g){
      (g[1]||[]).forEach(function(x){ allItems.push(x); });
    });
  }
  const allowedAct2 = (typeof camp!=='undefined' && camp.meta && (camp.meta.act!=='I' || !!camp.meta.requiresAct2)) || false;
  allItems = allItems.filter(function(x){ return !camp || allowedAct2 || ( (typeof itemActOf==='function')? itemActOf(x) : 1 ) < 2; });
  const avail = allItems.filter(function(x, idx){
    const fam = (typeof itemFamilyId==='function') ? itemFamilyId(x.id) : String(x.id||'').replace(/^RECIPE_/i,'').replace(/_PLUS$|_UPGRADED$/i,'');
    const reservedIds = (typeof camp!=='undefined' && camp.start && Array.isArray(camp.start.reservedItems)) ? camp.start.reservedItems : [];
    return allItems.indexOf(x)===idx && /^RECIPE_/i.test(String(x.id||'')) && reservedIds.indexOf(String(x.id))===-1 && invIds.indexOf(String(x.id))===-1 && !invFamilies.has(fam);
  });
  function imageFor(id){
    id=String(id||''); let base=id.replace(/^RECIPE_/i,'').replace(/_UPGRADED$|_PLUS$/i,'');
    let folder=null;
    if(/ARMOR/.test(id)) folder='armor';
    else if(/TRINKET/.test(id)) folder='trinket';
    else if(/WEAPON_PART/.test(id)) folder='weapon';
    else if(/CSM/.test(id) || /MAT_/.test(id)) folder='csm';
    if(!folder) return '';
    return '<img src="../img/'+folder+'/'+base+'.png" style="width:64px;height:64px;object-fit:contain;background:var(--ink);border:1px solid var(--edge);border-radius:4px;margin-right:8px;" onerror="this.style.display=&quot;none&quot;;">';
  }
  function groupOf(x){
    const id=String(x.id||'').toUpperCase();
    if(/ARMOR/.test(id)) return 'Armor';
    if(/TRINKET/.test(id)) return 'Trinkets';
    if(/WEAPON_PART/.test(id)) return 'Weapons';
    if(/CSM/.test(id)) return 'Consumables';
    if(/MAT_/.test(id)) return 'Materials';
    return 'Other';
  }
  const groupOrder=['Armor','Trinkets','Weapons','Consumables','Materials','Other'];
  const grouped={};
  avail.forEach(function(x){ const g=groupOf(x); if(!grouped[g]) grouped[g]=[]; grouped[g].push(x); });
  const sections=groupOrder.map(function(gn){
    const items=grouped[gn]; if(!items || !items.length) return '';
    if(gn!=='Weapons'){
      const cells=items.map(function(x){
        const name=prettyName((typeof L==='function')? L(x,'name') : (x.name_en||x.name||x.id));
        const img=imageFor(x.id);
        return '<div style="padding:8px;border:1px solid var(--edge);background:var(--panel2);border-radius:6px;display:flex;align-items:center;gap:10px;font-size:12px;line-height:1.2;">'+img+'<span style="word-break:break-all;flex:1;">'+esc(name)+'</span><button data-reserve="'+x.id+'" style="background:var(--panel);color:var(--text);border:1px solid var(--edge);border-radius:4px;padding:2px 6px;cursor:pointer;font-size:10px;">RSV</button></div>';
      }).join('');
      return '<div style="margin-bottom:8px;"><h3 style="margin:0 0 6px 0;font-size:15px;color:var(--text);font-weight:700;">'+esc(gn)+' ('+items.length+')</h3><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:3px;">'+cells+'</div></div>';
    }
    // group weapons by hero
    const heroGroups={};
    items.forEach(function(x){
      let hero='Common';
      const base=String(x.id||'').replace(/^RECIPE_/i,'').replace(/_UPGRADED$|_PLUS$/i,'');
      const w=(typeof DATA!=='undefined' && Array.isArray(DATA.weaponParts))? (DATA.weaponParts.find(function(p){return p.id===base;}) || DATA.weaponParts.find(function(p){return base.indexOf(p.id)===0;})) : null;
      if(w && typeof HERO_FOR_CLASS!=='undefined'){ hero=HERO_FOR_CLASS[w.class] || hero; }
      const label=(typeof HERO_LABELS!=='undefined' && hero!=='Common')? (HERO_LABELS[hero]||hero) : hero;
      if(!heroGroups[label]) heroGroups[label]=[];
      heroGroups[label].push(x);
    });
    const heroNames=Object.keys(heroGroups).sort();
    const blocks=heroNames.map(function(label){
      const its=heroGroups[label];
      const cells=its.map(function(x){
        const name=prettyName((typeof L==='function')? L(x,'name') : (x.name_en||x.name||x.id));
        const img=imageFor(x.id);
        return '<div style="padding:8px;border:1px solid var(--edge);background:var(--panel2);border-radius:6px;display:flex;align-items:center;gap:10px;font-size:12px;line-height:1.2;">'+img+'<span style="word-break:break-all;flex:1;">'+esc(name)+'</span><button data-reserve="'+x.id+'" style="background:var(--panel);color:var(--text);border:1px solid var(--edge);border-radius:4px;padding:2px 6px;cursor:pointer;font-size:10px;">RSV</button></div>';
      }).join('');
      return '<div style="margin-bottom:6px;"><h4 style="margin:0 0 4px 0;font-size:13px;color:var(--text);font-weight:700;">'+esc(label)+' ('+its.length+')</h4><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:3px;">'+cells+'</div></div>';
    }).join('');
    return '<div style="margin-bottom:8px;"><h3 style="margin:0 0 6px 0;font-size:15px;color:var(--text);font-weight:700;">Weapons ('+items.length+')</h3>'+blocks+'</div>';
  }).join('');
  main.innerHTML=
    '<div style="color:var(--dim);font-size:12px;margin-bottom:8px;text-align:center;">Available recipes and items not in Starting Inventory.</div>' +
    (avail.length ? '' : '<p style="color:var(--dim);text-align:center;margin-top:20px;">No available items.</p>') +
    sections;
  main.querySelectorAll('[data-reserve]').forEach(function(b){
    b.addEventListener('click', function(){
      const id=b.getAttribute('data-reserve');
      camp.start=camp.start||{items:[],reservedItems:[]};
      if(!Array.isArray(camp.start.reservedItems)) camp.start.reservedItems=[];
      if(camp.start.reservedItems.indexOf(id)===-1) camp.start.reservedItems.push(id);
      renderItemPoolCategory();
    });
  });
}

function renderActiveCategory(){ if(activeCat==='weapons') renderLoadoutCategory(); else if(activeCat==='shared') renderSharedCategory(); else if(activeCat==='itempool') renderItemPoolCategory(); else if(activeCat==='reserved') renderReservedItemsCategory(); else if(activeCat==='startinv') renderStartingInventoryCategory(); else if(activeCat==='armor') renderArmorCategory(); else if(activeCat==='trinkets') renderTrinketsCategory(); else if(activeCat==='weaponinv') renderWeaponInventoryCategory(); else if(activeCat==='enemies') renderEnemiesCategory(); }
function renderAll(){}
function setCat(cat){
  activeCat=cat;
  overlay.querySelectorAll('[data-forgecat]').forEach(function(b){
    const on=b.getAttribute('data-forgecat')===cat;
    b.style.background=on?'var(--torch)':'var(--panel)';
    b.style.color=on?'var(--ink)':'var(--text)';
    b.style.fontWeight=on?'600':'400';
  });
  const searchWrap=overlay.querySelector('#forgeSearchWrap');
  const list=overlay.querySelector('#forgeList');
  const editor=overlay.querySelector('#forgeEditor');
  if(cat==='weapons'){
    if(searchWrap) searchWrap.style.display='none';
    if(list) list.style.display='none';
    renderHeroWeapons();
  } else if(cat==='shared'){
    if(searchWrap) searchWrap.style.display='none';
    if(list) list.style.display='none';
    renderSharedCategory();
  } else if(cat==='itempool'){
    if(searchWrap) searchWrap.style.display='none';
    if(list) list.style.display='none';
    if(editor) editor.innerHTML='';
    renderItemPoolCategory();
  } else {
    if(searchWrap) searchWrap.style.display='none';
    if(list) list.innerHTML='';
    if(editor) editor.innerHTML='';
    renderActiveCategory();
  }
}
overlay.querySelectorAll('[data-forgecat]').forEach(function(b){
  b.addEventListener('click',function(){ setCat(b.getAttribute('data-forgecat')); });
});
overlay.querySelector('#forgeSearch').addEventListener('input',function(){ if(activeCat==='weaponinv') renderList(); });
overlay.querySelector('#forgeNew').addEventListener('click',function(){const c={id:'WEAPON_PART_NEW',name:'New Part',name_en:'New Part',class:'Rune',slot:'A',upgrade:false};state.weaponParts.push(c);selected=c.id;persist();renderAll();});
const modesel=document.getElementById('modesel');
const btn=document.createElement('button');
btn.textContent='Forge'; btn.id='forgeBtn'; btn.setAttribute('data-forge','1');
if(modesel) modesel.appendChild(btn);
const topAddAll=overlay.querySelector('#forgeTopAddAll');
if(topAddAll) topAddAll.addEventListener('click',function(){ if(typeof addAllUpgradedGlobal==='function') addAllUpgradedGlobal(); renderActiveCategory(); });
const topManage=overlay.querySelector('#forgeTopManage');
if(topManage) topManage.addEventListener('click',function(){ if(typeof abrirInicioPopup==='function') abrirInicioPopup(); });
const topClear=overlay.querySelector('#forgeTopClear');
if(topClear) topClear.addEventListener('click',function(){ clearAllStartInv(); renderActiveCategory(); });

function placeForge(){ var h=document.querySelector('header'); var top=h?(h.getBoundingClientRect().bottom||h.offsetHeight||0):0; overlay.style.top=top+'px'; }
function openForge(){ window.__forgeOpen=true; placeForge(); overlay.style.display='block'; btn.classList.add('on'); renderActiveCategory(); }
function closeForge(){ window.__forgeOpen=false; overlay.style.display='none'; btn.classList.remove('on'); }
try {
  if (typeof addStartItem === 'function') {
    const origAddStartItem = addStartItem;
    window.addStartItem = function(id){ const r = origAddStartItem.apply(this, arguments); setTimeout(function(){ if (window.__forgeOpen && activeCat === 'itempool') renderActiveCategory(); }, 0); return r; };
  }
  if (typeof abrirInicioPopup === 'function') {
    const origAbrirInicioPopup = abrirInicioPopup;
    window.abrirInicioPopup = function(){ const r = origAbrirInicioPopup.apply(this, arguments); setTimeout(function(){
      const done = document.getElementById('iniDone');
      if (done) done.addEventListener('click', function(){ setTimeout(function(){ if (window.__forgeOpen && activeCat === 'itempool') renderActiveCategory(); }, 0); });
      if (window.__forgeOpen && activeCat === 'itempool') renderActiveCategory();
    }, 0); return r; };
  }
} catch (e) { console.warn('forge hooks', e); }

btn.addEventListener('click',function(){ if(overlay.style.display==='block') closeForge(); else openForge(); });
function showForgeContent(){ setCat(activeCat); }
window.__openForge=openForge; window.__setCat=setCat;

window.addEventListener('resize',function(){ if(overlay.style.display==='block') placeForge(); });
if(modesel){
  modesel.addEventListener('click',function(e){ const real=e.target.closest('[data-mode]'); if(real) closeForge(); });
}
})();

// === DescentForge external game data (enemy) override ===
function _bitsED(mask, list){ const out=[]; if(!mask || !list) return out; for(let i=0;i<list.length;i++){ if(mask & (1<<i)) out.push(list[i]); } return out; }
function _traitNameED(v){ try{ if(typeof TRAITS !== 'undefined' && TRAITS[v]) return TRAITS[v]; }catch(e){} return v; }
function convertExternalEnemyED(c){
  const tiers = Array.isArray(c.Tiers) ? c.Tiers : [];
  const first = tiers.length ? tiers[0] : {};
  const act = (typeof c._act === 'number') ? (c._act + 1) : (c.act || 1);
  const id = c._id || c.id || c.Id;
  return {
    id: id,
    name: c.name_en || c._name || c.name || id,
    name_en: c.name_en || c._name || '',
    type: c.Type || c.type || '',
    act: act,
    size: (typeof c.Size === 'number') ? c.Size : 0,
    mech: _bitsED(c.MechanicalTraits || 0, (typeof TRAITS_MEC !== 'undefined') ? TRAITS_MEC : []),
    theme: _bitsED(c.ThemeTraits || 0, (typeof TRAITS_TEMA !== 'undefined') ? TRAITS_TEMA : []),
    named: !!c.IsNamed,
    villain: !!c.IsVillain,
    perQuest: c.PerQuest || c.perQuest || 0,
    hp: first.StartingHealth || 0,
    def: first.Defense || 0,
    atk: first.BaseAttack || 0,
    tiers: tiers.map(function(t){ return t.Tier; }),
    tierStats: (function(){ const o={}; tiers.forEach(function(t){ o[t.Tier]={hp:t.StartingHealth,def:t.Defense,atk:t.BaseAttack}; }); return o; })(),
    custom: false,
    _external: true
  };
}
function applyExternalEnemyGameData(parsed){
  try {
    window.DESCENTFORGE_EXTERNAL_GAME_DATA = parsed;
    const src = (parsed && parsed.catalogo) ? parsed.catalogo : parsed || {};
    const mons = Array.isArray(src.monstros) ? src.monstros : (Array.isArray(parsed && parsed.monstros) ? parsed.monstros : []);
    const conv = mons.map(convertExternalEnemyED).filter(function(e){ return e && e.id; });
    if(!conv.length) return false;
    // keep custom enemies already in editor
    const custom = (DATA.enemies || []).filter(function(e){ return e && e.custom; });
    DATA.enemies = custom.concat(conv);
    window.DESCENTFORGE_EXTERNAL_ENEMY_COUNT = conv.length;
    return true;
  } catch(err){ console.warn('external enemy game data apply failed', err); return false; }
}
function extractJsonED(text){
  text = String(text||'').trim();
  try { return JSON.parse(text); } catch(e){}
  const a = text.indexOf('{'), b = text.lastIndexOf('}');
  if(a>=0 && b>a){ try { return JSON.parse(text.slice(a,b+1)); } catch(e){} }
  return null;
}
function openExternalEnemyGameDataPicker(){
  const inp = document.createElement('input');
  inp.type='file';
  inp.accept='.js,.json';
  inp.onchange = async function(){
    const f = inp.files && inp.files[0]; if(!f) return;
    try {
      const txt = await f.text();
      const parsed = extractJsonED(txt);
      if(!parsed){ alert('Could not parse file'); return; }
      const ok = applyExternalEnemyGameData(parsed);
      if(!ok){ alert('No enemies found in file'); return; }
      if(typeof renderEnemiesCategory==='function') renderEnemiesCategory();
      alert('Loaded '+ (window.DESCENTFORGE_EXTERNAL_ENEMY_COUNT||0) +' enemies from game data.');
    } catch(err){ alert('Load failed: '+(err&&err.message?err.message:err)); }
  };
  inp.click();
}
function tryAutoExternalEnemyGameData(){
  // Global override
  if(window.DESCENTFORGE_GAME_DATA && applyExternalEnemyGameData(window.DESCENTFORGE_GAME_DATA)){
    if(typeof renderEnemiesCategory==='function') renderEnemiesCategory();
    return true;
  }
  // Local file next to page (fetch may be blocked on file://)
  fetch('descentforge-game-data.js').then(function(r){ if(!r.ok) throw new Error('HTTP '+r.status); return r.text(); }).then(function(txt){
    const parsed = extractJsonED(txt);
    if(parsed && applyExternalEnemyGameData(parsed)){ if(typeof renderEnemiesCategory==='function') renderEnemiesCategory(); }
  }).catch(function(){ /* no auto file */ });
}
// run auto attempt when forge loads
try { setTimeout(tryAutoExternalEnemyGameData, 0); } catch(e){}
