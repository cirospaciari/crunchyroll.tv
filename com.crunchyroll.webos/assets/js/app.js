var key = {
    STOP: 413,
    PAUSE: 19,
    PLAY: 415,
    OK: 13,
    FORWARD: 417,
    BACKWARD: 412,
    BACK: 461,
    RIGHT: 39,
    LEFT: 37,
    UP: 38,
    DOWN: 40,
    INFO: 457
};

function App() {
    var self = this;
    var menuIsShowing = true;
    var loadingData = false;
    var cr = null;

    var menu_tab_list = {
        selected: 0,
        up: function () {
            menu_tab_list.select(menu_tab_list.selected - 1);
        },
        down: function () {
            menu_tab_list.select(menu_tab_list.selected + 1);
        },
        select: function(index){
            if(index < 0 || index > 1 || menu_tab_list.selected == index){
                return;
            }
        
            var list = Array.prototype.slice.apply(document.querySelector("#menu #tabs").children);
            for (var i = 0; i < list.length; i++) {
                list[i].classList.remove("selected");
                if(i == index){
                    list[i].classList.add("selected");
                }
            }
            menu_tab_list.selected = index;
            loadingData = true;
            if(index === 0){
                Promise.all([self.listLastUpdated(), self.listPopular()]).then(function(){
                    loadingData = false;
                });
            }else{
                self.listHistory().then(function(){
                    loadingData = false;
                });
            }
        }
    }
    var menu_left_list = {
        selected: -1,
        items: [],
        title: "",
        last_selected: -1,
        loadMore: function (offset) {
            return new Promise(function (resolve) {
                resolve([]);
            });
        },
        unselect: function () {
            menu_left_list.last_selected = menu_left_list.selected;
            var list = Array.prototype.slice.apply(document.querySelector("#menu #episodes .wrapper").children);
            for (var i = 0; i < list.length; i++) {
                list[i].classList.remove("selected");
            }
            menu_left_list.selected = -1;
        },
        up: function () {
            menu_left_list.select(menu_left_list.selected - 1);
        },
        down: function () {
            menu_left_list.select(menu_left_list.selected + 1);
        },
        play: function () {
            if (menu_left_list.selected > -1) {
                self.play(menu_left_list.selected_media_id);
            }
        },
        select: function (index, dontLoadMore) {

            var list = Array.prototype.slice.apply(document.querySelector("#menu #episodes .wrapper").children);
            if (index < 0) {
                index = 0;
            }
            if (index >= (list.length - 1)) {
                if (dontLoadMore) {
                    index = list.length - 1;
                } else {
                    loadingData = true;
                    menu_left_list.loadMore(menu_left_list.items.length).then(function (items) {
                        loadingData = false;

                        if (items.length) {
                            menu_left_list.select(index);
                        } else {
                            menu_left_list.select(index, true);
                        }
                    });
                    return;
                }
            }
            if (list.length == 0) {
                menu_left_list.selected = -1;
                return;
            }
            var hideQuantity = index > 4 ? (index) % 5 : 0;
            var page = parseInt(index / 5);

            var hideUntilIndex = (page * 5) + hideQuantity - 4;

            for (var i = 0; i < list.length; i++) {

                if (i < hideUntilIndex) {

                    list[i].classList.remove("selected");

                    if (list[i].classList[1] != "hidden") {
                        list[i].classList.add("hidden");
                    }

                } else {
                    list[i].classList.remove("hidden");
                    if (index == i) {
                        if (list[i].classList[1] != "selected") {
                            list[i].classList.add("selected");
                        }
                        menu_left_list.selected_media_id = list[i].getAttribute("data-media");
                    } else {
                        list[i].classList.remove("selected");
                    }
                }
            }
            menu_left_list.selected = index;
        }
    };

    var menu_right_list = {
        selected: -1,
        last_selected: -1,
        items: null,
        unselect: function () {
            menu_right_list.last_selected = menu_right_list.selected;
            var list = Array.prototype.slice.apply(document.querySelector("#menu #series .wrapper").children);
            for (var i = 0; i < list.length; i++) {
                list[i].classList.remove("selected");
            }
            menu_right_list.selected = -1;
        },
        up: function () {
            var row = parseInt(menu_right_list.selected / 4);
            var column = menu_right_list.selected - (row * 4);
            if (row > 0) {
                row--;
            }
            menu_right_list.select((row * 4) + column);
        },
        down: function () {
            var row = parseInt(menu_right_list.selected / 4);
            var column = menu_right_list.selected - (row * 4);
            row++;
            menu_right_list.select((row * 4) + column);
        },
        left: function () {
            var row = parseInt(menu_right_list.selected / 4);
            var column = menu_right_list.selected - (row * 4);
            if (column > 0) {
                column--;
            } else {
                return false;
            }
            menu_right_list.select((row * 4) + column);
            return true;
        },
        right: function () {
            var row = parseInt(menu_right_list.selected / 4);
            var column = menu_right_list.selected - (row * 4);
            if (column < 4) {
                column++;
            }
            menu_right_list.select((row * 4) + column);
        },
        open: function () {
            if (menu_right_list.selected > -1) {
                (function (serie) {
                    loadingData = true;
                    self.listSeriesEpisodes(serie).then(function () {
                        menu_right_list.unselect();
                        menu_left_list.select(0);
                        loadingData = false;
                        menu_left_list.loadMore = function (offset) {
                            return self.listSeriesEpisodes(serie, offset, true);
                        }
                    });

                })(menu_right_list.items[menu_right_list.selected]);
            }
        },
        select: function (index) {

            var list = Array.prototype.slice.apply(document.querySelector("#menu #series .wrapper").children);
            if (index < 0) {
                index = 0;
            }
            var row = parseInt(index / 4);
            if (index > (list.length - 1)) {
                index = list.length - 1;
            }
            if (list.length == 0) {
                menu_right_list.selected = -1;
                return;
            }


            var row = parseInt(index / 4);
            var hideQuantity = row > 4 ? (row) % 5 : 0;
            var page = parseInt(row / 5);

            var hideUntilIndex = ((page * 5) + hideQuantity - 4) * 4;
            for (var i = 0; i < list.length; i++) {
                if (i < hideUntilIndex) {

                    list[i].classList.remove("selected");

                    if (list[i].classList[1] != "hidden") {
                        list[i].classList.add("hidden");
                    }

                } else {
                    list[i].classList.remove("hidden");
                    if (index == i) {
                        if (list[i].classList[1] != "selected") {
                            list[i].classList.add("selected");
                        }
                        menu_right_list.selected_media_id = list[i].getAttribute("data-serie");
                    } else {
                        list[i].classList.remove("selected");
                    }
                }

            }
            menu_right_list.selected = index;
        }
    };

    var player = videojs('video');
    player.ready(function(){
        this.on('loadedmetadata', self.loadedmetadata );
        this.on('timeupdate', self.timeupdate );

    });
    player.hide();

    this.menuEvents = function (e) {
        if (e.keyCode == key.STOP) {
            //STOP
            player.pause();
            player.currentTime(0);
        } else if (e.keyCode == key.PAUSE) {
            //PAUSE
            player.pause();
        } else if (e.keyCode == key.PLAY) {
            //PLAY
            player.play();
        } else if (e.keyCode == key.OK) {
            //OK
            if (menuIsShowing) {
                this.menu(key.OK);
            } else {
                if (player.paused()) {
                    player.play();
                } else {
                    player.pause();
                }
            }
        } else if (e.keyCode == key.FORWARD) {
            //avancar video
            player.currentTime(player.currentTime() + 10);
        } else if (e.keyCode == key.BACKWARD) {
            //voltar video
            player.currentTime(player.currentTime() - 10);
        } else if (e.keyCode == key.RIGHT) {
            //right
            if (menuIsShowing) {
                //menu
                this.menu(key.RIGHT);
            } else {
                player.currentTime(player.currentTime() + 10);
            }
        } else if (e.keyCode == key.LEFT) {
            //left
            if (menuIsShowing) {
                //menu
                this.menu(key.LEFT);
            } else {
                player.currentTime(player.currentTime() - 10);
            }
        } else if (e.keyCode == key.UP) {
            //up
            this.menu(key.UP);
        } else if (e.keyCode == key.DOWN) {
            //down
            this.menu(key.DOWN);
        } else if (e.keyCode == key.INFO) {
            //info
            this.menu(key.INFO);
        } else if (e.keyCode == key.BACK) {
            if (this.hasSomethingOpen) {
                self.listLastUpdated();
                this.hasSomethingOpen = false;
            } else if (this.hasPlayedSomething) {

                //double back button
                if (self.lastKey == key.BACK && new Date().getTime() - this.lastKeyTime < 500) {
                    clearTimeout(this.lastBack);
                    webOS.platformBack();
                       
                }else{
                    //delay back button action to enable double back feature
                    this.lastBack = setTimeout(function () {
                        if (menuIsShowing) {
                            self.closeMenu();
                        } else {
                            self.openMenu();
                        }
                    }, 500);
                }
            } else {
                webOS.platformBack();
            }
        }
        this.lastKey = e.keyCode;
        this.lastKeyTime = new Date().getTime();
    }

    this.menu = function (keyCode) {
        if (loadingData) {
            return;
        }
        this.openMenu();

        switch (keyCode) {
            case key.UP:
                if (menu_right_list.selected == -1) {
                    if(menu_left_list.selected == -1){
                        menu_tab_list.up();
                    }else{
                        menu_left_list.up();
                    }
                } else {
                    menu_right_list.up();
                }
                break;
            case key.DOWN:
                if (menu_right_list.selected == -1) {
                    if(menu_left_list.selected == -1){
                        menu_tab_list.down();
                    }else{
                        menu_left_list.down();
                    }
                } else {
                    menu_right_list.down();
                }
                break;
            case key.OK:
                if (menu_right_list.selected == -1) {
                    menu_left_list.play();
                } else {
                    menu_right_list.open();
                    this.hasSomethingOpen = true;
                }
                break;
            case key.LEFT:
                if (menu_right_list.selected != -1 && !menu_right_list.left()) {
                    menu_right_list.unselect();
                    menu_left_list.select(menu_left_list.last_selected);
                }else if(menu_left_list.selected != -1){
                    menu_left_list.unselect();
                }
                break;
            case key.RIGHT:
                if (menu_right_list.selected == -1) {
                    if(menu_left_list.selected == -1){
                        menu_left_list.select(menu_left_list.last_selected);
                    }else{
                        menu_left_list.unselect();
                        menu_right_list.select(menu_right_list.last_selected);
                    }
                } else {
                    menu_right_list.right();
                }
                break;
        }
    }
    this.closeMenu = function () {
        var menu = document.querySelector("#menu");
        if (menu.classList[0] != "hidden") {
            menu.classList.add("hidden");
        }
        menuIsShowing = false;
    }
    this.openMenu = function () {
        var menu = document.querySelector("#menu");

        menu.classList.remove("hidden");
        menuIsShowing = true;
    }
    this.timeupdate = function(){

        if(!self.media_id)
            return;
        var now = new Date().getTime() / 1000;
        if(!self.last_updated_time){
            self.last_updated_time = now
        }
        if(now - self.last_updated_time >= 60){
            cr.playback_status(self.media_id, player.currentTime());
            self.last_updated_time = now
        }
    }
    this.timeupdate = this.timeupdate.bind(true);
    this.loadedmetadata = function(){
        player.currentTime(self.start_time);
    }
    this.loadedmetadata = this.loadedmetadata.bind(true);
    this.play = function (media_id) {
        this.closeMenu();
        cr.info(media_id, null, true)
            .then(function (episode_info) {
                
                var stream = episode_info.data
                .stream_data
                .streams[episode_info.data
                    .stream_data
                    .streams.length - 1];
                if(!stream){
                    return self.logout();
                }
                var uri = stream.url;
                
                self.last_updated_time = 0;

                player.show();
                player.src({
                    src: uri,
                    type: 'application/x-mpegURL',
                    withCredentials: true
                });
                var start_time = episode_info.data.playhead || 0;
                var duration = episode_info.data.duration || 0;
                if(start_time / duration > 0.85 || start_time < 30){
                    start_time = 0;
                }
                self.media_id = media_id;
                self.start_time = start_time;
                
                player.play();
                self.hasPlayedSomething = true;
                player.currentTime(start_time  || 0);
            });
    }

    this.checkLogin = function () {
        var splash = document.querySelector("#splash");
        this.session().then(function (session) {
            if (loadingData) {
                return;
            }
            if (session == null) {
                //stop video and show splash
                player.pause();
                player.hide();
                splash.classList.remove("hidden");

                //show login
                if (splash.classList[0] != "with-login") {
                    splash.classList.add("with-login");
                    if(login_email.value && login_password.value){
                        login_button.focus();
                    }else{
                        login_email.focus();
                    }
                }
            } else {
                //hide splash and login
                if (splash.classList[0] != "hidden") {

                    loadingData = true;
                    var menu = document.querySelector("#menu");
                    menu.classList.add("hidden");
                    self.loadStartScreen().then(function () {
                        splash.classList.add("hidden");
                        splash.classList.remove("with-login");
                        loadingData = false;
                        menu.classList.remove("hidden");
                    });

                }


            }
        });
    }

    this.session = function (newData) {
        if (arguments.length == 1) {
            if (newData && !newData.user) {
                newData = null;
            }
            localStorage.sessionData = JSON.stringify(newData);
            return;
        }
        return new Promise(function (resolve) {
            var session = null;
            try {
                session = JSON.parse(localStorage.sessionData)
            } catch (ex) { }

            if (session == null) {
                resolve(null);
                return;
            }

            if (session.expires) {
                session.expires = new Date(session.expires);
            }
            if (session.expires < new Date()) {
                resolve(null);
                return;
            }
            if (session.user) {
                session.user.created = new Date(session.expires);
            }
            resolve(session);
        });
    }
    this.locale = function (locale) {
        if (arguments.length == 1) {
            localStorage.locale = locale;
        }
        return localStorage.locale || "enUS";
    }
    this.deviceid = function () {
        localStorage.device_id = localStorage.device_id || Crunchyroll.uuid();
        return localStorage.device_id;
    }
    this.login = function () {
        var splash = document.querySelector("#splash");
        splash.classList.remove("with-login");
        loadingData = true;

        var locale = document.querySelector("#login_locale").value;
        this.locale(locale);
        //create cr instance
        cr = new Crunchyroll("Scwg9PRRZ19iVwD", "com.crunchyroll.crunchyroid", this.deviceid(), locale);

        var login_email = document.querySelector("#login_email");
        var login_password = document.querySelector("#login_password");

        var email = login_email.value;
        var password = login_password.value;
        cr.login(email, password)
            .then(function (login) {
                login_password.value = "";

                if (!login) {
                    //invalid
                    splash.classList.add("with-login");
                    login_email.focus();

                    login_email.style.borderColor = "red";
                    login_email.style.borderStyle = "dotted";
                    return;
                }

                localStorage.email = email;
                localStorage.password = password;
                login_email.style.borderColor = "initial";
                login_email.style.borderStyle = "inset";


                login.data = cr.session();
                self.session(login);
                loadingData = false;
            });
    }

    this.logout = function () {
        return new Promise(function (resolve) {
            self.session(function (session) {
                if (!session) {
                    resolve(false);
                    return;
                }
                cr.logout(session.auth)
                    .then(function () {
                        resolve(true);
                    });
            });

        });
    }
    this.listHistory = function (skip, append) {
        skip = skip || 0;
        return new Promise(function (resolve) {
            cr.history(30, skip).then(function(history){
                if (history.error && history.code == "bad_session") {
                    cr = null;
                    self.session(null);
                    resolve([]);
                    return;
                }
                var last_episodes = (history.data || []).map(function (item) {
                    return { episode: item.media, serie: item.series };
                });

                var title = (self.locale() == "ptBR" || self.locale() == "ptPT" ? "Histórico" : "History");
                self.displayAnimes(title, last_episodes, append);
                var titleSeries = (self.locale() == "ptBR" || self.locale() == "ptPT" ? "Últimos Animes" : "Last Animess");
                
                var last_series = {};
                history.data.forEach(function(item){
                    last_series[item.series.series_id] = item.series;
                });
                self.displaySeries(titleSeries, Object.values(last_series), append);
                resolve(last_episodes);
            });
        });

    }
    this.listLastUpdated = function (skip, append) {
        skip = skip || 0;
        return new Promise(function (resolve) {
            cr.series("anime", "updated", 10, skip)
                .then(function (series) {
                    if (series.error && series.code == "bad_session") {
                        cr = null;
                        self.session(null);
                        resolve([]);
                        return;
                    }
                    Promise.all(series.data.map(function (serie) {
                        return cr.episode(serie.series_id, 1, 0, "desc");
                    })).then(function (last_episodes) {

                        last_episodes = last_episodes.map(function (episode, index) {
                            return { episode: episode.data[0], serie: series.data[index] };
                        });
                        

                        var title = (self.locale() == "ptBR" || self.locale() == "ptPT" ? "Últimos Animes" : "Last Updated");
                        self.displayAnimes(title, last_episodes, append);
                        resolve(last_episodes);
                    });

                });
        });

    }

    this.listSeriesEpisodes = function (serie, skip, append) {
        skip = skip || 0;
        return new Promise(function (resolve) {
            cr.episode(serie.series_id, 10, skip, "desc").then(function (episodes) {

                episodes = episodes.data.map(function (episode) {
                    return { episode: episode, serie: serie };
                });

                self.displayAnimes(serie.name, episodes, append);
                resolve(episodes);
            });
        });
    }

    this.displaySeries = function (title, series, append) {
        var wrapper = document.querySelector("#menu #series .wrapper");
        if (!append) {
            wrapper.innerHTML = "";
            document.querySelector("#menu #series > .title").innerText = title;
            menu_right_list.items = series;
        }
        for (var i in series) {

            var serie = series[i];
            if (append) {
                menu_right_list.items.push(serie);
            }
            var thumb = document.createElement("a");
            thumb.classList.add("thumb");

            thumb.setAttribute("href", "javascript:app.open('" + serie.series_id + "')");

            var thumbText = document.createElement("span");
            thumbText.innerText = serie.name;

            var thumbImage = document.createElement("img");
            thumbImage.src = serie.landscape_image.full_url;

            thumb.appendChild(thumbImage);
            thumb.appendChild(thumbText);
            wrapper.appendChild(thumb);
        }
    }
    this.displayAnimes = function (title, animes, append) {

        var wrapper = document.querySelector("#menu #episodes .wrapper");
        document.querySelector("#menu #episodes > .title").innerText = title;
        menu_left_list.title = title;
        if (!append) {
            menu_left_list.items = animes;
            wrapper.innerHTML = "";
        }


        for (var i in animes) {

            var anime = animes[i];
            if (append) {
                menu_left_list.items.push(anime);
            }
            var thumb = document.createElement("a");
            thumb.classList.add("thumb");

            thumb.setAttribute("href", "javascript:app.play('" + anime.episode.media_id + "')");
            thumb.setAttribute("data-media", anime.episode.media_id);
            var thumbText = document.createElement("span");
            thumbText.classList.add("title");
            thumbText.innerText = anime.serie.name;

            var thumbEpisode = document.createElement("span");
            thumbEpisode.classList.add("episode");
            thumbEpisode.innerText = (self.locale() == "ptBR" || self.locale() == "ptPT" ? "Episódio" : "Episode") + " " + anime.episode.episode_number;

            var thumbDescription = document.createElement("span");
            thumbDescription.classList.add("description");
            anime.episode.description = anime.episode.description || "";
            thumbDescription.innerText = anime.episode.description.slice(0, 100) + (anime.episode.description.length > 100 ? "..." : "");

            //TODO: AJUSTAR IMAGEM DE PLACE HOLDER
            var thumbImage = document.createElement("img");
            thumbImage.src = (anime.episode.screenshot_image || {}).full_url || "https://www.crunchyroll.com/i/coming_soon_beta_wide.jpg";
            
            var progressBar = document.createElement("div");
            progressBar.classList.add("progress");
            var progress = parseInt((anime.episode.playhead / anime.episode.duration) * 100);
            progressBar.setAttribute("style", "width: " + progress + "%;");

            var leftWrapper = document.createElement("div");
            var rightWrapper = document.createElement("div");

            leftWrapper.appendChild(thumbImage);
            leftWrapper.appendChild(progressBar);

            rightWrapper.appendChild(thumbText);
            rightWrapper.appendChild(thumbEpisode);
            rightWrapper.appendChild(thumbDescription);

            thumb.appendChild(leftWrapper);
            thumb.appendChild(rightWrapper);
            wrapper.appendChild(thumb);
        }
    }

    this.listPopular = function () {

        return new Promise(function (resolve) {
            cr.series("anime", "simulcast", 60)
                .then(function (series) {
                    if (series.error && series.code == "bad_session") {
                        cr = null;
                        self.session(null);
                        resolve([]);
                        return;
                    }
                    var title = (self.locale() == "ptBR" || self.locale() == "ptPT" ? "Transmissão Simultânea" : "Simulcast");
                    self.displaySeries(title, series.data);
                    resolve(series.data);
                });
        });
    }


    this.search = function (text) {
        return new Promise(function (resolve) {
            cr.series("anime", "prefix:" + text, 30)
                .then(function (series) {
                    if (series.error && series.code == "bad_session") {
                        cr = null;
                        self.session(null);
                        resolve([]);
                        return;
                    }
                    resolve(series.data);

                });
        });
    }

    this.loadStartScreen = function () {

        return new Promise(function (resolve) {

            //create cr instance from cache if needed
            new Promise(function (cr_loaded) {

                if (cr == null) {

                    cr = new Crunchyroll("Scwg9PRRZ19iVwD", "com.crunchyroll.crunchyroid", self.deviceid(), self.locale());
                    self.session().then(function (session) {
                        cr.session(session.data);
                        cr_loaded();
                    });
                } else {
                    cr_loaded();
                }

            }).then(function () {
               //load start screen
                menu_left_list.selected = -1;
                menu_left_list.loadMore = function (offset) {
                    if(menu_tab_list.selected === 0){
                        return self.listLastUpdated(offset, true);
                    }else{
                        return self.listHistory(offset, true);
                    }
                }
                Promise.all([self.listLastUpdated(), self.listPopular()]).then(function () {
                    resolve();
                });
            });
        });

    }
    this.checkCaches = function(){
        if(cr){
            cr.checkCaches();
        }
    }
}

