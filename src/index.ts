import express, { Express, Request, Response } from "express"
import dotenv from "dotenv"

dotenv.config()

import krakenService from "./modules/kraken/kraken.service"

const app: Express = express()
const port = process.env.PORT

app.get("/assets", async (req: Request, res: Response) => {
	try {
		const krakenRes = await krakenService.assets()

		res.status(200).send(krakenRes)
	} catch (err: unknown) {
		console.error(err)
		res.status(500).send("An internal error occurred")
	}
})

app.get("/addOrder", async (req: Request, res: Response) => {
	try {
		const krakenRes = await krakenService.addOrder()

		res.status(200).send(krakenRes)
	} catch (err: unknown) {
		console.error(err)
		res.status(500).send("An internal error occurred")
	}
})

app.get("/balance", async (req: Request, res: Response) => {
	try {
		const krakenRes = await krakenService.getBalance()

		res.status(200).send(krakenRes)
	} catch (err: unknown) {
		console.error(err)
		res.status(500).send("An internal error occurred")
	}
})

app.get("/withdraw", async (req: Request, res: Response) => {
	try {
		const krakenRes = await krakenService.withdraw()

		res.status(200).send(krakenRes)
	} catch (err: unknown) {
		console.error(err)
		res.status(500).send("An internal error occurred")
	}
})

app.listen(port, () => {
	console.log(`[server]: Server is running at http://localhost:${port}`)
})
