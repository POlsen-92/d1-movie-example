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

// GET /movies => return all movies --DONE
app.get("/movies", async c => {
	const resp = await c.env.DB
		.prepare("select * from movies")
		.all()

	const movies = resp.results

	return c.json(movies)
})

// GET /movies/favorites => return 3 favorite movies (sorted by rating) --DONE
app.get("/movies/favorites", async c => {
	const resp = await c.env.DB
		.prepare("select * from movies order by rating desc limit 3")
		.all()

	const movies = resp.results

	return c.json(movies)
})

// GET /movies/:id => return individual movie --DONE
app.get("/movies/:id", async c => {
	const resp = await c.env.DB
		.prepare("select * from movies WHERE id = ?1")
		.bind(c.req.param("id"))
		.run()

	const movie = resp.results

	return c.json(movie)
})

// PUT /movies/:id => re-rate a movie --DONE
app.put("/movies/:id", async c =>{
	const data = await c.req.json()
	
	const resp = await c.env.DB
		.prepare("UPDATE movies SET rating = ?2, title = ?3, release_date = ?4 where id = ?1 RETURNING *")
		.bind(c.req.param("id"), data.rating, data.title, data.release_date)
		.run()

	const ok = resp.success

	return c.json({ ok })
})

// POST /movie => add a new movie --DONE
app.post("/movies", async c => {
	const data = await c.req.json()
	const {title, release_date, rating} = data

	const resp = await c.env.DB
		.prepare("INSERT INTO movies (title, release_date, rating) VALUES (?, ?, ?) RETURNING *")
		.bind(title, release_date, rating)
		.run()

	const ok = resp.success

	return c.json({ ok })
})

//DELETE /movies/:id => delete a movie
app.delete("/movies/:id", async c =>{
	const resp = await c.env.DB
		.prepare("DELETE FROM movies WHERE id = ? RETURNING *")
		.bind(c.req.param("id"))
		.run()

	const ok = resp.success

	return c.json({ ok })
})

export default app