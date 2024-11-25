import express, { Express, Request, Response } from "express"
import dotenv from "dotenv"
import KrakenService from "./modules/kraken/kraken.service"

dotenv.config()

const app: Express = express()
const port = process.env.PORT

app.get("/", async (req: Request, res: Response) => {
	const krakenService = new KrakenService(
		process.env.KRAKEN_API_KEY,
		process.env.KRAKEN_API_SECRET,
		process.env.KRAKEN_API_WITHDRAW_KEY
	)

	try {
		const krakenRes = await krakenService.addOrder()

		if (krakenRes.success === false) {
			res.status(500).send(krakenRes.error) // TODO Change status code
		} else {
			res.status(200).send(krakenRes.data)
		}
	} catch (err: unknown) {
		console.error(err)
		res.status(500).send("An internal error occurred")
	}
})

app.get("/withdraw", async (req: Request, res: Response) => {
	const krakenService = new KrakenService(
		process.env.KRAKEN_API_KEY,
		process.env.KRAKEN_API_SECRET,
		process.env.KRAKEN_API_WITHDRAW_KEY
	)

	try {
		const krakenRes = await krakenService.withdraw()

		if (krakenRes.success === false) {
			res.status(500).send(krakenRes.error) // TODO Change status code
		} else {
			res.status(200).send(krakenRes.data)
		}
	} catch (err: unknown) {
		console.error(err)
		res.status(500).send("An internal error occurred")
	}
})

app.listen(port, () => {
	console.log(`[server]: Server is running at http://localhost:${port}`)
})
