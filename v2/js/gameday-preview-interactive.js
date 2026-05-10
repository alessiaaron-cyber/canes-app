const roster=[['Sebastian Aho','C • Top line'],['Andrei Svechnikov','RW • PP1'],['Seth Jarvis','RW • Hot streak'],['Jaccob Slavin','D • Defensive anchor'],['Jordan Staal','C • Two-way center'],['Brent Burns','D • PP2'],['Pyotr Kochetkov','G • Starting goalie'],['Jesperi Kotkaniemi','C • Middle six'],['Jackson Blake','RW • Rookie spark']];
let currentState='pregame';
let currentPick=0;
let scores={Aaron:0,Julie:0};
let picks={Aaron:[],Julie:[]};
const order=['Aaron','Julie','Aaron','Julie'];
const feed=[];
const root=document.getElementById('gd-root');

function claimedBy(player){
  return picks.Aaron.includes(player)?'Aaron':picks.Julie.includes(player)?'Julie':null;
}

function activePlayer(){
  return order[currentPick]||'Draft complete';
}

function scoreCellValue(side){
  return currentState==='pregame' ? `${picks[side].length}` : `${scores[side]}`;
}

function boardSubline(){
  if(currentState==='pregame') return `${activePlayer()} on the clock • Pick ${Math.min(currentPick+1,4)}/4`;
  if(currentState==='live') return 'Live picks become scoring cards here';
  if(scores.Aaron>scores.Julie) return 'Aaron wins the night';
  if(scores.Julie>scores.Aaron) return 'Julie wins the night';
  return 'Rivalry tied';
}

function momentumWidth(){
  return Math.min(Math.abs(scores.Aaron-scores.Julie)*12,48);
}

function renderTopBoard(label){
  return `<section class='gd-live-score-card'>
    <div class='gd-status-row'>
      <span class='gd-pill ${currentState==='final'?'final':'live'}'>${label}</span>
      <span class='gd-period'>${currentState==='pregame'?'Tonight • 7:00 PM':currentState==='live'?'2nd • 8:14':'Final'}</span>
      ${currentState==='live' ? "<span class='gd-pill synced'>Synced</span>" : ''}
    </div>
    <div class='gd-score-grid'>
      <div class='gd-side-score-wrap'>
        <div class='gd-side-score-label red'>Aaron</div>
        <div class='gd-side-score-value ${currentState==='live'?'gd-score-bump':''}'>${scoreCellValue('Aaron')}</div>
      </div>
      <div class='gd-center-score'>
        <img class='gd-wordmark gd-wordmark--board' src='./assets/app-icon.png?v=gdp12' alt='Canes Rivalry'>
      </div>
      <div class='gd-side-score-wrap'>
        <div class='gd-side-score-label dark'>Julie</div>
        <div class='gd-side-score-value ${currentState==='live'?'gd-score-bump':''}'>${scoreCellValue('Julie')}</div>
      </div>
    </div>
    <div class='gd-summary-line'>${boardSubline()}</div>
    ${currentState==='pregame' ? "<div class='gd-momentum-block'><div class='gd-momentum-label'>Goals • Assists • First Canes Goal</div></div>" : ''}
    ${currentState==='live' ? `<div class='gd-momentum-block gd-momentum-live'><div class='gd-momentum-label'>Momentum</div><div class='gd-track'><div class='gd-track-fill' style='left:${scores.Aaron>=scores.Julie?'50%':`calc(50% - ${momentumWidth()}%)`};width:${momentumWidth()}%'></div></div></div>` : ''}
  </section>`;
}

function renderLocked(name){
  const arr=picks[name];
  const filled=arr.map(player=>`<div class='gd-pick-row'><div class='gd-pick-row-icon'>✓</div><div class='gd-pick-row-main'><strong>${player}</strong><small>Locked pick</small><div class='gd-lock-actions'><button class='gd-small-action' data-side='${name}' data-player='${player}'>Change Pick</button></div></div></div>`).join('');
  const empty=Array.from({length:2-arr.length},()=>`<div class='gd-pick-row is-empty'><div class='gd-pick-row-icon'>…</div><div class='gd-pick-row-main'><strong>Open slot</strong><small>Waiting for next pick</small></div></div>`).join('');
  return filled+empty;
}

function bindChangePick(){
  document.querySelectorAll('.gd-small-action').forEach(btn=>btn.onclick=()=>removePick(btn.dataset.side,btn.dataset.player));
}

function renderPregame(filter=''){
  const rows=roster.filter(([name])=>name.toLowerCase().includes(filter.toLowerCase()));
  root.innerHTML=`<section class='gd-phone'><div class='gd-main'>
    ${renderTopBoard('Pregame')}
    <div class='gd-section-label-row'><div class='gd-section-label'>Live Picks</div><div class='gd-filter'>Updates instantly</div></div>
    <section class='gd-picks-grid'>
      <article class='gd-pick-panel'><div class='gd-pick-panel-head red'><span>Aaron</span><span>${picks.Aaron.length}/2</span></div>${renderLocked('Aaron')}</article>
      <article class='gd-pick-panel'><div class='gd-pick-panel-head dark'><span>Julie</span><span>${picks.Julie.length}/2</span></div>${renderLocked('Julie')}</article>
    </section>
    <section class='gd-search-bar'><input class='gd-search-input' id='playerSearch' placeholder='Search current Canes roster...' value='${filter.replace(/'/g,"&#39;")}' /></section>
    <div class='gd-section-label-row'><div class='gd-section-label'>Current Canes Roster</div><div class='gd-filter'>Tap to draft</div></div>
    <section class='gd-roster-panel gd-scroll-roster'>
      ${rows.map(([name,detail])=>{const owner=claimedBy(name);return `<div class='gd-roster-row ${owner?'is-claimed':''} ${owner?'':'gd-player-selectable'}' data-player='${name}'><div class='gd-pick-row-main'><strong>${name}</strong><small>${detail}</small></div><div class='gd-roster-state'>${owner?`<span class='gd-claimed-tag live'>${owner}</span>`:`<span class='gd-add gd-add--solid'>Draft</span>`}</div></div>`}).join('')}
    </section>
    <div class='gd-section-label-row'><div class='gd-section-label'>Manage Picks</div><div class='gd-filter'>Only if needed</div></div>
    <section class='gd-override-card'><div class='gd-override-copy'>Manual override should live behind a small Manage Picks action on the live screen if picks need to be unlocked or replaced after puck drop.</div></section>
  </div></section>`;
  document.querySelectorAll('.gd-player-selectable').forEach(el=>el.onclick=()=>draftPlayer(el.dataset.player));
  document.getElementById('playerSearch').oninput=e=>renderPregame(e.target.value);
  bindChangePick();
}

