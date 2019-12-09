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
        this.cleanCaches();

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

    this.history = function (limit, offset) {
        // var cacheKey = "cache_history_" + limit + "-" + offset;
        // var cached = JSON.parse(localStorage.getItem(cacheKey) || "null");
        return new Promise(function (resolve) {
            start_session()
                .then(function (session) {
                    // if (cached && cached.expires > new Date().getTime()) {
                    //     return resolve(cached.value);
                    // }
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
                                Promise.all(series.data.map(function (item) {
                                    return self.info(item.media.media_id).then(function (info) {
                                        item.media.duration = (info.data || {}).duration || 0;
                                        item.media.playhead = (info.data || {}).playhead || 0;
                                    });
                                })).then(function () {
                                    // localStorage.setItem(cacheKey, JSON.stringify({
                                    //     expires: new Date().getTime() + (60 * 1000),
                                    //     value: series
                                    // }));
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
        // var cacheKey = "cache_series_" + media_type + "-" + filter + "-" + offset + "-" + limit;
        // var cached = JSON.parse(localStorage.getItem(cacheKey) || "null");
        return new Promise(function (resolve) {
            start_session()
                .then(function (session) {
                    // if (cached && cached.expires > new Date().getTime()) {
                    //     return resolve(cached.value);
                    // }
                    var formData = new FormData();
                    formData.append("session_id", session.data.session_id);
                    formData.append("limit", limit || 10);
                    formData.append("offset", offset || 0);
                    formData.append("media_type", media_type || "anime");
                    formData.append("filter", filter || "updated");
                    formData.append("locale", locale);
                    formData.append("version", api_version);
                    formData.append("fields", ["series.series_id", "series.name", "series.in_queue",
                        "series.description", "series.portrait_image", "series.landscape_image",
                        "series.media_count", "series.publisher_name", "series.year", "series.rating",
                        "series.url", "series.media_type", "series.genres", "image.wide_url",
                        "image.fwide_url", "image.widestar_url", "image.fwidestar_url",
                        "image.full_url", "series.etp_guid"]);

                    request("POST", api_uri_template + "list_series.0.json", formData)
                        .then(function (series) {
                            if (series.success) {
                                series = JSON.parse(series.data);
                                // localStorage.setItem(cacheKey, JSON.stringify({
                                //     expires: new Date().getTime() + (10 * 60 * 1000),
                                //     value: series
                                // }));
                                resolve(series);
                            } else {
                                resolve(null);
                            }
                        });
                });
        });
    }
    this.episode = function (series_id, limit, offset, sort) {
        // var cacheKey = "cache_episode_" + series_id + "-" + limit + "-" + offset + "-" + sort;
        // var cached = JSON.parse(localStorage.getItem(cacheKey) || "null");
        return new Promise(function (resolve) {
            start_session()
                .then(function (session) {
                    // if (cached && cached.expires > new Date().getTime()) {
                    //     return resolve(cached.value);
                    // }
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


                                Promise.all(episodes.data.map(function (item) {
                                    return self.info(item.media_id);
                                })).then(function (results) {
                                    episodes.data = episodes.data.map(function (item, index) {
                                        var info = results[index];
                                        item.duration = (info.data || {}).duration || 0;
                                        item.playhead = (info.data || {}).playhead || 0;
                                        console.log(item.playhead, item.duration);
                                        return item;
                                    });
                                    console.log(episodes);
                                    // localStorage.setItem(cacheKey, JSON.stringify({
                                    //     expires: new Date().getTime() + (60 * 1000),
                                    //     value: episodes
                                    // }));
                                    resolve(episodes);
                                })

                            } else {
                                resolve(null);
                            }
                        });
                });
        });
    }

    this.collection_info = function (collection_id, fields, forceCache) {
        fields = fields || "media.stream_data,media.media_id,media.playhead,media.duration";
        // var cacheKey = "cache_collection_info_" + collection_id;
        // var cached = JSON.parse(localStorage.getItem(cacheKey) || "null");
        return new Promise(function (resolve) {
            start_session()
                .then(function (session) {
                    // if (cached && cached.expires > new Date().getTime() && !forceCache) {
                    //     return resolve(cached.value);
                    // }
                    var formData = new FormData();
                    formData.append("session_id", session.data.session_id);
                    formData.append("collection_id", collection_id);
                    formData.append("fields", fields);
                    formData.append("locale", locale);
                    formData.append("version", api_version);

                    request("POST", api_uri_template + "info.0.json", formData)
                        .then(function (infos) {
                            if (infos.success) {
                                infos = JSON.parse(infos.data);
                                // localStorage.setItem(cacheKey, JSON.stringify({
                                //     expires: new Date().getTime() + (10 * 60 * 1000),
                                //     value: infos
                                // }));
                                resolve(infos);
                            } else {
                                resolve(null);
                            }
                        });
                });
        });
    }

    this.info = function (media_id, fields, forceCache) {
        fields = fields || "media.stream_data,media.media_id,media.playhead,media.duration";
        var cacheKey = "cache_info_" + media_id;
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
                                localStorage.setItem(cacheKey, JSON.stringify({
                                    expires: new Date().getTime() + (10 * 60 * 1000),
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

    this.queue = function (media_types) {
        var cacheKey = "cache_queue_" + media_types;
        var cached = JSON.parse(localStorage.getItem(cacheKey) || "null");
        return new Promise(function (resolve) {
            start_session()
                .then(function (session) {
                    if (cached && cached.expires > new Date().getTime()) {
                        return resolve(cached.value);
                    }
                    var formData = new FormData();
                    formData.append("session_id", session.data.session_id);
                    formData.append("media_types", media_types);

                    request("POST", api_uri_template + "queue.0.json", formData)
                        .then(function (infos) {
                            if (infos.success) {
                                infos = JSON.parse(infos.data);
                                localStorage.setItem(cacheKey, JSON.stringify({
                                    expires: new Date().getTime() + (2 * 60 * 1000),
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
        localStorage.removeItem("cache_info_" + media_id);
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
    this.checkCaches = function () {
        for (var i = 0; i < localStorage.length; i++) {
            var key = localStorage.key(i);
            if (key.indexOf("cache_") == 0) {
                var cached = JSON.parse(localStorage.getItem(key) || "null");
                if (cached.expires < new Date().getTime()) {
                    localStorage.removeItem(key);
                }
            }
        }
    }
    this.cleanCaches = function () {
        for (var i = 0; i < localStorage.length; i++) {
            var key = localStorage.key(i);
            if (key.indexOf("cache_") == 0) {
                localStorage.removeItem(key);
            }
        }
    }
}
Crunchyroll.uuid = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}