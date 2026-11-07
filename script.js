console.log('JavaScript');
let currentSong = new Audio();
let songs;
let currFolder;

// use this function to get the all songs of the clicked folder/album
async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`);
    let response = await a.text();
    let div = document.createElement('div');
    div.innerHTML = response;
    let as = div.getElementsByTagName('a');
    songs = [];
    for (const a of as) {
        if (a.href.endsWith('.mp3') || a.href.endsWith('.mp4')) {
            let cleanSong = folder.replaceAll('/', '%5C')
            songs.push(a.href.split(`${cleanSong}%5C`)[1])
            // songs.push(element.href.split(`/${folder}/`)[1]) // ya kam ni kar raha 
        }
    }
    return songs;
}

// use this function to play the music 
function playMusic(path) {
    currentSong.src = `/${currFolder}/` + path;
    currentSong.play();
    play.src = 'img/pause.svg';
    currentSongName.innerHTML = decodeURI(path);
}

// this fuction use to enlist songs on library and also check where the user click 
async function showSongList() {
    // songs = await getSongs('songs/ncs');
    currentSongName.innerHTML = decodeURI(songs[0])
    duration.innerHTML = ` ${convertSeconds(currentSong.currentTime)} / ${convertSeconds(currentSong.duration)}`
    let songsUL = document.querySelector('.songsList').getElementsByTagName('ul')[0]
    songsUL.innerHTML = ''
    for (let song of songs) {
        song = decodeURI(song)
        songsUL.innerHTML += `<li>
                                <div>
                                <img class="invert" src="img/music.svg" alt="">
                                <div class="info">
                                <div class="songName">${song}  </div>
                                <div class="artistName">PeeterJ</div>
                                </div>
                                </div>
                                <img class="invert" src="img/play.svg" alt="">
                                </li>`;
    }
    Array.from(document.querySelector('.songsList').getElementsByTagName('li')).forEach(e => {
        e.addEventListener('click', element => {
            playMusic(e.querySelector('.songName').innerHTML.trim())

        })
    })
}

// this function is used to convert seconds into 00:00 
function convertSeconds(seconds) {
    if (isNaN(seconds) || !isFinite(seconds) || seconds === undefined) {
        return "00:00";
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    // Pad with leading zeros
    const formattedMins = String(mins).padStart(2, '0');
    const formattedSecs = String(secs).padStart(2, '0');

    return `${formattedMins}:${formattedSecs}`;
}
console.log('6');

async function displayAlbum() {
    let a = await fetch('songs')
    // let a = await fetch("http://127.0.0.1:3000/songs/")

    let response = await a.text();
    console.log(response);
    let div = document.createElement('div')
    div.innerHTML = response;
    let as = div.getElementsByTagName('a')
    let array = Array.from(as)
    for (let x = 0; x < array.length; x++) {
        const e = array[x];

        if (e.href.includes("/songs") || e.href.includes("%5Csongs")) {
            let folder = e.href.split('%5C').splice(-1)[0].replace('/', '');
            let b = await fetch(`songs/${folder}/info.json`)
            let b_response = await b.json()
            let cardContainer = document.querySelector('.cardContainer')
            cardContainer.innerHTML += `  <div data-folder="${folder}" class="card">
                        <div class="img">
                            <img src="songs/${folder}/cover.jpg" alt="">
                        </div>
                        <div class="detail">
                        <h3>${b_response.title}</h3>
                        <p> ${b_response.description} </p>
                        </div>
                        </div>`
        }

    }

    // this event listener is used to load new album songs in library
    Array.from(document.getElementsByClassName('card')).forEach(e => {
        e.addEventListener('click', async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            showSongList()
            playMusic(songs[0])
            document.querySelector('.left').style.left = '0px';  
        })
    })

}
displayAlbum()


// this event listener is use to controll the voice of song
document.querySelector('.volume').getElementsByTagName('input')[0].addEventListener('change', e => {
    let songVolume = (e.target.value) / 100
    currentSong.volume = songVolume;
    if (e.target.value == 0) {
        document.querySelector('.volume > img').src = 'img/mute.svg';
    } else {
        document.querySelector('.volume > img').src = 'img/volume.svg';
    }
})

// this event listener is use to mute & unmute the volume of song
document.querySelector('.volume').getElementsByTagName('img')[0].addEventListener('click', e => {
    if (e.target.src.includes('volume')) {
        e.target.src = 'img/mute.svg';
        currentSong.volume = 0
    }
    else {
        e.target.src = 'img/volume.svg'
        currentSong.volume = 0.1;
    }

})

// this event listener is use to handle play button and play & pause the song 
play.addEventListener('click', () => {
    if (play.src.includes('play')) {
        if (currentSong.src == '') {
            playMusic(songs[0])
        }
        play.src = 'img/pause.svg';
        currentSong.play()
    } else {
        play.src = 'img/play.svg';
        currentSong.pause()
    }
})

// this event listener is use to handle next button and play the next song 
next.addEventListener('click', e => {
    let index = songs.indexOf(currentSong.src.split('/').slice(-1)[0])
    if ((index + 1) < songs.length) {
        if (play.src.includes('play')) {
            playMusic(songs[index + 1])
            currentSong.pause()
            play.src = 'img/play.svg';
        } else {
            playMusic(songs[index + 1])
        }
    }
})

// this event listener is use to handle previous button and play the previous song 
previous.addEventListener('click', e => {
    let index = songs.indexOf(currentSong.src.split('/').slice(-1)[0])
    if ((index - 1) > -1) {
        if (play.src.includes('play')) {
            playMusic(songs[index - 1])
            currentSong.pause()
            play.src = 'img/play.svg';
        } else {
            playMusic(songs[index - 1])
        }
    }
})

// this event listener is use to handle seekbar dot and update current time of song 
document.querySelector('.seekBar').addEventListener('click', e => {
    // let x = document.querySelector('.seekBar').getBoundingClientRect();
    let x = e.target.getBoundingClientRect();
    let seekBarWidth = x.width
    let mouseX = e.clientX - x.left
    let dotPosition = (mouseX / seekBarWidth) * 100;
    document.querySelector('.dot').style.left = dotPosition + '%';
    let updateCurrentTime = (currentSong.duration / 100) * dotPosition;
    currentSong.currentTime = updateCurrentTime;
})

// this event listener is used to update current time and location of the dot od seekbar
currentSong.addEventListener('timeupdate', () => {
    duration.innerHTML = ` ${convertSeconds(currentSong.currentTime)} / ${convertSeconds(currentSong.duration)}`
    let persent = (currentSong.currentTime / currentSong.duration) * 100;
    document.querySelector('.dot').style.left = persent + '%';
    if (currentSong.currentTime == currentSong.duration) {
        let index = songs.indexOf(currentSong.src.split('/').slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        } else {
            play.src = 'img/play.svg';
        }
    }

})

document.querySelector('.hamburger').addEventListener('click',e=>{
document.querySelector('.left').style.left = '0px';  
})
document.querySelector('.closeBtn').addEventListener('click',e=>{
document.querySelector('.left').style.left = '-300px';  
})
