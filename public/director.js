(function(root,factory){const api=factory(typeof module==='object' && module.exports?require('./survival'):root.SurvivalEngine);if(typeof module==='object' && module.exports)module.exports=api;else root.ArenaDirector=api;})(typeof globalThis!=='undefined'?globalThis:this,engine=>{
  'use strict';
  const STYLES=['cinematic','tactical','brief'];
  const ACTIONS=['north','south','east','west','search','gather wood','search water','rest','hide','observe','eat','drink','use medicine','use bandage','craft shelter','craft trap','craft fire','craft bandage','sponsor food','sponsor water','sponsor medicine','attack'];
  const text=(value,max)=>typeof value==='string'?value.trim().slice(0,max):'';
  function context(payload){
    if(!payload || typeof payload!=='object' || Array.isArray(payload))throw Error('Send an arena context.');
    const state=engine.normalize(payload.state),tile=engine.tileAt(state);
    const character=payload.character || {};
    return {action:text(payload.action,500),style:STYLES.includes(payload.style)?payload.style:'cinematic',character:{name:text(character.name,32)||'Tribute',district:text(character.district,32)||'Unknown'},
      arena:{turn:state.turn,day:state.day,weather:state.weather,status:state.status,health:state.health,energy:state.energy,hunger:state.hunger,thirst:state.thirst,position:state.position,terrain:tile.terrain,shelter:tile.shelter,fire:tile.fire,weapon:state.weapon,skills:{strength:state.strength,stealth:state.stealth,knowledge:state.knowledge},inventory:state.inventory,sponsorPoints:state.sponsorPoints,tributesRemaining:state.enemies.filter(e=>e.health>0).length+(state.status==='lost'?0:1),nearby:engine.visibleEnemies(state).map(e=>({id:e.id,name:e.name,health:e.health,x:e.x,y:e.y})),explored:state.explored.length},
      events:(Array.isArray(payload.events)?payload.events:[]).filter(v=>typeof v==='string').slice(-12).map(v=>text(v,600)),
      memory:(Array.isArray(payload.memory)?payload.memory:[]).filter(v=>typeof v==='string').slice(-6).map(v=>text(v,450)),suggestions:suggest(state)};
  }
  function suggest(state){
    if(state.status!=='active')return [];
    const tile=engine.tileAt(state),nearby=engine.visibleEnemies(state),ideas=[];
    const add=(action,label,reason,risk='low')=>{if(!ideas.some(i=>i.action===action))ideas.push({action,label,reason,risk});};
    if(state.health<=60 && state.inventory.medicine)add('use medicine','Treat your wounds','You have medicine and your health is low.');
    if(state.health<=75 && state.inventory.bandage)add('use bandage','Apply a bandage','A bandage can restore some health.');
    if(state.thirst>=35 && state.inventory.water)add('drink','Drink water','Hydration prevents damage when thirst gets too high.');
    if(state.hunger>=35 && state.inventory.food)add('eat','Eat a meal','Save your strength by lowering hunger.');
    if(nearby.length && !state.hiddenFor)add('hide','Find cover','Spotted tributes make open movement dangerous.','medium');
    if(state.energy<=55)add('rest','Recover your energy',tile.shelter?'Your shelter improves recovery.':'Rest restores energy, but leaves time for opponents to move.',nearby.length?'high':'medium');
    if(!state.inventory.water && tile.terrain==='river')add('search water','Fill your water supply','This tile has a river.');
    if(!tile.shelter && state.inventory.wood>=3 && state.inventory.cloth>=1)add('craft shelter','Build a shelter','A camp improves rest and protects against storms.','medium');
    if(tile.cache)add('search','Search the cache','There are supplies at your current location.','medium');
    if(state.sponsorPoints>=15 && !state.inventory.water)add('sponsor water','Request sponsor water','Trade 15 sponsor points for water.');
    if(state.sponsorPoints>=15 && !state.inventory.food)add('sponsor food','Request sponsor food','Trade 15 sponsor points for food.');
    if(nearby.some(e=>Math.max(Math.abs(e.x-state.position.x),Math.abs(e.y-state.position.y))<=1) && state.health>60)add('attack','Challenge a nearby tribute','A fight may earn supplies, but opponents can retaliate.','high');
    if(state.inventory.wood<3)add('gather wood','Gather building materials',tile.terrain==='forest'?'Forests give extra wood.':'Wood can be used for shelter and traps.','medium');
    add('observe','Scout your surroundings','Check visible paths and nearby threats.','medium');
    for(const [action,dx,dy] of [['north',0,-1],['east',1,0],['south',0,1],['west',-1,0]]){
      const x=state.position.x+dx,y=state.position.y+dy;if(x<0 || x>7 || y<0 || y>7)continue;
      if(!state.explored.includes(y*8+x))add(action,'Explore '+action,'This direction leads toward unexplored ground.','medium');
    }
    return ideas.slice(0,3);
  }
  function localNarration(ctx){
    const a=ctx.arena;
    if(a.status==='lost')return 'The arena falls quiet around your tribute. This run has ended; the journal keeps the choices that brought you here.';
    if(a.status==='won')return 'The final cannon leaves only silence. Against the odds, your tribute stands as the victor.';
    if(ctx.style==='brief')return ctx.events.join(' ') || `Day ${a.day}: ${a.weather} weather in the ${a.terrain}.`;
    if(ctx.style==='tactical')return `${a.health} health, ${a.energy} energy. Hunger: ${Math.round(a.hunger)}; thirst: ${Math.round(a.thirst)}. ${ctx.suggestions[0]?.reason || 'Watch your supplies and keep an exit in mind.'}`;
    const atmosphere={forest:'Branches frame the paths ahead.',meadow:'The open ground offers little cover.',river:'The water breaks the quiet around you.',ruins:'Broken walls frame your next decision.',ridge:'The high ground opens a wider view of the arena.'}[a.terrain];
    const weather=a.weather==='storm'?'Thunder rolls over the arena.':a.weather==='rain'?'Rain beads on the ground around you.':'The air is still enough to hear your own breathing.';
    const tension=a.health<35?'Every next choice feels heavier with your injuries.':a.thirst>=70?'Thirst makes it harder to focus.':a.hunger>=70?'Hunger weighs on your concentration.':a.nearby.length?'You keep the spotted tributes in mind, weighing cover against confrontation.':'For this moment, no nearby tribute is in view.';
    return [atmosphere,weather,tension].join(' ');
  }
  function interpret(input){
    const clean=text(input,500).toLowerCase().replace(/[.!?]+$/,'').trim();
    if(/\b(don't|do not|never|avoid)\b/.test(clean))return null;
    if(engine.parse(clean))return clean;
    const direction=clean.match(/\b(north|south|east|west)\b/);if(direction && /\b(go|move|head|walk|run|travel|sneak)\b/.test(clean))return direction[1];
    const patterns=[[/\b(bandage|dress)\b.*\b(wound|injur|cut)/,'use bandage'],[/\b(heal|medicine|medkit|treat my)/,'use medicine'],[/\b(drink|hydrate|sip)/,'drink'],[/\b(eat|meal|snack)/,'eat'],[/\b(collect|gather|fill|find|search|look)\b.*\bwater/,'search water'],[/\b(collect|gather|chop)\b.*\b(wood|branches)/,'gather wood'],[/\b(build|craft|make)\b.*\b(shelter|camp|tent)/,'craft shelter'],[/\b(build|craft|make)\b.*\btrap/,'craft trap'],[/\b(build|craft|make|light)\b.*\bfire/,'craft fire'],[/\b(build|craft|make)\b.*\bbandage/,'craft bandage'],[/\b(rest|sleep|recover|take a break)/,'rest'],[/\b(hide|conceal|cover)/,'hide'],[/\b(search|loot|forage|supplies)/,'search'],[/\b(scout|inspect|look around|observe)/,'observe'],[/\b(attack|fight|strike)/,'attack']];
    return patterns.find(([pattern])=>pattern.test(clean))?.[1] || null;
  }
  return {STYLES,ACTIONS,context,suggest,localNarration,interpret};
});
