function NATIVE_CALLBACK_RESPONSE(response) {
    if (NATIVE_CALLBACK[response.key] != undefined) {
        NATIVE_CALLBACK[response.key](response.response);
        delete NATIVE_CALLBACK[response.key];
    }
}

function GENERATE_CALLBACK(method, callback) {
    NATIVE_CALLBACK_COUNT += 1;
    let key = NATIVE_CALLBACK_COUNT + '_' + Date.now() + '_' + method;
    if (callback != undefined) NATIVE_CALLBACK[key] = callback;
    return key;
}

function getMustacheTemplate(branch, callback) {
    GET('mustache/get/'+branch, function(response) {
        if (response.isSuccess) {
            if (callback != undefined) callback(response.results);
        }
    }, 'json');
}

function getAllCountry(callback) {
    GET('country/all', function(response) {
        if (callback != undefined) callback(response);
    }, 'json');
}

function getLocale(language, oldLanguage, callback) {
    GET('locale/'+language+'/'+oldLanguage, function(response) {
        if (response.isSuccess) {
            if (callback != undefined) callback(response.results);
        }
    }, 'json');
}

function setTextLocale(text, callback) {
    GET('locale/set/'+text.encodeHex(), function(response) {
        if (response.isSuccess) {
            if (callback != undefined) callback(response);
        }
    }, 'json');
}

function setChunkTextLocale(data, callback) {
    POST('locale/chunk/set', data, function(response) {
        if (response.isSuccess) {
            if (callback != undefined) callback(response);
        }
    }, 'json');
}

function START(page) {
    main.init();
}

function GET(url, callback, type) {
    const xhr = new XMLHttpRequest();
    xhr.addEventListener("loadend", function(event) {
        if (callback != undefined) {
            callback(this.response);
        }
    });
    xhr.addEventListener("error", function(event) {
        console.warn(this.statusText);
    })
    xhr.open("GET", rootURL + url);
    xhr.responseType = type;
    xhr.send();
}

function POST(url, data, callback, type) {
    const xhr = new XMLHttpRequest();
    xhr.addEventListener("loadend", function(event) {
        if (callback != undefined) {
            if (this.status == 200) {
                if (type == 'json' || type == 'form') callback(this.response);
                else callback(this.responseText);
            } else console.error(this.statusText);
        }
    });
    xhr.addEventListener("error", function(event) {
        console.warn(this.statusText);
    });
    xhr.open("POST", rootURL + url);
    if(type == 'json') {
        xhr.responseType = type;
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.send(JSON.stringify(data));
    } else if(type == 'form') {
        xhr.responseType = 'json';
        xhr.send(data);
    } else {
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded charset=UTF-8');
		xhr.send('data='+data['data']);
    }
}


// $.post = function(url, data, callback, type) {
// 	let xhr = new XMLHttpRequest();
// 	xhr.addEventListener("load", function() {
// 		if (callback != undefined) {
// 			if (type == 'json') callback(JSON.parse(xhr.responseText));
// 			else if (type == 'xson') {
// 				let xson = new XSON();
// 				xson.encoding = EncodingType.COMPACT;
// 				let response = new Uint8Array(xhr.response);
// 				response = xson.decode(response.buffer);
// 				return callback(response);
// 			}
// 			else callback(xhr.response.buffer);
// 		}
// 	});
// 	xhr.open("POST", url, true);
// 	xhr.withCredentials = true;
// 	if (data instanceof FormData) xhr.send(data);
// 	else if (type == 'xson') {
// 		xhr.responseType = "arraybuffer";
// 		xhr.setRequestHeader("Accept", "application/octet-stream");
// 		xhr.setRequestHeader('Content-Type', 'binary/xson');
// 		xhr.send(new Uint8Array(data));
// 	} else {
// 		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded charset=UTF-8');
// 		xhr.send('data='+data['data']);
// 	}
// }


async function REST(url, data, callback, type) {
    return new Promise(function(resolve, reject) {
        const xhr = new XMLHttpRequest();
        xhr.addEventListener("loadend", function(event) {
            if (this.status == 200) {
                if (type == 'json') { 
                    resolve(JSON.parse(this.responseText));
                    if (callback != undefined) callback(JSON.parse(this.responseText));
                } else  {
                    resolve(this.responseText);
                    if (callback != undefined) callback(this.responseText);
                }
            } else {
                reject(this.statusText);
                console.error(this.statusText);
            }
            
        });
        xhr.addEventListener("error", function(event) {
            reject(this.statusText);
            console.warn(this.statusText);
        });
        xhr.open("POST", rootURL + url);
        xhr.withCredentials = true;
		if (data instanceof FormData) xhr.send(data);
        else{
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            xhr.send(JSON.stringify(data));
        }
    });
}

