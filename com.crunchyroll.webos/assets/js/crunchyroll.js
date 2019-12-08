//https://github.com/CloudMax94/crunchyroll-api/wiki/api
function Crunchyroll(token, device_type, device_id, locale) {
    var api_uri_template = "https://api.crunchyroll.com/";
    var api_version = "0";//"2.1.6";
    var last_session = null;
    var self = this;
    var request = function (method, url, data) {
        return new Promise(function (resolve) {
            var xhr = new XMLHttpRequest();
            xhr.open(method, url);
            xhr.onload = function () {
                resolve({ success: true, status: xhr.status, data: xhr.response });
            };
            xhr.onerror = function () {
                resolve({ success: false, status: xhr.status, data: xhr.response });
            };
            xhr.send(data);
        });
    }

    var start_session = function () {
        return new Promise(function (resolve) {
            if (last_session) {
                resolve(last_session);
                return;
            }
            request("GET", api_uri_template +
                "start_session.0.json?access_token=" + token +
                "&device_type=" + device_type +
                "&device_id=" + device_id +
                "&locale=" + locale +
                "&version=" + api_version)
                .then(function (session) {
                    if (session.success) {
                        last_session = JSON.parse(session.data);
                        resolve(last_session);
                    } else {
                        resolve(null);
                    }
                });
        });

    }
    this.login = function (user, pass) {
        return new Promise(function (resolve) {
            start_session()
                .then(function (session) {

                    var formData = new FormData();
                    formData.append("session_id", session.data.session_id);
                    formData.append("account", user);
                    formData.append("password", pass);
                    formData.append("locale", locale);
                    formData.append("version", api_version);

                    request("POST", api_uri_template + "login.0.json", formData)
                        .then(function (login) {
                            if (login.success) {
                                login = JSON.parse(login.data);
                                resolve(login.data)
                            }
                            resolve(null);
                        });
                }); 15, 927.0
        });

    }

    this.logout = function (auth) {
        return new Promise(function (resolve) {
            start_session()
                .then(function (session) {
                    var formData = new FormData();
                    formData.append("session_id", session.data.session_id);
                    formData.append("auth", auth);
                    formData.append("locale", locale);
                    formData.append("version", api_version);
                    request("POST", api_uri_template + "logout.0.json", formData)
                        .then(function (logout) {
                            if (logout.success) {
                                logout = JSON.parse(logout.data);
                                resolve(logout);
                            } else {
                                resolve(null);
                            }
                        });
                });
        });
    }

    this.history = function(limit, offset){
        return new Promise(function (resolve) {
            start_session()
                .then(function (session) {
                    var formData = new FormData();
                    formData.append("session_id", session.data.session_id);
                    formData.append("limit", limit || 10);
                    formData.append("offset", offset || 0);
                    formData.append("locale", locale);
                    formData.append("version", api_version);


                    request("POST", api_uri_template + "recently_watched.0.json", formData)
                        .then(function (series) {
                            if (series.success) {
                                series = JSON.parse(series.data);
                                Promise.all(series.data.map(function(item){
                                   return self.info(item.media.media_id).then(function(info){
                                    item.media.duration = (info.data || {}).duration || 0;
                                    item.media.playhead = (info.data || {}).playhead || 0;
                                   });
                                })).then(function(){
                                    resolve(series);
                                })
                                
                            } else {
                                resolve(null);
                            }
                        });
                });
        });
    }
    this.series = function (media_type, filter, limit, offset) {
        return new Promise(function (resolve) {
            start_session()
                .then(function (session) {
                    var formData = new FormData();
                    formData.append("session_id", session.data.session_id);
                    formData.append("limit", limit || 10);
                    formData.append("offset", offset || 0);
                    formData.append("media_type", media_type || "anime");
                    formData.append("filter", filter || "updated");
                    formData.append("locale", locale);
                    formData.append("version", api_version);


                    request("POST", api_uri_template + "list_series.0.json", formData)
                        .then(function (series) {
                            if (series.success) {
                                series = JSON.parse(series.data);
                                resolve(series);
                            } else {
                                resolve(null);
                            }
                        });
                });
        });
    }

    this.episode = function (series_id, limit, offset, sort) {
        return new Promise(function (resolve) {
            start_session()
                .then(function (session) {
                    var formData = new FormData();
                    formData.append("session_id", session.data.session_id);
                    formData.append("limit", limit || 10);
                    formData.append("offset", offset || 0);
                    formData.append("series_id", series_id || "anime");
                    formData.append("locale", locale);
                    formData.append("version", api_version);
                    formData.append("sort", sort);

                    request("POST", api_uri_template + "list_media.0.json", formData)
                        .then(function (episodes) {
                            if (episodes.success) {
                                episodes = JSON.parse(episodes.data);
                                console.log(episodes);
                                if (episodes && episodes.data[0]) {
                                    self.info(episodes.data[0].media_id).then(function (info) {
                                        episodes.data[0].duration = (info.data || {}).duration || 0;
                                        episodes.data[0].playhead = (info.data || {}).playhead || 0;
                                        resolve(episodes);
                                    });
                                } else {
                                    resolve(episodes);
                                }
                            } else {
                                resolve(null);
                            }
                        });
                });
        });
    }

    this.info = function (media_id, fields, forceCache) {
        fields = fields || "media.stream_data,media.media_id,media.playhead,media.duration";
        var cacheKey = "info_" + media_id;
        var cached = JSON.parse(localStorage.getItem(cacheKey) || "null");
        return new Promise(function (resolve) {
            start_session()
                .then(function (session) {
                    if (cached && cached.expires > new Date().getTime() && !forceCache) {
                        return resolve(cached.value);
                    }
                    var formData = new FormData();
                    formData.append("session_id", session.data.session_id);
                    formData.append("media_id", media_id);
                    formData.append("fields", fields);
                    formData.append("locale", locale);
                    formData.append("version", api_version);

                    request("POST", api_uri_template + "info.0.json", formData)
                        .then(function (infos) {
                            if (infos.success) {
                                infos = JSON.parse(infos.data);
                                localStorage.setItem(key, JSON.stringify({
                                    expires: new Date().getTime() + (15 * 60 * 1000),
                                    value: infos
                                }));
                                resolve(infos);
                            } else {
                                resolve(null);
                            }
                        });
                });
        });
    }
    this.playback_status = function (media_id, playhead) {
        //https://github.com/CloudMax94/crunchyroll-api/wiki/RpcApiVideo_VideoView
        //https://greasyfork.org/en/scripts/32366-crunchyroll-html5/code

        var elapsed = 60;
        var elapsedDelta = 60;
        //clear info cache
        localStorage.removeItem("info_" + media_id);
        return new Promise(function (resolve) {
            start_session()
                .then(function (session) {
                    
                    var formData = new FormData();
                    formData.append("session_id", session.data.session_id);
                    formData.append("event", "playback_status");
                    formData.append("media_id", media_id);
                    formData.append("playhead", playhead);
                    formData.append("elapsed", elapsed);
                    formData.append("elapsedDelta", elapsedDelta);

                    request("POST", api_uri_template + "log.0.json", formData)
                        .then(function (infos) {
                            if (infos.success) {
                                resolve(infos);
                            } else {
                                resolve(null);
                            }
                        });
                });
        });
    }
    this.session = function (new_session) {
        if (arguments.length == 1) {
            last_session = new_session;
        }
        return last_session;
    }
}
Crunchyroll.uuid = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}