var app = new App();

//set in cache locale
login_locale.value = app.locale();
login_email.value = localStorage.email || "";
login_password.value = localStorage.password || "";
//menu events    
window.addEventListener("keydown", function (e) { return app.menuEvents(e); });

//login events
login_button.addEventListener("click", function () { return app.login(); });
login_email.addEventListener("keydown", function (e) {
    if (e.keyCode == key.OK) {
        app.login();
    } else if (e.keyCode == key.DOWN) {
        login_password.focus();
    }
});


login_password.addEventListener("keydown", function (e) {
    if (e.keyCode == key.OK) {
        app.login();
    } else if (e.keyCode == key.DOWN) {
        login_locale.focus();
    } else if (e.keyCode == key.UP) {
        login_email.focus();
    }
});


login_locale.addEventListener("keydown", function (e) {
    if (e.keyCode == key.DOWN) {
        e.preventDefault();
        login_button.focus();
    } else if (e.keyCode == key.UP) {
        e.preventDefault();
        login_password.focus();
    }
});
login_button.addEventListener("keydown", function (e) {
    if (e.keyCode == key.OK) {
        app.login();
    } else if (e.keyCode == key.UP) {
        login_locale.focus();
    }
});

//check login status
setInterval(function () { app.checkLogin(); app.checkCaches() }, 1000);