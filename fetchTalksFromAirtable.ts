const { writeFileSync } = require("fs")

const API_KEY = process.env.AIRTABLE_API_KEY;

async function fetchTalksFromAirtable() {
  const res = await fetch(
    "https://api.airtable.com/v0/applpqZnjeYVMG3x8/Talks?view=Grid%20view",
    {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    }
  ).then(r => r.json())

  const items = res.records.map(record => {
    return {
      id: record.id,
      createdAt: record.createdTime,
      ...record.fields,
    }
  })

  writeFileSync("./src/data/talks.json", JSON.stringify(items, null, 2))
}

fetchTalksFromAirtable()
