async function startGame(){
  const storyContent=await fetch("story.json").then(r=>r.json());
  const story=new inkjs.Story(storyContent);

  const storyDiv=document.getElementById("story");
  const hintBtn=document.getElementById("hintBtn");
  const cmdBtn=document.getElementById("cmdBtn");
  const cmdInput=document.getElementById("cmdInput");
  const sponsorDiv=document.getElementById("sponsor");

  function updateStats(){
    const v=story.variablesState;
    document.getElementById("bar-health").value  = v.get("health");
    document.getElementById("bar-stamina").value = v.get("stamina");
    document.getElementById("bar-hunger").value  = v.get("hunger");
    document.getElementById("dayLabel").textContent = v.get("day");
    document.getElementById("timeLabel").textContent = v.get("timeofday");
  }

  function continueStory(){
    while(story.canContinue){
      const p=document.createElement("p");
      p.textContent=story.Continue().trim();
      storyDiv.appendChild(p);
    }
    story.currentChoices.forEach(choice=>{
      const e=document.createElement("div");
      e.className="choice";
      e.textContent=choice.text;
      e.onclick=()=>{ story.ChooseChoiceIndex(choice.index); clearUI(); };
      storyDiv.appendChild(e);
    });
    updateStats();
    maybeSponsor();
  }

  function clearUI(){
    storyDiv.innerHTML="";
    continueStory();
  }

  // simple text command system
  function handleCommand(){
    const raw=cmdInput.value.trim().toLowerCase();
    cmdInput.value="";
    if(!raw)return;
    storyDiv.innerHTML="";
    if(raw.includes("search") && raw.includes("water")){
      story.EvaluateFunction("search_water");
    }else if(raw.includes("rest")){
      story.EvaluateFunction("rest");
    }else{
      story.EvaluateFunction("unknown", raw);
    }
    clearUI();
  }

  cmdBtn.onclick=handleCommand;
  cmdInput.addEventListener("keypress",e=>{ if(e.key==="Enter") handleCommand(); });

  // AI hint stub
  hintBtn.onclick=async()=>{
    const ctx=`Health=${story.variablesState.get("health")}, Stamina=${story.variablesState.get("stamina")}, Hunger=${story.variablesState.get("hunger")}, Loc=${story.variablesState.get("location")}`;
    alert("Hint system not wired yet. Context: "+ctx);
  };

  // sponsor mechanic
  function maybeSponsor(){
    const v=story.variablesState;
    const points=v.get("sponsor_points");
    if(points>=3 && !v.get("sponsor_given")){
      sponsorDiv.style.display="block";
      sponsorDiv.textContent="A parachute drops! You received a med‑kit.";
      story.EvaluateFunction("receive_sponsor");
    }
  }

  continueStory();
}

window.onload=startGame;
