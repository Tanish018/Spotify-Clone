console.log("Let's start JS");
let currentSong = new Audio();
let songs;
let currFolder;

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/Clones/Spotify/${folder}`)
    let response = await a.text()
    console.log(response);
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    songs = []

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + 
                            `<li>
                                <div class="Listcontainer">
                                    <div class="img">
                                        <img class="srcsong" src="Images/music.svg" alt="">
                                         <img class="play_img invert" src="Images/play_img.svg" alt="">
                                    </div>
                                    <div class="text"><h4>${song.replaceAll("%20", " ").replaceAll(".mp3", "")}</h4>
                                                      <p>Only on Spotify</p>
                                    </div>
                                </div>
                             </li>`; 
    }

    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element=> {
            playMusic(e.querySelector(".text").firstElementChild.innerHTML.trim())
        })
    })

    return songs;
}

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

const playMusic = (track, pause = false) => {
    // let audio = new Audio("songs/" + track + ".mp3")
    currentSong.src = `${currFolder}/` + track + ".mp3"
    currentSong.load()
    if (!pause) {
        currentSong.play()
        play.src = "Images/paused.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
};

async function displayAlbums() {
    let a = await fetch(`songs/`)
    let response = await a.text()
    console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let folders = [];
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0];
            if (folder.toLowerCase() === "playlists") {
                continue;
            }
            console.log(folder)
            // MetaData of Folder :
            let a = await fetch(`songs/${folder}/info.json`)
            let response = await a.json()
            console.log(response);
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div class="play-button">
                            <svg height="40" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <!-- Green Circular Background -->
                                <circle cx="12" cy="12" r="12" fill="#1ed760"/>
                                <!-- Centered Black SVG Icon with Padding -->
                                <g transform="translate(3,3) scale(0.75)">
                                  <path d="M7.05 3.606l13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z" fill="black"/>
                                </g>
                            </svg>                               
                        </div>
                        <img src="songs/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }
    }

    Array.from(document.getElementsByClassName("card")).forEach(e => { 
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0].replace(".mp3", ""))
        })
    })
}

async function main() {
    await getSongs("songs/playlists");
    console.log(songs);
    playMusic(songs[0], true)

    // Display all albums :-
    displayAlbums();

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "Images/paused.svg"
        }
        else {
            currentSong.pause()
            play.src = "Images/play.svg"
        }
    })

    currentSong.addEventListener("timeupdate", ()=>{
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / 
        ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    document.querySelector(".seekbar").addEventListener("click", (e)=>{
        let percent = (e.offsetX/e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;   
    })

    document.querySelector(".hamburger").addEventListener("click", ()=> {
        document.querySelector(".left").style.left = "0";
    })

    document.querySelector(".close").addEventListener("click", ()=> {
        document.querySelector(".left").style.left = "-150%";

    })

    previous.addEventListener("click", () => {
        currentSong.pause()
        console.log("Previous clicked")
        let name = currentSong.src.split("/").slice(-1)[0]
        let index = songs.indexOf(name)
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1].replace(".mp3", ""))
        }
    })
    
    next.addEventListener("click", () => {
        currentSong.pause()
        console.log("Previous clicked")
        let name = currentSong.src.split("/").slice(-1)[0]
        let index = songs.indexOf(name)
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1].replace(".mp3", ""))
        }
    });
    
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e)=> {
        console.log("Setting volume to ", e.target.value);
        currentSong.volume = parseInt(e.target.value)/100;
    })

    document.querySelector(".volume>img").addEventListener("click", e=> {
        console.log(e.target);
        if(e.target.src.includes("Images/volume.svg")) {
            e.target.src = e.target.src.replace("Images/volume.svg", "Images/mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        } else {
            e.target.src = e.target.src.replace("Images/mute.svg", "Images/volume.svg");
            currentSong.volume = 0.1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10
        }
    })

}
 
main()