document.getElementById('quest-float-ui')?.remove();
document.querySelector('.q-notifs')?.remove();

const style = document.createElement('style');
style.innerHTML = `
#quest-float-ui { position:fixed;top:60px;right:40px;width:355px;z-index:99999;font-family:'Segoe UI',Arial,sans-serif;background:#23272a;border-radius:13px;box-shadow:0 2px 24px #0007;padding:19px 17px 17px 19px;}
.q-avatar { width:54px;height:54px;border-radius:100%;border:2px solid #5865f2;}
.q-name { font-size:1.15rem;font-weight:600;color:#fff;}
.q-username { font-size:0.85rem;color:#b9bbbe;margin-top:2px;}
.q-stats-bar {display:flex;align-items:center;gap:12px;margin:10px 0 7px 0;padding-bottom:2px;font-size:.97em;font-weight:500;color:#b1bad3;}
.q-refresh-btn {background:#232834;color:#b1bad3;border:none;padding:4px 9px 4px 9px;border-radius:7px;cursor:pointer;font-size:1.10em;font-weight:700;margin-left:auto;}
.q-filterbar{display:flex;gap:8px;margin-bottom:8px;align-items:center;}
.q-filterbtn{background:#232834;color:#b1bad3;border:none;padding:4px 15px;border-radius:7px;cursor:pointer;font-size:1em;font-weight:500;transition:background .14s;}
.q-filterbtn.active{background:#5865f255;color:#fff;}
.q-search-input{width:100%;box-sizing:border-box;margin:0 0 12px 0;font-size:.99em;background:#24264a;color:#ddd;border-radius:7px;padding:6px;border:none;display:block;}
.q-token-input {width:100%;padding:8px;border:none;border-radius:8px;margin:11px 0 2px 0;font-size:1rem;box-sizing:border-box;}
.q-guild-list{background:#232834;border-radius:7px;padding:9px 0 4px 0;min-height:74px;max-height:180px;overflow-y:auto;margin:0 0 10px 0;display:none;}
.q-guild{display:flex;align-items:center;gap:9px;padding:4px 10px;transition:background .13s;border-radius:6px;cursor:pointer;}
.q-guild.selected{background:#5865f255;}
.q-guild.disabled,.q-guild.disabled.selected{opacity:0.7;background:#313339;pointer-events:none;cursor:not-allowed;}
.q-guild:hover:not(.selected):not(.disabled){background:#2a2c38;}
.q-guild-icon{width:32px;height:32px;border-radius:7px;background:#111;}
.q-guild-label{color:#fff;font-size:1rem;flex:1 1 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.q-guild-tag {margin-left:6px;background:#ffd70010;color:#fad02c;padding:2px 7px;font-size:.9em;border-radius:7px;font-weight:bold;}
.q-leave-btn, .q-login-btn, .q-export-btn { width:100%;margin:10px 0 8px 0;padding:10px 0;background:#5865f2;color:#fff;border:none;border-radius:8px;font-weight:bold;cursor:pointer;font-size:1.08rem;transition:background .18s;}
.q-leave-btn[disabled], .q-login-btn[disabled],.q-export-btn[disabled]{background:#444a;cursor:not-allowed;}
.q-progress-bar{width:100%;height:8px;border-radius:5px;background:#424549;margin:7px 0 2px 0;position:relative;overflow:hidden;display:none;}
.q-progress-value{height:100%;background:#57f287;border-radius:5px;transition:width .3s;}
.q-notifs{position:fixed;top:24px;right:38px;display:flex;flex-direction:column;align-items:flex-end;z-index:100001;}
.q-notif{background:#32353b;color:#fff;padding:10px 19px;border-radius:8px;margin-bottom:9px;box-shadow:0 2px 10px #0003;font-size:0.97em;min-width:160px;opacity:0;animation:slidein .27s forwards;}
@keyframes slidein {to{opacity:1;transform:translateY(0);}from{opacity:0;transform:translateY(-18px);}}
::-webkit-scrollbar{width:7px;}
::-webkit-scrollbar-thumb{background:#222;border-radius:5px;}
`;
document.body.appendChild(style);

