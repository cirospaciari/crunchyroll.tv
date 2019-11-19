//https://github.com/CloudMax94/crunchyroll-api/wiki/api
function Crunchyroll(token, device_type, device_id, locale) {
    var api_uri_template = "https://api.crunchyroll.com/";
    var api_version = "2.1.6";
    var last_session = null;

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
                });15,927.0
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
                                resolve(episodes);
                            } else {
                                resolve(null);
                            }
                        });
                });
        });
    }

    this.info = function (media_id, fields) {
        return new Promise(function (resolve) {
            start_session()
                .then(function (session) {
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
                                resolve(infos);
                            } else {
                                resolve(null);
                            }
                        });
                });
        });
    }
    this.session = function(new_session){
        if(arguments.length == 1){
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