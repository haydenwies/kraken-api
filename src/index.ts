import express, { Express, Request, Response } from "express"
import dotenv from "dotenv"
import KrakenService from "./modules/kraken/kraken.service"

dotenv.config()

const app: Express = express()
const port = process.env.PORT

app.get("/", (req: Request, res: Response) => {
	const krakenService = new KrakenService(
		process.env.KRAKEN_API_KEY,
		process.env.KRAKEN_API_SECRET,
		process.env.KRAKEN_API_WITHDRAW_KEY
	)

	krakenService.addOrder()

	res.send("Express + TypeScript Server hello")
})

app.get("/withdraw", (req: Request, res: Response) => {
	const krakenService = new KrakenService(
		process.env.KRAKEN_API_KEY,
		process.env.KRAKEN_API_SECRET,
		process.env.KRAKEN_API_WITHDRAW_KEY
	)

	krakenService.withdraw()

	res.status(200).send("OK")
})

app.listen(port, () => {
	console.log(`[server]: Server is running at http://localhost:${port}`)
})
