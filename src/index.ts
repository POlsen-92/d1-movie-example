/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { Hono } from "hono"

type Bindings = {
	DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// GET /movies => return all movies
app.get("/movies", async c => {
	const resp = await c.env.DB
		.prepare("select * from movies")
		.all()

	const movies = resp.results

	return c.json(movies)
})

// GET /movies/:id => return individual movie
app.get("/movies/:id", async c => {
	const resp = await c.env.DB
		.prepare("select * from movies WHERE id = ?")
		.run()

	const movies = resp.results

	return c.json(movies)
})

// GET /movies/favorites => return 3 favorite movies (sorted by rating)
app.get("/movies/favorites", async c => {
	const resp = await c.env.DB
		.prepare("select * from movies order by rating desc limit 3")
		.all()

	const movies = resp.results

	return c.json(movies)
})

//PUT /movies/:id => re-rate a movie
app.put("/movies/:id", async c =>{

})

//POST /movie => add a new movie
app.post("/movie", async c => {

})

export default app