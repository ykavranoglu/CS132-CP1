/**
 * CS 132
 * CP2: List of Strings Visualizer
 * Author: A. Yusuf Kavranoglu
 * 
 * Summary: This app allows the user to create a Spotify playlist by using Spotify API.
 * App displays song information in a nice way, allows the user to search for songs,
 * manipulate the order of the playlist, remove and add songs to the playlist.
 * CS 132 HW3 of 2024 was used, and my own CP2 for this year has been the inspiration.
 * 
 * This is the main js file.
 * 
 */

(function() {
    "use strict";

    const BASE_URL = "https://api.spotify.com/v1/";
    const SEARCH_EP = BASE_URL + "search?";

    const CLIENT_ID = "6261ee7023a44fedad0923ec4c760d6d";
    const CLIENT_SECRET = "b3336e0324f4420e88df8d81aac62147";

    const NEW_NODE_DATA = "This is a new node. Select this node to change this string.";
    const MAX_SEARCH_RESULTS = 5;

    let accessToken;

    /**
     * Creates event listeners and initializes the states for buttons
     */
    function init() {
        (async () => {
            await getAccessToken();
        })();

        qs("#song-searcher input").addEventListener("change", () => {
            if (qs("#song-searcher input").value) {
                fetchSongs(qs("#song-searcher input").value);
            }
        });
    }

    /**
     * Adds 'this' song to the playlist. This is triggered by a double click event listener
     * to the songs in the search-results section.
     * 
     */
    function addSong() {
        const track = this.cloneNode(true);
        track.classList.remove("search-result");
        track.classList.add("list-item");

        const upBtn = gen("button");
        upBtn.classList.add("up-btn");
        const upBtnImg = gen("img");
        upBtnImg.src = "up-btn.png";
        upBtnImg.alt = "up arrow";
        upBtn.appendChild(upBtnImg);
        track.appendChild(upBtn);
        upBtn.addEventListener("click", moveUp);

        const downBtn = gen("button");
        downBtn.classList.add("down-btn");
        const downBtnImg = gen("img");
        downBtnImg.src = "down-btn.png";
        downBtnImg.alt = "down arrow";
        downBtn.appendChild(downBtnImg);
        track.appendChild(downBtn);
        downBtn.addEventListener("click", moveDown);

        qs("#assembly #list").appendChild(track);
        track.removeEventListener("dblclick", addSong);
        track.addEventListener("dblclick", deleteSong);

        checkButtonActivations();
    }

    /**
     * Deletes a song from the list upon the event handler triggered by double click on a
     * song in the assembly section.
     * An anonymous function could have been used instead of this, but in order to leave the
     * door open for future changes, and because deleting a song from the playlist is significant,
     * I decided to write its own function.
     */
    function deleteSong() {
        this.remove();
        checkButtonActivations();
    }

    /**
     * TAKEN FROM HW3
     * Uses the "token" Spotify API endpoint following the Client Credentials flow.
     * https://developer.spotify.com/documentation/general/guides/authorization/client-credentials/
     * Updates the accessToken given the response JSON"s token. Refer to spec
     * for this function, simplifying the Spotify documentation for the scope of HW3.
     * @returns none
     */
    async function getAccessToken() {
        try {
            let resp = await fetch("https://accounts.spotify.com/api/token", {
                method: "POST",
                headers: {
                Authorization: "Basic " + btoa(CLIENT_ID + ":" + CLIENT_SECRET),
                "Content-Type": "application/x-www-form-urlencoded"
                },
                body: "grant_type=client_credentials"
            });
            checkStatus(resp);
            const respData = await resp.json();
            accessToken = respData.access_token;
        } catch (err) {
            handleError(err);
        }
    }

    /**
     * MODIFIED FROM HW3
     * Uses the "search" Spotify API endpoint:
     * https://developer.spotify.com/documentation/web-api/reference/#/operations/search
     * 
     * Fetches songs from the Spotify API using the given search query
     * string and populates artist results (use populateArtistResults). Displays a
     * useful error message if an error occurs during the request.
     * @param {string} name - search query for the song name.
     * @returns none
     */
    async function fetchSongs(name) {
        name = encodeURIComponent(name);
        const url = `${SEARCH_EP}type=track&limit=${MAX_SEARCH_RESULTS}&q=${name}`;
        try {
            let resp = await fetch(url, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                }
            });
            checkStatus(resp);
            
            const respData = await resp.json();
            populateSongResults(respData);
        } catch (err) {
            handleError(err);
        }
    }

    /**
     * TAKEN FROM HW3
     * Displays an error message on the page, hiding any previous results.
     * If errMsg is passed as a string, the string is used to customize an error message.
     * Otherwise (the errMsg is an object or missing), a generic message is displayed.
     * @param {String} errMsg - optional specific error message to display on page.
     */
    function handleError(errMsg) {
        if (typeof errMsg === "string") {
            qs("#message-area").textContent = errMsg;
        } else {
            // the err object was passed, don"t want to show it on the page;
            // instead use generic error message.
            qs("#message-area").textContent =
                "An error ocurred fetching the Spotify data. Please try again later.";
        }
        qs("#message-area").classList.remove("hidden");
    }

    /**
     * Populates the search-results section with the data fetched from Spotify search API in
     * fetchSongs function.
     * @param {Object} respData - data from fetchSongs
     */
    function populateSongResults(respData) {
        // Clear past results if any
        qs("#search-results").innerHTML = "";

        const tracks = respData.tracks.items;

        // Create a sort of dictionary for each track, and then push them into an array of
        // tracksInfo
        const tracksInfo = [];
        tracks.forEach(track => {
            tracksInfo.push(
                {
                    songName: track.name,
                    artistNames: track.artists.map(artist => artist.name).join(", "),
                    albumName: track.album.name,
                    yearProduced: track.album.release_date.substring(0, 4),
                    albumCoverImgLink: track.album.images[0].url,
                    songSpotifyLink: track.external_urls.spotify
                }
            );
        });

        // Hide error messages since if this function is running, data was fetched successfully
        qs("#message-area").classList.add(".hidden");

        // For each track, generate the dom element and put it onto HTML
        tracksInfo.forEach(trackInfo => {
            const songCard = genSongCard(trackInfo);
            qs("#search-results").appendChild(songCard);
        });
    }
    
    // Generates the appropriate dom elements in the appropriate hierarchy to display song cards
    // in a nice way inside HTML. The card is populated with songInfo coming from
    // populateSongResults
    function genSongCard(songInfo) {
        const article = gen("article");
        article.classList.add("search-result");

        const img = gen("img");
        if (songInfo.albumCoverImgLink) {
            img.src = songInfo.albumCoverImgLink;
            img.alt = songInfo.songName;
        }
        article.appendChild(img);

        // Song name is h3 and the others are h4s. Song name is in higher hierarchy.
        const h3 = gen("h3");
        h3.textContent = songInfo.songName;
        article.appendChild(h3);

        const artistInfo = gen("h4");
        artistInfo.textContent = songInfo.artistNames;
        article.appendChild(artistInfo);

        const albumInfo = gen("h4");
        albumInfo.textContent = songInfo.albumName;
        article.appendChild(albumInfo);

        const yearInfo = gen("h4");
        yearInfo.textContent = songInfo.yearProduced;
        article.appendChild(yearInfo);

        const linkInfo = gen("a");
        linkInfo.textContent = "Link";
        linkInfo.href = songInfo.songSpotifyLink;
        linkInfo.target = "_blank";
        article.appendChild(linkInfo);

        // To each search-result song card, add a double click event listener that adds the song
        // to the playlist.
        article.addEventListener("dblclick", addSong);

        return article;
    }

    // Move the song in the playlist that is the parent of "this", which is an up arrow button,
    // up one level
    function moveUp() {
        const thisSong = this.parentNode;
        const upperSong = thisSong.previousElementSibling;
        if (upperSong) {
            thisSong.parentNode.insertBefore(thisSong, upperSong);
        }
        checkButtonActivations();
    }

    // Move the song in the playlist that is the parent of "this", which is a down arrow button,
    // down one level
    function moveDown() {
        const thisSong = this.parentNode;
        const belowSong = thisSong.nextElementSibling;
        if (belowSong) {
            thisSong.parentNode.insertBefore(belowSong, thisSong);
        }
        checkButtonActivations();
    }

    // for each up and down button of song cards in the playlist, check whether those buttons
    // should be enabled or disabled at the time of calling this function.
    // This is called whenever: arrow buttons are pressed, a song is added to the playlist,
    // a song is removed from the playlist.
    function checkButtonActivations() {
        // Check down button for each song card in playlist
        const allDownButtons = qsa(".down-btn");
        allDownButtons.forEach(button => {
            const songForThisButton = button.parentNode;
            if (songForThisButton.nextElementSibling) {
                button.disabled = false;
            }
            else {
                button.disabled = true;
            }
        });

        // Check up button for each song card in playlist
        const allUpButtons = qsa(".up-btn");
        allUpButtons.forEach(button => {
            const songForThisButton = button.parentNode;
            if (songForThisButton.previousElementSibling) {
                button.disabled = false;
            }
            else {
                button.disabled = true;
            }
        });
    }

    // Run the init because we are using the defer method and not an event listener.
    init();
  })();