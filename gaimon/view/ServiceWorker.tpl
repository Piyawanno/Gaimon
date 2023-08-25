const cacheName = "{{name}}";
const assets = [
	{{#assets}}
		"/{{.}}",
	{{/assets}}
]

self.addEventListener("install", installEvent => {
	installEvent.waitUntil(
		caches.open(cacheName).then(cache => {
			cache.addAll(assets)
		})
	)
})

async function getDBConnection() {
	if (self.db != undefined) return self.db
	const connection = indexedDB.open("gaimon", 1);
	return new Promise(function(resolve, reject) {
		connection.onsuccess = (event) => {
			self.db = event.target.result;
			getTokenInterval()
			resolve(self.db);
		};
	});
}

async function getTokenInterval() {
	function getToken() {
		const transaction = self.db.transaction(["Token"]);
		const objectStore = transaction.objectStore("Token");
		const request = objectStore.getAll();
		request.onsuccess = (event) => {
			self.tokens = event.target.result;
		}
	}
	setInterval(function() {
		getToken()
	}, 100);
}

self.addEventListener("activate", (event) => {
	event.waitUntil(getDBConnection());
});

self.addEventListener('fetch', async (event) => {
	if (event.request.method == 'POST') return;
	if (event.request.referrer.includes('https://tile.openstreetmap.org')) return;
	const url = new URL(event.request.url);
	if (url.pathname == '/check/server/connected') return;
	if (url.searchParams.entries.length == 0 && url.search.length > 0) return;
	event.respondWith(caches.open(cacheName).then(async (cache) => {
		let option;
		let host = self.location.origin + '/';
		if (event.request.referrer.includes(self.location.origin)) {
			option = {}
			let headers = {};
			option['credentials'] = 'include';
			if (self.tokens != undefined && self.tokens.length > 0) {
				headers['Authorization'] = 'Bearer ' + self.tokens[0].token;
				option['headers'] = headers;
			}
		}
		return fetch(event.request.url, option).then((fetchedResponse) => {
			cache.put(event.request, fetchedResponse.clone());
			return fetchedResponse;
		}).catch(() => {
			return cache.match(event.request.url);
		});
	}));
});