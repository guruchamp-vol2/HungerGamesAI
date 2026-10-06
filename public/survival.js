(function(root,factory){
  const engine=factory();
  if(typeof module==='object' && module.exports)module.exports=engine;
  else root.SurvivalEngine=engine;
})(typeof globalThis!=='undefined'?globalThis:this,()=>{
  const SIZE=8;
  const TERRAINS=['forest','meadow','river','ruins','ridge'];
  const WEATHER=['clear','rain','storm'];
  const DIFFICULTIES={story:{drain:.6,enemy:.7},standard:{drain:1,enemy:1},hard:{drain:1.35,enemy:1.3}};
  const RECIPES={
    shelter:{label:'Shelter',cost:{wood:3,cloth:1},description:'Build a camp with stronger rest recovery.'},
    trap:{label:'Trap',cost:{wood:2,salvage:1},description:'A one-use trap deals damage to a tribute entering this tile.'},
    fire:{label:'Campfire',cost:{wood:2,cloth:1},description:'A warm camp improves rest and protects against storm damage.'},
    bandage:{label:'Bandage',cost:{cloth:2},description:'Turn cloth into a healing supply.'}
  };
  const OBJECTIVES=[
    {id:'explore',name:'Know the ground',text:'Explore twelve tiles.',test:s=>s.explored.length>=12,reward:8},
    {id:'supplies',name:'Ready for anything',text:'Gather five supply caches.',test:s=>s.cachesFound>=5,reward:10},
    {id:'camp',name:'A place to breathe',text:'Build your first shelter.',test:s=>s.world.some(tile=>tile.shelter),reward:10},
    {id:'survive',name:'Against the odds',text:'Survive into the third arena day.',test:s=>s.turn>=12,reward:12},
    {id:'combat',name:'Stand your ground',text:'Defeat your first tribute.',test:s=>s.kills>=1,reward:10}
  ];
  const ACHIEVEMENTS=[
    {id:'survivor',name:'Survivor',text:'Win a run.',test:r=>r.wins>=1},
    {id:'explorer',name:'Scout',text:'Explore 30 tiles in one run.',test:r=>r.bestExplored>=30},
    {id:'builder',name:'Resourceful',text:'Build a shelter in a run.',test:r=>r.camps>=1},
    {id:'veteran',name:'Arena veteran',text:'Complete five runs.',test:r=>r.runs>=5},
    {id:'pacifist',name:'Patient hunter',text:'Win a run without attacking a tribute.',test:r=>r.peacefulWins>=1}
  ];
  const number=(value,min,max,fallback=min)=>Number.isFinite(Number(value))?Math.max(min,Math.min(max,Number(value))):fallback;
  const int=(value,min,max,fallback=min)=>Math.floor(number(value,min,max,fallback));
  const position=value=>value && Number.isInteger(value.x) && Number.isInteger(value.y) && value.x>=0 && value.x<SIZE && value.y>=0 && value.y<SIZE;
  function random(state){
    let value=state.seed|0;value^=value<<13;value^=value>>>17;value^=value<<5;
    state.seed=value>>>0 || 1;return state.seed/4294967296;
  }
  const roll=(state,min,max)=>min+Math.floor(random(state)*(max-min+1));
  const distance=(a,b)=>Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y));
  const tileAt=state=>state.world[state.position.y*SIZE+state.position.x];
  function reveal(state){
    const tiles=new Set(state.explored);
    for(let y=Math.max(0,state.position.y-1);y<=Math.min(7,state.position.y+1);y++)for(let x=Math.max(0,state.position.x-1);x<=Math.min(7,state.position.x+1);x++)tiles.add(y*SIZE+x);
    state.explored=[...tiles].sort((a,b)=>a-b);
  }
  function create(options={}){
    const initialSeed=int(options.seed,1,4294967295,2026);
    const state={
      version:2,initialSeed,seed:initialSeed,difficulty:DIFFICULTIES[options.difficulty]?options.difficulty:'standard',
      turn:0,day:1,weather:'clear',position:{x:4,y:4},explored:[],world:[],enemies:[],
      health:number(options.health,0,100,100),energy:100,hunger:0,thirst:0,
      strength:int(options.strength,0,30,0),stealth:int(options.stealth,0,30,0),knowledge:int(options.knowledge,0,30,0),
      inventory:{food:2,water:2,medicine:1,wood:0,cloth:1,salvage:0,bandage:0},
      weapon:typeof options.weapon==='string'?options.weapon.slice(0,60):'Training knife',sponsorPoints:0,kills:0,cachesFound:0,
      hiddenFor:0,objectives:[],journal:[],status:'active',ending:null
    };
    for(let id=0;id<SIZE*SIZE;id++){
      const x=id%SIZE,y=Math.floor(id/SIZE),terrain=x===1 || y===6?'river':TERRAINS[roll(state,0,TERRAINS.length-1)];
      state.world.push({id,x,y,terrain,cache:random(state)<.2?['food','medicine','cloth','salvage'][roll(state,0,3)]:null,shelter:false,fire:false,trap:false});
    }
    state.world[36].terrain='meadow';state.world[36].cache='wood';
    const used=new Set([36]);
    for(let index=0;index<11;index++){
      let id=roll(state,0,63);while(used.has(id) || distance({x:id%8,y:Math.floor(id/8)},state.position)<=1)id=(id+1)%64;
      used.add(id);state.enemies.push({id:'tribute-'+(index+1),name:'District '+(index+1)+' tribute',x:id%8,y:Math.floor(id/8),health:roll(state,35,65),strength:roll(state,1,5),alert:false});
    }
    reveal(state);if(state.health===0){state.status='lost';state.ending='Your tribute entered the arena with no health.';}
    return state;
  }
  function normalize(raw){
    if(!raw || raw.version!==2 || !position(raw.position) || !Array.isArray(raw.world) || raw.world.length!==64 || !Array.isArray(raw.enemies) || raw.enemies.length>23)throw Error('Invalid arena checkpoint.');
    const state={...raw};
    state.initialSeed=int(raw.initialSeed,1,4294967295,2026);state.seed=int(raw.seed,1,4294967295,2026);
    state.difficulty=DIFFICULTIES[raw.difficulty]?raw.difficulty:'standard';state.turn=int(raw.turn,0,100000);state.day=Math.floor(state.turn/6)+1;
    state.weather=WEATHER.includes(raw.weather)?raw.weather:'clear';state.position={x:raw.position.x,y:raw.position.y};
    state.world=raw.world.map((tile,id)=>{if(!tile || !TERRAINS.includes(tile.terrain))throw Error('Invalid map tile.');return {id,x:id%8,y:Math.floor(id/8),terrain:tile.terrain,cache:['food','water','medicine','wood','cloth','salvage'].includes(tile.cache)?tile.cache:null,shelter:tile.shelter===true,fire:tile.fire===true,trap:tile.trap===true};});
    const seen=new Set();state.enemies=raw.enemies.map(enemy=>{
      if(!enemy || !position(enemy) || typeof enemy.id!=='string' || seen.has(enemy.id))throw Error('Invalid tribute data.');seen.add(enemy.id);
      return {id:enemy.id.slice(0,50),name:typeof enemy.name==='string'?enemy.name.slice(0,60):'Tribute',x:enemy.x,y:enemy.y,health:int(enemy.health,0,100),strength:int(enemy.strength,1,10,1),alert:enemy.alert===true};
    });
    for(const key of ['health','energy','hunger','thirst'])state[key]=number(raw[key],0,100,key==='health' || key==='energy'?100:0);
    for(const key of ['strength','stealth','knowledge'])state[key]=int(raw[key],0,30);
    state.inventory=Object.fromEntries(['food','water','medicine','wood','cloth','salvage','bandage'].map(key=>[key,int(raw.inventory?.[key],0,999)]));
    for(const key of ['sponsorPoints','kills','cachesFound','hiddenFor'])state[key]=int(raw[key],0,10000);
    state.objectives=[...new Set((Array.isArray(raw.objectives)?raw.objectives:[]).filter(id=>OBJECTIVES.some(o=>o.id===id)))];
    state.explored=[...new Set((Array.isArray(raw.explored)?raw.explored:[]).filter(id=>Number.isInteger(id) && id>=0 && id<64))];
    state.journal=(Array.isArray(raw.journal)?raw.journal:[]).slice(-100).flatMap(entry=>entry && typeof entry.text==='string'?[{turn:int(entry.turn,0,100000),text:entry.text.slice(0,1000)}]:[]);
    state.weapon=typeof raw.weapon==='string'?raw.weapon.slice(0,60):'Training knife';
    state.status=['active','won','lost'].includes(raw.status)?raw.status:'active';state.ending=typeof raw.ending==='string'?raw.ending.slice(0,300):null;
    if(state.health===0)state.status='lost';
    return state;
  }
  function parse(input){
    if(typeof input!=='string')return null;
    const action=input.trim().toLowerCase().replace(/\s+/g,' ');
    const movement=action.match(/^(?:(?:go|move|walk|run) )?(north|south|east|west|up|down|left|right)$/);
    if(movement)return {type:'move',direction:({up:'north',down:'south',left:'west',right:'east'})[movement[1]] || movement[1]};
    if(/^(explore|scout|look around|inspect.*|observe.*|wait)$/.test(action))return {type:action==='explore'?'explore':'observe'};
    if(/^(gather|collect|chop)( wood| branches| materials)?$/.test(action))return {type:'gather'};
    if(/^(search|loot|search supplies|search for supplies|find supplies|forage)$/.test(action))return {type:'search'};
    if(/^(search|find|gather)( for)? water$/.test(action))return {type:'water'};
    if(/^(rest|sleep|recover|sit)$/.test(action))return {type:'rest'};
    if(/^(hide|sneak|hide in brush)$/.test(action))return {type:'hide'};
    if(/^(eat|eat food|use food)$/.test(action))return {type:'use',item:'food'};
    if(/^(drink|drink water|use water)$/.test(action))return {type:'use',item:'water'};
    if(/^(heal|use medicine|use bandage|bandage)$/.test(action))return {type:'use',item:action.includes('bandage')?'bandage':'medicine'};
    const craft=action.match(/^(?:craft|build|make) (shelter|trap|fire|campfire|bandage)$/);
    if(craft)return {type:'craft',recipe:craft[1]==='campfire'?'fire':craft[1]};
    const attack=action.match(/^(?:attack|fight)(?: (.*))?$/);if(attack)return {type:'attack',target:attack[1] || ''};
    const sponsor=action.match(/^sponsor (food|water|medicine)$/);if(sponsor)return {type:'sponsor',item:sponsor[1]};
    return null;
  }
  function completeObjectives(state,events){
    for(const objective of OBJECTIVES)if(!state.objectives.includes(objective.id) && objective.test(state)){state.objectives.push(objective.id);state.sponsorPoints+=objective.reward;events.push('Objective complete: '+objective.name+' · +'+objective.reward+' sponsor points.');}
  }
  function advance(state,events){
    state.turn++;state.day=Math.floor(state.turn/6)+1;state.hiddenFor=Math.max(0,state.hiddenFor-1);
    const difficulty=DIFFICULTIES[state.difficulty];
    state.hunger=Math.min(100,state.hunger+3*difficulty.drain);state.thirst=Math.min(100,state.thirst+4*difficulty.drain);
    if(state.hunger>=85)state.health=Math.max(0,state.health-4*difficulty.drain);
    if(state.thirst>=85)state.health=Math.max(0,state.health-6*difficulty.drain);
    if(state.energy<=5)state.health=Math.max(0,state.health-2*difficulty.drain);
    if(state.turn%6===0){state.weather=WEATHER[roll(state,0,2)];events.push('Day '+state.day+' begins. Forecast: '+state.weather+'.');
      const alive=state.enemies.filter(e=>e.health>0);
      if(alive.length>1 && random(state)<.75){const victim=alive[roll(state,0,alive.length-1)];victim.health=0;events.push('A cannon sounds in the distance. Another tribute has fallen.');}
    }
    const tile=tileAt(state);
    if(state.weather==='storm' && !tile.shelter && !tile.fire){state.energy=Math.max(0,state.energy-3);events.push('The storm saps your energy. A sheltered camp would help.');}
    for(const enemy of state.enemies){
      if(enemy.health<=0)continue;
      if(random(state)<.4 && distance(enemy,state.position)<=3 && !state.hiddenFor){
        const dx=Math.sign(state.position.x-enemy.x),dy=Math.sign(state.position.y-enemy.y);
        if(random(state)<.5)enemy.x=int(enemy.x+dx,0,7);else enemy.y=int(enemy.y+dy,0,7);
      }else if(random(state)<.15){const direction=roll(state,0,3);enemy.x=int(enemy.x+(direction===0?1:direction===1?-1:0),0,7);enemy.y=int(enemy.y+(direction===2?1:direction===3?-1:0),0,7);}
      const enemyTile=state.world[enemy.y*8+enemy.x];
      if(enemyTile.trap){enemyTile.trap=false;enemy.health=Math.max(0,enemy.health-35);events.push(enemy.name+' triggered your trap.');if(enemy.health===0){state.kills++;state.sponsorPoints+=8;}}
      if(enemy.health>0 && distance(enemy,state.position)===0 && !state.hiddenFor){const damage=Math.max(2,roll(state,3,8)+enemy.strength-Math.floor(state.stealth/2));state.health=Math.max(0,state.health-Math.round(damage*difficulty.enemy));events.push(enemy.name+' attacks for '+Math.round(damage*difficulty.enemy)+' damage.');}
    }
    reveal(state);completeObjectives(state,events);
    if(state.health<=0){state.health=0;state.status='lost';state.ending='Your tribute fell in the arena on day '+state.day+'.';events.push(state.ending);}
    else if(!state.enemies.some(e=>e.health>0)){state.status='won';state.ending='The final cannon sounds. You are the victor.';events.push(state.ending);}
  }
  function act(raw,input){
    const state=normalize(raw),events=[];
    if(state.status!=='active')return {state,events:['This run has ended. Start a new game to return to the arena.'],consumed:false};
    const action=parse(input);if(!action)return {state,events:['Try a direction, search, gather wood, rest, hide, attack, eat, drink, or craft shelter/trap/fire/bandage.'],consumed:false};
    const tile=tileAt(state);
    if(action.type==='move' || action.type==='explore'){
      const direction=action.direction || ['north','south','east','west'][roll(state,0,3)];
      const delta={north:[0,-1],south:[0,1],east:[1,0],west:[-1,0]}[direction];
      const next={x:state.position.x+delta[0],y:state.position.y+delta[1]};
      if(!position(next))return {state,events:['The arena boundary blocks that direction.'],consumed:false};
      state.position=next;const terrain=tileAt(state).terrain;state.energy=Math.max(0,state.energy-(terrain==='ridge'?10:terrain==='river'?8:5));events.push('You move '+direction+' into '+terrain+' terrain.');
    }else if(action.type==='search'){
      state.energy=Math.max(0,state.energy-5);
      if(tile.cache){state.inventory[tile.cache]++;events.push('You found '+tile.cache+' in a supply cache.');tile.cache=null;state.cachesFound++;}
      else if(random(state)<.35){const item=['wood','cloth','food'][roll(state,0,2)];state.inventory[item]++;events.push('Your careful search turns up '+item+'.');}
      else events.push('You search the area, but useful supplies are scarce.');
    }else if(action.type==='water'){
      if(tile.terrain!=='river')return {state,events:['There is no water source here. Scout the map for a river.'],consumed:false};
      state.inventory.water++;state.energy=Math.max(0,state.energy-3);events.push('You collect fresh river water for later.');
    }else if(action.type==='gather'){
      const amount=tile.terrain==='forest'?2:1;state.inventory.wood=Math.min(999,state.inventory.wood+amount);state.energy=Math.max(0,state.energy-6);events.push('You collect '+amount+' wood.');
    }else if(action.type==='rest'){
      const recovery=tile.shelter?30:18;state.energy=Math.min(100,state.energy+recovery);state.health=Math.min(100,state.health+(tile.shelter?8:3)+(tile.fire?3:0));events.push('You rest'+(tile.shelter?' in your shelter':' beneath the open sky')+', restoring energy and a little health.');
    }else if(action.type==='hide'){
      state.hiddenFor=3;state.energy=Math.max(0,state.energy-3);events.push('You conceal yourself. Tributes will have trouble tracking you for the next two actions.');
    }else if(action.type==='observe'){
      reveal(state);state.energy=Math.max(0,state.energy-1);const nearby=state.enemies.filter(e=>e.health>0 && distance(e,state.position)<=2);
      events.push(nearby.length?'You notice '+nearby.map(e=>e.name).join(', ')+' nearby.':'The surrounding terrain seems quiet. You mark nearby paths on your map.');
    }else if(action.type==='use'){
      if(!state.inventory[action.item])return {state,events:['You have no '+action.item+' left.'],consumed:false};
      state.inventory[action.item]--;
      if(action.item==='food'){state.hunger=Math.max(0,state.hunger-45);state.health=Math.min(100,state.health+3);}
      if(action.item==='water'){state.thirst=Math.max(0,state.thirst-50);state.energy=Math.min(100,state.energy+5);}
      if(action.item==='medicine' || action.item==='bandage')state.health=Math.min(100,state.health+(action.item==='medicine'?30:18));
      events.push('You use '+action.item+'.');
    }else if(action.type==='craft'){
      const recipe=RECIPES[action.recipe];
      if(action.recipe!=='bandage' && tile[action.recipe])return {state,events:['This tile already has a '+action.recipe+'.'],consumed:false};
      const missing=Object.entries(recipe.cost).filter(([item,amount])=>state.inventory[item]<amount);
      if(missing.length)return {state,events:['You need '+missing.map(([item,amount])=>amount+' '+item).join(' and ')+' to craft '+recipe.label+'.'],consumed:false};
      for(const [item,amount] of Object.entries(recipe.cost))state.inventory[item]-=amount;
      if(action.recipe==='bandage')state.inventory.bandage++;else tile[action.recipe]=true;
      state.energy=Math.max(0,state.energy-8);events.push('You craft a '+recipe.label.toLowerCase()+'.');
    }else if(action.type==='attack'){
      const nearby=state.enemies.filter(e=>e.health>0 && distance(e,state.position)<=1);
      const target=action.target?nearby.find(e=>e.id===action.target || e.name.toLowerCase()===action.target):nearby[0];
      if(!target)return {state,events:['No tribute is within attack range. Move closer or scout first.'],consumed:false};
      const damage=roll(state,8,16)+state.strength+Math.floor(state.knowledge/2);target.health=Math.max(0,target.health-damage);state.energy=Math.max(0,state.energy-10);state.hiddenFor=0;
      events.push('You strike '+target.name+' for '+damage+' damage.');
      if(target.health===0){state.kills++;state.sponsorPoints+=8;state.inventory.salvage++;events.push(target.name+' falls. You salvage supplies and gain 8 sponsor points.');}
    }else if(action.type==='sponsor'){
      if(state.sponsorPoints<15)return {state,events:['A sponsor package costs 15 points. Complete objectives to earn support.'],consumed:false};
      state.sponsorPoints-=15;state.inventory[action.item]++;events.push('A sponsor parachute delivers '+action.item+'.');
    }
    advance(state,events);state.journal.push(...events.map(text=>({turn:state.turn,text})));state.journal=state.journal.slice(-100);
    return {state,events,consumed:true};
  }
  function visibleEnemies(state){return state.enemies.filter(e=>e.health>0 && state.explored.includes(e.y*8+e.x) && distance(e,state.position)<=2);}
  function recordRun(raw,state){
    const record=raw && typeof raw==='object'?raw:{};
    const ids=Array.isArray(record.recorded)?record.recorded.filter(id=>typeof id==='string').slice(-100):[];
    const id=(typeof state.runId==='string'?state.runId.slice(0,80):state.initialSeed)+':'+state.status+':'+state.turn;
    const result={runs:int(record.runs,0,100000),wins:int(record.wins,0,100000),peacefulWins:int(record.peacefulWins,0,100000),bestDay:int(record.bestDay,0,100000),bestExplored:int(record.bestExplored,0,64),camps:int(record.camps,0,100000),recorded:ids};
    if(state.status==='active' || ids.includes(id))return result;
    result.recorded.push(id);result.recorded=result.recorded.slice(-100);result.runs++;
    if(state.status==='won'){result.wins++;if(state.kills===0)result.peacefulWins++;}
    result.bestDay=Math.max(result.bestDay,state.day);result.bestExplored=Math.max(result.bestExplored,state.explored.length);if(state.world.some(t=>t.shelter))result.camps++;
    return result;
  }
  return {SIZE,TERRAINS,WEATHER,DIFFICULTIES,RECIPES,OBJECTIVES,ACHIEVEMENTS,create,normalize,parse,act,tileAt,visibleEnemies,recordRun};
});
