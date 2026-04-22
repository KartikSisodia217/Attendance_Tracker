let data = JSON.parse(localStorage.getItem('dtu_tracker_v4')) || { subjects: {}, schedule: [] };

const weekGrid = document.getElementById('weekGrid');
const subjectGrid = document.getElementById('subjectGrid');
const emptyState = document.getElementById('emptyState');
const mainContent = document.getElementById('mainContent');
const modal = document.getElementById('modal');
const subjectForm = document.getElementById('subjectForm');
const scheduleBuilder = document.getElementById('scheduleBuilder');
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const timeOptions = (() => {
    let options = '';
    for (let i = 8; i <= 20; i++) {
        let hour = i < 10 ? `0${i}` : i;
        options += `<option value="${hour}:00">${hour}:00</option>`;
        options += `<option value="${hour}:30">${hour}:30</option>`;
    }
    return options;
})();

const openModal = (editName = null) => {
    modal.style.display = 'flex';
    scheduleBuilder.innerHTML = ''; 
    if (editName) {
        document.getElementById('modalTitle').innerText = "Edit Subject";
        document.getElementById('subjName').value = editName;
        document.getElementById('editOriginalName').value = editName;
        const slots = data.schedule.filter(s => s.name === editName);
        if (slots.length > 0) {
            slots.forEach(s => addTimingRow(s.day, s.startTime, s.weight));
        } else { addTimingRow(); }
    } else {
        document.getElementById('modalTitle').innerText = "Subject Setup";
        document.getElementById('subjName').value = "";
        document.getElementById('editOriginalName').value = "";
        addTimingRow();
    }
};

const closeModal = () => {
    modal.style.display = 'none';
    subjectForm.reset();
    scheduleBuilder.innerHTML = ''; 
};

const addTimingRow = (day='Mon', start='09:00', weight=1) => {
    const div = document.createElement('div');
    div.className = 'timing-row';
    div.innerHTML = `
        <div class="timing-group"><label>Day</label><select class="t-day t-time-select">${days.map(d => `<option value="${d}" ${d===day?'selected':''}>${d}</option>`).join('')}</select></div>
        <div class="timing-group t-start-group"><label>Start Time</label><select class="t-start t-time-select">${timeOptions.replace(`value="${start}"`, `value="${start}" selected`)}</select></div>
        <div class="timing-group"><label>Weight</label><select class="t-weight t-time-select"><option value="1" ${weight==1?'selected':''}>1L</option><option value="2" ${weight==2?'selected':''}>2L</option></select></div>`;
    scheduleBuilder.appendChild(div);
};

const save = () => {
    localStorage.setItem('dtu_tracker_v4', JSON.stringify(data));
    render();
};

subjectForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const newName = document.getElementById('subjName').value.trim();
    const oldName = document.getElementById('editOriginalName').value;
    const rows = document.querySelectorAll('.timing-row');
    
    if (!newName) return;

    if (oldName && oldName !== newName) {
        data.subjects[newName] = data.subjects[oldName];
        delete data.subjects[oldName];
        data.schedule = data.schedule.filter(s => s.name !== oldName);
    } else if (oldName) {
        data.schedule = data.schedule.filter(s => s.name !== oldName);
    }

    if (!data.subjects[newName]) {
        data.subjects[newName] = { attended: 0, total: 0 };
    }

    rows.forEach(row => {
        data.schedule.push({
            id: Date.now() + Math.random(),
            name: newName,
            day: row.querySelector('.t-day').value,
            startTime: row.querySelector('.t-start').value,
            weight: parseInt(row.querySelector('.t-weight').value)
        });
    });

    save();
    closeModal();
});

const markAttendance = (name, weight, present) => {
    if (!data.subjects[name]) return;
    data.subjects[name].total += weight;
    if (present) data.subjects[name].attended += weight;
    save();
};

const deleteSubject = (name) => {
    if (confirm(`Delete ${name}?`)) {
        delete data.subjects[name];
        data.schedule = data.schedule.filter(s => s.name !== name);
        save();
    }
};

const render = () => {
    weekGrid.innerHTML = '';
    subjectGrid.innerHTML = '';

    if (Object.keys(data.subjects).length === 0) {
        emptyState.style.display = 'flex';
        mainContent.style.display = 'none';
        return;
    }

    emptyState.style.display = 'none';
    mainContent.style.display = 'block';

    const activeNames = new Set(data.schedule.map(s => s.name));
    Object.keys(data.subjects).forEach(name => {
        if (!activeNames.has(name)) delete data.subjects[name];
    });

    days.forEach(day => {
        const col = document.createElement('div');
        col.className = 'day-column';
        col.innerHTML = `<div class="day-header">${day.toUpperCase()}</div>`;
        data.schedule.filter(s => s.day === day).sort((a,b) => a.startTime.localeCompare(b.startTime)).forEach(item => {
            const slot = document.createElement('div');
            slot.className = 'class-slot glass';
            slot.innerHTML = `<div class="slot-time">Start: ${item.startTime}</div><div class="slot-name">${item.name}</div><div class="slot-weight">Weight: ${item.weight}</div><div class="slot-actions"><button class="btn-p" onclick="markAttendance('${item.name}', ${item.weight}, true)">P</button><button class="btn-a" onclick="markAttendance('${item.name}', ${item.weight}, false)">A</button></div>`;
            col.appendChild(slot);
        });
        weekGrid.appendChild(col);
    });

    Object.keys(data.subjects).forEach(name => {
        const s = data.subjects[name];
        const perc = s.total === 0 ? 0 : Math.round((s.attended / s.total) * 100);
        const color = perc >= 80 ? "#22c55e" : perc >= 70 ? "#eab308" : "#ef4444";
        const card = document.createElement('div');
        card.className = 'sub-card glass';
        card.innerHTML = `<span class="edit-btn" onclick="openModal('${name}')">✎</span><span class="delete-icon" style="position:absolute; right:15px; top:15px" onclick="deleteSubject('${name}')">×</span><div style="font-size: 11px; color: #94a3b8; font-weight: 700;">OVERALL STATS</div><div style="font-weight: 700; margin-top: 8px; font-size: 18px;">${name}</div><div class="perc" style="color: ${color}">${perc}%</div><div style="color: #64748b; font-size: 13px;">${s.attended} / ${s.total} Classes Marked</div>`;
        subjectGrid.appendChild(card);
    });
};

window.onclick = (e) => { if (e.target == modal) closeModal(); };
render();