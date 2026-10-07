const $=id=>document.getElementById(id);
const storage={getItem(key){try{return localStorage.getItem(key);}catch{return null;}},setItem(key,value){try{localStorage.setItem(key,value);return true;}catch{return false;}},removeItem(key){try{localStorage.removeItem(key);}catch{}}};
let story=null,gameExtras={},currentUser={id:'guest',username:'Guest Player'},authToken=storage.getItem('authToken');
let currentSaveId=null,currentSaveName='',gameStartTime=Date.now(),busy=false;
let record;
try{record=JSON.parse(storage.getItem('hunger-record')) || {};}catch{record={};}
const element=(tag,text,className)=>{const node=document.createElement(tag);if(text!=null)node.textContent=text;if(className)node.className=className;return node;};
const notice=text=>{$('notice').textContent=text;};
function appendStory(text,type='narration'){
  if(!text)return;const p=element('p',text,'story-entry '+type);$('storyContainer').append(p);
  while($('storyContainer').children.length>300)$('storyContainer').firstChild.remove();
  $('storyContainer').scrollTop=$('storyContainer').scrollHeight;
}
function transcript(){return [...$('storyContainer').querySelectorAll('p')].slice(-200).map(p=>p.textContent);}
function restoreTranscript(lines){$('storyContainer').replaceChildren();for(const line of Array.isArray(lines)?lines.slice(-200):[])appendStory(String(line).slice(0,5000));}
function activateTab(id){document.querySelectorAll('.game-tab').forEach(tab=>{tab.classList.toggle('active',tab.dataset.panel===id);tab.setAttribute('aria-selected',String(tab.dataset.panel===id));});document.querySelectorAll('.game-panel').forEach(panel=>panel.classList.toggle('active',panel.id===id));}
document.querySelectorAll('.game-tab').forEach(tab=>tab.onclick=()=>activateTab(tab.dataset.panel));
async function api(route,body,method=body===undefined?'GET':'POST'){
  const response=await fetch(route,{method,headers:{'Content-Type':'application/json',...(authToken?{Authorization:'Bearer '+authToken}:{})},body:body===undefined?undefined:JSON.stringify(body)});
  const data=await response.json();if(!response.ok)throw Error(data.error || 'The request failed.');return data;
}
async function checkAuthentication(){
  if(authToken){try{const {user}=await api('/api/profile');currentUser=user;}catch{currentUser={id:'guest',username:'Guest Player'};}}
  $('username').textContent=currentUser.username;$('userStatus').textContent=currentUser.id==='guest'?'Local checkpoints available':'Cloud saves available';
  $('authLink').textContent=currentUser.id==='guest'?'Sign in':'Sign out';
  $('authLink').onclick=event=>{if(currentUser.id!=='guest'){event.preventDefault();logout();}};
}
function logout(){storage.removeItem('authToken');storage.removeItem('currentUser');authToken=null;currentUser={id:'guest',username:'Guest Player'};checkAuthentication();loadUserSaves();notice('Signed out. Your local checkpoint is still available.');}
async function loadStory(){
  $('storyContainer').replaceChildren();$('choices').replaceChildren();notice('');
  try{const response=await fetch('/story.json?v=arena-ai-4',{cache:'no-store'});if(!response.ok)throw Error('Story file unavailable');const data=await response.json();storyContent=data;story=new inkjs.Story(data);continueStory();}
  catch(error){story=null;appendStory('The story could not load. Check your connection and try again.','warning');const retry=element('button','Retry','primary');retry.onclick=loadStory;$('choices').append(retry);notice(error.message);}
}
function continueStory(){
  if(!story)return;
  let iterations=0;
  while(story.canContinue && iterations++<150){const text=story.Continue();if(text.trim())appendStory(text.trim());if(story.currentTags?.includes('free_roam')){showFreeRoamMode();return;}}
  if(iterations>=150){notice('The story needs attention. Restart or restore a checkpoint.');return;}
  $('inputSection').hidden=true;displayChoices();updateCharacterStats();
}
function displayChoices(){
  $('choices').replaceChildren();
  const activeStory=story;
  for(const [index,choice] of (story?.currentChoices || []).entries()){
    const button=element('button',choice.text,'choice');
    button.onclick=()=>{
      // Detached buttons and queued double-clicks must not choose from a later scene.
      if(busy || story!==activeStory || story.currentChoices[index]!==choice)return;
      busy=true;
      $('choices').querySelectorAll('button').forEach(control=>control.disabled=true);
      try{
        let name=null;
        if(/enter your name/i.test(choice.text)){name=prompt('Tribute name:',currentUser.id==='guest'?'Tribute':currentUser.username);if(name===null)return;name=name.trim().slice(0,32)||'Tribute';}
        story.ChooseChoiceIndex(index);continueStory();if(name){story.variablesState.player_name=name;updateCharacterStats();}checkpoint();
      }catch(error){notice('That choice could not continue. Restore your checkpoint or start a new tribute.');displayChoices();}
      finally{busy=false;$('choices').querySelectorAll('button').forEach(control=>control.disabled=false);if(gameExtras.survival)renderArena();}
    };
    $('choices').append(button);
  }
  if(story && !story.canContinue && !story.currentChoices.length && !gameExtras.survival)$('choices').append(element('p','Your story has ended. Start a new game to return.','muted'));
}
function arenaSeed(){const entered=Number($('runSeed').value);if(Number.isInteger(entered) && entered>0 && entered<=4294967295)return entered;const bytes=new Uint32Array(1);crypto.getRandomValues(bytes);return bytes[0] || 1;}
function ensureArena(){
  if(gameExtras.survival)return;
  gameExtras.survival=SurvivalEngine.create({seed:arenaSeed(),difficulty:$('difficulty').value,health:story.variablesState.player_health,strength:story.variablesState.player_strength,stealth:story.variablesState.player_stealth,knowledge:story.variablesState.player_knowledge,weapon:story.variablesState.player_weapon});
  gameExtras.survival.runId=crypto.randomUUID();
  appendStory('The arena opens before you. Explore for supplies, keep yourself fed and hydrated, and choose your fights.','system');syncStory();
}
function showFreeRoamMode(){
  ensureArena();$('choices').replaceChildren();$('inputSection').hidden=false;
  $('difficulty').disabled=true;$('runSeed').disabled=true;renderArena();updateCharacterStats();
}
function syncStory(){
  const s=gameExtras.survival;if(!s || !story)return;
  for(const [key,value] of Object.entries({player_health:s.health,player_energy:s.energy,player_dead:s.status==='lost',days_survived:s.day-1,tributes_remaining:s.enemies.filter(e=>e.health>0).length+(s.status==='lost'?0:1),sponsor_points:s.sponsorPoints,player_inventory:Object.entries(s.inventory).filter(([,v])=>v>0).map(([k,v])=>k+' ×'+v).join(', '),player_weapon:s.weapon}))if(story.variablesState[key]!==undefined)story.variablesState[key]=value;
}
function directorPayload(action,events=[]){
  return {action,state:gameExtras.survival,character:charData,events,style:$('narrationStyle').value,
    memory:Array.isArray(gameExtras.directorMemory)?gameExtras.directorMemory.slice(-6):[],mode:'local'};
}
let proposedAction=null;
function clearProposal(){proposedAction=null;$('intentPreview').hidden=true;}
function proposeAction(action){
  proposedAction={action,turn:gameExtras.survival.turn,runId:gameExtras.survival.runId};
  $('intentText').textContent='Try this as “'+action+'”? This will use one arena action if it succeeds.';
  $('intentPreview').hidden=false;
}
function rememberNarration(action,response){
  gameExtras.directorMemory=[...(Array.isArray(gameExtras.directorMemory)?gameExtras.directorMemory:[]),action+': '+response].slice(-6).map(value=>String(value).slice(0,450));
}
function renderCoach(){
  const list=$('coachSuggestions');list.replaceChildren();
  $('directorMemory').textContent=(Array.isArray(gameExtras.directorMemory)?gameExtras.directorMemory:[]).length+' recent scenes remembered';
  $('directorSource').textContent='Free local director';
  if(!gameExtras.survival){list.append(element('p','Your survival coach becomes available after training.','muted'));return;}
  const suggestions=ArenaDirector.suggest(gameExtras.survival);
  if(!suggestions.length){list.append(element('p','This run is complete. Begin a new tribute to return to the arena.','muted'));return;}
  for(const idea of suggestions){const card=element('article',null,'coach-card');const heading=element('div',null,'coach-heading');heading.append(element('strong',idea.label),element('small',idea.risk+' risk','risk '+idea.risk));card.append(heading,element('p',idea.reason,'muted'));const button=element('button','Choose: '+idea.action,'secondary');button.disabled=busy;button.onclick=()=>handleFreeRoamAction(idea.action);card.append(button);list.append(card);}
  $('directorMemory').textContent=(Array.isArray(gameExtras.directorMemory)?gameExtras.directorMemory:[]).length+' recent scenes remembered';
}
async function handleFreeRoamAction(action){
  if(busy || !story || gameExtras.survival?.status!=='active')return;
  if(typeof action!=='string' || !action.trim() || action.length>500)return;
  clearProposal();busy=true;renderControls();renderCoach();
  try{
    if(!SurvivalEngine.parse(action)){
      const interpreted=$('interpretActions').checked?ArenaDirector.interpret(action):null;
      if(interpreted){proposeAction(interpreted);return;}
      notice('That action has no arena command yet. Try a direction, search, gather wood, rest, hide, or one of the coach suggestions.');return;
    }
    appendStory('> '+action,'player-action');
    const result=SurvivalEngine.act(gameExtras.survival,action);gameExtras.survival=result.state;
    for(const event of result.events)appendStory(event,result.state.status==='active'?'narration':'ending');
    syncStory();updateCharacterStats();
    if(result.consumed && $('narrationEnabled').checked){
      const payload=directorPayload(action,result.events),ctx=ArenaDirector.context(payload);
      const narration={response:ArenaDirector.localNarration(ctx),source:'local'};
      if(payload.style!=='brief')appendStory(narration.response,'ai-narration');
      rememberNarration(action,narration.response);gameExtras.directorSource=narration.source;
      $('directorSource').textContent='Free local director';
    }
    renderArena();checkpoint();
    if(result.state.status!=='active'){
      record=SurvivalEngine.recordRun(record,result.state);storage.setItem('hunger-record',JSON.stringify(record));renderRecord();
      if(result.state.status==='won' && !gameExtras.resultSubmitted && currentUser.id!=='guest'){gameExtras.resultSubmitted=true;await submitLeaderboardEntry('normal');checkpoint();}
    }
  }finally{busy=false;$('typingIndicator').hidden=true;renderArena();renderCoach();}
}
const charData={};
function updateCharacterStats(){
  if(!story)return;
  const v=story.variablesState;
  Object.assign(charData,{name:v.player_name || 'Tribute',district:v.player_district || 'Undeclared',age:v.player_age || 0,health:v.player_health ?? 100,weapon:v.player_weapon || 'None',inventory:v.player_inventory || 'Empty',trainingScore:(v.player_strength || 0)+(v.player_stealth || 0)+(v.player_knowledge || 0),sponsorPoints:v.sponsor_points || 0});
  for(const [id,value] of Object.entries({charName:charData.name,charDistrict:charData.district,charAge:charData.age || '—',charWeapon:charData.weapon,charInventory:charData.inventory,charStrength:v.player_strength || 0,charStealth:v.player_stealth || 0,charKnowledge:v.player_knowledge || 0}))$(id).textContent=value;
  $('health').style.width=Math.max(0,Math.min(100,charData.health))+'%';$('healthValue').textContent=Math.round(charData.health)+'%';
}
function renderControls(){const active=gameExtras.survival?.status==='active';$('cmdInput').disabled=busy || !active;$('sendAction').disabled=busy || !active;document.querySelectorAll('[data-action]').forEach(button=>button.disabled=busy || !active);}
function renderArena(){
  renderCoach();
  const s=gameExtras.survival;if(!s){$('arenaMap').textContent='Your arena map appears after training.';renderControls();return;}
  const tile=SurvivalEngine.tileAt(s);
  $('dayValue').textContent='Day '+s.day;$('turnValue').textContent='Action '+s.turn;$('weatherValue').textContent=s.weather;
  $('aliveValue').textContent=s.enemies.filter(e=>e.health>0).length+(s.status==='lost'?0:1);
  $('energyValue').textContent=Math.round(s.energy)+'%';$('hungerValue').textContent=Math.round(s.hunger)+'%';$('thirstValue').textContent=Math.round(s.thirst)+'%';$('sponsorValue').textContent=s.sponsorPoints;
  for(const [id,value] of [['energyBar',s.energy],['hungerBar',s.hunger],['thirstBar',s.thirst]])$(id).style.width=value+'%';
  $('runInfo').textContent='Seed '+s.initialSeed+' · '+s.difficulty+' · '+s.explored.length+'/64 tiles explored';
  $('tileInfo').textContent=`${tile.terrain} · (${s.position.x+1}, ${s.position.y+1})${tile.shelter?' · shelter':''}${tile.fire?' · campfire':''}${tile.trap?' · armed trap':''}`;
  $('arenaMap').replaceChildren();
  const glyph={forest:'♠',meadow:'·',river:'≈',ruins:'▥',ridge:'△'};
  const visible=SurvivalEngine.visibleEnemies(s);
  for(const t of s.world){
    const discovered=s.explored.includes(t.id),you=t.x===s.position.x && t.y===s.position.y,enemy=visible.find(e=>e.x===t.x && e.y===t.y);
    const button=element('button',you?'◉':discovered?enemy?'!':t.shelter?'⌂':t.cache?'◇':glyph[t.terrain]:'?','map-tile '+(discovered?t.terrain:'unknown')+(you?' current':''));
    button.setAttribute('aria-label',`${t.x+1}, ${t.y+1}: ${you?'your position':discovered?t.terrain+(enemy?', nearby tribute':''):', unexplored'}`);
    const dx=t.x-s.position.x,dy=t.y-s.position.y;button.disabled=busy || s.status!=='active' || Math.abs(dx)+Math.abs(dy)!==1;
    button.onclick=()=>handleFreeRoamAction(dx>0?'east':dx<0?'west':dy>0?'south':'north');$('arenaMap').append(button);
  }
  $('nearbyEnemies').replaceChildren();
  for(const enemy of visible){const card=element('article',null,'enemy-card');card.append(element('strong',enemy.name),element('span',enemy.health+' HP','muted'));const attack=element('button','Attack','secondary');attack.disabled=busy || Math.max(Math.abs(enemy.x-s.position.x),Math.abs(enemy.y-s.position.y))>1 || s.status!=='active';attack.onclick=()=>handleFreeRoamAction('attack '+enemy.id);card.append(attack);$('nearbyEnemies').append(card);}
  if(!visible.length)$('nearbyEnemies').append(element('p','No tributes spotted nearby. Stay alert.','muted'));
  $('inventoryList').replaceChildren();
  for(const [name,quantity] of Object.entries(s.inventory)){const row=element('div',null,'inventory-row');row.append(element('strong',name),element('span','× '+quantity));if(['food','water','medicine','bandage'].includes(name)){const use=element('button','Use','secondary');use.disabled=busy || !quantity || s.status!=='active';use.onclick=()=>handleFreeRoamAction('use '+name);row.append(use);}$('inventoryList').append(row);}
  $('craftingRecipes').replaceChildren();
  for(const [id,recipe] of Object.entries(SurvivalEngine.RECIPES)){const card=element('article',null,'recipe-card');card.append(element('h3',recipe.label),element('p',recipe.description,'muted'),element('p',Object.entries(recipe.cost).map(([name,amount])=>amount+' '+name).join(' + '),'recipe-cost'));const craft=element('button','Craft '+recipe.label,'secondary');craft.disabled=busy || s.status!=='active' || Object.entries(recipe.cost).some(([name,amount])=>s.inventory[name]<amount);craft.onclick=()=>handleFreeRoamAction('craft '+id);card.append(craft);$('craftingRecipes').append(card);}
  $('objectivesList').replaceChildren();
  for(const goal of SurvivalEngine.OBJECTIVES){const item=element('article',null,'objective'+(s.objectives.includes(goal.id)?' complete':''));item.append(element('strong',(s.objectives.includes(goal.id)?'✓ ':'◇ ')+goal.name),element('p',goal.text,'muted'),element('small','Reward: '+goal.reward+' sponsor points'));$('objectivesList').append(item);}
  $('journalList').replaceChildren();for(const entry of s.journal.slice().reverse()){const row=element('article',null,'journal-entry');row.append(element('small','Action '+entry.turn),element('p',entry.text));$('journalList').append(row);}
  $('endingBanner').hidden=s.status==='active';$('endingBanner').textContent=s.ending || '';
  renderControls();
}
function renderRecord(){
  $('recordStats').replaceChildren();for(const [name,value] of [['Runs',record.runs || 0],['Wins',record.wins || 0],['Best day',record.bestDay || 0]]){const tile=element('div');tile.append(element('strong',value),element('span',name));$('recordStats').append(tile);}
  $('achievementsList').replaceChildren();for(const achievement of SurvivalEngine.ACHIEVEMENTS){const card=element('article',null,'achievement'+(achievement.test(record)?' unlocked':''));card.append(element('strong',(achievement.test(record)?'◆ ':'◇ ')+achievement.name),element('p',achievement.text,'muted'));$('achievementsList').append(card);}
}
function snapshot(){
  return {version:2,storyState:story.state.ToJson(),characterData:{...charData,extras:{...gameExtras},survival:gameExtras.survival || null,transcript:transcript(),playTimeMinutes:Math.floor((Date.now()-gameStartTime)/60000)}};
}
function checkpoint(){if(!story?.state?.ToJson)return;const saved=snapshot();saved.elapsed=Date.now()-gameStartTime;const ok=storage.setItem('hunger-checkpoint',JSON.stringify(saved));$('checkpointStatus').textContent=ok?'Checkpoint saved on this device':'Storage unavailable · export a backup';}
function restore(value){
  if(busy)throw Error('Wait for the current action to finish before loading a run.');
  clearProposal();
  if(!value || typeof value.storyState!=='string' || value.storyState.length>400000)throw Error('This save is not readable.');
  const data=value.characterData || value;
  const survival=data.survival || data.extras?.survival;
  const restored=survival?SurvivalEngine.normalize(survival):null;
  // A separate story prevents a bad import from destroying the running game.
  const candidate=new inkjs.Story(storyContent);candidate.state.LoadJson(value.storyState);
  story=candidate;gameExtras=data.extras && typeof data.extras==='object'?{...data.extras}:{};
  if(restored)gameExtras.survival=restored;else delete gameExtras.survival;
  restoreTranscript(data.transcript);gameStartTime=Date.now()-Math.max(0,Number(value.elapsed) || Number(data.playTimeMinutes)*60000 || 0);
  renderRestored();notice('Progress restored.');
}
let storyContent=null;
function renderRestored(){
  if(gameExtras.survival){$('choices').replaceChildren();$('inputSection').hidden=false;$('difficulty').disabled=true;$('runSeed').disabled=true;syncStory();renderArena();updateCharacterStats();}
  else if(story.currentTags?.includes('free_roam'))showFreeRoamMode();
  else{$('inputSection').hidden=true;if(story.currentChoices.length){displayChoices();updateCharacterStats();}else continueStory();}
}
function resumeCheckpoint(){try{const saved=JSON.parse(storage.getItem('hunger-checkpoint'));if(!saved)throw Error('No local checkpoint is available.');restore(saved);}catch(error){notice(error.message);}}
async function newGame(){
  if(busy){notice('Wait for the current action to finish before starting a new tribute.');return;}
  if(story && !confirm('Start a new tribute? Export your current run first if you want to keep it.'))return;
  clearProposal();gameExtras={};currentSaveId=null;currentSaveName='';gameStartTime=Date.now();$('difficulty').disabled=false;$('runSeed').disabled=false;$('endingBanner').hidden=true;$('saveName').value='';await loadStory();renderArena();checkpoint();
}
async function saveGame(){
  if(!story)return;
  if(currentUser.id==='guest'){checkpoint();closeModal('saveModal');notice('Checkpoint saved locally. Sign in for cloud saves.');return;}
  const name=$('saveName').value.trim();if(!name)return;
  const value=snapshot(),overwrite=currentSaveId && name===currentSaveName;
  $('saveSubmit').disabled=true;
  try{const data=await api(overwrite?'/api/saves/'+currentSaveId:'/api/saves',{saveName:name,storyState:value.storyState,characterData:value.characterData},overwrite?'PUT':'POST');currentSaveId=data.save?.id || currentSaveId;currentSaveName=name;closeModal('saveModal');notice('Cloud save updated.');await loadUserSaves();}
  catch(error){$('saveError').textContent=error.message;}finally{$('saveSubmit').disabled=false;}
}
async function loadUserSaves(){
  $('saveList').replaceChildren();
  if(currentUser.id==='guest'){$('saveList').append(element('p','Sign in to keep named cloud saves. Local checkpoints work without an account.','muted'));return;}
  try{const {saves}=await api('/api/saves');for(const save of saves){const row=element('div',null,'save-row');const load=element('button',save.save_name,'quiet');load.onclick=()=>loadSave(save.id);const remove=element('button','Delete','quiet');remove.onclick=async()=>{if(!confirm('Delete '+save.save_name+'?'))return;try{await api('/api/saves/'+save.id,undefined,'DELETE');if(currentSaveId===save.id){currentSaveId=null;currentSaveName='';}loadUserSaves();}catch(error){notice(error.message);}};row.append(load,remove);$('saveList').append(row);}if(!saves.length)$('saveList').append(element('p','Your cloud save shelf is empty.','muted'));}
  catch(error){$('saveList').append(element('p',error.message,'muted'));}
}
async function loadSave(id){try{const {save}=await api('/api/saves/'+id);restore({storyState:save.story_state,characterData:save.character_data});currentSaveId=id;currentSaveName=save.save_name;$('saveName').value=currentSaveName;checkpoint();closeModal('loadModal');}catch(error){notice(error.message);}}
function showSaveModal(){if(!story)return;if(currentUser.id==='guest'){checkpoint();notice('Local checkpoint saved.');return;}$('saveError').textContent='';$('saveName').value=currentSaveName;$('saveModal').showModal();}
function showLoadModal(){if(currentUser.id==='guest'){resumeCheckpoint();return;}loadUserSaves();activateTab('savesPanel');}
function closeModal(id){const dialog=$(id);if(dialog?.open)dialog.close();}
function showFeedbackModal(){$('feedbackModal').showModal();}
async function submitFeedback(){
  try{await api('/api/feedback',{subject:$('feedbackSubject').value.trim(),message:$('feedbackMessage').value.trim(),rating:Number($('feedbackRating').value)||null,username:currentUser.username});$('feedbackForm').reset();closeModal('feedbackModal');notice('Private feedback sent.');}
  catch(error){$('feedbackError').textContent=error.message;}
}
async function loadLeaderboardPreview(){
  $('leaderboardPreview').replaceChildren();
  try{const {leaderboard}=await api('/api/leaderboard?limit=10');for(const [index,entry] of leaderboard.entries()){const row=element('div',null,'leaderboard-row');row.append(element('strong',(index+1)+'. '+entry.username),element('span',entry.wins+' wins · '+entry.district,'muted'));$('leaderboardPreview').append(row);}if(!leaderboard.length)$('leaderboardPreview').append(element('p','No community results yet.','muted'));}catch{$('leaderboardPreview').append(element('p','Community results are unavailable. Local play still works.','muted'));}
}
function showLeaderboardModal(){activateTab('recordPanel');loadLeaderboardPreview();}
async function submitLeaderboardEntry(type){
  if(currentUser.id==='guest')return;
  try{await api('/api/leaderboard',{district:charData.district || 'Unknown',winType:type==='cheat'?'Cheat Win':'Hunger Games Champion'});loadLeaderboardPreview();}catch(error){notice('Your run ended, but its community result could not be recorded: '+error.message);}
}
function exportRun(){if(!story)return;const blob=new Blob([JSON.stringify(snapshot(),null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const link=element('a');link.href=url;link.download='hunger-run-'+(gameExtras.survival?.initialSeed || 'story')+'.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function exportJournal(){const blob=new Blob([transcript().join('\n\n')],{type:'text/plain'});const url=URL.createObjectURL(blob);const link=element('a');link.href=url;link.download='tribute-journal.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('confirmIntent').onclick=()=>{const proposal=proposedAction;clearProposal();if(proposal && proposal.turn===gameExtras.survival?.turn && proposal.runId===gameExtras.survival?.runId)handleFreeRoamAction(proposal.action);};
$('cancelIntent').onclick=clearProposal;
$('refreshCoach').onclick=renderCoach;
$('narrationStyle').onchange=()=>{storage.setItem('hunger-narration-style',$('narrationStyle').value);};
$('narrationEnabled').onchange=()=>{storage.setItem('hunger-narration-enabled',String($('narrationEnabled').checked));};
const savedStyle=storage.getItem('hunger-narration-style');if(ArenaDirector.STYLES.includes(savedStyle))$('narrationStyle').value=savedStyle;
$('narrationEnabled').checked=storage.getItem('hunger-narration-enabled')!=='false';
$('interpretActions').checked=storage.getItem('hunger-interpret-actions')!=='false';
$('interpretActions').onchange=()=>storage.setItem('hunger-interpret-actions',String($('interpretActions').checked));
$('actionForm').onsubmit=event=>{event.preventDefault();const value=$('cmdInput').value;$('cmdInput').value='';handleFreeRoamAction(value);};
document.querySelectorAll('[data-action]').forEach(button=>button.onclick=()=>handleFreeRoamAction(button.dataset.action));
$('saveForm').onsubmit=event=>{event.preventDefault();saveGame();};
$('feedbackForm').onsubmit=event=>{event.preventDefault();submitFeedback();};
$('importRun').onchange=async event=>{const file=event.target.files[0];if(!file)return;try{if(file.size>1000000)throw Error('Run files must be smaller than 1 MB.');restore(JSON.parse(await file.text()));checkpoint();}catch(error){notice(error.message);}event.target.value='';};
$('hintBtn').onclick=()=>notice('Explore for supplies. Hunger and thirst grow every action. Rivers provide water; forests provide wood. Shelter helps you rest. Complete objectives for sponsor packages.');
$('exportRun').onclick=exportRun;$('exportJournal').onclick=exportJournal;
window.addEventListener('beforeunload',checkpoint);
window.addEventListener('keydown',event=>{if(event.ctrlKey || event.altKey || event.metaKey || event.target.closest('input,textarea,select,button,dialog'))return;const action={ArrowUp:'north',ArrowDown:'south',ArrowLeft:'west',ArrowRight:'east'}[event.key];if(action && gameExtras.survival?.status==='active'){event.preventDefault();handleFreeRoamAction(action);}});
(async()=>{
  await checkAuthentication();
  try{const response=await fetch('/story.json?v=arena-ai-4',{cache:'no-store'});if(!response.ok)throw Error();storyContent=await response.json();}catch{notice('Story file unavailable. Retry when connected.');}
  await loadStory();renderRecord();loadUserSaves();loadLeaderboardPreview();renderArena();
})();