const floatUI = document.createElement('div');
floatUI.id = 'quest-float-ui';
floatUI.innerHTML = `
  <div style="display:flex;align-items:center;gap:13px;">
    <img class="q-avatar" src="https://cdn.discordapp.com/embed/avatars/2.png" id="q-avatar">
    <div>
      <div class="q-name" id="q-discord-name">Login First !</div>
      <div class="q-username" id="q-discord-username">@username</div>
    </div>
  </div>
  <div id="after-login-block" style="display:none;">
    <div class="q-stats-bar"><span class="q-stat-joined">🖧 <span id="joined-count">0</span></span><span class="q-stat-owned">🜲 <span id="owned-count">0</span></span></div>
    <div class="q-filterbar">
      <button class="q-filterbtn active" id="show-all">All</button>
      <button class="q-filterbtn" id="show-owned">Owned Only</button>
      <button class="q-refresh-btn" id="refresh-btn" title="Refresh">⟲</button>
    </div>
    <input type="text" class="q-search-input" id="q-search-input" placeholder="Search server name..."/>
  </div>
  <input type="password" class="q-token-input" id="q-token-input" placeholder="Enter your token" autocomplete="new-password" name="no-autofill-token" />
  <div class="q-guild-list" id="q-guild-list"></div>
  <button class="q-login-btn" id="q-ui-loginbtn">Login</button>
  <button class="q-leave-btn" id="q-ui-leavebtn" style="display:none;">Leave Selected</button>
  <button class="q-export-btn" id="q-ui-exportbtn" style="display:none;">Export Servers</button>
  <div class="q-progress-bar" id="q-ui-progressbar">
    <div class="q-progress-value" id="q-ui-progress"></div>
  </div>
`;

const notifArea = document.createElement('div');
notifArea.className = 'q-notifs';
document.body.appendChild(floatUI);
document.body.appendChild(notifArea);

const credits = document.createElement('div');
credits.innerText = 'by SaYo';
credits.style = `position: fixed;right: 40px;bottom: 25px;color: #999;font-size: 0.75rem;font-weight: 600;user-select: none;pointer-events: none;opacity: 0.7;z-index: 1000000;`;
document.body.appendChild(credits);

function qNotif(msg) {
  const d = document.createElement('div');
  d.className = 'q-notif';
  d.innerText = msg;
  notifArea.insertBefore(d, notifArea.firstChild);
  if (notifArea.children.length > 3) notifArea.lastChild.remove();
  setTimeout(() => d.style.opacity = '0', 3550);
  setTimeout(() => d.remove(), 4000);
}
function qProgress(val, total) {
  const bar = document.getElementById('q-ui-progressbar');
  const fill = document.getElementById('q-ui-progress');
  if (!total || val < 0) { bar.style.display = 'none'; return; }
  bar.style.display = '';
  fill.style.width = Math.round((val / total) * 100) + '%';
  fill.title = `${val} / ${total}`;
}

let currentToken = '';
let currentUser = null;
let guildsCache = [];
let activeFilter = 'all';
let searchVal = '';
let selectedGuilds = [];