String.prototype.encodeHex = function(){
    let encoder = new TextEncoder();
    let array = encoder.encode(this)
    let result = "";
    for (let i=0; i < array.length; i++) {
        result += array[i].toString(16);
    }
    return result
}

function autocomplete(tag, data, callback) {
    let currentFocus;
    let isArray = Array.isArray(data);
    tag.addEventListener("input", function(e) {
        let a, b, i, val = this.value;
        closeAllLists();
        if (!val) { return false;}
        currentFocus = -1;
        a = document.createElement("DIV");
        a.setAttribute("id", this.getAttribute('rel') + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        this.parentNode.appendChild(a);
        let count = 0;
        for (let i in data) {
            if (count == 5) break;
            if (data[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
                b = document.createElement("DIV");
                b.innerHTML = "<strong>" + data[i].substr(0, val.length) + "</strong>";
                b.innerHTML += data[i].substr(val.length);
                if (isArray) b.innerHTML += "<input type='hidden' value='" + data[i] + "'>";
                else b.innerHTML += "<input type='hidden' value='" + i + "'>";
                b.addEventListener("click", function(e) {
                    tag.value = this.getElementsByTagName("input")[0].value
                    if (callback != undefined) callback(this.getElementsByTagName("input")[0].value)
                    closeAllLists();
                });
                a.appendChild(b);
                count += 1;
              }
        }
    });
    tag.addEventListener("keydown", function(e) {
        let x = document.getElementById(this.getAttribute('rel') + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
          currentFocus++;
          addActive(x);
        } else if (e.keyCode == 38) {
          currentFocus--;
          addActive(x);
        } else if (e.keyCode == 13) {
          e.preventDefault();
          if (currentFocus > -1) {
            if (x) x[currentFocus].click();
          }
        }
    });
    function addActive(x) {
      if (!x) return false;
      removeActive(x);
      if (currentFocus >= x.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = (x.length - 1);
      x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
      for (let i = 0; i < x.length; i++) {
        x[i].classList.remove("autocomplete-active");
      }
    }
    function closeAllLists(elmnt) {
        let x = document.getElementsByClassName("autocomplete-items");
      for (let i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != tag) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  document.addEventListener("click", function (e) {
      closeAllLists(e.target);
  });
}

function autocompleteServer(tag, searchFunction, limit, callback) {
    let currentFocus;
    tag.addEventListener("input", function(e) {
        let a, b, i, val = this.value;
        closeAllLists();
        if (!val) { return false;}
        currentFocus = -1;
        a = document.createElement("DIV");
        a.setAttribute("id", this.getAttribute('rel') + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        this.parentNode.appendChild(a);
        let count = 0;
        searchFunction(val, limit, function(results) {
            if (results == null) return;
            let data = results;
            let isArray = Array.isArray(data);
            for (let i in data) {
                if (count == 5) break;
                if (data[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
                    b = document.createElement("DIV");
                    b.innerHTML = "<strong>" + data[i].substr(0, val.length) + "</strong>";
                    b.innerHTML += data[i].substr(val.length);
                    if (isArray) b.innerHTML += "<input type='hidden' value='" + data[i] + "'>";
                    else b.innerHTML += "<input type='hidden' value='" + i + "'>";
                    b.addEventListener("click", function(e) {
                        tag.value = this.getElementsByTagName("input")[0].value
                        if (callback != undefined) callback(this.getElementsByTagName("input")[0].value, data)
                        closeAllLists();
                    });
                    a.appendChild(b);
                    count += 1;
                }
            }
        })
    });
    tag.addEventListener("keydown", function(e) {
        let x = document.getElementById(this.getAttribute('rel') + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
          currentFocus++;
          addActive(x);
        } else if (e.keyCode == 38) {
          currentFocus--;
          addActive(x);
        } else if (e.keyCode == 13) {
          e.preventDefault();
          if (currentFocus > -1) {
            if (x) x[currentFocus].click();
          }
        }
    });
    function addActive(x) {
      if (!x) return false;
      removeActive(x);
      if (currentFocus >= x.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = (x.length - 1);
      x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
      for (let i = 0; i < x.length; i++) {
        x[i].classList.remove("autocomplete-active");
      }
    }
    function closeAllLists(elmnt) {
        let x = document.getElementsByClassName("autocomplete-items");
      for (let i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != tag) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  document.addEventListener("click", function (e) {
      closeAllLists(e.target);
  });
}

function BACK(){
	history.back();
}