function draftPlayer(player){
  if(currentPick>=4||claimedBy(player)) return;
  const side=order[currentPick];
  if(picks[side].length>=2) return;
  picks[side].push(player);
  currentPick++;
  renderPregame(document.getElementById('playerSearch')?.value||'');
}

function removePick(side,player){
  picks[side]=picks[side].filter(p=>p!==player);
  currentPick=picks.Aaron.length+picks.Julie.length;
  renderPregame(document.getElementById('playerSearch')?.value||'');
}

function renderLive(){
  root.innerHTML=`<section class='gd-phone'><div class='gd-main'>
    ${renderTopBoard('Live')}
    <div class='gd-section-label-row'><div class='gd-section-label'>Manage Picks</div><div class='gd-filter'>Small action</div></div>
    <section class='gd-override-card'><div class='gd-override-copy'>Late override should open from a small Manage Picks action here, not as a large permanent section.</div></section>
    <div class='gd-section-label-row'><div class='gd-section-label'>Simulate Updates</div><div class='gd-filter'>Goal / Assist</div></div>
    <div class='gd-sim-grid'>
      <button class='gd-sim-button red' onclick='simulate("Aaron",2,"Goal")'>Aaron Goal</button>
      <button class='gd-sim-button' onclick='simulate("Julie",2,"Goal")'>Julie Goal</button>
      <button class='gd-sim-button red' onclick='simulate("Aaron",1,"Assist")'>Aaron Assist</button>
      <button class='gd-sim-button' onclick='simulate("Julie",1,"Assist")'>Julie Assist</button>
    </div>
    <div class='gd-section-label-row'><div class='gd-section-label'>Tonight’s Picks</div><div class='gd-filter'>By stats</div></div>
    <section class='gd-picks-summary'>
      <article class='gd-pick-summary-card red'><div class='gd-pick-summary-head'><span class='red-text'>Aaron</span><span>${scores.Aaron} pts</span></div>${(picks.Aaron.length?picks.Aaron:['No picks']).map((p,i)=>`<div class='gd-pick-summary-row'><span>${p}</span><strong>${i===0&&scores.Aaron?'+4':i===1&&scores.Aaron>4?`+${scores.Aaron-4}`:'+0'}</strong></div>`).join('')}</article>
      <article class='gd-pick-summary-card'><div class='gd-pick-summary-head'><span>Julie</span><span>${scores.Julie} pts</span></div>${(picks.Julie.length?picks.Julie:['No picks']).map((p,i)=>`<div class='gd-pick-summary-row'><span>${p}</span><strong>${i===0&&scores.Julie?'+2':i===1&&scores.Julie>2?`+${scores.Julie-2}`:'+0'}</strong></div>`).join('')}</article>
    </section>
    <div class='gd-section-label-row'><div class='gd-section-label'>Rivalry Feed</div><div class='gd-filter'>Live</div></div>
    <section class='gd-feed-list'>${feed.map(item=>`<article class='gd-feed-item enter'><div class='gd-feed-icon'>🚨</div><div><div class='gd-feed-title'>${item.title}</div><div class='gd-feed-subtitle'>${item.detail}</div></div><div class='gd-feed-score'>+${item.points}</div></article>`).join('')}</section>
  </div></section>`;
}

function simulate(side,points,type){
  scores[side]+=points;
  feed.unshift({title:`${side} ${type}`,detail:'Live rivalry update',points});
  renderLive();
}

function renderFinal(){
  const winner=scores.Aaron>scores.Julie?'Aaron':scores.Julie>scores.Aaron?'Julie':'Tie';
  root.innerHTML=`<section class='gd-phone'><div class='gd-main'>
    ${renderTopBoard('Final')}
    <section class='gd-recap-item'><div class='gd-feed-icon'>🏁</div><div class='gd-recap-time'>Final</div><div class='gd-recap-main'><strong>Rivalry recap</strong><small>Draft picks fed directly into the live scoring experience.</small></div><div class='gd-recap-score'>${scores.Aaron}-${scores.Julie}</div></section>
    <section class='gd-mvp'><div class='gd-mvp-ring'>★</div><div class='gd-mvp-main'><strong>Rivalry MVP</strong><small>Final state animation and recap placeholder for the real app.</small></div><div class='gd-mvp-points'>${winner==='Tie'?'Tie':'Final'}</div></section>
  </div></section>`;
}

document.querySelectorAll('.gd-state-button').forEach(btn=>btn.onclick=()=>{
  document.querySelectorAll('.gd-state-button').forEach(b=>b.classList.remove('is-active'));
  btn.classList.add('is-active');
  currentState=btn.dataset.state;
  render();
});

render();
window.simulate=simulate;
window.removePick=removePick;