const viewId = Math.floor(Math.random() * 1e6);
console.log(`In viewId ${viewId}`);

let currentTerm = 0;
let state = 'follower';
let leader = null;
let timer = setTimeout(requestVote, getRandomIntervalMs());

window.addEventListener('storage', e => {
    if (e.key === 'raft') {
        const msg = JSON.parse(e.newValue);
        console.log(`[${Date.now()}] msg.term (${msg.term}). currentTerm (${currentTerm}). msg.viewId: ${msg.viewId}.`);
        if (msg.term >= currentTerm) {
            leader = (msg.term === currentTerm) ? null : msg.viewId; // reset if equal: there's a contention.
            state = 'follower'; // something else has higher priority. reset to follower and retry elections if necessary.
            currentTerm = msg.term;

            // restart timer:
            clearTimeout(timer);
            timer = setTimeout(requestVote, getRandomIntervalMs());
        }
    }
});

function requestVote() {
    if (state === 'follower') {
        state = 'candidate';
        leader = null;
    } else if (state === 'candidate') {
        state = 'leader';
        leader = viewId;
    }

    ++currentTerm;    
    console.log(`[${Date.now()}] requesting vote. current state: ${state}, term: ${currentTerm}`);
    window.localStorage.setItem('raft', JSON.stringify({
        term: currentTerm,
        viewId: viewId
    }));

    timer = setTimeout(requestVote, getRandomIntervalMs());
}

function getRandomIntervalMs() {
    let interval = (state === 'leader') ? 1000 : 2000;
    return interval + (250 * Math.random());
}
