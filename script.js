document.getElementById('quest-float-ui')?.remove();
document.querySelector('.q-notifs')?.remove();

const style = document.createElement('style');
style.innerHTML = `
#quest-float-ui { position:fixed;top:60px;right:40px;width:350px;z-index:99999;font-family:'Segoe UI',Arial,sans-serif;background:#23272a;border-radius:13px;box-shadow:0 2px 24px #0007;padding:20px 15px 16px 17px;}
.q-avatar { width:54px;height:54px;border-radius:100%;border:2px solid #5865f2;}
.q-name { font-size:1.15rem;font-weight:600;color:#fff;}
.q-username { font-size:0.85rem;color:#b9bbbe;margin-top:2px;}
.q-token-input {width:100%;padding:8px;border:none;border-radius:8px;margin:10px 0;font-size:1rem;box-sizing:border-box;}
.q-guild-list{background:#232834;border-radius:7px;padding:9px 0 4px 0;min-height:74px;max-height:180px;overflow-y:auto;margin:10px 0 7px 0;display:none;}
.q-guild{display:flex;align-items:center;gap:9px;padding:4px 10px;transition:background .13s;border-radius:6px;cursor:pointer;}
.q-guild.selected{background:#5865f255;}
.q-guild:hover:not(.selected){background:#2a2c38;}
.q-guild-icon{width:32px;height:32px;border-radius:7px;background:#111;}
.q-guild-label{color:#fff;font-size:1rem;flex:1 1 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.q-leave-btn, .q-login-btn { width:100%;margin:10px 0 10px 0;padding:10px 0;background:#5865f2;color:#fff;border:none;border-radius:8px;font-weight:bold;cursor:pointer;font-size:1.08rem;transition:background .18s;}
.q-leave-btn[disabled], .q-login-btn[disabled]{background:#444a;cursor:not-allowed;}
.q-progress-bar{width:100%;height:8px;border-radius:5px;background:#424549;margin:12px 0 2px 0;position:relative;overflow:hidden;display:none;}
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
  <input type="password" class="q-token-input" id="q-token-input" placeholder="Enter your token" autocomplete="new-password" name="no-autofill-token" />
  <div class="q-guild-list" id="q-guild-list"></div>
  <button class="q-login-btn" id="q-ui-loginbtn">Login</button>
  <button class="q-leave-btn" id="q-ui-leavebtn" style="display:none;">Leave Selected</button>
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
credits.style = `
  position: fixed;
  right: 40px;
  bottom: 25px;
  color: #999;
  font-size: 0.75rem;
  font-weight: 600;
  user-select: none;
  pointer-events: none;
  opacity: 0.7;
  z-index: 1000000;
`;
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
  if (!total || val < 0) {
    bar.style.display = 'none';
    return;
  }
  bar.style.display = '';
  fill.style.width = Math.round((val / total) * 100) + '%';
  fill.title = `${val} / ${total}`;
}

let currentToken = '';

async function fetchGuilds(token) {
  const res = await fetch('https://discord.com/api/v9/users/@me/guilds', {
    headers: {
      Authorization: token
    }
  });
  if (!res.ok) {
    throw new Error('Invalid token or failed to fetch guilds');
  }
  const guilds = await res.json();
  return guilds;
}

function showUserInfo(u) {
  document.getElementById('q-discord-name').innerText = u.global_name || u.username || 'User';
  document.getElementById('q-discord-username').innerText = '@' + (u.username || '');
  document.getElementById('q-avatar').src = u.avatar
    ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png`
    : "https://cdn.discordapp.com/embed/avatars/2.png";
}

async function fetchCurrentUser(token) {
  const res = await fetch('https://discord.com/api/v9/users/@me', {
    headers: {
      Authorization: token
    }
  });
  if (!res.ok) {
    throw new Error('Invalid token or failed to fetch user info');
  }
  const user = await res.json();
  return user;
}

async function renderGuilds(token) {
  let guilds;
  try {
    guilds = await fetchGuilds(token);
  } catch (err) {
    qNotif('Failed to load guilds: ' + err.message);
    return;
  }
  const list = document.getElementById('q-guild-list');
  list.innerHTML = '';
  guilds.forEach(guild => {
    const row = document.createElement('div');
    row.className = 'q-guild';
    row.dataset.guild = guild.id;
    row.onclick = function () {
      row.classList.toggle('selected');
    };
    row.innerHTML = `
      <img class="q-guild-icon" src="${guild.icon
      ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
      : 'https://cdn.discordapp.com/embed/avatars/1.png'}">
      <div class="q-guild-label">${guild.name}</div>
    `;
    list.appendChild(row);
  });
  document.getElementById('q-guild-list').style.display = 'block';
}

async function doLogin() {
  const tokenInput = document.getElementById('q-token-input');
  const token = tokenInput.value.trim();
  if (!token) {
    qNotif('Please enter your token!');
    return false;
  }
  qNotif('Logging in...');
  try {
    const user = await fetchCurrentUser(token);
    showUserInfo(user);
    await renderGuilds(token);
    tokenInput.style.display = 'none';
    document.getElementById('q-ui-loginbtn').style.display = 'none';
    document.getElementById('q-ui-leavebtn').style.display = 'block';
    currentToken = token;
    qNotif('Login successful!');
    return true;
  } catch (err) {
    qNotif('Login failed: ' + err.message);
    return false;
  }
}

document.getElementById('q-ui-loginbtn').onclick = doLogin;

document.getElementById('q-ui-leavebtn').onclick = async function () {
  const selectedEls = Array.from(document.querySelectorAll('.q-guild.selected'));
  if (!selectedEls.length) {
    qNotif('Select at least one server!');
    return;
  }
  this.disabled = true;
  let left = 0;
  for (let i = 0; i < selectedEls.length; i++) {
    const el = selectedEls[i];
    const gid = el.dataset.guild;
    const label = el.querySelector('.q-guild-label').textContent;
    el.style.opacity = '0.4';
    try {
      const resp = await fetch(`https://discord.com/api/v9/users/@me/guilds/${gid}`, {
        method: "DELETE",
        headers: { Authorization: currentToken }
      });
      if (resp.status === 204) {
        qNotif(`Left: ${label}`);
        el.remove();
      } else {
        qNotif(`Failed to leave: ${label}`);
        el.style.opacity = '1';
      }
    } catch {
      qNotif(`Error leaving: ${label}`);
      el.style.opacity = '1';
    }
    left++;
    qProgress(left, selectedEls.length);
    await new Promise(r => setTimeout(r, 1300));
  }
  qNotif('Operation completed ✔');
  this.disabled = false;
  qProgress(-1, 1);
};
