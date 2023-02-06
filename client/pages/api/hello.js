export default async (req, res) => {
  try {
    const { method, body, query } = req
    if (method === 'GET') {
      res.status(200).json({msg: 'hi'})
    } else {
      throw `Cannot use ${method} method for this route`
    }
  } catch (err) {
    if (typeof err === 'string') {
      res.status(400).json({ msg: '/test: ' + err })
    } else {
      res.status(500).json({ msg: '/test: ' + (err.message || err)})
    }
  }
}