async function fetchGuilds(token) {
  const res = await fetch('https://discord.com/api/v9/users/@me/guilds', {headers: { Authorization: token }});
  if (!res.ok) throw new Error('Invalid token or failed to fetch guilds');
  return await res.json();
}
function showUserInfo(u) {
  document.getElementById('q-discord-name').innerText = u.global_name || u.username || 'User';
  document.getElementById('q-discord-username').innerText = '@' + (u.username || '');
  document.getElementById('q-avatar').src = u.avatar
    ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png`
    : "https://cdn.discordapp.com/embed/avatars/2.png";
}
async function fetchCurrentUser(token) {
  const res = await fetch('https://discord.com/api/v9/users/@me', {headers: { Authorization: token }});
  if (!res.ok) throw new Error('Invalid token or failed to fetch user info');
  return await res.json();
}
function updateStats(joined, owned) {
  document.getElementById('joined-count').innerText = joined;
  document.getElementById('owned-count').innerText = owned;
}
function renderGuilds() {
  let guilds = guildsCache.slice();
  if (searchVal.trim()) guilds = guilds.filter(g=>g.name.toLowerCase().includes(searchVal.trim().toLowerCase()));
  if (activeFilter==='owned') guilds = guilds.filter(g => g.owner || (g.owner_id && currentUser && g.owner_id === currentUser.id));
  let ownedCount = guildsCache.filter(g => g.owner || (g.owner_id && currentUser && g.owner_id === currentUser.id)).length;
  updateStats(guildsCache.length, ownedCount);
  const list = document.getElementById('q-guild-list');
  list.innerHTML = '';
  guilds.forEach(guild => {
    const row = document.createElement('div');
    row.className = 'q-guild';
    row.dataset.guild = guild.id;
    let isOwner = (guild.owner || (guild.owner_id && currentUser && guild.owner_id === currentUser.id));
    if(isOwner) {
      row.classList.add('disabled');
      row.innerHTML = `<img class="q-guild-icon" src="${guild.icon?`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`:'https://cdn.discordapp.com/embed/avatars/1.png'}"><div class="q-guild-label">${guild.name}<span class="q-guild-tag">🜲 Owner</span></div>`;
    } else {
      row.onclick = function () {
        row.classList.toggle('selected');
        if (row.classList.contains('selected')) selectedGuilds.push(guild.id);
        else selectedGuilds = selectedGuilds.filter(id=>id!==guild.id);
      };
      if (selectedGuilds.includes(guild.id)) row.classList.add('selected');
      row.innerHTML = `<img class="q-guild-icon" src="${guild.icon?`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`:'https://cdn.discordapp.com/embed/avatars/1.png'}"><div class="q-guild-label">${guild.name}</div>`;
    }
    list.appendChild(row);
  });
  document.getElementById('q-guild-list').style.display = 'block';
}

async function refreshGuildsBtn() {
  if(currentToken){
    guildsCache = await fetchGuilds(currentToken);
    renderGuilds();
    qNotif("Refreshed!");
  }
}

async function doLogin() {
  const tokenInput = document.getElementById('q-token-input');
  const token = tokenInput.value.trim();
  if (!token) { qNotif('Please enter your token!'); return false; }
  qNotif('Logging in...');
  try {
    currentUser = await fetchCurrentUser(token);
    showUserInfo(currentUser);
    guildsCache = await fetchGuilds(token);
    document.getElementById('after-login-block').style.display = '';
    renderGuilds();
    tokenInput.style.display = 'none';
    document.getElementById('q-ui-loginbtn').style.display = 'none';
    document.getElementById('q-ui-leavebtn').style.display = 'block';
    document.getElementById('q-ui-exportbtn').style.display = 'block';
    currentToken = token;
    qNotif('Login successful!');
    return true;
  } catch (err) {
    qNotif('Login failed: ' + err.message);
    return false;
  }
}
document.getElementById('q-ui-loginbtn').onclick = doLogin;
document.getElementById('refresh-btn').onclick = refreshGuildsBtn;

document.getElementById('q-ui-leavebtn').onclick = async function () {
  const selectedEls = Array.from(document.querySelectorAll('.q-guild.selected'));
  if (!selectedEls.length) { qNotif('Select at least one server!'); return; }
  this.disabled = true;
  let left = 0;
  for (let i = 0; i < selectedEls.length; i++) {
    const el = selectedEls[i];
    const gid = el.dataset.guild;
    const label = el.querySelector('.q-guild-label').textContent;
    el.style.opacity = '0.4';
    try {
      const resp = await fetch(`https://discord.com/api/v9/users/@me/guilds/${gid}`, {
        method: "DELETE", headers: { Authorization: currentToken }
      });
      if (resp.status === 204) { qNotif(`Left: ${label}`); }
      else { qNotif(`Failed to leave: ${label}`); el.style.opacity = '1'; }
    } catch { qNotif(`Error leaving: ${label}`); el.style.opacity = '1'; }
    left++; qProgress(left, selectedEls.length); await new Promise(r=>setTimeout(r,1300));
    selectedGuilds = selectedGuilds.filter(id=>id!==gid);
  }
  await refreshGuildsBtn();
  this.disabled = false;
  qProgress(-1, 1);
};

document.body.addEventListener('input', function(e){
  if (e.target && e.target.id === 'q-search-input') {
    searchVal = e.target.value || '';
    renderGuilds();
  }
});
document.body.addEventListener('click', function(e){
  if (e.target && e.target.id === 'show-all') {
    document.getElementById('show-all').classList.add('active');
    document.getElementById('show-owned').classList.remove('active');
    activeFilter = 'all'; renderGuilds();
  } else if (e.target && e.target.id === 'show-owned') {
    document.getElementById('show-all').classList.remove('active');
    document.getElementById('show-owned').classList.add('active');
    activeFilter = 'owned'; renderGuilds();
  }
});
document.getElementById('q-ui-exportbtn').onclick = function(){
  let lines = guildsCache.map(g=>g.name).join("\n");
  let blob = new Blob([lines], {type:"text/plain"});
  let a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'servers.txt';
  document.body.appendChild(a); a.click(); setTimeout(()=>a.remove(),400);
  qNotif('Exported!');
};
