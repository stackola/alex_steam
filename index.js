const sqlite3 = require("sqlite3").verbose();

const request = require("request");

const args = process.argv;

const game = args[2];
const pageSize = 20;
const pagesToFetch = 10;
const startPage = 0;

const delay = 0;

let db = new sqlite3.Database("./db.db", err => {
	if (err) {
		console.error(err.message);
	}
	console.log("Connected to the database.");
	fetchGame(game, startPage);
});

function fetchGame(gameId, page) {
	getPage(gameId, page, results => {
		console.log("Got page " + page);
		processResults(results, gameId);
		if (results.length == 20 && page < startPage + pagesToFetch) {
			setTimeout(() => {
				fetchGame(gameId, page + 1);
			}, delay * 1000);
		}
	});
}

function processResults(res, gameId) {
	res.map(r => {
		db.run(
			"INSERT INTO reviews ('text', 'voted_up', 'upvotes', 'funny', 'weighted_score', 'game', 'language', 'author') values (?, '" +
				r.voted_up +
				"', '" +
				r.votes_up +
				"', '" +
				r.votes_funny +
				"','" +
				r.weighted_vote_score +
				"' ,'" +
				gameId +
				"' ,'" +
				r.language +
				"', '" +
				r.author.steamid +
				"')",
			r.review
		);
	});
}

function getPage(gameId, page, cb) {
	request(
		"https://store.steampowered.com/appreviews/" +
			gameId +
			"?json=1&start_offset=" +
			page * pageSize,
		(err, res, body) => {
			let json = JSON.parse(body);
			if (json.success == 1) {
				cb(json.reviews);
			}
		}
	);
}
