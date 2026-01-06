import {Hono} from 'hono'
import {cors} from "hono/cors"
import multipart from './routes/multipart'
import download from "./routes/download"
import {Bindings} from "./types"
import tus from "./routes/tus"
import streaming from './routes/streaming'
import form from "./routes/form"

const app = new Hono<{ Bindings: Bindings }>()
app.use(cors())
app.route('/api', form)
app.route('/api', streaming)
app.route('/api', multipart)
app.route('/api/tus', tus)
app.route('/', download)
app.onError((err, c) => {
    console.error(err)
    return c.json({error: err.message}, 500)
})

export default app