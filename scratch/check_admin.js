const { createClient } = require('@sanity/client')

const client = createClient({
  projectId: '8xtd7yiv',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2023-05-03',
})

async function checkAdmin() {
  const email = 'info.flyingwonders@gmail.com'
  const agent = await client.fetch(`*[_type == "b2bAgent" && (lower(email) == $email || email == $email)][0]`, { email })
  console.log('Agent status in Sanity:', agent)
}

checkAdmin()
